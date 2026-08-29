#!/usr/bin/env node
/**
 * Deterministic coverage for agent Calendly scheduling.
 *
 * Local only. Calendly is mocked. Does not POST a real appointment.
 */
import { agentDiscoveryDocument } from "../lib/agent-document.ts";
import {
  CONSULT_CAPABILITY_ID,
  CONSULT_DISCOVERY_PATH,
  SCHEDULING_AVAILABILITY_PATH,
  SCHEDULING_BOOKING_PATH,
  SCHEDULING_CAPABILITY_ID,
  SCHEDULING_DISCOVERY_PATH,
} from "../lib/capabilities.ts";
import { memorySchedulingAvailabilityCache } from "../lib/scheduling-availability-cache.ts";
import { memorySchedulingEventTypeCache } from "../lib/scheduling-event-type-cache.ts";
import {
  CalendlyApiError,
  createCalendlyClient,
  createCalendlyClientFromEnv,
} from "../lib/calendly-client.ts";
import {
  PRODUCTION_DISCOVERY_ORIGIN,
  discoveryOriginFromRequest,
  resolveDiscoveryOrigin,
} from "../lib/discovery-origin.ts";
import {
  llmsTextForOrigin,
  publicConsultationDiscoveryDocument,
  publicSchedulingDiscoveryDocument,
} from "../lib/discovery-public.ts";
import {
  SCHEDULING_RATE_LIMITED_NEXT_STEP,
  SCHEDULING_READINESS_CONFIGURED,
  SCHEDULING_READINESS_NOT_READY,
  isSchedulingConfigured,
  schedulingDiscoveryDocument,
} from "../lib/scheduling.ts";
import {
  memorySchedulingIdempotencyStore,
  processAvailability,
  processBooking,
  schedulingIdempotencyStorageKey,
} from "../lib/scheduling-handler.ts";
import { memorySchedulingRateLimiter } from "../lib/scheduling-rate-limit.ts";

const results = [];
let failures = 0;

function test(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => {
      if (!cond) problems.push(detail);
    },
    equal: (a, b, detail) => {
      if (a !== b) {
        problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
      }
    },
  };
  const out = fn(t);
  const finish = () => {
    if (problems.length) failures++;
    results.push({ name, problems });
  };
  if (out && typeof out.then === "function") {
    return out.then(finish, (error) => {
      problems.push(`threw: ${error?.message ?? error}`);
      finish();
    });
  }
  finish();
  return Promise.resolve();
}

const SLOT = "2026-09-08T17:00:00Z";
const OTHER_SLOT = "2026-09-08T19:00:00Z";
const EVENT_TYPE_URI = "https://api.calendly.com/event_types/luxe-2hr";

function luxeEventType(overrides = {}) {
  return {
    uri: EVENT_TYPE_URI,
    name: "Free In-Home Consultation",
    active: true,
    slug: "2hr",
    scheduling_url: "https://calendly.com/mark-luxewindowworks/2hr",
    duration: 120,
    custom_questions: [
      {
        name: "Phone number",
        type: "phone_number",
        required: true,
        enabled: true,
        position: 0,
      },
      {
        name: "Project ZIP",
        type: "string",
        required: true,
        enabled: true,
        position: 1,
      },
    ],
    locations: [{ kind: "custom", location: "Client's home - Northern Idaho" }],
    ...overrides,
  };
}

function mockCalendly(options = {}) {
  const calls = {
    getEventType: 0,
    available: 0,
    create: 0,
    getInvitee: 0,
    availableWindows: [],
    createBodies: [],
    getInviteeUris: [],
  };
  const slots = options.slots ?? [SLOT, OTHER_SLOT];
  const createError = options.createError;
  const availableError = options.availableError;
  const getEventTypeError = options.getEventTypeError ?? options.resolveError;
  const eventType = options.eventType ?? luxeEventType();
  const invitee = options.invitee ?? {
    uri: "https://api.calendly.com/scheduled_events/EVT1/invitees/INV1",
    event: "https://api.calendly.com/scheduled_events/EVT1",
    cancel_url: "https://calendly.com/cancellations/CANCEL1",
    reschedule_url: "https://calendly.com/reschedulings/RESCHEDULE1",
    timezone: "America/Los_Angeles",
    status: "active",
  };

  return {
    calls,
    client: {
      async getEventType() {
        calls.getEventType += 1;
        if (getEventTypeError) throw getEventTypeError;
        return eventType;
      },
      async getInvitee(uri) {
        calls.getInvitee += 1;
        calls.getInviteeUris.push(uri);
        if (options.getInviteeError) throw options.getInviteeError;
        return options.getInviteeResult ?? invitee;
      },
      async listAvailableTimes(_uri, start, end) {
        calls.available += 1;
        calls.availableWindows.push({ start, end });
        if (availableError) throw availableError;
        const startMs = Date.parse(start);
        const endMs = Date.parse(end);
        return slots
          .filter((slot) => {
            const ms = Date.parse(slot);
            return ms >= startMs && ms < endMs;
          })
          .map((start_time) => ({ status: "available", start_time }));
      },
      async createInvitee(input) {
        calls.create += 1;
        calls.createBodies.push(input);
        if (createError) throw createError;
        return invitee;
      },
    },
  };
}

function bookingBase(overrides = {}) {
  return {
    startTime: SLOT,
    customerName: "Alex Rivera",
    customerEmail: "alex.rivera@example.com",
    customerTimezone: "America/Los_Angeles",
    customerConfirmed: true,
    idempotencyKey: overrides.idempotencyKey ?? `sched-${Math.random().toString(16).slice(2)}`,
    questionsAndAnswers: [
      { question: "Phone number", answer: "208-555-0148" },
      { question: "Project ZIP", answer: "83854" },
    ],
    ...overrides,
  };
}

