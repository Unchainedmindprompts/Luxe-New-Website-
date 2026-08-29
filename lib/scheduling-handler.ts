/**
 * Agent scheduling orchestration — availability and booking.
 *
 * Production uses Redis-backed rate limiting and idempotency plus the
 * official Calendly client. Tests inject fakes. Never logs customer names,
 * emails, phones, street addresses, or complete request bodies.
 */

import type { AgentRateLimiter } from "./consult-rate-limit";
import { hashedClientIpFromRequest } from "./consult-ip";
import { getConsultRedis } from "./consult-redis";
import {
  CalendlyApiError,
  createCalendlyClientFromEnv,
  type CalendlyAvailableTime,
  type CalendlyClient,
  type CalendlyEventType,
} from "./calendly-client";
import {
  SCHEDULING_AUTH_HTTP_STATUS,
  SCHEDULING_CALENDLY_HTTP_STATUS,
  SCHEDULING_CONTRACT_VERSION,
  SCHEDULING_IDEMPOTENCY_HTTP_STATUS,
  SCHEDULING_IDEMPOTENCY_TTL_SECONDS,
  SCHEDULING_INVALID_HTTP_STATUS,
  SCHEDULING_NOT_READY_HTTP_STATUS,
  SCHEDULING_RATE_LIMITED_HTTP_STATUS,
  SCHEDULING_RATE_LIMITED_NEXT_STEP,
  SCHEDULING_UNAVAILABLE_HTTP_STATUS,
  type SchedulingErrorCode,
} from "./scheduling";
import {
  SCHEDULING_AVAILABILITY_CACHE_TTL_SECONDS,
  availabilityCacheKey,
  createRedisSchedulingAvailabilityCache,
  type SchedulingAvailabilityCache,
} from "./scheduling-availability-cache";
import {
  createRedisSchedulingIdempotencyStore,
  memorySchedulingIdempotencyStore,
  schedulingIdempotencyStorageKey,
  schedulingRequestFingerprint,
  type SchedulingIdempotencyStore,
} from "./scheduling-idempotency";
import {
  createUpstashSchedulingAvailabilityRateLimiter,
  createUpstashSchedulingBookingRateLimiter,
} from "./scheduling-rate-limit";
import {
  EMAIL_SHAPE,
  buildCalendlyLocation,
  confirmationAccepted,
  instantsEqual,
  isIanaTimeZone,
  matchQuestionAnswers,
  normalizeUtcInstant,
  parseQuestionAnswers,
  publicLocation,
  publicQuestions,
  publicSchedulingBody,
  schedulingResponse,
  type PublicAvailableSlot,
  type SchedulingLocationInput,
  type SchedulingPublicResponse,
} from "./scheduling-validation";

const LIMITS = {
  startTime: 64,
  customerName: 100,
  customerEmail: 200,
  customerTimezone: 80,
  idempotencyKey: 128,
  locationKind: 64,
  locationValue: 255,
  question: 200,
  answer: 2000,
} as const;

const MAX_WINDOW_MS = 31 * 24 * 60 * 60 * 1000;
const DEFAULT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface SchedulingResult {
  status: number;
  body: Record<string, unknown> | SchedulingPublicResponse;
  headers?: Record<string, string>;
}

export interface SchedulingHandlerDeps {
  calendly?: CalendlyClient | null;
  rateLimiter?: AgentRateLimiter;
  availabilityCache?: SchedulingAvailabilityCache;
  idempotencyStore?: SchedulingIdempotencyStore;
  createId?: () => string;
  now?: () => Date;
  request?: Request;
  clientIpHash?: string;
  log?: (event: string, detail: Record<string, unknown>) => void;
}

export type ProductionSchedulingDeps = Pick<
  SchedulingHandlerDeps,
  "createId" | "now" | "request" | "log"
>;

export { memorySchedulingIdempotencyStore, schedulingIdempotencyStorageKey };

function defaultLog(event: string, detail: Record<string, unknown>) {
  console.error(`[SCHEDULING_${event}]`, JSON.stringify(detail));
}

function resolveClientIpHash(deps: SchedulingHandlerDeps): string | null {
  if (deps.clientIpHash) return deps.clientIpHash;
  if (deps.request) return hashedClientIpFromRequest(deps.request);
  return null;
}

