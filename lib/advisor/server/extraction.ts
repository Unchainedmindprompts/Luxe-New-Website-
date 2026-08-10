/**
 * Luxe Window Advisor — fact extraction contract and validation. (Phase B)
 *
 * Turns natural homeowner language into the Phase A `ProjectFacts` vocabulary
 * and nothing else. Three properties matter more than anything in this file:
 *
 * 1. THE SCHEMA AND THE VALIDATOR CANNOT DRIFT. Both are generated from the
 *    same runtime vocabulary tables below, and each table is typed as a
 *    `Record<SomeUnion, true>` so TypeScript rejects a member that is not in
 *    the Phase A union *and* a member that is missing from it. Adding a fact to
 *    Phase A and forgetting it here is a compile error, not a silent gap.
 *
 * 2. UNKNOWN STAYS UNKNOWN. Every field is nullable and `null` means "the
 *    homeowner did not say". An empty array means "asked, and there are none".
 *    Phase A treats those as different, and so does everything here — it is
 *    what stops the advisor re-asking a question it already has the answer to,
 *    and what stops it inventing a fact from silence.
 *
 * 3. THE MODEL CANNOT WIDEN THE VOCABULARY. Validation is an allowlist. A value
 *    that is not in the table is dropped and counted, never coerced to the
 *    nearest match. That is also the reason prompt injection has so little
 *    surface here: the most an attacker can do through this path is set facts
 *    the domain layer already understands, which the deterministic engine then
 *    reasons about under its own rules.
 *
 * `goals` (free-text problem statements) is deliberately NOT extracted in Phase
 * B. The engine does not reason over it, and carrying arbitrary homeowner prose
 * would add a PII surface and an injection round-trip for no reasoning value.
 *
 * EXTRACTION IS A DELTA, NOT A SNAPSHOT. The model is not handed an object to
 * fill in — it lists the updates the *current* message supports, each carrying
 * a verbatim quote. That inversion is the point: a slot-filling schema has
 * gravity, and "We do want privacy at night, yes" reliably produced a spurious
 * `room` because eleven empty properties invite completion. With a delta, an
 * empty list is the natural default rather than an act of restraint, and every
 * update has to point at words that justify it.
 */
import type {
  AccessConditionId,
  AestheticId,
  BudgetSensitivity,
  ExposureId,
  ExteriorConditionId,
  GeometryConditionId,
  Importance,
  MoistureExposure,
  MotorizationInterest,
  MountingSubstrateId,
  OpeningConditionId,
  OperationFrequency,
  PriorityDefinition,
  PriorityId,
  PrivacyNeed,
  RequestedFeatureId,
  RoomId,
  Severity,
  SingleDirectionId,
  DarkeningExpectation,
  WindowUse,
} from "../types";

// ───────────────────────────── vocabulary tables ────────────────────────────
// Each is `Record<Union, true>` so the compiler enforces exhaustiveness in both
// directions. `keys()` then yields the allowlist used by both the JSON schema
// and the validator.

const keys = <T extends string>(table: Record<T, true>): readonly T[] =>
  Object.keys(table) as T[];

