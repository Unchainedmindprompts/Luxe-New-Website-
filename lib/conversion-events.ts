/**
 * Named conversion events for the existing Meta Pixel and Vercel Analytics.
 *
 * CTA clicks are not bookings. These names are custom on purpose so they
 * cannot be mistaken for Meta's standard `Lead` or `Schedule` events.
 * Successful Calendly booking tracking stays in the book page tracker.
 */

export const CONVERSION_EVENTS = {
  ConsultCtaClick: "ConsultCtaClick",
  PhoneClick: "PhoneClick",
  ContactCtaClick: "ContactCtaClick",
  ProductCtaClick: "ProductCtaClick",
  ContactFormSubmit: "ContactFormSubmit",
} as const;

export type ConversionEventName =
  (typeof CONVERSION_EVENTS)[keyof typeof CONVERSION_EVENTS];

const FORBIDDEN_STANDARD_EVENTS = new Set(["Lead", "Schedule"]);

export interface ConversionEventParams {
  page_path: string;
  originating_path?: string;
}

export function isCustomConversionEvent(name: string): boolean {
  return (Object.values(CONVERSION_EVENTS) as string[]).includes(name);
}

/**
 * Preview and local hosts share the production Meta Pixel ID when that env
 * var is set for all environments. Custom events must not land in the
 * production pixel. Vercel Analytics already separates Preview from
 * Production in the dashboard, so `va.track` can still run.
 */
export function shouldSendMetaCustomEvents(
  hostname?: string,
  vercelEnv?: string
): boolean {
  const env = vercelEnv ?? process.env.NEXT_PUBLIC_VERCEL_ENV ?? "";
  if (env === "preview" || env === "development") return false;
  const host =
    hostname ??
    (typeof window !== "undefined" ? window.location.hostname : "");
  if (
    host.endsWith(".vercel.app") ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return false;
  }
  return true;
}

/**
 * Fires a custom event on already-installed analytics. No-ops when neither
 * the Meta Pixel nor Vercel Analytics is present. Never sends `Lead` or
 * `Schedule`. CTA clicks are not bookings.
 */
export function trackConversionEvent(
  name: ConversionEventName,
  params: ConversionEventParams
): void {
  if (FORBIDDEN_STANDARD_EVENTS.has(name) || !isCustomConversionEvent(name)) {
    return;
  }

  const payload = {
    page_path: params.page_path,
    ...(params.originating_path
      ? { originating_path: params.originating_path }
      : {}),
  };

  if (typeof window === "undefined") return;

  if (shouldSendMetaCustomEvents()) {
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq("trackCustom", name, payload);
    }
  }

  const va = (
    window as Window & {
      va?: { track?: (event: string, data?: Record<string, unknown>) => void };
    }
  ).va;
  if (typeof va?.track === "function") {
    va.track(name, payload);
  }
}
