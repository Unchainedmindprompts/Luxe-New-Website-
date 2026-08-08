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
import type { FactUpdate, ValidatedUpdates } from "./extraction";
import type { FactLedger, LedgerApplication } from "./ledger";
import type { ClassifiedQuestion, QuestionTier } from "./counterfactual";
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
  /** Validates a model delta against the vocabulary AND the current message. */
  readonly validateUpdates: (raw: unknown, message: string) => ValidatedUpdates;
  readonly buildDeltaSchema: () => Record<string, unknown>;
  readonly describeVocabulary: () => string;
  readonly isListField: (field: string) => boolean;
  /** Ledger operations. Provenance lives here and never reaches the engine. */
  readonly ledger: {
    validate: (raw: unknown) => FactLedger;
    apply: (
      ledger: FactLedger,
      updates: readonly FactUpdate[],
      turn: number,
      isList: (field: string) => boolean
    ) => LedgerApplication;
    project: (ledger: FactLedger) => ProjectFacts;
    describe: (ledger: FactLedger) => string;
  };
  /**
   * Counterfactual gating: given the current facts, which unresolved questions
   * could actually change the direction. Deterministic, no provider call.
   */
  readonly classifyQuestions: (input: {
    facts: ProjectFacts;
    assessment: AdvisorAssessment;
    knowledge: AdvisorKnowledge;
    assess: (facts: ProjectFacts, knowledge: AdvisorKnowledge) => AdvisorAssessment;
    questionRules: AdvisorKnowledge["questions"];
    unrankedConcerns: readonly PriorityId[];
    askedQuestionIds: readonly string[];
    isVerificationClass: (questionId: string) => boolean;
    isListField: (field: string) => boolean;
    allowedValues: (field: string) => readonly string[];
  }) => readonly ClassifiedQuestion[];
  readonly isVerificationClass: (questionId: string, verificationIds: ReadonlySet<string>) => boolean;
  readonly allowedValues: (field: string) => readonly string[];
  readonly selectNextQuestion: (input: {
    assessment: AdvisorAssessment;
    questionRules: AdvisorKnowledge["questions"];
    escalations: AdvisorKnowledge["escalations"];
    unrankedConcerns: readonly PriorityId[];
    askedQuestionIds: readonly string[];
    turnCount: number;
    tiers?: ReadonlyMap<string, QuestionTier>;
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
    extractionSystemPrompt: (vocabulary: string, established: string) => string;
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

/**
 * Deterministic recommendation text, used when the model's is unusable.
 *
 * This is what a homeowner reads when the model wrote something that crossed a
 * guardrail twice, so it has to be genuinely presentable — not a debug string.
 * It is assembled from the assessment into complete sentences, and it never
 * exposes a rule id, an engine term, or an internal state name. Phase A's
 * labels and notes are already customer-facing prose, which is what makes this
 * possible.
 */
function fallbackRecommendation(assessment: AdvisorAssessment): string {
  const best = assessment.strongCandidates[0];
  const sentences: string[] = [];

  if (!best) {
    sentences.push(
      "No single direction stands out from what you have described yet, which is a fair place to be before anyone has seen the window."
    );
  } else {
    const reason = trimReason(best.reasons[0]);
    sentences.push(
      reason
        ? `${sentenceCase(best.label)} is the direction we would look at first — ${reason}`
        : `${sentenceCase(best.label)} is the direction we would look at first.`
    );
    const alternative = assessment.strongCandidates[1] ?? assessment.deprioritizedDirections[0];
    if (alternative) {
      sentences.push(`${sentenceCase(alternative.label)} is the other option worth weighing.`);
    }
  }

  const tradeoff = assessment.tradeoffs[0];
  if (tradeoff) sentences.push(`One thing to be aware of: ${lowerFirst(trimReason(tradeoff.note) ?? "")}`);

  sentences.push(
    "Our team will confirm the details at the opening before anything is selected, and we can walk through it with you at a consultation."
  );

  return sentences
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,])/g, "$1");
}

/** Deterministic question text, used when the model's phrasing is unusable. */
function fallbackQuestion(canonical: string): string {
  return canonical.trim();
}

