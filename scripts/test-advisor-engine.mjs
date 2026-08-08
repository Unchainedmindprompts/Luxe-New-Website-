#!/usr/bin/env node
/**
 * Luxe Window Advisor — behavioural harness. (Phase A)
 *
 * Three passes, in order, because a later one is meaningless if an earlier one
 * failed:
 *
 *   1. STRUCTURAL INTEGRITY — every cross-reference inside the knowledge layer
 *      resolves. A promotion rule naming a direction that does not exist, or a
 *      product listing a verification trigger with no rule behind it, is a
 *      silent hole: the engine would simply produce less output and every
 *      scenario that did not happen to assert on it would still pass.
 *
 *   2. SITE CATEGORY CROSS-CHECK — the advisor's declared product coverage
 *      still matches the categories the public site actually represents.
 *
 *   3. BEHAVIOURAL SCENARIOS — the 30 approved cases.
 *
 * Scenario assertions test required direction and prohibited behaviour, never
 * exact wording and never an exact ranking. Order within strongCandidates is
 * never asserted; membership is. That is deliberate — the brief is explicit
 * that the harness must not be overfitted so that only one product ordering can
 * pass.
 *
 * No model, no network, no API key, no build step. TypeScript knowledge modules
 * are imported directly using Node's built-in type stripping; they contain only
 * type-level imports of each other, so nothing has to be resolved or compiled.
 *
 * Node built-ins only. Exit 1 on failure.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const [
  { PRODUCT_DIRECTIONS, CROSS_CUTTING_OPTIONS, UNREPRESENTED_SITE_PRODUCTS },
  { PRIORITIES },
  rules,
  { GUARDRAILS },
  { assess },
] = await Promise.all([
  import("../lib/advisor/knowledge/products.ts"),
  import("../lib/advisor/knowledge/priorities.ts"),
  import("../lib/advisor/knowledge/rules.ts"),
  import("../lib/advisor/knowledge/guardrails.ts"),
  import("../lib/advisor/engine.ts"),
]);

const KNOWLEDGE = {
  directions: PRODUCT_DIRECTIONS,
  crossCuttingOptions: CROSS_CUTTING_OPTIONS,
  unrepresentedSiteProducts: UNREPRESENTED_SITE_PRODUCTS,
  priorities: PRIORITIES,
  recognition: rules.RECOGNITION_RULES,
  promotions: rules.PROMOTION_RULES,
  tradeoffs: rules.TRADEOFF_RULES,
  questions: rules.QUESTION_RULES,
  verifications: rules.VERIFICATION_RULES,
  escalations: rules.ESCALATION_RULES,
  conflicts: rules.CONFLICT_RULES,
  guardrails: GUARDRAILS,
  businessPolicies: rules.BUSINESS_POLICIES,
};

const failures = [];
const fail = (pass, detail) => failures.push({ pass, detail });

// ── id catalogues ───────────────────────────────────────────────────────────

const ids = (list) => new Set(list.map((x) => x.id));
const DIRECTION_IDS = ids(KNOWLEDGE.directions);
const SINGLE_DIRECTION_IDS = new Set(
  KNOWLEDGE.directions.filter((d) => d.kind === "single").map((d) => d.id)
);
const TRADEOFF_IDS = ids(KNOWLEDGE.tradeoffs);
const VERIFICATION_IDS = ids(KNOWLEDGE.verifications);
const RECOGNITION_IDS = ids(KNOWLEDGE.recognition);
const QUESTION_IDS = ids(KNOWLEDGE.questions);
const ESCALATION_IDS = ids(KNOWLEDGE.escalations);
const CONFLICT_IDS = ids(KNOWLEDGE.conflicts);
const GUARDRAIL_IDS = ids(KNOWLEDGE.guardrails);
const OPTION_IDS = ids(KNOWLEDGE.crossCuttingOptions);
const PRIORITY_IDS = ids(KNOWLEDGE.priorities);

// ── pass 1: structural integrity ────────────────────────────────────────────

function checkUniqueIds(label, list) {
  const seen = new Set();
  for (const item of list) {
    if (seen.has(item.id)) fail("structure", `${label}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}

for (const [label, list] of [
  ["directions", KNOWLEDGE.directions],
  ["crossCuttingOptions", KNOWLEDGE.crossCuttingOptions],
  ["priorities", KNOWLEDGE.priorities],
  ["recognition", KNOWLEDGE.recognition],
  ["promotions", KNOWLEDGE.promotions],
  ["tradeoffs", KNOWLEDGE.tradeoffs],
  ["questions", KNOWLEDGE.questions],
  ["verifications", KNOWLEDGE.verifications],
  ["escalations", KNOWLEDGE.escalations],
  ["conflicts", KNOWLEDGE.conflicts],
  ["guardrails", KNOWLEDGE.guardrails],
  ["businessPolicies", KNOWLEDGE.businessPolicies],
]) {
  checkUniqueIds(label, list);
}

const contraindicationIds = new Set();
for (const direction of KNOWLEDGE.directions) {
  for (const c of direction.contraindications) {
    if (contraindicationIds.has(c.id))
      fail("structure", `contraindication id "${c.id}" is used more than once`);
    contraindicationIds.add(c.id);
    if (!c.reason?.trim())
      fail("structure", `contraindication "${c.id}" has no reason`);
  }
  for (const t of direction.knownTradeoffs) {
    if (!TRADEOFF_IDS.has(t))
      fail("structure", `direction "${direction.id}" references unknown tradeoff "${t}"`);
  }
  for (const v of direction.verificationTriggers) {
    if (!VERIFICATION_IDS.has(v))
      fail("structure", `direction "${direction.id}" references unknown verification "${v}"`);
  }
  for (const p of direction.prioritiesServed) {
    if (!PRIORITY_IDS.has(p))
      fail("structure", `direction "${direction.id}" references unknown priority "${p}"`);
  }
  if (direction.kind === "layered") {
    if (!direction.components?.length)
      fail("structure", `layered direction "${direction.id}" declares no components`);
    for (const component of direction.components ?? []) {
      if (!SINGLE_DIRECTION_IDS.has(component))
        fail("structure", `layered direction "${direction.id}" references unknown component "${component}"`);
    }
  } else if (direction.components) {
    fail("structure", `single direction "${direction.id}" should not declare components`);
  }
  if (direction.variantOf !== undefined) {
    if (!SINGLE_DIRECTION_IDS.has(direction.variantOf))
      fail("structure", `direction "${direction.id}" is a variant of unknown direction "${direction.variantOf}"`);
    if (direction.variantOf === direction.id)
      fail("structure", `direction "${direction.id}" declares itself as its own variant parent`);
  }
  if (!direction.siteProductSlugs.length && !direction.siteCoverageNote.trim()) {
    fail(
      "structure",
      `direction "${direction.id}" claims no site product and gives no coverage note — an unexplained gap`
    );
  }
}

for (const rule of KNOWLEDGE.promotions) {
  if (!DIRECTION_IDS.has(rule.direction))
    fail("structure", `promotion "${rule.id}" targets unknown direction "${rule.direction}"`);
  if (![1, 2, 3].includes(rule.weight))
    fail("structure", `promotion "${rule.id}" has out-of-range weight ${rule.weight}`);
}

for (const rule of KNOWLEDGE.questions) {
  if (!rule.askOnlyIfUnknown.length)
    fail(
      "structure",
      `question "${rule.id}" lists no askOnlyIfUnknown keys, so it could be asked forever`
    );
  for (const d of rule.materialTo) {
    if (!DIRECTION_IDS.has(d))
      fail("structure", `question "${rule.id}" is material to unknown direction "${d}"`);
  }
}

for (const rule of KNOWLEDGE.conflicts) {
  for (const d of rule.redirectTo) {
    if (!DIRECTION_IDS.has(d))
      fail("structure", `conflict "${rule.id}" redirects to unknown direction "${d}"`);
  }
}

for (const g of KNOWLEDGE.guardrails) {
  if (g.scope === "conditional" && !g.when)
    fail("structure", `conditional guardrail "${g.id}" has no condition`);
  if (g.scope === "always" && g.when)
    fail("structure", `always-on guardrail "${g.id}" carries a condition that can never matter`);
  if (!g.permittedInstead?.trim())
    fail("structure", `guardrail "${g.id}" states a prohibition with no permitted alternative`);
  if (!g.source?.trim()) fail("structure", `guardrail "${g.id}" cites no source section`);
}

/** Walks a serialised condition tree and validates the ids it names. */
function walkCondition(condition, where) {
  if (!condition || typeof condition !== "object") {
    fail("structure", `${where}: condition is not an object`);
    return;
  }
  if ("all" in condition) return condition.all.forEach((c) => walkCondition(c, where));
  if ("any" in condition) return condition.any.forEach((c) => walkCondition(c, where));
  if ("not" in condition) return walkCondition(condition.not, where);
  if ("priority" in condition) {
    if (!PRIORITY_IDS.has(condition.priority))
      fail("structure", `${where}: unknown priority "${condition.priority}"`);
    if (condition.withinTop !== undefined && !(condition.withinTop > 0))
      fail("structure", `${where}: withinTop must be positive`);
    return;
  }
  if ("requestedProduct" in condition) {
    if (!SINGLE_DIRECTION_IDS.has(condition.requestedProduct))
      fail("structure", `${where}: unknown requested product "${condition.requestedProduct}"`);
    return;
  }
  if ("fact" in condition) {
    if (!Array.isArray(condition.is) || !condition.is.length)
      fail("structure", `${where}: fact condition on "${condition.fact}" has no values`);
    return;
  }
  if ("has" in condition || "requestedFeature" in condition || "unknown" in condition) return;
  fail("structure", `${where}: unrecognised condition shape ${JSON.stringify(condition)}`);
}