function clean(raw: string, keepBreaks = false): string {
  const normalised = raw.replace(/\r\n?/g, "\n");
  // eslint-disable-next-line no-control-regex
  const controls = keepBreaks ? /[\u0000-\u0008\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return normalised.replace(controls, "").trim();
}

function errorBody(
  requestId: string,
  error: SchedulingErrorCode,
  nextStep: string,
  extras: Partial<SchedulingPublicResponse> = {}
): SchedulingPublicResponse {
  return schedulingResponse(requestId, {
    status: error === "unavailable_slot" ? "unavailable" : "rejected",
    error,
    next_step: nextStep,
    ...extras,
  });
}

function mapCalendlyError(
  requestId: string,
  err: unknown
): { status: number; body: SchedulingPublicResponse; headers?: Record<string, string> } {
  if (err instanceof CalendlyApiError) {
    if (err.kind === "rate_limited") {
      const retryAfter = err.retryAfterSeconds ?? 60;
      return {
        status: SCHEDULING_RATE_LIMITED_HTTP_STATUS,
        headers: { "Retry-After": String(retryAfter) },
        body: errorBody(
          requestId,
          "rate_limited",
          SCHEDULING_RATE_LIMITED_NEXT_STEP,
          { retry_after: retryAfter }
        ),
      };
    }
    if (err.kind === "authentication_failure") {
      return {
        status: SCHEDULING_AUTH_HTTP_STATUS,
        body: errorBody(
          requestId,
          "calendly_authentication_failure",
          "Calendly authentication failed. Do not retry automatically."
        ),
      };
    }
    if (err.kind === "configuration_failure") {
      return {
        status: SCHEDULING_NOT_READY_HTTP_STATUS,
        body: errorBody(
          requestId,
          "configuration_failure",
          "Calendly scheduling is not configured. Use the consultation-request fallback. Do not retry automatically."
        ),
      };
    }
    if (err.kind === "not_found" || err.kind === "invalid_argument") {
      return {
        status: SCHEDULING_INVALID_HTTP_STATUS,
        body: errorBody(
          requestId,
          err.kind === "not_found" ? "unavailable_slot" : "invalid_information",
          err.kind === "not_found"
            ? "That time is not available. Retrieve fresh times. Do not pick another time automatically."
            : "Calendly rejected this request. Use a UTC window of at most 31 days and a valid start time."
        ),
      };
    }
  }
  return {
    status: SCHEDULING_CALENDLY_HTTP_STATUS,
    body: errorBody(
      requestId,
      "calendly_failure",
      "Calendly could not complete this request. Do not retry automatically."
    ),
  };
}

function toPublicSlots(slots: CalendlyAvailableTime[]): PublicAvailableSlot[] {
  const seen = new Set<number>();
  const out: PublicAvailableSlot[] = [];
  for (const slot of slots) {
    const normalized = normalizeUtcInstant(slot.start_time);
    if (!normalized) continue;
    const ms = Date.parse(normalized);
    if (seen.has(ms)) continue;
    seen.add(ms);
    out.push({ start_time: normalized });
  }
  return out.sort((a, b) => Date.parse(a.start_time) - Date.parse(b.start_time));
}

function parseWindow(
  startRaw: string | null,
  endRaw: string | null,
  now: Date
): { ok: true; start: string; end: string } | { ok: false; reason: string } {
  const defaultStart = new Date(now.getTime() + 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");
  const start = startRaw ? normalizeUtcInstant(startRaw) : defaultStart;
  if (!start) return { ok: false, reason: "invalid window" };
  const end = endRaw
    ? normalizeUtcInstant(endRaw)
    : new Date(Date.parse(start) + DEFAULT_WINDOW_MS).toISOString().replace(/\.\d{3}Z$/, "Z");
  if (!end) return { ok: false, reason: "invalid window" };
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (endMs <= startMs) return { ok: false, reason: "invalid window" };
  if (endMs - startMs > MAX_WINDOW_MS + 1000) return { ok: false, reason: "window exceeds 31 days" };
  return { ok: true, start, end };
}

async function consumeLimit(
  deps: SchedulingHandlerDeps,
  requestId: string,
  log: SchedulingHandlerDeps["log"]
): Promise<SchedulingResult | null> {
  if (!deps.rateLimiter) {
    log?.("INFRA_UNAVAILABLE", { request_id: requestId, stage: "controls-unavailable" });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "infrastructure_unavailable",
        "The request could not be processed because a required control is unavailable. Do not retry automatically."
      ),
    };
  }
  const clientIpHash = resolveClientIpHash(deps);
  if (!clientIpHash) {
    log?.("INFRA_UNAVAILABLE", { request_id: requestId, stage: "client-identity" });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "infrastructure_unavailable",
        "The request could not be processed because a required control is unavailable. Do not retry automatically."
      ),
    };
  }
  const limited = await deps.rateLimiter.consume(clientIpHash);
  if (limited.kind === "unavailable") {
    log?.("INFRA_UNAVAILABLE", { request_id: requestId, stage: limited.stage });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "infrastructure_unavailable",
        "The request could not be processed because a required control is unavailable. Do not retry automatically."
      ),
    };
  }
  if (limited.kind === "limited") {
    const retryAfter = limited.retryAfterSeconds;
    return {
      status: SCHEDULING_RATE_LIMITED_HTTP_STATUS,
      headers: { "Retry-After": String(retryAfter) },
      body: errorBody(
        requestId,
        "rate_limited",
        SCHEDULING_RATE_LIMITED_NEXT_STEP,
        { retry_after: retryAfter }
      ),
    };
  }
  return null;
}

