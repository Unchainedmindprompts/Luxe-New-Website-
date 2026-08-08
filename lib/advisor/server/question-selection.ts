/**
 * Luxe Window Advisor — next-question selection. (Phase B)
 *
 * Deterministic. The model does not choose what to ask — it only phrases what
 * this file selected, and if the phrasing fails validation the canonical
 * wording is used instead. That is the whole point: an advisor that invents its
 * own intake questions has left the approved reasoning behind, and Phase A
 * already knows which questions could change an answer.
 *
 * Every candidate comes from `assessment.unresolvedQuestions`, which Phase A
 * populates only when a question's trigger matches *and* the dimensions it
 * would resolve are still unknown. Selection therefore cannot ask something
 * already answered — the suppression happens upstream, in the domain layer.
 *
 * One question per turn, highest value first.
 */
import type {
  AdvisorAssessment,
  Condition,
  DirectionId,
  EscalationRule,
  FactKey,
  PriorityId,
  QuestionRule,
} from "../types";

/** The synthesized ask that has no Phase A rule behind it. */
export const PRIORITY_ORDER_QUESTION_ID = "q-priority-order";

/**
 * Dimensions describing the physical opening rather than a preference.
 *
 * These score higher because a physical fact can remove a direction outright —
 * a splash zone excludes fabric, an obstruction rules out a swinging panel —
 * while a preference only reorders what was already eligible. Asking the
 * question that can *eliminate* options is worth more than the one that ranks
 * them.
 */
const PHYSICAL_KEYS: readonly FactKey[] = [
  "exteriorConditions",
  "openings",
  "access",
  "moistureExposure",
  "geometry",
];

/** Scoring weights. Stated as data so the ranking is auditable, not implied. */
const WEIGHTS = {
  perStrongCandidate: 6,
  perEligibleDirection: 2,
  physicalDimension: 4,
  unblocksEscalation: 3,
  priorityOrder: 100,
} as const;

/**
 * A question scoring below this could not change eligible directions, strong
 * candidates, tradeoffs or escalation enough to be worth a turn — which is the
 * brief's own test for whether to ask at all.
 */
const MATERIAL_THRESHOLD = 4;

/** Stop asking and give direction, however much is still unknown. */
export const MAX_QUESTIONS = 8;

/**
 * Questions whose answer Luxe is going to confirm at the opening anyway.
 *
 * This is the distinction that decides whether the advisor feels like an
 * adviser or an intake form: information needed to CHOOSE A DIRECTION is worth
 * a turn, information Luxe MUST VERIFY BEFORE FINAL SELECTION is not. Each
 * question below has a verification requirement that covers the same ground —
 * mounting substrate, wind, power, door clearance, stack-back, reach — so
 * asking it holds up a recommendation the homeowner could already act on,
 * while the unknown still travels with them as something the consultation
 * settles.
 *
 * They are not dropped. They stay askable, score below direction-determining
 * questions, and surface in `verificationRequirements` either way. What changes
 * is that they no longer block readiness once a direction exists.
 */
const VERIFICATION_CLASS_QUESTIONS: Readonly<Record<string, string>> = {
  "q-exterior-mounting": "verify-exterior-mounting",
  "q-wind-exposure": "verify-wind-exposure",
  "q-power-availability": "verify-power",
  "q-door-access-conflict": "verify-door-access",
  "q-stack-back": "verify-stack-back",
  "q-reach-and-operation": "verify-reach-and-operation",
};

/**
 * True when the assessment already carries the verification requirement that
 * covers this question. Checked against the live assessment rather than
 * assumed, so a question only becomes deferrable when Luxe is genuinely going
 * to look at it.
 */
export function isVerificationClass(questionId: string, verificationIds: ReadonlySet<string>): boolean {
  const covering = VERIFICATION_CLASS_QUESTIONS[questionId];
  return covering !== undefined && verificationIds.has(covering);
}

export interface ScoredQuestion {
  readonly id: string;
  readonly canonical: string;
  readonly materialTo: readonly DirectionId[];
  readonly score: number;
  readonly rationale: readonly string[];
  /** Luxe will confirm this at the opening, so it does not block a recommendation. */
  readonly verificationClass: boolean;
}

/** Collects every `{ unknown: K }` key tested anywhere in a condition tree. */
function collectUnknownKeys(condition: Condition, into: Set<FactKey>): void {
  if ("all" in condition) return condition.all.forEach((c) => collectUnknownKeys(c, into));
  if ("any" in condition) return condition.any.forEach((c) => collectUnknownKeys(c, into));
  if ("not" in condition) return collectUnknownKeys(condition.not, into);
  if ("unknown" in condition) into.add(condition.unknown);
}

/** Dimensions whose being unknown is itself an escalation trigger. */
export function escalationBlockingKeys(escalations: readonly EscalationRule[]): Set<FactKey> {
  const keys = new Set<FactKey>();
  for (const rule of escalations) collectUnknownKeys(rule.when, keys);
  return keys;
}

export interface SelectionInput {
  /**
   * Tier per unresolved question, from the counterfactual oracle. Supplied
   * rather than computed here so this module stays a pure ranking step and the
   * oracle stays independently testable.
   */
  readonly tiers?: ReadonlyMap<string, "must-ask-now" | "useful-but-deferrable" | "professional-verification" | "not-needed-now">;
  readonly assessment: AdvisorAssessment;
  readonly questionRules: readonly QuestionRule[];
  readonly escalations: readonly EscalationRule[];
  readonly unrankedConcerns: readonly PriorityId[];
  readonly askedQuestionIds: readonly string[];
  readonly turnCount: number;
}

