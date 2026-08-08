/**
 * Luxe Window Advisor — decision rules. (Phase A)
 *
 * Seven rule families, all expressed as data:
 *
 *   recognition   what the advisor has understood about the project
 *   promotion     which directions become strong candidates, and why
 *   tradeoff      the honest tensions that cannot all be maximised at once
 *   question      what is still unresolved and would change the answer
 *   verification  what Luxe has to confirm at the opening
 *   escalation    when the physical project outranks anything said in chat
 *   conflict      requested product versus stated priority
 *
 * A promotion rule's `weight` orders the output for readability. It is not a
 * score that elects a single winner: the brief is explicit that this layer must
 * not collapse professional judgment into one product-scoring formula, so
 * several directions can and do sit at the same strength, and no behavioural
 * assertion in the harness depends on rank.
 *
 * `{ all: [] }` is vacuously true and is the idiom used for an always-on rule.
 */
import type {
  BusinessPolicy,
  Condition,
  ConflictRule,
  EscalationRule,
  PromotionRule,
  QuestionRule,
  RecognitionRule,
  TradeoffRule,
  VerificationRule,
} from "../types";

const ALWAYS: Condition = { all: [] };

/** The view matters enough to drive the recommendation. */
const VIEW_MATTERS: Condition = {
  any: [
    { priority: "view-preservation", withinTop: 3 },
    { fact: "viewImportance", is: ["high", "critical"] },
  ],
};

const SEVERE_HEAT: Condition = { fact: "solarHeat", is: ["severe"] };

const HEAT_PRESENT: Condition = { fact: "solarHeat", is: ["moderate", "severe"] };

const MAX_DARKENING: Condition = {
  any: [
    { fact: "roomDarkening", is: ["maximum", "total-blackout-requested"] },
    { priority: "room-darkening", withinTop: 1 },
  ],
};

/**
 * An exterior application is on the table. Deliberately broad: the exterior
 * questions and escalations are the expensive ones to get wrong, so they fire
 * whenever exterior is plausibly in play rather than only once it has won.
 */
const EXTERIOR_IN_PLAY: Condition = {
  any: [
    { requestedProduct: "exterior-solar" },
    { requestedFeature: "free-hanging-exterior-shade" },
    { requestedFeature: "battery-powered-exterior" },
    { has: "high-wind-exposure" },
    { has: "unknown-mounting-substrate" },
    { has: "no-hardwired-power" },
    { all: [SEVERE_HEAT, VIEW_MATTERS] },
  ],
};

const BLIND_IN_PLAY: Condition = {
  any: [
    { requestedProduct: "wood-blinds" },
    { requestedProduct: "faux-composite-blinds" },
    { priority: "directional-light-control", withinTop: 3 },
  ],
};

const SHUTTERS_IN_PLAY: Condition = {
  any: [
    { requestedProduct: "shutters" },
    { requestedFeature: "stained-synthetic-shutter" },
    { requestedFeature: "oversized-louvers" },
    { has: "traditional" },
    { has: "architectural" },
  ],
};

const DRAPERY_IN_PLAY: Condition = {
  any: [
    { requestedProduct: "drapery" },
    { requestedFeature: "full-functional-drapery" },
    { has: "inadequate-stack-back" },
    { has: "luxury-unspecified" },
  ],
};

const SHUTTER_OBSTRUCTION: Condition = {
  any: [
    { has: "obstruction-faucet" },
    { has: "obstruction-furniture" },
    { has: "obstruction-window-handle" },
    { has: "obstruction-trim-or-switch" },
  ],
};

const HARD_TO_REACH: Condition = {
  any: [
    { has: "hard-to-reach" },
    { has: "high-window" },
    { has: "above-tub" },
    { has: "furniture-blocked" },
    { has: "mobility-or-age-limited" },
  ],
};

const UNUSUAL_SIZE: Condition = {
  any: [
    { has: "extremely-tall-narrow" },
    { has: "very-wide" },
    { has: "large-architectural-glass" },
  ],
};

// ───────────────────────────── recognition ──────────────────────────────────

