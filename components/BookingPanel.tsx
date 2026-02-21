"use client";

import { useState, useEffect, useRef } from "react";

export interface ConfirmedAppointment {
  name: string;
  email: string;
  phone: string;
  address: string;
  startTime: string;
}

interface BookingPanelProps {
  onClose: () => void;
  onConfirmed: (details: ConfirmedAppointment) => void;
}

// Kept for any callers that import it
export function formatConfirmDateTime(isoString: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function BookingPanel({ onClose, onConfirmed }: BookingPanelProps) {
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const confirmedRef = useRef(false);

  // Fetch the scheduling URL as soon as the panel opens
  useEffect(() => {
    fetch("/api/booking-url")
      .then((r) => r.json())
      .then((data) => {
        if (data.url) setCalendlyUrl(data.url);
        else setError(data.error ?? "Could not load calendar.");
      })
      .catch(() => setError("Could not load calendar. Please call Mark at 208-660-8643."))
      .finally(() => setLoading(false));
  }, []);

  // Load Calendly widget assets once we have the URL
  useEffect(() => {
    if (!calendlyUrl) return;
    if (!document.querySelector("link[data-calendly-css]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      link.setAttribute("data-calendly-css", "1");
      document.head.appendChild(link);
    }
    if (!document.querySelector("script[data-calendly-js]")) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.setAttribute("data-calendly-js", "1");
      script.async = true;
      document.body.appendChild(script);
    }
  }, [calendlyUrl]);

  // Detect completed booking via Calendly postMessage
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.event === "calendly.event_scheduled" && !confirmedRef.current) {
        confirmedRef.current = true;
        // Calendly collects name/email itself and sends confirmation email
        onConfirmed({ name: "", email: "", phone: "", address: "", startTime: "" });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConfirmed]);

  return (
    // Full screen on mobile, centered modal on desktop
    <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white w-full sm:rounded-2xl shadow-2xl flex flex-col sm:max-w-2xl"
        style={{ height: "100dvh", maxHeight: "100dvh" }}
      >
        {/* Slim header */}
        <div className="bg-charcoal text-white px-5 py-3 flex items-center justify-between flex-shrink-0 sm:rounded-t-2xl">
          <div>
            <h2 className="font-serif text-base font-semibold leading-tight">
              Book Your Free In-Home Consultation
            </h2>
            <p className="text-warm-gray-400 text-xs mt-0.5">
              With Mark · Luxe Window Works · Post Falls, ID
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray-400 hover:text-white transition-colors p-1.5 ml-4 flex-shrink-0 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — fills all remaining height */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-warm-gray-400">
              <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm">Loading Mark&apos;s calendar…</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
              <p className="text-red-500 text-sm">{error}</p>
              <a
                href="tel:+12086608643"
                className="bg-gold text-white font-semibold px-6 py-3 rounded-xl text-sm"
              >
                Call Mark: 208-660-8643
              </a>
            </div>
          )}

          {/* Calendly auto-initialises the .calendly-inline-widget div */}
          {calendlyUrl && (
            <div
              className="calendly-inline-widget w-full h-full"
              data-url={calendlyUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}