function captureLogs() {
  const entries = [];
  return {
    entries,
    log: (event, detail) => {
      entries.push({ event, detail });
    },
  };
}

async function runAvailability(search, extras = {}) {
  const calendly = extras.calendly ?? mockCalendly();
  const logs = extras.logs ?? captureLogs();
  const result = await processAvailability(search, {
    calendly: extras.calendly === null ? null : calendly.client ?? extras.calendly,
    eventTypeUri: extras.eventTypeUri === null ? undefined : extras.eventTypeUri ?? EVENT_TYPE_URI,
    rateLimiter: extras.rateLimiter ?? memorySchedulingRateLimiter(),
    availabilityCache: extras.availabilityCache,
    eventTypeCache: extras.eventTypeCache,
    clientIpHash: extras.clientIpHash ?? "hash-sched-default",
    createId: extras.createId ?? (() => "avail-1"),
    now: extras.now ?? (() => new Date("2026-08-29T18:00:00.000Z")),
    log: logs.log,
  });
  return { result, calendly, logs };
}

async function runBooking(body, extras = {}) {
  const calendly = extras.calendly ?? mockCalendly();
  const store = extras.store ?? memorySchedulingIdempotencyStore();
  const logs = extras.logs ?? captureLogs();
  const ids = extras.ids ?? ["book-1", "book-2", "book-3"];
  let i = 0;
  const result = await processBooking(body, {
    calendly: extras.calendly === null ? null : calendly.client ?? extras.calendly,
    eventTypeUri: extras.eventTypeUri === null ? undefined : extras.eventTypeUri ?? EVENT_TYPE_URI,
    rateLimiter: extras.rateLimiter ?? memorySchedulingRateLimiter(),
    idempotencyStore: extras.idempotencyStore === null ? undefined : store,
    eventTypeCache: extras.eventTypeCache,
    clientIpHash: extras.clientIpHash ?? "hash-sched-default",
    createId: extras.createId ?? (() => ids[i++] ?? `book-${i}`),
    now: extras.now ?? (() => new Date("2026-08-29T18:00:00.000Z")),
    log: logs.log,
  });
  return { result, calendly, store, logs };
}

function logsAreSafe(t, entries, label) {
  const blob = JSON.stringify(entries);
  t.ok(!/Alex Rivera/i.test(blob), `${label}: leaked name`);
  t.ok(!/alex\.rivera@example\.com/i.test(blob), `${label}: leaked email`);
  t.ok(!/208-555-0148/.test(blob), `${label}: leaked phone`);
  t.ok(!/83854/.test(blob), `${label}: leaked ZIP`);
  t.ok(!/Bearer |CALENDLY_API_KEY=/.test(blob), `${label}: leaked token`);
}

function restoreCalendlyEnv(previousKey, previousUri) {
  if (previousKey === undefined) delete process.env.CALENDLY_API_KEY;
  else process.env.CALENDLY_API_KEY = previousKey;
  if (previousUri === undefined) delete process.env.CALENDLY_EVENT_TYPE_URI;
  else process.env.CALENDLY_EVENT_TYPE_URI = previousUri;
}

await test("1  discovery is not ready when Calendly is unconfigured", (t) => {
  const previousKey = process.env.CALENDLY_API_KEY;
  const previousUri = process.env.CALENDLY_EVENT_TYPE_URI;
  delete process.env.CALENDLY_API_KEY;
  delete process.env.CALENDLY_EVENT_TYPE_URI;
  t.equal(isSchedulingConfigured(), false, "configured flag");
  const doc = schedulingDiscoveryDocument();
  t.equal(doc.id, SCHEDULING_CAPABILITY_ID, "capability id");
  t.equal(doc.discoveryUrl, SCHEDULING_DISCOVERY_PATH, "discovery url");
  t.equal(doc.execution.availability.url, SCHEDULING_AVAILABILITY_PATH, "availability url");
  t.equal(doc.execution.booking.url, SCHEDULING_BOOKING_PATH, "booking url");
  t.equal(doc.configured, false, "not configured");
  t.equal(doc.submissionEnabled, false, "submission off");
  t.equal(doc.execution.availableForUnattendedAgentExecution, false, "not executable");
  t.equal(doc.directBookingAvailable, false, "must not advertise ready booking");
  t.equal(doc.readiness, SCHEDULING_READINESS_NOT_READY, "not-ready");
  t.ok(doc.readinessBlockers.includes("CALENDLY_API_KEY"), "names the missing key");
  t.ok(doc.readinessBlockers.includes("CALENDLY_EVENT_TYPE_URI"), "names the missing URI");
  process.env.CALENDLY_API_KEY = "test-token-not-real";
  t.equal(isSchedulingConfigured(), false, "token alone is not configured");
  const tokenOnly = schedulingDiscoveryDocument();
  t.equal(tokenOnly.configured, false, "token-only discovery stays disabled");
  t.ok(
    tokenOnly.readinessBlockers.includes("CALENDLY_EVENT_TYPE_URI"),
    "URI still required when token is present"
  );
  t.equal(doc.customQuestions.loaded, false, "does not invent questions");
  t.ok(/configuration is missing/i.test(doc.customQuestions.note), "says configuration is missing");
  t.equal(doc.consultationRequestFallback.id, CONSULT_CAPABILITY_ID, "keeps request fallback");
  t.equal(doc.consultationRequestFallback.discoveryUrl, CONSULT_DISCOVERY_PATH, "fallback discovery");
  t.equal(doc.requiresHumanConfirmation, true, "confirmation required");
  t.equal(doc.pricingAvailable, false, "no pricing");
  t.ok(!/\b5\b.*hour|20.*day/i.test(JSON.stringify(doc.rateLimit)), "no thresholds");
  t.ok(doc.doNotRetryAutomaticallyWhen.includes("rate_limited"), "rate_limited is do-not-retry");
  t.equal(doc.rateLimit.retryAfterField, "retry_after", "retry_after field");
  t.equal(doc.rateLimit.automaticRetryForbidden, true, "auto-retry forbidden");
  t.ok(/retry_after/.test(doc.rateLimit.note), "documents retry_after");
  t.ok(/must not wait and retry automatically/i.test(doc.rateLimit.note), "forbids wait-and-retry");
  t.ok(!/please retry|try again soon|retry later/i.test(doc.rateLimit.note), "no retry encouragement");
  restoreCalendlyEnv(previousKey, previousUri);
});

