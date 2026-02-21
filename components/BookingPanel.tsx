"use client";

import { useState, useEffect, useRef } from "react";

export interface ConfirmedAppointment {
  name: string;
  email: string;
  phone: string;
  address: string;
  /** ISO UTC string, or empty string when booked via the Calendly widget */
  startTime: string;
}

interface BookingPanelProps {
  onClose: () => void;
  onConfirmed: (details: ConfirmedAppointment) => void;
}

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
  const [step, setStep] = useState<"form" | "calendar">("form");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingLink, setLoadingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const confirmedRef = useRef(false);

  // Listen for Calendly booking completion via postMessage
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (
        e.data?.event === "calendly.event_scheduled" &&
        !confirmedRef.current
      ) {
        confirmedRef.current = true;
        onConfirmed({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          startTime: "",
        });
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [form, onConfirmed]);

  // Load Calendly widget assets when entering the calendar step
  useEffect(() => {
    if (step !== "calendar") return;

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
  }, [step]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.address.trim()) e.address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleFindTimes() {
    if (!validate()) return;
    setLoadingLink(true);
    setLinkError(null);
    try {
      const res = await fetch("/api/booking-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName.trim()} ${form.lastName.trim()}`,
          email: form.email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load booking calendar");
      setCalendlyUrl(data.url);
      setStep("calendar");
    } catch (err) {
      setLinkError(
        err instanceof Error
          ? err.message
          : "Could not load calendar. Please call Mark at 208-660-8643."
      );
    } finally {
      setLoadingLink(false);
    }
  }

  function inputCls(field: string) {
    return `w-full bg-white border rounded-lg px-3 py-2.5 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors ${
      errors[field] ? "border-red-400" : "border-warm-gray-200"
    }`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: "95vh" }}
      >
        {/* Header */}
        <div className="bg-charcoal text-white px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            {step === "calendar" && (
              <button
                onClick={() => { setStep("form"); setCalendlyUrl(null); confirmedRef.current = false; }}
                className="text-warm-gray-400 hover:text-white transition-colors p-1 -ml-1"
                aria-label="Back"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-semibold">
                Book Your Free In-Home Consultation
              </h2>
              <p className="text-warm-gray-400 text-xs mt-0.5">
                With Mark · Luxe Window Works · Post Falls, ID
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-warm-gray-400 hover:text-white transition-colors p-1 ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1 — Contact form */}
        {step === "form" && (
          <>
            <div className="overflow-y-auto flex-1 p-6">
              <p className="text-sm text-warm-gray-500 mb-4">
                Enter your details, then we&apos;ll show you Mark&apos;s available times.
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input className={inputCls("firstName")} placeholder="First Name" value={form.firstName}
                      onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <input className={inputCls("lastName")} placeholder="Last Name" value={form.lastName}
                      onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <input type="email" className={inputCls("email")} placeholder="Email Address" value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <input type="tel" className={inputCls("phone")} placeholder="Phone Number" value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <input className={inputCls("address")} placeholder="Home Address (for the in-home visit)" value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
              {linkError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                  {linkError}
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-warm-gray-200/60 flex-shrink-0 bg-white rounded-b-2xl">
              <button
                onClick={handleFindTimes}
                disabled={loadingLink}
                className="w-full bg-gold hover:bg-gold-dark disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-white font-semibold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
              >
                {loadingLink ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Loading Mark&apos;s calendar…
                  </>
                ) : (
                  <>
                    See Available Times
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-warm-gray-400 mt-2.5">
                Free in-home consultation · No obligation · Confirmation sent via email
              </p>
            </div>
          </>
        )}

        {/* Step 2 — Calendly widget */}
        {step === "calendar" && calendlyUrl && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-4 py-2 bg-gold/5 border-b border-gold/20 flex-shrink-0 text-center">
              <p className="text-xs text-warm-gray-500">
                Pick a date &amp; time · Confirmation emailed to{" "}
                <span className="font-semibold text-charcoal">{form.email}</span>
              </p>
            </div>

            {/* Calendly auto-initialises any .calendly-inline-widget div when its script loads */}
            <div
              className="calendly-inline-widget flex-1"
              data-url={calendlyUrl}
              style={{ minHeight: 580 }}
            />

            {/* Fallback link in case the widget doesn't render */}
            <div className="px-4 py-2 border-t border-warm-gray-100 text-center flex-shrink-0">
              <p className="text-xs text-warm-gray-400">
                Widget not loading?{" "}
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline"
                >
                  Open Calendly directly
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
