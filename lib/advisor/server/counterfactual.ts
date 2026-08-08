/**
 * Luxe Window Advisor — counterfactual question gating. (Phase B, step 4)
 *
 * Whether a question is worth a turn is decided by asking the Phase A engine,
 * not by weights someone tuned by hand.
 *
 * THE METHOD. For an unresolved question, enumerate a small set of plausible
 * answers from the existing vocabulary, apply each to the current facts, re-run
 * `assess()`, and compare the outcomes. If every plausible answer produces the
 * same direction, the answer cannot change what we would say — so asking it
 * costs the homeowner a turn and buys nothing. If the answers diverge, the
 * question is genuinely load-bearing and gets asked.
 *
 * This replaces guessing what matters with measuring it. The engine is a pure
 * function over facts, so it can be used as an oracle: the same business rules
 * that produce the recommendation also decide which questions are worth asking,
 * and they stay in exactly one place.
 *
 * NO PROVIDER CALL. Everything here is deterministic and local. The cost is a
 * few dozen pure-function evaluations per turn, bounded below.
 *
 * WHAT COUNTS AS "THE SAME DIRECTION" is deliberately narrow: the set of strong
 * candidates, the set of excluded directions, and the set of request conflicts.
 * Ordering, tradeoff wording and confidence are excluded on purpose — a
 * question that only reshuffles a ranking is useful, not urgent, and the
 * distinction between those two is the whole point of this file.
 */
import type { AdvisorAssessment, AdvisorKnowledge, PriorityId, ProjectFacts, QuestionRule } from "../types";

/** Ceilings, so a wide vocabulary can never turn one turn into a long stall. */
export const MAX_QUESTIONS_EVALUATED = 6;
export const MAX_ANSWERS_PER_QUESTION = 8;

export type QuestionTier =
  | "must-ask-now"
  | "useful-but-deferrable"
  | "professional-verification"
  | "not-needed-now";

export interface ClassifiedQuestion {
  readonly id: string;
  readonly canonical: string;
  readonly materialTo: readonly string[];
  readonly tier: QuestionTier;
  /** How many distinct directions the plausible answers produced. 1 means none. */
  readonly distinctOutcomes: number;
  readonly rationale: string;
}

/**
 * The comparable shape of an assessment.
 *
 * Sets, not sequences: two assessments that surface the same directions in a
 * different order are the same *answer*, and treating them as different would
 * make almost every question look material.
 */
function signature(assessment: AdvisorAssessment): string {
  const strong = assessment.strongCandidates.map((c) => c.id).slice().sort();
  const excluded = assessment.excludedDirections.map((c) => c.id).slice().sort();
  const conflicts = assessment.requestConflicts.map((c) => c.id).slice().sort();
  return JSON.stringify({ strong, excluded, conflicts });
}

/** A softer signature: what the homeowner would notice beyond the direction. */
function refinementSignature(assessment: AdvisorAssessment): string {
  const tradeoffs = assessment.tradeoffs.map((t) => t.id).slice().sort();
  const options = assessment.crossCuttingOptions.map((o) => o.id).slice().sort();
  const order = assessment.strongCandidates.map((c) => c.id);
  return JSON.stringify({ tradeoffs, options, order });
}

export interface AnswerSetInput {
  readonly field: string;
  readonly isList: boolean;
  readonly values: readonly string[];
}

/**
 * The plausible answers to try for one dimension.
 *
 * Scalars take their vocabulary minus `"unknown"` — answering "I don't know"
 * leaves us where we started, so it tells us nothing about whether the question
 * matters.
 *
 * Lists take "none" plus each member on its own. Enumerating combinations would
 * be exponential for no gain: if no single condition changes the direction, a
 * pair of them almost never will, and the pathological case is caught later
 * anyway once the homeowner actually says it.
 */
export function plausibleAnswers(input: AnswerSetInput): readonly (string | readonly string[])[] {
  const usable = input.values.filter((value) => value !== "unknown");
  if (!input.isList) return usable.slice(0, MAX_ANSWERS_PER_QUESTION);
  const answers: (string | readonly string[])[] = [[]];
  for (const value of usable.slice(0, MAX_ANSWERS_PER_QUESTION - 1)) answers.push([value]);
  return answers;
}

export interface ClassifyInput {
  readonly facts: ProjectFacts;
  readonly assessment: AdvisorAssessment;
  readonly knowledge: AdvisorKnowledge;
  readonly assess: (facts: ProjectFacts, knowledge: AdvisorKnowledge) => AdvisorAssessment;
  readonly questionRules: readonly QuestionRule[];
  readonly unrankedConcerns: readonly PriorityId[];
  readonly askedQuestionIds: readonly string[];
  /** Questions Luxe confirms on site — see `question-selection.ts`. */
  readonly isVerificationClass: (questionId: string) => boolean;
  readonly isListField: (field: string) => boolean;
  readonly allowedValues: (field: string) => readonly string[];
}

