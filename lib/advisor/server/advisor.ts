/**
 * Luxe Window Advisor — turn orchestration. (Phase B)
 *
 *   homeowner language
 *     -> LLM structured extraction        (closed schema, validated)
 *     -> deterministic Luxe engine        (Phase A — the source of truth)
 *     -> deterministic question selection / readiness
 *     -> LLM phrasing                     (constrained to the assessment)
 *     -> deterministic guardrail validation
 *     -> typed response
 *
 * The model appears twice and owns neither end. It converts prose into a
 * vocabulary it cannot widen, and converts a finished assessment into prose it
 * cannot add to. Everything between those two steps is Phase A.
 *
 * WHEN THE MODEL AND THE ENGINE DISAGREE, THE ENGINE WINS — and it wins
 * mechanically rather than by instruction: the model is never asked which
 * product to recommend, so there is no disagreement to arbitrate. The only
 * thing it can get wrong is wording, and wording is validated and replaceable.
 *
 * DEPENDENCIES ARE INJECTED for the same reason Phase A injects knowledge: it
 * keeps every module a pure function of its inputs, lets the `.mjs` harness
 * exercise the full pipeline against a mock provider with no build step, and
 * makes the provider a one-file swap.
 */
import type {
  AdvisorAssessment,
  AdvisorKnowledge,
  DirectionId,
  Guardrail,
  PriorityId,
  ProjectFacts,
} from "../types";
import type { ExtractionGroup } from "./extraction";
import type {
  AdvisorProvider,
  AdvisorResponse,
  AssessmentSummary,
  ConsultationCtaIntent,
  ConversationState,
} from "./types";

/** Hard ceiling on advisor turns in one conversation. Also an abuse control. */
export const MAX_TURNS = 12;

/** Cap on any single generated string, before it is sanitised. */
const MAX_QUESTION_CHARS = 400;
const MAX_RECOMMENDATION_CHARS = 1400;

/** Model output budget. Small on purpose — long answers are not the goal. */
const QUESTION_TOKENS = 150;
const RECOMMENDATION_TOKENS = 400;

export interface AdvisorDeps {
  readonly provider: AdvisorProvider;
  readonly knowledge: AdvisorKnowledge;
  readonly assess: (facts: ProjectFacts, knowledge: AdvisorKnowledge) => AdvisorAssessment;
  readonly validateFacts: (raw: unknown) => {
    facts: ProjectFacts;
    unrankedConcerns: readonly PriorityId[];
    dropped: readonly string[];
  };
  readonly mergeFacts: (prior: ProjectFacts, incoming: ProjectFacts) => ProjectFacts;
  /**
   * Extraction is several narrow calls rather than one wide one, because the
   * provider rejects a twenty-field schema outright. These hooks describe one
   * group at a time; `groupsForTurn` decides which are worth running.
   */
  readonly extractionGroups: readonly ExtractionGroup[];
  readonly buildGroupSchema: (group: ExtractionGroup) => Record<string, unknown>;
  readonly describeGroupVocabulary: (group: ExtractionGroup) => string;
  readonly groupsForTurn: (
    facts: ProjectFacts,
    turnCount: number,
    groups: readonly ExtractionGroup[]
  ) => readonly ExtractionGroup[];
  readonly mergeExtractionGroups: (
    results: readonly { groupId: string; validated: { facts: ProjectFacts; unrankedConcerns: readonly PriorityId[]; dropped: readonly string[] } }[]
  ) => {
    facts: ProjectFacts;
    unrankedConcerns: readonly PriorityId[];
    dropped: readonly string[];
    conflicts: readonly string[];
  };
  readonly selectNextQuestion: (input: {
    assessment: AdvisorAssessment;
    questionRules: AdvisorKnowledge["questions"];
    escalations: AdvisorKnowledge["escalations"];
    unrankedConcerns: readonly PriorityId[];
    askedQuestionIds: readonly string[];
    turnCount: number;
  }) => {
    next: { id: string; canonical: string; materialTo: readonly DirectionId[] } | null;
    readyToRecommend: boolean;
  };
  readonly validateGeneratedText: (
    text: string,
    context: { allowedProductLabels: readonly string[]; allowedBrands: readonly string[] }
  ) => readonly { guardrailId: string; evidence: string }[];
  readonly sanitizeForOutput: (text: string, maxLength: number) => string;
  readonly prompts: {
    extractionSystemPrompt: (subject: string, vocabulary: string, knownFacts: ProjectFacts) => string;
    questionSystemPrompt: (guardrails: readonly Guardrail[]) => string;
    recommendationSystemPrompt: (
      assessment: AdvisorAssessment,
      guardrails: readonly Guardrail[]
    ) => string;
    phrasingUserMessage: (parts: Record<string, string | undefined>) => string;
  };
  /** Brand names Luxe genuinely carries, for invented-product detection. */
  readonly allowedBrands: readonly string[];
  readonly signal?: AbortSignal;
}

