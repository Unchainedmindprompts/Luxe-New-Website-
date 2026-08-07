/**
 * Luxe Window Advisor — domain types. (Phase A)
 *
 * This file defines the vocabulary of the advisor. Nothing here reasons; it
 * only says what a fact, a rule, a product direction and an assessment are.
 *
 * Two design rules govern everything below.
 *
 * 1. RULES ARE DATA, NOT CODE. A contraindication, a promotion, an escalation
 *    trigger and a guardrail are all expressed as a serialisable `Condition`
 *    tree rather than a predicate function. That keeps the business contract
 *    readable by someone who does not write TypeScript, keeps it diffable in
 *    review, and lets a single evaluator decide every rule the same way.
 *
 * 2. PARTIAL INFORMATION IS THE NORMAL CASE. Every field on `ProjectFacts` is
 *    optional, and "we were never told" is deliberately distinguishable from
 *    "we were told there are none": an undefined list means the dimension is
 *    unknown, an empty list means it was asked and came back clean. That
 *    distinction is what stops the advisor re-asking a question the homeowner
 *    already answered.
 *
 * The engine consuming these types produces reasoning *inputs* — eligible
 * directions, tradeoffs, open questions, escalation status. It never produces
 * customer-facing prose, and no model is involved at this layer.
 */

// ───────────────────────────── customer priorities ──────────────────────────

/**
 * The priority vocabulary from the approved brief. Priority ORDER matters more
 * than priority presence: two homeowners with the same window and the same list
 * in a different order can need different products.
 */
export type PriorityId =
  | "budget"
  | "functionality"
  | "aesthetics"
  | "energy-efficiency"
  | "room-darkening"
  | "privacy"
  | "view-preservation"
  | "glare-control"
  | "child-safety"
  | "accessibility"
  | "convenience"
  | "motorization"
  | "durability"
  | "moisture-resistance"
  | "clear-glass-when-open"
  | "directional-light-control"
  | "lifestyle-requirement";

// ───────────────────────────── scalar project facts ─────────────────────────

export type RoomId =
  | "bedroom"
  | "nursery"
  | "living"
  | "kitchen"
  | "bathroom"
  | "dining"
  | "office"
  | "media"
  | "patio"
  | "commercial"
  | "other";

export type ExposureId = "north" | "south" | "east" | "west" | "mixed" | "unknown";

export type Severity = "none" | "mild" | "moderate" | "severe" | "unknown";

export type Importance = "none" | "low" | "moderate" | "high" | "critical" | "unknown";

export type PrivacyNeed = "none" | "daytime" | "nighttime" | "both" | "unknown";

/**
 * `total-blackout-requested` records what the homeowner asked for. It is
 * deliberately not a level of darkening the advisor can promise — a guardrail
 * fires on it.
 */
export type DarkeningExpectation =
  | "none"
  | "moderate"
  | "maximum"
  | "total-blackout-requested"
  | "unknown";

/**
 * How the window is actually used. The approved brief treats this as the first
 * question for anyone asking about blinds: someone who raises the covering to
 * expose clear glass wants a shade, someone who leaves it down and adjusts
 * louvers wants a Venetian or a shutter.
 */
export type WindowUse =
  | "raised-to-clear-glass"
  | "left-down-louvers-adjusted"
  | "rarely-operated"
  | "mixed"
  | "unknown";

export type OperationFrequency = "daily" | "occasional" | "rare" | "unknown";

/** How sensitive the project is to cost — not a budget figure. */
export type BudgetSensitivity = "low" | "moderate" | "high" | "unknown";

export type MoistureExposure = "none" | "humid" | "direct-splash" | "unknown";

export type MotorizationInterest = "requested" | "open" | "uninterested" | "unknown";

// ───────────────────────────── list-valued project facts ────────────────────

export type AestheticId =
  | "traditional"
  | "modern-minimal"
  | "architectural"
  | "fabric-forward"
  | "formal"
  | "luxury-unspecified";

export type AccessConditionId =
  | "hard-to-reach"
  | "high-window"
  | "above-tub"
  | "furniture-blocked"
  | "mobility-or-age-limited";

export type GeometryConditionId =
  | "specialty-shape"
  | "extremely-tall-narrow"
  | "very-wide"
  | "multi-window-bank"
  | "small-window"
  | "large-architectural-glass";

export type ExteriorConditionId =
  | "high-wind-exposure"
  | "unknown-mounting-substrate"
  | "no-hardwired-power"
  | "ice-accumulation";

