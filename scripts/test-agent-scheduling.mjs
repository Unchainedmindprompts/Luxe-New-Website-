#!/usr/bin/env node
/**
 * Deterministic coverage for agent Calendly scheduling.
 *
 * Local only. Calendly is mocked. Does not POST a real appointment.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONSULT_CAPABILITY_ID,
  CONSULT_DISCOVERY_PATH,
  SCHEDULING_AVAILABILITY_PATH,
  SCHEDULING_BOOKING_PATH,
  SCHEDULING_CAPABILITY_ID,
  SCHEDULING_DISCOVERY_PATH,
} from "../lib/capabilities.ts";
import { CalendlyApiError } from "../lib/calendly-client.ts";
import {
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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
    resolve: 0,
    available: 0,
    create: 0,
    availableWindows: [],
    createBodies: [],
  };
  const slots = options.slots ?? [SLOT, OTHER_SLOT];
  const createError = options.createError;
  const availableError = options.availableError;
  const resolveError = options.resolveError;
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
      async resolveConsultationEventType() {
        calls.resolve += 1;
        if (resolveError) throw resolveError;
        return eventType;
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
    rateLimiter: extras.rateLimiter ?? memorySchedulingRateLimiter(),
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
    rateLimiter: extras.rateLimiter ?? memorySchedulingRateLimiter(),
    idempotencyStore: extras.idempotencyStore === null ? undefined : store,
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

await test("1  discovery is not ready when Calendly is unconfigured", (t) => {
  const previous = process.env.CALENDLY_API_KEY;
  delete process.env.CALENDLY_API_KEY;
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
  t.equal(doc.customQuestions.loaded, false, "does not invent questions");
  t.ok(/configuration is missing/i.test(doc.customQuestions.note), "says configuration is missing");
  t.equal(doc.consultationRequestFallback.id, CONSULT_CAPABILITY_ID, "keeps request fallback");
  t.equal(doc.consultationRequestFallback.discoveryUrl, CONSULT_DISCOVERY_PATH, "fallback discovery");
  t.equal(doc.requiresHumanConfirmation, true, "confirmation required");
  t.equal(doc.pricingAvailable, false, "no pricing");
  t.ok(!/\b5\b.*hour|20.*day/i.test(JSON.stringify(doc.rateLimit)), "no thresholds");
  if (previous === undefined) delete process.env.CALENDLY_API_KEY;
  else process.env.CALENDLY_API_KEY = previous;
});

await test("2  discovery advertises scheduling when a token is present", (t) => {
  const previous = process.env.CALENDLY_API_KEY;
  process.env.CALENDLY_API_KEY = "test-token-not-real";
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
  t.equal(doc.readinessBlockers.length, 0, "no blockers when token present");
  if (previous === undefined) delete process.env.CALENDLY_API_KEY;
  else process.env.CALENDLY_API_KEY = previous;
});

await test("3a  default availability window stays under Calendly 31-day max", async (t) => {
  const { result, calendly } = await runAvailability(new URLSearchParams());
  t.equal(result.status, 200, "http");
  const start = Date.parse(result.body.window.start_time);
  const end = Date.parse(result.body.window.end_time);
  t.ok(end > start, "end after start");
  t.ok(end - start <= 30 * 24 * 60 * 60 * 1000 + 1000, "default window is 30 days");
  t.equal(calendly.calls.create, 0, "default availability must not book");
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

await test("14  rate limiting fails closed and does not book", async (t) => {
  const limiter = memorySchedulingRateLimiter({ hourlyLimit: 1, dailyLimit: 1 });
  const calendly = mockCalendly();
  const first = await runAvailability(new URLSearchParams(), { calendly, rateLimiter: limiter });
  const second = await runBooking(bookingBase(), { calendly, rateLimiter: limiter });
  t.equal(first.result.status, 200, "first allowed");
  t.equal(second.result.status, 429, "second limited");
  t.equal(second.result.body.error, "rate_limited", "error");
  t.ok(second.result.headers?.["Retry-After"], "retry-after");
  t.equal(calendly.calls.create, 0, "limited request must not book");
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
  const agent = JSON.parse(readFileSync(join(ROOT, "public/agent.json"), "utf8"));
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