const ROOM: Record<RoomId, true> = {
  bedroom: true, nursery: true, living: true, kitchen: true, bathroom: true,
  dining: true, office: true, media: true, patio: true, commercial: true, other: true,
};
const EXPOSURE: Record<ExposureId, true> = {
  north: true, south: true, east: true, west: true, mixed: true, unknown: true,
};
const SEVERITY: Record<Severity, true> = {
  none: true, mild: true, moderate: true, severe: true, unknown: true,
};
const IMPORTANCE: Record<Importance, true> = {
  none: true, low: true, moderate: true, high: true, critical: true, unknown: true,
};
const PRIVACY: Record<PrivacyNeed, true> = {
  none: true, daytime: true, nighttime: true, both: true, unknown: true,
};
const DARKENING: Record<DarkeningExpectation, true> = {
  none: true, moderate: true, maximum: true, "total-blackout-requested": true, unknown: true,
};
const WINDOW_USE: Record<WindowUse, true> = {
  "raised-to-clear-glass": true, "left-down-louvers-adjusted": true,
  "rarely-operated": true, mixed: true, unknown: true,
};
const OPERATION: Record<OperationFrequency, true> = {
  daily: true, occasional: true, rare: true, unknown: true,
};
const BUDGET: Record<BudgetSensitivity, true> = {
  low: true, moderate: true, high: true, unknown: true,
};
const MOISTURE: Record<MoistureExposure, true> = {
  none: true, humid: true, "direct-splash": true, unknown: true,
};
const MOUNTING: Record<MountingSubstrateId, true> = {
  stone: true, siding: true, fascia: true, soffit: true,
  "structural-framing": true, other: true, unknown: true,
};
const MOTORIZATION: Record<MotorizationInterest, true> = {
  requested: true, open: true, uninterested: true, unknown: true,
};
const PRIORITY: Record<PriorityId, true> = {
  budget: true, functionality: true, aesthetics: true, "energy-efficiency": true,
  "room-darkening": true, privacy: true, "view-preservation": true, "glare-control": true,
  "child-safety": true, accessibility: true, convenience: true, motorization: true,
  durability: true, "moisture-resistance": true, "clear-glass-when-open": true,
  "directional-light-control": true, "lifestyle-requirement": true,
};
const AESTHETIC: Record<AestheticId, true> = {
  traditional: true, "modern-minimal": true, architectural: true, "fabric-forward": true,
  formal: true, "horizontal-detail": true, "luxury-unspecified": true,
};
const ACCESS: Record<AccessConditionId, true> = {
  "hard-to-reach": true, "high-window": true, "above-tub": true,
  "furniture-blocked": true, "mobility-or-age-limited": true,
};
const GEOMETRY: Record<GeometryConditionId, true> = {
  "specialty-shape": true, "extremely-tall-narrow": true, "very-wide": true,
  "multi-window-bank": true, "small-window": true, "large-architectural-glass": true,
};
const EXTERIOR: Record<ExteriorConditionId, true> = {
  "high-wind-exposure": true, "unknown-mounting-substrate": true,
  "no-hardwired-power": true, "ice-accumulation": true,
};
const OPENING: Record<OpeningConditionId, true> = {
  "sliding-door": true, "patio-door-frequent-use": true, "tilt-in-window": true,
  "french-door": true, "obstruction-faucet": true, "obstruction-furniture": true,
  "obstruction-window-handle": true, "obstruction-trim-or-switch": true,
  "inadequate-stack-back": true, "shallow-room-depth": true,
};
const PRODUCT: Record<SingleDirectionId, true> = {
  cellular: true, "interior-roller": true, "banded-shades": true, "interior-solar": true,
  shutters: true, "wood-blinds": true, "faux-composite-blinds": true, "roman-shades": true,
  drapery: true, "exterior-solar": true,
};
const FEATURE: Record<RequestedFeatureId, true> = {
  "total-blackout": true, "free-hanging-exterior-shade": true,
  "stained-synthetic-shutter": true, "oversized-louvers": true, "inside-mount": true,
  "full-functional-drapery": true, "large-pattern-fabric": true,
  "battery-powered-exterior": true, "corded-operation": true,
};

/** Scalar fields: name → allowed values. */
const SCALAR_FIELDS = {
  room: keys(ROOM),
  exposure: keys(EXPOSURE),
  solarHeat: keys(SEVERITY),
  viewImportance: keys(IMPORTANCE),
  privacyNeed: keys(PRIVACY),
  roomDarkening: keys(DARKENING),
  windowUse: keys(WINDOW_USE),
  operationFrequency: keys(OPERATION),
  budgetSensitivity: keys(BUDGET),
  moistureExposure: keys(MOISTURE),
  motorizationInterest: keys(MOTORIZATION),
  mountingSubstrate: keys(MOUNTING),
} as const;

