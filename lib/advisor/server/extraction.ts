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

export type ExtractionFieldName = keyof typeof SCALAR_FIELDS | keyof typeof LIST_FIELDS;

// ───────────────────────────── extraction groups ────────────────────────────

/**
 * WHY THIS IS SPLIT.
 *
 * The first implementation sent all twenty fields as one structured-output
 * schema. Against the real API that fails every time, and the live evaluation
 * proved it: `Schemas contains too many parameters with union types (20 ...
 * limit: 16)`, and once the unions were removed, `Schema is too complex`. A
 * schema this wide is simply not a shape the structured-output compiler
 * accepts.
 *
 * So extraction is three narrow calls instead of one wide one. Each group is
 * comfortably inside the limits, and each is validated against the real API by
 * `npm run test:advisor:schema` — the check whose absence let the original bug
 * reach a live run.
 *
 * The split is also better prompting. Asking one call to simultaneously judge
 * what someone *wants*, what their *window physically is*, and what they
 * *asked for by name* is three unrelated judgments in one breath. Each group
 * now gets a system prompt about one thing.
 *
 * GROUPS ARE DISJOINT. Every field appears in exactly one group, enforced by
 * `assertGroupsPartitionFields()` and asserted in the test suite. That is what
 * makes cross-extractor conflict structurally impossible rather than merely
 * unlikely — see `mergeExtractionGroups`.
 */
export interface ExtractionGroup {
  readonly id: "intent" | "physical" | "product";
  /** Names the group's subject for its system prompt. */
  readonly subject: string;
  readonly fields: readonly ExtractionFieldName[];
}

export const EXTRACTION_GROUPS: readonly ExtractionGroup[] = [
  {
    id: "intent",
    subject:
      "what the homeowner wants from the room — the outcome they are after, not the window itself",
    fields: [
      "priorities",
      "unrankedConcerns",
      "viewImportance",
      "privacyNeed",
      "roomDarkening",
      "budgetSensitivity",
      "aesthetic",
    ],
  },
  {
    id: "physical",
    subject:
      "the physical reality of the room and the opening — observable conditions, not preferences",
    fields: [
      "room",
      "exposure",
      "solarHeat",
      "windowUse",
      "geometry",
      "moistureExposure",
      "access",
      "openings",
      "exteriorConditions",
    ],
  },
  {
    id: "product",
    subject:
      "products the homeowner named and how they expect to operate them",
    fields: [
      "requestedProducts",
      "requestedFeatures",
      "motorizationInterest",
      "operationFrequency",
    ],
  },
];

/**
 * Fails loudly if the groups stop being a clean partition of the vocabulary.
 * Called by the test suite; a missing field would silently become unextractable
 * and a duplicated one would create the cross-group conflict the merge step
 * assumes cannot happen.
 */
export function assertGroupsPartitionFields(): { missing: string[]; duplicated: string[] } {
  const all = [...Object.keys(SCALAR_FIELDS), ...Object.keys(LIST_FIELDS)];
  const seen = new Map<string, number>();
  for (const group of EXTRACTION_GROUPS) {
    for (const field of group.fields) seen.set(field, (seen.get(field) ?? 0) + 1);
  }
  return {
    missing: all.filter((f) => !seen.has(f)),
    duplicated: [...seen.entries()].filter(([, n]) => n > 1).map(([f]) => f),
  };
}

// ───────────────────────────── JSON schema ──────────────────────────────────

/**
 * The structured-output schema for one group.
 *
 * Fields are OPTIONAL rather than nullable. The first design made every field
 * `anyOf: [value, null]` to express "not stated", which is what blew the
 * union-type limit. Omission carries the same meaning at zero schema cost: an
 * absent key means the homeowner did not say, an empty array means they said
 * there are none, and a present value means they said it. Three states, no
 * unions.
 *
 * `additionalProperties: false` is what stops the model inventing a field.
 */
export function buildGroupSchema(group: ExtractionGroup): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  for (const field of group.fields) {
    if (field in SCALAR_FIELDS) {
      const values = SCALAR_FIELDS[field as keyof typeof SCALAR_FIELDS];
      properties[field] = { type: "string", enum: [...values] };
    } else {
      const values = LIST_FIELDS[field as keyof typeof LIST_FIELDS];
      properties[field] = { type: "array", items: { type: "string", enum: [...values] } };
    }
  }
  return { type: "object", properties, required: [], additionalProperties: false };
}

