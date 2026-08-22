/**
 * Consultation POST processing — human forms and agent-intended requests.
 *
 * Production uses `processProductionConsultation`, which wires Redis-backed
 * rate limiting and idempotency when KV_REST_API_URL + KV_REST_API_TOKEN are
 * present. Contract tests inject fakes via `processConsultation`.
 *
 * Request-processing order for agent-intended traffic:
 *   1. Parse / sanitize
 *   2. Detect agent intent, including partial markers
 *   3. Honeypot
 *   4. Confirm capability + required infrastructure
 *   5. Hourly + daily rate limits
 *   6. Validate contract version + required agent fields
 *   7. Geography / category / intent
 *   8. Claim idempotency atomically for requests eligible to send
 *   9. Send email with Resend idempotency
 *  10. Persist public completed outcome
 *  11. Return typed response
 */

import { BUSINESS } from "./constants";
import {
  CONSULT_IDEMPOTENCY_TTL_SECONDS,
  CONSULT_INFRA_UNAVAILABLE_HTTP_STATUS,
  CONSULT_IDEMPOTENCY_HTTP_STATUS,
  CONSULT_NOT_READY_HTTP_STATUS,
  CONSULT_RATE_LIMITED_HTTP_STATUS,
  isConsultAgentSubmissionEnabled,
} from "./capabilities";
import { hashedClientIpFromRequest } from "./consult-ip";
import {
  consultEmailIdempotencyKey,
  consultRequestFingerprint,
  createRedisIdempotencyStore,
  idempotencyStorageKey,
  memoryIdempotencyStore,
  type DurableIdempotencyStore,
} from "./consult-idempotency";
import {
  createUpstashAgentRateLimiter,
  memoryAgentRateLimiter,
  type AgentRateLimiter,
} from "./consult-rate-limit";
import { getConsultRedis } from "./consult-redis";
import {
  agentResponse,
  capabilityNotReadyResponse,
  decideAgentRequest,
  idempotencyConflictResponse,
  infrastructureUnavailableResponse,
  isAgentIntendedRequest,
  opaqueAgentHoneypot,
  rateLimitedResponse,
  requestInProgressResponse,
  type AgentResponseBody,
  type ConsultEmailPayload,
} from "./consult-validation";

const LIMITS = {
  name: 100,
  firstName: 100,
  lastName: 100,
  phone: 30,
  email: 200,
  address: 200,
  streetAddress: 200,
  city: 100,
  message: 2000,
  needs: 2000,
  contactMethod: 50,
  preferredContactMethod: 50,
  problem: 100,
  source: 50,
  contractVersion: 16,
  idempotencyKey: 128,
  postalCode: 16,
  zip: 16,
  intent: 80,
  propertyType: 80,
  projectGoals: 2000,
  timing: 200,
  windowCount: 40,
  accessNotes: 2000,
} as const;

type FieldName = keyof typeof LIMITS;
const FIELD_NAMES = Object.keys(LIMITS) as FieldName[];
const MULTILINE: ReadonlySet<FieldName> = new Set<FieldName>([
  "message",
  "needs",
  "projectGoals",
  "accessNotes",
]);

// eslint-disable-next-line no-control-regex
const CONTROLS_KEEPING_BREAKS = /[\u0000-\u0008\u000B-\u001F\u007F]/g;
// eslint-disable-next-line no-control-regex
const CONTROLS_ALL = /[\u0000-\u001F\u007F]/g;

function clean(field: FieldName, raw: string): string {
  const normalised = raw.replace(/\r\n?/g, "\n");
  const controls = MULTILINE.has(field) ? CONTROLS_KEEPING_BREAKS : CONTROLS_ALL;
  return normalised.replace(controls, "").trim();
}

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FailureMeta {
  readonly source: string;
  readonly present: Record<string, boolean>;
  readonly lengths: Record<string, number>;
  readonly replyToOmitted: boolean;
}

export interface ConsultationEmail {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  idempotencyKey?: string;
}