export const RECOGNITION_RULES: readonly RecognitionRule[] = [
  { id: "severe-solar-heat", label: "Severe solar heat is the presenting problem", when: SEVERE_HEAT },
  { id: "valuable-view", label: "Preserving the outward view is a leading priority", when: VIEW_MATTERS },
  { id: "west-exposure", label: "West-facing exposure", when: { fact: "exposure", is: ["west"] } },
  { id: "east-exposure", label: "East-facing exposure", when: { fact: "exposure", is: ["east"] } },
  { id: "maximum-darkening-required", label: "The room has to get very dark", when: MAX_DARKENING },
  {
    id: "total-blackout-requested",
    label: "Total blackout has been asked for by name",
    when: {
      any: [
        { fact: "roomDarkening", is: ["total-blackout-requested"] },
        { requestedFeature: "total-blackout" },
      ],
    },
  },
  {
    id: "nighttime-privacy-required",
    label: "Privacy is needed after dark, not only during the day",
    when: { fact: "privacyNeed", is: ["nighttime", "both"] },
  },
  {
    id: "clear-glass-preference",
    label: "The window should be fully clear when the covering is open",
    when: {
      any: [
        { fact: "windowUse", is: ["raised-to-clear-glass"] },
        { priority: "clear-glass-when-open", withinTop: 3 },
      ],
    },
  },
  {
    id: "directional-light-wanted",
    label: "Light needs aiming through the day without raising the covering",
    when: {
      any: [
        { priority: "directional-light-control", withinTop: 3 },
        { fact: "windowUse", is: ["left-down-louvers-adjusted"] },
      ],
    },
  },
  {
    id: "direct-splash-exposure",
    label: "The covering would sit in a direct splash zone",
    when: { fact: "moistureExposure", is: ["direct-splash"] },
  },
  {
    id: "humid-environment",
    label: "A humid room",
    when: { fact: "moistureExposure", is: ["humid"] },
  },
  { id: "hard-to-reach-window", label: "The window is hard to reach or operate", when: HARD_TO_REACH },
  {
    id: "rarely-operated",
    label: "The covering will almost never be operated",
    when: {
      any: [
        { fact: "operationFrequency", is: ["rare"] },
        { fact: "windowUse", is: ["rarely-operated"] },
      ],
    },
  },
  {
    id: "cordless-system-rarely-operated",
    label:
      "A cordless spring system that is almost never operated can lose performance over time; periodic operation is beneficial",
    when: {
      all: [
        {
          any: [
            { fact: "operationFrequency", is: ["rare"] },
            { fact: "windowUse", is: ["rarely-operated"] },
          ],
        },
        {
          any: [
            { requestedProduct: "cellular" },
            { requestedProduct: "interior-roller" },
            { requestedProduct: "banded-shades" },
          ],
        },
      ],
    },
  },
  {
    id: "energy-efficiency-priority",
    label: "Energy efficiency is a leading priority",
    when: { priority: "energy-efficiency", withinTop: 2 },
  },
  {
    id: "child-safety-priority",
    label: "Child safety is a priority in this room",
    when: { any: [{ priority: "child-safety" }, { fact: "room", is: ["nursery"] }] },
  },
  { id: "traditional-aesthetic", label: "Traditional or architectural design direction", when: { any: [{ has: "traditional" }, { has: "architectural" }, { has: "formal" }] } },
  { id: "modern-minimal-aesthetic", label: "Modern, minimal design direction", when: { has: "modern-minimal" } },
  {
    id: "horizontal-detail-wanted",
    label: "Horizontal visual detail is part of the look they want",
    when: { has: "horizontal-detail" },
  },
  { id: "fabric-forward-aesthetic", label: "The fabric should contribute to the room", when: { has: "fabric-forward" } },
  {
    id: "luxury-request-unspecified",
    label: "'Luxury' has been asked for without a specific product direction",
    when: { has: "luxury-unspecified" },
  },
  {
    id: "inadequate-stack-back",
    label: "There is not enough stack-back for full drapery",
    when: { has: "inadequate-stack-back" },
  },
  {
    id: "drapery-look-with-budget-pressure",
    label: "The drapery look is wanted under budget pressure",
    when: {
      all: [
        { any: [{ requestedProduct: "drapery" }, { requestedFeature: "full-functional-drapery" }, { has: "luxury-unspecified" }] },
        { any: [{ fact: "budgetSensitivity", is: ["high"] }, { priority: "budget", withinTop: 2 }] },
      ],
    },
  },
  {
    id: "patio-door-access-conflict",
    label: "The opening is a door in regular use",
    when: { any: [{ has: "patio-door-frequent-use" }, { has: "french-door" }] },
  },
  { id: "high-wind-exposure", label: "The location sees substantial wind", when: { has: "high-wind-exposure" } },
  {
    id: "unsecured-exterior-request",
    label: "An unsecured or free-hanging exterior shade has been asked for",
    when: { requestedFeature: "free-hanging-exterior-shade" },
  },
  {
    id: "mounting-substrate-known",
    label: "Exterior mounting substrate stated",
    when: {
      all: [
        { not: { unknown: "mountingSubstrate" } },
        { not: { fact: "mountingSubstrate", is: ["unknown"] } },
      ],
    },
  },
  {
    id: "unknown-mounting-substrate",
    label: "What the exterior system would mount to is unknown",
    when: { has: "unknown-mounting-substrate" },
  },
  { id: "no-hardwired-power", label: "There is no hardwired power at the location", when: { has: "no-hardwired-power" } },
  {
    id: "battery-exterior-request",
    label: "A rechargeable battery exterior system has been asked for",
    when: { requestedFeature: "battery-powered-exterior" },
  },
  { id: "furniture-blocked-window", label: "Furniture blocks access to the window", when: { has: "furniture-blocked" } },
  { id: "extremely-tall-narrow-opening", label: "An extremely tall, narrow opening", when: { has: "extremely-tall-narrow" } },
  { id: "very-wide-opening", label: "A very wide opening", when: { has: "very-wide" } },
  { id: "multi-window-bank", label: "A bank of windows to be treated together", when: { has: "multi-window-bank" } },
  { id: "tilt-in-window-conflict", label: "A tilt-in sash competes with an inside mount", when: { has: "tilt-in-window" } },
  { id: "sliding-door-opening", label: "A sliding door opening", when: { has: "sliding-door" } },
  {
    id: "oversized-louvers-on-small-window",
    label: "Oversized louvers asked for on a small window",
    when: { all: [{ requestedFeature: "oversized-louvers" }, { has: "small-window" }] },
  },
  { id: "shutter-swing-obstruction", label: "Something at the opening blocks a swinging shutter panel", when: SHUTTER_OBSTRUCTION },
  {
    id: "stained-synthetic-request",
    label: "A stained synthetic shutter has been asked for",
    when: { requestedFeature: "stained-synthetic-shutter" },
  },
  {
    id: "large-pattern-fabric-request",
    label: "A large-repeat patterned fabric has been asked for",
    when: { requestedFeature: "large-pattern-fabric" },
  },
  {
    id: "product-named-by-customer",
    label: "The homeowner has named a product",
    when: {
      any: [
        { requestedProduct: "cellular" },
        { requestedProduct: "interior-roller" },
        { requestedProduct: "interior-solar" },
        { requestedProduct: "shutters" },
        { requestedProduct: "wood-blinds" },
        { requestedProduct: "faux-composite-blinds" },
        { requestedProduct: "roman-shades" },
        { requestedProduct: "drapery" },
        { requestedProduct: "exterior-solar" },
      ],
    },
  },
  {
    id: "competing-priorities",
    label: "Stated priorities pull against each other",
    when: {
      any: [
        { all: [{ priority: "view-preservation", withinTop: 4 }, { priority: "room-darkening", withinTop: 4 }] },
        { all: [{ priority: "view-preservation", withinTop: 4 }, { priority: "privacy", withinTop: 4 }] },
        { all: [{ priority: "budget", withinTop: 4 }, { priority: "motorization", withinTop: 4 }] },
        { all: [{ priority: "budget", withinTop: 4 }, { priority: "aesthetics", withinTop: 4 }] },
        { all: [{ priority: "energy-efficiency", withinTop: 4 }, { priority: "view-preservation", withinTop: 4 }] },
      ],
    },
  },
];

