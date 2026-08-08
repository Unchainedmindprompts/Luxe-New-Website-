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
  OpeningConditionId,
  OperationFrequency,
  PriorityId,
  PrivacyNeed,
  ProjectFacts,
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

/** Guards against a runaway list from a confused or adversarial response. */
const MAX_LIST_LENGTH = 12;

// ───────────────────────────── JSON schema ──────────────────────────────────

/**
 * The structured-output schema handed to the provider.
 *
 * Every property is required and nullable rather than optional: strict schema
 * modes want a closed object, and `null` carries the "not stated" meaning more
 * clearly than an absent key. `additionalProperties: false` is what stops the
 * model inventing a field.
 */
export function buildExtractionSchema(): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  for (const [name, values] of Object.entries(SCALAR_FIELDS)) {
    properties[name] = { anyOf: [{ type: "string", enum: [...values] }, { type: "null" }] };
  }
  for (const [name, values] of Object.entries(LIST_FIELDS)) {
    properties[name] = {
      anyOf: [
        { type: "array", items: { type: "string", enum: [...values] } },
        { type: "null" },
      ],
    };
  }
  return {
    type: "object",
    properties,
    required: [...Object.keys(SCALAR_FIELDS), ...Object.keys(LIST_FIELDS)],
    additionalProperties: false,
  };
}

/** Field names and their allowed values, for the system prompt. */
export function describeVocabulary(): string {
  const lines: string[] = [];
  for (const [name, values] of Object.entries(SCALAR_FIELDS)) {
    lines.push(`${name}: ${values.join(" | ")}`);
  }
  for (const [name, values] of Object.entries(LIST_FIELDS)) {
    lines.push(`${name}[]: ${values.join(" | ")}`);
  }
  return lines.join("\n");
}

// ───────────────────────────── validation ───────────────────────────────────

export interface ValidatedFacts {
  readonly facts: ProjectFacts;
  readonly unrankedConcerns: readonly PriorityId[];
  /** Values the model or client supplied that are not in the vocabulary. */
  readonly dropped: readonly string[];
}

function cleanList(
  raw: unknown,
  allowed: readonly string[],
  field: string,
  dropped: string[]
): string[] | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (!Array.isArray(raw)) {
    dropped.push(`${field}: not an array`);
    return undefined;
  }
  const out: string[] = [];
  for (const item of raw.slice(0, MAX_LIST_LENGTH)) {
    if (typeof item === "string" && allowed.includes(item)) {
      if (!out.includes(item)) out.push(item);
    } else {
      dropped.push(`${field}: ${typeof item === "string" ? item : typeof item}`);
    }
  }
  return out;
}

/**
 * Validates anything claiming to be project facts — a model extraction or a
 * client-supplied state blob. Both go through this function, because the client
 * is no more trusted than the model.
 */
export function validateFacts(raw: unknown): ValidatedFacts {
  const dropped: string[] = [];
  const source = (raw ?? {}) as Record<string, unknown>;
  const facts: Record<string, unknown> = {};

  for (const [field, allowed] of Object.entries(SCALAR_FIELDS)) {
    const value = source[field];
    if (value === null || value === undefined) continue;
    // `Object.entries` collapses the per-field value types to their union, so
    // the allowlist is widened back to strings for the membership test.
    if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
      // `"unknown"` is a legitimate vocabulary member that Phase A already
      // treats as not-known; carrying it adds nothing, so it is normalised away.
      if (value !== "unknown") facts[field] = value;
    } else {
      dropped.push(`${field}: ${typeof value === "string" ? value : typeof value}`);
    }
  }

  for (const [field, allowed] of Object.entries(LIST_FIELDS)) {
    if (field === "unrankedConcerns") continue;
    const cleaned = cleanList(source[field], allowed as readonly string[], field, dropped);
    if (cleaned !== undefined) facts[field] = cleaned;
  }

  const unranked = cleanList(source.unrankedConcerns, keys(PRIORITY), "unrankedConcerns", dropped);

  return {
    facts: facts as ProjectFacts,
    unrankedConcerns: (unranked ?? []) as PriorityId[],
    dropped,
  };
}

/**
 * Folds a new extraction into what was already known.
 *
 * Scalars: a new value replaces the old one, because the homeowner's latest
 * statement is the current truth — including a correction.
 *
 * Lists: unioned rather than replaced. Each extraction sees only the newest
 * message, so replacing would silently forget a condition mentioned two turns
 * ago. The exception is `priorities`: a fresh ranking supersedes the old one
 * outright, since merging two orderings would produce a ranking nobody stated.
 */
export function mergeFacts(prior: ProjectFacts, incoming: ProjectFacts): ProjectFacts {
  const merged: Record<string, unknown> = { ...prior };

  for (const field of Object.keys(SCALAR_FIELDS)) {
    const value = (incoming as Record<string, unknown>)[field];
    if (value !== undefined) merged[field] = value;
  }

  for (const field of Object.keys(LIST_FIELDS)) {
    if (field === "unrankedConcerns") continue;
    const next = (incoming as Record<string, unknown>)[field] as string[] | undefined;
    if (next === undefined) continue;
    if (field === "priorities") {
      if (next.length) merged[field] = next;
      continue;
    }
    const before = (merged[field] as string[] | undefined) ?? [];
    merged[field] = [...before, ...next.filter((v) => !before.includes(v))];
  }

  return merged as ProjectFacts;
}