/** List fields: name → allowed members. */
const LIST_FIELDS = {
  priorities: keys(PRIORITY),
  unrankedConcerns: keys(PRIORITY),
  aesthetic: keys(AESTHETIC),
  access: keys(ACCESS),
  geometry: keys(GEOMETRY),
  exteriorConditions: keys(EXTERIOR),
  openings: keys(OPENING),
  requestedProducts: keys(PRODUCT),
  requestedFeatures: keys(FEATURE),
} as const;

export type ExtractionFieldName = keyof typeof SCALAR_FIELDS | keyof typeof LIST_FIELDS;

/** Every field the model may propose an update for. */
export const EXTRACTION_FIELDS: readonly ExtractionFieldName[] = [
  ...(Object.keys(SCALAR_FIELDS) as (keyof typeof SCALAR_FIELDS)[]),
  ...(Object.keys(LIST_FIELDS) as (keyof typeof LIST_FIELDS)[]),
];

export function isListField(field: ExtractionFieldName): boolean {
  return field in LIST_FIELDS;
}

/** Allowed values for one field, for validation and for the prompt. */
export function allowedValues(field: ExtractionFieldName): readonly string[] {
  return field in SCALAR_FIELDS
    ? SCALAR_FIELDS[field as keyof typeof SCALAR_FIELDS]
    : LIST_FIELDS[field as keyof typeof LIST_FIELDS];
}

// ───────────────────────────── delta schema ─────────────────────────────────

/**
 * How much of a homeowner's own words we keep. Evidence is their text, so it
 * is capped and never logged.
 */
const MAX_EVIDENCE_CHARS = 200;
/** A runaway or adversarial response cannot flood the ledger. */
const MAX_UPDATES = 24;

export type UpdateBasis = "stated" | "inferred";

/**
 * Assert adds or strengthens; retract takes back.
 *
 * WITHOUT RETRACT THE CONTRACT IS MONOTONIC, AND A MONOTONIC CONTRACT CANNOT
 * REPRESENT A CUSTOMER CHANGING THEIR MIND. A scalar could at least be
 * overwritten, but a list member — a priority, a condition — could never leave
 * once it arrived, whatever the homeowner said afterwards. Live conversation
 * proved the cost: a homeowner said plainly that seeing out through a lowered
 * shade was not what they meant, twice, and `view-preservation` stayed in their
 * priorities and kept driving the recommendation, because nothing in the system
 * could remove it.
 */
export type UpdateOperation = "assert" | "retract";

/**
 * What kind of help this message is asking for.
 *
 * Read on the same call that extracts facts — the model is already reading the
 * sentence, so this costs no extra request and no extra latency. It exists
 * because the server previously had one shape for every message: extract
 * product facts, assess, qualify. "What are your hours?" went through window
 * qualification and came back talking about glare.
 *
 * Only `project` and `discovery` reach the product pipeline. The rest are
 * answered from approved knowledge and stop.
 */
export type MessageIntent =
  | "general"
  | "consultation"
  | "product"
  | "project"
  | "discovery"
  /**
   * They want to take the next step — a visit, a measure, a quote, getting
   * started. Read semantically on the call that was already happening rather
   * than matched against a list of words like "quote" and "appointment", which
   * would miss "we're ready" and fire on "do you quote sizes in inches".
   */
  | "scheduling";

export const MESSAGE_INTENTS: readonly MessageIntent[] = [
  "general", "consultation", "product", "project", "discovery", "scheduling",
];

/** Intents that should be answered outright rather than qualified. */
export function isInformational(intent: MessageIntent): boolean {
  return (
    intent === "general" ||
    intent === "consultation" ||
    intent === "product" ||
    intent === "scheduling"
  );
}

/**
 * Whether this message earns a booking prompt.
 *
 * THE CUSTOMER DECIDES THIS, NOT THE FUNNEL. A consultation link after an
 * answer about opening hours is a sales reflex; after "can someone come
 * measure?" it is the answer. Nothing else in the system may turn this on.
 */