/** Structural provider-failure check — no runtime import of the adapter. */
function providerFailureCode(error: unknown): "provider-unavailable" | "provider-timeout" | null {
  if (typeof error !== "object" || error === null) return null;
  const code = (error as { code?: unknown }).code;
  return code === "provider-unavailable" || code === "provider-timeout" ? code : null;
}

function summarise(assessment: AdvisorAssessment): AssessmentSummary {
  const rank = (list: AdvisorAssessment["strongCandidates"]) =>
    list.map((c) => ({ id: c.id, label: c.label, reasons: c.reasons }));
  return {
    recognizedConditions: assessment.recognizedConditions.map((c) => ({ id: c.id, label: c.label })),
    strongCandidates: rank(assessment.strongCandidates),
    alternatives: rank(assessment.deprioritizedDirections),
    excluded: rank(assessment.excludedDirections),
    recommendedOptions: assessment.crossCuttingOptions.map((o) => ({ id: o.id, label: o.label })),
    optionsToAvoid: assessment.deprioritizedOptions.map((o) => ({ id: o.id, label: o.label })),
    tradeoffs: assessment.tradeoffs.map((t) => ({ id: t.id, label: t.label, note: t.note })),
    verificationRequirements: assessment.verificationRequirements.map((v) => ({ id: v.id, label: v.label })),
    escalation: {
      required: assessment.escalation.required,
      triggers: assessment.escalation.triggers.map((t) => ({ id: t.id, label: t.label })),
    },
    requestConflicts: assessment.requestConflicts.map((c) => ({ id: c.id, explanation: c.explanation })),
    guardrailIdsInForce: assessment.applicableGuardrails.map((g) => g.id),
    unknownDimensions: assessment.unknownDimensions,
  };
}

/**
 * Whether offering the consultation is the right move now, and why.
 * Phase B states the intent only — Calendly, rendering and analytics are later
 * phases and are deliberately untouched here.
 */
function consultationIntent(
  assessment: AdvisorAssessment,
  ready: boolean
): ConsultationCtaIntent {
  const reasons: ConsultationCtaIntent["reasons"][number][] = [];
  if (ready) reasons.push("recommendation-ready");

  const verifications = new Set(assessment.verificationRequirements.map((v) => v.id));
  // `verify-dimensions` is always present, so it says nothing about this
  // project — anything beyond it is a real physical unknown.
  if ([...verifications].some((v) => v !== "verify-dimensions")) {
    reasons.push("requires-physical-verification");
  }
  if (assessment.escalation.triggers.length >= 3) reasons.push("high-complexity-project");
  if (verifications.has("verify-exterior-mounting") || verifications.has("verify-power")) {
    reasons.push("exterior-mounting-or-power-conditions");
  }
  if (assessment.requestConflicts.length) reasons.push("request-conflict-needs-discussion");

  return { recommended: reasons.length > 0, reasons };
}