// ───────────────────────────── promotion ────────────────────────────────────

export const PROMOTION_RULES: readonly PromotionRule[] = [
  // VIEW + SEVERE HEAT -> evaluate exterior solar early.
  {
    id: "promote-exterior-solar-view-and-severe-heat",
    direction: "exterior-solar",
    when: { all: [SEVERE_HEAT, VIEW_MATTERS] },
    weight: 3,
    rationale:
      "Severe solar heat with a view worth keeping is the case exterior shading exists for — it stops the energy before it reaches the glass while an appropriate solar fabric keeps visibility.",
  },
  {
    id: "promote-exterior-solar-severe-heat",
    direction: "exterior-solar",
    when: SEVERE_HEAT,
    weight: 2,
    rationale: "Severe solar heat means exterior shading should be evaluated.",
  },
  {
    id: "promote-layered-exterior-plus-privacy",
    direction: "exterior-solar-plus-interior-privacy",
    when: {
      all: [SEVERE_HEAT, VIEW_MATTERS, { fact: "privacyNeed", is: ["nighttime", "both"] }],
    },
    weight: 3,
    rationale:
      "Exterior handles the heat, glare and daytime view; an interior layer supplies the nighttime privacy the exterior shade cannot.",
  },
  // VIEW + LOWER BUDGET -> interior solar as the alternative.
  {
    id: "promote-interior-solar-view-value",
    direction: "interior-solar",
    when: { all: [VIEW_MATTERS, { any: [{ fact: "budgetSensitivity", is: ["high", "moderate"] }, { priority: "budget", withinTop: 3 }] }] },
    weight: 2,
    rationale: "A strong lower-cost way to keep the view when exterior shading is out of reach.",
  },
  {
    id: "promote-interior-solar-view",
    direction: "interior-solar",
    when: VIEW_MATTERS,
    weight: 2,
    rationale: "Preserves an outward view while deployed, which no opaque product does.",
  },
  {
    id: "promote-interior-solar-glare",
    direction: "interior-solar",
    when: { priority: "glare-control", withinTop: 3 },
    weight: 2,
    rationale: "Reduces glare on screens and surfaces without giving up the window.",
  },
  {
    id: "promote-exterior-solar-glare-with-heat",
    direction: "exterior-solar",
    when: { all: [{ priority: "glare-control", withinTop: 3 }, HEAT_PRESENT] },
    weight: 2,
    rationale: "Intercepting the energy outside addresses glare and heat in one move.",
  },
  // MAXIMUM ROOM DARKENING -> cellular room-darkening, not inside-mount roller.
  {
    id: "promote-cellular-max-darkening",
    direction: "cellular",
    when: MAX_DARKENING,
    weight: 3,
    rationale:
      "Room-darkening cellular is among Luxe's preferred directions when a customer wants a very dark room.",
  },
  {
    id: "promote-cellular-sleep-rooms",
    direction: "cellular",
    when: {
      all: [
        { fact: "room", is: ["bedroom", "nursery", "media"] },
        { any: [{ priority: "room-darkening", withinTop: 3 }, { fact: "roomDarkening", is: ["maximum", "moderate", "total-blackout-requested"] }] },
      ],
    },
    weight: 2,
    rationale:
      "Excellent for bedrooms, nurseries, night workers, and situations where early sunrise creates sleep problems.",
  },
  // ENERGY EFFICIENCY -> cellular and shutters above Venetian blinds.
  {
    id: "promote-cellular-energy",
    direction: "cellular",
    when: { priority: "energy-efficiency", withinTop: 2 },
    weight: 3,
    rationale:
      "Air trapped between shade and glass and inside the honeycomb makes cellular the strongest energy direction in the Luxe range.",
  },
  {
    id: "promote-shutters-energy",
    direction: "shutters",
    when: { priority: "energy-efficiency", withinTop: 2 },
    weight: 2,
    rationale: "Shutters also carry strong insulating performance and rank above Venetian blinds for energy.",
  },
  // ARCHITECTURAL / TRADITIONAL -> shutters.
  {
    id: "promote-shutters-architectural",
    direction: "shutters",
    when: { any: [{ has: "traditional" }, { has: "architectural" }, { has: "formal" }] },
    weight: 2,
    rationale: "Architectural appearance and a structured, traditional design direction.",
  },
  {
    id: "promote-shutters-durability",
    direction: "shutters",
    when: { priority: "durability", withinTop: 3 },
    weight: 2,
    rationale: "Durability and a permanent, built-in character.",
  },
  // ADJUSTABLE DIRECTIONAL LIGHT -> shutter or Venetian blind.
  {
    id: "promote-shutters-directional-light",
    direction: "shutters",
    when: { any: [{ priority: "directional-light-control", withinTop: 3 }, { fact: "windowUse", is: ["left-down-louvers-adjusted"] }] },
    weight: 2,
    rationale: "Louvers give directional light control without raising the covering.",
  },
  {
    id: "promote-wood-blinds-directional-light",
    direction: "wood-blinds",
    when: { any: [{ priority: "directional-light-control", withinTop: 3 }, { fact: "windowUse", is: ["left-down-louvers-adjusted"] }] },
    weight: 2,
    rationale: "A Venetian blind is the other way to aim light through the day.",
  },
  {
    id: "promote-faux-blinds-directional-light",
    direction: "faux-composite-blinds",
    when: { any: [{ priority: "directional-light-control", withinTop: 3 }, { fact: "windowUse", is: ["left-down-louvers-adjusted"] }] },
    weight: 2,
    rationale: "A Venetian blind is the other way to aim light through the day.",
  },
  // CLEAR GLASS WHEN OPEN -> roller / cellular / Roman preferable to blinds.
  {
    id: "promote-roller-clear-glass",
    direction: "interior-roller",
    when: { any: [{ fact: "windowUse", is: ["raised-to-clear-glass"] }, { priority: "clear-glass-when-open", withinTop: 3 }] },
    weight: 2,
    rationale: "Leaves clear glass when raised and disappears visually.",
  },
  {
    id: "promote-cellular-clear-glass",
    direction: "cellular",
    when: { any: [{ fact: "windowUse", is: ["raised-to-clear-glass"] }, { priority: "clear-glass-when-open", withinTop: 3 }] },
    weight: 2,
    rationale: "Stacks tightly and leaves clear glass when raised.",
  },
  {
    id: "promote-roman-clear-glass",
    direction: "roman-shades",
    when: {
      all: [
        { any: [{ fact: "windowUse", is: ["raised-to-clear-glass"] }, { priority: "clear-glass-when-open", withinTop: 3 }] },
        { any: [{ has: "fabric-forward" }, { priority: "aesthetics", withinTop: 3 }] },
      ],
    },
    weight: 1,
    rationale: "Clears the glass when raised while the fabric still contributes to the room.",
  },
  // FABRIC / DESIGN PERSONALITY -> Roman or drapery.
  {
    id: "promote-roman-fabric-personality",
    direction: "roman-shades",
    when: { has: "fabric-forward" },
    weight: 2,
    rationale: "The right direction when pattern, softness and design individuality matter.",
  },
  {
    id: "promote-drapery-fabric-personality",
    direction: "drapery",
    when: { all: [{ has: "fabric-forward" }, { any: [{ has: "formal" }, { has: "very-wide" }] }] },
    weight: 1,
    rationale:
      "Softness, architectural scale and formality; functional drapery can make sense on extremely wide openings.",
  },
  // DRAPERY LOOK + VALUE -> functional shade + stationary side panels.
  {
    id: "promote-layered-panels-value",
    direction: "functional-shade-plus-stationary-panels",
    when: {
      all: [
        DRAPERY_IN_PLAY,
        {
          any: [
            { fact: "budgetSensitivity", is: ["high", "moderate"] },
            { priority: "budget", withinTop: 3 },
            { has: "inadequate-stack-back" },
          ],
        },
      ],
    },
    weight: 3,
    rationale:
      "A core Luxe recommendation — the drapery look, softness and visual height with significantly less fabric, while the shade handles privacy and light control.",
  },
  {
    id: "promote-layered-panels-luxury-unspecified",
    direction: "functional-shade-plus-stationary-panels",
    when: { has: "luxury-unspecified" },
    weight: 1,
    rationale:
      "'Luxury' does not automatically mean full drapery; this delivers the look with better overall value.",
  },
  // WET AREA -> away from vulnerable fabrics and wood.
  {
    id: "promote-shutters-wet-area",
    direction: "shutters",
    when: { fact: "moistureExposure", is: ["direct-splash", "humid"] },
    weight: 2,
    rationale: "Poly is a strong moisture-area application, and composite carries good moisture resistance.",
  },
  {
    id: "promote-faux-blinds-wet-area",
    direction: "faux-composite-blinds",
    when: { fact: "moistureExposure", is: ["direct-splash", "humid"] },
    weight: 2,
    rationale: "Tolerates moisture where real wood should not go.",
  },
  // Design and geometry.
  {
    id: "promote-roller-modern-minimal",
    direction: "interior-roller",
    when: { has: "modern-minimal" },
    weight: 2,
    rationale: "Clean, minimal, intended to recede — the direction when the treatment should disappear.",
  },
  // Banded shades. The roller-family promotions are mirrored because the
  // approved knowledge treats the two as functionally the same; the
  // horizontal-detail promotion is the one that is banded's alone.
  {
    id: "promote-banded-horizontal-detail",
    direction: "banded-shades",
    when: { has: "horizontal-detail" },
    weight: 3,
    rationale:
      "The horizontal banded appearance is the point of this product — and aligning the bands gives a partial view out.",
  },
  {
    id: "promote-banded-modern-minimal",
    direction: "banded-shades",
    when: { has: "modern-minimal" },
    weight: 2,
    rationale:
      "Clean, modern, contemporary look; the fabric and style options skew that way.",
  },
  {
    id: "promote-banded-clear-glass",
    direction: "banded-shades",
    when: { any: [{ fact: "windowUse", is: ["raised-to-clear-glass"] }, { priority: "clear-glass-when-open", withinTop: 3 }] },
    weight: 2,
    rationale: "Leaves clear glass when raised, the same as a roller shade.",
  },
  {
    id: "promote-roller-large-glass",
    direction: "interior-roller",
    when: { has: "large-architectural-glass" },
    weight: 2,
    rationale: "Large architectural glass may be better suited to roller or commercial systems.",
  },
  {
    id: "promote-cellular-specialty-shape",
    direction: "cellular",
    when: { has: "specialty-shape" },
    weight: 2,
    rationale: "Available for specialty shapes.",
  },
  {
    id: "promote-shutters-specialty-shape",
    direction: "shutters",
    when: { has: "specialty-shape" },
    weight: 2,
    rationale: "Available for specialty shapes.",
  },
  {
    id: "promote-cellular-topdown-privacy",
    direction: "cellular",
    when: { all: [{ fact: "privacyNeed", is: ["daytime", "both"] }, VIEW_MATTERS] },
    weight: 1,
    rationale:
      "Top-down/bottom-up gives lower-window privacy while keeping upper-window visibility.",
  },
];

