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
  "lifestyle-requirement": "a specific lifestyle need",
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
    strongCandidates?: { label?: unknown }[];
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
    return value === "NEED_MORE_INFORMATION" ||
      value === "GUIDANCE_READY" ||
      value === "RECOMMENDATION_READY"
      ? value
      : "ADVISOR_UNAVAILABLE";
  })();

  const assessment = body.assessment ?? null;

  const direction =
    status === "RECOMMENDATION_READY"
      ? asString(assessment?.strongCandidates?.[0]?.label)
      : null;

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
function readPriorities(state: unknown): readonly string[] {
  const facts = (state as { facts?: { priorities?: unknown } } | null)?.facts;
  const priorities = Array.isArray(facts?.priorities) ? facts.priorities : [];
  return priorities
    .map((id) => (typeof id === "string" ? PRIORITY_LABELS[id] : undefined))
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);
}