export function isSchedulingIntent(intent: MessageIntent): boolean {
  return intent === "scheduling";
}

export interface FactUpdate {
  readonly field: ExtractionFieldName;
  readonly value: string;
  readonly basis: UpdateBasis;
  readonly evidence: string;
  readonly operation: UpdateOperation;
}

/**
 * The structured-output schema. Four properties, one field enum, zero unions —
 * far inside the limits that rejected the original twenty-field object.
 *
 * `value` is an untyped string on purpose. Typing it per field would need a
 * twenty-branch `oneOf`, which is exactly the complexity that failed before.
 * Validity moves entirely to the allowlist in `validateUpdates`, where it
 * already lived. Nothing is lost: invalid *values* were never the failure mode,
 * spurious *fields* were, and those are what evidence now blocks.
 */
export function buildDeltaSchema(): Record<string, unknown> {
  return {
    type: "object",
    properties: {
      updates: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", enum: [...EXTRACTION_FIELDS] },
            value: { type: "string" },
            basis: { type: "string", enum: ["stated", "inferred"] },
            evidence: { type: "string" },
            operation: { type: "string", enum: ["assert", "retract"] },
          },
          required: ["field", "value", "basis", "evidence", "operation"],
          additionalProperties: false,
        },
      },
      intent: { type: "string", enum: [...MESSAGE_INTENTS] },
    },
    required: ["updates", "intent"],
    additionalProperties: false,
  };
}

/**
 * Meanings for the values whose *names* invite the wrong reading.
 *
 * A bare identifier list is not a vocabulary, it is a word association test.
 * "I hate how much they block the window" scored `view-preservation` because
 * that identifier contains the concept "view" and the sentence contains a
 * window — while the value that actually meant what the homeowner said,
 * `clear-glass-when-open`, sat unexplained one line below it.
 *
 * Only genuinely confusable entries are listed. A gloss on every value would
 * bury these in noise, which is the same failure in a different shape.
 */
const DISAMBIGUATION: Readonly<Record<string, string>> = {
  viewImportance:
    "How much seeing OUT THROUGH the covering matters WHILE IT IS DOWN. Nothing to do with how much of the window is covered when it is up — that is clear-glass-when-open.",
  "windowUse:raised-to-clear-glass":
    "They pull the covering fully up during the day and want the glass unobstructed. Says nothing about seeing out while it is down.",
  "windowUse:left-down-louvers-adjusted":
    "The covering stays down and they tilt or adjust it in place.",
  "openings:inadequate-stack-back":
    "There is not enough clear WALL BESIDE the window to park drapery panels. About wall space either side, never about how much of the glass a raised covering stacks over.",
  "openings:shallow-room-depth":
    "The room is too shallow for the covering to project into, not a comment on the window.",
};

/**
 * Every field and its allowed values, for the system prompt.
 *
 * Priority meanings come from Phase A's own `clarifies` text rather than a copy
 * kept here. Phase A already draws the distinction this defect turned on —
 * "seeing out while the treatment is deployed, not only when it is raised" —
 * and it was never being shown to the model. Injecting the definitions means
 * the two can never drift apart.
 */
export function describeVocabulary(
  priorityDefinitions: readonly PriorityDefinition[] = []
): string {
  const clarifies = new Map(priorityDefinitions.map((p) => [p.id as string, p.clarifies]));

  return EXTRACTION_FIELDS.map((field) => {
    const isList = isListField(field);
    const lines = [`${field}${isList ? "[]" : ""}: ${allowedValues(field).join(" | ")}`];

    const fieldNote = DISAMBIGUATION[field];
    if (fieldNote) lines.push(`    ${fieldNote}`);

    for (const value of allowedValues(field)) {
      const note =
        DISAMBIGUATION[`${field}:${value}`] ??
        ((field === "priorities" || field === "unrankedConcerns") ? clarifies.get(value) : undefined);
      if (note) lines.push(`    - ${value}: ${note}`);
    }
    return lines.join("\n");
  }).join("\n");
}

