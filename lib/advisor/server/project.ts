/**
 * Luxe Window Advisor — the project, as more than one space. (Phase 7)
 *
 * A homeowner has rooms. The ledger had one.
 *
 * `room` was a scalar fact alongside `exposure` and `roomDarkening`, so "I want
 * the bedrooms dark and something modern for the living spaces" wrote `room`
 * twice and kept the second. Everything the first room had established —
 * darkening, privacy, exposure — stayed in the ledger and silently re-attached
 * itself to whichever room won. One recommendation came out, and nothing said
 * which space it was for.
 *
 * WHAT CHANGES IS THE SHAPE, NOT THE ENGINE. Phase A still receives one flat
 * `ProjectFacts` describing one coherent space; it never learns that others
 * exist. All this module does is decide which space that is and keep the rest
 * safe meanwhile — which is why no Phase A rule, condition or type moves.
 *
 * DELIBERATELY NOT A FLOOR PLAN. There is no geometry, no adjacency, no room
 * CRUD, and no persistence. An area is a place the conversation has been, held
 * for as long as the conversation lasts.
 */
import type { ProjectFacts } from "../types";
import type { FactLedger, FactRecord, LedgerApplication } from "./ledger";
import type { ExtractionFieldName, FactUpdate } from "./extraction";

/**
 * Facts about the household rather than about a window.
 *
 * Kept deliberately short. Budget is the customer's, and an appetite for
 * motorization is a preference they hold before anyone names a room — asking
 * for either again per area would be the questionnaire behaviour this advisor
 * keeps being pulled back toward.
 *
 * Everything else is a property of a particular opening. `aesthetic` is the
 * closest call and stays area-specific on purpose: "modern in the living room"
 * is the exact sentence that started this, and a homeowner who wants a cohesive
 * look will say so and have it recorded in each area they say it about.
 */
export const SHARED_FIELDS: readonly string[] = ["budgetSensitivity", "motorizationInterest"];

export const isSharedField = (field: string): boolean => SHARED_FIELDS.includes(field);

/**
 * One space the conversation has been about.
 *
 * `id` is derived and stable for the life of the conversation. `room` is the
 * Phase A vocabulary value, which is what the engine needs. `label` is the
 * homeowner's own words, kept only so the reply and the card can call the space
 * what they called it.
 */
export interface ProjectArea {
  readonly id: string;
  readonly room: string | null;
  readonly label: string | null;
  readonly ledger: FactLedger;
}

export interface Project {
  /** Facts that hold across the whole job. */
  readonly shared: FactLedger;
  readonly areas: readonly ProjectArea[];
  /** Which space the conversation is about right now. */
  readonly activeAreaId: string | null;
}

export const emptyProject = (): Project => ({ shared: {}, areas: [], activeAreaId: null });

// ───────────────────────────── area identity ────────────────────────────────

/**
 * Words that distinguish two rooms of the same kind.
 *
 * A bounded list, and the only place wording affects identity. Without it,
 * "the primary bedroom needs blackout but the guest room doesn't" collapses
 * into one bedroom and one of those facts is lost — which is the same defect
 * one level down.
 *
 * Anything not on this list is ignored rather than guessed at: two spaces the
 * homeowner has not distinguished stay one area, which is the right default
 * for "the bedrooms".
 */
const QUALIFIERS = [
  "primary", "master", "main", "guest", "spare", "kids", "kid", "children",
  "nursery", "upstairs", "downstairs", "front", "back", "second",
];

/** Room vocabulary words as a homeowner says them, for reading a bare phrase. */
const ROOM_WORDS: Readonly<Record<string, string>> = {
  bedroom: "bedroom", bedrooms: "bedroom", bed: "bedroom",
  nursery: "nursery", baby: "nursery",
  living: "living", lounge: "living", "family": "living", great: "living", den: "living",
  kitchen: "kitchen",
  bathroom: "bathroom", bath: "bathroom", powder: "bathroom", ensuite: "bathroom",
  dining: "dining",
  office: "office", study: "office", den2: "office",
  media: "media", theater: "media", theatre: "media",
  patio: "patio", porch: "patio", sunroom: "patio",
  commercial: "commercial",
};

