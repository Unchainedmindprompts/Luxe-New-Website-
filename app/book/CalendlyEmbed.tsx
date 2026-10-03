"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "@/lib/constants";
import { TrackedCta } from "@/components/TrackedCta";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { mountCalendly } from "./calendly-embed";

export function CalendlyEmbed() {
  const container = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!container.current) return;
    return mountCalendly(
      container.current,
      `${BUSINESS.calendlyUrl}?hide_gdpr_banner=1&background_color=fdfcfa&primary_color=c9a96e&text_color=2e2e2e`,
      () => setStatus("ready"),
      () => setStatus("unavailable"),
    );
  }, [attempt]);

  return (
    <div>
      <div className="mb-5 rounded-xl border border-warm-gray-200 bg-cream/50 p-4 text-center text-sm text-warm-gray-700">
        <p role="status" aria-live="polite">
          {status === "loading" && "Loading available appointment times…"}
          {status === "ready" && "Prefer a separate window? You can also open our booking calendar directly."}
          {status === "unavailable" && "The calendar is taking longer than expected to load. Try again, open it directly, or request a call or text and we’ll help you find a time."}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {status === "unavailable" && (
            <button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }} className="font-semibold text-charcoal underline underline-offset-4">
              Retry calendar
            </button>
          )}
          <a href={BUSINESS.calendlyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-charcoal underline underline-offset-4">
            Open booking calendar (new tab)
          </a>
          <a href="#callback" className="font-semibold text-charcoal underline underline-offset-4">Request a call or text</a>
          <TrackedCta href={BUSINESS.phoneHref} event={CONVERSION_EVENTS.PhoneClick} className="font-semibold text-charcoal underline underline-offset-4">Call {BUSINESS.phone}</TrackedCta>
        </div>
      </div>
      {/* Disable the script's one-time auto-scan. We own initialization and
          cleanup on every mount, including Next.js navigation and retries.
          Keep the established tall mobile layout to avoid clipped time slots. */}
      <div
        ref={container}
        data-auto-load="false"
        aria-label="Appointment booking calendar"
        className={`calendly-inline-widget rounded-2xl overflow-hidden border border-warm-gray-200 bg-white ${status === "unavailable" ? "h-[240px]" : "h-[1180px] sm:h-[1020px] lg:h-[980px]"}`}
        style={{ minWidth: "280px" }}
      />
      <noscript><p className="mt-4 text-center">Use the direct booking link above or call us to arrange your free consultation.</p></noscript>
    </div>
  );
}