/** Deterministic recommendation text, used when the model's is unusable. */
function fallbackRecommendation(assessment: AdvisorAssessment): string {
  const best = assessment.strongCandidates[0];
  if (!best) {
    return "There is enough here for our team to work with. Luxe Window Works will evaluate the opening in the room and confirm the right direction with you.";
  }
  const alt = assessment.strongCandidates[1] ?? assessment.deprioritizedDirections[0];
  const tradeoff = assessment.tradeoffs[0];
  const parts = [
    `Based on what you have described, ${best.label.toLowerCase()} is the direction we would look at first — ${best.reasons[0] ?? "it fits what you have told us matters most"}`,
  ];
  if (alt) parts.push(`${alt.label} is the alternative worth weighing.`);
  if (tradeoff) parts.push(`The tradeoff to be aware of: ${tradeoff.note}`);
  parts.push("Luxe Window Works will confirm the details at the opening before anything is selected.");
  return parts.join(" ").replace(/\s+/g, " ");
}

export interface AdvisorTurnInput {
  readonly message: string;
  readonly state: ConversationState;
}

export function createAdvisor(deps: AdvisorDeps) {
  /**
   * Runs one phrasing call, validates it, retries once on violation, and falls
   * back to deterministic text if the retry also violates. The violating text
   * is never returned and never logged.
   */
  async function phraseSafely(
    system: string,
    userMessage: string,
    maxTokens: number,
    maxChars: number,
    allowedProductLabels: readonly string[],
    fallback: string,
    interventions: string[]
  ): Promise<string> {
    for (let attempt = 0; attempt < 2; attempt++) {
      let raw: string;
      try {
        raw = await deps.provider.phrase({ system, userMessage, maxTokens, signal: deps.signal });
      } catch (error) {
        if (providerFailureCode(error)) return fallback;
        throw error;
      }
      const text = deps.sanitizeForOutput(raw, maxChars);
      if (!text) continue;
      const violations = deps.validateGeneratedText(text, {
        allowedProductLabels,
        allowedBrands: deps.allowedBrands,
      });
      if (!violations.length) return text;
      for (const v of violations) {
        if (!interventions.includes(v.guardrailId)) interventions.push(v.guardrailId);
      }
    }
    return fallback;
  }

  async function runTurn(input: AdvisorTurnInput): Promise<AdvisorResponse> {
    const interventions: string[] = [];
    const priorState = input.state ?? {};

    // The client's facts are re-validated exactly like the model's. Anything
    // outside the Phase A vocabulary is dropped rather than corrected, so a
    // crafted payload can only assert facts the engine already understands.
    const priorValidated = deps.validateFacts(priorState.facts ?? {});
    const turnCount = Math.max(0, Math.min(MAX_TURNS, Math.trunc(priorState.turnCount ?? 0)));
    const askedQuestionIds = (priorState.askedQuestionIds ?? []).filter(
      (id) => typeof id === "string"
    );

    // ── 1. extraction — one narrow call per relevant group ────────────────
    //
    // Groups run concurrently: they are independent, and three sequential
    // round trips would triple the homeowner's wait for no benefit.
    //
    // A group that fails takes the whole turn down rather than silently
    // producing a partial fact set. A recommendation built on two thirds of
    // what someone said, with no signal that the third went missing, is worse
    // than saying the advisor is unavailable.
    const groups = deps.groupsForTurn(priorValidated.facts, turnCount, deps.extractionGroups);
    let combined: {
      facts: ProjectFacts;
      unrankedConcerns: readonly PriorityId[];
      conflicts: readonly string[];
    };
    try {
      const settled = await Promise.all(
        groups.map(async (group) => {
          const raw = await deps.provider.extract({
            system: deps.prompts.extractionSystemPrompt(
              group.subject,
              deps.describeGroupVocabulary(group),
              priorValidated.facts
            ),
            userMessage: input.message,
            schema: deps.buildGroupSchema(group),
            signal: deps.signal,
          });
          return { groupId: group.id, validated: deps.validateFacts(raw) };
        })
      );
      combined = deps.mergeExtractionGroups(settled);
    } catch (error) {
      const code = providerFailureCode(error);
      return unavailable(code ?? "extraction-failed", priorState);
    }
    const extracted = combined.facts;
    const unrankedConcerns = combined.unrankedConcerns;

    const facts = deps.mergeFacts(priorValidated.facts, extracted);
    // A ranking supersedes the open question it answers.
    const rankedNow = new Set(facts.priorities ?? []);
    const carriedConcerns = [
      ...new Set([...(priorState.unrankedConcerns ?? []), ...unrankedConcerns]),
    ].filter((c) => !rankedNow.has(c));

    // ── 2. deterministic assessment ────────────────────────────────────────
    const assessment = deps.assess(facts, deps.knowledge);
    const guardrails = assessment.applicableGuardrails;
    const allowedProductLabels = [
      ...assessment.strongCandidates,
      ...assessment.deprioritizedDirections,
      ...assessment.excludedDirections,
    ].map((d) => d.label);

    // ── 3. deterministic question selection ────────────────────────────────
    const selection = deps.selectNextQuestion({
      assessment,
      questionRules: deps.knowledge.questions,
      escalations: deps.knowledge.escalations,
      unrankedConcerns: carriedConcerns,
      askedQuestionIds,
      turnCount,
    });

    const nextTurnCount = turnCount + 1;
    const ready = selection.readyToRecommend || !selection.next;

    // ── 4. phrasing, validated ─────────────────────────────────────────────
    if (!ready && selection.next) {
      const question = selection.next;
      const phrased = await phraseSafely(
        deps.prompts.questionSystemPrompt(guardrails),
        deps.prompts.phrasingUserMessage({
          "question to ask": question.canonical,
          "why it matters": question.materialTo.length
            ? `It could change whether these fit: ${question.materialTo.join(", ")}.`
            : undefined,
        }),
        QUESTION_TOKENS,
        MAX_QUESTION_CHARS,
        allowedProductLabels,
        question.canonical,
        interventions
      );

      return {
        status: "NEED_MORE_INFORMATION",
        state: {
          facts,
          turnCount: nextTurnCount,
          askedQuestionIds: [...askedQuestionIds, question.id],
          unrankedConcerns: carriedConcerns,
        },
        assessment: summarise(assessment),
        nextQuestion: {
          id: question.id,
          canonical: question.canonical,
          phrased,
          materialTo: question.materialTo,
        },
        message: phrased,
        consultationCta: consultationIntent(assessment, false),
        guardrailInterventions: interventions,
        error: null,
      };
    }

    const fallback = fallbackRecommendation(assessment);
    const message = await phraseSafely(
      deps.prompts.recommendationSystemPrompt(assessment, guardrails),
      deps.prompts.phrasingUserMessage({
        "best fit": assessment.strongCandidates
          .map((c) => `${c.label} — ${c.reasons.join(" ")}`)
          .join("\n") || "(no single direction stands out yet)",
        alternatives: assessment.deprioritizedDirections
          .map((c) => `${c.label} — ${c.reasons.join(" ")}`)
          .join("\n"),
        tradeoffs: assessment.tradeoffs.map((t) => `${t.label}: ${t.note}`).join("\n"),
        "luxe will verify": assessment.verificationRequirements.map((v) => v.label).join("\n"),
        "conflicts to address": assessment.requestConflicts.map((c) => c.explanation).join("\n"),
      }),
      RECOMMENDATION_TOKENS,
      MAX_RECOMMENDATION_CHARS,
      allowedProductLabels,
      fallback,
      interventions
    );

    return {
      status: "RECOMMENDATION_READY",
      state: {
        facts,
        turnCount: nextTurnCount,
        askedQuestionIds,
        unrankedConcerns: carriedConcerns,
      },
      assessment: summarise(assessment),
      nextQuestion: null,
      message,
      consultationCta: consultationIntent(assessment, true),
      guardrailInterventions: interventions,
      error: null,
    };
  }

  return { runTurn };
}

/**
 * The safe response for every failure path. It never invents a recommendation
 * from a failed extraction, and it deliberately keeps the door open for the
 * consultation — a broken model is exactly when talking to a person is the
 * right next step.
 */
export function unavailable(
  error: AdvisorResponse["error"],
  state: ConversationState
): AdvisorResponse {
  return {
    status: "ADVISOR_UNAVAILABLE",
    state,
    assessment: null,
    nextQuestion: null,
    message:
      "We could not work through that just now. Our team can go through it with you directly — would you like to schedule a consultation?",
    consultationCta: { recommended: true, reasons: ["recommendation-ready"] },
    guardrailInterventions: [],
    error,
  };
}