const normalise = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** The Phase A room value a homeowner's phrase points at, if any. */
export function readRoomWord(phrase: string): string | null {
  for (const word of normalise(phrase).split(" ")) {
    const room = ROOM_WORDS[word];
    if (room) return room;
  }
  return null;
}

/**
 * A stable key for a space.
 *
 * `bedroom`, or `bedroom:primary` once the homeowner has drawn the distinction.
 * Two undistinguished bedrooms share one area, which is what "the bedrooms"
 * means and what keeps this from becoming a floor plan.
 */
export function areaKey(room: string | null, phrase: string | null): string {
  const base = room ?? (phrase ? readRoomWord(phrase) : null) ?? "project";
  if (!phrase) return base;
  const qualifier = normalise(phrase)
    .split(" ")
    .find((word) => QUALIFIERS.includes(word));
  return qualifier && qualifier !== base ? `${base}:${qualifier}` : base;
}

// ───────────────────────────── scoped updates ───────────────────────────────

/** One area's worth of updates, as extraction reported them. */
export interface UpdateGroup {
  /** The homeowner's words for the space, or null when they named none. */
  readonly phrase: string | null;
  readonly updates: readonly FactUpdate[];
}

/**
 * Groups a turn's updates by the space each one is about.
 *
 * An update with no `area` belongs to whatever the conversation is already
 * about — which is what lets "what about privacy in there?" work without the
 * homeowner naming the room again.
 */
export function groupByArea(updates: readonly FactUpdate[]): readonly UpdateGroup[] {
  const groups = new Map<string, FactUpdate[]>();
  for (const update of updates) {
    const key = update.area?.trim() ? normalise(update.area) : "";
    const existing = groups.get(key);
    if (existing) existing.push(update);
    else groups.set(key, [update]);
  }
  return [...groups.entries()].map(([key, list]) => ({
    phrase: key || null,
    updates: list,
  }));
}

export interface ScopedApplication {
  readonly project: Project;
  readonly retracted: readonly FactUpdate[];
  readonly suppressed: readonly string[];
  /** Areas this turn touched, in the order they were named. */
  readonly touched: readonly string[];
}

/**
 * Applies a turn's updates, each to the space it is about.
 *
 * THE POINT OF THE WHOLE MODULE IS THE LINE THAT IS NOT HERE: nothing writes
 * one area's value over another's. A living-room darkening preference lands in
 * the living room, and the bedroom keeps what it was told.
 */
