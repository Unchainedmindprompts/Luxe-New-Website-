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
 * ONE FIELD, AND IT HAS TO EARN ITS PLACE. Budget sensitivity is a property of
 * the customer: it is the same fact standing in the great room as standing in
 * the guest bedroom, and asking for it again per area would be the
 * questionnaire behaviour this advisor keeps being pulled back toward.
 *
 * `motorizationInterest` WAS HERE AND WAS WRONG. It reads like a preference
 * someone holds about their house, and in a real Luxe project it is a decision
 * made window by window: motorized in the great room because the glass is large
 * and gets adjusted daily, manual in the secondary bedrooms to hold the budget,
 * motorized on anything out of reach. "I want the great-room shades motorized,
 * but keep the bedrooms manual to save money" is an ordinary sentence, and a
 * shared field cannot hold it — one of those two answers overwrites the other.
 *
 * Everything else is a property of a particular opening: room, exposure,
 * privacy, darkening, view, glare, aesthetics, motorization, moisture,
 * mounting, geometry, access, and the products and features requested for it.
 * `aesthetic` is the closest call and stays area-specific on purpose — "modern
 * in the living room" is the exact sentence that started this phase.
 */
export const SHARED_FIELDS: readonly string[] = ["budgetSensitivity"];

export const isSharedField = (field: string): boolean => SHARED_FIELDS.includes(field);

/**
 * Whole-project instructions, which are a different thing from shared fields.
 *
 * A field is shared because of what it IS. A project default exists because of
 * what the homeowner SAID: "I'd like motorization throughout the entire house"
 * is an area-specific field being applied deliberately to every area, and
 * refusing to represent that would make them repeat it room by room.
 *
 * Bounded on purpose, and it only ever reads the phrase the homeowner used for
 * the space. A preference inferred while discussing one room can never become a
 * project default, because a room's name is not on this list.
 */
const WHOLE_PROJECT = new RegExp(
  "\\b(" +
    [
      "throughout", "whole house", "entire house", "whole home", "entire home",
      "whole place", "everywhere", "every room", "all the rooms", "all rooms",
      "house wide", "housewide", "the entire place", "all of the windows",
      "every window", "all the windows",
    ].join("|") +
    ")\\b"
);

/** Did the homeowner apply this to the whole job rather than to one space? */
export const isWholeProjectPhrase = (phrase: string): boolean =>
  WHOLE_PROJECT.test(normalise(phrase));

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
  /**
   * The direction already shown to the homeowner for this space.
   *
   * A DETERMINISTIC ID AND A TURN NUMBER — never prose. The assessment was
   * recomputed every turn and forgotten afterwards, so a homeowner who added a
   * fact that merely REINFORCED the bedroom direction was told about cellular
   * shades a second time, with the same card underneath it. The advisor had no
   * way to know it had already said that, because nothing remembered.
   *
   * Recorded only when a recommendation is actually presented, so it is a
   * record of what the customer has seen rather than of what the engine
   * happened to compute.
   */
  readonly presented?: { readonly directionId: string; readonly turn: number } | null;
}

/**
 * What this turn does to the recommendation the homeowner already has.
 *
 * Decided from deterministic identity — the engine's chosen direction against
 * the one already presented for this space. Never from comparing prose, and
 * never from looking for a product name in the last thing the advisor said.
 */
export type RecommendationChange =
  /** Nothing to recommend, and nothing was ever presented. */
  | "none"
  /** First time this space has had a direction. Present it. */
  | "new"
  /** The same direction as last time. Do not announce it again. */
  | "unchanged"
  /** New information moved the direction. Say so, and show the new one. */
  | "changed"
  /** There was a direction and there is no longer one. Do not keep claiming it. */
  | "withdrawn";

export function recommendationChange(
  current: string | null,
  presented: string | null
): RecommendationChange {
  if (!current && !presented) return "none";
  if (current && !presented) return "new";
  if (!current) return "withdrawn";
  return current === presented ? "unchanged" : "changed";
}

/** Records what the homeowner has now been shown, for this space only. */
export function markPresented(
  project: Project,
  areaId: string | null,
  directionId: string,
  turn: number
): Project {
  if (!areaId) return project;
  return {
    ...project,
    areas: project.areas.map((area) =>
      area.id === areaId ? { ...area, presented: { directionId, turn } } : area
    ),
  };
}

export interface Project {
  /** Facts that are household-level by nature. See `SHARED_FIELDS`. */
  readonly shared: FactLedger;
  /**
   * Area-specific facts the homeowner explicitly applied to the whole job.
   *
   * "Motorize everything" belongs here; "motorize the great room" does not.
   * An area's own value always wins over a default — the more specific
   * statement is the one the homeowner meant for that space.
   */
  readonly defaults: FactLedger;
  readonly areas: readonly ProjectArea[];
  /** Which space the conversation is about right now. */
  readonly activeAreaId: string | null;
}

