/**
 * Luxe Window Advisor — server contract. (Phase B)
 *
 * The typed request/response shape for the advisor endpoint.
 *
 * STATELESS AT THE BOUNDARY. There is no database and no server-side session.
 * The client sends the structured state it holds; the server returns updated
 * structured state. That keeps V1 free of storage, makes every request
 * independently replayable, and means an abandoned conversation leaves nothing
 * behind.
 *
 * CLIENT STATE IS NOT TRUSTED. `ConversationState.facts` arrives from the
 * client and is re-validated field by field against the Phase A vocabulary
 * before it reaches the engine — anything unrecognised is dropped, not
 * corrected. A client cannot inject business rules, only facts, and only facts
 * the domain layer already understands.
 */
import type { TranscriptMessage } from "./transcript";
import type { TurnTrace } from "./trace";
import type {
  DirectionId,
  FactKey,
  PriorityId,
  ProjectFacts,
} from "../types";

// ───────────────────────────── request ──────────────────────────────────────

/**
 * Everything the client believes about the conversation so far. All of it is
 * re-validated server-side.
 */
export interface ConversationState {
  /**
   * What the advisor knows and why — value, basis, evidence and turn per fact.
   * Re-validated on arrival exactly like a model response, then projected into
   * plain `ProjectFacts` for the engine, which never sees provenance.
   */
  readonly ledger?: Record<string, unknown>;
  /**
   * The plain projection, echoed for callers that only need the values.
   * Derived output — the ledger is the source of truth, and anything sent here
   * by a client is ignored.
   */
  readonly facts?: ProjectFacts;
  /**
   * The recent conversation, both sides, bounded and re-validated on arrival.
   *
   * SEPARATE FROM `ledger` ON PURPOSE, and not a second copy of it. The ledger
   * is what is true of the project and is all the deterministic engine ever
   * sees. This is what was said, and exists so the model can work out what
   * "that one" or "why?" refers to. Facts still have to be quoted out of the
   * customer's current message, so nothing said here can become one.
   */
  readonly transcript?: readonly TranscriptMessage[];
  /** How many advisor turns have already happened. Clamped server-side. */
  readonly turnCount?: number;
  /** Question ids already put to the homeowner, so they are not repeated. */
  readonly askedQuestionIds?: readonly string[];
  /**
   * Priorities the homeowner has named without saying which matters most.
   * Carried separately from `facts.priorities` because the engine's ranking
   * rules would otherwise read an arbitrary array order as a real ranking.
   */
  readonly unrankedConcerns?: readonly PriorityId[];
}

export interface AdvisorRequest {
  /** The homeowner's latest message. Untrusted text. */
  readonly message: string;
  readonly state?: ConversationState;
}

// ───────────────────────────── response ─────────────────────────────────────

/**
 * How much the advisor can honestly claim this turn.
 *
 * `GUIDANCE_READY` exists because the previous three-state contract forced a
 * lie: a turn that stopped asking questions was labelled
 * `RECOMMENDATION_READY` even when the prose it carried said "no single
 * direction stands out". The text was honest and the status field was not, and
 * anything keying off the status — rendering, analytics, CTA logic — would have
 * read it as a firm recommendation.
 */
export type AdvisorStatus =
  /**
   * A question was answered from approved knowledge. Not a recommendation and
   * not a stalled product flow — most of what a visitor wants is simply an
   * answer, and forcing that into a product status is what made the page feel
   * like a funnel.
   */
  | "ANSWERED"
  /** Nothing actionable yet, or a homeowner-answerable question still gates it. */
  | "NEED_MORE_INFORMATION"
  /** Genuinely useful direction exists, but no best-fit product has been selected. */
  | "GUIDANCE_READY"
  /** A strong candidate exists and nothing material is still blocking it. */
  | "RECOMMENDATION_READY"
  | "ADVISOR_UNAVAILABLE";

/**
 * A client-safe projection of `AdvisorAssessment`.
 *
 * Guardrails are reported by id only. Their prohibition text is an internal
 * instruction to the model, and publishing the full list would hand anyone
 * probing the endpoint an exact map of what to try to talk it into.
 */
export interface AssessmentSummary {
  readonly recognizedConditions: readonly { id: string; label: string }[];
  /**
   * THE one direction being recommended, or null when none has been earned.
   *
   * The single source of truth for "the direction". The phrasing prompt is told
   * to describe this and nothing else as the answer, and the card renders this
   * exact value — so the paragraph and the panel beside it cannot name different
   * products. Before this existed the card showed `strongCandidates[0]` while
   * the model picked freely from the same list, and a homeowner could read
   * "interior roller shades are the direction here" directly above a card
   * headed "Banded shades".
   */
  readonly primaryRecommendation: { id: DirectionId; label: string; reasons: readonly string[] } | null;
  readonly strongCandidates: readonly { id: DirectionId; label: string; reasons: readonly string[] }[];
  readonly alternatives: readonly { id: DirectionId; label: string; reasons: readonly string[] }[];
  readonly excluded: readonly { id: DirectionId; label: string; reasons: readonly string[] }[];
  readonly recommendedOptions: readonly { id: string; label: string }[];
  readonly optionsToAvoid: readonly { id: string; label: string }[];
  readonly tradeoffs: readonly { id: string; label: string; note: string }[];
  readonly verificationRequirements: readonly { id: string; label: string }[];
  readonly escalation: { readonly required: boolean; readonly triggers: readonly { id: string; label: string }[] };
  readonly requestConflicts: readonly { id: string; explanation: string }[];
  /** Ids only — see the note on this interface. */
  readonly guardrailIdsInForce: readonly string[];
  readonly unknownDimensions: readonly FactKey[];
}

