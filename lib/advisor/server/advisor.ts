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
  ProductDirection,
  AdvisorAssessment,
  AdvisorKnowledge,
  DirectionId,
  Guardrail,
  PriorityId,
  ProjectFacts,
} from "../types";
import type { FactUpdate, MessageIntent, ValidatedUpdates } from "./extraction";
import type { ScoredTopic } from "./answer-selection";
import type { TranscriptMessage } from "./transcript";
import type { FactLedger, LedgerApplication } from "./ledger";
import type { ClassifiedQuestion, QuestionTier } from "./counterfactual";
import type { BrandResponseMatch } from "./brand-response";
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
const MAX_ANSWER_CHARS = 900;
const QUESTION_TOKENS = 150;
const ANSWER_TOKENS = 260;
const RECOMMENDATION_TOKENS = 400;

export interface AdvisorDeps {
  readonly provider: AdvisorProvider;
  readonly knowledge: AdvisorKnowledge;
  readonly assess: (facts: ProjectFacts, knowledge: AdvisorKnowledge) => AdvisorAssessment;
  /** Validates a model delta against the vocabulary AND the current message. */
  readonly validateUpdates: (raw: unknown, message: string) => ValidatedUpdates;
  readonly buildDeltaSchema: () => Record<string, unknown>;
  /**
   * The vocabulary block for the extraction prompt. Takes the priority
   * definitions so the model is shown Phase A's own meanings rather than a
   * list of bare identifiers it has to guess the semantics of.
   */
  readonly describeVocabulary: (
    priorityDefinitions: AdvisorKnowledge["priorities"]
  ) => string;
  readonly isListField: (field: string) => boolean;
  /** Short-term conversational memory. See `transcript.ts`. */
  readonly transcript: {
    validate: (raw: unknown) => readonly TranscriptMessage[];
    append: (
      transcript: readonly TranscriptMessage[],
      customerMessage: string,
      advisorMessage: string
    ) => readonly TranscriptMessage[];
    render: (transcript: readonly TranscriptMessage[]) => string;
    /** What retrieval should match a follow-up against. See `transcript.ts`. */
    retrievalContext: (
      transcript: readonly TranscriptMessage[],
      currentMessage: string
    ) => string;
  };
  /** True when a message should be answered rather than qualified. */
  readonly isInformational: (intent: MessageIntent) => boolean;
  /** Deterministic retrieval over approved answers. Empty means "we don't have that". */
  readonly selectAnswerTopics: (
    message: string,
    topics: AdvisorKnowledge["answers"]
  ) => readonly ScoredTopic[];
  /** Product directions the visitor named, for comparison questions. */
  readonly selectNamedDirections: (
    message: string,
    directions: AdvisorKnowledge["directions"]
  ) => readonly ProductDirection[];
  readonly describeDirection: (direction: ProductDirection) => string;
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
    extractionSystemPrompt: (vocabulary: string, established: string, transcript?: string) => string;
    extractionUserMessage: (transcript: string, message: string) => string;
    answerSystemPrompt: (
      approved: string,
      guardrails: readonly Guardrail[],
      invitesConsultation: boolean,
      transcript?: string
    ) => string;
    discoverySystemPrompt: (guardrails: readonly Guardrail[], transcript?: string) => string;
    /** `corrected` is true only when this turn actually retracted a fact. */
    questionSystemPrompt: (guardrails: readonly Guardrail[], corrected?: boolean, transcript?: string) => string;
    recommendationSystemPrompt: (
      assessment: AdvisorAssessment,
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string
    ) => string;
    guidanceSystemPrompt: (
      assessment: AdvisorAssessment,
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string
    ) => string;
    phrasingUserMessage: (parts: Record<string, string | undefined>) => string;
  };
  /** Brand names Luxe genuinely carries, for invented-product detection. */
  readonly allowedBrands: readonly string[];
  /**
   * Approved verbatim answers to brand questions. Returns null unless the
   * homeowner actually asked — a passing mention is not a question.
   */
  readonly matchBrandResponse: (
    message: string,
    responses: AdvisorKnowledge["brandResponses"],
    approvedBrands: readonly string[]
  ) => BrandResponseMatch | null;
  readonly signal?: AbortSignal;
}

/**
 * Used when the model's answer is unusable. Deliberately not a product pitch —
 * a broken phrasing call is not a reason to start qualifying someone — and
 * deliberately one OPEN question. An earlier version offered "too bright, too
 * hot, not enough privacy, or just the way it looks", which is a form with a
 * question mark on it: it hands the visitor our categories and gets one of our
 * words back instead of one of theirs.
 */