export type OpeningConditionId =
  | "sliding-door"
  | "patio-door-frequent-use"
  | "tilt-in-window"
  | "french-door"
  | "obstruction-faucet"
  | "obstruction-furniture"
  | "obstruction-window-handle"
  | "obstruction-trim-or-switch"
  | "inadequate-stack-back"
  | "shallow-room-depth";

/**
 * Things a homeowner explicitly asks for that are not themselves products.
 * Several of these are requests Luxe cannot fulfil as stated, which is exactly
 * why they are modelled: the advisor has to recognise the request in order to
 * redirect it rather than silently ignore it.
 */
export type RequestedFeatureId =
  | "total-blackout"
  | "free-hanging-exterior-shade"
  | "stained-synthetic-shutter"
  | "oversized-louvers"
  | "inside-mount"
  | "full-functional-drapery"
  | "large-pattern-fabric"
  | "battery-powered-exterior";

/** Every list-valued fact member, flattened, for `{ has: … }` conditions. */
export type FactFlag =
  | AestheticId
  | AccessConditionId
  | GeometryConditionId
  | ExteriorConditionId
  | OpeningConditionId;

// ───────────────────────────── product directions ───────────────────────────

export type SingleDirectionId =
  | "cellular"
  | "interior-roller"
  | "interior-solar"
  | "shutters"
  | "wood-blinds"
  | "faux-composite-blinds"
  | "roman-shades"
  | "drapery"
  | "exterior-solar";

/**
 * Layered directions are first-class candidates, not afterthoughts. The
 * approved brief names both of these as Luxe preferences in their own right,
 * and forcing every recommendation into a single SKU-like product would lose
 * them.
 */
export type LayeredDirectionId =
  | "exterior-solar-plus-interior-privacy"
  | "functional-shade-plus-stationary-panels";

export type DirectionId = SingleDirectionId | LayeredDirectionId;

// ───────────────────────────── condition grammar ────────────────────────────

/** Scalar facts addressable by a condition. */
export type ScalarFactKey =
  | "room"
  | "exposure"
  | "solarHeat"
  | "viewImportance"
  | "privacyNeed"
  | "roomDarkening"
  | "windowUse"
  | "operationFrequency"
  | "budgetSensitivity"
  | "moistureExposure"
  | "motorizationInterest";

/** List facts addressable by a condition. */
export type ListFactKey =
  | "priorities"
  | "aesthetic"
  | "access"
  | "geometry"
  | "exteriorConditions"
  | "openings"
  | "requestedProducts"
  | "requestedFeatures";

export type FactKey = ScalarFactKey | ListFactKey;

/**
 * A serialisable boolean expression over project facts.
 *
 * `{ priority, withinTop }` is the ranking-aware form: `withinTop: 1` means
 * "this is their single highest priority", which is a materially different
 * claim from "they mentioned it". Omitting `withinTop` means "present at any
 * rank".
 *
 * `{ unknown }` is true when a dimension was never supplied — undefined, or the
 * literal `"unknown"` for a scalar. It is what lets a rule fire *because* of
 * missing information rather than in spite of it.
 */
export type Condition =
  | { readonly has: FactFlag }
  | { readonly fact: ScalarFactKey; readonly is: readonly string[] }
  | { readonly priority: PriorityId; readonly withinTop?: number }
  | { readonly requestedProduct: SingleDirectionId }
  | { readonly requestedFeature: RequestedFeatureId }
  | { readonly unknown: FactKey }
  | { readonly all: readonly Condition[] }
  | { readonly any: readonly Condition[] }
  | { readonly not: Condition };

// ───────────────────────────── knowledge records ────────────────────────────

/**
 * A reason a direction is wrong, or weaker, for a given project.
 *
 * `exclude` removes the direction from consideration entirely. `deprioritize`
 * keeps it available — a homeowner may still choose it with the tradeoff
 * explained — but stops it being surfaced as a strong candidate.
 */
export interface Contraindication {
  readonly id: string;
  readonly effect: "exclude" | "deprioritize";
  readonly when: Condition;
  readonly reason: string;
}