export interface ProcessConsultationDeps {
  sendEmail: (message: ConsultationEmail) => Promise<{ error?: { name: string } }>;
  createId?: () => string;
  now?: () => Date;
  idempotencyStore?: DurableIdempotencyStore;
  rateLimiter?: AgentRateLimiter;
  /**
   * Already-hashed client identity for tests. Production derives this from
   * the request via the official Vercel IP helper and then hashes it.
   */
  clientIpHash?: string;
  request?: Request;
  logFailure?: (
    ref: string,
    failureClass: string,
    detail: Record<string, unknown>,
    meta: FailureMeta
  ) => void;
  logInfraUnavailable?: (requestId: string, stage: string) => void;
  /**
   * TEST-ONLY. Lets local contract tests exercise the enabled policy even
   * when the production readiness literal is still not-ready. Production
   * must omit this. It cannot be set by an environment variable.
   */
  testAllowAgentExecution?: true;
}

export type ProductionConsultationDeps = Omit<
  ProcessConsultationDeps,
  | "testAllowAgentExecution"
  | "idempotencyStore"
  | "rateLimiter"
  | "clientIpHash"
>;

export interface ConsultationResult {
  status: number;
  body: AgentResponseBody | Record<string, unknown>;
  headers?: Record<string, string>;
}

export { idempotencyStorageKey, memoryIdempotencyStore, memoryAgentRateLimiter };

function defaultLogFailure(
  ref: string,
  failureClass: string,
  detail: Record<string, unknown>,
  meta: FailureMeta
) {
  console.error(
    "[CONSULTATION_LEAD_SEND_FAILED]",
    JSON.stringify({
      ref,
      at: new Date().toISOString(),
      failureClass,
      ...detail,
      ...meta,
    })
  );
}

function defaultLogInfra(requestId: string, stage: string) {
  console.error(
    "[CONSULTATION_INFRA_UNAVAILABLE]",
    JSON.stringify({ request_id: requestId, stage })
  );
}

function buildEmail(
  payload: ConsultEmailPayload,
  ref: string,
  at: Date
): ConsultationEmail {
  const sourcePath =
    payload.source === "book"
      ? "/book"
      : payload.source === "contact"
        ? "/contact"
        : `/${payload.source}`;
  const subject = `New Consultation Request — ${payload.name} — ${payload.intent || "agent"}`;

  const lines = [
    `New consultation request from ${BUSINESS.url}${sourcePath}`,
    ``,
    `Name:     ${payload.name}`,
    `Phone:    ${payload.phone}`,
    `Email:    ${payload.email || "(not provided)"}`,
    payload.address ? `Address:  ${payload.address}` : null,
    payload.city ? `City:     ${payload.city}` : null,
    payload.postalCode ? `Postal:   ${payload.postalCode}` : null,
    payload.contactMethod ? `Prefers:  ${payload.contactMethod}` : null,
    payload.intent ? `Intent:   ${payload.intent}` : null,
    payload.productInterests.length
      ? `Products: ${payload.productInterests.join(", ")}`
      : null,
    payload.propertyType ? `Property: ${payload.propertyType}` : null,
    payload.timing ? `Timing:   ${payload.timing}` : null,
    payload.windowCount ? `Windows:  ${payload.windowCount}` : null,
    payload.accessNotes ? `Access:   ${payload.accessNotes}` : null,
    payload.projectGoals ? `Goals:    ${payload.projectGoals}` : null,
    ``,
    `Message:`,
    payload.message || "(no message)",
    ``,
    `— Source: ${sourcePath}`,
    `— Reference: ${ref}`,
    `— Timestamp: ${at.toISOString()}`,
  ];

  const replyToUsable = payload.email !== "" && EMAIL_SHAPE.test(payload.email);
  return {
    from: `${BUSINESS.name} <onboarding@resend.dev>`,
    to: BUSINESS.email,
    subject,
    text: lines.filter((line) => line !== null).join("\n"),
    ...(replyToUsable ? { replyTo: payload.email } : {}),
  };
}

function humanEmailSubject(name: string, problem: string): string {
  return problem
    ? `New Consultation Request — ${name} — ${problem}`
    : `New Consultation Request — ${name}`;
}

function extractFields(body: Record<string, unknown>): {
  values: Partial<Record<FieldName, string>>;
  notStrings: FieldName[];
  tooLong: FieldName[];
} {
  const values: Partial<Record<FieldName, string>> = {};
  const notStrings: FieldName[] = [];
  const tooLong: FieldName[] = [];

  for (const field of FIELD_NAMES) {
    const value = body[field];
    if (value === undefined || value === null) continue;
    if (typeof value !== "string") {
      notStrings.push(field);
      continue;
    }
    if (value.length > LIMITS[field]) {
      tooLong.push(field);
      continue;
    }
    values[field] = clean(field, value);
  }

  return { values, notStrings, tooLong };
}