await test("2  discovery advertises scheduling when token and event-type URI are present", (t) => {
  const previousKey = process.env.CALENDLY_API_KEY;
  const previousUri = process.env.CALENDLY_EVENT_TYPE_URI;
  process.env.CALENDLY_API_KEY = "test-token-not-real";
  process.env.CALENDLY_EVENT_TYPE_URI = EVENT_TYPE_URI;
  t.equal(isSchedulingConfigured(), true, "configured flag");
  const doc = schedulingDiscoveryDocument();
  t.equal(doc.configured, true, "configured");
  t.equal(doc.directBookingAvailable, true, "direct booking advertised");
  t.equal(doc.readiness, SCHEDULING_READINESS_CONFIGURED, "credentials-present readiness");
  t.equal(doc.execution.availableForUnattendedAgentExecution, true, "executable");
  t.equal(doc.provider, "calendly", "provider");
  t.equal(doc.successMeans, "calendly-booking-after-explicit-customer-confirmation", "success meaning");
  t.ok(/consultation, not/i.test(doc.description), "consultation not installation");
  t.ok(/fallback/i.test(doc.consultationRequestFallback.note), "fallback remains");
  t.ok(doc.customQuestions.note.includes("/book"), "does not copy /book fields blindly");
  t.equal(doc.readinessBlockers.length, 0, "no blockers when token and URI are present");
  t.ok(doc.doNotRetryAutomaticallyWhen.includes("rate_limited"), "rate_limited stays do-not-retry");
  t.ok(/do not poll/i.test(doc.availability.note), "availability says do not poll");
  t.ok(/never wait and retry HTTP 429/i.test(doc.agentMode.note), "agent mode forbids 429 retry");
  restoreCalendlyEnv(previousKey, previousUri);
});

await test("3a  default availability window stays under Calendly 31-day max", async (t) => {
  const { result, calendly } = await runAvailability(new URLSearchParams());
  t.equal(result.status, 200, "http");
  const start = Date.parse(result.body.window.start_time);
  const end = Date.parse(result.body.window.end_time);
  t.ok(end > start, "end after start");
  t.ok(end - start <= 30 * 24 * 60 * 60 * 1000 + 1000, "default window is 30 days");
  t.equal(calendly.calls.create, 0, "default availability must not book");
  t.equal(calendly.calls.available, 1, "one inbound request makes one Calendly available-times call");
});

await test("3  availability returns only mocked Calendly slots", async (t) => {
  const { result, calendly } = await runAvailability(
    new URLSearchParams({
      start_time: "2026-09-08T00:00:00Z",
      end_time: "2026-09-09T00:00:00Z",
    })
  );
  t.equal(result.status, 200, "http");
  t.equal(result.body.slots.length, 2, "two slots");
  t.equal(result.body.slots[0].start_time, SLOT, "normalized first slot");
  t.ok(result.body.slots[0].start_time.endsWith("Z"), "trailing Z");
  t.equal(result.body.event_type.name, "Free In-Home Consultation", "event name");
  t.equal(result.body.event_type.questions.length, 2, "questions from event type");
  t.equal(result.body.event_type.location.kinds[0], "custom", "location kind from event type");
  t.equal(calendly.calls.create, 0, "availability must not book");
  t.equal(calendly.calls.available, 1, "one Calendly available-times call");
  t.ok(!JSON.stringify(result.body).includes("firstName"), "does not copy /book form fields");
});

await test("4  successful booking returns confirmation and Calendly links", async (t) => {
  const logs = captureLogs();
  const { result, calendly } = await runBooking(bookingBase(), { logs });
  t.equal(result.status, 200, "http");
  t.equal(result.body.status, "booked", "booked");
  t.equal(result.body.start_time, SLOT, "start time");
  t.equal(result.body.cancel_url, "https://calendly.com/cancellations/CANCEL1", "cancel_url");
  t.equal(
    result.body.reschedule_url,
    "https://calendly.com/reschedulings/RESCHEDULE1",
    "reschedule_url"
  );
  t.equal(result.body.event_uri, "https://api.calendly.com/scheduled_events/EVT1", "event uri");
  t.equal(calendly.calls.create, 1, "one Calendly booking");
  t.equal(calendly.calls.createBodies[0].timezone, "America/Los_Angeles", "timezone sent");
  t.equal(calendly.calls.createBodies[0].location.kind, "custom", "location kind");
  t.equal(calendly.calls.createBodies[0].questionsAndAnswers.length, 2, "real questions only");
  t.ok(!("customerName" in result.body), "name not in public body");
  t.ok(!("customerEmail" in result.body), "email not in public body");
  logsAreSafe(t, logs.entries, "successful booking");
});

