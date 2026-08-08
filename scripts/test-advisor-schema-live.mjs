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
const { EXTRACTION_GROUPS, buildGroupSchema, describeGroupVocabulary, validateFacts, assertGroupsPartitionFields } =
  await load("lib/advisor/server/extraction.ts");
const { ADVISOR_MODEL } = await load("lib/advisor/server/provider.ts");
const Anthropic = (await import("@anthropic-ai/sdk")).default;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** One short message per group that should yield at least one field. */
const PROBES = {
  intent: "Keeping the view matters more to us than anything else.",
  physical: "It's the living room and the windows face west.",
  product: "We were thinking roller shades, and we'd like them motorized.",
};

let failures = 0;
const rows = [];

// ── structural check first — free, and it guards the merge contract ─────────
const partition = assertGroupsPartitionFields();
if (partition.missing.length || partition.duplicated.length) {
  failures++;
  console.log("FAIL  extraction groups are not a clean partition of the vocabulary");
  if (partition.missing.length) console.log(`        unextractable fields: ${partition.missing.join(", ")}`);
  if (partition.duplicated.length) console.log(`        duplicated fields:   ${partition.duplicated.join(", ")}`);
} else {
  console.log("pass  extraction groups partition the vocabulary exactly once each");
}

// ── each schema must be accepted by the real API ────────────────────────────
for (const group of EXTRACTION_GROUPS) {
  const schema = buildGroupSchema(group);
  const fieldCount = Object.keys(schema.properties).length;
  const enumMembers = Object.values(schema.properties).reduce(
    (total, property) => total + (property.enum?.length ?? property.items?.enum?.length ?? 0),
    0
  );
  const unions = Object.values(schema.properties).filter(
    (property) => property.anyOf || Array.isArray(property.type)
  ).length;

  let status = "";
  let extracted = "";
  try {
    const response = await client.messages.create({
      model: ADVISOR_MODEL,
      max_tokens: 1024,
      system:
        `Extract only what the homeowner stated about ${group.subject}. ` +
        `Omit any field they did not state.\n\n${describeGroupVocabulary(group)}`,
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      messages: [{ role: "user", content: PROBES[group.id] }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    // The response must parse AND survive our own closed-vocabulary validator —
    // schema acceptance alone would not prove the two agree.
    const parsed = JSON.parse(text);
    const validated = validateFacts(parsed);
    if (validated.dropped.length) {
      throw new Error(`validator rejected model output: ${validated.dropped.join("; ")}`);
    }
    extracted = JSON.stringify({ ...validated.facts, ...(validated.unrankedConcerns.length ? { unrankedConcerns: validated.unrankedConcerns } : {}) });
    status = "pass";
  } catch (error) {
    failures++;
    status = "FAIL";
    const apiMessage = /message":"([^"]+)"/.exec(error?.message ?? "")?.[1];
    extracted = apiMessage ?? error?.message ?? String(error);
  }

  rows.push({ id: group.id, fieldCount, enumMembers, unions, status, extracted });
}

// ── report ──────────────────────────────────────────────────────────────────
console.log(`\nReal-provider schema compatibility — model ${ADVISOR_MODEL}`);
console.log(`  known API limits: max 16 union-typed parameters, bounded overall complexity\n`);

for (const row of rows) {
  console.log(
    `  ${row.status}  ${row.id.padEnd(9)} ${String(row.fieldCount).padStart(2)} fields, ` +
      `${String(row.enumMembers).padStart(3)} enum members, ${row.unions} unions`
  );
  console.log(`          ${row.status === "pass" ? "extracted: " : "error: "}${row.extracted}`);
}

if (failures) {
  console.log(
    `\nFAIL — ${failures} check(s) failed. Anthropic did not accept a schema, or the\n` +
      "model's output did not survive our validator. If the API message mentions\n" +
      "union types or complexity, the constraints have tightened: narrow the groups\n" +
      "in EXTRACTION_GROUPS further. Do not work around this by loosening validation."
  );
  process.exit(1);
}
console.log("\nPASS — every extraction schema is accepted by the real API and every response survives the closed-vocabulary validator.");
