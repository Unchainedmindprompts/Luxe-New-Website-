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

export interface ScoredQuestion {
  readonly id: string;
  readonly canonical: string;
  readonly materialTo: readonly DirectionId[];
  readonly score: number;
  readonly rationale: readonly string[];
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
  const rulesById = new Map(questionRules.map((r) => [r.id, r]));
  const asked = new Set(askedQuestionIds);

  const ranked: ScoredQuestion[] = [];

  // The homeowner named several concerns without saying which leads. Almost
  // every Phase A rule is rank-aware (`withinTop`), so this outranks everything
  // — answering it can reshuffle the whole assessment.
  if (unrankedConcerns.length >= 2 && !asked.has(PRIORITY_ORDER_QUESTION_ID)) {
    ranked.push({
      id: PRIORITY_ORDER_QUESTION_ID,
      canonical: `Of these, which matters most to you: ${unrankedConcerns.join(", ")}?`,
      materialTo: [],
      score: WEIGHTS.priorityOrder,
      rationale: ["priority order is unstated and nearly every rule is rank-aware"],
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

    ranked.push({
      id: question.id,
      canonical: question.question,
      materialTo: question.materialTo,
      score,
      rationale,
    });
  }

  // Stable: score descending, then the order Phase A declared them, so the same
  // facts always produce the same question.
  ranked.sort((a, b) => b.score - a.score);

  const material = ranked.filter((q) => q.score >= MATERIAL_THRESHOLD);

  if (turnCount >= MAX_QUESTIONS) {
    return { next: null, ranked, readyToRecommend: true, readyReason: "question-limit-reached" };
  }
  if (!material.length) {
    // Nothing left worth asking. Ready only if there is actually something to
    // recommend — otherwise the advisor would hand back an empty answer, and
    // the least-bad remaining question is better than that.
    if (assessment.strongCandidates.length) {
      return { next: null, ranked, readyToRecommend: true, readyReason: "no-material-questions-remain" };
    }
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