// ───────────────────────────── evidence ─────────────────────────────────────

/**
 * Case- and whitespace-insensitive, otherwise exact.
 *
 * Deliberately conservative. A looser match would let a paraphrase stand in for
 * a quote, and the whole point is that the model cannot assert a fact without
 * pointing at words the homeowner actually wrote. If live evaluation shows
 * legitimate facts being dropped, loosen it against that measurement — not
 * before.
 */
export function normaliseForEvidence(text: string): string {
  return text.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim();
}

export function evidenceSupports(message: string, evidence: string): boolean {
  const quote = normaliseForEvidence(evidence);
  if (quote.length < 2) return false;
  return normaliseForEvidence(message).includes(quote);
}

// ───────────────────────── retraction targeting ─────────────────────────────

/**
 * Words that signal something is being taken back rather than described.
 *
 * Generic withdrawal language, not sentences from any transcript. A cue alone
 * proves nothing — it must be paired with a link to the specific fact, which is
 * what stops a bare "No." erasing whatever happens to be nearby.
 */
const WITHDRAWAL_CUES = [
  "not", "n't", "no longer", "never", "forget", "drop", "skip", "ignore",
  "changed my mind", "instead of", "without", "scratch", "nevermind",
  "don t", "doesn t", "didn t", "isn t", "won t", "wasn t", "aren t",
];

/** Tokens too generic to identify anything. */
const UNIDENTIFYING = new Set([
  "when", "with", "that", "this", "from", "into", "onto", "over", "than",
  "unknown", "other", "none", "both", "some", "very", "more", "most", "less",
  "mild", "high", "moderate", "severe", "maximum", "minimum", "requested",
  "unspecified", "mixed", "rare", "daily", "occasional", "true", "false",
]);

const tokenise = (text: string): readonly string[] =>
  text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((word) => word.length >= 4 && !UNIDENTIFYING.has(word));

/** Loose stem match, so "dark" reaches "darkening" and "preserving" reaches "preservation". */
function related(a: string, b: string): boolean {
  if (a === b) return true;
  const stem = (word: string) => word.replace(/(ing|ion|ions|ed|es|s)$/, "");
  const [x, y] = [stem(a), stem(b)];
  if (x.length < 4 || y.length < 4) return false;
  return x === y || x.startsWith(y) || y.startsWith(x);
}

/**
 * Whether a quote genuinely takes back THIS fact, rather than merely sitting
 * near it in the conversation.
 *
 * THE DEFECT THIS EXISTS FOR: a homeowner answering a question with "No. I need
 * privacy" had `clear-glass-when-open` retracted. The quote was real, present in
 * the message and stated — every existing gate passed — and it identified
 * nothing at all. Proximity was doing the work.
 *
 * Two independent conditions, both required:
 *
 *   1. WITHDRAWAL LANGUAGE. Something in the quote has to mean "take this away".
 *      "I need privacy" describes a requirement; it cannot remove one.
 *   2. A LINK TO THE TARGET. The quote must contain a word belonging to the
 *      value being withdrawn — or, when the value is a bare magnitude like
 *      "high", to the field it belongs to. "No." names nothing, so it retracts
 *      nothing, however emphatic it is.
 *
 * Both are derived from the field and value themselves, so a new fact added to
 * the vocabulary is covered the day it is added, with no list to maintain.
 */