await test("5  missing customer confirmation is rejected", async (t) => {
  const calendly = mockCalendly();
  const { result } = await runBooking(
    bookingBase({ customerConfirmed: false }),
    { calendly }
  );
  t.equal(result.status, 400, "http");
  t.equal(result.body.error, "missing_confirmation", "error");
  t.equal(calendly.calls.create, 0, "must not book");
});

await test("6  explicitConfirmation true is accepted", async (t) => {
  const { result } = await runBooking(
    bookingBase({ customerConfirmed: undefined, explicitConfirmation: true })
  );
  t.equal(result.status, 200, "http");
  t.equal(result.body.status, "booked", "booked");
});

await test("7  invalid start time is rejected", async (t) => {
  const calendly = mockCalendly();
  const { result } = await runBooking(bookingBase({ startTime: "next Tuesday" }), {
    calendly,
  });
  t.equal(result.status, 400, "http");
  t.equal(result.body.error, "invalid_information", "error");
  t.ok(result.body.clarification_needed.includes("startTime"), "startTime flagged");
  t.equal(calendly.calls.create, 0, "must not book");
});

await test("8  slot becoming unavailable returns alternatives and does not pick another time", async (t) => {
  const calendly = mockCalendly({ slots: [OTHER_SLOT] });
  const { result } = await runBooking(bookingBase(), { calendly });
  t.equal(result.status, 409, "http");
  t.equal(result.body.status, "unavailable", "unavailable");
  t.equal(result.body.error, "unavailable_slot", "error");
  t.ok(
    result.body.alternatives.some((slot) => slot.start_time === OTHER_SLOT),
    "fresh alternative included"
  );
  t.ok(
    !result.body.alternatives.some((slot) => slot.start_time === SLOT),
    "expired slot not presented as valid"
  );
  t.equal(calendly.calls.create, 0, "must not auto-book another time");
  t.ok(/do not pick another time/i.test(result.body.next_step), "tells the agent not to pick");
});

await test("9  Calendly create 404 returns alternatives and does not invent a time", async (t) => {
  const calendly = mockCalendly({
    createError: new CalendlyApiError("not_found", 404, "Calendly request failed."),
  });
  const { result } = await runBooking(bookingBase(), { calendly });
  t.equal(result.status, 409, "http");
  t.equal(result.body.error, "unavailable_slot", "error");
  t.ok(Array.isArray(result.body.alternatives), "alternatives present");
  t.ok(!result.body.start_time, "must not return a chosen substitute time");
});

await test("10  duplicate idempotency key returns original public result", async (t) => {
  const calendly = mockCalendly();
  const store = memorySchedulingIdempotencyStore();
  const body = bookingBase({ idempotencyKey: "same-key" });
  const first = await runBooking(body, { calendly, store, ids: ["id-a", "id-b"] });
  const second = await runBooking(body, { calendly, store, ids: ["id-c"] });
  t.equal(first.result.status, 200, "first http");
  t.equal(second.result.status, 200, "replay http");
  t.equal(second.result.body.request_id, first.result.body.request_id, "same request_id");
  t.equal(second.result.body.cancel_url, first.result.body.cancel_url, "same cancel_url");
  t.equal(calendly.calls.create, 1, "Calendly booked once");
});

await test("11  same idempotency key with a different payload is a conflict", async (t) => {
  const calendly = mockCalendly();
  const store = memorySchedulingIdempotencyStore();
  const first = await runBooking(bookingBase({ idempotencyKey: "shared" }), {
    calendly,
    store,
  });
  const second = await runBooking(
    bookingBase({
      idempotencyKey: "shared",
      startTime: OTHER_SLOT,
    }),
    { calendly, store }
  );
  t.equal(first.result.status, 200, "first booked");
  t.equal(second.result.status, 409, "conflict http");
  t.equal(second.result.body.error, "idempotency_conflict", "conflict");
  t.equal(calendly.calls.create, 1, "no second booking");
});

await test("12  missing Calendly configuration fails closed", async (t) => {
  const avail = await runAvailability(new URLSearchParams(), { calendly: null });
  t.equal(avail.result.status, 503, "availability http");
  t.equal(avail.result.body.error, "configuration_failure", "availability error");
  const book = await runBooking(bookingBase(), { calendly: null });
  t.equal(book.result.status, 503, "booking http");
  t.equal(book.result.body.error, "configuration_failure", "booking error");
  t.ok(/fallback/i.test(book.result.body.next_step), "points at fallback");
});

await test("13  Calendly authentication failure does not leak token material", async (t) => {
  const logs = captureLogs();
  const calendly = mockCalendly({
    resolveError: new CalendlyApiError("authentication_failure", 401, "Calendly authentication failed."),
  });
  const { result } = await runBooking(bookingBase(), { calendly, logs });
  t.equal(result.status, 502, "http");
  t.equal(result.body.error, "calendly_authentication_failure", "error");
  t.ok(!/Bearer /i.test(JSON.stringify(result.body)), "no token in body");
  logsAreSafe(t, logs.entries, "auth failure");
});

