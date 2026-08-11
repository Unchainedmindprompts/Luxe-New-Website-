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
import type { Trace } from "./trace";
import type { FactLedger, LedgerApplication } from "./ledger";
import type { Project, RecommendationChange, ScopedApplication } from "./project";
import type { ClassifiedQuestion, QuestionTier } from "./counterfactual";
import type { BrandResponseMatch } from "./brand-response";
import type {
  AdvisorProvider,
  AdvisorResponse,
  AssessmentSummary,
  ConsultationCtaIntent,
  ConversationState,
  PreliminaryGuidance,
  SystemPrompt,
} from "./types";

/** Hard ceiling on advisor turns in one conversation. Also an abuse control. */
export const MAX_TURNS = 12;

/**
 * Recorded once the open "tell me about the space" invitation has been made.
 *
 * Not a Phase A question rule — it is the discovery route's own opening, and it
 * lives in `askedQuestionIds` for exactly the reason that list exists: so the
 * homeowner is not asked the same thing twice.
 */
export const DISCOVERY_OPENING_ID = "discovery-opening";

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
  /** Whether this message asked to take the next step. The only automatic CTA trigger. */
  readonly isSchedulingIntent: (intent: MessageIntent) => boolean;
  /** Deterministic retrieval over approved answers. Empty means "we don't have that". */
  readonly selectAnswerTopics: (
    message: string,
    topics: AdvisorKnowledge["answers"]
  ) => readonly ScoredTopic[];
  /**
   * Product directions the visitor is ASKING about, on a project turn.
   * Empty unless they named one, so it can never propose a shortlist.
   */
  readonly selectProductEducation: (
    message: string,
    directions: AdvisorKnowledge["directions"]
  ) => readonly ProductDirection[];
  /** Product directions the visitor named, for comparison questions. */
  readonly selectNamedDirections: (
    message: string,
    directions: AdvisorKnowledge["directions"]
  ) => readonly ProductDirection[];
  readonly describeDirection: (direction: ProductDirection) => string;
  /** An approved answer good enough to serve without any model call. */
  readonly selectVerifiedAnswer: (
    message: string,
    topics: AdvisorKnowledge["answers"],
    directions: AdvisorKnowledge["directions"]
  ) => AdvisorKnowledge["answers"][number] | null;
  /** Deterministic wording for "we do not have that verified". */
  readonly unknownAnswer: string;
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
   * The multi-area project. See `project.ts` — a homeowner has rooms, and the
   * ledger had one. Everything here is injected for the same reason the ledger
   * is: these stay pure functions the harness can drive with no build step.
   */
  readonly project: {
    validate: (raw: unknown, legacyLedger: unknown) => Project;
    /** Moves focus when a message names a space without stating a fact. */
    focus: (project: Project, message: string) => Project;
    apply: (
      project: Project,
      updates: readonly FactUpdate[],
      turn: number,
      isList: (field: string) => boolean,
      applyLedger: (
        ledger: FactLedger,
        updates: readonly FactUpdate[],
        turn: number,
        isList: (field: string) => boolean
      ) => LedgerApplication
    ) => ScopedApplication;
    /** The active area's own ledger, for the paths that still want one. */
    activeLedger: (project: Project) => FactLedger;
    /** Shared facts merged with the active area's. One coherent space. */
    activeFacts: (project: Project) => ProjectFacts;
    /** Every area, for the extraction prompt's established block. */
    describe: (project: Project) => string;
    /** Which space the conversation is on, for the reply and the card. */
    active: (project: Project) => {
      id: string;
      room: string | null;
      label: string | null;
      presented?: { directionId: string; turn: number } | null;
    } | null;
    /** New, unchanged, changed or withdrawn — by direction id, never by prose. */
    change: (current: string | null, presented: string | null) => RecommendationChange;
    /** Records what this space has actually been shown. */
    markPresented: (
      project: Project,
      areaId: string | null,
      directionId: string,
      turn: number
    ) => Project;
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
    context: {
      allowedProductLabels: readonly string[];
      allowedBrands: readonly string[];
      supportingMaterial?: string;
    }
  ) => readonly { guardrailId: string; evidence: string }[];
  readonly sanitizeForOutput: (text: string, maxLength: number) => string;
  readonly prompts: {
    extractionSystemPrompt: (
      vocabulary: string,
      established: string,
      transcript?: string
    ) => SystemPrompt;
    extractionUserMessage: (transcript: string, message: string) => string;
    answerSystemPrompt: (
      approved: string,
      guardrails: readonly Guardrail[],
      invitesConsultation: boolean,
      transcript?: string
    ) => SystemPrompt;
    discoverySystemPrompt: (guardrails: readonly Guardrail[], transcript?: string) => SystemPrompt;
    /** `corrected` is true only when this turn actually retracted a fact. */
    questionSystemPrompt: (
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string
    ) => SystemPrompt;
    /** Guidance first, then the one question that still gates the answer. */
    preliminaryGuidanceSystemPrompt: (
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string
    ) => SystemPrompt;
    /** Verified product knowledge first, then the question. Never a choice. */
    productEducationSystemPrompt: (
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string
    ) => SystemPrompt;
    recommendationSystemPrompt: (
      assessment: AdvisorAssessment,
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string,
      consultationAuthorized?: boolean,
      change?: RecommendationChange
    ) => SystemPrompt;
    guidanceSystemPrompt: (
      assessment: AdvisorAssessment,
      guardrails: readonly Guardrail[],
      corrected?: boolean,
      transcript?: string,
      consultationAuthorized?: boolean
    ) => SystemPrompt;
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
  /** Optional per-turn timing. Shape only, never content. */
  readonly trace?: Trace;
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

/**
 * The behaviour of a direction, limited to the properties actually in play.
 *
 * HANDING OVER THE WHOLE PRODUCT SHEET WAS THE DEFECT. The previous fix
 * supplied every verified line about the recommended direction and told the
 * prompt not to mix them. It mixed them: asked why cellular shades darken a
 * bedroom, and holding a sheet that credits the honeycomb and its trapped air
 * with INSULATION, the model wrote that "that same dense, layered construction
 * is what gives the darkest room feel we offer". The corpus says no such
 * thing — darkening comes from room-darkening fabric, and no mechanism is
 * given for it at all.
 *
 * An instruction not to borrow a mechanism is a request. Not supplying the
 * mechanism is a fact. So the energy line goes to a project about energy, the
 * darkening line to a project about darkening, and a model asked why something
 * darkens a room has nothing about air pockets in front of it to reach for.
 *
 * `strengths` is deliberately excluded: it is a mixed list — one entry is the
 * trapped-air claim — and there is no per-property way to split it.
 */
function describeForProperties(
  direction: ProductDirection,
  priorities: readonly string[]
): string {
  const byPriority: Record<string, string | undefined> = {
    "room-darkening": direction.roomDarkeningBehavior,
    privacy: direction.privacyBehavior,
    "energy-efficiency": direction.energyBehavior,
    "view-preservation": direction.viewBehavior,
    "glare-control": direction.viewBehavior,
    "clear-glass-when-open": direction.viewBehavior,
    aesthetics: direction.designCharacteristics,
  };
  const labels: Record<string, string> = {
    "room-darkening": "Darkening",
    privacy: "Privacy",
    "energy-efficiency": "Energy",
    "view-preservation": "View",
    "glare-control": "View",
    "clear-glass-when-open": "View",
    aesthetics: "Character",
  };

  const lines = new Map<string, string>();
  for (const priority of priorities) {
    const behaviour = byPriority[priority];
    if (behaviour) lines.set(labels[priority], `- ${labels[priority]}: ${behaviour}`);
  }
  // Nothing in play maps to a behaviour line — say what it is and no more,
  // rather than falling back to the whole sheet.
  return [`${direction.label}:`, ...lines.values()].join("\n");
}

/**
 * The verification items that belong to the direction actually on screen.
 *
 * "In play" includes DEPRIORITIZED directions, which is right for the engine
 * and wrong for the customer. A bedroom wanting maximum darkening recommends
 * cellular shades and deprioritizes shutters — and shutters bring
 * `verify-shutter-clearance` with them, so a card headed "Cellular shades"
 * listed "clearance for shutter panels" under "We'll confirm in your home".
 *
 * Project-level requirements always survive: a wet room needs checking whatever
 * goes in it. Direction-specific ones survive only while their direction is the
 * one being recommended.
 *
 * The engine is untouched. It still reports everything in play, because that is
 * what a consultant needs to know before the visit; this is the narrower
 * question of what to say to the homeowner about the direction being discussed.
 */
function verificationsFor(
  assessment: AdvisorAssessment,
  primaryId: string | undefined
): AdvisorAssessment["verificationRequirements"] {
  return assessment.verificationRequirements.filter(
    (requirement) =>
      !requirement.forDirections?.length ||
      (primaryId !== undefined && requirement.forDirections.includes(primaryId as never))
  );
}

/**
 * @param primaryEarned false when this turn is not entitled to name one
 *   direction as the answer — currently only when the message described more
 *   than one area and the ledger kept one of them. The field is documented as
 *   "the one direction being recommended, or null when none has been earned",
 *   and a collapsed turn has not earned one.
 */
function summarise(assessment: AdvisorAssessment, primaryEarned = true): AssessmentSummary {
  const rank = (list: AdvisorAssessment["strongCandidates"]) =>
    list.map((c) => ({ id: c.id, label: c.label, reasons: c.reasons }));
  // Chosen once, here, from the engine's own ordering — never by the model and
  // never a second time by the UI.
  const primary = assessment.strongCandidates[0];
  return {
    recognizedConditions: assessment.recognizedConditions.map((c) => ({ id: c.id, label: c.label })),
    primaryRecommendation:
      primary && primaryEarned
        ? { id: primary.id, label: primary.label, reasons: primary.reasons }
        : null,
    strongCandidates: rank(assessment.strongCandidates),
    alternatives: rank(assessment.deprioritizedDirections),
    excluded: rank(assessment.excludedDirections),
    recommendedOptions: assessment.crossCuttingOptions.map((o) => ({ id: o.id, label: o.label })),
    optionsToAvoid: assessment.deprioritizedOptions.map((o) => ({ id: o.id, label: o.label })),
    tradeoffs: assessment.tradeoffs.map((t) => ({ id: t.id, label: t.label, note: t.note })),
    verificationRequirements: verificationsFor(assessment, primary?.id).map((v) => ({
      id: v.id,
      label: v.label,
    })),
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
  status: "NEED_MORE_INFORMATION" | "GUIDANCE_READY" | "RECOMMENDATION_READY",
  askedToSchedule: boolean
): ConsultationCtaIntent {
  // 1. THEY ASKED. Nothing else has to be true, and nothing else can override
  //    it. "Can someone come measure?" is answered by the booking path.
  if (askedToSchedule) {
    return { recommended: true, reasons: ["customer-asked-to-schedule"] };
  }

  // 2. A FINISHED RECOMMENDATION THAT GENUINELY NEEDS SOMEONE AT THE WINDOW.
  //    Not every recommendation — naming a product is not permission to sell a
  //    visit. The visit has to be doing real work: something physical has to be
  //    confirmed, or the project is complex enough that a description will not
  //    settle it.
  if (status !== "RECOMMENDATION_READY") return { recommended: false, reasons: [] };

  const reasons: ConsultationCtaIntent["reasons"][number][] = [];
  // SCOPED TO THE DIRECTION BEING RECOMMENDED, for the same reason the card is.
  // A shutter-clearance requirement that arrived with a deprioritized direction
  // was making a cellular recommendation claim it needed someone at the window,
  // which is a booking prompt earned by a product nobody is proposing.
  const verifications = new Set(
    verificationsFor(assessment, assessment.strongCandidates[0]?.id).map((v) => v.id)
  );
  // `verify-dimensions` is on every project, so it says nothing about this one.
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
 * What the engine can already say, when a question still gates the answer.
 *
 * THE ENGINE DECIDES WHETHER THERE IS ANYTHING TO SAY. This reads the
 * assessment and reports it; it never manufactures a shortlist to avoid asking
 * a question. Three signals count, and all three are the engine having named
 * something specific:
 *
 *   A LEADING DIRECTION — glare over a view the homeowner wants to keep already
 *     puts solar shades ahead, whatever is still unknown about night privacy.
 *   AN OPERATING CHOICE TO FAVOUR, or ONE TO AVOID — a nursery has ruled out
 *     corded operation on safety grounds before anyone has said how dark the
 *     room needs to be.
 *
 * Anything else returns null. "Bedroom, west-facing, moderate heat" leaves all
 * twelve directions eligible with no option indicated either way, and the
 * honest reply there is the question by itself — measured, not assumed, in
 * test 139.
 *
 * Note what is deliberately NOT a signal. Tradeoffs and verification
 * requirements attach to a direction; without one they are a lecture. And
 * `eligibleDirections` being large is not disqualifying on its own — the
 * nursery case has all twelve still eligible and still has something worth
 * saying, because the engine named an operating choice.
 */
export function preliminaryGuidance(
  assessment: AdvisorAssessment
): PreliminaryGuidance | null {
  const leading = assessment.strongCandidates[0];
  const favour = assessment.crossCuttingOptions;
  const avoid = assessment.deprioritizedOptions;
  if (!leading && !favour.length && !avoid.length) return null;
  return {
    leaning: leading ? { id: leading.id, label: leading.label } : null,
    favour: favour.map((o) => ({ id: o.id, label: o.label })),
    avoid: avoid.map((o) => ({ id: o.id, label: o.label })),
  };
}

/** The guidance as plain lines for the phrasing layer. Labels only, no ids. */
function describeGuidance(guidance: PreliminaryGuidance): string {
  return [
    guidance.leaning ? `Leading direction so far: ${guidance.leaning.label}` : "",
    guidance.favour.length ? `Worth favouring: ${guidance.favour.map((o) => o.label).join("; ")}` : "",
    guidance.avoid.length ? `Worth steering away from: ${guidance.avoid.map((o) => o.label).join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Deterministic guidance-then-question text, for when the model's is unusable.
 *
 * The question must survive a phrasing failure intact — losing it would turn a
 * gated turn into a dead end — so it is appended verbatim from Phase A.
 */
function fallbackPreliminary(guidance: PreliminaryGuidance, canonical: string): string {
  const sentences: string[] = [];
  if (guidance.leaning) {
    sentences.push(`${sentenceCase(guidance.leaning.label)} is where we would start looking, though it is not settled yet.`);
  }
  if (guidance.favour.length) {
    sentences.push(`We would favour ${lowerFirst(guidance.favour[0].label)}.`);
  }
  if (guidance.avoid.length) {
    sentences.push(`We would steer away from ${lowerFirst(guidance.avoid[0].label)}.`);
  }
  sentences.push(canonical.trim());
  return sentences.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Deterministic education-then-question text, for when the model's is unusable.
 *
 * Names only what the customer named and claims nothing about fit — the same
 * boundary the prompt enforces, held here too, because a fallback is exactly
 * when nothing is enforcing it upstream.
 */
function fallbackEducation(
  directions: readonly ProductDirection[],
  canonical: string
): string {
  const sentences = directions.slice(0, 2).map((direction) => {
    const strength = trimReason(direction.strengths[0]);
    return strength
      ? `${sentenceCase(direction.label)}: ${lowerFirst(strength)}`
      : `${sentenceCase(direction.label)} is one we carry.`;
  });
  sentences.push("Whether it is the right call for your room depends on one more thing.");
  sentences.push(canonical.trim());
  return sentences.join(" ").replace(/\s+/g, " ").trim();
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

/**
 * Does this reply say the same thing twice?
 *
 * The customer-facing contract is one short reply. A generation that repeats
 * its own sentences is malformed output rather than a stylistic lapse, and the
 * character ceiling is generous enough — 1,400 against a stated 45-95 word
 * budget — to serve a doubled paragraph through intact.
 *
 * Detection only; nothing here edits the text. A repeat is treated exactly like
 * an empty response: regenerate once, then fall back to deterministic prose.
 * Editing a model's words to hide a defect would leave the defect invisible and
 * unmeasurable, which is how it reached a preview in the first place.
 */
function repeatsItself(text: string): boolean {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.length >= 40);
  return new Set(sentences).size < sentences.length;
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
   * One advisor is built per request by the route, so a turn-scoped trace can
   * live here and be shared by the closures below without threading it through
   * every signature.
   *
   * The no-op is written inline rather than imported: every reasoning module in
   * this directory keeps its imports type-only so the `.mjs` harnesses can load
   * the whole path with no build step, and one runtime import would break that
   * for all of them.
   */
  const trace: Trace = deps.trace ?? {
    mark: async (_stage, work) => work(),
    countProviderCall: () => undefined,
    setRoute: () => undefined,
    setDeterministic: () => undefined,
    setFellBack: () => undefined,
    done: () => ({
      route: "unavailable",
      stages: {},
      providerCalls: 0,
      deterministic: false,
      fellBack: false,
      totalMs: 0,
    }),
  };

  /**
   * Every product name that is real, assembled once per request.
   *
   * Two sources, and the second is the one that makes this workable. Product
   * LABELS give the categories — "cellular shades", "interior roller shades".
   * The approved material gives the proper nouns Luxe genuinely uses and the
   * label list has no room for: HomeKit, InvisibleTilt, Venetian. Those are not
   * inventions; they are published on this site, and a check that flagged them
   * would fire on Luxe's own approved copy.
   *
   * ONLY THE CAPITALISED WORDS ARE TAKEN, because only capitalised words are
   * checked. Harvesting every word in seventy-four FAQs would make the
   * vocabulary so wide that a fabricated name could hide inside it.
   *
   * The result is one rule, and it is the same rule the prompt states: a proper
   * noun Luxe's own material uses is real, and one it does not is not.
   */
  const productCatalogue: readonly string[] = [
    ...deps.knowledge.directions.map((d) => d.label),
    ...deps.knowledge.crossCuttingOptions.map((o) => o.label),
    ...deps.knowledge.unrepresentedSiteProducts.map((p) => p.slug.replace(/-/g, " ")),
    ...[
      ...deps.knowledge.answers.map((a) => `${a.question} ${a.answer}`),
      ...deps.knowledge.directions.map((d) =>
        [
          ...d.strengths,
          d.viewBehavior,
          d.privacyBehavior,
          d.roomDarkeningBehavior,
          d.energyBehavior,
          d.designCharacteristics,
          d.siteCoverageNote,
        ].join(" ")
      ),
    ].flatMap((text) => text.match(/\b[A-Z][A-Za-z]*\b/g) ?? []),
  ];

  /**
   * What to add to a retry so it is not a coin flip.
   *
   * The retry used to re-send the identical prompt and hope. Live evaluation
   * showed exactly what that buys: a plain product comparison crossed two
   * guardrails, was regenerated with no idea why, crossed two more, and the
   * visitor was told "I'd rather have someone confirm that than guess" about a
   * question the knowledge base answers in full — thirteen seconds and three
   * model calls to reach a worse reply than the first attempt.
   *
   * This goes in the DYNAMIC half, which is the point of splitting the prompt:
   * the retry keeps the same cached prefix and only the turn's material grows.
   */
  function retryGuidance(violated: readonly string[]): string {
    if (!violated.length) return "";
    const byId = new Map(deps.knowledge.guardrails.map((g) => [g.id, g] as const));
    const lines = violated.map((id) => {
      const guardrail = byId.get(id);
      return guardrail
        ? `- ${guardrail.prohibition} Instead: ${guardrail.permittedInstead}`
        : `- ${id.replace(/-/g, " ")}.`;
    });
    return `YOUR LAST ATTEMPT WAS REJECTED AND DISCARDED

It crossed the following. Write the reply again — same substance, same length, same usefulness — with that claim removed rather than the whole answer withdrawn. Losing one sentence is the fix; refusing to answer is not.

${lines.join("\n")}`;
  }

  /**
   * Runs one phrasing call, validates it, retries once with the reason it
   * failed, and falls back to deterministic text if the retry also violates.
   * The violating text is never returned and never logged.
   */
  async function phraseSafely(
    system: SystemPrompt,
    userMessage: string,
    maxTokens: number,
    maxChars: number,
    fallback: string,
    interventions: string[],
    // What this turn was told. Only the superlative check reads it: a ranking
    // the material does not make is a ranking nobody made.
    supportingMaterial = ""
  ): Promise<string> {
    const violated: string[] = [];
    for (let attempt = 0; attempt < 2; attempt++) {
      const guidance = retryGuidance(violated);
      const prompt: SystemPrompt = guidance
        ? { stable: system.stable, dynamic: [system.dynamic, guidance].filter(Boolean).join("\n\n") }
        : system;
      let raw: string;
      try {
        trace.countProviderCall();
        raw = await trace.mark(attempt === 0 ? "phrasing" : "phrasing-retry", () =>
          deps.provider.phrase({ system: prompt, userMessage, maxTokens, signal: deps.signal })
        );
      } catch (error) {
        if (providerFailureCode(error)) {
          trace.setFellBack();
          return fallback;
        }
        throw error;
      }
      const text = deps.sanitizeForOutput(raw, maxChars);
      // Empty and self-repeating are the same kind of failure: output that
      // cannot be shown to a customer. Both retry once, then fall back.
      if (!text || repeatsItself(text)) continue;
      const violations = deps.validateGeneratedText(text, {
        allowedProductLabels: productCatalogue,
        allowedBrands: deps.allowedBrands,
        supportingMaterial,
      });
      if (!violations.length) return text;
      violated.length = 0;
      for (const v of violations) {
        violated.push(v.guardrailId);
        if (!interventions.includes(v.guardrailId)) interventions.push(v.guardrailId);
      }
    }
    trace.setFellBack();
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
    // APPROVED TOPICS COME FROM THE CURRENT MESSAGE ONLY.
    //
    // Widening topic retrieval to the recent exchange — as Phase 1 did — meant
    // a new, unrelated question inherited the previous one's topic: asking
    // "do you have a showroom?" straight after "what are your hours?" matched
    // the hours answer again, and paid two model calls to talk its way out of
    // it. Business questions are self-contained; nobody asks the opening hours
    // as a follow-up.
    const topics = deps.selectAnswerTopics(message, deps.knowledge.answers);
    // PRODUCTS COME FROM THE CONVERSATION, because that is where a referential
    // follow-up points. "Why?" and "what about insulation?" name nothing at
    // all, and the products they are about were named a turn ago.
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
    // The project, not a ledger. A pre-Phase-7 conversation still in a browser
    // sends the old flat shape; `validateProject` migrates it rather than
    // dropping everything the homeowner has said.
    const priorProject = deps.project.validate(priorState.project, priorState.ledger ?? {});
    const priorLedger = deps.project.activeLedger(priorProject);
    // Untrusted, like everything else the client sends back. Rendered once so
    // every model call this turn sees exactly the same history.
    const priorTranscript = deps.transcript.validate(priorState.transcript);
    const history = deps.transcript.render(priorTranscript);
    const turnCount = Math.max(0, Math.min(MAX_TURNS, Math.trunc(priorState.turnCount ?? 0)));
    const askedQuestionIds = (priorState.askedQuestionIds ?? []).filter(
      (id) => typeof id === "string"
    );

    /**
     * An approved answer, served without asking a model anything.
     *
     * Runs before extraction because extraction is the expensive half — 2.3 to
     * 4.4 seconds measured — and a question the server can already answer word
     * for word does not need a fact delta first. The gate is deliberately
     * strict (see `selectVerifiedAnswer`); anything it declines takes the full
     * path, so the cost of being wrong is latency rather than a bad answer.
     */
    const verified = deps.selectVerifiedAnswer(
      input.message,
      deps.knowledge.answers,
      deps.knowledge.directions
    );
    if (verified) {
      trace.setRoute("fast-answer");
      trace.setDeterministic();
      const priorFacts = deps.ledger.project(priorLedger);
      const answer = deps.sanitizeForOutput(verified.answer, MAX_ANSWER_CHARS);
      return {
        status: "ANSWERED",
        state: {
          project: priorProject as unknown as Record<string, unknown>,
          ledger: priorLedger as Record<string, unknown>,
          facts: priorFacts,
          turnCount: turnCount + 1,
          askedQuestionIds,
          unrankedConcerns: priorState.unrankedConcerns ?? [],
          transcript: deps.transcript.append(priorTranscript, input.message, answer),
        },
        assessment: summarise(deps.assess(priorFacts, deps.knowledge)),
        nextQuestion: null,
        preliminaryGuidance: null,
        recommendationChange: "none",
        productEducation: null,
        message: answer,
        canonicalResponseId: null,
        consultationCta: verified.invitesConsultation
          ? { recommended: true, reasons: ["answer-invites-consultation"] }
          : { recommended: false, reasons: [] },
        guardrailInterventions: interventions,
        error: null,
        diagnostics: trace.done(),
      };
    }

    // ── 1. extraction — a delta, not a snapshot ───────────────────────────
    //
    // One call. The model lists only what THIS message supports, each update
    // carrying a verbatim quote, and every quote is checked against the message
    // server-side. An update whose evidence is not there is dropped, never
    // repaired — that is what stops "We do want privacy at night, yes" from
    // quietly asserting a room.
    let validated: ValidatedUpdates;
    try {
      trace.countProviderCall();
      const raw = await trace.mark("extraction", () => deps.provider.extract({
        system: deps.prompts.extractionSystemPrompt(
          deps.describeVocabulary(deps.knowledge.priorities),
          deps.project.describe(priorProject),
          history
        ),
        userMessage: deps.prompts.extractionUserMessage(history, input.message),
        schema: deps.buildDeltaSchema(),
        signal: deps.signal,
      }));
      validated = deps.validateUpdates(raw, input.message);
    } catch (error) {
      // VERIFIED KNOWLEDGE MUST NOT VANISH BECAUSE AN UNRELATED CALL FAILED.
      // The fast path above already covers the clearest questions; this covers
      // the rest — anything with an approved answer is still answerable when
      // extraction times out, and telling someone "I'd rather have someone
      // confirm that" while holding the answer would be absurd.
      const rescued = deps.selectAnswerTopics(input.message, deps.knowledge.answers);
      if (rescued.length) {
        trace.setRoute("fast-answer");
        trace.setDeterministic();
        const priorFacts = deps.ledger.project(priorLedger);
        const answer = deps.sanitizeForOutput(rescued[0].topic.answer, MAX_ANSWER_CHARS);
        return {
          status: "ANSWERED",
          state: {
            ledger: priorLedger as Record<string, unknown>,
            facts: priorFacts,
            turnCount: turnCount + 1,
            askedQuestionIds,
            unrankedConcerns: priorState.unrankedConcerns ?? [],
            transcript: deps.transcript.append(priorTranscript, input.message, answer),
          },
          assessment: summarise(deps.assess(priorFacts, deps.knowledge)),
          nextQuestion: null,
        preliminaryGuidance: null,
        recommendationChange: "none",
        productEducation: null,
          message: answer,
          canonicalResponseId: null,
          consultationCta: rescued[0].topic.invitesConsultation
            ? { recommended: true, reasons: ["answer-invites-consultation"] }
            : { recommended: false, reasons: [] },
          guardrailInterventions: interventions,
          error: null,
          diagnostics: trace.done(),
        };
      }
      const code = providerFailureCode(error);
      return unavailable(code ?? "extraction-failed", priorState);
    }

    // Precedence, not guesswork: a stated value always outranks an inferred
    // one, so a later guess cannot undo something the homeowner actually said.
    // SCOPED. Each update lands in the space it is about, so a living-room
    // preference cannot overwrite what the bedroom was told.
    const scoped = deps.project.apply(
      // A message that names a space without stating a fact about it — "okay,
      // what about the living room?" — still moves the conversation there.
      deps.project.focus(priorProject, input.message),
      validated.accepted,
      turnCount + 1,
      deps.isListField,
      deps.ledger.apply
    );
    const project = scoped.project;
    const application = { retracted: scoped.retracted, suppressed: scoped.suppressed };
    const ledger = deps.project.activeLedger(project);
    const projected = deps.project.activeFacts(project) as Record<string, unknown>;

    // A retraction this turn is the difference between the advisor sounding
    // attentive and actually being it. The engine below already reasons from
    // the corrected facts — this is only so the reply can say so out loud.
    const corrected = application.retracted.length > 0;

    // The only thing that turns a booking prompt on outside a finished
    // recommendation. Read from the message, not inferred from the funnel.
    const askedToSchedule = deps.isSchedulingIntent(validated.intent);

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
    const assessment = await trace.mark("assessment", async () => deps.assess(facts, deps.knowledge));
    const guardrails = assessment.applicableGuardrails;

    // ── 3. counterfactual gating, then selection ───────────────────────────
    //
    // The engine is a pure function, so it can be asked directly whether a
    // question matters: try each plausible answer, re-assess, and see whether
    // the direction actually moves. A question every answer leaves unchanged
    // costs the homeowner a turn and buys nothing.
    const verificationIds = new Set(assessment.verificationRequirements.map((v) => v.id));
    const classified = await trace.mark("counterfactual", async () => deps.classifyQuestions({
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
    }));
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
    /**
     * The homeowner described more than one place in one message, and the
     * ledger holds one.
     *
     * "I want something that darkens the bedrooms, and some modern and
     * contemporary for the living spaces" asserts `room` twice. One value
     * survives, the engine reasons about that one, and the card then presents
     * the result as though it settled the house. It did not — it settled
     * whichever room won the overwrite, and nothing on screen says which.
     *
     * A single room is a real limit of this ledger and is not fixed here. What
     * is fixed is the claim: a turn that collapsed an area cannot report a
     * finished recommendation. It reports guidance, which is what it has.
     */
    // The previous pass dropped a two-area turn to GUIDANCE_READY because the
    // ledger had silently kept one room and the card would have claimed the
    // house. Areas make that unreachable: each room keeps its own facts, the
    // engine assesses one of them, and the card names which. The guard is gone
    // because the collapse it guarded against cannot happen.
    const productStatus = deriveStatus(assessment, questionGates, Boolean(selection.next));

    /**
     * The state to hand back, with this turn's exchange recorded.
     *
     * A function rather than a value because every return path below carries a
     * different reply, and a transcript that silently missed one would produce
     * exactly the bug this feature exists to fix — on the paths nobody tested.
     */
    const stateAfter = (advisorMessage: string, withProject: Project = project): ConversationState => ({
      project: withProject as unknown as Record<string, unknown>,
      ledger: ledger as Record<string, unknown>,
      facts,
      turnCount: nextTurnCount,
      askedQuestionIds,
      unrankedConcerns: carriedConcerns,
      transcript: deps.transcript.append(priorTranscript, input.message, advisorMessage),
    });

    // ── 4. phrasing, validated ─────────────────────────────────────────────
    if (brandAnswer) {
      trace.setRoute("brand-answer");
      trace.setDeterministic();
      return {
        // A brand question asked and answered. It was reporting a product
        // status — the same kind of dishonesty GUIDANCE_READY was added to
        // fix — and offering a consultation off the back of "do you carry X",
        // which is a sales reflex rather than a next step that follows.
        // route: brand-answer
        status: "ANSWERED",
        state: stateAfter(deps.sanitizeForOutput(brandAnswer.response, MAX_RECOMMENDATION_CHARS)),
        assessment: summarise(assessment),
        nextQuestion: null,
        preliminaryGuidance: null,
        recommendationChange: "none",
        productEducation: null,
        message: deps.sanitizeForOutput(brandAnswer.response, MAX_RECOMMENDATION_CHARS),
        canonicalResponseId: brandAnswer.id,
        consultationCta: { recommended: false, reasons: [] },
        guardrailInterventions: interventions,
        error: null,
        diagnostics: trace.done(),
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
        trace.setRoute("answer");
        return {
        // route: answer
          status: "ANSWERED",
          state: stateAfter(answered.message),
          assessment: summarise(assessment),
          nextQuestion: null,
        preliminaryGuidance: null,
        recommendationChange: "none",
        productEducation: null,
          message: answered.message,
          canonicalResponseId: null,
          // An answer earns the booking path when they asked to schedule, or
          // when the question they asked WAS about the visit — "is there a
          // minimum?", "how soon can you come out?". Product education never
          // earns it.
          consultationCta:
            askedToSchedule || answered.invitesConsultation
              ? { recommended: true, reasons: [askedToSchedule ? "customer-asked-to-schedule" : "answer-invites-consultation"] }
              : { recommended: false, reasons: [] },
          guardrailInterventions: interventions,
          error: null,
          diagnostics: trace.done(),
        };
      }
      // NOTHING APPROVED COVERS IT — AND THAT IS STILL AN ANSWER.
      //
      // This used to fall through to the product pipeline, which meant someone
      // asking "do you have a showroom?" was answered with "what room is this
      // for?". An unanswered business question is not a window project, and
      // turning a gap in our knowledge into a qualification interview is worse
      // than saying we do not know.
      //
      // The phrasing prompt is handed no approved material, which is the state
      // it is already written for: it says plainly that it would rather have
      // someone confirm than guess, and it may not invent the answer.
      // A MODEL IS NOT NEEDED TO SAY WE DO NOT KNOW. Phrasing this cost 2.7
      // seconds to produce a sentence with no variable content in it — the
      // server already knows the answer is "we have not got that verified".
      // The wording is approved, so it is served rather than generated.
      trace.setRoute("unknown");
      trace.setDeterministic();
      const unknown = deps.sanitizeForOutput(deps.unknownAnswer, MAX_ANSWER_CHARS);
      return {
        // route: unknown
        status: "ANSWERED",
        state: stateAfter(unknown),
        assessment: summarise(assessment),
        nextQuestion: null,
        preliminaryGuidance: null,
        recommendationChange: "none",
        productEducation: null,
        message: unknown,
        canonicalResponseId: null,
        // Not knowing something is not a reason to sell a visit — unless the
        // thing they were asking about was the visit.
        consultationCta: askedToSchedule
          ? { recommended: true, reasons: ["customer-asked-to-schedule"] }
          : { recommended: false, reasons: [] },
        guardrailInterventions: interventions,
        error: null,
        diagnostics: trace.done(),
      };
    }

    // ── 3c. they want help and do not know where to start ──────────────────
    //
    // ONCE. The discovery prompt asks one broad, open question — "tell me about
    // the space", "what are you hoping to improve" — which is the right opening
    // and a terrible second move. A real preview ran it three turns running: a
    // homeowner who had already said they bought a new home, needed coverings,
    // and had bare windows was asked what made them think about blinds, then
    // what it was like living with them bare. They answered "obviously" twice,
    // which is what someone types when they are being made to restate
    // themselves.
    //
    // After the opening, a turn with nothing established goes to the question
    // path instead, which asks something concrete and answerable.
    const openedDiscovery = askedQuestionIds.includes(DISCOVERY_OPENING_ID);
    if (
      validated.intent === "discovery" &&
      assessment.strongCandidates.length === 0 &&
      !openedDiscovery
    ) {
      trace.setRoute("discovery");
      const message = await phraseSafely(
        deps.prompts.discoverySystemPrompt(guardrails, history),
        deps.prompts.phrasingUserMessage({
          "recent conversation": history || undefined,
          "their message": input.message,
        }),
        ANSWER_TOKENS,
        MAX_ANSWER_CHARS,
        DISCOVERY_FALLBACK,
        interventions
      );
      return {
        // route: discovery
        status: "ANSWERED",
        state: {
          ...stateAfter(message),
          askedQuestionIds: [...askedQuestionIds, DISCOVERY_OPENING_ID],
        },
        assessment: summarise(assessment),
        nextQuestion: null,
        preliminaryGuidance: null,
        recommendationChange: "none",
        productEducation: null,
        message,
        canonicalResponseId: null,
        consultationCta: { recommended: false, reasons: [] },
        guardrailInterventions: interventions,
        error: null,
        diagnostics: trace.done(),
      };
    }

    const status = productStatus;

    if (status === "NEED_MORE_INFORMATION" && selection.next) {
      const question = selection.next;

      // THE QUESTION IS ASKED EITHER WAY. Everything below decides only what
      // precedes it. The counterfactual gate has already ruled that this fact
      // materially changes the direction, and nothing here softens that — every
      // branch still asks, still records the question, and still reports
      // NEED_MORE_INFORMATION.
      //
      // Three branches, in precedence order, and they are three different
      // situations rather than three flavours of one:
      //
      //   THE ENGINE NARROWED SOMETHING — Phase 6. Strongest, so it wins: a
      //     deterministic leaning is worth more than an explanation.
      //   THE ENGINE NARROWED NOTHING, BUT THEY ASKED ABOUT A PRODUCT — Phase 7.
      //     Verified knowledge about the products THEY named. Never a shortlist,
      //     because the selection is theirs.
      //   NEITHER — the question by itself, which is honest and was always
      //     right for a message that told us a fact and asked nothing.
      const guidance = preliminaryGuidance(assessment);
      const educate = guidance
        ? []
        : deps.selectProductEducation(input.message, deps.knowledge.directions);
      const educating = educate.length > 0;
      trace.setRoute(guidance ? "guided-question" : educating ? "educated-question" : "question");

      const phrased = await phraseSafely(
        guidance
          ? deps.prompts.preliminaryGuidanceSystemPrompt(guardrails, corrected, history)
          : educating
            ? deps.prompts.productEducationSystemPrompt(guardrails, corrected, history)
            : deps.prompts.questionSystemPrompt(guardrails, corrected, history),
        deps.prompts.phrasingUserMessage({
          "recent conversation": history || undefined,
          "their message": input.message,
          "what the analysis already supports": guidance ? describeGuidance(guidance) : undefined,
          "what luxe knows about the products they asked about": educating
            ? educate.map((d) => deps.describeDirection(d)).join("\n\n")
            : undefined,
          "question to ask": question.canonical,
          "why it matters": question.materialTo.length
            ? `It could change whether these fit: ${question.materialTo.join(", ")}.`
            : undefined,
        }),
        // A turn that says two things rather than one gets the budget of an
        // answer instead of the budget of a bare question. No existing limit
        // moves.
        guidance || educating ? ANSWER_TOKENS : QUESTION_TOKENS,
        guidance || educating ? MAX_ANSWER_CHARS : MAX_QUESTION_CHARS,
        guidance
          ? fallbackPreliminary(guidance, question.canonical)
          : educating
            ? fallbackEducation(educate, question.canonical)
            : fallbackQuestion(question.canonical),
        interventions
      );

      return {
        // route: question | guided-question
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
        preliminaryGuidance: guidance,
        productEducation: educating ? educate.map((d) => ({ id: d.id, label: d.label })) : null,
        // A gated turn is not recommending, so nothing about the space's
        // presented direction changes.
        recommendationChange: "none",
        message: phrased,
        canonicalResponseId: null,
        // UNCHANGED, AND DELIBERATELY SO. Naming a direction we are leaning
        // toward is not a reason to sell a visit; Phase 2's rule that the
        // booking prompt has to be earned still owns this decision, and
        // NEED_MORE_INFORMATION never earns it on its own.
        consultationCta: consultationIntent(assessment, status, askedToSchedule),
        guardrailInterventions: interventions,
        error: null,
        diagnostics: trace.done(),
      };
    }

    // A turn with no strong candidate must not be handed the recommendation
    // prompt: it opens with "lead with the direction that fits", which is the
    // one claim this turn is not entitled to make.
    trace.setRoute(status === "GUIDANCE_READY" ? "guidance" : "recommendation");
    const givingGuidance = status === "GUIDANCE_READY";

    // ── recommendation continuity ──────────────────────────────────────────
    //
    // DETERMINISTIC IDENTITY, PER AREA. A homeowner who added "I'm very
    // sensitive to light" to a bedroom already pointed at cellular shades was
    // told about cellular shades a second time, with the same card underneath.
    // The fact reinforced the direction; it did not discover one. Nothing
    // remembered what had already been said, because the assessment was
    // recomputed each turn and thrown away.
    //
    // Compared by direction id against what this space was actually shown —
    // never by looking for a product name in the last thing the advisor wrote.
    // THE PROSE HAS TO KNOW WHAT THE SERVER DECIDED. A live reply said "our
    // team will look at the actual openings and trim during the consultation"
    // on a turn where the CTA was correctly withheld — the phrasing layer had
    // no idea, so it assumed a visit was happening and effectively made the
    // offer in words the Phase 2 rules never authorised.
    const consultationAuthorized = consultationIntent(assessment, status, askedToSchedule).recommended;

    const currentDirection =
      status === "RECOMMENDATION_READY" ? assessment.strongCandidates[0]?.id ?? null : null;
    const areaNow = deps.project.active(project);
    const change = deps.project.change(currentDirection, areaNow?.presented?.directionId ?? null);
    const presenting = change === "new" || change === "changed";
    const fallback = givingGuidance
      ? fallbackGuidance(assessment)
      : fallbackRecommendation(assessment);
    // The verified prose this turn writes from, hoisted so the superlative check
    // can be held to the same material the model was given and no other.
    const directionMaterial = (() => {
      const primary = assessment.strongCandidates[0];
      const direction = primary
        ? deps.knowledge.directions.find((d) => d.id === primary.id)
        : undefined;
      return direction ? describeForProperties(direction, facts.priorities ?? []) : "";
    })();

    const message = await phraseSafely(
      givingGuidance
        ? deps.prompts.guidanceSystemPrompt(assessment, guardrails, corrected, history, consultationAuthorized)
        : deps.prompts.recommendationSystemPrompt(
            assessment,
            guardrails,
            corrected,
            history,
            consultationAuthorized,
            change
          ),
      deps.prompts.phrasingUserMessage({
        "recent conversation": history || undefined,
        "their message": input.message,
        "best fit": assessment.strongCandidates
          .map((c) => `${c.label} — ${c.reasons.join(" ")}`)
          .join("\n") || "(no single direction stands out yet)",
        // WHAT LUXE ACTUALLY KNOWS ABOUT IT, not only why it won.
        //
        // The promotion reasons state a conclusion — "among Luxe's preferred
        // directions when a customer wants a very dark room" — and give no
        // mechanism for it. Asked to explain, and handed no explanation, the
        // model supplied one: it borrowed the honeycomb-and-trapped-air
        // construction, which this corpus credits with INSULATION, and offered
        // it as the reason cellular shades block light. Neither the phrasing
        // nor the claim appears anywhere in Luxe's material.
        //
        // So the verified behaviour prose goes in. Where the material gives a
        // mechanism the model now has the right one; where it does not, the
        // prompt tells it to state the conclusion and stop.
        "what luxe knows about that direction": directionMaterial || undefined,
        alternatives: assessment.deprioritizedDirections
          .map((c) => `${c.label} — ${c.reasons.join(" ")}`)
          .join("\n"),
        tradeoffs: assessment.tradeoffs.map((t) => `${t.label}: ${t.note}`).join("\n"),
        "luxe will verify": assessment.verificationRequirements.map((v) => v.label).join("\n"),
        "conflicts to address": assessment.requestConflicts.map((c) => c.explanation).join("\n"),
      }),
      RECOMMENDATION_TOKENS,
      MAX_RECOMMENDATION_CHARS,
      fallback,
      interventions,
      directionMaterial
    );

    return {
      status,
      // Recorded only when the customer is actually shown it, so this is a
      // record of what they have seen rather than of what the engine computed.
      state: presenting && currentDirection
        ? stateAfter(message, deps.project.markPresented(project, areaNow?.id ?? null, currentDirection, nextTurnCount))
        : stateAfter(message),
      assessment: summarise(assessment),
      recommendationChange: change,
      nextQuestion: null,
      preliminaryGuidance: null,
      productEducation: null,
      message,
      canonicalResponseId: null,
      consultationCta: consultationIntent(assessment, status, askedToSchedule),
      guardrailInterventions: interventions,
      error: null,
      diagnostics: trace.done(),
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
    preliminaryGuidance: null,
    recommendationChange: "none",
    productEducation: null,
    canonicalResponseId: null,
    message:
      "We could not work through that just now. Our team can go through it with you directly — would you like to schedule a consultation?",
    consultationCta: { recommended: true, reasons: ["recommendation-ready"] },
    guardrailInterventions: [],
    error,
  };
}