// ───────────────────────────── tradeoffs ────────────────────────────────────

export const TRADEOFF_RULES: readonly TradeoffRule[] = [
  {
    id: "view-vs-privacy",
    label: "Maximum view against maximum privacy",
    poles: ["Seeing out while the treatment is down", "Not being seen in, day and night"],
    when: { all: [VIEW_MATTERS, { fact: "privacyNeed", is: ["daytime", "nighttime", "both"] }] },
    note: "The same openness that lets you see out lets light and sightlines back in. Layering is usually how both get answered.",
  },
  {
    id: "heat-reflection-vs-outward-visibility",
    label: "Maximum heat reflection against best outward visibility",
    poles: ["Light fabric, more reflection", "Dark fabric, clearer view"],
    when: { all: [HEAT_PRESENT, VIEW_MATTERS] },
    note: "Dark solar fabrics generally preserve the view better and give stronger glare reduction while absorbing more energy; light fabrics reflect more and weaken the outward view.",
  },
  {
    id: "solar-openness-vs-daytime-privacy",
    label: "Openness against daytime privacy",
    poles: ["More open, clearer view", "Tighter weave, more privacy"],
    when: { all: [VIEW_MATTERS, { fact: "privacyNeed", is: ["daytime", "both"] }] },
    note: "10% is generally too open for privacy and glare control; 1% gives very limited true outward visibility. Luxe generally starts around 3% west-facing and around 5% east-facing.",
  },
  {
    id: "minimal-stack-vs-fabric-design",
    label: "Minimal stack against rich fabric design",
    poles: ["The treatment disappears", "The fabric is part of the room"],
    when: {
      any: [
        { has: "fabric-forward" },
        { requestedProduct: "roman-shades" },
        { requestedProduct: "drapery" },
        { requestedFeature: "full-functional-drapery" },
        { requestedFeature: "large-pattern-fabric" },
      ],
    },
    note: "Fabric that contributes to the room has to go somewhere when the treatment is open. A roller hides; a Roman or drapery stacks.",
  },
  {
    id: "price-vs-automation",
    label: "Lowest price against automation and convenience",
    poles: ["Manual operation", "Motorized convenience"],
    when: {
      all: [
        { any: [{ fact: "budgetSensitivity", is: ["high"] }, { priority: "budget", withinTop: 3 }] },
        { any: [{ fact: "motorizationInterest", is: ["requested"] }, { priority: "motorization", withinTop: 3 }, HARD_TO_REACH] },
      ],
    },
    note: "Motorization earns its cost where there is a real access or operation reason. It is not a default upgrade.",
  },
  {
    id: "inside-mount-vs-room-darkening",
    label: "Inside-mount appearance against maximum room darkening",
    poles: ["Clean inside-mount look", "The darkest possible room"],
    when: MAX_DARKENING,
    note: "Perimeter gaps are inherent to an inside mount. Light-coloured trim can make them look brighter, because reflected light creates a visible halo.",
  },
  {
    id: "exterior-shade-vs-door-access",
    label: "Exterior shading against door access",
    poles: ["Shading the glass from outside", "Walking through the door freely"],
    when: {
      all: [
        { any: [{ has: "patio-door-frequent-use" }, { has: "sliding-door" }, { has: "french-door" }] },
        EXTERIOR_IN_PLAY,
      ],
    },
    note: "An exterior shade over a door in regular use can obstruct entry and exit. The conflict has to be resolved before the application is recommended.",
  },
  {
    id: "bypass-shutter-vs-glass-coverage",
    label: "Shutters on a slider against how much glass stays clear",
    poles: ["Shutter appearance across the opening", "Keeping the glass and the doorway clear"],
    when: { all: [{ has: "sliding-door" }, SHUTTERS_IN_PLAY] },
    note: "Bypass shutters on a slider can block substantial glass, and open-bypass systems can need substantial room depth.",
  },
  {
    id: "drapery-fabric-vs-glass-coverage",
    label: "Full drapery against how much glass it covers when open",
    poles: ["Fabric traversing the whole opening", "Light and glass area retained"],
    when: DRAPERY_IN_PLAY,
    note: "Without adequate stack-back, full drapery covers substantial glass, reduces natural light and visually shrinks the window. Mounting high and moving the fabric off the glass is Luxe's preference where architecture permits.",
  },
  {
    id: "louver-size-vs-window-proportion",
    label: "Larger louvers against window proportion",
    poles: ["Better view-through", "Louvers proportionate to the window"],
    when: { any: [{ requestedFeature: "oversized-louvers" }, { all: [{ has: "small-window" }, SHUTTERS_IN_PLAY] }] },
    note: "Larger louvers generally give better view-through but must stay proportionate to the window.",
  },
  {
    id: "wood-appearance-vs-moisture-tolerance",
    label: "Real stained wood against moisture tolerance",
    poles: ["Authentic grain and stain", "Surviving repeated water contact"],
    when: {
      any: [
        { requestedFeature: "stained-synthetic-shutter" },
        { all: [{ fact: "moistureExposure", is: ["direct-splash", "humid"] }, { any: [{ requestedProduct: "wood-blinds" }, { has: "traditional" }] }] },
      ],
    },
    note: "Wood-tone synthetic products usually do not reproduce the appearance of real stained wood as successfully as actual wood, and real wood should not take repeated direct water exposure.",
  },
];

