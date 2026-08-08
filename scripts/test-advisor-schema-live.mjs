#!/usr/bin/env node
/**
 * Luxe Window Advisor — real-provider schema compatibility test. (Phase B)
 *
 * ⚠️  CALLS ANTHROPIC. Requires ANTHROPIC_API_KEY. Costs a few cents at most.
 * ⚠️  NOT part of `check`, `build`, `verify`, or any hook. Run it deliberately:
 *
 *       npm run test:advisor:schema
 *
 * WHY THIS EXISTS. The first Phase B implementation shipped a single
 * twenty-field extraction schema that the deterministic suite passed 20/20 —
 * because the provider was mocked, so no test ever showed the schema to
 * Anthropic. Against the real API it failed on every single call:
 *
 *     Schemas contains too many parameters with union types (20 parameters
 *     with type arrays or anyOf) ... limit: 16 parameters with unions
 *
 * and, once the unions were removed, `Schema is too complex.` Eight live
 * conversations produced eight identical failures and zero behavioural data.
 *
 * A mock cannot catch that class of bug, and no amount of additional mocked
 * tests would have. This test is the missing half: it proves the provider
 * actually accepts every schema we send, and it will fail loudly and
 * specifically if Anthropic tightens those constraints again.
 *
 * It checks the contract, not the reasoning. Behaviour is the deterministic
 * suite's job; quality is `eval:advisor:live`'s.
 */
import { pathToFileURL } from "node:url";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

// Convenience for local runs: load .env.local if the key is not already set.
// The file is gitignored; nothing is written and nothing is echoed.
if (!process.env.ANTHROPIC_API_KEY) {
  const envFile = join(ROOT, ".env.local");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "ANTHROPIC_API_KEY is not set.\n\n" +
      "This test makes real (cheap) calls to Anthropic to prove the extraction\n" +
      "schemas are actually accepted. Set the key and run it again:\n\n" +
      "  ANTHROPIC_API_KEY=sk-ant-... npm run test:advisor:schema\n"
  );
  process.exit(1);
}

const load = (p) => import(pathToFileURL(join(ROOT, p)).href);
const {
  buildDeltaSchema, describeVocabulary, validateUpdates, evidenceSupports, EXTRACTION_FIELDS,
} = await load("lib/advisor/server/extraction.ts");
const { extractionSystemPrompt } = await load("lib/advisor/server/prompts.ts");
const { ADVISOR_MODEL } = await load("lib/advisor/server/provider.ts");
const Anthropic = (await import("@anthropic-ai/sdk")).default;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const schema = buildDeltaSchema();
const system = extractionSystemPrompt(describeVocabulary(), "");

let failures = 0;
const check = (ok, label, detail) => {
  console.log(`  ${ok ? "pass" : "FAIL"}  ${label}`);
  if (detail) console.log(`          ${detail}`);
  if (!ok) failures++;
};

// ── the schema must be inside the limits that rejected the original design ──
const props = schema.properties.updates.items.properties;
const unions = Object.values(props).filter((p) => p.anyOf || Array.isArray(p.type)).length;
check(unions === 0, "delta schema has no union-typed parameters", `${EXTRACTION_FIELDS.length} fields in one enum, ${unions} unions`);
check(schema.additionalProperties === false && props !== undefined, "schema is closed");

// ── the real API must accept it and return usable updates ──────────────────
async function extract(message) {
  const response = await client.messages.create({
    model: ADVISOR_MODEL, max_tokens: 2048, system,
    output_config: { effort: "medium", format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: message }],
  });
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  return { raw: JSON.parse(text), text };
}

console.log(`\nReal-provider delta-extraction contract — model ${ADVISOR_MODEL}\n`);

try {
  const message = "We have huge west-facing windows looking over the lake and the room gets incredibly hot.";
  const { raw } = await extract(message);
  const { accepted, rejected } = validateUpdates(raw, message);
  check(accepted.length > 0, "real extraction succeeds and survives validation",
    accepted.map((u) => `${u.field}=${u.value} [${u.basis}]`).join(", "));
  check(accepted.every((u) => evidenceSupports(message, u.evidence)),
    "every accepted update's evidence is present in the message");
  const scale = accepted.find((u) => u.field === "geometry");
  check(scale === undefined || scale.basis === "inferred",
    "qualitative scale, when recorded, is marked as inference not statement",
    scale ? `geometry=${scale.value} <- "${scale.evidence}"` : "no geometry update this run");
  if (rejected.length) console.log(`          dropped: ${rejected.join("; ")}`);
} catch (error) {
  const apiMessage = /message":"([^"]+)"/.exec(error?.message ?? "")?.[1];
  check(false, "real extraction succeeds", apiMessage ?? error?.message);
}

// ── the spurious-field case that motivated the redesign ────────────────────
try {
  const message = "We do want privacy at night, yes.";
  const { raw } = await extract(message);
  const { accepted } = validateUpdates(raw, message);
  const fields = accepted.map((u) => u.field);
  check(!fields.includes("room"), "a message about privacy does not assert a room",
    fields.length ? `updated: ${fields.join(", ")}` : "no updates");
} catch (error) {
  check(false, "spurious-field probe ran", error?.message);
}

// ── unsupported evidence must be dropped, not repaired ─────────────────────
{
  const message = "We do want privacy at night, yes.";
  const fabricated = { updates: [
    { field: "room", value: "other", basis: "inferred", evidence: "the living room downstairs" },
    { field: "privacyNeed", value: "nighttime", basis: "stated", evidence: "privacy at night" },
  ] };
  const { accepted, rejected } = validateUpdates(fabricated, message);
  check(accepted.length === 1 && accepted[0].field === "privacyNeed",
    "an update quoting words that are not in the message is dropped",
    `kept ${accepted.map((u) => u.field).join(", ") || "nothing"}; dropped ${rejected.length}`);
}

// ── report ─────────────────────────────────────────────────────────────────
if (failures) {
  console.log(`\nFAIL — ${failures} check(s) failed. If the API message mentions union types or\ncomplexity, the constraints have tightened: narrow the schema. Do not work\naround this by loosening evidence validation.`);
  process.exit(1);
}
console.log("\nPASS — Anthropic accepts the delta schema, real extraction survives the closed-vocabulary\nand evidence checks, and unsupported evidence is dropped rather than repaired.");