/** Field names and allowed values for one group, for its system prompt. */
export function describeGroupVocabulary(group: ExtractionGroup): string {
  return group.fields
    .map((field) =>
      field in SCALAR_FIELDS
        ? `${field}: ${SCALAR_FIELDS[field as keyof typeof SCALAR_FIELDS].join(" | ")}`
        : `${field}[]: ${LIST_FIELDS[field as keyof typeof LIST_FIELDS].join(" | ")}`
    )
    .join("\n");
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
 * Combines the per-group extractions from one turn into a single fact set.
 *
 * CONFLICT HANDLING. `EXTRACTION_GROUPS` is a strict partition — every field
 * belongs to exactly one group — so two extractors cannot legitimately report
 * the same field, and `assertGroupsPartitionFields()` plus a test keep it that
 * way. This function still handles the case rather than assuming it away: if a
 * field arrives from more than one group, the value from the earlier group in
 * declaration order wins, the loser is recorded in `conflicts`, and nothing is
 * silently dropped. A non-empty `conflicts` means the partition has been
 * broken and the grouping needs fixing — it is a bug signal, not a routine
 * outcome.
 *
 * The ranked/unranked overlap is a real conflict and is resolved here on its
 * own terms: a concern the homeowner ranked is removed from `unrankedConcerns`,
 * because a stated ranking answers the question that list exists to raise.
 */
export interface CombinedExtraction {
  readonly facts: ProjectFacts;
  readonly unrankedConcerns: readonly PriorityId[];
  readonly dropped: readonly string[];
  readonly conflicts: readonly string[];
}

export function mergeExtractionGroups(
  results: readonly { groupId: string; validated: ValidatedFacts }[]
): CombinedExtraction {
  const facts: Record<string, unknown> = {};
  const owner = new Map<string, string>();
  const conflicts: string[] = [];
  const dropped: string[] = [];
  let unranked: PriorityId[] = [];

  for (const { groupId, validated } of results) {
    dropped.push(...validated.dropped);
    unranked = [...unranked, ...validated.unrankedConcerns.filter((c) => !unranked.includes(c))];
    for (const [field, value] of Object.entries(validated.facts)) {
      if (value === undefined) continue;
      const existing = owner.get(field);
      if (existing && existing !== groupId) {
        conflicts.push(`${field}: kept ${existing}, discarded ${groupId}`);
        continue;
      }
      facts[field] = value;
      owner.set(field, groupId);
    }
  }

  const ranked = new Set((facts.priorities as PriorityId[] | undefined) ?? []);
  return {
    facts: facts as ProjectFacts,
    unrankedConcerns: unranked.filter((c) => !ranked.has(c)),
    dropped,
    conflicts,
  };
}

/** True when the homeowner has settled this dimension — `[]` counts as settled. */
export function isFieldKnown(facts: ProjectFacts, field: ExtractionFieldName): boolean {
  return (facts as Record<string, unknown>)[field] !== undefined;
}

/**
 * Which groups are worth calling this turn.
 *
 * A group with nothing left to learn is skipped, which saves a model call late
 * in a conversation. Correctness is preferred over saving calls: the first turn
 * always runs every group, and if the rule would skip everything the whole set
 * runs instead, so the advisor can never go deaf.
 *
 * KNOWN LIMIT: once every field in a group is settled, that group stops being
 * called, so a homeowner correcting an already-settled fact in it ("actually
 * it's the bedroom") will not be heard. Groups this wide rarely fill up before
 * a recommendation, and the alternative — re-running all three every turn
 * forever — costs a call per turn to catch a rare correction. Revisit if live
 * conversations show corrections being missed.
 */
export function groupsForTurn(
  facts: ProjectFacts,
  turnCount: number,
  groups: readonly ExtractionGroup[] = EXTRACTION_GROUPS
): readonly ExtractionGroup[] {
  if (turnCount <= 0) return groups;
  const open = groups.filter((group) => group.fields.some((field) => !isFieldKnown(facts, field)));
  return open.length ? open : groups;
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