export interface ProductDirection {
  readonly id: DirectionId;
  readonly kind: "single" | "layered";
  readonly label: string;
  /** Present only on layered directions. */
  readonly components?: readonly SingleDirectionId[];
  /**
   * Product slugs on the public site this direction corresponds to, declared
   * explicitly rather than inferred from display names. Empty is legitimate and
   * must be explained in `siteCoverageNote`. The drift cross-check reads this.
   */
  readonly siteProductSlugs: readonly string[];
  readonly siteCoverageNote: string;
  readonly prioritiesServed: readonly PriorityId[];
  readonly strengths: readonly string[];
  readonly weakFits: readonly string[];
  readonly viewBehavior: string;
  readonly privacyBehavior: string;
  readonly roomDarkeningBehavior: string;
  readonly energyBehavior: string;
  readonly moistureConsiderations: string;
  readonly accessConsiderations: string;
  readonly motorizationConsiderations: string;
  readonly scaleConsiderations: string;
  readonly designCharacteristics: string;
  /** Ids into the tradeoff catalogue. */
  readonly knownTradeoffs: readonly string[];
  readonly contraindications: readonly Contraindication[];
  /** Ids into the verification catalogue. */
  readonly verificationTriggers: readonly string[];
}

/**
 * An option that applies across product directions rather than being one.
 * Motorization is the example: it is a real Luxe product page and a real
 * decision, but it is not a window covering.
 */
export interface CrossCuttingOption {
  readonly id: string;
  readonly label: string;
  readonly siteProductSlugs: readonly string[];
  readonly siteCoverageNote: string;
  readonly indicatedWhen: Condition;
  readonly cautions: readonly string[];
}

/**
 * A site product category the approved brief contains no knowledge about.
 * Declaring it is how the cross-check distinguishes "we chose not to advise on
 * this" from "the advisor silently lost a category".
 */
export interface UnrepresentedSiteProduct {
  readonly slug: string;
  readonly reason: string;
}

export interface PriorityDefinition {
  readonly id: PriorityId;
  readonly label: string;
  readonly clarifies: string;
}

export interface RecognitionRule {
  readonly id: string;
  readonly label: string;
  readonly when: Condition;
}

/**
 * Promotes a direction to strong-candidate status. `weight` orders the output
 * for readability only — it is not a score that selects a single winner, and no
 * behavioural assertion depends on rank.
 */
export interface PromotionRule {
  readonly id: string;
  readonly direction: DirectionId;
  readonly when: Condition;
  readonly weight: 1 | 2 | 3;
  readonly rationale: string;
}

export interface TradeoffRule {
  readonly id: string;
  readonly label: string;
  readonly poles: readonly [string, string];
  readonly when: Condition;
  readonly note: string;
}

export interface QuestionRule {
  readonly id: string;
  readonly question: string;
  readonly when: Condition;
  /**
   * Suppresses the question once every listed dimension is known. This is the
   * machine-readable form of "do not ask questions the visitor has already
   * answered".
   */
  readonly askOnlyIfUnknown: readonly FactKey[];
  /** Directions whose standing could change once this is answered. */
  readonly materialTo: readonly DirectionId[];
}

export interface VerificationRule {
  readonly id: string;
  readonly label: string;
  readonly when: Condition;
}

export interface EscalationRule {
  readonly id: string;
  readonly label: string;
  readonly when: Condition;
}

/**
 * A conflict between the product a homeowner named and what they said they
 * actually want. Modelled explicitly because "recommend solely based on the
 * customer's initial product name" is a hard prohibition, so the conflict has
 * to be a first-class output rather than an emergent side effect of ranking.
 */
export interface ConflictRule {
  readonly id: string;
  readonly when: Condition;
  readonly requested: SingleDirectionId | RequestedFeatureId;
  readonly redirectTo: readonly DirectionId[];
  readonly explanation: string;
}

export type GuardrailScope = "always" | "conditional";

export interface Guardrail {
  readonly id: string;
  readonly prohibition: string;
  readonly scope: GuardrailScope;
  /** Required when scope is `conditional`; ignored when `always`. */
  readonly when?: Condition;
  readonly permittedInstead: string;
  /** Which section of the approved brief this came from. */
  readonly source: string;
}

/** Canonical business facts that are not product knowledge. */
export interface BusinessPolicy {
  readonly id: string;
  readonly statement: string;
}

// ───────────────────────────── engine input ─────────────────────────────────

/**
 * Everything the advisor believes about a project. All fields optional: a real
 * conversation supplies these a few at a time, and the engine must produce a
 * usable assessment at every stage of that.
 */