export function applyScopedUpdates(
  project: Project,
  updates: readonly FactUpdate[],
  turn: number,
  isList: (field: string) => boolean,
  apply: (
    ledger: FactLedger,
    updates: readonly FactUpdate[],
    turn: number,
    isList: (field: string) => boolean
  ) => LedgerApplication
): ScopedApplication {
  const retracted: FactUpdate[] = [];
  const suppressed: string[] = [];
  const touched: string[] = [];

  let shared = project.shared;
  const areas = new Map(project.areas.map((area) => [area.id, area]));
  let activeAreaId = project.activeAreaId;

  for (const group of groupByArea(updates)) {
    const sharedUpdates = group.updates.filter((u) => isSharedField(u.field));
    const areaUpdates = group.updates.filter((u) => !isSharedField(u.field));

    if (sharedUpdates.length) {
      const result = apply(shared, sharedUpdates, turn, isList);
      shared = result.ledger;
      retracted.push(...result.retracted);
      suppressed.push(...result.suppressed);
    }
    if (!areaUpdates.length) continue;

    // Which space these belong to: the room this group asserts, the words the
    // homeowner used, or the space already under discussion.
    //
    // ONLY A STATED ROOM MAY OPEN OR SWITCH AN AREA. Inference may propose a
    // fact and never restructure the project — the same precedence the ledger
    // has always applied to values, one level up. Without this, "we spend most
    // evenings downstairs" quietly infers a living room, opens an area for it,
    // moves the conversation there, and abandons the bedroom the homeowner
    // actually stated two turns earlier.
    const assertedRoom = areaUpdates.find(
      (u) => u.field === "room" && u.operation !== "retract" && u.basis === "stated"
    )?.value;
    const key =
      assertedRoom || group.phrase
        ? areaKey(assertedRoom ?? null, group.phrase)
        : activeAreaId ?? areaKey(null, null);

    const existing = areas.get(key);
    const base: ProjectArea = existing ?? {
      id: key,
      room: assertedRoom ?? (group.phrase ? readRoomWord(group.phrase) : null),
      label: group.phrase,
      ledger: {},
    };
    const result = apply(base.ledger, areaUpdates, turn, isList);
    areas.set(key, {
      ...base,
      room: assertedRoom ?? base.room,
      label: base.label ?? group.phrase,
      ledger: result.ledger,
    });
    retracted.push(...result.retracted);
    suppressed.push(...result.suppressed);
    if (!touched.includes(key)) touched.push(key);
  }

  // The space the conversation is about is the first one this message named.
  // A turn that named none leaves it where it was.
  if (touched.length) activeAreaId = touched[0];
  else if (!activeAreaId && areas.size) activeAreaId = [...areas.keys()][0];

  return {
    project: { shared, areas: [...areas.values()], activeAreaId },
    retracted,
    suppressed,
    touched,
  };
}

// ───────────────────────────── reading it back ──────────────────────────────

export const activeArea = (project: Project): ProjectArea | null =>
  project.areas.find((area) => area.id === project.activeAreaId) ?? null;

export const areaById = (project: Project, id: string): ProjectArea | null =>
  project.areas.find((area) => area.id === id) ?? null;

/**
 * The flat facts for one space: the household's, plus that space's own.
 *
 * ONE COHERENT AREA REACHES THE ENGINE. Bedroom darkening and living-room
 * aesthetics never arrive together, because they are not facts about the same
 * window and a recommendation computed from both would be about neither.
 */
export function facts(
  project: Project,
  area: ProjectArea | null,
  project_: (ledger: FactLedger) => ProjectFacts
): ProjectFacts {
  return { ...project_(project.shared), ...(area ? project_(area.ledger) : {}) } as ProjectFacts;
}

/** The facts of whichever space the conversation is on. */
export const activeFacts = (
  project: Project,
  project_: (ledger: FactLedger) => ProjectFacts
): ProjectFacts => facts(project, activeArea(project), project_);

/**
 * Switching focus without being told a fact.
 *
 * "Okay, what about the living room?" carries no new fact about the living
 * room, so nothing in the update path would move the conversation there. The
 * homeowner named a space; that is enough.
 */
export function focusOn(project: Project, phrase: string): Project {
  const room = readRoomWord(phrase);
  if (!room) return project;
  const key = areaKey(room, phrase);
  const existing = areaById(project, key);
  if (existing) return { ...project, activeAreaId: key };
  return {
    ...project,
    areas: [...project.areas, { id: key, room, label: phrase, ledger: {} }],
    activeAreaId: key,
  };
}

/**
 * A short internal picture of the whole job.
 *
 * State, not a dashboard. It exists so a later turn can answer "what did we
 * decide for the bedroom?" from stored facts rather than from whatever the
 * advisor happened to say at the time — prose is a record of a conversation,
 * not a source of truth about a product.
 */
export interface AreaSummary {
  readonly id: string;
  readonly room: string | null;
  readonly label: string | null;
  readonly active: boolean;
  readonly knownFields: readonly string[];
  readonly recommendation: string | null;
}

export function summariseProject(
  project: Project,
  recommendations: Readonly<Record<string, string>>
): readonly AreaSummary[] {
  return project.areas.map((area) => ({
    id: area.id,
    room: area.room,
    label: area.label,
    active: area.id === project.activeAreaId,
    knownFields: Object.keys(area.ledger),
    recommendation: recommendations[area.id] ?? null,
  }));
}