for (const [family, list, field] of [
  ["recognition", KNOWLEDGE.recognition, "when"],
  ["promotion", KNOWLEDGE.promotions, "when"],
  ["tradeoff", KNOWLEDGE.tradeoffs, "when"],
  ["question", KNOWLEDGE.questions, "when"],
  ["verification", KNOWLEDGE.verifications, "when"],
  ["escalation", KNOWLEDGE.escalations, "when"],
  ["conflict", KNOWLEDGE.conflicts, "when"],
]) {
  for (const rule of list) walkCondition(rule[field], `${family} "${rule.id}"`);
}
for (const g of KNOWLEDGE.guardrails) if (g.when) walkCondition(g.when, `guardrail "${g.id}"`);
for (const o of KNOWLEDGE.crossCuttingOptions) {
  walkCondition(o.indicatedWhen, `option "${o.id}"`);
  if (o.deprioritizedWhen) walkCondition(o.deprioritizedWhen, `option "${o.id}" (deprioritizedWhen)`);
  if (!o.siteProductSlugs.length && !o.siteCoverageNote.trim())
    fail("structure", `option "${o.id}" claims no site product and gives no coverage note`);
  if (!o.cautions.length)
    fail("structure", `option "${o.id}" carries no cautions`);
}
for (const d of KNOWLEDGE.directions)
  for (const c of d.contraindications)
    walkCondition(c.when, `contraindication "${c.id}"`);