await test("14  repeated availability returns 429 and does not retry Calendly", async (t) => {
  const limiter = memorySchedulingRateLimiter({ hourlyLimit: 1, dailyLimit: 1 });
  const calendly = mockCalendly();
  const first = await runAvailability(new URLSearchParams(), { calendly, rateLimiter: limiter });
  const second = await runAvailability(new URLSearchParams(), { calendly, rateLimiter: limiter });
  t.equal(first.result.status, 200, "first allowed");
  t.equal(second.result.status, 429, "second limited");
  t.equal(second.result.body.error, "rate_limited", "error");
  t.equal(typeof second.result.body.retry_after, "number", "retry_after is numeric");
  t.ok(second.result.body.retry_after >= 1, "retry_after seconds");
  t.equal(second.result.headers?.["Retry-After"], String(second.result.body.retry_after), "header");
  t.equal(second.result.body.next_step, SCHEDULING_RATE_LIMITED_NEXT_STEP, "do not auto-retry");
  t.ok(!/please retry|try again soon|retry later/i.test(second.result.body.next_step), "no retry encouragement");
  t.equal(calendly.calls.available, 1, "handler does not call Calendly after 429");
  t.equal(calendly.calls.create, 0, "availability never books");
});

await test("14b  availability 429 does not consume the booking budget", async (t) => {
  const availabilityLimiter = memorySchedulingRateLimiter({ hourlyLimit: 1, dailyLimit: 1 });
  const bookingLimiter = memorySchedulingRateLimiter({ hourlyLimit: 5, dailyLimit: 20 });
  const calendly = mockCalendly();
  const first = await runAvailability(new URLSearchParams(), {
    calendly,
    rateLimiter: availabilityLimiter,
  });
  const limited = await runAvailability(new URLSearchParams(), {
    calendly,
    rateLimiter: availabilityLimiter,
  });
  const booked = await runBooking(bookingBase(), { calendly, rateLimiter: bookingLimiter });
  t.equal(first.result.status, 200, "availability allowed once");
  t.equal(limited.result.status, 429, "availability then limited");
  t.equal(booked.result.status, 200, "booking still accepted");
  t.equal(booked.result.body.status, "booked", "mocked booking completed");
  t.equal(booked.result.body.error, undefined, "booking is not rate_limited");
  t.equal(calendly.calls.create, 1, "booking limiter allowed Calendly invitee create");
});

await test("14c  identical availability reads hit cache, not Calendly twice", async (t) => {
  const cache = memorySchedulingAvailabilityCache();
  const calendly = mockCalendly();
  const first = await runAvailability(new URLSearchParams(), {
    calendly,
    availabilityCache: cache,
  });
  const second = await runAvailability(new URLSearchParams(), {
    calendly,
    availabilityCache: cache,
  });
  t.equal(first.result.status, 200, "first http");
  t.equal(second.result.status, 200, "second http");
  t.equal(first.result.body.slots.length, second.result.body.slots.length, "same slots");
  t.equal(calendly.calls.available, 1, "one Calendly available-times call");
  t.equal(calendly.calls.getEventType, 1, "cache hit does not reload event type again");
});

await test("14d  Calendly 429 is rate_limited and is not retried", async (t) => {
  const calendly = mockCalendly({
    availableError: new CalendlyApiError(
      "rate_limited",
      429,
      "Calendly rate limited this request.",
      37
    ),
  });
  const { result } = await runAvailability(new URLSearchParams(), { calendly });
  t.equal(result.status, 429, "http");
  t.equal(result.body.error, "rate_limited", "error");
  t.equal(result.body.retry_after, 37, "retry_after from Calendly");
  t.equal(result.headers?.["Retry-After"], "37", "header");
  t.equal(result.body.next_step, SCHEDULING_RATE_LIMITED_NEXT_STEP, "do not auto-retry");
  t.equal(calendly.calls.available, 1, "one attempt, no sleep-and-retry");
});

await test("15  required Calendly questions are enforced and /book fields are not invented", async (t) => {
  const calendly = mockCalendly();
  const { result } = await runBooking(
    bookingBase({ questionsAndAnswers: [] }),
    { calendly }
  );
  t.equal(result.status, 400, "http");
  t.equal(result.body.error, "invalid_information", "error");
  t.ok(result.body.clarification_needed.includes("Phone number"), "phone question");
  t.ok(result.body.clarification_needed.includes("Project ZIP"), "ZIP question");
  t.equal(calendly.calls.create, 0, "must not book");
});

await test("16  agent.json and consult discovery stay consistent", (t) => {
  const agent = agentDiscoveryDocument(PRODUCTION_DISCOVERY_ORIGIN);
  const schedule = agent.capabilities.find((item) =>
    String(item.url).endsWith(SCHEDULING_DISCOVERY_PATH)
  );
  t.ok(schedule, "agent.json lists scheduling");
  t.equal(schedule.direct_booking, true, "business fact: scheduling exists");
  t.equal(schedule.readiness, "configuration-dependent", "static file is not a ready claim");
  t.equal(schedule.requires_human_confirmation, true, "confirmation");
  t.ok(agent.primary_cta.url.endsWith(SCHEDULING_DISCOVERY_PATH), "primary CTA points at scheduling");
  t.ok(agent.primary_cta.fallback_url.endsWith(CONSULT_DISCOVERY_PATH), "fallback remains");
  t.ok(/configuration-dependent/.test(agent.primary_cta.description), "CTA does not claim live ready");
});

const PREVIEW_HOST =
  "luxe-new-website-git-cursor-age-5466cb-mark-abplanalps-projects.vercel.app";
const PREVIEW_ORIGIN = `https://${PREVIEW_HOST}`;