/** The synthesized priority-order ask, which has no Phase A rule behind it. */
export const PRIORITY_ORDER_QUESTION_ID = "q-priority-order";

/**
 * Classifies every unresolved question into one of the four tiers.
 *
 * Bounded: at most `MAX_QUESTIONS_EVALUATED` questions are put through the
 * oracle per turn, each with at most `MAX_ANSWERS_PER_QUESTION` answers per
 * dimension. Anything past the cap is treated as deferrable rather than
 * silently dropped — it stays askable, it just does not gate.
 */
export function classifyQuestions(input: ClassifyInput): readonly ClassifiedQuestion[] {
  const asked = new Set(input.askedQuestionIds);
  const rulesById = new Map(input.questionRules.map((rule) => [rule.id, rule]));
  const out: ClassifiedQuestion[] = [];
  let evaluated = 0;

  // Priority order first: it is synthesized rather than a Phase A rule, and it
  // is the question most often asked for no reason.
  if (input.unrankedConcerns.length >= 2 && !asked.has(PRIORITY_ORDER_QUESTION_ID)) {
    out.push(classifyPriorityOrder(input));
    evaluated++;
  }

  for (const question of input.assessment.unresolvedQuestions) {
    if (asked.has(question.id)) continue;

    if (input.isVerificationClass(question.id)) {
      out.push({
        id: question.id,
        canonical: question.question,
        materialTo: question.materialTo,
        tier: "professional-verification",
        distinctOutcomes: 1,
        rationale: "Luxe confirms this at the opening, so it does not gate guidance",
      });
      continue;
    }

    if (evaluated >= MAX_QUESTIONS_EVALUATED) {
      out.push({
        id: question.id,
        canonical: question.question,
        materialTo: question.materialTo,
        tier: "useful-but-deferrable",
        distinctOutcomes: 1,
        rationale: "beyond this turn's counterfactual budget; askable but not gating",
      });
      continue;
    }

    evaluated++;
    const rule = rulesById.get(question.id);
    const dimensions = rule?.askOnlyIfUnknown ?? [];
    const directions = new Set<string>();
    const refinements = new Set<string>();

    for (const field of dimensions) {
      const answers = plausibleAnswers({
        field,
        isList: input.isListField(field),
        values: input.allowedValues(field),
      });
      for (const answer of answers) {
        const hypothetical = { ...input.facts, [field]: answer } as ProjectFacts;
        const result = input.assess(hypothetical, input.knowledge);
        directions.add(signature(result));
        refinements.add(refinementSignature(result));
      }
    }

    const tier: QuestionTier =
      directions.size > 1
        ? "must-ask-now"
        : refinements.size > 1
          ? "useful-but-deferrable"
          : "not-needed-now";

    out.push({
      id: question.id,
      canonical: question.question,
      materialTo: question.materialTo,
      tier,
      distinctOutcomes: directions.size,
      rationale:
        directions.size > 1
          ? `plausible answers produce ${directions.size} different directions`
          : refinements.size > 1
            ? "answers refine tradeoffs or ordering but not the direction"
            : "every plausible answer leaves the direction unchanged",
    });
  }

  return out;
}

/**
 * The priority-order ask, measured rather than assumed.
 *
 * Each unranked concern is tried as the homeowner's top priority, because
 * Phase A's rules are rank-aware through `withinTop` and the first position is
 * what most of them test. If every candidate ranking yields the same direction,
 * the ranking does not matter and the question is not worth a turn — which is
 * the specific over-asking this step exists to stop.
 */
function classifyPriorityOrder(input: ClassifyInput): ClassifiedQuestion {
  const concerns = input.unrankedConcerns.slice(0, MAX_ANSWERS_PER_QUESTION);
  const existing = (input.facts.priorities ?? []) as PriorityId[];
  const directions = new Set<string>();
  const refinements = new Set<string>();

  for (const lead of concerns) {
    const ranking = [lead, ...existing.filter((p) => p !== lead), ...concerns.filter((c) => c !== lead)];
    const hypothetical = { ...input.facts, priorities: [...new Set(ranking)] } as ProjectFacts;
    const result = input.assess(hypothetical, input.knowledge);
    directions.add(signature(result));
    refinements.add(refinementSignature(result));
  }

  const tier: QuestionTier =
    directions.size > 1
      ? "must-ask-now"
      : refinements.size > 1
        ? "useful-but-deferrable"
        : "not-needed-now";

  return {
    id: PRIORITY_ORDER_QUESTION_ID,
    canonical: `Of these, which matters most to you: ${input.unrankedConcerns.join(", ")}?`,
    materialTo: [],
    tier,
    distinctOutcomes: directions.size,
    rationale:
      directions.size > 1
        ? `different rankings produce ${directions.size} different directions`
        : "every ranking leads to the same direction, so the order does not need settling",
  };
}
