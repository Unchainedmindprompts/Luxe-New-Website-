/**
 * Consultation POST processing — human forms and agent-intended requests.
 *
 * Production uses `processProductionConsultation`, which cannot enable agent
 * execution while the capability is not-ready. Contract tests may pass
 * `testAllowAgentExecution: true` to prove the policy that will run after a
 * later PR flips readiness. That override is omitted from the production
 * function's type and must never be passed from the route.
 */

import { createHash } from "node:crypto";
import { BUSINESS } from "./constants";
import {
  CONSULT_IDEMPOTENCY_NAMESPACE,
  CONSULT_IDEMPOTENCY_TTL_SECONDS,
  CONSULT_NOT_READY_HTTP_STATUS,
  isConsultAgentSubmissionEnabled,
} from "./capabilities";
import {
  agentResponse,
  capabilityNotReadyResponse,
  decideAgentRequest,
  isAgentIntendedRequest,
  opaqueAgentHoneypot,
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
}

export interface ConsultIdempotencyRecord extends AgentResponseBody {
  emailed: boolean;
}

export interface ConsultIdempotencyStore {
  get(namespacedKey: string): Promise<ConsultIdempotencyRecord | null>;
  set(
    namespacedKey: string,
    value: ConsultIdempotencyRecord,
    ttlSeconds: number
  ): Promise<void>;
}

export interface ProcessConsultationDeps {
  sendEmail: (message: ConsultationEmail) => Promise<{ error?: { name: string } }>;
  createId?: () => string;
  now?: () => Date;
  idempotencyStore?: ConsultIdempotencyStore;
  logFailure?: (
    ref: string,
    failureClass: string,
    detail: Record<string, unknown>,
    meta: FailureMeta
  ) => void;
  /**
   * TEST-ONLY. Lets local contract tests exercise the future enabled policy.
   * Production must omit this. It cannot be set by an environment variable.
   */
  testAllowAgentExecution?: true;
}

export type ProductionConsultationDeps = Omit<
  ProcessConsultationDeps,
  "testAllowAgentExecution" | "idempotencyStore"
>;

export interface ConsultationResult {
  status: number;
  body: AgentResponseBody | Record<string, unknown>;
}

export function idempotencyStorageKey(rawKey: string): string {
  const digest = createHash("sha256")
    .update(`${CONSULT_IDEMPOTENCY_NAMESPACE}:${rawKey}`)
    .digest("hex");
  return `${CONSULT_IDEMPOTENCY_NAMESPACE}:${digest}`;
}

export function memoryIdempotencyStore(): ConsultIdempotencyStore {
  const map = new Map<string, ConsultIdempotencyRecord>();
  return {
    async get(key) {
      return map.get(key) ?? null;
    },
    async set(key, value) {
      map.set(key, value);
    },
  };
}

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

export async function processConsultation(
  parsed: unknown,
  deps: ProcessConsultationDeps
): Promise<ConsultationResult> {
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());
  const logFailure = deps.logFailure ?? defaultLogFailure;
  const ref = createId();

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { status: 400, body: { error: "Invalid request body" } };
  }
  const body = parsed as Record<string, unknown>;

  const agentIntended = isAgentIntendedRequest(body);
  const agentExecutionEnabled =
    deps.testAllowAgentExecution === true || isConsultAgentSubmissionEnabled();

  if (agentIntended && !agentExecutionEnabled) {
    return {
      status: CONSULT_NOT_READY_HTTP_STATUS,
      body: capabilityNotReadyResponse(ref),
    };
  }

  const hp = body._hp;
  if (typeof hp === "string" && hp.trim() !== "") {
    if (agentIntended) {
      return { status: 200, body: opaqueAgentHoneypot(ref) };
    }
    return { status: 200, body: { ok: true } };
  }

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
  const decision = decideAgentRequest({
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
  });

  const idempotencyKey = values.idempotencyKey ?? "";
  if (deps.idempotencyStore && idempotencyKey) {
    const stored = await deps.idempotencyStore.get(
      idempotencyStorageKey(idempotencyKey)
    );
    if (stored) {
      return {
        status: 200,
        body: {
          request_id: stored.request_id,
          status: stored.status,
          reason_code: stored.reason_code,
          next_step: stored.next_step,
          response_expectation: stored.response_expectation,
          clarification_needed: stored.clarification_needed,
          contract_version: stored.contract_version,
        },
      };
    }
  }

  if (decision.shouldEmail) {
    const message = buildEmail(decision.email, ref, now());
    try {
      const result = await deps.sendEmail(message);
      if (result.error) {
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
  }

  const response = agentResponse(ref, decision);
  if (deps.idempotencyStore && idempotencyKey) {
    await deps.idempotencyStore.set(
      idempotencyStorageKey(idempotencyKey),
      { ...response, emailed: decision.shouldEmail },
      CONSULT_IDEMPOTENCY_TTL_SECONDS
    );
  }

  return { status: 200, body: response };
}

/** Production adapter. Cannot receive the test execution override or a store. */
export function processProductionConsultation(
  parsed: unknown,
  deps: ProductionConsultationDeps
): Promise<ConsultationResult> {
  return processConsultation(parsed, deps);
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