// ───────────────────────────── questions ────────────────────────────────────

export const QUESTION_RULES: readonly QuestionRule[] = [
  {
    id: "q-window-use",
    question:
      "When you use this window day to day, do you raise the covering to expose clear glass, or leave it down and adjust it?",
    when: BLIND_IN_PLAY,
    askOnlyIfUnknown: ["windowUse"],
    materialTo: [
      "wood-blinds",
      "faux-composite-blinds",
      "interior-roller",
      "banded-shades",
      "cellular",
      "roman-shades",
    ],
  },
  {
    id: "q-goal-behind-product-request",
    question: "What do you want the window treatment to actually do in that room?",
    when: { any: [{ requestedProduct: "wood-blinds" }, { requestedProduct: "faux-composite-blinds" }, { requestedProduct: "interior-roller" }, { requestedProduct: "cellular" }, { requestedProduct: "shutters" }, { requestedProduct: "roman-shades" }, { requestedProduct: "drapery" }, { requestedProduct: "interior-solar" }, { requestedProduct: "exterior-solar" }] },
    askOnlyIfUnknown: ["priorities"],
    materialTo: [],
  },
  {
    id: "q-nighttime-privacy",
    question: "Do you need privacy in that room after dark, or only during the day?",
    when: VIEW_MATTERS,
    askOnlyIfUnknown: ["privacyNeed"],
    materialTo: ["interior-solar", "exterior-solar", "exterior-solar-plus-interior-privacy", "cellular"],
  },
  {
    id: "q-darkening-level",
    question: "How dark does that room need to get — comfortable, or as dark as possible?",
    when: { fact: "room", is: ["bedroom", "nursery", "media"] },
    askOnlyIfUnknown: ["roomDarkening"],
    materialTo: ["cellular", "interior-roller", "roman-shades", "shutters"],
  },
  {
    id: "q-exposure",
    question: "Which direction does that window face?",
    when: { any: [HEAT_PRESENT, { priority: "glare-control", withinTop: 3 }, VIEW_MATTERS] },
    askOnlyIfUnknown: ["exposure"],
    materialTo: ["interior-solar", "exterior-solar"],
  },
  {
    id: "q-exterior-mounting",
    question: "What would an exterior system mount to — stone, siding, fascia, soffit, or structural framing?",
    when: EXTERIOR_IN_PLAY,
    // Gated on the substrate itself, not on `exteriorConditions`. Wind and
    // power live in that list too, so gating there meant a homeowner who
    // answered this question was still asked it again.
    askOnlyIfUnknown: ["mountingSubstrate"],
    materialTo: ["exterior-solar", "exterior-solar-plus-interior-privacy"],
  },
  {
    id: "q-wind-exposure",
    question: "How exposed is that side of the house to wind?",
    when: EXTERIOR_IN_PLAY,
    askOnlyIfUnknown: ["exteriorConditions"],
    materialTo: ["exterior-solar", "exterior-solar-plus-interior-privacy"],
  },
  {
    id: "q-power-availability",
    question: "Is there hardwired power available at that opening?",
    when: EXTERIOR_IN_PLAY,
    askOnlyIfUnknown: ["exteriorConditions"],
    materialTo: ["exterior-solar", "exterior-solar-plus-interior-privacy"],
  },
  {
    id: "q-door-access-conflict",
    question: "Is that opening a door you use regularly to get in and out?",
    when: EXTERIOR_IN_PLAY,
    askOnlyIfUnknown: ["openings"],
    materialTo: ["exterior-solar", "exterior-solar-plus-interior-privacy"],
  },
  {
    id: "q-stack-back",
    question: "How much wall is there beside the window for the fabric to stack onto when it is open?",
    when: DRAPERY_IN_PLAY,
    askOnlyIfUnknown: ["openings"],
    materialTo: ["drapery", "functional-shade-plus-stationary-panels"],
  },
  {
    id: "q-moisture-exposure",
    question: "Would the covering get direct water on it, or is the room just humid?",
    when: { fact: "room", is: ["kitchen", "bathroom"] },
    askOnlyIfUnknown: ["moistureExposure"],
    materialTo: ["roman-shades", "cellular", "wood-blinds", "faux-composite-blinds", "shutters", "drapery"],
  },
  {
    id: "q-obstructions",
    question:
      "Is there anything at the opening a swinging panel would hit — a faucet, furniture, a window handle, trim or a light switch?",
    when: SHUTTERS_IN_PLAY,
    askOnlyIfUnknown: ["openings"],
    materialTo: ["shutters"],
  },
  {
    id: "q-reach-and-operation",
    question: "Can you comfortably reach that window to operate the covering?",
    when: { any: [{ fact: "room", is: ["bathroom"] }, { has: "high-window" }, { has: "large-architectural-glass" }] },
    askOnlyIfUnknown: ["access"],
    materialTo: ["cellular", "interior-roller", "interior-solar"],
  },
  {
    id: "q-operation-frequency",
    question: "How often would you actually raise and lower that covering?",
    when: { any: [{ fact: "motorizationInterest", is: ["requested"] }, { priority: "motorization", withinTop: 3 }] },
    askOnlyIfUnknown: ["operationFrequency"],
    materialTo: [],
  },
];