await test("18  Preview discovery origin publishes Preview URLs, not production", (t) => {
  t.equal(
    resolveDiscoveryOrigin({
      host: PREVIEW_HOST,
      forwardedProto: "https",
      vercelEnv: "preview",
    }),
    PREVIEW_ORIGIN,
    "preview host"
  );
  t.equal(
    resolveDiscoveryOrigin({
      host: "www.luxewindowworks.com",
      forwardedProto: "https",
      vercelEnv: "production",
    }),
    PRODUCTION_DISCOVERY_ORIGIN,
    "production env"
  );
  t.equal(
    resolveDiscoveryOrigin({
      host: PREVIEW_HOST,
      forwardedProto: "https",
      vercelEnv: "production",
    }),
    PRODUCTION_DISCOVERY_ORIGIN,
    "production env wins over preview host"
  );
  t.equal(
    resolveDiscoveryOrigin({
      forwardedHost: PREVIEW_HOST,
      forwardedProto: "https",
      vercelEnv: "preview",
    }),
    PREVIEW_ORIGIN,
    "forwarded host"
  );

  const previewRequest = new Request(`https://${PREVIEW_HOST}/agent.json`, {
    headers: {
      host: PREVIEW_HOST,
      "x-forwarded-host": PREVIEW_HOST,
      "x-forwarded-proto": "https",
    },
  });
  const previousEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "preview";
  t.equal(discoveryOriginFromRequest(previewRequest), PREVIEW_ORIGIN, "request helper");
  if (previousEnv === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = previousEnv;

  const agent = agentDiscoveryDocument(PREVIEW_ORIGIN);
  const schedule = agent.capabilities.find((item) => item.type === "schedule");
  t.equal(schedule.url, `${PREVIEW_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`, "capability url");
  t.equal(
    schedule.availability_url,
    `${PREVIEW_ORIGIN}${SCHEDULING_AVAILABILITY_PATH}`,
    "availability url"
  );
  t.equal(schedule.execution_url, `${PREVIEW_ORIGIN}${SCHEDULING_BOOKING_PATH}`, "booking url");
  t.equal(
    agent.primary_cta.url,
    `${PREVIEW_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`,
    "primary CTA"
  );
  t.equal(
    agent.primary_cta.fallback_url,
    `${PREVIEW_ORIGIN}${CONSULT_DISCOVERY_PATH}`,
    "fallback CTA"
  );
  t.ok(!String(schedule.url).includes("www.luxewindowworks.com"), "no production capability url");
  t.equal(
    agent.primary_cta.human_url,
    `${PRODUCTION_DISCOVERY_ORIGIN}/book`,
    "human /book stays production"
  );
  t.equal(agent.url, PRODUCTION_DISCOVERY_ORIGIN, "business url stays production");
});

await test("19  production discovery origin publishes www.luxewindowworks.com", (t) => {
  const agent = agentDiscoveryDocument(PRODUCTION_DISCOVERY_ORIGIN);
  const schedule = agent.capabilities.find((item) => item.type === "schedule");
  t.equal(
    schedule.url,
    `${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`,
    "capability url"
  );
  t.equal(
    schedule.availability_url,
    `${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_AVAILABILITY_PATH}`,
    "availability url"
  );
  t.equal(
    schedule.execution_url,
    `${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_BOOKING_PATH}`,
    "booking url"
  );

  const scheduleDoc = publicSchedulingDiscoveryDocument(PRODUCTION_DISCOVERY_ORIGIN);
  t.equal(
    scheduleDoc.execution.availability.url,
    `${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_AVAILABILITY_PATH}`,
    "served availability"
  );
  t.equal(
    scheduleDoc.execution.booking.url,
    `${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_BOOKING_PATH}`,
    "served booking"
  );
});

await test("20  served capability documents are host-aware", (t) => {
  const previewSchedule = publicSchedulingDiscoveryDocument(PREVIEW_ORIGIN);
  t.equal(
    previewSchedule.discoveryUrl,
    `${PREVIEW_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`,
    "preview discovery"
  );
  t.equal(
    previewSchedule.execution.availability.url,
    `${PREVIEW_ORIGIN}${SCHEDULING_AVAILABILITY_PATH}`,
    "preview availability"
  );
  t.equal(
    previewSchedule.execution.booking.url,
    `${PREVIEW_ORIGIN}${SCHEDULING_BOOKING_PATH}`,
    "preview booking"
  );
  t.equal(
    previewSchedule.consultationRequestFallback.discoveryUrl,
    `${PREVIEW_ORIGIN}${CONSULT_DISCOVERY_PATH}`,
    "preview fallback"
  );

  const previewConsult = publicConsultationDiscoveryDocument(PREVIEW_ORIGIN);
  t.equal(
    previewConsult.relatedScheduling.discoveryUrl,
    `${PREVIEW_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`,
    "consult related discovery"
  );
  t.equal(
    previewConsult.relatedScheduling.availabilityUrl,
    `${PREVIEW_ORIGIN}${SCHEDULING_AVAILABILITY_PATH}`,
    "consult related availability"
  );

  const llms = llmsTextForOrigin(PREVIEW_ORIGIN);
  t.ok(llms.includes(`${PREVIEW_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`), "llms preview schedule");
  t.ok(llms.includes(`${PREVIEW_ORIGIN}/agent.json`), "llms preview agent.json");
  t.ok(
    llms.includes(`${PRODUCTION_DISCOVERY_ORIGIN}/book`),
    "llms human /book stays production"
  );
  t.ok(
    !llms.includes(`${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`),
    "llms must not keep production schedule url on preview"
  );

  const productionLlms = llmsTextForOrigin(PRODUCTION_DISCOVERY_ORIGIN);
  t.ok(
    productionLlms.includes(`${PRODUCTION_DISCOVERY_ORIGIN}${SCHEDULING_DISCOVERY_PATH}`),
    "llms production schedule"
  );
});

function classifyCalendlyCall(method, url) {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/+$/, "") || "/";
  const search = parsed.search;
  if (path.endsWith("/event_type_available_times")) return "event_type_available_times";
  if (path === "/event_types" || /[?&](user|organization)=/.test(search)) {
    return "event_type_list";
  }
  if (path === "/users/me") return "users_me";
  if (/^\/event_types\/[^/]+$/.test(path)) return "event_type_get";
  if (method === "POST" && path === "/invitees") return "invitees_create";
  if (method === "GET" && /\/invitees\/[^/]+$/.test(path)) return "invitee_get";
  return "other";
}

