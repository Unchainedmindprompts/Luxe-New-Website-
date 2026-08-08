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
  /** Facts gathered so far. Re-validated against the Phase A vocabulary. */
  readonly facts?: ProjectFacts;
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

export type AdvisorStatus =
  | "NEED_MORE_INFORMATION"
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
    | "recommendation-ready"
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
  /** The model's phrasing in Luxe's voice, or the canonical text if phrasing failed validation. */
  readonly phrased: string;
  /** Directions whose standing could change once this is answered. */
  readonly materialTo: readonly DirectionId[];
}

export interface AdvisorResponse {
  readonly status: AdvisorStatus;
  /** The state the client should send back on the next turn. */
  readonly state: ConversationState;
  readonly assessment: AssessmentSummary | null;
  /** Present when status is NEED_MORE_INFORMATION. */
  readonly nextQuestion: NextQuestion | null;
  /** Customer-facing prose, already guardrail-validated. */
  readonly message: string;
  readonly consultationCta: ConsultationCtaIntent;
  /**
   * Guardrail ids that fired on generated text and forced a regeneration or a
   * deterministic fallback. Empty on a clean turn. Surfaced so Phase E can
   * measure how often the model tries to cross a line.
   */
  readonly guardrailInterventions: readonly string[];
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
    readonly system: string;
    readonly userMessage: string;
    readonly schema: Record<string, unknown>;
    readonly signal?: AbortSignal;
  }): Promise<unknown>;

  /** Ask the model for a short piece of customer-facing prose. */
  phrase(input: {
    readonly system: string;
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
