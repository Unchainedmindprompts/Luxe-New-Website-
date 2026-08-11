/**
 * Luxe Window Advisor — what the browser is allowed to know. (Phase C)
 *
 * The API returns the full assessment: candidate ids, guardrail ids, unknown
 * dimensions, the fact ledger. Almost none of that belongs on screen.
 *
 * THIS FILE IS AN ALLOWLIST, NOT A MIRROR. The client parses the response into
 * a deliberately smaller shape — prose, a status, a short list of what matters,
 * and whether to offer the consultation. Everything else is dropped at the
 * boundary rather than carried around and hopefully not rendered. A field that
 * never reaches a component cannot leak into the DOM by accident.
 *
 * The conversation state is the one exception: it is passed straight back to
 * the server untouched, because that is what makes the endpoint stateless. It
 * is held as an opaque value and never read.
 */

export type AdvisorStatus =
  /** A question answered from approved knowledge. No card, no qualification. */
  | "ANSWERED"
  | "NEED_MORE_INFORMATION"
  | "GUIDANCE_READY"
  | "RECOMMENDATION_READY"
  | "ADVISOR_UNAVAILABLE";

/** Opaque. Sent back verbatim; never inspected or rendered. */
export type OpaqueState = Record<string, unknown>;

export interface AdvisorTurn {
  readonly status: AdvisorStatus;
  /** Customer-facing prose. Already guardrail-validated server-side. */
  readonly message: string;
  /** The single question to show, when there is one. */
  readonly question: string | null;
  /**
   * The recommended direction's label, only when a recommendation exists.
   * Never an id.
   */
  readonly direction: string | null;
  /**
   * Which room the direction is for, when one is established.
   *
   * The ledger holds a single room, so a recommendation is always about one
   * space — but the card did not say so, and a homeowner who had just described
   * bedrooms AND living spaces could not tell whether "Cellular shades" meant
   * the bedrooms or the house.
   */
  readonly directionScope: string | null;
  /** One tradeoff worth stating, in plain language. */
  readonly tradeoff: string | null;
  /** Physical things Luxe confirms on site, in plain language. */
  readonly confirmInHome: readonly string[];
  /** "What matters most" — the homeowner's priorities in their own terms. */
  readonly whatMattersMost: readonly string[];
  readonly offerConsultation: boolean;
  readonly state: OpaqueState;
}

/** Priority ids are internal. This is the only place they become English. */
const PRIORITY_LABELS: Readonly<Record<string, string>> = {
  budget: "staying on budget",
  functionality: "everyday functionality",
  aesthetics: "how it looks",
  "energy-efficiency": "energy efficiency",
  "room-darkening": "getting the room dark",
  privacy: "privacy",
  "view-preservation": "keeping the view",
  "glare-control": "controlling glare",
  "child-safety": "child safety",
  accessibility: "easy access",
  convenience: "convenience",
  motorization: "motorized operation",
  durability: "durability",
  "moisture-resistance": "standing up to moisture",
  "clear-glass-when-open": "clear glass when open",
  "directional-light-control": "directional light control",
  // `lifestyle-requirement` is deliberately absent, and unmapped ids are
  // dropped below rather than shown.
  //
  // It is a BUCKET, not a concern: Phase A defines it as "shift work, sleep
  // sensitivity, media use, pets, or another constraint specific to the
  // household". The specific constraint is never stored — only the bucket id
  // is — so there is no truthful customer-facing rendering of it. It used to
  // render as "a specific lifestyle need", which told a homeowner who had said
  // "I'm sensitive to light" that what mattered most to them was a category
  // name from our own ontology.
  //
  // Anything added here must name something the homeowner would recognise as
  // their own concern. If the underlying fact cannot be said back to them
  // truthfully, it does not belong on the card.
};

/** Verification ids are internal. Only these become customer-facing text. */
const VERIFICATION_LABELS: Readonly<Record<string, string>> = {
  "verify-dimensions": "precise measurements",
  "verify-exterior-mounting": "what an exterior system would mount to",
  "verify-wind-exposure": "how exposed the opening is to wind",
  "verify-power": "power for motorized options",
  "verify-electrical": "electrical access",
  "verify-door-access": "clearance around the door",
  "verify-stack-back": "wall space beside the window",
  "verify-reach-and-operation": "how the covering will be reached and operated",
  "verify-splash-exposure": "moisture exposure at the opening",
  "verify-shutter-clearance": "clearance for shutter panels",
  "verify-cordless-or-motorized-availability": "cordless or motorized availability",
  "verify-product-size-limits": "size limits for the product",
  "verify-fabric-width-and-pattern-repeat": "fabric width and pattern placement",
  "verify-lift-system-load": "how the lift system handles the width",
  "verify-tilt-in-clearance": "tilt-in window clearance",
  "verify-mullion-and-gap-alignment": "alignment across the opening",
  "verify-louver-proportion": "louver proportion for the opening",
};

/**
 * `verify-dimensions` is on every project, so listing it says nothing about
 * this one. It is dropped so the list stays short and meaningful.
 */