// ───────────────────────────── verification ─────────────────────────────────

export const VERIFICATION_RULES: readonly VerificationRule[] = [
  { id: "verify-dimensions", label: "Professional measurement of the actual opening", when: ALWAYS },
  { id: "verify-exterior-mounting", label: "What the exterior system mounts to, and whether that substrate is suitable", when: EXTERIOR_IN_PLAY },
  { id: "verify-wind-exposure", label: "Wind exposure at the location", when: EXTERIOR_IN_PLAY },
  { id: "verify-power", label: "Power availability and routing for a motorized exterior system", when: EXTERIOR_IN_PLAY },
  {
    id: "verify-door-access",
    label: "Whether the treatment obstructs entry and exit at a door",
    when: { any: [{ has: "patio-door-frequent-use" }, { has: "sliding-door" }, { has: "french-door" }] },
  },
  { id: "verify-shutter-clearance", label: "Clearance for swinging shutter panels at the opening", when: { any: [SHUTTERS_IN_PLAY, SHUTTER_OBSTRUCTION] } },
  { id: "verify-tilt-in-clearance", label: "Clearance between a tilt-in sash and an inside-mounted frame", when: { has: "tilt-in-window" } },
  { id: "verify-stack-back", label: "Available stack-back beside the opening", when: DRAPERY_IN_PLAY },
  {
    id: "verify-splash-exposure",
    label: "Whether the covering would take direct water",
    when: { any: [{ fact: "moistureExposure", is: ["direct-splash", "humid"] }, { fact: "room", is: ["kitchen", "bathroom"] }] },
  },
  { id: "verify-reach-and-operation", label: "Reach and operation at the window", when: HARD_TO_REACH },
  { id: "verify-product-size-limits", label: "Manufacturer size limits for the opening", when: UNUSUAL_SIZE },
  {
    id: "verify-fabric-width-and-pattern-repeat",
    label: "Fabric width, seam placement and pattern repeat",
    when: { any: [{ requestedFeature: "large-pattern-fabric" }, { all: [{ has: "very-wide" }, { has: "fabric-forward" }] }, DRAPERY_IN_PLAY] },
  },
  { id: "verify-mullion-and-gap-alignment", label: "Alignment and gaps across a bank of windows", when: { has: "multi-window-bank" } },
  {
    id: "verify-louver-proportion",
    label: "Louver size against the proportions of the window",
    when: { any: [{ requestedFeature: "oversized-louvers" }, { all: [{ has: "small-window" }, SHUTTERS_IN_PLAY] }] },
  },
  { id: "verify-lift-system-load", label: "Weight and lift-system load on a wide covering", when: { has: "very-wide" } },
  {
    // The approved child-safety rule prefers cordless and motorized operation,
    // and in the same breath forbids claiming that every product and size can
    // be supplied that way. This is where that second half lands: the
    // preference is stated, and the availability question goes to the people
    // who can actually answer it.
    id: "verify-cordless-or-motorized-availability",
    label:
      "Whether the selected product, size and application can be supplied cordless or motorized",
    when: {
      any: [
        { priority: "child-safety" },
        { fact: "room", is: ["nursery"] },
        { fact: "motorizationInterest", is: ["requested"] },
      ],
    },
  },
  {
    id: "verify-electrical",
    label: "Electrical work needed for motorization",
    when: { any: [{ has: "no-hardwired-power" }, { all: [EXTERIOR_IN_PLAY, { fact: "motorizationInterest", is: ["requested", "open"] }] }] },
  },
];