function eventTypePublic(eventType: CalendlyEventType) {
  return {
    name: eventType.name,
    duration_minutes: eventType.duration ?? 120,
    scheduling_url: eventType.scheduling_url,
    questions: publicQuestions(eventType),
    location: publicLocation(eventType),
  };
}

export async function processAvailability(
  search: URLSearchParams,
  deps: SchedulingHandlerDeps
): Promise<SchedulingResult> {
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? defaultLog;
  const requestId = createId();

  if (!deps.calendly) {
    log("CONFIG_FAILURE", { request_id: requestId, surface: "availability" });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: {
        request_id: requestId,
        error: "configuration_failure",
        next_step:
          "Calendly scheduling is not configured. Use the consultation-request fallback. Do not retry automatically.",
        contract_version: SCHEDULING_CONTRACT_VERSION,
        slots: [],
      },
    };
  }

  const limited = await consumeLimit(deps, requestId, log);
  if (limited) return limited;

  const window = parseWindow(search.get("start_time"), search.get("end_time"), now());
  if (!window.ok) {
    return {
      status: SCHEDULING_INVALID_HTTP_STATUS,
      body: {
        request_id: requestId,
        error: "invalid_information",
        next_step:
          "Use a UTC window of at most 31 days. Start times must be valid ISO-8601 instants.",
        contract_version: SCHEDULING_CONTRACT_VERSION,
        slots: [],
      },
    };
  }

  const cacheKey = availabilityCacheKey(window.start, window.end);
  if (deps.availabilityCache) {
    const cached = await deps.availabilityCache.get(cacheKey);
    if (cached) {
      log("AVAILABILITY_CACHE_HIT", { request_id: requestId });
      return {
        status: 200,
        body: {
          request_id: requestId,
          contract_version: SCHEDULING_CONTRACT_VERSION,
          provider: cached.provider,
          window: cached.window,
          event_type: cached.event_type,
          slots: cached.slots,
          next_step:
            "Present only these times. Require the customer to confirm one start_time, then POST /api/scheduling/book. Do not poll availability.",
        },
      };
    }
  }

  try {
    const eventType = await deps.calendly.resolveConsultationEventType();
    const slots = toPublicSlots(
      await deps.calendly.listAvailableTimes(eventType.uri, window.start, window.end)
    );
    const eventPublic = eventTypePublic(eventType);
    await deps.availabilityCache?.set(
      cacheKey,
      {
        window: { start_time: window.start, end_time: window.end },
        event_type: eventPublic,
        slots,
        provider: "calendly",
      },
      SCHEDULING_AVAILABILITY_CACHE_TTL_SECONDS
    );
    return {
      status: 200,
      body: {
        request_id: requestId,
        contract_version: SCHEDULING_CONTRACT_VERSION,
        provider: "calendly",
        window: { start_time: window.start, end_time: window.end },
        event_type: eventPublic,
        slots,
        next_step:
          "Present only these times. Require the customer to confirm one start_time, then POST /api/scheduling/book. Do not poll availability.",
      },
    };
  } catch (err) {
    const mapped = mapCalendlyError(requestId, err);
    log("CALENDLY_ERROR", {
      request_id: requestId,
      surface: "availability",
      error: mapped.body.error,
      httpStatus: mapped.status,
    });
    return {
      status: mapped.status,
      ...(mapped.headers ? { headers: mapped.headers } : {}),
      body: { ...mapped.body, slots: [] },
    };
  }
}

