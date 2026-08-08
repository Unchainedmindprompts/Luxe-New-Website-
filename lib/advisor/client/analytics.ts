/**
 * Luxe Window Advisor — conversion instrumentation. (Phase C)
 *
 * Uses Vercel Analytics, which the site already loads. No new vendor, no new
 * script, no transcript logging.
 *
 * WHAT IS NEVER SENT: message text, extracted facts, conversation state, or
 * generated prose. Every event carries shape only — a turn number, a status, a
 * placement. The point is to learn whether the advisor converts, not what
 * anyone typed.
 */
import { track } from "@vercel/analytics";

export type AdvisorEvent =
  /** The advisor page was seen. Not engagement — see `advisor_engaged`. */
  | "advisor_viewed"
  /** The visitor sent a first message. */
  | "advisor_started"
  /** See the note on `markEngaged`. */
  | "advisor_engaged"
  | "advisor_guidance_rendered"
  | "advisor_recommendation_rendered"
  | "advisor_booking_clicked"
  | "advisor_fallback"
  | "advisor_book_handoff";

type Props = Record<string, string | number | boolean>;

function emit(event: AdvisorEvent, props: Props = {}): void {
  try {
    track(event, props);
  } catch {
    // Instrumentation must never break the experience it measures.
  }
}

export const advisorViewed = () => emit("advisor_viewed");

export const advisorStarted = (entry: "typed" | "prompt") =>
  emit("advisor_started", { entry });

/**
 * ENGAGEMENT IS DELIBERATELY NOT A PAGE VIEW, AND NOT A FIRST MESSAGE EITHER.
 *
 * Someone who types once and leaves has not engaged with an advisor — they
 * bounced off it. Engagement fires on the **second** homeowner message, which
 * is the first moment the visitor has seen a real reply and chosen to continue.
 * That is the earliest point where "this was useful" is a defensible reading,
 * and it keeps the metric honest when we later compare it against bookings.
 */
export const advisorEngaged = (turn: number) => emit("advisor_engaged", { turn });

export const advisorGuidanceRendered = (turn: number) =>
  emit("advisor_guidance_rendered", { turn });

export const advisorRecommendationRendered = (turn: number) =>
  emit("advisor_recommendation_rendered", { turn });

/** The consultation CTA was clicked, and where from. */
export const advisorBookingClicked = (
  placement: "opening" | "guidance" | "recommendation" | "fallback" | "footer",
  status: string
) => emit("advisor_booking_clicked", { placement, status });

export const advisorFallback = (reason: string) =>
  emit("advisor_fallback", { reason });

/** Fired as the visitor leaves for /book, so the handoff itself is countable. */
export const advisorBookHandoff = (turns: number, status: string) =>
  emit("advisor_book_handoff", { turns, status });