// ───────────────────────────── escalation ───────────────────────────────────

export const ESCALATION_RULES: readonly EscalationRule[] = [
  { id: "escalate-unusual-size", label: "Unusual size — the opening is outside the routine range", when: UNUSUAL_SIZE },
  { id: "escalate-unusual-shape", label: "Unusual or irregular shape", when: { has: "specialty-shape" } },
  { id: "escalate-exterior-wind-exposure", label: "Exterior wind exposure", when: { has: "high-wind-exposure" } },
  {
    id: "escalate-unknown-mounting-structure",
    label: "Unknown exterior mounting structure",
    // Escalates while the substrate is genuinely unknown — either never stated,
    // or stated as not known. A named substrate closes this; it does not make
    // the mounting safe, which is why `verify-exterior-mounting` is unchanged
    // and still fires on every exterior project.
    when: {
      any: [
        { has: "unknown-mounting-substrate" },
        { fact: "mountingSubstrate", is: ["unknown"] },
        { all: [EXTERIOR_IN_PLAY, { unknown: "mountingSubstrate" }] },
      ],
    },
  },
  { id: "escalate-tilt-in-conflict", label: "Tilt-in window conflict", when: { has: "tilt-in-window" } },
  { id: "escalate-shutter-obstruction", label: "Shutters with an obstruction at the opening", when: { all: [SHUTTERS_IN_PLAY, SHUTTER_OBSTRUCTION] } },
  {
    id: "escalate-complex-drapery-layout",
    label: "Complex drapery layout",
    when: { all: [DRAPERY_IN_PLAY, { any: [{ has: "inadequate-stack-back" }, { has: "very-wide" }, { has: "multi-window-bank" }] }] },
  },
  { id: "escalate-severe-room-darkening", label: "Severe room-darkening requirement", when: MAX_DARKENING },
  {
    id: "escalate-electrical",
    label: "Electrical questions",
    when: { any: [{ has: "no-hardwired-power" }, { requestedFeature: "battery-powered-exterior" }] },
  },
  { id: "escalate-inaccessible-window", label: "Inaccessible window", when: HARD_TO_REACH },
  {
    id: "escalate-complicated-slider-or-door",
    label: "Complicated slider or door opening",
    when: { any: [{ has: "sliding-door" }, { has: "patio-door-frequent-use" }, { has: "french-door" }] },
  },
  { id: "escalate-product-size-limits", label: "Product size limitations", when: UNUSUAL_SIZE },
  {
    id: "escalate-manufacturer-engineering",
    label: "Manufacturer-specific engineering",
    when: { all: [EXTERIOR_IN_PLAY, { any: [{ has: "very-wide" }, { has: "large-architectural-glass" }] }] },
  },
  {
    id: "escalate-exterior-mounting",
    label: "Exterior mounting has to be evaluated case by case",
    when: EXTERIOR_IN_PLAY,
  },
  {
    id: "escalate-unusual-architectural-conditions",
    label: "Unusual architectural conditions",
    when: { any: [{ has: "large-architectural-glass" }, { has: "multi-window-bank" }] },
  },
];

// ───────────────────────────── request conflicts ────────────────────────────