function resolveClientIpHash(deps: ProcessConsultationDeps): string | null {
  if (deps.clientIpHash) return deps.clientIpHash;
  if (deps.request) return hashedClientIpFromRequest(deps.request);
  return null;
}

function productInterestIds(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string");
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((part) => part.trim()).filter(Boolean);
  }
  return [];
}

function publicAgentBody(body: AgentResponseBody): AgentResponseBody {
  return {
    request_id: body.request_id,
    status: body.status,
    next_step: body.next_step,
    contract_version: body.contract_version,
    ...(body.reason_code ? { reason_code: body.reason_code } : {}),
    ...(body.response_expectation
      ? { response_expectation: body.response_expectation }
      : {}),
    ...(body.clarification_needed
      ? { clarification_needed: body.clarification_needed }
      : {}),
  };
}

export async function processConsultation(
  parsed: unknown,
  deps: ProcessConsultationDeps
): Promise<ConsultationResult> {
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());
  const logFailure = deps.logFailure ?? defaultLogFailure;
  const logInfra = deps.logInfraUnavailable ?? defaultLogInfra;
  const ref = createId();

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { status: 400, body: { error: "Invalid request body" } };
  }
  const body = parsed as Record<string, unknown>;

  const { values, notStrings, tooLong } = extractFields(body);
  const agentIntended = isAgentIntendedRequest(body);

  const hp = body._hp;
  if (typeof hp === "string" && hp.trim() !== "") {
    if (agentIntended) {
      return { status: 200, body: opaqueAgentHoneypot(ref) };
    }
    return { status: 200, body: { ok: true } };
  }

  if (!agentIntended) {
    if (notStrings.length > 0) {
      return {
        status: 400,
        body: { error: "Expected text for these fields.", fields: notStrings },
      };
    }
    if (tooLong.length > 0) {
      return {
        status: 400,
        body: {
          error: "Some fields are longer than allowed.",
          fields: tooLong.map((field) => ({ field, max: LIMITS[field] })),
        },
      };
    }
    return processHuman(values, body, ref, now(), deps, logFailure);
  }

  const agentExecutionEnabled =
    deps.testAllowAgentExecution === true || isConsultAgentSubmissionEnabled();

  if (!agentExecutionEnabled) {
    return {
      status: CONSULT_NOT_READY_HTTP_STATUS,
      body: capabilityNotReadyResponse(ref),
    };
  }

  if (!deps.rateLimiter || !deps.idempotencyStore) {
    logInfra(ref, "controls-unavailable");
    return {
      status: CONSULT_INFRA_UNAVAILABLE_HTTP_STATUS,
      body: infrastructureUnavailableResponse(ref),
    };
  }

  const clientIpHash = resolveClientIpHash(deps);
  if (!clientIpHash) {
    logInfra(ref, "client-identity");
    return {
      status: CONSULT_INFRA_UNAVAILABLE_HTTP_STATUS,
      body: infrastructureUnavailableResponse(ref),
    };
  }

  const limited = await deps.rateLimiter.consume(clientIpHash);
  if (limited.kind === "unavailable") {
    logInfra(ref, limited.stage);
    return {
      status: CONSULT_INFRA_UNAVAILABLE_HTTP_STATUS,
      body: infrastructureUnavailableResponse(ref),
    };
  }
  if (limited.kind === "limited") {
    return {
      status: CONSULT_RATE_LIMITED_HTTP_STATUS,
      headers: { "Retry-After": String(limited.retryAfterSeconds) },
      body: rateLimitedResponse(ref),
    };
  }

  if (notStrings.length > 0 || tooLong.length > 0) {
    const clarification = [...notStrings, ...tooLong];
    return {
      status: 200,
      body: agentResponse(ref, {
        status: "rejected",
        reason_code: "incomplete_request",
        next_step: "This request cannot be accepted as submitted.",
        response_expectation: "No consultation will be scheduled from this request.",
        clarification_needed: clarification,
      }),
    };
  }

  const name =
    values.name ||
    [values.firstName, values.lastName].filter(Boolean).join(" ").trim();
  const decisionInput = {
    name,
    phone: values.phone ?? "",
    email: values.email ?? "",
    address: values.address || values.streetAddress || "",
    city: values.city ?? "",
    postalCode: values.postalCode || values.zip || "",
    message: values.message || values.needs || "",
    preferredContactMethod:
      values.preferredContactMethod || values.contactMethod || "",
    intent: values.intent ?? "",
    contractVersion: values.contractVersion ?? "",
    idempotencyKey: values.idempotencyKey ?? "",
    productInterests: body.productInterests,
    propertyType: values.propertyType ?? "",
    projectGoals: values.projectGoals ?? "",
    timing: values.timing ?? "",
    windowCount: values.windowCount ?? "",
    accessNotes: values.accessNotes ?? "",
  };
  const decision = decideAgentRequest(decisionInput);

  if (!decision.shouldEmail) {
    return { status: 200, body: agentResponse(ref, decision) };
  }

  const idempotencyKey = values.idempotencyKey ?? "";
  if (!idempotencyKey) {
    return { status: 200, body: agentResponse(ref, decision) };
  }

  const fingerprint = consultRequestFingerprint({
    name: decisionInput.name,
    phone: decisionInput.phone,
    email: decisionInput.email,
    address: decisionInput.address,
    city: decisionInput.city,
    postalCode: decisionInput.postalCode,
    message: decisionInput.message,
    preferredContactMethod: decisionInput.preferredContactMethod,
    intent: decisionInput.intent,
    contractVersion: decisionInput.contractVersion,
    productInterests: productInterestIds(body.productInterests),
    propertyType: decisionInput.propertyType,
    projectGoals: decisionInput.projectGoals,
    timing: decisionInput.timing,
    windowCount: decisionInput.windowCount,
    accessNotes: decisionInput.accessNotes,
  });
  const storageKey = idempotencyStorageKey(idempotencyKey);
  const at = now();
  const claim = await deps.idempotencyStore.claim({
    storageKey,
    fingerprint,
    requestId: ref,
    nowMs: at.getTime(),
    ttlSeconds: CONSULT_IDEMPOTENCY_TTL_SECONDS,
  });

  if (claim.kind === "unavailable") {
    logInfra(ref, claim.stage);
    return {
      status: CONSULT_INFRA_UNAVAILABLE_HTTP_STATUS,
      body: infrastructureUnavailableResponse(ref),
    };
  }
  if (claim.kind === "replay") {
    return { status: 200, body: publicAgentBody(claim.publicResponse) };
  }
  if (claim.kind === "conflict") {
    return {
      status: CONSULT_IDEMPOTENCY_HTTP_STATUS,
      body: idempotencyConflictResponse(ref),
    };
  }
  if (claim.kind === "in_progress") {
    return {
      status: CONSULT_IDEMPOTENCY_HTTP_STATUS,
      body: requestInProgressResponse(ref),
    };
  }

  const message = buildEmail(decision.email, ref, at);
  message.idempotencyKey = consultEmailIdempotencyKey(idempotencyKey);

  try {
    const result = await deps.sendEmail(message);
    if (result.error) {
      await deps.idempotencyStore.release(storageKey);
      logFailure(
        ref,
        "resend-error",
        { providerErrorName: result.error.name },
        failureMeta(decision.email)
      );
      return {
        status: 502,
        body: agentResponse(ref, {
          status: "handoff_required",
          next_step:
            "The request could not be delivered. Call Luxe or retry with the same idempotency key.",
          response_expectation:
            "A person at Luxe will contact the customer. This is not an appointment.",
        }),
      };
    }
  } catch (err) {
    await deps.idempotencyStore.release(storageKey);
    const missingKey =
      err instanceof Error && err.message.includes("RESEND_API_KEY");
    logFailure(
      ref,
      missingKey ? "config-missing-api-key" : "exception",
      { errorName: err instanceof Error ? err.name : typeof err },
      failureMeta(decision.email)
    );
    return {
      status: 500,
      body: agentResponse(ref, {
        status: "handoff_required",
        next_step:
          "The request could not be delivered. Call Luxe or retry with the same idempotency key.",
        response_expectation:
          "A person at Luxe will contact the customer. This is not an appointment.",
      }),
    };
  }

  const response = publicAgentBody(agentResponse(ref, decision));
  const persisted = await deps.idempotencyStore.complete(
    storageKey,
    response,
    at.getTime(),
    CONSULT_IDEMPOTENCY_TTL_SECONDS
  );
  if (persisted === "unavailable") {
    logInfra(ref, "persist-completed");
  }

  return { status: 200, body: response };
}