export interface SelectionResult {
  readonly next: ScoredQuestion | null;
  readonly ranked: readonly ScoredQuestion[];
  readonly readyToRecommend: boolean;
  readonly readyReason:
    | "material-questions-remain"
    | "no-material-questions-remain"
    | "question-limit-reached"
    | "no-candidates-yet";
}

export function selectNextQuestion(input: SelectionInput): SelectionResult {
  const { assessment, questionRules, escalations, unrankedConcerns, askedQuestionIds, turnCount } = input;

  const strong = new Set<DirectionId>(assessment.strongCandidates.map((c) => c.id));
  const eligible = new Set<DirectionId>(assessment.eligibleDirections);
  const blocking = escalationBlockingKeys(escalations);
  const verificationIds = new Set(assessment.verificationRequirements.map((v) => v.id));
  const rulesById = new Map(questionRules.map((r) => [r.id, r]));
  const asked = new Set(askedQuestionIds);

  const ranked: ScoredQuestion[] = [];

  // The homeowner named several concerns without saying which leads. Almost
  // every Phase A rule is rank-aware (`withinTop`), so this outranks everything
  // — answering it can reshuffle the whole assessment.
  if (
    unrankedConcerns.length >= 2 &&
    !asked.has(PRIORITY_ORDER_QUESTION_ID) &&
    (!input.tiers || input.tiers.has(PRIORITY_ORDER_QUESTION_ID))
  ) {
    ranked.push({
      id: PRIORITY_ORDER_QUESTION_ID,
      canonical: `Of these, which matters most to you: ${unrankedConcerns.join(", ")}?`,
      materialTo: [],
      score: WEIGHTS.priorityOrder,
      rationale: ["priority order is unstated and nearly every rule is rank-aware"],
      verificationClass: false,
    });
  }

  for (const question of assessment.unresolvedQuestions) {
    if (asked.has(question.id)) continue;
    const rule = rulesById.get(question.id);
    const rationale: string[] = [];
    let score = 0;

    let strongHits = 0;
    let eligibleHits = 0;
    for (const direction of question.materialTo) {
      if (strong.has(direction)) strongHits++;
      else if (eligible.has(direction)) eligibleHits++;
    }
    if (strongHits) {
      score += strongHits * WEIGHTS.perStrongCandidate;
      rationale.push(`material to ${strongHits} strong candidate(s)`);
    }
    if (eligibleHits) {
      score += eligibleHits * WEIGHTS.perEligibleDirection;
      rationale.push(`material to ${eligibleHits} other eligible direction(s)`);
    }

    const resolves = rule?.askOnlyIfUnknown ?? [];
    if (resolves.some((k) => PHYSICAL_KEYS.includes(k))) {
      score += WEIGHTS.physicalDimension;
      rationale.push("resolves a physical condition that can exclude a direction");
    }
    if (resolves.some((k) => blocking.has(k))) {
      score += WEIGHTS.unblocksEscalation;
      rationale.push("its being unknown is itself an escalation trigger");
    }

    const verificationClass = isVerificationClass(question.id, verificationIds);
    if (verificationClass) {
      // Still askable, but never ahead of a question that could change the
      // answer. Luxe is going to look at this in the home regardless.
      score = Math.min(score, MATERIAL_THRESHOLD - 1);
      rationale.push("Luxe verifies this at the opening, so it does not gate a recommendation");
    }

    ranked.push({
      id: question.id,
      canonical: question.question,
      materialTo: question.materialTo,
      score,
      rationale,
      verificationClass,
    });
  }

  // Stable: score descending, then the order Phase A declared them, so the same
  // facts always produce the same question.
  ranked.sort((a, b) => b.score - a.score);

  // Only direction-determining questions gate a recommendation.
  //
  // When the counterfactual oracle has classified this turn, its verdict wins:
  // it measured, against the real business rules, whether any plausible answer
  // would change the direction. The weighted score below is the fallback for
  // callers that do not supply tiers, and the tie-breaker for ordering within
  // a tier.
  const tiers = input.tiers;
  const material = tiers
    ? ranked.filter((q) => tiers.get(q.id) === "must-ask-now")
    : ranked.filter((q) => !q.verificationClass && q.score >= MATERIAL_THRESHOLD);

  if (turnCount >= MAX_QUESTIONS) {
    return { next: null, ranked, readyToRecommend: true, readyReason: "question-limit-reached" };
  }
  if (!material.length) {
    // Nothing left worth asking.
    //
    // When the counterfactual oracle has ruled, its verdict is complete: it
    // measured every plausible answer and none of them moves the direction, so
    // there is no "least-bad question" left to fall back on. Whether the turn
    // can recommend, can only guide, or genuinely has nothing is decided
    // downstream from the assessment — asking anyway would be asking a question
    // we have already proven cannot change the answer.
    if (tiers || assessment.strongCandidates.length) {
      return { next: null, ranked, readyToRecommend: true, readyReason: "no-material-questions-remain" };
    }
    // No oracle supplied (legacy callers): without candidates, the least-bad
    // remaining question still beats an empty answer.
    return {
      next: ranked[0] ?? null,
      ranked,
      readyToRecommend: false,
      readyReason: "no-candidates-yet",
    };
  }

  return {
    next: material[0],
    ranked,
    readyToRecommend: false,
    readyReason: "material-questions-remain",
  };
}
