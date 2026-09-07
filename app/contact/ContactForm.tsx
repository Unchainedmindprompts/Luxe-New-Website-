"use client";

import { useState, FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CONVERSION_EVENTS, trackConversionEvent, shouldSendMetaCustomEvents } from "@/lib/conversion-events";
import { readOriginatingPath } from "@/lib/originating-path";

export default function ContactForm({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname() ?? "/contact";
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get("name") as string) || "",
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string) || "",
      needs: (formData.get("needs") as string) || "",
      contactMethod: (formData.get("contactMethod") as string) || "",
      source: "contact",
      originatingPath: readOriginatingPath(pathname),
      _hp: (formData.get("_hp") as string) || "",
    };

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Submit failed");

      // Only fire Facebook Pixel Lead event on ACTUAL successful send —
      // not on button click, which would inflate the metric.
      if (shouldSendMetaCustomEvents() && typeof window !== "undefined" && typeof (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq === "function") {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "Lead");
      }
      trackConversionEvent(CONVERSION_EVENTS.ContactFormSubmit, {
        page_path: pathname,
        originating_path: readOriginatingPath(pathname),
      });

      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please call us at 208-660-8643 or email mark@luxewindowworks.com.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-2xl text-charcoal mb-2">
          Thank You!
        </h3>
        <p className="text-warm-gray-600">
          We&apos;ll be in touch within 24 hours to discuss your project and arrange your free consultation. Your appointment is confirmed once we agree on a time.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1.5">
          Name <span className="text-gold">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          autoComplete="name"
          required
          className="w-full border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-warm-white"
          placeholder="Your name"
        />
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1.5">
            Phone <span className="text-gold">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            required
            className="w-full border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-warm-white"
            placeholder="(208) 555-0123"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            className="w-full border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-warm-white"
            placeholder="you@email.com"
          />
        </div>
      </div>

      {/* What do you need help with */}
      <div>
        <label htmlFor="needs" className="block text-sm font-medium text-charcoal mb-1.5">
          What do you need help with? {compact ? <span className="text-warm-gray-500">(optional)</span> : <span className="text-gold">*</span>}
        </label>
        <textarea
          id="needs"
          name="needs"
          required={!compact}
          rows={compact ? 2 : 4}
          className="w-full border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-warm-white resize-none"
          placeholder="Tell us about your project — which rooms, what problems you're trying to solve, or any specific products you're interested in."
        />
      </div>

      {/* Preferred contact method */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2.5">
          Preferred contact method
        </label>
        <div className="flex flex-wrap gap-3">
          {["Phone call", "Text message", "Email"].map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value={method}
                defaultChecked={method === "Phone call"}
                className="w-4 h-4 text-gold border-warm-gray-300 focus:ring-gold"
              />
              <span className="text-sm text-warm-gray-600">{method}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Honeypot — hidden from humans, catches bots. */}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {error && (
        <p role="alert" className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold hover:bg-gold-dark disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-charcoal font-semibold py-3.5 rounded-full transition-colors text-sm"
      >
        {submitting ? "Sending…" : "Request Free Consultation"}
      </button>

      <p className="text-xs text-warm-gray-400 text-center">
        No obligation. We&apos;ll respond within 24 hours. Your details are used to respond to your inquiry.
      </p>
    </form>
  );
}