function readString(
  body: Record<string, unknown>,
  field: string,
  max: number
): { value: string; error?: "not_string" | "too_long" } {
  const raw = body[field];
  if (raw === undefined || raw === null || raw === "") return { value: "" };
  if (typeof raw !== "string") return { value: "", error: "not_string" };
  if (raw.length > max) return { value: "", error: "too_long" };
  return { value: clean(raw) };
}

export async function processBooking(
  parsed: unknown,
  deps: SchedulingHandlerDeps
): Promise<SchedulingResult> {
  const createId = deps.createId ?? (() => crypto.randomUUID());
  const now = deps.now ?? (() => new Date());
  const log = deps.log ?? defaultLog;
  const requestId = createId();

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {
      status: SCHEDULING_INVALID_HTTP_STATUS,
      body: errorBody(
        requestId,
        "invalid_information",
        "The booking information was not accepted."
      ),
    };
  }
  const body = parsed as Record<string, unknown>;

  if (!deps.calendly) {
    log("CONFIG_FAILURE", { request_id: requestId, surface: "booking" });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "configuration_failure",
        "Calendly scheduling is not configured. Use the consultation-request fallback. Do not retry automatically."
      ),
    };
  }

  const limited = await consumeLimit(deps, requestId, log);
  if (limited) return limited;

  if (!confirmationAccepted(body)) {
    log("MISSING_CONFIRMATION", { request_id: requestId, confirmedPresent: "customerConfirmed" in body });
    return {
      status: SCHEDULING_INVALID_HTTP_STATUS,
      body: errorBody(
        requestId,
        "missing_confirmation",
        "The customer must explicitly confirm the chosen start time before booking."
      ),
    };
  }

  const name = readString(body, "customerName", LIMITS.customerName);
  const email = readString(body, "customerEmail", LIMITS.customerEmail);
  const timezone = readString(body, "customerTimezone", LIMITS.customerTimezone);
  const startRaw = readString(body, "startTime", LIMITS.startTime);
  const idempotency = readString(body, "idempotencyKey", LIMITS.idempotencyKey);

  const clarification: string[] = [];
  if (name.error || !name.value) clarification.push("customerName");
  if (email.error || !email.value || !EMAIL_SHAPE.test(email.value)) {
    clarification.push("customerEmail");
  }
  if (timezone.error || !timezone.value || !isIanaTimeZone(timezone.value)) {
    clarification.push("customerTimezone");
  }
  const startTime = startRaw.value ? normalizeUtcInstant(startRaw.value) : null;
  if (startRaw.error || !startTime) clarification.push("startTime");
  if (idempotency.error || !idempotency.value) clarification.push("idempotencyKey");

  const submittedAnswers = parseQuestionAnswers(body.questionsAndAnswers);
  if (submittedAnswers === null) clarification.push("questionsAndAnswers");

  let locationInput: SchedulingLocationInput | undefined;
  if (body.location !== undefined && body.location !== null) {
    if (typeof body.location !== "object" || Array.isArray(body.location)) {
      clarification.push("location");
    } else {
      const loc = body.location as Record<string, unknown>;
      if (loc.kind !== undefined && typeof loc.kind !== "string") clarification.push("location.kind");
      if (loc.location !== undefined && typeof loc.location !== "string") {
        clarification.push("location.location");
      }
      if (typeof loc.kind === "string" && loc.kind.length > LIMITS.locationKind) {
        clarification.push("location.kind");
      }
      if (typeof loc.location === "string" && loc.location.length > LIMITS.locationValue) {
        clarification.push("location.location");
      }
      locationInput = {
        kind: typeof loc.kind === "string" ? clean(loc.kind) : undefined,
        location: typeof loc.location === "string" ? clean(loc.location) : undefined,
      };
    }
  }

  if (clarification.length > 0) {
    return {
      status: SCHEDULING_INVALID_HTTP_STATUS,
      body: errorBody(
        requestId,
        "invalid_information",
        "The booking information was not accepted.",
        { clarification_needed: [...new Set(clarification)] }
      ),
    };
  }

  if (!deps.idempotencyStore) {
    log("INFRA_UNAVAILABLE", { request_id: requestId, stage: "idempotency-unavailable" });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "infrastructure_unavailable",
        "The request could not be processed because a required control is unavailable. Do not retry automatically."
      ),
    };
  }

  let eventType: CalendlyEventType;
  try {
    eventType = await deps.calendly.resolveConsultationEventType();
  } catch (err) {
    const mapped = mapCalendlyError(requestId, err);
    log("CALENDLY_ERROR", {
      request_id: requestId,
      surface: "booking-event-type",
      error: mapped.body.error,
      httpStatus: mapped.status,
    });
    return mapped;
  }

  const answers = matchQuestionAnswers(eventType, submittedAnswers ?? []);
  if (!answers.ok) {
    return {
      status: SCHEDULING_INVALID_HTTP_STATUS,
      body: errorBody(
        requestId,
        "invalid_information",
        "Required Calendly questions are missing.",
        { clarification_needed: answers.missing }
      ),
    };
  }

  const location = buildCalendlyLocation(eventType, locationInput);
  if (!location.ok) {
    return {
      status: SCHEDULING_INVALID_HTTP_STATUS,
      body: errorBody(
        requestId,
        "invalid_information",
        "The Calendly location for this event type is required.",
        { clarification_needed: location.missing }
      ),
    };
  }

  const fingerprint = schedulingRequestFingerprint({
    startTime: startTime as string,
    customerName: name.value,
    customerEmail: email.value,
    customerTimezone: timezone.value,
    customerConfirmed: true,
    questionsAndAnswers: answers.answers,
    locationKind: location.ok && !("omit" in location) ? location.location.kind : "",
    locationValue: location.ok && !("omit" in location) ? location.location.location ?? "" : "",
  });
  const storageKey = schedulingIdempotencyStorageKey(idempotency.value);
  const at = now();
  const claim = await deps.idempotencyStore.claim({
    storageKey,
    fingerprint,
    requestId,
    nowMs: at.getTime(),
    ttlSeconds: SCHEDULING_IDEMPOTENCY_TTL_SECONDS,
  });

  if (claim.kind === "unavailable") {
    log("INFRA_UNAVAILABLE", { request_id: requestId, stage: claim.stage });
    return {
      status: SCHEDULING_NOT_READY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "infrastructure_unavailable",
        "The request could not be processed because a required control is unavailable. Do not retry automatically."
      ),
    };
  }
  if (claim.kind === "replay") {
    return { status: claim.publicResponse.status === "booked" ? 200 : 409, body: claim.publicResponse };
  }
  if (claim.kind === "conflict") {
    return {
      status: SCHEDULING_IDEMPOTENCY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "idempotency_conflict",
        "This idempotency key was already used with a different request. Do not retry automatically."
      ),
    };
  }
  if (claim.kind === "in_progress") {
    return {
      status: SCHEDULING_IDEMPOTENCY_HTTP_STATUS,
      body: errorBody(
        requestId,
        "request_in_progress",
        "This request is already being processed. Do not retry automatically."
      ),
    };
  }

  const persist = async (response: SchedulingPublicResponse, status: number) => {
    const publicBody = publicSchedulingBody(response);
    await deps.idempotencyStore?.complete(
      storageKey,
      publicBody,
      at.getTime(),
      SCHEDULING_IDEMPOTENCY_TTL_SECONDS
    );
    return { status, body: publicBody };
  };

  const windowStart = startTime as string;
  const windowEnd = new Date(Date.parse(windowStart) + 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");

  let alternatives: PublicAvailableSlot[] = [];
  try {
    const still = await deps.calendly.listAvailableTimes(
      eventType.uri,
      windowStart,
      windowEnd
    );
    const publicStill = toPublicSlots(still);
    alternatives = publicStill;
    const open = publicStill.some((slot) => instantsEqual(slot.start_time, windowStart));
    if (!open) {
      const wider = toPublicSlots(
        await deps.calendly.listAvailableTimes(
          eventType.uri,
          at.toISOString().replace(/\.\d{3}Z$/, "Z"),
          new Date(at.getTime() + MAX_WINDOW_MS).toISOString().replace(/\.\d{3}Z$/, "Z")
        )
      );
      log("SLOT_UNAVAILABLE", {
        request_id: requestId,
        slotStillAvailable: false,
        alternativeCount: wider.length,
      });
      return persist(
        errorBody(
          requestId,
          "unavailable_slot",
          "That time is no longer available. Fresh alternatives are included. Do not pick another time automatically.",
          { alternatives: wider }
        ),
        SCHEDULING_UNAVAILABLE_HTTP_STATUS
      );
    }
  } catch (err) {
    await deps.idempotencyStore.release(storageKey);
    const mapped = mapCalendlyError(requestId, err);
    log("CALENDLY_ERROR", {
      request_id: requestId,
      surface: "booking-recheck",
      error: mapped.body.error,
      httpStatus: mapped.status,
    });
    return mapped;
  }

  try {
    const invitee = await deps.calendly.createInvitee({
      eventType: eventType.uri,
      startTime: windowStart,
      name: name.value,
      email: email.value,
      timezone: timezone.value,
      location: location.ok && !("omit" in location) ? location.location : undefined,
      questionsAndAnswers: answers.answers,
    });
    log("BOOKED", {
      request_id: requestId,
      slotStillAvailable: true,
      hasCancelUrl: Boolean(invitee.cancel_url),
      hasRescheduleUrl: Boolean(invitee.reschedule_url),
    });
    return persist(
      schedulingResponse(requestId, {
        status: "booked",
        start_time: windowStart,
        timezone: timezone.value,
        duration_minutes: eventType.duration ?? 120,
        event_uri: invitee.event,
        invitee_uri: invitee.uri,
        cancel_url: invitee.cancel_url,
        reschedule_url: invitee.reschedule_url,
        next_step:
          "The consultation is booked. Give the customer the Calendly cancel_url and reschedule_url. This is a consultation, not an installation.",
      }),
      200
    );
  } catch (err) {
    if (err instanceof CalendlyApiError && (err.kind === "not_found" || err.kind === "invalid_argument")) {
      log("SLOT_UNAVAILABLE", {
        request_id: requestId,
        slotStillAvailable: false,
        alternativeCount: alternatives.length,
        calendlyStatus: err.httpStatus,
      });
      let fresh = alternatives;
      try {
        fresh = toPublicSlots(
          await deps.calendly.listAvailableTimes(
            eventType.uri,
            at.toISOString().replace(/\.\d{3}Z$/, "Z"),
            new Date(at.getTime() + MAX_WINDOW_MS).toISOString().replace(/\.\d{3}Z$/, "Z")
          )
        );
      } catch {
        // Keep the recheck-window alternatives if the wider fetch fails.
      }
      return persist(
        errorBody(
          requestId,
          "unavailable_slot",
          "That time is no longer available. Fresh alternatives are included. Do not pick another time automatically.",
          { alternatives: fresh }
        ),
        SCHEDULING_UNAVAILABLE_HTTP_STATUS
      );
    }
    await deps.idempotencyStore.release(storageKey);
    const mapped = mapCalendlyError(requestId, err);
    log("CALENDLY_ERROR", {
      request_id: requestId,
      surface: "booking-create",
      error: mapped.body.error,
      httpStatus: mapped.status,
    });
    return mapped;
  }
}

export function processProductionAvailability(
  search: URLSearchParams,
  deps: ProductionSchedulingDeps
): Promise<SchedulingResult> {
  const redis = getConsultRedis();
  return processAvailability(search, {
    ...deps,
    calendly: createCalendlyClientFromEnv(),
    ...(redis
      ? {
          rateLimiter: createUpstashSchedulingAvailabilityRateLimiter(redis),
          availabilityCache: createRedisSchedulingAvailabilityCache(redis),
        }
      : {}),
  });
}

export function processProductionBooking(
  parsed: unknown,
  deps: ProductionSchedulingDeps
): Promise<SchedulingResult> {
  const redis = getConsultRedis();
  return processBooking(parsed, {
    ...deps,
    calendly: createCalendlyClientFromEnv(),
    ...(redis
      ? {
          rateLimiter: createUpstashSchedulingBookingRateLimiter(redis),
          idempotencyStore: createRedisSchedulingIdempotencyStore(redis),
        }
      : {}),
  });
}
