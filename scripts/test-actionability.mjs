#!/usr/bin/env node
/**
 * Invariant / actionability tests.
 *
 * Registry → agent.json → route. If an external agent cannot tell that
 * consultation is a request, which fields to send, or that a 2xx is not a
 * booking, this fails.
 *
 * Reads built /agent.json when present; always reads the source registries
 * and the consultation route. Node built-ins only.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const results = [];
let failures = 0;

function test(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => {
      if (!cond) problems.push(detail);
    },
    equal: (a, b, detail) => {
      if (a !== b) problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
    },
  };
  try {
    fn(t);
  } catch (error) {
    problems.push(`threw: ${error?.message ?? error}`);
  }
  if (problems.length) failures++;
  results.push({ name, problems });
}

const capabilitiesSrc = readFileSync(join(ROOT, "lib", "capabilities.ts"), "utf8");
const offeringsSrc = readFileSync(join(ROOT, "lib", "offerings.ts"), "utf8");
const routeSrc = readFileSync(join(ROOT, "app", "api", "consultation", "route.ts"), "utf8");
const discoverySrc = readFileSync(join(ROOT, "lib", "agent-discovery.ts"), "utf8");
const bookSrc = readFileSync(join(ROOT, "app", "book", "page.tsx"), "utf8");

function readBuiltAgent() {
  const p = join(ROOT, ".next", "server", "app", "agent.json.body");
  if (!existsSync(p) || !statSync(p).isFile()) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

const agent = readBuiltAgent();

test("1  registry refuses booking and keeps confirmation / no-direct-book", (t) => {
  t.ok(capabilitiesSrc.includes('actionType: "request"'), "actionType is not request");
  t.ok(capabilitiesSrc.includes("requiresHumanConfirmation: true"), "requiresHumanConfirmation missing");
  t.ok(capabilitiesSrc.includes("requiresHumanFollowUp: true"), "requiresHumanFollowUp missing");
  t.ok(capabilitiesSrc.includes("directBookingAvailable: false"), "directBookingAvailable missing");
  t.ok(capabilitiesSrc.includes("pricingPublic: false"), "pricingPublic missing");
  t.ok(capabilitiesSrc.includes("nameRequired: true"), "nameRequired missing");
  t.ok(capabilitiesSrc.includes('autonomousExecution: "not-ready"'), "autonomousExecution not-ready missing");
  t.ok(!/actionType:\s*"booking"/.test(capabilitiesSrc), "registry admits booking");
});

test("2  route hardening that already exists is still there", (t) => {
  t.ok(/const LIMITS = \{/.test(routeSrc), "LIMITS gone");
  t.ok(/body\._hp/.test(routeSrc), "honeypot gone");
  t.ok(/resend\.emails\.send/.test(routeSrc), "Resend send gone");
  t.ok(/crypto\.randomUUID\(\)/.test(routeSrc), "reference id gone");
  t.ok(/CONSULTATION_LEAD_SEND_FAILED/.test(routeSrc), "PII-free failure log marker gone");
  t.ok(/present: \{/.test(routeSrc) && /lengths: \{/.test(routeSrc), "failure logs no longer carry presence/length metadata");
  t.ok(!/console\.error\([^\n]*values\./.test(routeSrc), "route appears to log field values again");
  t.ok(/export function GET\(/.test(routeSrc), "GET handler missing");
  t.ok(/status: 405/.test(routeSrc), "GET is not 405");
  t.ok(!/calendly/i.test(routeSrc), "Calendly leaked into the consultation route");
});

test("3  /book still has the human scheduler; capability source does not", (t) => {
  t.ok(/calendly/i.test(bookSrc), "human /book lost Calendly — do not rip it off");
  t.ok(!/calendly/i.test(discoverySrc), "Calendly appeared in the published adapter");
});

test("4  forbidden manufacturer names stay out of adapters and registries", (t) => {
  for (const name of ["Hunter Douglas", "Vignette", "Graber", "Bali"]) {
    t.ok(!discoverySrc.includes(name), `adapter names ${name}`);
    t.ok(!capabilitiesSrc.includes(name), `capabilities names ${name}`);
    t.ok(!offeringsSrc.includes(name), `offerings names ${name}`);
  }
});

test("5  nine product Services and five manufacturer identities remain the only ones", (t) => {
  t.ok(offeringsSrc.includes("aluminum-shutters"), "aluminum-shutters offering lost");
  t.ok(offeringsSrc.includes('"roller-shades": { manufacturersEvidenced: [] }'), "roller-shades evidence bar moved");
  for (const id of [
    "https://www.normanwindowfashions.com/#brand",
    "https://www.altawindowfashions.com/#brand",
    "https://www.lafayetteinteriorfashions.com/#brand",
    "https://www.corradiusa.com/#organization",
    "https://two-usa.com/#organization",
  ]) {
    t.ok(offeringsSrc.includes(id) || readFileSync(join(ROOT, "lib", "brands.ts"), "utf8").includes(id), `manufacturer id missing: ${id}`);
  }
});

test("6  built agent.json is the action card an external agent needs", (t) => {
  t.ok(agent, "built /agent.json missing — run npm run build");
  if (!agent) return;
  t.equal(agent.capabilities?.length, 1, "capability count");
  const cap = agent.capabilities[0];
  t.equal(cap.actionType, "request", "actionType");
  t.equal(cap.requiresHumanConfirmation, true, "requiresHumanConfirmation");
  t.equal(cap.directBookingAvailable, false, "directBookingAvailable");
  t.equal(cap.pricingPublic, false, "pricingPublic");
  t.equal(cap.method, "POST", "method");
  t.ok(String(cap.endpoint).endsWith("/api/consultation"), "endpoint");
  t.ok(cap.input?.required?.includes("phone"), "required phone");
  t.ok(!cap.input?.required?.includes("email"), "email must stay optional");
  t.equal(cap.input?.nameRequired, true, "nameRequired");
  t.ok(cap.input?.identifiesCustomerBy?.includes("name"), "name identity");
  t.ok(/phone/.test(cap.input?.requiredSummary ?? "") && /name/.test(cap.input?.requiredSummary ?? ""), "requiredSummary");
  t.equal(cap.success?.means, "submission-acknowledged-by-endpoint", "success means");
  t.ok(cap.errors?.[400], "400 semantics");
  t.ok(cap.errors?.[405], "405 semantics");
  t.ok(cap.whatItIsNot?.includes("a booking"), "whatItIsNot booking");
  t.ok(!JSON.stringify(cap).toLowerCase().includes("calendly"), "Calendly in capability");
  t.ok(!JSON.stringify(agent).includes("Hayden Lake"), "Hayden Lake returned");
  t.ok(agent.manufacturers?.every((m) => m.available_online === false), "available_online false on every manufacturer");
  t.ok(agent.manufacturers?.some((m) => m.name === "Norman"), "Norman missing");
});

console.log("Actionability invariants");
console.log(`  scenarios: ${results.length}`);
console.log(`  passing:   ${results.length - failures}/${results.length}\n`);
for (const { name, problems } of results) {
  console.log(`  ${problems.length ? "FAIL" : "pass"}  ${name}`);
  for (const p of problems) console.log(`          - ${p}`);
}
if (failures) {
  console.log(`\nFAIL — ${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log("\nPASS — registry, route, and agent.json still describe a request an agent can submit with approval.");
