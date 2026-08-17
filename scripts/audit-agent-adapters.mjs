#!/usr/bin/env node
/**
 * Adapter honesty sweep.
 *
 * The discovery documents are supposed to be projections of
 * lib/offerings.ts and lib/capabilities.ts. This fails the build if they
 * start saying something those files do not: a booking, a ready machine
 * endpoint, a manufacturer the offering registry has not evidenced, or
 * Ask Luxe coming back as a capability.
 *
 * Reads the static route bodies `next build` emitted. Source presence is
 * not publication — the same reason the schema sweep reads HTML.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APP_DIR = join(ROOT, ".next", "server", "app");

const failures = [];
const fail = (msg) => failures.push(msg);

if (!existsSync(APP_DIR)) {
  console.error("No build output at .next/server/app — run `next build` first.");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readBuilt(routePath) {
  const rel = routePath.replace(/^\//, "");
  const candidates = [
    join(APP_DIR, `${rel}.body`),
    join(APP_DIR, rel, "route.js.body"),
    join(APP_DIR, `${rel}.html`),
  ];
  for (const file of candidates) {
    if (existsSync(file) && statSync(file).isFile()) {
      return { file, text: readFileSync(file, "utf8") };
    }
  }
  const files = walk(APP_DIR);
  const needle = rel.replace(/\//g, "/") + ".body";
  const hit = files.find((f) => f.endsWith(needle) || f.endsWith(`${rel}.body`));
  if (hit) return { file: hit, text: readFileSync(hit, "utf8") };
  return null;
}

function readJson(routePath) {
  const built = readBuilt(routePath);
  if (!built) {
    fail(`missing built document ${routePath}`);
    return null;
  }
  try {
    return { ...built, data: JSON.parse(built.text) };
  } catch (err) {
    fail(`${routePath} is not JSON: ${err.message}`);
    return null;
  }
}

// ── static files that used to lie must stay gone ───────────────────────────

if (existsSync(join(ROOT, "public", "agent.json"))) {
  fail("public/agent.json is back — the stale hand-written card would shadow the adapter");
}
if (existsSync(join(ROOT, "public", "llms.txt"))) {
  fail("public/llms.txt is back — the stale hand-written file would shadow the adapter");
}

// ── truth files still present and unwidened ────────────────────────────────

const capabilitiesSrc = readFileSync(join(ROOT, "lib", "capabilities.ts"), "utf8");
const offeringsSrc = readFileSync(join(ROOT, "lib", "offerings.ts"), "utf8");
const routeSrc = readFileSync(join(ROOT, "app", "api", "consultation", "route.ts"), "utf8");
const discoverySrc = readFileSync(join(ROOT, "lib", "agent-discovery.ts"), "utf8");

for (const [label, src, needle] of [
  ["capabilities.ts", capabilitiesSrc, 'actionType: "request"'],
  ["capabilities.ts", capabilitiesSrc, 'outcome: "consultation-requested"'],
  ["capabilities.ts", capabilitiesSrc, "requiresHumanFollowUp: true"],
  ["capabilities.ts", capabilitiesSrc, "requiresHumanConfirmation: true"],
  ["capabilities.ts", capabilitiesSrc, "directBookingAvailable: false"],
  ["capabilities.ts", capabilitiesSrc, "pricingPublic: false"],
  ["capabilities.ts", capabilitiesSrc, "nameRequired: true"],
  ["capabilities.ts", capabilitiesSrc, 'autonomousExecution: "not-ready"'],
  ["capabilities.ts", capabilitiesSrc, 'successMeans: "submission-acknowledged-by-endpoint"'],
  ["offerings.ts", offeringsSrc, "aluminum-shutters"],
  ["offerings.ts", offeringsSrc, '"roller-shades": { manufacturersEvidenced: [] }'],
]) {
  if (!src.includes(needle)) fail(`${label} no longer contains ${JSON.stringify(needle)}`);
}

// ── LIMITS duplication still matches the route ─────────────────────────────

const limitPairs = [
  ["name", 100],
  ["firstName", 100],
  ["lastName", 100],
  ["phone", 30],
  ["email", 200],
  ["address", 200],
  ["city", 100],
  ["message", 2000],
  ["needs", 2000],
  ["contactMethod", 50],
  ["problem", 100],
  ["source", 50],
];
for (const [field, max] of limitPairs) {
  const routeRe = new RegExp(`${field}:\\s*${max}\\b`);
  const adapterRe = new RegExp(`${field}:\\s*${max}\\b`);
  if (!routeRe.test(routeSrc)) fail(`consultation route LIMITS.${field} is no longer ${max}`);
  if (!adapterRe.test(discoverySrc)) fail(`CONSULTATION_FIELD_LIMITS.${field} is no longer ${max}`);
}

// ── built documents ────────────────────────────────────────────────────────

const agent = readJson("/agent.json");
const discovery = readJson("/discovery.json");
const offerings = readJson("/offerings.json");
const capabilities = readJson("/capabilities.json");
const openapi = readJson("/openapi.json");
const llms = readBuilt("/llms.txt");

if (!llms) fail("missing built document /llms.txt");

const nextConfig = readFileSync(join(ROOT, "next.config.mjs"), "utf8");
if (!nextConfig.includes('source: "/.well-known/agent.json"') || !nextConfig.includes('destination: "/agent.json"')) {
  fail("next.config.mjs lost the /.well-known/agent.json rewrite");
}
if (!nextConfig.includes('source: "/.well-known/discovery.json"') || !nextConfig.includes('destination: "/discovery.json"')) {
  fail("next.config.mjs lost the /.well-known/discovery.json rewrite");
}

if (agent) {
  const card = agent.data;
  if (card.a2a !== false) fail("agent.json a2a is not false");
  if (card.mcp !== false) fail("agent.json mcp is not false");
  if (card.jsonrpc !== false) fail("agent.json jsonrpc is not false");
  if (card.protocol !== "luxe-discovery") fail("agent.json is not a luxe-discovery document");
  if (!Array.isArray(card.capabilities) || card.capabilities.length !== 1) {
    fail("agent.json must publish exactly one capability");
  } else {
    const cap = card.capabilities[0];
    if (cap.id !== "request-in-home-consultation") fail(`unexpected capability id ${cap.id}`);
    if (cap.actionType !== "request") fail("agent.json capability is not a request");
    if (cap.outcome !== "consultation-requested") fail("agent.json outcome is not consultation-requested");
    if (cap.requiresHumanFollowUp !== true) fail("agent.json dropped requiresHumanFollowUp");
    if (cap.requiresHumanConfirmation !== true) fail("agent.json dropped requiresHumanConfirmation");
    if (cap.directBookingAvailable !== false) fail("agent.json does not say directBookingAvailable: false");
    if (cap.pricingPublic !== false) fail("agent.json does not say pricingPublic: false");
    if (cap.method !== "POST") fail("agent.json lost method POST");
    if (!String(cap.endpoint || "").endsWith("/api/consultation")) fail("agent.json lost the consultation endpoint");
    if (!cap.input?.required?.includes("phone")) fail("agent.json lost required phone");
    if (cap.input?.required?.includes("email")) fail("agent.json made email required");
    if (cap.input?.nameRequired !== true) fail("agent.json lost nameRequired");
    if (!/phone/.test(cap.input?.requiredSummary ?? "") || !/name/.test(cap.input?.requiredSummary ?? "")) {
      fail("agent.json lost requiredSummary");
    }
    if (cap.success?.means !== "submission-acknowledged-by-endpoint") fail("agent.json success means drifted");
    if (!cap.errors?.[400] || !cap.errors?.[405]) fail("agent.json lost error semantics");
    if (JSON.stringify(cap).toLowerCase().includes("calendly")) fail("Calendly appeared on the agent capability");
    const surface = cap.executionSurfaces?.[0];
    if (!surface) fail("agent.json missing execution surface");
    else {
      if (surface.autonomousExecution !== "not-ready") fail("agent.json claims autonomous execution is ready");
      if (surface.successMeans !== "submission-acknowledged-by-endpoint") {
        fail("agent.json over-claims what a 2xx means");
      }
      if (surface.endpoint !== "/api/consultation") fail("agent.json lost the consultation surface");
    }
  }
  if (card.primary_cta?.label !== "Request a Free Consultation") {
    fail(`agent.json primary CTA is ${JSON.stringify(card.primary_cta?.label)}, not a request`);
  }
  const blob = JSON.stringify(card);
  for (const phrase of ["Book a Free Consultation", "Direct online ordering"]) {
    if (blob.includes(phrase)) fail(`agent.json contains forbidden phrase: ${phrase}`);
  }
  if (!card.not_offered?.includes("Ask Luxe / conversational advisor")) {
    fail("agent.json does not list Ask Luxe as not offered");
  }
  if (card.capabilities?.some((cap) => /ask luxe/i.test(JSON.stringify(cap)))) {
    fail("agent.json lists Ask Luxe as a capability");
  }
  if (!card.not_offered?.includes("online checkout")) {
    fail("agent.json does not list online checkout as not offered");
  }
  if (JSON.stringify(card).includes("Hayden Lake")) fail("agent.json lists Hayden Lake");
  for (const name of ["Hunter Douglas", "Vignette", "Graber", "Bali"]) {
    if (JSON.stringify(card).includes(name)) fail(`agent.json names ${name}`);
  }
  if (!card.manufacturers?.every((m) => m.available_online === false)) {
    fail("agent.json is missing available_online: false on a manufacturer");
  }
  if (!card.manufacturers?.some((m) => m.name === "Norman" && m.available_online === false)) {
    fail("Norman is missing available_online: false");
  }

  const roller = card.offerings?.find((o) => o.id === "roller-shades");
  const roman = card.offerings?.find((o) => o.id === "roman-shades");
  const solar = card.offerings?.find((o) => o.id === "solar-shades");
  const shutters = card.offerings?.find((o) => o.id === "shutters");
  if (!roller || roller.manufacturersEvidenced?.length !== 0) {
    fail("agent.json assigns manufacturers to roller-shades, which offerings.ts leaves unestablished");
  }
  if (!roman || roman.manufacturersEvidenced?.length !== 0) {
    fail("agent.json assigns manufacturers to roman-shades");
  }
  if (!solar || solar.manufacturersEvidenced?.length !== 0) {
    fail("agent.json assigns manufacturers to solar-shades");
  }
  if (!shutters?.exclusive) fail("agent.json dropped shutter exclusivity");
  if (!shutters?.manufacturersEvidenced?.includes("Norman")) {
    fail("agent.json lost Norman on shutters");
  }
}

if (capabilities) {
  const cap = capabilities.data.capabilities?.[0];
  if (!cap) fail("capabilities.json has no capability");
  else {
    if (cap.actionType !== "request") fail("capabilities.json actionType is not request");
    if (cap.outcome !== "consultation-requested") fail("capabilities.json outcome drifted");
    if (cap.requiresHumanFollowUp !== true) fail("capabilities.json requiresHumanFollowUp drifted");
    if (cap.requiresHumanConfirmation !== true) fail("capabilities.json requiresHumanConfirmation drifted");
    if (cap.directBookingAvailable !== false) fail("capabilities.json directBookingAvailable drifted");
    if (cap.pricingPublic !== false) fail("capabilities.json pricingPublic drifted");
    if (cap.executionSurfaces?.[0]?.autonomousExecution !== "not-ready") {
      fail("capabilities.json autonomousExecution drifted");
    }
    if (!cap.input?.required?.includes("phone")) fail("capabilities.json lost required phone");
    if (cap.input?.required?.includes("email")) fail("capabilities.json made email required");
    if (cap.input?.nameRequired !== true) fail("capabilities.json lost nameRequired");
  }
}

if (offerings) {
  const ids = offerings.data.offerings?.map((o) => o.id) ?? [];
  for (const id of [
    "blinds",
    "cellular-shades",
    "banded-shades",
    "motorization",
    "shutters",
    "exterior-solar-shades",
    "aluminum-shutters",
    "solar-shades",
    "roman-shades",
    "roller-shades",
  ]) {
    if (!ids.includes(id)) fail(`offerings.json missing ${id}`);
  }
  const aluminum = offerings.data.offerings.find((o) => o.id === "aluminum-shutters");
  if (aluminum?.service !== null) fail("offerings.json invented a Service for aluminum-shutters");
  if (aluminum?.page !== null) fail("offerings.json invented a product page for aluminum-shutters");
}

if (openapi) {
  const spec = openapi.data;
  if (spec["x-action-type"] !== "request") fail("OpenAPI x-action-type is not request");
  if (spec["x-autonomous-execution"] !== "not-ready") fail("OpenAPI claims autonomous execution is ready");
  if (spec["x-outcome"] !== "consultation-requested") fail("OpenAPI outcome drifted");
  if (spec["x-requires-human-follow-up"] !== true) fail("OpenAPI dropped human follow-up");
  if (spec["x-requires-human-confirmation"] !== true) fail("OpenAPI dropped human confirmation");
  if (spec["x-direct-booking-available"] !== false) fail("OpenAPI dropped directBookingAvailable false");
  if (!spec.paths?.["/api/consultation"]?.post) fail("OpenAPI lost POST /api/consultation");
  if (!spec.paths?.["/api/consultation"]?.get) fail("OpenAPI lost GET 405 documentation");
  const schema = spec.paths["/api/consultation"].post.requestBody.content["application/json"].schema;
  const required = schema.required;
  if (!required?.includes("phone")) fail("OpenAPI lost required phone");
  if (required?.includes("email")) fail("OpenAPI made email required");
  if (!Array.isArray(schema.anyOf) || schema.anyOf.length < 1) {
    fail("OpenAPI lost name anyOf (name / firstName / lastName)");
  }
  if (schema.additionalProperties === false) {
    fail("OpenAPI additionalProperties: false — the route ignores unknown keys");
  }
  const ok200 = spec.paths["/api/consultation"].post.responses?.["200"]?.description ?? "";
  if (/honeypot|_hp/i.test(ok200)) {
    fail("OpenAPI 200 description leaks honeypot / _hp");
  }
  const desc = JSON.stringify(spec);
  if (/reserv(e|ation)|booking confirmed|appointment confirmed/i.test(desc)) {
    fail("OpenAPI describes a booking or reservation");
  }
}

if (discovery) {
  if (discovery.data.a2a !== false) fail("discovery.json a2a is not false");
  if (discovery.data.mcp !== false) fail("discovery.json mcp is not false");
  if (!discovery.data.documents?.agent?.endsWith("/agent.json")) {
    fail("discovery.json lost the agent document");
  }
}

if (llms) {
  const text = llms.text;
  if (/Book a Free Consultation/.test(text)) fail("llms.txt still says Book a Free Consultation");
  if (/Ask Luxe/.test(text) && !/Not offered:[\s\S]*Ask Luxe/.test(text)) {
    fail("llms.txt mentions Ask Luxe as something other than not-offered");
  }
  if (!/actionType:\s*request/.test(text)) fail("llms.txt lost actionType: request");
  if (!/nameRequired:\s*true/.test(text)) fail("llms.txt lost nameRequired: true");
  if (!/autonomousExecution:\s*not-ready/.test(text)) fail("llms.txt lost autonomousExecution: not-ready");
  if (!/manufacturer relationship unestablished/.test(text)) {
    fail("llms.txt no longer shows unestablished manufacturer relationships");
  }
  if (/Hunter Douglas/.test(text)) fail("llms.txt lists Hunter Douglas, which is not a carried manufacturer");
}

// ── no A2A card pretending to be a server ──────────────────────────────────

if (existsSync(join(ROOT, "app", ".well-known", "agent-card.json"))) {
  fail("app/.well-known/agent-card.json exists — that path implies an A2A server this site does not have");
}

if (existsSync(join(ROOT, "app", "api", "advisor"))) {
  fail("Ask Luxe advisor API is back");
}

// ── report ─────────────────────────────────────────────────────────────────

if (failures.length) {
  console.error("Agent adapter audit FAILED\n");
  for (const item of failures) console.error(`  - ${item}`);
  process.exit(1);
}

console.log("Agent adapter audit PASS");
console.log("  /agent.json built; /.well-known/* rewrites intact");
console.log("  capability remains request / consultation-requested / not-ready");
console.log("  unestablished manufacturers stay unpublished");
console.log("  Ask Luxe, checkout, and A2A execution stay not-offered");