const ALWAYS_TRUE_VERIFICATION = "verify-dimensions";

interface RawShape {
  status?: unknown;
  message?: unknown;
  nextQuestion?: { phrased?: unknown } | null;
  assessment?: {
    primaryRecommendation?: { label?: unknown } | null;
    tradeoffs?: { note?: unknown }[];
    verificationRequirements?: { id?: unknown }[];
  } | null;
  consultationCta?: { recommended?: unknown } | null;
  state?: unknown;
}

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

/**
 * Narrows an API response to what may be shown.
 *
 * Tolerant on purpose: a malformed or partial response degrades to an
 * unavailable turn that still offers the consultation, rather than throwing
 * and leaving the visitor staring at a broken page.
 */
export function toAdvisorTurn(raw: unknown, priorState: OpaqueState): AdvisorTurn {
  const body = (raw ?? {}) as RawShape;
  const status = ((): AdvisorStatus => {
    const value = body.status;
    return value === "ANSWERED" ||
      value === "NEED_MORE_INFORMATION" ||
      value === "GUIDANCE_READY" ||
      value === "RECOMMENDATION_READY"
      ? value
      : "ADVISOR_UNAVAILABLE";
  })();

  const assessment = body.assessment ?? null;

  // THE SAME FIELD THE PHRASING PROMPT WAS GIVEN. The card must not pick its
  // own winner out of the candidate list — that is precisely how the paragraph
  // and the panel beside it ended up naming different products. There is one
  // canonical direction, decided server-side, and this renders that or nothing.
  const direction =
    status === "RECOMMENDATION_READY"
      ? asString(assessment?.primaryRecommendation?.label)
      : null;

  // WHICH ROOM THIS IS ABOUT. A card headed "Cellular shades" with no scope
  // reads as the answer for the house. The ledger holds one room, so the honest
  // label is that room — and when none is established, the card says so rather
  // than implying the whole home.
  const directionScope = direction ? readRoom(body.state) : null;

  const confirmInHome = (assessment?.verificationRequirements ?? [])
    .map((item) => (typeof item?.id === "string" ? item.id : ""))
    .filter((id) => id && id !== ALWAYS_TRUE_VERIFICATION)
    .map((id) => VERIFICATION_LABELS[id])
    .filter((label): label is string => Boolean(label))
    .slice(0, 4);

  return {
    status,
    message: asString(body.message) ?? "",
    question: asString(body.nextQuestion?.phrased),
    direction,
    directionScope,
    tradeoff: asString(assessment?.tradeoffs?.[0]?.note),
    confirmInHome,
    whatMattersMost: readPriorities(body.state),
    offerConsultation: body.consultationCta?.recommended === true,
    state: (body.state as OpaqueState) ?? priorState,
  };
}

/**
 * Turns the ranked priorities into the homeowner's own terms.
 *
 * This is the only place any part of the state is read for display, and it
 * reads exactly one field. Anything without an approved English label is
 * skipped rather than shown as an id.
 */
/** The room the established facts are about, in the homeowner's own words. */
const ROOM_LABELS: Readonly<Record<string, string>> = {
  bedroom: "the bedroom",
  nursery: "the nursery",
  living: "the living room",
  kitchen: "the kitchen",
  bathroom: "the bathroom",
  office: "the office",
  "dining-room": "the dining room",
  "media-room": "the media room",
  bonus: "the bonus room",
  entry: "the entry",
  hallway: "the hallway",
  laundry: "the laundry",
  garage: "the garage",
  "sunroom-or-porch": "the sunroom",
  basement: "the basement",
  commercial: "the space",
};

/**
 * The space a recommendation is for.
 *
 * Read from the ACTIVE AREA rather than from a flat `room` fact — the project
 * holds one area per space now, and the recommendation belongs to whichever one
 * the conversation is on. The homeowner's own words win where they gave any:
 * "the primary bedroom" is what they said, and echoing it back beats mapping it
 * to a vocabulary label they never used.
 */
function readRoom(state: unknown): string | null {
  const project = (state as { project?: { areas?: unknown; activeAreaId?: unknown } } | null)?.project;
  if (project && Array.isArray(project.areas)) {
    const active = project.areas.find(
      (area) => (area as { id?: unknown })?.id === project.activeAreaId
    ) as { room?: unknown; label?: unknown } | undefined;
    if (typeof active?.label === "string" && active.label.trim()) {
      return active.label.trim().slice(0, 40);
    }
    if (typeof active?.room === "string") return ROOM_LABELS[active.room] ?? null;
  }
  const room = (state as { facts?: { room?: unknown } } | null)?.facts?.room;
  return typeof room === "string" ? ROOM_LABELS[room] ?? null : null;
}

function readPriorities(state: unknown): readonly string[] {
  const facts = (state as { facts?: { priorities?: unknown } } | null)?.facts;
  const priorities = Array.isArray(facts?.priorities) ? facts.priorities : [];
  return priorities
    .map((id) => (typeof id === "string" ? PRIORITY_LABELS[id] : undefined))
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);
}