/** Normalises a knowledge-base fragment into something that reads mid-sentence. */
function trimReason(reason: string | undefined): string | undefined {
  if (!reason) return undefined;
  const text = reason.trim();
  if (!text) return undefined;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function sentenceCase(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
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
    const priorLedger = deps.ledger.validate(priorState.ledger ?? {});
    const turnCount = Math.max(0, Math.min(MAX_TURNS, Math.trunc(priorState.turnCount ?? 0)));
    const askedQuestionIds = (priorState.askedQuestionIds ?? []).filter(
      (id) => typeof id === "string"
    );

    // ── 1. extraction — a delta, not a snapshot ───────────────────────────
    //
    // One call. The model lists only what THIS message supports, each update
    // carrying a verbatim quote, and every quote is checked against the message
    // server-side. An update whose evidence is not there is dropped, never
    // repaired — that is what stops "We do want privacy at night, yes" from
    // quietly asserting a room.
    let validated: ValidatedUpdates;
    try {
      const raw = await deps.provider.extract({
        system: deps.prompts.extractionSystemPrompt(
          deps.describeVocabulary(),
          deps.ledger.describe(priorLedger)
        ),
        userMessage: input.message,
        schema: deps.buildDeltaSchema(),
        signal: deps.signal,
      });
      validated = deps.validateUpdates(raw, input.message);
    } catch (error) {
      const code = providerFailureCode(error);
      return unavailable(code ?? "extraction-failed", priorState);
    }

    // Precedence, not guesswork: a stated value always outranks an inferred
    // one, so a later guess cannot undo something the homeowner actually said.
    const application = deps.ledger.apply(
      priorLedger,
      validated.accepted,
      turnCount + 1,
      deps.isListField
    );
    const ledger = application.ledger;
    const projected = deps.ledger.project(ledger) as Record<string, unknown>;

    // `unrankedConcerns` is a Phase B concept, not a Phase A fact — it exists
    // so an arbitrary array order is never read as a stated ranking. It is
    // separated out here so the engine receives a clean `ProjectFacts`.
    const { unrankedConcerns: ledgerConcerns, ...factValues } = projected;
    const facts = factValues as ProjectFacts;

    const rankedNow = new Set<PriorityId>((facts.priorities ?? []) as PriorityId[]);
    const carriedConcerns = [
      ...new Set([
        ...(priorState.unrankedConcerns ?? []),
        ...((ledgerConcerns ?? []) as PriorityId[]),
      ]),
    ].filter((concern) => !rankedNow.has(concern));

    // ── 2. deterministic assessment ────────────────────────────────────────
    const assessment = deps.assess(facts, deps.knowledge);
    const guardrails = assessment.applicableGuardrails;
    const allowedProductLabels = [
      ...assessment.strongCandidates,
      ...assessment.deprioritizedDirections,
      ...assessment.excludedDirections,
    ].map((d) => d.label);

    // ── 3. counterfactual gating, then selection ───────────────────────────
    //
    // The engine is a pure function, so it can be asked directly whether a
    // question matters: try each plausible answer, re-assess, and see whether
    // the direction actually moves. A question every answer leaves unchanged
    // costs the homeowner a turn and buys nothing.
    const verificationIds = new Set(assessment.verificationRequirements.map((v) => v.id));
    const classified = deps.classifyQuestions({
      facts,
      assessment,
      knowledge: deps.knowledge,
      assess: deps.assess,
      questionRules: deps.knowledge.questions,
      unrankedConcerns: carriedConcerns,
      askedQuestionIds,
      isVerificationClass: (id) => deps.isVerificationClass(id, verificationIds),
      isListField: deps.isListField,
      allowedValues: deps.allowedValues,
    });
    const tiers = new Map(classified.map((q) => [q.id, q.tier] as const));

    const selection = deps.selectNextQuestion({
      assessment,
      questionRules: deps.knowledge.questions,
      escalations: deps.knowledge.escalations,
      unrankedConcerns: carriedConcerns,
      askedQuestionIds,
      turnCount,
      tiers,
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
        fallbackQuestion(question.canonical),
        interventions
      );

      return {
        status: "NEED_MORE_INFORMATION",
        state: {
          ledger: ledger as Record<string, unknown>,
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
        ledger: ledger as Record<string, unknown>,
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