// ── pass 2: site category cross-check ───────────────────────────────────────
//
// Deliberately not name matching. "Solar Shades" and "Exterior Solar Shades"
// differ by one word and are materially different products; "Blinds" is one
// page covering two advisor directions; drapery has no page at all. Any
// heuristic over display names would be wrong in all three cases.
//
// Instead every advisor record declares which site slugs it covers, and this
// pass enforces that the declarations and the site's own data agree in both
// directions. A new product category on the site fails until someone decides
// what the advisor should do with it; a category the advisor claims that the
// site has dropped fails too.

const [{ PRODUCTS }, productData] = await Promise.all([
  import("../lib/constants.ts"),
  import("../lib/product-data.ts"),
]);

const siteSlugs = new Set(PRODUCTS.map((p) => p.slug));

// `productPages` is keyed by slug and each entry repeats its own slug. Both are
// collected, and disagreement between them is itself reported — a page keyed
// under one slug while declaring another would break `/products/[slug]` in a way
// no name comparison would notice.
const detailSlugs = new Set();
for (const [key, page] of Object.entries(productData.productPages)) {
  detailSlugs.add(key);
  if (page.slug !== key)
    fail("cross-check", `lib/product-data.ts entry keyed "${key}" declares slug "${page.slug}"`);
}

