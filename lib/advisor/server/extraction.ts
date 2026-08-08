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

export interface FactUpdate {
  readonly field: ExtractionFieldName;
  readonly value: string;
  readonly basis: UpdateBasis;
  readonly evidence: string;
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
          },
          required: ["field", "value", "basis", "evidence"],
          additionalProperties: false,
        },
      },
    },
    required: ["updates"],
    additionalProperties: false,
  };
}

/** Every field and its allowed values, for the system prompt. */
export function describeVocabulary(): string {
  return EXTRACTION_FIELDS.map((field) =>
    `${field}${isListField(field) ? "[]" : ""}: ${allowedValues(field).join(" | ")}`
  ).join("\n");
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

// ───────────────────────────── validation ───────────────────────────────────

export interface ValidatedUpdates {
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

  if (!Array.isArray(list)) {
    return { accepted, rejected: ["payload had no updates array"] };
  }

  for (const item of list.slice(0, MAX_UPDATES)) {
    if (typeof item !== "object" || item === null) {
      rejected.push("update was not an object");
      continue;
    }
    const { field, value, basis, evidence } = item as Record<string, unknown>;

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

    accepted.push({
      field: name,
      value,
      basis,
      evidence: evidence.trim().slice(0, MAX_EVIDENCE_CHARS),
    });
  }

  return { accepted, rejected };
}