/**
 * Why a consultation is worth offering right now. Phase C/D decides how to
 * render it; Phase B only states the intent and the reasons behind it.
 */
export interface ConsultationCtaIntent {
  readonly recommended: boolean;
  readonly reasons: readonly (
    /** They asked to take the next step. Outranks everything. */
    | "customer-asked-to-schedule"
    /** The question they asked was itself about the visit. */
    | "answer-invites-consultation"
    | "recommendation-ready"
    | "guidance-ready"
    | "requires-physical-verification"
    | "high-complexity-project"
    | "exterior-mounting-or-power-conditions"
    | "request-conflict-needs-discussion"
  )[];
}

export interface NextQuestion {
  /** The Phase A question rule id, or a synthesized id for the priority-order ask. */
  readonly id: string;
  /** The canonical wording from the domain layer. Always populated. */
  readonly canonical: string;
  /**
   * The spoken turn, in Luxe's voice — or the canonical text if phrasing failed
   * validation. Identical to `message`.
   *
   * On a turn carrying `preliminaryGuidance` this is the whole utterance, so it
   * opens with what the engine could already say and closes with the question.
   * The question is still the last thing said and still the only thing asked.
   */
  readonly phrased: string;
  /** Directions whose standing could change once this is answered. */
  readonly materialTo: readonly DirectionId[];
}

/**
 * What the engine could already say, on a turn where a question still gates the
 * recommendation.
 *
 * NOT A RECOMMENDATION, AND DELIBERATELY NOT SHAPED LIKE ONE. There is no
 * `primaryRecommendation` here and the status stays `NEED_MORE_INFORMATION`, so
 * nothing downstream can mistake "we are leaning this way" for "this is the
 * answer" — the recommendation card is gated on `RECOMMENDATION_READY` and
 * remains unreachable from this turn.
 *
 * It exists because the engine frequently knows something useful before it
 * knows enough. A homeowner describing glare over a view they want to keep has
 * already narrowed the field to solar shades; a nursery has already ruled out
 * corded operation. Discarding that and replying with a bare question is what
 * makes an advisor read as a questionnaire.
 *
 * `null` when the engine has genuinely narrowed nothing. That case is real and
 * common, and padding it with generic product talk would be inventing guidance
 * rather than surfacing it.
 */
export interface PreliminaryGuidance {
  /** The direction currently leading, if one is. Never "the recommendation". */
  readonly leaning: { readonly id: DirectionId; readonly label: string } | null;
  /** Operating choices the engine positively indicates — cordless, motorization. */
  readonly favour: readonly { readonly id: string; readonly label: string }[];
  /** Operating choices the engine steers away from, such as corded in a nursery. */
  readonly avoid: readonly { readonly id: string; readonly label: string }[];
}

export interface AdvisorResponse {
  readonly status: AdvisorStatus;
  /** The state the client should send back on the next turn. */
  readonly state: ConversationState;
  readonly assessment: AssessmentSummary | null;
  /** Present when status is NEED_MORE_INFORMATION. */
  readonly nextQuestion: NextQuestion | null;
  /**
   * What could be said before the question, when anything could. See the type.
   * Non-null only alongside `nextQuestion`, and never a recommendation.
   */
  readonly preliminaryGuidance: PreliminaryGuidance | null;
  /**
   * Products the homeowner asked about on a turn that still needs a fact.
   *
   * A DIFFERENT MECHANISM FROM `preliminaryGuidance`, AND KEPT SEPARATE ON
   * PURPOSE. That field is the engine having narrowed the project. This one is
   * the engine having narrowed nothing, while the customer asked a question
   * about a product Luxe genuinely carries — "would cellular shades work for my
   * west-facing bedroom?" deserves an answer about cellular shades before it
   * deserves a question about darkening.
   *
   * Labels only, and only ones the customer named. Nothing here selects a
   * product on the homeowner's behalf, so this can never become a shortlist the
   * engine did not authorise.
   */
  readonly productEducation: readonly { readonly id: DirectionId; readonly label: string }[] | null;
  /** Customer-facing prose, already guardrail-validated. */
  readonly message: string;
  /**
   * Set when `message` is approved copy returned verbatim rather than model
   * output — currently the canonical brand answers. Phase C can render these
   * differently; analytics can count them separately.
   */
  readonly canonicalResponseId: string | null;
  readonly consultationCta: ConsultationCtaIntent;
  /**
   * Guardrail ids that fired on generated text and forced a regeneration or a
   * deterministic fallback. Empty on a clean turn. Surfaced so Phase E can
   * measure how often the model tries to cross a line.
   */
  readonly guardrailInterventions: readonly string[];
  /**
   * Where this turn spent its time. Shape only — durations, counts, a route
   * name. Never reaches the browser: the client contract is an allowlist and
   * does not know this field exists.
   */
  readonly diagnostics?: TurnTrace;
  /** Populated only when status is ADVISOR_UNAVAILABLE. Never a provider message. */
  readonly error: AdvisorErrorCode | null;
}