for (const slug of detailSlugs) {
  if (!siteSlugs.has(slug))
    fail("cross-check", `lib/product-data.ts has slug "${slug}" that lib/constants.ts PRODUCTS does not`);
}
for (const slug of siteSlugs) {
  if (!detailSlugs.has(slug))
    fail("cross-check", `lib/constants.ts PRODUCTS has slug "${slug}" that lib/product-data.ts does not`);
}

const claimedSlugs = new Map();
const claim = (slug, by) => {
  if (!claimedSlugs.has(slug)) claimedSlugs.set(slug, []);
  claimedSlugs.get(slug).push(by);
};
for (const d of KNOWLEDGE.directions) for (const s of d.siteProductSlugs) claim(s, d.id);
for (const o of KNOWLEDGE.crossCuttingOptions) for (const s of o.siteProductSlugs) claim(s, o.id);
for (const u of KNOWLEDGE.unrepresentedSiteProducts) {
  claim(u.slug, "declared unrepresented");
  if (!u.reason?.trim())
    fail("cross-check", `unrepresented site product "${u.slug}" gives no reason`);
}

for (const slug of siteSlugs) {
  if (!claimedSlugs.has(slug))
    fail(
      "cross-check",
      `site product "${slug}" is not claimed by any advisor direction, cross-cutting option, or ` +
        `unrepresented declaration — the advisor has drifted from the categories Luxe represents`
    );
}
for (const [slug, claimants] of claimedSlugs) {
  if (!siteSlugs.has(slug))
    fail(
      "cross-check",
      `advisor knowledge claims site product "${slug}" (via ${claimants.join(", ")}) which no longer exists on the site`
    );
}

const declaredGaps = KNOWLEDGE.directions.filter((d) => !d.siteProductSlugs.length);

// Reported, never failed: a priority in the catalogue that no rule anywhere
// reasons about. The brief lists these priorities, so they belong in the
// vocabulary — but a priority with nothing behind it is knowledge Luxe has not
// supplied yet, and naming it is more useful than pretending coverage is
// complete. Failing on it would only pressure someone into inventing a rule.
const prioritiesInRules = new Set();
function collectPriorities(condition) {
  if (!condition || typeof condition !== "object") return;
  if ("all" in condition) return condition.all.forEach(collectPriorities);
  if ("any" in condition) return condition.any.forEach(collectPriorities);
  if ("not" in condition) return collectPriorities(condition.not);
  if ("priority" in condition) prioritiesInRules.add(condition.priority);
}
for (const list of [
  KNOWLEDGE.recognition,
  KNOWLEDGE.promotions,
  KNOWLEDGE.tradeoffs,
  KNOWLEDGE.questions,
  KNOWLEDGE.verifications,
  KNOWLEDGE.escalations,
  KNOWLEDGE.conflicts,
]) {
  for (const rule of list) collectPriorities(rule.when);
}
for (const g of KNOWLEDGE.guardrails) collectPriorities(g.when);
for (const o of KNOWLEDGE.crossCuttingOptions) collectPriorities(o.indicatedWhen);
for (const d of KNOWLEDGE.directions)
  for (const c of d.contraindications) collectPriorities(c.when);
const inertPriorities = [...PRIORITY_IDS].filter((p) => !prioritiesInRules.has(p));

// ── pass 3: behavioural scenarios ───────────────────────────────────────────

const scenarioFile = JSON.parse(
  readFileSync(join(ROOT, "scripts", "advisor-scenarios.json"), "utf8")
);
const SCENARIOS = scenarioFile.scenarios;

