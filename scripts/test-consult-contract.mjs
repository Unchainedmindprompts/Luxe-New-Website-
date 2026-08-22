#!/usr/bin/env node
/**
 * Deterministic coverage for the agent consultation-request contract.
 *
 * Local only. Mail and idempotency are mocked. Does not POST to production
 * or preview /api/consultation.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  consultationDiscoveryDocument,
  CONSULT_CONTRACT_VERSION,
  CONSULT_DRAPERY_CATEGORY_ID,
  CONSULT_NOT_READY_EXPECTATION,
  CONSULT_NOT_READY_HTTP_STATUS,
  CONSULT_NOT_READY_NEXT_STEP,
  consultCategoriesPublic,
  isConsultAgentSubmissionEnabled,
} from "../lib/capabilities.ts";
import {
  memoryIdempotencyStore,
  processConsultation,
  processProductionConsultation,
} from "../lib/consult-handler.ts";

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
  const ids = extras.ids ?? ["req-1", "req-2", "req-3"];
  let i = 0;
  const result = await processConsultation(body, {
    sendEmail: mail.sendEmail,
    idempotencyStore: extras.idempotencyStore === null ? undefined : store,
    createId: extras.createId ?? (() => ids[i++] ?? `req-${i}`),
    now: () => new Date("2026-08-22T18:00:00.000Z"),
    logFailure: () => {},
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
  const mail = mailSpy();
  let n = 0;
  const createId = () => `id-${++n}`;
  const body = agentBase({ idempotencyKey: "same-key-once" });
  const first = await processConsultation(body, {
    sendEmail: mail.sendEmail,
    idempotencyStore: store,
    createId,
    logFailure: () => {},
    testAllowAgentExecution: true,
  });
  const second = await processConsultation(body, {
    sendEmail: mail.sendEmail,
    idempotencyStore: store,
    createId,
    logFailure: () => {},
    testAllowAgentExecution: true,
  });
  t.equal(first.body.status, "accepted", "first accepted");
  t.equal(second.body.request_id, first.body.request_id, "same request_id");
  t.equal(second.body.status, first.body.status, "same status");
  t.equal(mail.sent.length, 1, "no duplicate email");
  t.ok(!("emailed" in second.body), "store flag is not part of the public contract");
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
  t.equal(doc.readiness, "not-ready", "not request-submission-ready");
  t.equal(doc.submissionEnabled, false, "submissionEnabled false");
  t.equal(isConsultAgentSubmissionEnabled(), false, "gate derived from contract");
  t.equal(doc.execution.availableForUnattendedAgentExecution, false, "endpoint documented but unavailable");
  t.equal(doc.doNotRetryAutomaticallyWhen, "capability_not_ready", "do not retry");
  t.ok(
    doc.readinessBlockers.includes("durable-idempotency-unavailable"),
    "idempotency blocker named"
  );
  t.ok(
    doc.readinessBlockers.includes("durable-rate-limit-unavailable"),
    "rate-limit blocker named"
  );
  t.ok(
    doc.response.reasonCodes.includes("capability_not_ready"),
    "not-ready reason published"
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
  t.equal(consult.submission_enabled, false, "agent.json does not imply submission is live");
  t.equal(consult.readiness, "not-ready", "agent.json readiness");
  t.ok(consult.url !== "https://www.luxewindowworks.com/book", "no longer /book");
  t.ok(
    /disabled/.test(consult.description.toLowerCase()) &&
      /disabled/.test(agent.primary_cta.description.toLowerCase()),
    "copy says submission is disabled"
  );
});

function assertNotHumanFallback(t, result, mail, label) {
  t.ok(result.body.ok !== true, `${label}: must not return human { ok: true }`);
  t.ok(result.body.status !== undefined, `${label}: agent contract status`);
  t.ok(result.body.request_id, `${label}: request_id`);
  t.equal(mail.sent.length, 0, `${label}: no email`);
}

await test("19  source agent without contractVersion → no email; never human fallback", async (t) => {
  const prod = await runProductionGate({
    source: "agent",
    name: "Alex Rivera",
    phone: "208-555-0148",
  });
  t.equal(prod.result.status, CONSULT_NOT_READY_HTTP_STATUS, "production http");
  t.equal(prod.result.body.reason_code, "capability_not_ready", "production reason");
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
  t.equal(prod.result.body.reason_code, "capability_not_ready", "production reason");
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
  t.equal(prod.result.body.reason_code, "capability_not_ready", "production reason");
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

await test("22  valid markers while not-ready → capability_not_ready; no email; no store", async (t) => {
  const store = memoryIdempotencyStore();
  const mail = mailSpy();
  const body = agentBase({ idempotencyKey: "must-not-store" });
  const { result } = await runProductionGate(body, { mail, store });
  t.equal(result.status, CONSULT_NOT_READY_HTTP_STATUS, "http 503");
  t.equal(result.body.status, "handoff_required", "existing status");
  t.equal(result.body.reason_code, "capability_not_ready", "reason");
  t.equal(result.body.next_step, CONSULT_NOT_READY_NEXT_STEP, "next_step");
  t.equal(result.body.response_expectation, CONSULT_NOT_READY_EXPECTATION, "expectation");
  t.equal(result.body.contract_version, "1.0", "contract version");
  t.ok(result.body.request_id, "request_id");
  t.ok(result.body.ok !== true, "not human ok");
  t.equal(mail.sent.length, 0, "no email");
  t.equal(await store.get("consult:v1:placeholder"), null, "store unused");
  // Production helper has no store param; prove handler also skips writes when disabled.
  const disabled = await processConsultation(body, {
    sendEmail: mail.sendEmail,
    idempotencyStore: store,
    createId: () => "gate-id",
    logFailure: () => {},
  });
  t.equal(disabled.body.reason_code, "capability_not_ready", "handler gate without override");
  t.equal(mail.sent.length, 0, "still no email");
  t.ok(!(await store.get("consult:v1:anything")), "no idempotency mutation");
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
  "\nPASS — agent policy is proven locally, production agent submission stays disabled, " +
    "partial markers cannot become human forms, and discovery says not-ready."
);
