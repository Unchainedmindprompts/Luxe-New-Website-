"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { TrackedCta } from "@/components/TrackedCta";
import { CONVERSION_EVENTS, trackConversionEvent } from "@/lib/conversion-events";
import { readOriginatingPath } from "@/lib/originating-path";
import { BUSINESS, REVIEWS } from "@/lib/constants";
import { CalendlyScheduleTracker } from "./CalendlyScheduleTracker";

export default function BookPage() {
  const pathname = usePathname() ?? "/book";
  const [form, setForm] = useState({
    firstName: "",
    phone: "",
    email: "",
    city: "",
    contactMethod: "Phone call",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          contactMethod: form.contactMethod,
          message: form.message,
          source: "book",
          originatingPath: readOriginatingPath(pathname),
        }),
      });

      if (!res.ok) throw new Error("Submit failed");
      trackConversionEvent(CONVERSION_EVENTS.ContactFormSubmit, {
        page_path: pathname,
        originating_path: readOriginatingPath(pathname),
      });
      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please call us at 208-660-8643 or email mark@luxewindowworks.com." });
    } finally {
      setSubmitting(false);
    }
  }

  function field(
    id: keyof typeof form,
    label: string,
    type = "text",
    placeholder = ""
  ) {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-charcoal mb-1.5"
        >
          {label}
        </label>
        <input
          id={id}
          type={type}
          autoComplete={id === "firstName" ? "name" : id === "phone" ? "tel" : id === "email" ? "email" : id === "city" ? "address-level2" : undefined}
          required={id === "firstName" || id === "phone"}
          aria-invalid={!!errors[id]}
          aria-describedby={errors[id] ? `${id}-error` : undefined}
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          className={`w-full bg-white border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors ${
            errors[id] ? "border-red-400" : "border-warm-gray-200"
          }`}
        />
        {errors[id] && (
          <p id={`${id}-error`} className="text-red-500 text-xs mt-1">{errors[id]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-warm-white min-h-screen">
      {/* Hero */}
      <div className="bg-charcoal text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">
            Free &middot; No Obligation
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Book Your Free In-Home Consultation
          </h1>
          <p className="text-warm-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            We come to your home to see your windows, understand your goals,
            and recommend the right solution. No pressure, no guesswork —
            just honest advice from a team with 24 years of hands-on
            experience.
          </p>
        </div>
      </div>

      <nav aria-label="Ways to get started" className="max-w-4xl mx-auto px-4 pt-8 flex flex-wrap justify-center gap-3">
        <a href="#schedule" className="rounded-full bg-gold px-5 py-3 font-semibold text-charcoal">Book a time</a>
        <a href="#callback" className="rounded-full border border-charcoal px-5 py-3 font-semibold">Request a callback</a>
        <TrackedCta href={BUSINESS.phoneHref} event={CONVERSION_EVENTS.PhoneClick} className="rounded-full border border-charcoal px-5 py-3 font-semibold">Call Us</TrackedCta>
        <TrackedCta href={`sms:${BUSINESS.phoneE164}`} event={CONVERSION_EVENTS.TextClick} className="rounded-full border border-charcoal px-5 py-3 font-semibold">Text Us</TrackedCta>
      </nav>
      {/* Human self-booking remains available alongside the callback form. */}
      <div id="schedule" className="max-w-4xl mx-auto px-4 pt-12 scroll-mt-24">
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
            Pick a time that works for you
          </h2>
          <p className="mt-2 text-warm-gray-600">
            Select a date and time, then complete the booking details to confirm your appointment.
          </p>
        </div>
        {/* Height is generous on purpose. At 700px the widget's own content
            overflowed and produced a scrollbar *inside* the frame — the time
            list was cut off mid-morning and the event header was clipped off
            the top. People do not reliably scroll inside an embedded box,
            especially on a phone, so that was losing bookings. Mobile needs
            more than desktop because Calendly stacks the calendar above the
            time list rather than beside it. */}
        <div
          className="calendly-inline-widget rounded-2xl overflow-hidden border border-warm-gray-200 bg-white h-[1180px] sm:h-[1020px] lg:h-[980px]"
          data-url={`${BUSINESS.calendlyUrl}?hide_gdpr_banner=1&background_color=fdfcfa&primary_color=c9a96e&text_color=2e2e2e`}
          style={{ minWidth: "280px" }}
        />
        {/* lazyOnload keeps a third-party script off the critical path — this
            page's LCP should not wait on Calendly. */}
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload"
        />
        <CalendlyScheduleTracker />
      </div>

      {/* Divider into the fallback path */}
      <div className="max-w-4xl mx-auto px-4 pt-14">
        <div className="flex items-center gap-4">
          <div className="h-px bg-warm-gray-200 flex-1" />
          <p className="text-sm text-warm-gray-500 whitespace-nowrap">
            Or have us call you instead
          </p>
          <div className="h-px bg-warm-gray-200 flex-1" />
        </div>
      </div>

      {/* Content */}
      <div id="callback" className="scroll-mt-24 max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Form */}
        <div className="lg:col-span-3">
          {submitted ? (
            <div className="bg-white rounded-2xl border border-warm-gray-200 p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-8 h-8 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-3">
                Request Received
              </h2>
              <p className="text-warm-gray-600 leading-relaxed mb-6">
                Your request has been received. We&apos;ll be in touch within
                <strong> 24 hours</strong> to discuss your project and arrange your free in-home consultation. Your appointment is confirmed once we agree on a time.
              </p>
              <p className="text-sm text-warm-gray-500 mb-8">
                Prefer to reach out directly?{" "}
                <TrackedCta
                  href="tel:+12086608643"
                  event={CONVERSION_EVENTS.PhoneClick}
                  className="text-gold font-medium hover:text-gold-dark"
                >
                  Call 208-660-8643
                </TrackedCta>{" "}
                or{" "}
                <a
                  href="mailto:mark@luxewindowworks.com"
                  className="text-gold font-medium hover:text-gold-dark"
                >
                  mark@luxewindowworks.com
                </a>
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-warm-gray-500 hover:text-charcoal transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to home
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-warm-gray-200 p-8 shadow-sm space-y-5"
            >
              <h2 className="font-serif text-xl font-semibold text-charcoal">
                Request a Call or Text
              </h2>

              <p className="text-sm text-warm-gray-600">Have a question first? Leave your details and we&apos;ll respond within 24 hours.</p>
              {field("firstName", "Name")}
              {field("phone", "Phone Number", "tel", "e.g. 208-555-0100")}
              {field("city", "City (optional)", "text", "e.g. Post Falls")}
              {field("email", "Email Address (optional)", "email", "you@example.com")}
              <fieldset>
                <legend className="text-sm font-medium text-charcoal mb-2">How should we respond?</legend>
                <div className="flex gap-5">
                  {["Phone call", "Text message"].map((method) => (
                    <label key={method} className="flex items-center gap-2 text-sm">
                      <input type="radio" name="contactMethod" value={method}
                        checked={form.contactMethod === method}
                        onChange={() => setForm((f) => ({ ...f, contactMethod: method }))} />
                      {method}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-charcoal mb-1.5"
                >
                  Tell us about your project{" "}
                  <span className="text-warm-gray-400 font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Which rooms? Any specific goals — privacy, energy efficiency, a particular style? Anything that might be tricky?"
                  className="w-full bg-white border border-warm-gray-200 rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors resize-none"
                />
              </div>

              {errors.form && (
                <p role="alert" className="text-red-500 text-sm text-center">{errors.form}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold hover:bg-gold-dark disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-white font-semibold py-4 rounded-xl text-base transition-colors"
              >
                {submitting ? "Sending…" : "Request My Free Consultation"}
              </button>

              <p className="text-center text-xs text-warm-gray-400">
                We&apos;ll be in touch within 24 hours.
              </p>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-warm-gray-200 p-7 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-5">
              After Your Callback Request
            </h3>
            <div className="space-y-5">
              {[
                {
                  num: "1",
                  title: "We respond",
                  body: "Within 24 hours, we call or text as requested to discuss your project and find a time that works.",
                },
                {
                  num: "2",
                  title: "Free in-home visit",
                  body: "We come to your home, measure your windows, and assess the light, layout, and your goals.",
                },
                {
                  num: "3",
                  title: "Honest recommendation",
                  body: "We walk you through exactly what we'd recommend and why — no upsell, no pressure.",
                },
                {
                  num: "4",
                  title: "Expert installation",
                  body: "When you're ready, we handle everything. Every install is backed by our lifetime guarantee.",
                },
              ].map((step) => (
                <div key={step.num} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-gold text-xs font-bold">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal mb-0.5">
                      {step.title}
                    </p>
                    <p className="text-sm text-warm-gray-600 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-charcoal rounded-2xl p-7 text-white">
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 text-gold"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-white font-semibold text-sm ml-1">5.0</span>
              <span className="text-warm-gray-400 text-sm ml-1">
                &middot; {BUSINESS.google.reviewCount} Google reviews
              </span>
            </div>
            <p className="text-warm-gray-300 text-sm italic leading-relaxed mt-3 mb-4">
              &ldquo;{REVIEWS[0].text}&rdquo; — {REVIEWS[0].author}
            </p>
            <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-warm-gray-300">
                <svg
                  className="w-4 h-4 text-gold flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <TrackedCta
                  href="tel:+12086608643"
                  event={CONVERSION_EVENTS.PhoneClick}
                  className="hover:text-white transition-colors"
                >
                  208-660-8643
                </TrackedCta>
              </div>
              <div className="flex items-center gap-2 text-warm-gray-300">
                <svg
                  className="w-4 h-4 text-gold flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:mark@luxewindowworks.com"
                  className="hover:text-white transition-colors"
                >
                  mark@luxewindowworks.com
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-warm-gray-400 text-center px-2">
            Serving Coeur d&apos;Alene, Post Falls, Hayden, Rathdrum &amp;
            Sandpoint, ID
          </p>
        </div>
      </div>
    </div>
  );
}