const questionsById = new Map(KNOWLEDGE.questions.map((q) => [q.id, q]));

/**
 * Assertion vocabulary. Each entry says which catalogue an asserted id must
 * exist in, and how to decide whether the assessment satisfies it.
 *
 * `mustAskOrResolve` is the one with real logic: it passes when the question is
 * still open OR when every dimension it would resolve is already known. That is
 * what lets a scenario say "this must be dealt with" without forcing the
 * advisor to ask something the homeowner already answered.
 *
 * The `mustNot*` entries exist because a conditional rule is only half tested
 * by the case that fires it. A conflict that surfaces whenever its product is
 * named — rather than only when the condition it describes is present — passes
 * every positive assertion while telling homeowners their request is a problem
 * when it is not. Asserting the silence is what pins the condition down.
 */
const ASSERTIONS = {
  mustRecognize: {
    catalogue: RECOGNITION_IDS,
    satisfied: (a, id) => a.recognizedConditions.some((x) => x.id === id),
  },
  mustIncludeCandidate: {
    catalogue: DIRECTION_IDS,
    satisfied: (a, id) => a.eligibleDirections.includes(id),
  },
  mustStronglyConsider: {
    catalogue: DIRECTION_IDS,
    satisfied: (a, id) => a.strongCandidates.some((x) => x.id === id),
  },
  mustExclude: {
    catalogue: DIRECTION_IDS,
    satisfied: (a, id) => a.excludedDirections.some((x) => x.id === id),
  },
  mustDeprioritize: {
    catalogue: DIRECTION_IDS,
    satisfied: (a, id) => a.deprioritizedDirections.some((x) => x.id === id),
  },
  mustIdentifyTradeoff: {
    catalogue: TRADEOFF_IDS,
    satisfied: (a, id) => a.tradeoffs.some((x) => x.id === id),
  },
  mustAskOrResolve: {
    catalogue: QUESTION_IDS,
    satisfied: (a, id, facts) => {
      if (a.unresolvedQuestions.some((x) => x.id === id)) return true;
      const rule = questionsById.get(id);
      return rule.askOnlyIfUnknown.every((k) => !a.unknownDimensions.includes(k)) && Boolean(facts);
    },
  },
  mustEscalateFor: {
    catalogue: ESCALATION_IDS,
    satisfied: (a, id) => a.escalation.triggers.some((x) => x.id === id),
  },
  mustApplyGuardrail: {
    catalogue: GUARDRAIL_IDS,
    satisfied: (a, id) => a.applicableGuardrails.some((x) => x.id === id),
  },
  mustSurfaceConflict: {
    catalogue: CONFLICT_IDS,
    satisfied: (a, id) => a.requestConflicts.some((x) => x.id === id),
  },
  mustNotSurfaceConflict: {
    catalogue: CONFLICT_IDS,
    satisfied: (a, id) => !a.requestConflicts.some((x) => x.id === id),
  },
  mustNotExclude: {
    catalogue: DIRECTION_IDS,
    satisfied: (a, id) => !a.excludedDirections.some((x) => x.id === id),
  },
  mustSurfaceOption: {
    catalogue: OPTION_IDS,
    satisfied: (a, id) => a.crossCuttingOptions.some((x) => x.id === id),
  },
  mustDeprioritizeOption: {
    catalogue: OPTION_IDS,
    satisfied: (a, id) => a.deprioritizedOptions.some((x) => x.id === id),
  },
  mustRequireVerification: {
    catalogue: VERIFICATION_IDS,
    satisfied: (a, id) => a.verificationRequirements.some((x) => x.id === id),
  },
};

const scenarioIds = new Set();
let assertionsRun = 0;
let scenariosPassed = 0;

