#!/usr/bin/env node
/**
 * Deterministic coverage for the agent consultation-request contract.
 *
 * Local only. Mail and idempotency are mocked. Does not POST to production
 * or preview /api/consultation.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  consultationDiscoveryDocument,
  CONSULT_CONTRACT_VERSION,
  CONSULT_DRAPERY_CATEGORY_ID,
  CONSULT_IDEMPOTENCY_TTL_SECONDS,
  CONSULT_NOT_READY_EXPECTATION,
  CONSULT_NOT_READY_HTTP_STATUS,
  CONSULT_NOT_READY_NEXT_STEP,
  CONSULT_READINESS,
  consultCategoriesPublic,
  isConsultAgentSubmissionEnabled,
} from "../lib/capabilities.ts";
import {
  memoryAgentRateLimiter,
  memoryIdempotencyStore,
  processConsultation,
  processProductionConsultation,
} from "../lib/consult-handler.ts";
import {
  consultEmailIdempotencyKey,
  idempotencyStorageKey,
} from "../lib/consult-idempotency.ts";
import {
  hashClientIp,
  hashNormalizedClientIp,
  normalizeClientIp,
} from "../lib/consult-ip.ts";
import {
  timeoutSuccessRateLimiter,
  unavailableRateLimiter,
} from "../lib/consult-rate-limit.ts";

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

function agentBase(overrides = {}) {
  return {
    source: "agent",
    contractVersion: CONSULT_CONTRACT_VERSION,
    idempotencyKey: overrides.idempotencyKey ?? `key-${Math.random().toString(16).slice(2)}`,
    name: "Alex Rivera",
    phone: "208-555-0148",
    email: "alex.rivera@example.com",
    city: "Post Falls",
    postalCode: "83854",
    preferredContactMethod: "phone",
    intent: "new_window_treatments",
    productInterests: ["cellular-shades"],
    ...overrides,
  };
}

function mailSpy() {
  const sent = [];
  return {
    sent,
    sendEmail: async (message) => {
      sent.push(message);
      return {};
    },
  };
}

async function runAgent(body, extras = {}) {
  const mail = extras.mail ?? mailSpy();
  const store = extras.store ?? memoryIdempotencyStore();
  const limiter = extras.rateLimiter ?? memoryAgentRateLimiter();
  const ids = extras.ids ?? ["req-1", "req-2", "req-3"];
  let i = 0;
  const result = await processConsultation(body, {
    sendEmail: mail.sendEmail,
    idempotencyStore: extras.idempotencyStore === null ? undefined : store,
    rateLimiter: extras.rateLimiter === null ? undefined : limiter,
    clientIpHash: extras.clientIpHash ?? "hash-test-default",
    createId: extras.createId ?? (() => ids[i++] ?? `req-${i}`),
    now: extras.now ?? (() => new Date("2026-08-22T18:00:00.000Z")),
    logFailure: () => {},
    logInfraUnavailable: extras.logInfra ?? (() => {}),
    // Local proof of the enabled policy. Production never passes this.
    testAllowAgentExecution: extras.testAllowAgentExecution === false ? undefined : true,
  });
  return { result, mail, store };
}

async function runProductionGate(body, extras = {}) {
  const mail = extras.mail ?? mailSpy();
  const store = extras.store ?? memoryIdempotencyStore();
  const ids = extras.ids ?? ["prod-1", "prod-2"];
  let i = 0;
  const result = await processProductionConsultation(body, {
    sendEmail: mail.sendEmail,
    createId: extras.createId ?? (() => ids[i++] ?? `prod-${i}`),
    logFailure: () => {},
  });
  return { result, mail, store };
}

await test("1  in-area shade → accepted", async (t) => {
  const { result, mail } = await runAgent(agentBase());
  t.equal(result.status, 200, "http status");
  t.equal(result.body.status, "accepted", "status");
  t.equal(result.body.reason_code, "in_service_area", "reason");
  t.equal(result.body.contract_version, "1.0", "contract version");
  t.ok(typeof result.body.request_id === "string" && result.body.request_id, "request_id");
  t.ok(
    /not an appointment/i.test(result.body.next_step) &&
      !/\b(booked|reserved|confirmed)\b/i.test(result.body.next_step),
    "must not claim a booking"
  );
  t.equal(mail.sent.length, 1, "Mark gets one email");
});

await test("2  single-window → accepted", async (t) => {
  const { result, mail } = await runAgent(
    agentBase({ intent: "single_window_project", productInterests: ["blinds"] })
  );
  t.equal(result.body.status, "accepted", "single-window is qualified");
  t.equal(result.body.reason_code, "in_service_area", "reason");
  t.equal(mail.sent.length, 1, "email sent");
});

await test("3  motorization → accepted", async (t) => {
  const { result } = await runAgent(
    agentBase({
      intent: "motorization_consultation",
      productInterests: ["motorization"],
      city: "Coeur d'Alene",
      postalCode: "83814",
    })
  );
  t.equal(result.body.status, "accepted", "status");
  t.equal(result.body.reason_code, "in_service_area", "reason");
});

await test("4  exterior solar → accepted", async (t) => {
  const { result } = await runAgent(
    agentBase({
      intent: "exterior_solar_consultation",
      productInterests: ["exterior-solar-shades"],
      city: "CDA",
      postalCode: "83815",
    })
  );
  t.equal(result.body.status, "accepted", "CDA alias accepted");
  t.equal(result.body.reason_code, "in_service_area", "reason");
});

await test("5  custom drapery → accepted without Service identity", async (t) => {
  const { result } = await runAgent(
    agentBase({
      productInterests: ["custom draperies"],
      city: "Liberty Lake",
      postalCode: "99019",
    })
  );
  t.equal(result.body.status, "accepted", "drapery is a real consult category");
  t.equal(result.body.reason_code, "in_service_area", "reason");
  const drapery = consultCategoriesPublic().find((c) => c.id === CONSULT_DRAPERY_CATEGORY_ID);
  t.ok(drapery, "drapery listed");
  t.equal(drapery?.canonicalServiceId, null, "no fabricated Service @id");
  t.equal(drapery?.canonicalProductPage, null, "no fabricated product page");
});

await test("6  commercial → soft_accepted / commercial_review", async (t) => {
  const { result, mail } = await runAgent(
    agentBase({ intent: "commercial_project", city: "Spokane", postalCode: "99201" })
  );
  t.equal(result.body.status, "soft_accepted", "status");
  t.equal(result.body.reason_code, "commercial_review", "reason");
  t.equal(mail.sent.length, 1, "Mark still gets the lead");
});

await test("7  third-party repair → rejected / third_party_service", async (t) => {
  const { result, mail } = await runAgent(
    agentBase({ intent: "third_party_repair_or_service" })
  );
  t.equal(result.body.status, "rejected", "status");
  t.equal(result.body.reason_code, "third_party_service", "reason");
  t.equal(mail.sent.length, 0, "no email");
});

await test("8  price-only → handoff_required / wants_price_now", async (t) => {
  const { result, mail } = await runAgent(agentBase({ intent: "price_only" }));
  t.equal(result.body.status, "handoff_required", "status");
  t.equal(result.body.reason_code, "wants_price_now", "reason");
  t.equal(mail.sent.length, 1, "handoff still reaches Mark");
});

await test("9  missing phone → rejected / incomplete_request", async (t) => {
  const { result, mail } = await runAgent(agentBase({ phone: "" }));
  t.equal(result.body.status, "rejected", "status");
  t.equal(result.body.reason_code, "incomplete_request", "reason");
  t.ok(result.body.clarification_needed?.includes("phone"), "asks for phone");
  t.ok(result.body.request_id, "request_id on validation failure");
  t.equal(mail.sent.length, 0, "no email");
});

await test("10  nearby ambiguous 838/990/992 → soft_accepted / edge_geography", async (t) => {
  const { result, mail } = await runAgent(
    agentBase({ city: "Spirit Lake", postalCode: "83869" })
  );
  t.equal(result.body.status, "soft_accepted", "838xx unrecognized city");
  t.equal(result.body.reason_code, "edge_geography", "reason");
  t.equal(mail.sent.length, 1, "geo review reaches Mark");

  const wa = await runAgent(agentBase({ city: "Airway Heights", postalCode: "99001" }));
  t.equal(wa.result.body.reason_code, "edge_geography", "990xx");

  const spokane = await runAgent(agentBase({ city: "Cheney", postalCode: "99004" }));
  t.equal(spokane.result.body.status, "soft_accepted", "990xx Cheney");

  const inner = await runAgent(agentBase({ city: "Nine Mile Falls", postalCode: "99026" }));
  t.equal(inner.result.body.reason_code, "edge_geography", "990xx Nine Mile Falls");

  const zip992 = await runAgent(agentBase({ city: "Country Homes", postalCode: "99208" }));
  t.equal(zip992.result.body.status, "soft_accepted", "992xx unrecognized city");
  t.equal(zip992.result.body.reason_code, "edge_geography", "992xx reason");
});

await test("11  Boise / 837xx → rejected / out_of_area", async (t) => {
  const city = await runAgent(agentBase({ city: "Boise", postalCode: "83702" }));
  t.equal(city.result.body.status, "rejected", "Boise city");
  t.equal(city.result.body.reason_code, "out_of_area", "Boise reason");
  t.equal(city.mail.sent.length, 0, "no email for Boise");

  const zip = await runAgent(agentBase({ city: "Meridian", postalCode: "83713" }));
  t.equal(zip.result.body.reason_code, "out_of_area", "837xx");
});

await test("12  unsupported category → rejected / unsupported_category", async (t) => {
  const { result, mail } = await runAgent(
    agentBase({ productInterests: ["garage-doors"] })
  );
  t.equal(result.body.status, "rejected", "status");
  t.equal(result.body.reason_code, "unsupported_category", "reason");
  t.equal(mail.sent.length, 0, "no email");
});

await test("13  existing-customer / warranty → handoff_required", async (t) => {
  const { result } = await runAgent(
    agentBase({ intent: "existing_customer_or_warranty" })
  );
  t.equal(result.body.status, "handoff_required", "status");
  t.equal(result.body.reason_code, "existing_customer_or_warranty", "reason");
});

await test("14  explicit human request → handoff_required", async (t) => {
  const { result } = await runAgent(agentBase({ intent: "speak_to_human" }));
  t.equal(result.body.status, "handoff_required", "status");
  t.equal(result.body.reason_code, "human_requested", "reason");
});

await test("15  unsupported contract version → rejected", async (t) => {
  const { result, mail } = await runAgent(agentBase({ contractVersion: "2.0" }));
  t.equal(result.body.status, "rejected", "status");
  t.equal(result.body.reason_code, "unsupported_contract_version", "reason");
  t.equal(mail.sent.length, 0, "no email");
});

await test("16  duplicate idempotency key → same request_id, no second email", async (t) => {
  const store = memoryIdempotencyStore();
  const limiter = memoryAgentRateLimiter();
  const mail = mailSpy();
  let n = 0;
  const createId = () => `id-${++n}`;
  const body = agentBase({ idempotencyKey: "same-key-once" });
  const deps = {
    sendEmail: mail.sendEmail,
    idempotencyStore: store,
    rateLimiter: limiter,
    clientIpHash: "hash-same-key",
    createId,
    logFailure: () => {},
    testAllowAgentExecution: true,
  };
  const first = await processConsultation(body, deps);
  const second = await processConsultation(body, deps);
  t.equal(first.body.status, "accepted", "first accepted");
  t.equal(second.body.request_id, first.body.request_id, "same request_id");
  t.equal(second.body.status, first.body.status, "same status");
  t.equal(mail.sent.length, 1, "no duplicate email");
  t.ok(!("emailed" in second.body), "store flag is not part of the public contract");
  t.ok(!("fingerprint" in second.body), "fingerprint is not public");
  t.ok(!("state" in second.body), "internal state is not public");
  t.equal(mail.sent[0]?.idempotencyKey, consultEmailIdempotencyKey("same-key-once"), "Resend key");
});

await test("17  honeypot → opaque safe response, no email", async (t) => {
  const agentHp = await runAgent(agentBase({ _hp: "http://spam.example" }));
  t.equal(agentHp.result.status, 200, "agent honeypot http");
  t.equal(agentHp.result.body.status, "accepted", "opaque success shape");
  t.equal(agentHp.mail.sent.length, 0, "no email for agent honeypot");
  t.ok(!/honeypot|spam|bot/i.test(JSON.stringify(agentHp.result.body)), "no honeypot leak");

  const human = await processConsultation(
    {
      name: "Bot",
      phone: "208-555-0100",
      source: "contact",
      _hp: "filled",
    },
    { sendEmail: async () => ({}), logFailure: () => {} }
  );
  t.equal(human.status, 200, "human honeypot http");
  t.equal(human.body.ok, true, "human honeypot still { ok: true }");
});

await test("18  existing human-form payloads stay compatible", async (t) => {
  const mail = mailSpy();
  const contact = await processConsultation(
    {
      name: "Jamie Lee",
      phone: "208-555-0199",
      email: "jamie@example.com",
      needs: "Need shades for the living room.",
      contactMethod: "Phone call",
      source: "contact",
      _hp: "",
    },
    { sendEmail: mail.sendEmail, logFailure: () => {} }
  );
  t.equal(contact.status, 200, "contact form http");
  t.equal(contact.body.ok, true, "contact form still { ok: true }");
  t.ok(contact.body.status === undefined, "contact form is not the agent contract");
  t.ok(!contact.body.request_id, "human success shape unchanged");

  const book = await processConsultation(
    {
      firstName: "Sam",
      lastName: "Cole",
      email: "sam@example.com",
      phone: "208-555-0112",
      address: "123 Main St, Post Falls, ID",
      message: "West windows get brutal sun.",
      source: "book",
    },
    { sendEmail: mail.sendEmail, logFailure: () => {} }
  );
  t.equal(book.status, 200, "book form http");
  t.equal(book.body.ok, true, "book form still { ok: true }");
  t.equal(mail.sent.length, 2, "both human forms email Mark");

  const missing = await processConsultation(
    { source: "contact", name: "No Phone" },
    { sendEmail: mail.sendEmail, logFailure: () => {} }
  );
  t.equal(missing.status, 400, "human missing phone still 400");
  t.equal(
    missing.body.error,
    "Missing required fields: name and phone.",
    "human error string unchanged"
  );

  const form = readFileSync(join(ROOT, "app/contact/ContactForm.tsx"), "utf8");
  t.ok(/_hp:\s*\(formData\.get\("_hp"\)/.test(form), "contact form posts the honeypot field");
});

await test("discovery  no booking/pricing claims; drapery honest; readiness blocked", (t) => {
  const doc = consultationDiscoveryDocument();
  t.equal(doc.id, "request-in-home-consultation", "capability id");
  t.equal(doc.contractVersion, "1.0", "declared contract version");
  t.equal(doc.execution.url, "/api/consultation", "execution url");
  t.equal(doc.execution.method, "POST", "method");
  t.equal(doc.discoveryUrl, "/api/capabilities/request-in-home-consultation", "discovery url");
  t.equal(doc.requiresHumanFollowUp, true, "human follow-up required");
  t.equal(doc.directBookingAvailable, false, "no booking claim");
  t.equal(doc.pricingAvailable, false, "no pricing claim");
  t.equal(doc.checkoutAvailable, false, "no checkout claim");
  t.equal(doc.readiness, CONSULT_READINESS, "readiness matches contract literal");
  t.equal(doc.submissionEnabled, isConsultAgentSubmissionEnabled(), "submissionEnabled derived");
  t.equal(
    doc.execution.availableForUnattendedAgentExecution,
    isConsultAgentSubmissionEnabled(),
    "execution availability derived"
  );
  t.ok(
    doc.doNotRetryAutomaticallyWhen.includes("capability_not_ready"),
    "do not retry when not ready"
  );
  t.ok(
    doc.doNotRetryAutomaticallyWhen.includes("rate_limited"),
    "do not retry when rate limited"
  );
  t.ok(
    doc.doNotRetryAutomaticallyWhen.includes("infrastructure_unavailable"),
    "do not retry when infra unavailable"
  );
  t.equal(
    doc.idempotency.durableStoreAvailable,
    isConsultAgentSubmissionEnabled(),
    "idempotency availability matches gate"
  );
  t.equal(
    doc.rateLimit.durableLimiterAvailable,
    isConsultAgentSubmissionEnabled(),
    "rate-limit availability matches gate"
  );
  if (!isConsultAgentSubmissionEnabled()) {
    t.ok(
      doc.readinessBlockers.includes("durable-idempotency-unavailable"),
      "idempotency blocker named"
    );
    t.ok(
      doc.readinessBlockers.includes("durable-rate-limit-unavailable"),
      "rate-limit blocker named"
    );
    t.ok(
      doc.readinessBlockers.includes("preview-redis-connectivity-unverified"),
      "preview redis blocker named"
    );
  } else {
    t.equal(doc.readinessBlockers.length, 0, "no readiness blockers after flip");
    t.equal(doc.readiness, "request-submission-ready", "ready literal");
  }
  t.ok(
    doc.response.reasonCodes.includes("capability_not_ready"),
    "not-ready reason published"
  );
  t.ok(doc.response.reasonCodes.includes("rate_limited"), "rate_limited published");
  t.ok(
    doc.response.reasonCodes.includes("infrastructure_unavailable"),
    "infrastructure_unavailable published"
  );
  t.ok(!/\b5\b.*hour|hour.*\b5\b|20.*day|day.*20/i.test(JSON.stringify(doc.rateLimit)), "no thresholds");
  t.ok(
    !/KV_REST|REDIS_URL|fingerprint|idempotencyStorageKey/i.test(JSON.stringify(doc)),
    "no internal redis/idempotency fields"
  );
  t.ok(!doc.directBookingAvailable && !/calendly/i.test(JSON.stringify(doc)), "no Calendly");
  const drapery = doc.supportedProductCategories.find((c) => c.id === "custom-draperies");
  t.ok(drapery?.offered, "drapery offered");
  t.equal(drapery?.canonicalServiceId, null, "drapery has no Service @id");
  t.equal(drapery?.canonicalProductPage, null, "drapery has no product page");
  const aluminum = doc.supportedProductCategories.find((c) => c.id === "aluminum-shutters");
  t.equal(aluminum?.canonicalServiceId, null, "aluminum shutters still has no Service");
  t.ok(
    doc.supportedProductCategories.some((c) => c.id === "blinds" && c.canonicalServiceId),
    "real product categories keep their Service @id"
  );
  t.ok(doc.geography.websiteCanonicalMarketsUnchanged, "website markets stay five");
  t.ok(
    doc.allowedIntents.some((intent) => intent.id === "single_window_project"),
    "single-window is an allowed intent"
  );
});

await test("agent.json points at discovery and does not teach booking", (t) => {
  const agent = JSON.parse(readFileSync(join(ROOT, "public/agent.json"), "utf8"));
  const consult = agent.capabilities[0];
  t.ok(
    consult.url.endsWith("/api/capabilities/request-in-home-consultation"),
    "points at discovery"
  );
  t.equal(consult.direct_booking, false, "agent.json direct_booking false");
  t.equal(consult.requires_human_follow_up, true, "agent.json follow-up");
  t.equal(
    consult.submission_enabled,
    isConsultAgentSubmissionEnabled(),
    "agent.json submission matches contract"
  );
  t.equal(consult.readiness, CONSULT_READINESS, "agent.json readiness");
  t.ok(consult.url !== "https://www.luxewindowworks.com/book", "no longer /book");
  if (!isConsultAgentSubmissionEnabled()) {
    t.ok(
      /disabled/.test(consult.description.toLowerCase()) &&
        /disabled/.test(agent.primary_cta.description.toLowerCase()),
      "copy says submission is disabled"
    );
  } else {
    t.ok(
      !/booked|reserved|appointment confirmed/i.test(consult.description),
      "enabled copy still does not teach booking"
    );
  }
});

function assertNotHumanFallback(t, result, mail, label) {
  t.ok(result.body.ok !== true, `${label}: must not return human { ok: true }`);
  t.ok(result.body.status !== undefined, `${label}: agent contract status`);
  t.ok(result.body.request_id, `${label}: request_id`);
  t.equal(mail.sent.length, 0, `${label}: no email`);
}

function productionAgentGateReason() {
  return isConsultAgentSubmissionEnabled()
    ? "infrastructure_unavailable"
    : "capability_not_ready";
}

await test("19  source agent without contractVersion → no email; never human fallback", async (t) => {
  const prod = await runProductionGate({
    source: "agent",
    name: "Alex Rivera",
    phone: "208-555-0148",
  });
  t.equal(prod.result.status, CONSULT_NOT_READY_HTTP_STATUS, "production http");
  t.equal(prod.result.body.reason_code, productionAgentGateReason(), "production reason");
  assertNotHumanFallback(t, prod.result, prod.mail, "production partial source");

  const enabled = await runAgent({
    source: "agent",
    name: "Alex Rivera",
    phone: "208-555-0148",
  });
  t.equal(enabled.result.body.reason_code, "unsupported_contract_version", "enabled still agent path");
  assertNotHumanFallback(t, enabled.result, enabled.mail, "enabled partial source");
});

await test("20  contractVersion without source agent → no email; never human fallback", async (t) => {
  const prod = await runProductionGate({
    contractVersion: "1.0",
    name: "Alex Rivera",
    phone: "208-555-0148",
    source: "contact",
  });
  t.equal(prod.result.body.reason_code, productionAgentGateReason(), "production reason");
  assertNotHumanFallback(t, prod.result, prod.mail, "production version marker");

  const enabled = await runAgent({
    contractVersion: "1.0",
    name: "Alex Rivera",
    phone: "208-555-0148",
    source: "contact",
  });
  t.ok(enabled.result.body.ok !== true, "enabled is not human success");
  t.equal(enabled.result.body.status, "rejected", "enabled stays on agent path");
  t.equal(enabled.mail.sent.length, 0, "enabled sends no email");
});

await test("21  idempotencyKey alone → no email; never human fallback", async (t) => {
  const prod = await runProductionGate({
    idempotencyKey: "only-a-key",
    name: "Alex Rivera",
    phone: "208-555-0148",
    source: "book",
  });
  t.equal(prod.result.body.reason_code, productionAgentGateReason(), "production reason");
  assertNotHumanFallback(t, prod.result, prod.mail, "production key marker");

  const enabled = await runAgent({
    idempotencyKey: "only-a-key",
    name: "Alex Rivera",
    phone: "208-555-0148",
    source: "book",
  });
  t.equal(enabled.result.body.reason_code, "unsupported_contract_version", "enabled agent path");
  assertNotHumanFallback(t, enabled.result, enabled.mail, "enabled key marker");
});

await test("22  production agent gate → 503; no email; no store", async (t) => {
  const store = memoryIdempotencyStore();
  const mail = mailSpy();
  const body = agentBase({ idempotencyKey: "must-not-store" });
  const { result } = await runProductionGate(body, { mail, store });
  t.equal(result.status, CONSULT_NOT_READY_HTTP_STATUS, "http 503");
  t.equal(result.body.status, "handoff_required", "existing status");
  t.equal(result.body.reason_code, productionAgentGateReason(), "reason");
  t.equal(result.body.contract_version, "1.0", "contract version");
  t.ok(result.body.request_id, "request_id");
  t.ok(result.body.ok !== true, "not human ok");
  t.equal(mail.sent.length, 0, "no email");
  t.equal(
    await store.inspect(idempotencyStorageKey("must-not-store")),
    null,
    "injected store unused by production adapter"
  );
  if (!isConsultAgentSubmissionEnabled()) {
    t.equal(result.body.next_step, CONSULT_NOT_READY_NEXT_STEP, "next_step");
    t.equal(result.body.response_expectation, CONSULT_NOT_READY_EXPECTATION, "expectation");
    const disabled = await processConsultation(body, {
      sendEmail: mail.sendEmail,
      idempotencyStore: store,
      rateLimiter: memoryAgentRateLimiter(),
      clientIpHash: "hash-disabled",
      createId: () => "gate-id",
      logFailure: () => {},
    });
    t.equal(disabled.body.reason_code, "capability_not_ready", "handler gate without override");
    t.equal(mail.sent.length, 0, "still no email");
    t.ok(
      !(await store.inspect(idempotencyStorageKey("must-not-store"))),
      "no idempotency mutation"
    );
  }
});

await test("23  genuine human payloads without agent markers stay unchanged", async (t) => {
  const mail = mailSpy();
  const contact = await processProductionConsultation(
    {
      name: "Jamie Lee",
      phone: "208-555-0199",
      email: "jamie@example.com",
      needs: "Need shades for the living room.",
      contactMethod: "Phone call",
      source: "contact",
      _hp: "",
    },
    { sendEmail: mail.sendEmail, logFailure: () => {} }
  );
  t.equal(contact.status, 200, "contact http");
  t.equal(contact.body.ok, true, "contact { ok: true }");
  t.ok(contact.body.reason_code === undefined, "not the disabled agent contract");

  const book = await processProductionConsultation(
    {
      firstName: "Sam",
      lastName: "Cole",
      email: "sam@example.com",
      phone: "208-555-0112",
      address: "123 Main St, Post Falls, ID",
      message: "West windows get brutal sun.",
      source: "book",
    },
    { sendEmail: mail.sendEmail, logFailure: () => {} }
  );
  t.equal(book.body.ok, true, "book { ok: true }");
  t.equal(mail.sent.length, 2, "both human forms still email");
});

await test("24  page-path source values are not source:agent", async (t) => {
  const mail = mailSpy();
  for (const source of ["/contact", "/book", "/free-consultation", "contact", "book"]) {
    const result = await processProductionConsultation(
      { name: "Path Human", phone: "208-555-0101", source },
      { sendEmail: mail.sendEmail, logFailure: () => {} }
    );
    t.equal(result.body.ok, true, `${source} is a human form`);
    t.ok(result.body.reason_code !== "capability_not_ready", `${source} is not gated`);
  }
  t.equal(mail.sent.length, 5, "page-path sources still email as humans");
});

await test("25  production route cannot pass the test override", (t) => {
  const route = readFileSync(join(ROOT, "app/api/consultation/route.ts"), "utf8");
  t.ok(
    route.includes("processProductionConsultation"),
    "route uses the production adapter"
  );
  t.ok(!route.includes("testAllowAgentExecution"), "route never names the test override");
  t.ok(!route.includes("processConsultation("), "route does not call the testable entry");
  t.ok(route.includes("idempotencyKey"), "route passes Resend idempotency");
  t.ok(route.includes("request: req"), "route supplies the request for client identity");
});

await test("26  first valid agent → one mocked email with stable Resend key", async (t) => {
  const mail = mailSpy();
  const { result } = await runAgent(agentBase({ idempotencyKey: "first-valid-key" }), { mail });
  t.equal(result.status, 200, "http");
  t.equal(result.body.status, "accepted", "accepted");
  t.equal(mail.sent.length, 1, "one email");
  t.equal(
    mail.sent[0].idempotencyKey,
    consultEmailIdempotencyKey("first-valid-key"),
    "stable Resend idempotency key"
  );
  t.ok(!mail.sent[0].idempotencyKey.includes("first-valid-key"), "raw agent key is not the Resend key");
});

await test("27  same key + changed payload → idempotency_conflict, no email", async (t) => {
  const store = memoryIdempotencyStore();
  const limiter = memoryAgentRateLimiter();
  const mail = mailSpy();
  const first = await runAgent(agentBase({ idempotencyKey: "conflict-key", city: "Post Falls" }), {
    store,
    rateLimiter: limiter,
    mail,
    clientIpHash: "hash-conflict",
  });
  const second = await runAgent(
    agentBase({ idempotencyKey: "conflict-key", city: "Hayden", postalCode: "83835" }),
    { store, rateLimiter: limiter, mail, clientIpHash: "hash-conflict" }
  );
  t.equal(first.result.body.status, "accepted", "first accepted");
  t.equal(second.result.status, 409, "conflict http");
  t.equal(second.result.body.reason_code, "idempotency_conflict", "conflict reason");
  t.equal(mail.sent.length, 1, "no second email");
  t.ok(!("emailed" in second.result.body), "no internal flag leak");
});

await test("28  concurrent duplicate → request_in_progress, no second email", async (t) => {
  const store = memoryIdempotencyStore();
  const limiter = memoryAgentRateLimiter();
  const sent = [];
  let releaseSend;
  let sendStartedResolve;
  const sendStarted = new Promise((resolve) => {
    sendStartedResolve = resolve;
  });
  const sendEmail = async (message) => {
    sent.push(message);
    sendStartedResolve();
    await new Promise((resolve) => {
      releaseSend = resolve;
    });
    return {};
  };
  const body = agentBase({ idempotencyKey: "concurrent-key" });
  const deps = {
    sendEmail,
    idempotencyStore: store,
    rateLimiter: limiter,
    clientIpHash: "hash-concurrent",
    logFailure: () => {},
    testAllowAgentExecution: true,
  };
  const firstP = processConsultation(body, { ...deps, createId: () => "first-id" });
  await sendStarted;
  const second = await processConsultation(body, { ...deps, createId: () => "second-id" });
  t.equal(second.status, 409, "in-progress http");
  t.equal(second.body.reason_code, "request_in_progress", "in-progress reason");
  t.equal(sent.length, 1, "no second email while processing");
  releaseSend();
  const first = await firstP;
  t.equal(first.status, 200, "first completed");
  t.equal(first.body.request_id, "first-id", "first request_id");
  t.equal(sent.length, 1, "still one email");
});

await test("29  Redis-style claim is atomic and expires", async (t) => {
  let nowMs = 1_700_000_000_000;
  const store = memoryIdempotencyStore({ now: () => nowMs });
  const key = idempotencyStorageKey("expire-key");
  const first = await store.claim({
    storageKey: key,
    fingerprint: "fp-a",
    requestId: "r1",
    nowMs,
    ttlSeconds: CONSULT_IDEMPOTENCY_TTL_SECONDS,
  });
  const second = await store.claim({
    storageKey: key,
    fingerprint: "fp-a",
    requestId: "r2",
    nowMs,
    ttlSeconds: CONSULT_IDEMPOTENCY_TTL_SECONDS,
  });
  t.equal(first.kind, "claimed", "first claim wins");
  t.equal(second.kind, "in_progress", "second claim rejected");
  t.equal(CONSULT_IDEMPOTENCY_TTL_SECONDS, 24 * 60 * 60, "24h ttl");
  nowMs += CONSULT_IDEMPOTENCY_TTL_SECONDS * 1000 + 1;
  t.equal(await store.inspect(key), null, "record expires");
  const after = await store.claim({
    storageKey: key,
    fingerprint: "fp-a",
    requestId: "r3",
    nowMs,
    ttlSeconds: CONSULT_IDEMPOTENCY_TTL_SECONDS,
  });
  t.equal(after.kind, "claimed", "expired key can be claimed again");
});

await test("30  6th hourly → rate_limited; 21st daily → rate_limited", async (t) => {
  const hourlyLimiter = memoryAgentRateLimiter({ hourlyLimit: 5, dailyLimit: 100 });
  const mail = mailSpy();
  let last;
  for (let i = 0; i < 6; i++) {
    last = await runAgent(agentBase({ idempotencyKey: `hour-${i}` }), {
      rateLimiter: hourlyLimiter,
      mail,
      clientIpHash: "hash-hour",
    });
  }
  t.equal(last.result.status, 429, "6th hourly http");
  t.equal(last.result.body.reason_code, "rate_limited", "6th hourly reason");
  t.ok(last.result.headers?.["Retry-After"], "Retry-After present");
  t.ok(/do not retry automatically/i.test(last.result.body.next_step), "explicitly forbids automatic retry");
  t.ok(!/please retry|try again soon|retry later/i.test(last.result.body.next_step), "no retry encouragement");
  t.equal(mail.sent.length, 5, "limited attempt does not email");

  const dailyLimiter = memoryAgentRateLimiter({ hourlyLimit: 100, dailyLimit: 20 });
  const dailyMail = mailSpy();
  let dailyLast;
  for (let i = 0; i < 21; i++) {
    dailyLast = await runAgent(agentBase({ idempotencyKey: `day-${i}` }), {
      rateLimiter: dailyLimiter,
      mail: dailyMail,
      clientIpHash: "hash-day",
    });
  }
  t.equal(dailyLast.result.status, 429, "21st daily http");
  t.equal(dailyLast.result.body.reason_code, "rate_limited", "21st daily reason");
  t.equal(dailyMail.sent.length, 20, "daily limit stops email");
});

await test("31  different hashed IDs do not share limits", async (t) => {
  const limiter = memoryAgentRateLimiter({ hourlyLimit: 1, dailyLimit: 1 });
  const a = await runAgent(agentBase({ idempotencyKey: "id-a" }), {
    rateLimiter: limiter,
    clientIpHash: "hash-a",
  });
  const b = await runAgent(agentBase({ idempotencyKey: "id-b" }), {
    rateLimiter: limiter,
    clientIpHash: "hash-b",
  });
  t.equal(a.result.status, 200, "first identity allowed");
  t.equal(b.result.status, 200, "second identity allowed");
});

await test("32  IPv6 same /64 share limit; different /64 distinct; IPv4 normalized", async (t) => {
  const a = "2001:db8:abcd:1234:1111:2222:3333:4444";
  const b = "2001:db8:abcd:1234:aaaa:bbbb:cccc:dddd";
  const c = "2001:db8:abcd:1235::1";
  t.equal(normalizeClientIp(a), normalizeClientIp(b), "same /64");
  t.ok(normalizeClientIp(a) !== normalizeClientIp(c), "different /64");
  t.equal(hashClientIp(a), hashClientIp(b), "same hash for /64");
  t.ok(hashClientIp(a) !== hashClientIp(c), "distinct hash for other /64");
  t.equal(normalizeClientIp("192.168.001.010"), "192.168.1.10", "IPv4 leading zeros");
  t.equal(normalizeClientIp("::ffff:192.168.1.10"), "192.168.1.10", "IPv4-mapped IPv6");
  t.equal(hashClientIp("192.168.1.10"), hashNormalizedClientIp("192.168.1.10"), "hash matches");

  const limiter = memoryAgentRateLimiter({ hourlyLimit: 1, dailyLimit: 1 });
  const first = await runAgent(agentBase({ idempotencyKey: "v6-a" }), {
    rateLimiter: limiter,
    clientIpHash: hashClientIp(a),
  });
  const same = await runAgent(agentBase({ idempotencyKey: "v6-b" }), {
    rateLimiter: limiter,
    clientIpHash: hashClientIp(b),
  });
  const other = await runAgent(agentBase({ idempotencyKey: "v6-c" }), {
    rateLimiter: limiter,
    clientIpHash: hashClientIp(c),
  });
  t.equal(first.result.status, 200, "first /64 allowed");
  t.equal(same.result.status, 429, "same /64 limited");
  t.equal(other.result.status, 200, "other /64 allowed");
});

await test("33  raw IP never appears in Redis keys or logs", async (t) => {
  const ip = "203.0.113.77";
  const hashed = hashClientIp(ip);
  const storage = idempotencyStorageKey("agent-key-for-ip");
  t.ok(hashed && !hashed.includes(ip), "hash hides IPv4");
  t.ok(!storage.includes(ip), "idempotency key hides IP");
  t.ok(!storage.includes("agent-key-for-ip"), "raw agent key is hashed");
  const v6 = "2001:db8:abcd:1234:1111:2222:3333:4444";
  t.ok(!hashClientIp(v6).includes("2001"), "hash is digest, not hextets");
  const stages = [];
  await runAgent(agentBase(), {
    rateLimiter: null,
    clientIpHash: hashed,
    logInfra: (requestId, stage) => stages.push({ requestId, stage }),
  });
  t.ok(
    stages.every((entry) => !JSON.stringify(entry).includes(ip)),
    "infra logs have no raw IP"
  );
});

await test("34  missing Redis / timeout / connection failure → fail closed, no email", async (t) => {
  const missing = await runAgent(agentBase({ idempotencyKey: "no-redis" }), {
    rateLimiter: null,
    idempotencyStore: null,
  });
  t.equal(missing.result.status, 503, "missing controls http");
  t.equal(missing.result.body.reason_code, "infrastructure_unavailable", "missing controls reason");
  t.equal(missing.mail.sent.length, 0, "no email without controls");
  t.ok(missing.result.body.ok !== true, "not human fallback");

  const timeout = await runAgent(agentBase({ idempotencyKey: "timeout-rl" }), {
    rateLimiter: timeoutSuccessRateLimiter(),
  });
  t.equal(timeout.result.status, 503, "timeout http");
  t.equal(timeout.result.body.reason_code, "infrastructure_unavailable", "timeout is unavailable");
  t.equal(timeout.mail.sent.length, 0, "timeout does not email");

  const down = await runAgent(agentBase({ idempotencyKey: "rl-down" }), {
    rateLimiter: unavailableRateLimiter("rate-limit-error"),
  });
  t.equal(down.result.status, 503, "connection failure http");
  t.equal(down.mail.sent.length, 0, "connection failure does not email");

  const noIp = await processConsultation(agentBase({ idempotencyKey: "no-ip" }), {
    sendEmail: async () => ({}),
    idempotencyStore: memoryIdempotencyStore(),
    rateLimiter: memoryAgentRateLimiter(),
    logFailure: () => {},
    logInfraUnavailable: () => {},
    testAllowAgentExecution: true,
  });
  t.equal(noIp.status, 503, "missing client identity fail-closed");
  t.equal(noIp.body.reason_code, "infrastructure_unavailable", "missing identity reason");
});

await test("35  rejected validation does not create a long-lived idempotency record", async (t) => {
  const store = memoryIdempotencyStore();
  const { result } = await runAgent(agentBase({ phone: "", idempotencyKey: "invalid-no-store" }), {
    store,
  });
  t.equal(result.body.reason_code, "incomplete_request", "rejected");
  t.equal(
    await store.inspect(idempotencyStorageKey("invalid-no-store")),
    null,
    "no record for invalid payload"
  );
});

await test("36  production adapter source wires Redis and Resend idempotency", (t) => {
  const handler = readFileSync(join(ROOT, "lib/consult-handler.ts"), "utf8");
  const route = readFileSync(join(ROOT, "app/api/consultation/route.ts"), "utf8");
  t.ok(handler.includes("createUpstashAgentRateLimiter"), "production rate limiter");
  t.ok(handler.includes("createRedisIdempotencyStore"), "production idempotency store");
  t.ok(handler.includes("getConsultRedis"), "lazy redis");
  t.ok(handler.includes("timeout: 0") === false, "timeout 0 lives in rate-limit module");
  t.ok(route.includes("idempotencyKey"), "Resend typed idempotency");
  t.ok(route.includes("hashedClientIpFromRequest") === false, "route does not hash IP itself");
  const redis = readFileSync(join(ROOT, "lib/consult-redis.ts"), "utf8");
  t.ok(redis.includes("KV_REST_API_URL"), "uses marketplace URL name");
  t.ok(redis.includes("KV_REST_API_TOKEN"), "uses marketplace token name");
  const rl = readFileSync(join(ROOT, "lib/consult-rate-limit.ts"), "utf8");
  t.ok(rl.includes("timeout: 0"), "disables fail-open timeout");
  t.ok(rl.includes("analytics: false"), "analytics disabled");
  t.ok(rl.includes('reason === "timeout"'), "timeout success treated as unavailable");
});

await test("37  preview Redis verify skips locally and fails closed in preview without vars", (t) => {
  const script = readFileSync(join(ROOT, "scripts/verify-consult-redis-preview.mjs"), "utf8");
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  t.ok(script.includes('environment !== "preview"'), "preview gated");
  t.ok(script.includes("createUpstashAgentRateLimiter"), "real rate-limit adapter");
  t.ok(script.includes("createRedisIdempotencyStore"), "real idempotency adapter");
  t.ok(script.includes("getConsultRedis"), "real redis client");
  t.ok(script.includes("consult:verify:preview:v1"), "isolated preview namespace");
  t.ok(!/from ["']resend["']|emails\.send/i.test(script), "no Resend import");
  t.ok(!/fetch\(|http\.request/.test(script), "no HTTP client");
  t.ok(
    pkg.scripts.postbuild.includes("verify:consult-redis-preview"),
    "postbuild runs preview verify"
  );

  const skipEnv = { ...process.env };
  delete skipEnv.VERCEL_ENV;
  const skipped = spawnSync("npm", ["run", "verify:consult-redis-preview"], {
    cwd: ROOT,
    encoding: "utf8",
    env: skipEnv,
  });
  t.equal(skipped.status, 0, "local skip exit 0");
  t.ok(
    /REDIS_VERIFY=skipped environment=local/.test(`${skipped.stdout}\n${skipped.stderr}`),
    "local skip marker"
  );

  const previewEnv = { ...process.env, VERCEL_ENV: "preview" };
  delete previewEnv.KV_REST_API_URL;
  delete previewEnv.KV_REST_API_TOKEN;
  delete previewEnv.UPSTASH_REDIS_REST_URL;
  delete previewEnv.UPSTASH_REDIS_REST_TOKEN;
  const blocked = spawnSync("npm", ["run", "verify:consult-redis-preview"], {
    cwd: ROOT,
    encoding: "utf8",
    env: previewEnv,
  });
  t.equal(blocked.status, 1, "preview without vars fails the deploy");
  t.ok(
    /REDIS_VERIFY=failed environment=preview/.test(`${blocked.stdout}\n${blocked.stderr}`),
    "preview fail marker"
  );
  t.ok(
    /missing_env_names=KV_REST_API_URL,KV_REST_API_TOKEN/.test(`${blocked.stdout}\n${blocked.stderr}`),
    "names only, no values"
  );
});

console.log("Consultation request contract");
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
  isConsultAgentSubmissionEnabled()
    ? "\nPASS — protected agent consultation policy is proven locally; humans and Calendly stay unchanged; no consultation POST was made."
    : "\nPASS — agent policy is proven locally, production agent submission stays disabled, " +
        "partial markers cannot become human forms, and discovery says not-ready."
);