export function retractionTargeted(field: string, value: string, evidence: string): boolean {
  const quote = normaliseForEvidence(evidence).replace(/['’]/g, " ");
  const words = quote.split(/[^a-z]+/).filter(Boolean);
  // Whole words only: "nothing" and "another" contain "not" and mean nothing
  // like it. Multi-word cues are matched against the quote as written.
  const cued = WITHDRAWAL_CUES.some((cue) =>
    cue.includes(" ") ? quote.includes(cue) : words.includes(cue)
  );
  if (!cued) return false;

  // A meaningful value identifies itself; a magnitude borrows its field's name.
  const valueTokens = tokenise(value);
  const targets = valueTokens.length ? valueTokens : tokenise(field);
  if (!targets.length) return false;

  return targets.some((target) => words.some((word) => related(word, target)));
}

// ───────────────────────────── validation ───────────────────────────────────

export interface ValidatedUpdates {
  /** What the visitor is asking for. Defaults to `project` — see `readIntent`. */
  readonly intent: MessageIntent;
  readonly accepted: readonly FactUpdate[];
  /** Human-readable reasons, for diagnostics. Never contains homeowner text. */
  readonly rejected: readonly string[];
}

/**
 * Every gate an update must pass before it can touch state: a known field, a
 * value inside that field's closed vocabulary, a recognised basis, and evidence
 * that genuinely appears in the message being processed.
 *
 * Rejections are counted, never repaired. Guessing what the model meant is how
 * a spurious fact becomes a customer fact.
 */
export function validateUpdates(raw: unknown, message: string): ValidatedUpdates {
  const accepted: FactUpdate[] = [];
  const rejected: string[] = [];
  const list = (raw as { updates?: unknown } | null)?.updates;

  const intent = readIntent(raw);

  if (!Array.isArray(list)) {
    return { intent, accepted, rejected: ["payload had no updates array"] };
  }

  for (const item of list.slice(0, MAX_UPDATES)) {
    if (typeof item !== "object" || item === null) {
      rejected.push("update was not an object");
      continue;
    }
    const { field, value, basis, evidence, operation } = item as Record<string, unknown>;

    if (typeof field !== "string" || !(EXTRACTION_FIELDS as readonly string[]).includes(field)) {
      rejected.push(`unknown field: ${typeof field === "string" ? field : typeof field}`);
      continue;
    }
    const name = field as ExtractionFieldName;

    if (typeof value !== "string" || !allowedValues(name).includes(value)) {
      rejected.push(`${name}: value outside vocabulary`);
      continue;
    }
    // `"unknown"` is a vocabulary member Phase A already treats as not-known,
    // so recording it would only re-assert an absence.
    if (value === "unknown") {
      rejected.push(`${name}: explicit unknown, nothing to record`);
      continue;
    }
    if (basis !== "stated" && basis !== "inferred") {
      rejected.push(`${name}: unrecognised basis`);
      continue;
    }
    if (typeof evidence !== "string" || !evidenceSupports(message, evidence)) {
      rejected.push(`${name}: evidence not found in the current message`);
      continue;
    }
    if (operation !== "assert" && operation !== "retract") {
      rejected.push(`${name}: unrecognised operation`);
      continue;
    }
    // A retraction erases something the homeowner is on record as having said,
    // so it is the one operation that may not rest on a guess. Inference is a
    // hypothesis; it may propose a fact, never withdraw one.
    if (operation === "retract" && basis !== "stated") {
      rejected.push(`${name}: inferred retraction refused`);
      continue;
    }
    // A quote that does not name what it withdraws is retracting by proximity,
    // which is how "No. I need privacy" erased an unrelated requirement.
    if (operation === "retract" && !retractionTargeted(name, value, evidence)) {
      rejected.push(`${name}: retraction evidence does not identify ${value}`);
      continue;
    }

    accepted.push({
      field: name,
      value,
      basis,
      evidence: evidence.trim().slice(0, MAX_EVIDENCE_CHARS),
      operation,
    });
  }

  return { intent, accepted, rejected };
}

/**
 * The declared intent, or `project` when it is missing or unrecognised.
 *
 * Defaulting to `project` keeps a malformed response on the path that has
 * always existed and is fully guardrailed, rather than routing it to the newer
 * answer path on a value nobody validated.
 */
export function readIntent(raw: unknown): MessageIntent {
  const value = (raw as { intent?: unknown } | null)?.intent;
  return typeof value === "string" && (MESSAGE_INTENTS as readonly string[]).includes(value)
    ? (value as MessageIntent)
    : "project";
}
