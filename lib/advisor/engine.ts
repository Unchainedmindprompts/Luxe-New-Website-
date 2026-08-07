/**
 * Luxe Window Advisor — deterministic reasoning engine. (Phase A)
 *
 * Turns project facts into structured reasoning data. It does not produce
 * prose, does not rank to a single winner, and does not involve a model.
 *
 * The pipeline is the one the approved brief specifies:
 *
 *   FACTS -> CONSTRAINTS -> ELIGIBLE DIRECTIONS -> STRONG CANDIDATES
 *         -> TRADEOFFS -> REQUIRED QUESTIONS -> ESCALATION CONDITIONS
 *
 * Deliberately *not*: facts -> one mathematically guaranteed product. Several
 * directions routinely tie, and that is the correct output — the boundaries are
 * deterministic, the judgment inside them is not.
 *
 * WHY KNOWLEDGE IS INJECTED RATHER THAN IMPORTED
 * ----------------------------------------------
 * `assess` takes its knowledge as an argument. That keeps the engine a pure
 * function of (facts, knowledge) — testable against alternate knowledge sets,
 * and impossible to accidentally couple to one snapshot of the business rules.
 *
 * It also has a practical consequence worth stating: because nothing here
 * imports a knowledge module at runtime, this file's only imports are
 * type-only. Node's TypeScript support erases those entirely, so the harness
 * can load these modules directly with no build step, no loader, no new
 * dependency, and no change to the shared tsconfig — while `tsc --noEmit` still
 * type-checks every knowledge record against the interfaces in `types.ts`.
 */
import type {
  AdvisorAssessment,
  AdvisorKnowledge,
  Condition,
  DirectionId,
  EscalationTrigger,
  FactKey,
  ListFactKey,
  ProductDirection,
  ProjectFacts,
  RankedDirection,
  ScalarFactKey,
  SurfacedConflict,
  SurfacedCrossCuttingOption,
  SurfacedTradeoff,
  UnresolvedQuestion,
  VerificationRequirement,
} from "./types";

const SCALAR_KEYS: readonly ScalarFactKey[] = [
  "room",
  "exposure",
  "solarHeat",
  "viewImportance",
  "privacyNeed",
  "roomDarkening",
  "windowUse",
  "operationFrequency",
  "budgetSensitivity",
  "moistureExposure",
  "motorizationInterest",
];

const LIST_KEYS: readonly ListFactKey[] = [
  "priorities",
  "aesthetic",
  "access",
  "geometry",
  "exteriorConditions",
  "openings",
  "requestedProducts",
  "requestedFeatures",
];

/**
 * Facts flattened for evaluation.
 *
 * `knownKeys` is the important one. A dimension is known when it was supplied
 * and is not the literal `"unknown"`; an empty list counts as known, because
 * "we asked and there are none" is a real answer and must not trigger the same
 * follow-up question a second time.
 */
export interface NormalisedFacts {
  readonly scalars: Readonly<Record<string, string | undefined>>;
  readonly flags: ReadonlySet<string>;
  readonly priorities: readonly string[];
  readonly requestedProducts: ReadonlySet<string>;
  readonly requestedFeatures: ReadonlySet<string>;
  readonly knownKeys: ReadonlySet<FactKey>;
}

export function normalise(facts: ProjectFacts): NormalisedFacts {
  const scalars: Record<string, string | undefined> = {};
  const knownKeys = new Set<FactKey>();

  for (const key of SCALAR_KEYS) {
    const value = facts[key];
    if (value !== undefined && value !== "unknown") {
      scalars[key] = value;
      knownKeys.add(key);
    }
  }

  for (const key of LIST_KEYS) {
    if (facts[key] !== undefined) knownKeys.add(key);
  }

  const flags = new Set<string>([
    ...(facts.aesthetic ?? []),
    ...(facts.access ?? []),
    ...(facts.geometry ?? []),
    ...(facts.exteriorConditions ?? []),
    ...(facts.openings ?? []),
  ]);

  return {
    scalars,
    flags,
    priorities: facts.priorities ?? [],
    requestedProducts: new Set<string>(facts.requestedProducts ?? []),
    requestedFeatures: new Set<string>(facts.requestedFeatures ?? []),
    knownKeys,
  };
}