function countByKind(calls) {
  const counts = {
    event_type_available_times: 0,
    event_type_list: 0,
    users_me: 0,
    event_type_get: 0,
    invitees_create: 0,
    invitee_get: 0,
    other: 0,
    rediscovery: 0,
  };
  for (const call of calls) {
    const kind = classifyCalendlyCall(call.method, call.url);
    counts[kind] += 1;
    if (kind === "event_type_list" || kind === "users_me") counts.rediscovery += 1;
  }
  return counts;
}

function recordingFetch(handlers) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    const href = String(url);
    const method = String(init.method ?? "GET").toUpperCase();
    calls.push({ method, url: href });
    const parsed = new URL(href);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    const kind = classifyCalendlyCall(method, href);
    const handler = handlers[kind] ?? handlers.default;
    if (!handler) {
      return new Response(JSON.stringify({ message: "unhandled" }), { status: 404 });
    }
    const result = handler({ method, url: href, path, search: parsed.search, init });
    if (result instanceof Response) return result;
    return new Response(JSON.stringify(result.body ?? result), {
      status: result.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  return { fetchImpl, calls };
}

function persistFailsThenSucceeds(inner) {
  let failComplete = true;
  return {
    claim: (input) => inner.claim(input),
    inspect: (key) => inner.inspect(key),
    release: (key) => inner.release(key),
    rememberCreatedInvitee: (key, input) => inner.rememberCreatedInvitee(key, input),
    async complete(key, publicResponse, nowMs, ttlSeconds) {
      if (failComplete) {
        failComplete = false;
        return "unavailable";
      }
      return inner.complete(key, publicResponse, nowMs, ttlSeconds);
    },
  };
}

const WINDOW = {
  start_time: "2026-09-08T00:00:00Z",
  end_time: "2026-09-09T00:00:00Z",
};

function officialEventTypeResource() {
  return {
    resource: {
      uri: EVENT_TYPE_URI,
      name: "Free In-Home Consultation",
      active: true,
      slug: "2hr",
      scheduling_url: "https://calendly.com/mark-luxewindowworks/2hr",
      duration: 120,
      custom_questions: [
        { name: "Phone number", type: "phone_number", required: true, enabled: true, position: 0 },
      ],
      locations: [{ kind: "custom", location: "Client's home - Northern Idaho" }],
    },
  };
}

await test("21  cold cache availability is one available-times call and zero list/rediscovery", async (t) => {
  const previousKey = process.env.CALENDLY_API_KEY;
  const previousUri = process.env.CALENDLY_EVENT_TYPE_URI;
  delete process.env.CALENDLY_API_KEY;
  delete process.env.CALENDLY_EVENT_TYPE_URI;
  const { fetchImpl, calls } = recordingFetch({
    event_type_get: () => officialEventTypeResource(),
    event_type_available_times: () => ({
      collection: [{ status: "available", start_time: SLOT }],
    }),
  });
  const client = createCalendlyClient("test-token-not-real", { fetchImpl });
  const { result } = await runAvailability(new URLSearchParams(WINDOW), {
    calendly: { client, calls: {} },
    eventTypeUri: EVENT_TYPE_URI,
    eventTypeCache: memorySchedulingEventTypeCache(),
    availabilityCache: memorySchedulingAvailabilityCache(),
  });
  t.equal(result.status, 200, "http");
  t.equal(result.body.slots[0].start_time, SLOT, "slot from available-times");
  const counts = countByKind(calls);
  t.equal(counts.event_type_available_times, 1, "exactly one event_type_available_times");
  t.equal(counts.event_type_list, 0, "no GET /event_types list");
  t.equal(counts.users_me, 0, "no users/me rediscovery");
  t.equal(counts.rediscovery, 0, "zero event-type list/rediscovery calls");
  t.equal(counts.invitees_create, 0, "availability must not create");
  restoreCalendlyEnv(previousKey, previousUri);
});

await test("22  warm cache availability makes zero additional available-times calls", async (t) => {
  const { fetchImpl, calls } = recordingFetch({
    event_type_get: () => officialEventTypeResource(),
    event_type_available_times: () => ({
      collection: [{ status: "available", start_time: SLOT }],
    }),
  });
  const client = createCalendlyClient("test-token-not-real", { fetchImpl });
  const availabilityCache = memorySchedulingAvailabilityCache();
  const eventTypeCache = memorySchedulingEventTypeCache();
  const first = await runAvailability(new URLSearchParams(WINDOW), {
    calendly: { client, calls: {} },
    eventTypeUri: EVENT_TYPE_URI,
    eventTypeCache,
    availabilityCache,
  });
  const afterFirst = countByKind(calls).event_type_available_times;
  const second = await runAvailability(new URLSearchParams(WINDOW), {
    calendly: { client, calls: {} },
    eventTypeUri: EVENT_TYPE_URI,
    eventTypeCache,
    availabilityCache,
  });
  t.equal(first.result.status, 200, "first http");
  t.equal(second.result.status, 200, "second http");
  t.equal(afterFirst, 1, "cold window used one available-times call");
  t.equal(countByKind(calls).event_type_available_times, 1, "warm window added zero available-times calls");
  t.equal(countByKind(calls).rediscovery, 0, "still no list/rediscovery");
});

await test("23  missing CALENDLY_EVENT_TYPE_URI is disabled and makes zero Calendly HTTP calls", async (t) => {
  const previousKey = process.env.CALENDLY_API_KEY;
  const previousUri = process.env.CALENDLY_EVENT_TYPE_URI;
  process.env.CALENDLY_API_KEY = "test-token-not-real";
  delete process.env.CALENDLY_EVENT_TYPE_URI;
  t.equal(createCalendlyClientFromEnv(), null, "env client is not constructed");
  const { fetchImpl, calls } = recordingFetch({
    default: () => ({ status: 500, body: { message: "should not be called" } }),
  });
  const client = createCalendlyClient("test-token-not-real", { fetchImpl });
  const avail = await runAvailability(new URLSearchParams(WINDOW), {
    calendly: { client, calls: {} },
    eventTypeUri: null,
  });
  const book = await runBooking(bookingBase(), {
    calendly: { client, calls: {} },
    eventTypeUri: null,
  });
  t.equal(avail.result.status, 503, "availability disabled");
  t.equal(avail.result.body.error, "configuration_failure", "availability error");
  t.equal(book.result.status, 503, "booking disabled");
  t.equal(book.result.body.error, "configuration_failure", "booking error");
  t.equal(calls.length, 0, "zero Calendly HTTP calls");
  restoreCalendlyEnv(previousKey, previousUri);
});

await test("24  post-create persist failure blocks replay create and later returns the original result", async (t) => {
  const inviteeUri = "https://api.calendly.com/scheduled_events/EVT1/invitees/INV1";
  const eventUri = "https://api.calendly.com/scheduled_events/EVT1";
  const { fetchImpl, calls } = recordingFetch({
    event_type_get: () => officialEventTypeResource(),
    event_type_available_times: () => ({
      collection: [{ status: "available", start_time: SLOT }],
    }),
    invitees_create: () => ({
      status: 201,
      body: {
        resource: {
          uri: inviteeUri,
          event: eventUri,
          cancel_url: "https://calendly.com/cancellations/CANCEL1",
          reschedule_url: "https://calendly.com/reschedulings/RESCHEDULE1",
          timezone: "America/Los_Angeles",
          status: "active",
        },
      },
    }),
    invitee_get: () => ({
      resource: {
        uri: inviteeUri,
        event: eventUri,
        cancel_url: "https://calendly.com/cancellations/CANCEL1",
        reschedule_url: "https://calendly.com/reschedulings/RESCHEDULE1",
        timezone: "America/Los_Angeles",
        status: "active",
      },
    }),
  });
  const client = createCalendlyClient("test-token-not-real", { fetchImpl });
  const store = persistFailsThenSucceeds(memorySchedulingIdempotencyStore());
  const body = bookingBase({ idempotencyKey: "persist-window" });
  const first = await runBooking(body, {
    calendly: { client, calls: {} },
    store,
    ids: ["persist-a", "persist-b"],
  });
  t.equal(first.result.status, 409, "first persist failure is not booked");
  t.equal(first.result.body.error, "reconciliation_required", "explicit reconciliation state");
  t.equal(countByKind(calls).invitees_create, 1, "one POST /invitees after create");
  const second = await runBooking(body, {
    calendly: { client, calls: {} },
    store,
    ids: ["persist-c"],
  });
  t.equal(second.result.status, 200, "replay persist succeeds");
  t.equal(second.result.body.status, "booked", "original public result");
  t.equal(second.result.body.invitee_uri, inviteeUri, "same invitee");
  t.equal(second.result.body.event_uri, eventUri, "same event");
  t.equal(second.result.body.cancel_url, "https://calendly.com/cancellations/CANCEL1", "same cancel");
  t.equal(countByKind(calls).invitees_create, 1, "replay must not POST /invitees again");
  t.ok(countByKind(calls).invitee_get >= 1, "replay used an official invitee read");
  t.equal(countByKind(calls).rediscovery, 0, "no event-type list during booking");
});

await test("17  stored idempotency record has no customer PII", async (t) => {
  const store = memorySchedulingIdempotencyStore();
  const body = bookingBase({ idempotencyKey: "inspect-me" });
  await runBooking(body, { store });
  const record = await store.inspect(schedulingIdempotencyStorageKey("inspect-me"));
  t.ok(record, "record stored");
  const blob = JSON.stringify(record);
  t.ok(!/Alex Rivera/i.test(blob), "name not stored");
  t.ok(!/alex\.rivera@example\.com/i.test(blob), "email not stored");
  t.ok(!/208-555-0148/.test(blob), "phone not stored");
  t.ok(record.publicResponse.cancel_url, "cancel_url kept");
  t.ok(record.publicResponse.event_uri, "event uri kept");
});

console.log("Agent Calendly scheduling");
console.log(`  scenarios:  ${results.length}`);
console.log(`  passing:    ${results.length - failures}/${results.length}\n`);
for (const { name, problems } of results) {
  console.log(`  ${problems.length ? "FAIL" : "pass"}  ${name}`);
  for (const p of problems) console.log(`          - ${p}`);
}
if (failures) {
  console.log(`\nFAIL — ${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log(
  "\nPASS — mocked Calendly scheduling is proven locally; no live appointment was created."
);