export const emptyProject = (): Project => ({
  shared: {},
  defaults: {},
  areas: [],
  activeAreaId: null,
});

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
  let defaults = project.defaults;
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

    // "Motorize the whole house" is an area-specific field applied to every
    // area on purpose. It becomes a project default rather than a space, so no
    // area is invented for it and nothing has to be repeated room by room.
    // Focus does not move: they did not change the subject, they widened it.
    if (group.phrase && isWholeProjectPhrase(group.phrase)) {
      const result = apply(defaults, areaUpdates, turn, isList);
      defaults = result.ledger;
      retracted.push(...result.retracted);
      suppressed.push(...result.suppressed);
      continue;
    }

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
    project: { shared, defaults, areas: [...areas.values()], activeAreaId },
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
  // Order is the override rule. Household facts, then anything the homeowner
  // applied to the whole job, then this space's own — so "keep the bedrooms
  // manual" beats "motorize throughout" in the bedroom and nowhere else.
  return {
    ...project_(project.shared),
    ...project_(project.defaults),
    ...(area ? project_(area.ledger) : {}),
  } as ProjectFacts;
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
  const named = readSingleArea(phrase);
  if (!named) return project;
  const { room, key } = named;
  const existing = areaById(project, key);
  if (existing) return { ...project, activeAreaId: key };
  return {
    ...project,
    areas: [...project.areas, { id: key, room, label: named.label, ledger: {} }],
    activeAreaId: key,
  };
}

/**
 * The one space a whole message names, when it names exactly one.
 *
 * A WHOLE MESSAGE IS NOT AN AREA PHRASE. "Motorize the living room and primary
 * bedroom, but leave the guest room manual" mentions three spaces, and scanning
 * all of it for a qualifier produced `living:primary` — the living room wearing
 * the bedroom's adjective. So a message naming more than one room moves focus
 * nowhere and lets the scoped updates decide, and a qualifier is only taken from
 * the two words immediately before the room word it belongs to.
 */
function readSingleArea(message: string): { room: string; key: string; label: string } | null {
  const words = normalise(message).split(" ");
  const hits = words
    .map((word, index) => ({ room: ROOM_WORDS[word], index }))
    .filter((hit): hit is { room: string; index: number } => Boolean(hit.room));
  if (hits.length !== 1) return null;

  const { room, index } = hits[0];
  const qualifier = words
    .slice(Math.max(0, index - 2), index)
    .find((word) => QUALIFIERS.includes(word));
  const label = qualifier ? `the ${qualifier} ${words[index]}` : `the ${words[index]}`;
  return {
    room,
    key: qualifier && qualifier !== room ? `${room}:${qualifier}` : room,
    label,
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
      presented: readPresented((candidate as { presented?: unknown }).presented),
    });
    // A crafted payload cannot grow the project without bound.
    if (areas.length >= 12) break;
  }

  const activeAreaId =
    typeof source.activeAreaId === "string" && areas.some((a) => a.id === source.activeAreaId)
      ? source.activeAreaId
      : areas[0]?.id ?? null;

  const shared = validateLedger(source.shared);
  const defaults = validateLedger((source as { defaults?: unknown }).defaults);
  return normaliseScopes({ shared, defaults, areas, activeAreaId });
}

/**
 * Moves anything sitting in the wrong scope back where it belongs.
 *
 * `motorizationInterest` was briefly a shared field, so state written by that
 * build carries it there. It is not household-level — it is a per-window
 * decision — but a homeowner who said it once should not have to say it again,
 * so it lands as a project DEFAULT: applied everywhere, overridden by any area
 * that has its own answer. That is the closest correct reading of what the old
 * shape meant, and it loses nothing.
 */
function normaliseScopes(project: Project): Project {
  const shared: Record<string, FactRecord | readonly FactRecord[]> = {};
  const defaults: Record<string, FactRecord | readonly FactRecord[]> = { ...project.defaults };
  for (const [field, record] of Object.entries(project.shared)) {
    if (isSharedField(field)) shared[field] = record;
    else if (!(field in defaults)) defaults[field] = record;
  }
  return { ...project, shared, defaults };
}

/**
 * Re-validates the presented record from client state.
 *
 * Untrusted like everything else that arrives. A crafted direction id can only
 * ever suppress a card the customer would otherwise see, never invent a
 * recommendation — the direction itself always comes from the engine.
 */
function readPresented(raw: unknown): ProjectArea["presented"] {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as { directionId?: unknown; turn?: unknown };
  if (typeof candidate.directionId !== "string" || !candidate.directionId) return null;
  return {
    directionId: candidate.directionId.slice(0, 60),
    turn: typeof candidate.turn === "number" && Number.isFinite(candidate.turn)
      ? Math.max(0, Math.trunc(candidate.turn))
      : 0,
  };
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

  if (!Object.keys(areaLedger).length) return { shared, defaults: {}, areas: [], activeAreaId: null };

  const roomRecord = areaLedger.room as FactRecord | undefined;
  const room = roomRecord && !Array.isArray(roomRecord) ? roomRecord.value : null;
  const id = areaKey(room, null);
  return {
    shared,
    defaults: {},
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
  const defaults = describeLedger(project.defaults);
  if (defaults) {
    blocks.push(`ASKED FOR THROUGHOUT (unless a room says otherwise)\n${defaults}`);
  }
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