/**
 * Evaluates one condition against normalised facts.
 *
 * `all: []` is true and `any: []` is false, following the usual vacuous-truth
 * convention. `{ all: [] }` is the idiom the rule files use for an always-on
 * rule, so that behaviour is load-bearing rather than incidental.
 */
export function evaluateCondition(condition: Condition, facts: NormalisedFacts): boolean {
  if ("has" in condition) return facts.flags.has(condition.has);

  if ("fact" in condition) {
    const value = facts.scalars[condition.fact];
    return value !== undefined && condition.is.includes(value);
  }

  if ("priority" in condition) {
    const index = facts.priorities.indexOf(condition.priority);
    if (index === -1) return false;
    return condition.withinTop === undefined ? true : index < condition.withinTop;
  }

  if ("requestedProduct" in condition) return facts.requestedProducts.has(condition.requestedProduct);
  if ("requestedFeature" in condition) return facts.requestedFeatures.has(condition.requestedFeature);
  if ("unknown" in condition) return !facts.knownKeys.has(condition.unknown);
  if ("all" in condition) return condition.all.every((c) => evaluateCondition(c, facts));
  if ("any" in condition) return condition.any.some((c) => evaluateCondition(c, facts));
  return !evaluateCondition(condition.not, facts);
}

/** Stable ordering: strongest first, then alphabetical so output never churns. */
function byWeightThenId(a: RankedDirection, b: RankedDirection): number {
  return b.weight - a.weight || a.id.localeCompare(b.id);
}