export type AdvisorErrorCode =
  | "message-required"
  | "message-too-long"
  | "payload-too-large"
  | "conversation-limit-reached"
  | "rate-limited"
  | "extraction-failed"
  | "provider-unavailable"
  | "provider-timeout";

// ───────────────────────────── prompt shape ─────────────────────────────────

/**
 * A system prompt, split at the point where it stops being the same on every
 * call.
 *
 * `stable` is byte-identical for every turn served by a given deployment: who
 * the advisor is, what it may and may not assert, the extraction vocabulary,
 * how Luxe sounds. `dynamic` is this turn — the ledger, the approved material
 * for this question, the guardrails Phase A scoped to this project.
 *
 * THE SPLIT IS ARCHITECTURAL BEFORE IT IS AN OPTIMISATION. Writing a prompt in
 * two pieces forces the question "is this a rule, or is it today's data?" to be
 * answered once per line rather than left implicit, and it is what keeps the
 * per-turn material from being scattered through four thousand tokens of
 * instruction.
 *
 * It also happens to be exactly the shape a provider prefix cache needs, since
 * a cache hit requires an identical *prefix* — which is why `dynamic` must be
 * appended after `stable` and never interleaved with it. Whether a given
 * provider actually caches it is that adapter's business; nothing above the
 * port knows or cares.
 */
export interface SystemPrompt {
  /** Identical on every call. Must be rendered first. */
  readonly stable: string;
  /** This turn's material. Rendered after `stable`, or omitted when empty. */
  readonly dynamic?: string;
}

/** The two halves as one string, for logging, measurement and mocks. */
export function renderSystemPrompt(prompt: SystemPrompt): string {
  return prompt.dynamic?.trim() ? `${prompt.stable}\n\n${prompt.dynamic}` : prompt.stable;
}

/**
 * What a call actually cost, in tokens. Reported by the adapter when the
 * provider supplies it, so cache behaviour can be *measured* rather than
 * assumed — a `cache_control` marker that silently fails to cache looks exactly
 * like one that works.
 */
export interface ProviderUsage {
  readonly stage: "extraction" | "phrasing";
  readonly inputTokens: number;
  readonly outputTokens: number;
  /** Tokens written into the cache on this call. Non-zero means a cache MISS. */
  readonly cacheCreationTokens: number;
  /** Tokens served from the cache. Non-zero means a cache HIT. */
  readonly cacheReadTokens: number;
  /**
   * How many of `outputTokens` the model spent on internal reasoning.
   *
   * The measurement Phase 5 needed and did not have. Live tracing put a model
   * call at roughly a fixed 2.2–2.5s floor plus 9–13ms per output token, which
   * makes output tokens the one lever that moves wall clock — and `output_tokens`
   * bundles thinking with the visible reply, so it could not be said which half
   * to attack. One extraction call emitted 524 output tokens for a delta whose
   * JSON is a fraction of that; without this field, whether the rest was
   * reasoning is a guess.
   *
   * Zero when the provider does not report a breakdown.
   */
  readonly thinkingTokens: number;
}

// ───────────────────────────── provider port ────────────────────────────────

/**
 * The seam between advisor reasoning and whichever model serves it.
 *
 * Everything above this line is provider-agnostic and unit-testable with a mock;
 * the concrete Anthropic adapter is the only module that knows about an SDK, a
 * model id, or an API key. Swapping or A/B-testing a model is a change to one
 * file — the advisor architecture does not move.
 */
export interface AdvisorProvider {
  /**
   * Ask the model for a value matching `schema`. The implementation must use
   * the provider's native structured-output support; callers may assume the
   * result parsed, not that it is semantically valid.
   */
  extract(input: {
    readonly system: SystemPrompt;
    readonly userMessage: string;
    readonly schema: Record<string, unknown>;
    readonly signal?: AbortSignal;
  }): Promise<unknown>;

  /** Ask the model for a short piece of customer-facing prose. */
  phrase(input: {
    readonly system: SystemPrompt;
    readonly userMessage: string;
    readonly maxTokens: number;
    readonly signal?: AbortSignal;
  }): Promise<string>;
}

/**
 * The failure shape a provider throws.
 *
 * Declared as an interface, not a class, on purpose: everything in the
 * reasoning path imports from this file with `import type`, which Node erases
 * entirely. A class here would be a runtime import and would drag the whole
 * module graph into the test harness. The orchestrator therefore recognises a
 * provider failure structurally, by its `code`, and the concrete error class
 * lives beside the adapter that throws it.
 */
export interface ProviderFailure {
  readonly code: Extract<AdvisorErrorCode, "provider-unavailable" | "provider-timeout">;
}