// ───────────────────────── arriving from the client ─────────────────────────

/**
 * Re-validates a project from the client, and migrates a pre-Phase-7 ledger.
 *
 * OLD STATE IS REAL. A conversation open in a browser when this ships sends the
 * flat ledger the previous version handed it. Rejecting it would drop everything
 * the homeowner had said; misreading it would be worse. So a legacy ledger is
 * split the way it would have been recorded today — household facts to shared,
 * the rest to the room it names — and the conversation carries on.
 */
export function validateProject(
  raw: unknown,
  legacyLedger: unknown,
  validateLedger: (value: unknown) => FactLedger
): Project {
  const source = raw as
    | { shared?: unknown; areas?: unknown; activeAreaId?: unknown }
    | null
    | undefined;

  if (!source || typeof source !== "object" || !Array.isArray(source.areas)) {
    return migrateLegacyLedger(validateLedger(legacyLedger));
  }

  const areas: ProjectArea[] = [];
  for (const entry of source.areas) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as { id?: unknown; room?: unknown; label?: unknown; ledger?: unknown };
    if (typeof candidate.id !== "string" || !candidate.id) continue;
    areas.push({
      id: candidate.id.slice(0, 60),
      room: typeof candidate.room === "string" ? candidate.room : null,
      label: typeof candidate.label === "string" ? candidate.label.slice(0, 60) : null,
      ledger: validateLedger(candidate.ledger),
    });
    // A crafted payload cannot grow the project without bound.
    if (areas.length >= 12) break;
  }

  const activeAreaId =
    typeof source.activeAreaId === "string" && areas.some((a) => a.id === source.activeAreaId)
      ? source.activeAreaId
      : areas[0]?.id ?? null;

  return { shared: validateLedger(source.shared), areas, activeAreaId };
}

/** Splits a pre-Phase-7 flat ledger into the shape used from here on. */
export function migrateLegacyLedger(ledger: FactLedger): Project {
  const entries = Object.entries(ledger);
  if (!entries.length) return emptyProject();

  const shared: Record<string, FactRecord | readonly FactRecord[]> = {};
  const areaLedger: Record<string, FactRecord | readonly FactRecord[]> = {};
  for (const [field, record] of entries) {
    if (isSharedField(field)) shared[field] = record;
    else areaLedger[field] = record;
  }

  if (!Object.keys(areaLedger).length) return { shared, areas: [], activeAreaId: null };

  const roomRecord = areaLedger.room as FactRecord | undefined;
  const room = roomRecord && !Array.isArray(roomRecord) ? roomRecord.value : null;
  const id = areaKey(room, null);
  return {
    shared,
    areas: [{ id, room, label: null, ledger: areaLedger }],
    activeAreaId: id,
  };
}

/** Field names, for the extraction prompt's "already established" block. */
export function describeProject(project: Project): string {
  const describeLedger = (ledger: FactLedger) =>
    Object.entries(ledger)
      .map(([field, entry]) =>
        Array.isArray(entry)
          ? `${field}: ${(entry as readonly FactRecord[]).map((r) => `${r.value} (${r.basis})`).join(", ")}`
          : `${field}: ${(entry as FactRecord).value} (${(entry as FactRecord).basis})`
      )
      .filter(Boolean)
      .join("\n");

  const blocks: string[] = [];
  const shared = describeLedger(project.shared);
  if (shared) blocks.push(`WHOLE PROJECT\n${shared}`);
  for (const area of project.areas) {
    const body = describeLedger(area.ledger);
    const heading = `${area.label ?? area.room ?? area.id}${
      area.id === project.activeAreaId ? " (currently discussing)" : ""
    }`;
    blocks.push(`${heading.toUpperCase()}\n${body || "(nothing recorded yet)"}`);
  }
  return blocks.join("\n\n");
}

/** The fields the engine still expects to be absent when unknown. */
export type { ExtractionFieldName };