export function assess(facts: ProjectFacts, knowledge: AdvisorKnowledge): AdvisorAssessment {
  const n = normalise(facts);
  const matches = (condition: Condition): boolean => evaluateCondition(condition, n);

  const directionsById = new Map(
    knowledge.directions.map((d): [DirectionId, ProductDirection] => [d.id, d])
  );

  // ── constraints ───────────────────────────────────────────────────────────
  // A direction can be knocked out entirely, or kept available but stopped from
  // being surfaced as a strong candidate. Both are recorded with their reasons,
  // because "why not" is as much of the answer as "why".
  const excludeReasons = new Map<DirectionId, string[]>();
  const deprioritizeReasons = new Map<DirectionId, string[]>();

  for (const direction of knowledge.directions) {
    for (const contraindication of direction.contraindications) {
      if (!matches(contraindication.when)) continue;
      const bucket = contraindication.effect === "exclude" ? excludeReasons : deprioritizeReasons;
      const existing = bucket.get(direction.id);
      if (existing) existing.push(contraindication.reason);
      else bucket.set(direction.id, [contraindication.reason]);
    }
  }

  const eligibleDirections = knowledge.directions
    .filter((d) => !excludeReasons.has(d.id))
    .map((d) => d.id);

  // ── promotion ─────────────────────────────────────────────────────────────
  // Weight orders the list; it does not elect a winner. A direction that has
  // been deprioritized still collects its promotion rationales — they explain
  // why it was in the running — but it does not become a strong candidate.
  const promotionWeight = new Map<DirectionId, number>();
  const promotionReasons = new Map<DirectionId, string[]>();

  for (const rule of knowledge.promotions) {
    if (excludeReasons.has(rule.direction)) continue;
    if (!matches(rule.when)) continue;
    promotionWeight.set(rule.direction, (promotionWeight.get(rule.direction) ?? 0) + rule.weight);
    const existing = promotionReasons.get(rule.direction);
    if (existing) existing.push(rule.rationale);
    else promotionReasons.set(rule.direction, [rule.rationale]);
  }

  const rank = (id: DirectionId, reasons: readonly string[]): RankedDirection => {
    const direction = directionsById.get(id);
    return {
      id,
      label: direction?.label ?? id,
      kind: direction?.kind ?? "single",
      weight: promotionWeight.get(id) ?? 0,
      reasons,
    };
  };

  const strongCandidates: RankedDirection[] = [];
  for (const [id, reasons] of promotionReasons) {
    if (deprioritizeReasons.has(id)) continue;
    strongCandidates.push(rank(id, reasons));
  }
  strongCandidates.sort(byWeightThenId);

  const deprioritizedDirections: RankedDirection[] = [];
  for (const [id, reasons] of deprioritizeReasons) {
    if (excludeReasons.has(id)) continue;
    deprioritizedDirections.push(rank(id, [...reasons, ...(promotionReasons.get(id) ?? [])]));
  }
  deprioritizedDirections.sort(byWeightThenId);

  const excludedDirections: RankedDirection[] = [...excludeReasons]
    .map(([id, reasons]) => rank(id, reasons))
    .sort((a, b) => a.id.localeCompare(b.id));

  // ── the rest of the reasoning surface ─────────────────────────────────────

  const recognizedConditions = knowledge.recognition
    .filter((r) => matches(r.when))
    .map((r) => ({ id: r.id, label: r.label }));

  const crossCuttingOptions: SurfacedCrossCuttingOption[] = knowledge.crossCuttingOptions
    .filter((o) => matches(o.indicatedWhen))
    .map((o) => ({ id: o.id, label: o.label, cautions: o.cautions }));

  const tradeoffs: SurfacedTradeoff[] = knowledge.tradeoffs
    .filter((t) => matches(t.when))
    .map((t) => ({ id: t.id, label: t.label, poles: t.poles, note: t.note }));

  // A question survives only while it could still change something. Once every
  // dimension it would resolve is known, asking it again is the behaviour the
  // brief explicitly prohibits.
  const unresolvedQuestions: UnresolvedQuestion[] = knowledge.questions
    .filter((q) => matches(q.when) && !q.askOnlyIfUnknown.every((k) => n.knownKeys.has(k)))
    .map((q) => ({ id: q.id, question: q.question, materialTo: q.materialTo }));

  // Verification comes from two directions: conditions that demand it whatever
  // is recommended, and the standing requirements of whatever is still in play.
  const verificationById = new Map<string, VerificationRequirement>();
  for (const rule of knowledge.verifications) {
    if (matches(rule.when)) verificationById.set(rule.id, { id: rule.id, label: rule.label });
  }
  const inPlay = new Set<DirectionId>([
    ...strongCandidates.map((c) => c.id),
    ...deprioritizedDirections.map((c) => c.id),
  ]);
  for (const id of inPlay) {
    for (const triggerId of directionsById.get(id)?.verificationTriggers ?? []) {
      if (verificationById.has(triggerId)) continue;
      const rule = knowledge.verifications.find((v) => v.id === triggerId);
      if (rule) verificationById.set(rule.id, { id: rule.id, label: rule.label });
    }
  }
  const verificationRequirements = [...verificationById.values()].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  const escalationTriggers: EscalationTrigger[] = knowledge.escalations
    .filter((e) => matches(e.when))
    .map((e) => ({ id: e.id, label: e.label }));

  const requestConflicts: SurfacedConflict[] = knowledge.conflicts
    .filter((c) => matches(c.when))
    .map((c) => ({
      id: c.id,
      requested: c.requested,
      redirectTo: c.redirectTo,
      explanation: c.explanation,
    }));

  const applicableGuardrails = knowledge.guardrails.filter(
    (g) => g.scope === "always" || (g.when !== undefined && matches(g.when))
  );

  const unknownDimensions: FactKey[] = [...SCALAR_KEYS, ...LIST_KEYS].filter(
    (k) => !n.knownKeys.has(k)
  );

  return {
    recognizedConditions,
    eligibleDirections,
    strongCandidates,
    deprioritizedDirections,
    excludedDirections,
    crossCuttingOptions,
    tradeoffs,
    unresolvedQuestions,
    verificationRequirements,
    escalation: { required: escalationTriggers.length > 0, triggers: escalationTriggers },
    requestConflicts,
    applicableGuardrails,
    businessPolicies: knowledge.businessPolicies,
    unknownDimensions,
  };
}