export const CONFLICT_RULES: readonly ConflictRule[] = [
  {
    id: "conflict-blinds-vs-energy-priority",
    requested: "faux-composite-blinds",
    when: { all: [{ requestedProduct: "faux-composite-blinds" }, { priority: "energy-efficiency", withinTop: 1 }] },
    redirectTo: ["cellular", "shutters"],
    explanation:
      "Faux wood blinds are not Luxe's preferred energy-efficiency solution. With energy efficiency as the leading priority, cellular and shutters both rank above Venetian blinds — cellular for the trapped air, shutters where the look and the opening suit them.",
  },
  {
    id: "conflict-wood-blinds-vs-energy-priority",
    requested: "wood-blinds",
    when: { all: [{ requestedProduct: "wood-blinds" }, { priority: "energy-efficiency", withinTop: 1 }] },
    redirectTo: ["cellular", "shutters"],
    explanation:
      "Wood blinds are not Luxe's preferred energy-efficiency solution. Cellular and shutters generally rank above Venetian blinds when energy is the leading priority.",
  },
  {
    id: "conflict-blinds-vs-clear-glass-use",
    requested: "faux-composite-blinds",
    when: {
      all: [
        { any: [{ requestedProduct: "faux-composite-blinds" }, { requestedProduct: "wood-blinds" }] },
        { fact: "windowUse", is: ["raised-to-clear-glass"] },
      ],
    },
    redirectTo: ["interior-roller", "cellular", "roman-shades"],
    explanation:
      "'Blinds' often just means 'something on my windows'. Someone who raises the covering fully to expose clear glass is generally better served by a shade than by a Venetian blind.",
  },
  {
    id: "conflict-roller-vs-blackout-request",
    requested: "interior-roller",
    when: {
      all: [
        { any: [{ requestedProduct: "interior-roller" }, { requestedFeature: "inside-mount" }] },
        { any: [{ fact: "roomDarkening", is: ["total-blackout-requested", "maximum"] }, { requestedFeature: "total-blackout" }] },
      ],
    },
    redirectTo: ["cellular"],
    explanation:
      "An inside-mount roller is generally not Luxe's preferred answer when maximum darkening is the goal — the side gaps remain. Room-darkening cellular is the stronger direction, and even then total blackout is not something to promise.",
  },
  {
    id: "conflict-free-hanging-exterior-shade",
    requested: "free-hanging-exterior-shade",
    when: { requestedFeature: "free-hanging-exterior-shade" },
    redirectTo: ["exterior-solar"],
    explanation:
      "Luxe does not sell unsecured or free-hanging exterior shades. Luxe exterior products use secured systems — cable guides, track systems or zipper track.",
  },
  {
    id: "conflict-battery-powered-exterior",
    requested: "battery-powered-exterior",
    when: { requestedFeature: "battery-powered-exterior" },
    redirectTo: ["exterior-solar"],
    explanation:
      "Luxe does not use rechargeable battery systems for exterior shade applications. These systems generally require hardwired power; manual crank may be reasonable on smaller shades.",
  },
  {
    id: "conflict-stained-synthetic-shutter",
    requested: "stained-synthetic-shutter",
    when: { requestedFeature: "stained-synthetic-shutter" },
    redirectTo: ["shutters"],
    explanation:
      "Wood-tone synthetic products usually do not reproduce the appearance of real stained wood as successfully as actual wood. If the stained look is what matters, real wood is the honest answer — but it should not take repeated direct water exposure, so the room decides.",
  },
  {
    id: "conflict-luxury-assumed-to-mean-drapery",
    requested: "drapery",
    when: { has: "luxury-unspecified" },
    redirectTo: ["functional-shade-plus-stationary-panels", "shutters", "roman-shades", "cellular"],
    explanation:
      "'Luxury' does not automatically mean drapery. What reads as luxury depends on the room, the architecture and how the window is used, and several directions can deliver it.",
  },
  {
    id: "conflict-full-drapery-without-stack-back",
    requested: "full-functional-drapery",
    when: { all: [DRAPERY_IN_PLAY, { has: "inadequate-stack-back" }] },
    redirectTo: ["functional-shade-plus-stationary-panels"],
    explanation:
      "Without adequate stack-back, full drapery covers substantial glass, cuts natural light and visually shrinks the window. A functional shade with stationary side panels gives the same look without parking fabric on the glass.",
  },
  {
    id: "conflict-drapery-look-under-budget-pressure",
    requested: "full-functional-drapery",
    when: {
      all: [
        DRAPERY_IN_PLAY,
        { any: [{ fact: "budgetSensitivity", is: ["high"] }, { priority: "budget", withinTop: 2 }] },
      ],
    },
    redirectTo: ["functional-shade-plus-stationary-panels"],
    explanation:
      "Pattern repeat and seam matching drive fabric requirements and cost up quickly. A functional shade with stationary side panels delivers the drapery look with significantly less fabric, potentially fewer seams and better overall value.",
  },
  {
    id: "conflict-oversized-louvers-on-small-window",
    requested: "oversized-louvers",
    when: { all: [{ requestedFeature: "oversized-louvers" }, { has: "small-window" }] },
    redirectTo: ["shutters"],
    explanation:
      "Larger louvers do give better view-through, but they have to stay proportionate to the window. On a small window an oversized louver reads wrong and eats the opening.",
  },
  {
    id: "conflict-corded-operation-with-child-safety",
    requested: "corded-operation",
    when: {
      all: [
        { requestedFeature: "corded-operation" },
        { any: [{ priority: "child-safety" }, { fact: "room", is: ["nursery"] }] },
      ],
    },
    redirectTo: [],
    explanation:
      "Where child safety matters, Luxe favours an operating system with no accessible cord or chain — cordless or motorized. Which of those is available depends on the product, the size and the application, and Luxe confirms that at the consultation.",
  },
  {
    id: "conflict-motorization-without-an-operating-reason",
    requested: "cellular",
    when: {
      all: [
        { fact: "motorizationInterest", is: ["requested"] },
        { any: [{ fact: "operationFrequency", is: ["rare"] }, { fact: "windowUse", is: ["rarely-operated"] }] },
        { not: HARD_TO_REACH },
        { not: { priority: "accessibility" } },
      ],
    },
    redirectTo: [],
    explanation:
      "Motorization should not be recommended simply because it is a premium upgrade. On a covering that is almost never operated and is easy to reach, there is no access or operation problem for it to solve.",
  },
];

// ───────────────────────────── business policy ──────────────────────────────

export const BUSINESS_POLICIES: readonly BusinessPolicy[] = [
  { id: "free-in-home-consultation", statement: "Luxe Window Works provides free in-home window-treatment consultations." },
  { id: "professional-measure-and-install", statement: "Luxe provides professional measuring and installation." },
  { id: "residential-and-commercial", statement: "Luxe serves residential and commercial projects." },
  { id: "no-service-of-outside-products", statement: "Luxe does not service products it did not sell." },
  { id: "no-financing", statement: "Luxe does not offer financing." },
  {
    id: "appointment-lead-time",
    statement:
      "Sales and consultation appointments can usually be scheduled within approximately 48-72 hours. A specific appointment time is never guaranteed.",
  },
  {
    id: "service-area",
    statement:
      "Luxe serves its normal North Idaho market. Service to a distant location is never promised without confirmation.",
  },
  {
    id: "secured-exterior-systems-only",
    statement:
      "Luxe does not sell unsecured or free-hanging exterior shades. Exterior products use secured systems — cable guides, track systems or zipper track.",
  },
  {
    id: "no-rechargeable-battery-exterior",
    statement:
      "Luxe does not use rechargeable battery systems for exterior shade applications; those systems generally require hardwired power.",
  },
];