for (const scenario of SCENARIOS) {
  if (scenarioIds.has(scenario.id))
    fail("scenario", `duplicate scenario id "${scenario.id}"`);
  scenarioIds.add(scenario.id);

  const assessment = assess(scenario.facts, KNOWLEDGE);
  const problems = [];

  for (const [kind, expected] of Object.entries(scenario.assertions)) {
    const spec = ASSERTIONS[kind];
    if (!spec) {
      problems.push(`unknown assertion type "${kind}"`);
      continue;
    }
    for (const id of expected) {
      assertionsRun++;
      // An assertion naming an id that does not exist is a harness defect, not
      // a behaviour failure, and is reported as such — otherwise a typo reads
      // as the engine misbehaving.
      if (!spec.catalogue.has(id)) {
        problems.push(`${kind}: "${id}" is not a known id`);
        continue;
      }
      if (!spec.satisfied(assessment, id, scenario.facts)) {
        problems.push(`${kind}: "${id}" not satisfied`);
      }
    }
  }

  if (problems.length) {
    fail("scenario", `${scenario.id} — ${scenario.title}\n${problems.map((p) => `        ${p}`).join("\n")}`);
  } else {
    scenariosPassed++;
  }
}

// ── report ──────────────────────────────────────────────────────────────────

console.log("Luxe Window Advisor — deterministic domain layer");
console.log(`  product directions:          ${KNOWLEDGE.directions.length} (${SINGLE_DIRECTION_IDS.size} single, ${KNOWLEDGE.directions.length - SINGLE_DIRECTION_IDS.size} layered)`);
console.log(`  cross-cutting options:       ${KNOWLEDGE.crossCuttingOptions.length}`);
console.log(`  priorities:                  ${KNOWLEDGE.priorities.length}`);
console.log(
  `  rules:                       ${KNOWLEDGE.recognition.length} recognition, ${KNOWLEDGE.promotions.length} promotion, ` +
    `${KNOWLEDGE.tradeoffs.length} tradeoff, ${KNOWLEDGE.questions.length} question,`
);
console.log(
  `                               ${KNOWLEDGE.verifications.length} verification, ${KNOWLEDGE.escalations.length} escalation, ` +
    `${KNOWLEDGE.conflicts.length} conflict`
);
console.log(
  `  contraindications:           ${KNOWLEDGE.directions.reduce((n, d) => n + d.contraindications.length, 0)}`
);
console.log(
  `  guardrails:                  ${KNOWLEDGE.guardrails.length} (${KNOWLEDGE.guardrails.filter((g) => g.scope === "always").length} always-on, ` +
    `${KNOWLEDGE.guardrails.filter((g) => g.scope === "conditional").length} conditional)`
);
console.log(`  business policies:           ${KNOWLEDGE.businessPolicies.length}`);

console.log(`\n  site product categories:     ${siteSlugs.size}`);
console.log(`  claimed by advisor:          ${[...claimedSlugs].filter(([s]) => siteSlugs.has(s)).length}`);
if (KNOWLEDGE.unrepresentedSiteProducts.length) {
  console.log(`  declared unrepresented:      ${KNOWLEDGE.unrepresentedSiteProducts.map((u) => u.slug).join(", ")}`);
}
if (declaredGaps.length) {
  console.log(`  directions with no site page: ${declaredGaps.map((d) => d.id).join(", ")}`);
}
if (inertPriorities.length) {
  console.log(
    `\n  priorities with no rule behind them (reported, not a failure — Luxe knowledge gap):`
  );
  console.log(`    ${inertPriorities.join(", ")}`);
}

console.log(`\n  scenarios:                   ${SCENARIOS.length}`);
console.log(`  assertions:                  ${assertionsRun}`);
console.log(`  scenarios passing:           ${scenariosPassed}/${SCENARIOS.length}`);

if (failures.length) {
  const grouped = new Map();
  for (const f of failures) {
    if (!grouped.has(f.pass)) grouped.set(f.pass, []);
    grouped.get(f.pass).push(f.detail);
  }
  for (const [pass, details] of grouped) {
    console.log(`\n  [${pass}] ${details.length} failure(s)`);
    for (const d of details) console.log(`    - ${d}`);
  }
  console.log(`\nFAIL — ${failures.length} failure(s).`);
  process.exit(1);
}

console.log(
  "\nPASS — knowledge cross-references resolve, advisor coverage matches the site's product " +
    "categories, and every approved scenario behaves as required."
);