/**
 * Production adapter. Constructs Redis-backed controls when the Marketplace
 * variables are present. Cannot receive the test execution override or
 * injected stores. Missing Redis is fail-closed for agent-intended traffic
 * once readiness is enabled; humans never require Redis.
 */
export function processProductionConsultation(
  parsed: unknown,
  deps: ProductionConsultationDeps
): Promise<ConsultationResult> {
  const redis = getConsultRedis();
  return processConsultation(parsed, {
    ...deps,
    ...(redis
      ? {
          rateLimiter: createUpstashAgentRateLimiter(redis),
          idempotencyStore: createRedisIdempotencyStore(redis),
        }
      : {}),
  });
}

function failureMeta(payload: ConsultEmailPayload): FailureMeta {
  return {
    source: payload.source,
    present: {
      email: payload.email !== "",
      address: payload.address !== "",
      city: payload.city !== "",
      message: payload.message !== "",
      contactMethod: payload.contactMethod !== "",
    },
    lengths: {
      name: payload.name.length,
      phone: payload.phone.length,
      message: payload.message.length,
    },
    replyToOmitted: payload.email !== "" && !EMAIL_SHAPE.test(payload.email),
  };
}

async function processHuman(
  values: Partial<Record<FieldName, string>>,
  _body: Record<string, unknown>,
  ref: string,
  at: Date,
  deps: ProcessConsultationDeps,
  logFailure: ProcessConsultationDeps["logFailure"]
): Promise<ConsultationResult> {
  const name =
    values.name ||
    [values.firstName, values.lastName].filter(Boolean).join(" ").trim();
  const phone = values.phone ?? "";
  const email = values.email ?? "";
  const address = values.address ?? "";
  const city = values.city ?? "";
  const message = values.message || values.needs || "";
  const contactMethod = values.contactMethod ?? "";
  const problem = values.problem ?? "";
  const source = values.source || "unknown";

  if (!name || !phone) {
    return {
      status: 400,
      body: { error: "Missing required fields: name and phone." },
    };
  }

  const replyToUsable = email !== "" && EMAIL_SHAPE.test(email);
  const logMeta: FailureMeta = {
    source,
    present: {
      email: email !== "",
      address: address !== "",
      city: city !== "",
      message: message !== "",
      contactMethod: contactMethod !== "",
      problem: problem !== "",
    },
    lengths: { name: name.length, phone: phone.length, message: message.length },
    replyToOmitted: email !== "" && !replyToUsable,
  };

  const sourcePath =
    source === "book" ? "/book" : source === "contact" ? "/contact" : `/${source}`;
  const text = [
    `New consultation request from ${BUSINESS.url}${sourcePath}`,
    ``,
    problem ? `PROBLEM:  ${problem}` : null,
    problem ? `` : null,
    `Name:     ${name}`,
    `Phone:    ${phone}`,
    `Email:    ${email || "(not provided)"}`,
    address ? `Address:  ${address}` : null,
    city ? `City:     ${city}` : null,
    contactMethod ? `Prefers:  ${contactMethod}` : null,
    ``,
    `Message:`,
    message || "(no message)",
    ``,
    `— Source: ${sourcePath}`,
    `— Reference: ${ref}`,
    `— Timestamp: ${at.toISOString()}`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const mail: ConsultationEmail = {
    from: `${BUSINESS.name} <onboarding@resend.dev>`,
    to: BUSINESS.email,
    subject: humanEmailSubject(name, problem),
    text,
    ...(replyToUsable ? { replyTo: email } : {}),
  };

  try {
    const result = await deps.sendEmail(mail);
    if (result.error) {
      logFailure?.(
        ref,
        "resend-error",
        { providerErrorName: result.error.name },
        logMeta
      );
      return {
        status: 502,
        body: { error: "Could not send the message.", ref },
      };
    }
    return { status: 200, body: { ok: true } };
  } catch (err) {
    const missingKey =
      err instanceof Error && err.message.includes("RESEND_API_KEY");
    logFailure?.(
      ref,
      missingKey ? "config-missing-api-key" : "exception",
      { errorName: err instanceof Error ? err.name : typeof err },
      logMeta
    );
    return {
      status: 500,
      body: { error: "Could not send the message.", ref },
    };
  }
}