const ANSWER_FALLBACK =
  "That is a fair question, and I would rather have someone confirm it than guess. Our team can answer it directly — give us a call or book a consultation and we will go through it with you.";

const DISCOVERY_FALLBACK =
  "You don't need to know what you want yet — that's genuinely what we're for, and most people start right here. What are you hoping to improve?";

/** Structural provider-failure check — no runtime import of the adapter. */
function providerFailureCode(error: unknown): "provider-unavailable" | "provider-timeout" | null {
  if (typeof error !== "object" || error === null) return null;
  const code = (error as { code?: unknown }).code;
  return code === "provider-unavailable" || code === "provider-timeout" ? code : null;
}

function summarise(assessment: AdvisorAssessment): AssessmentSummary {
  const rank = (list: AdvisorAssessment["strongCandidates"]) =>
    list.map((c) => ({ id: c.id, label: c.label, reasons: c.reasons }));
  // Chosen once, here, from the engine's own ordering — never by the model and
  // never a second time by the UI.
  const primary = assessment.strongCandidates[0];
  return {
    recognizedConditions: assessment.recognizedConditions.map((c) => ({ id: c.id, label: c.label })),
    primaryRecommendation: primary
      ? { id: primary.id, label: primary.label, reasons: primary.reasons }
      : null,
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
  status: "NEED_MORE_INFORMATION" | "GUIDANCE_READY" | "RECOMMENDATION_READY"
): ConsultationCtaIntent {
  const reasons: ConsultationCtaIntent["reasons"][number][] = [];
  // A consultation is not only worth offering once a product is chosen. When
  // there is useful direction but no best fit, the visit is precisely what
  // resolves it — so guidance earns its own reason rather than borrowing the
  // recommendation's.
  if (status === "RECOMMENDATION_READY") reasons.push("recommendation-ready");
  if (status === "GUIDANCE_READY") reasons.push("guidance-ready");

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
 * The one place the response's honesty is decided.
 *
 * `RECOMMENDATION_READY` requires an actual strong candidate — never merely the
 * absence of a further question. A turn that has stopped asking but has nothing
 * to recommend is `GUIDANCE_READY` when it has something useful to say, and
 * `NEED_MORE_INFORMATION` when it does not.
 */
function deriveStatus(
  assessment: AdvisorAssessment,
  questionGates: boolean,
  hasQuestion: boolean
): "NEED_MORE_INFORMATION" | "GUIDANCE_READY" | "RECOMMENDATION_READY" {
  // NEED_MORE_INFORMATION is a promise that there is something to answer.
  // Live testing produced turns carrying that status with no question and no
  // recommendation — the homeowner was told there was not enough to go on,
  // with nothing to answer and nothing to do. Requiring the question here
  // makes that shape unreachable rather than something the UI has to paper
  // over.
  //
  // Note this adds no question: counterfactual gating still decides whether
  // one is worth asking, and a turn with nothing worth asking simply reports
  // what it does have instead.
  if (questionGates && hasQuestion) return "NEED_MORE_INFORMATION";
  if (assessment.strongCandidates.length > 0) return "RECOMMENDATION_READY";
  return "GUIDANCE_READY";
}

/** Deterministic guidance text, used when the model's is unusable. */
function fallbackGuidance(assessment: AdvisorAssessment): string {
  const sentences: string[] = [];
  const favour = assessment.crossCuttingOptions[0];
  const avoid = assessment.deprioritizedOptions[0];
  const conflict = assessment.requestConflicts[0];

  if (conflict) sentences.push(trimReason(conflict.explanation) ?? "");
  if (favour) sentences.push(`Where it matters, we would favour ${lowerFirst(favour.label)}.`);
  if (avoid) sentences.push(`We would steer away from ${lowerFirst(avoid.label)}.`);
  if (!sentences.length) {
    sentences.push("There is not enough here yet to point you at one direction with confidence.");
  }
  sentences.push(
    "Our team will look at the opening and work through the options with you at a consultation."
  );
  return sentences.map((x) => x.trim()).filter(Boolean).join(" ").replace(/\s+/g, " ");
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

  /**
   * Answers a question from approved knowledge, or returns null when nothing
   * approved covers it.
   *
   * NULL IS THE IMPORTANT RETURN VALUE. It is what makes "we would rather have
   * someone confirm that than guess" reachable, and it is the whole reason the
   * retrieval step is deterministic — a model asked to decide whether it knows
   * something will always decide that it does.
   */
  async function answerDirectly(
    message: string,
    guardrails: readonly Guardrail[],
    interventions: string[],
    history: string,
    retrievalText: string
  ): Promise<{ message: string; invitesConsultation: boolean } | null> {
    // Matched against the recent exchange as well as the current message, so a
    // follow-up that names nothing still resolves to what it is following up on.
    const topics = deps.selectAnswerTopics(retrievalText, deps.knowledge.answers);
    const named = deps.selectNamedDirections(retrievalText, deps.knowledge.directions);
    if (!topics.length && !named.length) return null;

    const approved = [
      ...topics.map((t) => `${t.topic.question}\n${t.topic.answer}`),
      ...named.map((d) => deps.describeDirection(d)),
    ].join("\n\n");

    const invitesConsultation = topics.some((t) => t.topic.invitesConsultation === true);

    const message_ = await phraseSafely(
      deps.prompts.answerSystemPrompt(approved, guardrails, invitesConsultation, history),
      deps.prompts.phrasingUserMessage({
        "recent conversation": history || undefined,
        "their question": message,
      }),
      ANSWER_TOKENS,
      MAX_ANSWER_CHARS,
      // A comparison may name the products it compares; a business answer has
      // none to name, so the invented-product check stays fully armed there.
      named.map((d) => d.label),
      ANSWER_FALLBACK,
      interventions
    );
    return { message: message_, invitesConsultation };
  }

  async function runTurn(input: AdvisorTurnInput): Promise<AdvisorResponse> {
    const interventions: string[] = [];
    const priorState = input.state ?? {};

    // The client's facts are re-validated exactly like the model's. Anything
    // outside the Phase A vocabulary is dropped rather than corrected, so a
    // crafted payload can only assert facts the engine already understands.
    const priorLedger = deps.ledger.validate(priorState.ledger ?? {});
    // Untrusted, like everything else the client sends back. Rendered once so
    // every model call this turn sees exactly the same history.
    const priorTranscript = deps.transcript.validate(priorState.transcript);
    const history = deps.transcript.render(priorTranscript);
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
          deps.describeVocabulary(deps.knowledge.priorities),
          deps.ledger.describe(priorLedger),
          history
        ),
        userMessage: deps.prompts.extractionUserMessage(history, input.message),
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

    // A retraction this turn is the difference between the advisor sounding
    // attentive and actually being it. The engine below already reasons from
    // the corrected facts — this is only so the reply can say so out loud.
    const corrected = application.retracted.length > 0;

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

    // ── 3a. a direct brand question is answered in approved words ──────────
    //
    // Placed after extraction and assessment so the conversation still moves
    // forward — the homeowner has not stopped describing their project just
    // because they also asked about a brand. Only the customer-facing message
    // is replaced.
    //
    // This text bypasses generated-text guardrail validation on purpose. Those
    // checks exist to police what a model writes; this is approved copy that a
    // human wrote and signed off, and it legitimately names a brand Luxe does
    // not carry — which the invented-product check would otherwise reject. It
    // is still sanitised, and its wording is pinned by test.
    const brandAnswer = deps.matchBrandResponse(
      input.message,
      deps.knowledge.brandResponses,
      deps.allowedBrands
    );

    const questionGates = !(selection.readyToRecommend || !selection.next);
    const productStatus = deriveStatus(assessment, questionGates, Boolean(selection.next));

    /**
     * The state to hand back, with this turn's exchange recorded.
     *
     * A function rather than a value because every return path below carries a
     * different reply, and a transcript that silently missed one would produce
     * exactly the bug this feature exists to fix — on the paths nobody tested.
     */
    const stateAfter = (advisorMessage: string): ConversationState => ({
      ledger: ledger as Record<string, unknown>,
      facts,
      turnCount: nextTurnCount,
      askedQuestionIds,
      unrankedConcerns: carriedConcerns,
      transcript: deps.transcript.append(priorTranscript, input.message, advisorMessage),
    });

    // ── 4. phrasing, validated ─────────────────────────────────────────────
    if (brandAnswer) {
      return {
        // A brand question asked and answered. It was reporting a product
        // status — the same kind of dishonesty GUIDANCE_READY was added to
        // fix — and offering a consultation off the back of "do you carry X",
        // which is a sales reflex rather than a next step that follows.
        status: "ANSWERED",
        state: stateAfter(deps.sanitizeForOutput(brandAnswer.response, MAX_RECOMMENDATION_CHARS)),
        assessment: summarise(assessment),
        nextQuestion: null,
        message: deps.sanitizeForOutput(brandAnswer.response, MAX_RECOMMENDATION_CHARS),
        canonicalResponseId: brandAnswer.id,
        consultationCta: { recommended: false, reasons: [] },
        guardrailInterventions: interventions,
        error: null,
      };
    }

    // ── 3b. a question we can simply answer ────────────────────────────────
    //
    // Most visitors are not asking us to choose a product. They want to know
    // what happens during the visit, whether there is a minimum, what it costs.
    // Routing that through window qualification is what produced replies about
    // glare to someone asking the opening hours.
    if (deps.isInformational(validated.intent)) {
      const answered = await answerDirectly(
        input.message,
        guardrails,
        interventions,
        history,
        deps.transcript.retrievalContext(priorTranscript, input.message)
      );
      if (answered) {
        return {
          status: "ANSWERED",
          state: stateAfter(answered.message),
          assessment: summarise(assessment),
          nextQuestion: null,
          message: answered.message,
          canonicalResponseId: null,
          consultationCta: {
            recommended: answered.invitesConsultation,
            reasons: answered.invitesConsultation ? ["guidance-ready"] : [],
          },
          guardrailInterventions: interventions,
          error: null,
        };
      }
      // Nothing approved covers it. Fall through to the product path rather
      // than improvising — the engine at least reasons from real knowledge.
    }

    // ── 3c. they want help and do not know where to start ──────────────────
    if (validated.intent === "discovery" && assessment.strongCandidates.length === 0) {
      const message = await phraseSafely(
        deps.prompts.discoverySystemPrompt(guardrails, history),
        deps.prompts.phrasingUserMessage({
          "recent conversation": history || undefined,
          "their message": input.message,
        }),
        ANSWER_TOKENS,
        MAX_ANSWER_CHARS,
        [],
        DISCOVERY_FALLBACK,
        interventions
      );
      return {
        status: "ANSWERED",
        state: stateAfter(message),
        assessment: summarise(assessment),
        nextQuestion: null,
        message,
        canonicalResponseId: null,
        consultationCta: { recommended: false, reasons: [] },
        guardrailInterventions: interventions,
        error: null,
      };
    }

    const status = productStatus;

    if (status === "NEED_MORE_INFORMATION" && selection.next) {
      const question = selection.next;
      const phrased = await phraseSafely(
        deps.prompts.questionSystemPrompt(guardrails, corrected, history),
        deps.prompts.phrasingUserMessage({
          "recent conversation": history || undefined,
          "their message": input.message,
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
          ...stateAfter(phrased),
          askedQuestionIds: [...askedQuestionIds, question.id],
        },
        assessment: summarise(assessment),
        nextQuestion: {
          id: question.id,
          canonical: question.canonical,
          phrased,
          materialTo: question.materialTo,
        },
        message: phrased,
        canonicalResponseId: null,
        consultationCta: consultationIntent(assessment, status),
        guardrailInterventions: interventions,
        error: null,
      };
    }

    // A turn with no strong candidate must not be handed the recommendation
    // prompt: it opens with "lead with the direction that fits", which is the
    // one claim this turn is not entitled to make.
    const givingGuidance = status === "GUIDANCE_READY";
    const fallback = givingGuidance
      ? fallbackGuidance(assessment)
      : fallbackRecommendation(assessment);
    const message = await phraseSafely(
      givingGuidance
        ? deps.prompts.guidanceSystemPrompt(assessment, guardrails, corrected, history)
        : deps.prompts.recommendationSystemPrompt(assessment, guardrails, corrected, history),
      deps.prompts.phrasingUserMessage({
        "recent conversation": history || undefined,
        "their message": input.message,
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
      status,
      state: stateAfter(message),
      assessment: summarise(assessment),
      nextQuestion: null,
      message,
      canonicalResponseId: null,
      consultationCta: consultationIntent(assessment, status),
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
    canonicalResponseId: null,
    message:
      "We could not work through that just now. Our team can go through it with you directly — would you like to schedule a consultation?",
    consultationCta: { recommended: true, reasons: ["recommendation-ready"] },
    guardrailInterventions: [],
    error,
  };
}
