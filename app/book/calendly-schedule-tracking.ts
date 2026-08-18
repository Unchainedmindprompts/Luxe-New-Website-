/**
 * /book-only listener for a completed Calendly booking.
 *
 * The page embeds Calendly via the official inline widget + widget.js.
 * That iframe notifies the parent with window.postMessage. Official
 * completion event (Calendly docs + the widget this site loads):
 *   origin: https://calendly.com
 *   data.event: "calendly.event_scheduled"
 *
 * Earlier funnel events (widget load, date selected) must not convert.
 */

export const CALENDLY_EMBED_ORIGIN = "https://calendly.com";
export const CALENDLY_EVENT_SCHEDULED = "calendly.event_scheduled";
export const META_SCHEDULE_EVENT = "Schedule";

export type FbqFn = (...args: unknown[]) => void;

export type CalendlyMessageLike = {
  origin?: string;
  data?: unknown;
};

type CalendlyPayload = {
  event?: { uri?: string };
  invitee?: { uri?: string };
};

const firedKeys = new Set<string>();

export function resetCalendlyScheduleDedupe(): void {
  firedKeys.clear();
}

function calendlyEventName(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const event = (data as { event?: unknown }).event;
  return typeof event === "string" ? event : undefined;
}

function calendlyPayload(data: unknown): CalendlyPayload | undefined {
  if (!data || typeof data !== "object") return undefined;
  const payload = (data as { payload?: unknown }).payload;
  if (!payload || typeof payload !== "object") return undefined;
  return payload as CalendlyPayload;
}

export function isCalendlyScheduledMessage(event: CalendlyMessageLike): boolean {
  return (
    event.origin === CALENDLY_EMBED_ORIGIN &&
    calendlyEventName(event.data) === CALENDLY_EVENT_SCHEDULED
  );
}

function dedupeKey(event: CalendlyMessageLike): string {
  const payload = calendlyPayload(event.data);
  return payload?.invitee?.uri || payload?.event?.uri || CALENDLY_EVENT_SCHEDULED;
}

/**
 * Returns true only when a Meta Schedule event was actually sent.
 * Missing or throwing fbq must never throw to the caller.
 */
export function handleCalendlyMessage(
  event: CalendlyMessageLike,
  fbq?: FbqFn
): boolean {
  try {
    if (!isCalendlyScheduledMessage(event)) return false;
    const key = dedupeKey(event);
    if (firedKeys.has(key)) return false;
    firedKeys.add(key);
    if (typeof fbq === "function") {
      fbq("track", META_SCHEDULE_EVENT);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function subscribeCalendlyScheduleTracking(): () => void {
  const onMessage = (event: MessageEvent) => {
    try {
      const fbq = (window as Window & { fbq?: FbqFn }).fbq;
      handleCalendlyMessage(event, typeof fbq === "function" ? fbq : undefined);
    } catch {
      // Tracking must never break the Calendly embed or surface an error.
    }
  };

  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