export interface ProjectFacts {
  /** Verbatim problem statements. Recorded for downstream use; never parsed here. */
  readonly goals?: readonly string[];
  /** Ranked, highest first. */
  readonly priorities?: readonly PriorityId[];
  readonly room?: RoomId;
  readonly exposure?: ExposureId;
  readonly solarHeat?: Severity;
  readonly viewImportance?: Importance;
  readonly privacyNeed?: PrivacyNeed;
  readonly roomDarkening?: DarkeningExpectation;
  readonly windowUse?: WindowUse;
  readonly operationFrequency?: OperationFrequency;
  readonly budgetSensitivity?: BudgetSensitivity;
  readonly moistureExposure?: MoistureExposure;
  readonly motorizationInterest?: MotorizationInterest;
  readonly aesthetic?: readonly AestheticId[];
  readonly access?: readonly AccessConditionId[];
  readonly geometry?: readonly GeometryConditionId[];
  readonly exteriorConditions?: readonly ExteriorConditionId[];
  readonly openings?: readonly OpeningConditionId[];
  readonly requestedProducts?: readonly SingleDirectionId[];
  readonly requestedFeatures?: readonly RequestedFeatureId[];
  /** Things the homeowner has flagged as unknown to them. Carried, not reasoned over. */
  readonly knownUnknowns?: readonly string[];
  readonly serviceAreaConfirmed?: boolean;
}

/** The knowledge the engine reasons with, supplied rather than imported. */
export interface AdvisorKnowledge {
  readonly directions: readonly ProductDirection[];
  readonly crossCuttingOptions: readonly CrossCuttingOption[];
  readonly unrepresentedSiteProducts: readonly UnrepresentedSiteProduct[];
  readonly priorities: readonly PriorityDefinition[];
  readonly recognition: readonly RecognitionRule[];
  readonly promotions: readonly PromotionRule[];
  readonly tradeoffs: readonly TradeoffRule[];
  readonly questions: readonly QuestionRule[];
  readonly verifications: readonly VerificationRule[];
  readonly escalations: readonly EscalationRule[];
  readonly conflicts: readonly ConflictRule[];
  readonly guardrails: readonly Guardrail[];
  readonly businessPolicies: readonly BusinessPolicy[];
}

// ───────────────────────────── engine output ────────────────────────────────

export interface RankedDirection {
  readonly id: DirectionId;
  readonly label: string;
  readonly kind: "single" | "layered";
  /** Sum of firing promotion weights. Ordering aid only. */
  readonly weight: number;
  readonly reasons: readonly string[];
}

export interface RecognizedCondition {
  readonly id: string;
  readonly label: string;
}

export interface SurfacedTradeoff {
  readonly id: string;
  readonly label: string;
  readonly poles: readonly [string, string];
  readonly note: string;
}

export interface UnresolvedQuestion {
  readonly id: string;
  readonly question: string;
  readonly materialTo: readonly DirectionId[];
}

export interface VerificationRequirement {
  readonly id: string;
  readonly label: string;
}

export interface EscalationTrigger {
  readonly id: string;
  readonly label: string;
}

export interface SurfacedConflict {
  readonly id: string;
  readonly requested: string;
  readonly redirectTo: readonly DirectionId[];
  readonly explanation: string;
}

export interface SurfacedCrossCuttingOption {
  readonly id: string;
  readonly label: string;
  readonly cautions: readonly string[];
}

/**
 * Structured reasoning data, not prose. A later phase may let a model choose
 * among `strongCandidates` and phrase the result — it may not add a direction
 * that is excluded here, drop a required question, or contradict a guardrail.
 */
export interface AdvisorAssessment {
  readonly recognizedConditions: readonly RecognizedCondition[];
  readonly eligibleDirections: readonly DirectionId[];
  readonly strongCandidates: readonly RankedDirection[];
  readonly deprioritizedDirections: readonly RankedDirection[];
  readonly excludedDirections: readonly RankedDirection[];
  readonly crossCuttingOptions: readonly SurfacedCrossCuttingOption[];
  readonly tradeoffs: readonly SurfacedTradeoff[];
  readonly unresolvedQuestions: readonly UnresolvedQuestion[];
  readonly verificationRequirements: readonly VerificationRequirement[];
  readonly escalation: {
    readonly required: boolean;
    readonly triggers: readonly EscalationTrigger[];
  };
  readonly requestConflicts: readonly SurfacedConflict[];
  readonly applicableGuardrails: readonly Guardrail[];
  readonly businessPolicies: readonly BusinessPolicy[];
  /** Dimensions never supplied. Useful to a caller deciding what to ask next. */
  readonly unknownDimensions: readonly FactKey[];
}
