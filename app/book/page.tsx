"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { TrackedCta } from "@/components/TrackedCta";
import { PricePositioning } from "@/components/PricePositioning";
import { CONVERSION_EVENTS, trackConversionEvent } from "@/lib/conversion-events";
import { readOriginatingPath } from "@/lib/originating-path";
import { BUSINESS } from "@/lib/constants";
import { CalendlyScheduleTracker } from "./CalendlyScheduleTracker";

const CONTACT_METHODS = ["Phone call", "Text message", "Email"] as const;

export default function BookPage() {
  const pathname = usePathname() ?? "/book";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    cityOrZip: "",
    contactMethod: "Phone call",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    const phone = form.phone.trim();
    const email = form.email.trim();
    if (!phone && !email) {
      e.phone = "Add a phone number or an email";
      e.email = "Add a phone number or an email";
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      e.email = "Valid email required";
    }
    if (!form.cityOrZip.trim()) e.cityOrZip = "City or ZIP is required";
    if (form.contactMethod === "Email" && !email) {
      e.email = "Email is required if you prefer email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          // City or ZIP goes in the human `city` field. Do not send `zip` or
          // `postalCode` — those are agent-exclusive and would 503 the request.
          city: form.cityOrZip.trim(),
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
      setErrors({
        form: "Something went wrong. Please call us at 208-660-8643 or email mark@luxewindowworks.com.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function field(
    id: "name" | "phone" | "email" | "cityOrZip",
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
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
          autoComplete={
            id === "name"
              ? "name"
              : id === "phone"
                ? "tel"
                : id === "email"
                  ? "email"
                  : "postal-code"
          }
          className={`w-full bg-white border rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors ${
            errors[id] ? "border-red-400" : "border-warm-gray-200"
          }`}
        />
        {errors[id] && (
          <p className="text-red-500 text-xs mt-1">{errors[id]}</p>
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
            Two ways to start: book a time now, or leave your name and we&apos;ll
            call you back. Requesting a callback is not a booked appointment.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#book-appointment"
              className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
            >
              Book a time now
            </a>
            <a
              href="#request-callback"
              className="inline-flex items-center justify-center border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
            >
              Have us call you
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        <PricePositioning variant="book" />
      </div>

      {/* Path A — Calendly booked appointment. Embed URL and widget behavior
          stay exactly as production: calendly.com/mark-luxewindowworks/2hr. */}
      <div id="book-appointment" className="max-w-4xl mx-auto px-4 pt-12 scroll-mt-24">
        <div className="rounded-2xl border-2 border-gold/40 bg-white p-5 sm:p-7 shadow-sm">
          <p className="inline-flex items-center rounded-full bg-gold/10 text-gold text-xs font-semibold uppercase tracking-widest px-3 py-1">
            Path A &middot; Booked appointment
          </p>
          <div className="text-center mt-5 mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              Pick a time that works for you
            </h2>
            <p className="mt-2 text-warm-gray-600">
              Choose a slot below and it&apos;s booked — no waiting on a callback.
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
            style={{ minWidth: "320px" }}
          />
          {/* lazyOnload keeps a third-party script off the critical path — this
              page's LCP should not wait on Calendly. */}
          <Script
            src="https://assets.calendly.com/assets/external/widget.js"
            strategy="lazyOnload"
          />
          <CalendlyScheduleTracker />
        </div>
      </div>

      {/* Path B — callback request. Not a booking. */}
      <div id="request-callback" className="max-w-4xl mx-auto px-4 pt-14 scroll-mt-24">
        <div className="flex items-center gap-4">
          <div className="h-px bg-warm-gray-200 flex-1" />
          <p className="text-sm text-warm-gray-500 whitespace-nowrap">
            Or a different path
          </p>
          <div className="h-px bg-warm-gray-200 flex-1" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3">
          <p className="inline-flex items-center rounded-full bg-charcoal text-white text-xs font-semibold uppercase tracking-widest px-3 py-1 mb-4">
            Path B &middot; Callback request — not a booking
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-2">
            Have us call you instead
          </h2>
          <p className="text-warm-gray-600 leading-relaxed mb-6">
            Leave your name and how to reach you. We&apos;ll follow up later to
            arrange the visit. This does not reserve a time, and we don&apos;t
            need your full home address yet.
          </p>
          {submitted ? (
            <div className="bg-cream rounded-2xl border border-warm-gray-200 p-10 text-center shadow-sm">
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
                Request received
              </h2>
              <p className="text-warm-gray-600 leading-relaxed mb-3">
                This is not a booked appointment. We&apos;ll be in touch within
                <strong> 24 hours</strong> to find a time for your free in-home
                consultation.
              </p>
              <p className="text-sm text-warm-gray-500 mb-8">
                Prefer to reach out directly?{" "}
                <TrackedCta
                  href={BUSINESS.phoneHref}
                  event={CONVERSION_EVENTS.PhoneClick}
                  className="text-gold font-medium hover:text-gold-dark"
                >
                  Call {BUSINESS.phone}
                </TrackedCta>
                {" · "}
                <TrackedCta
                  href={BUSINESS.smsHref}
                  event={CONVERSION_EVENTS.TextClick}
                  className="text-gold font-medium hover:text-gold-dark"
                >
                  Text {BUSINESS.phone}
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
              className="bg-cream rounded-2xl border border-warm-gray-200 p-8 shadow-sm space-y-5"
            >
              <h3 className="font-serif text-xl font-semibold text-charcoal">
                How should we reach you?
              </h3>

              {field("name", "Name")}
              {field("phone", "Phone", "tel", "e.g. 208-555-0100")}
              {field("email", "Email", "email", "you@example.com")}
              {field(
                "cityOrZip",
                "City or ZIP",
                "text",
                "Post Falls or 83854"
              )}

              <div>
                <p className="block text-sm font-medium text-charcoal mb-2.5">
                  Preferred contact
                </p>
                <div className="flex flex-wrap gap-3">
                  {CONTACT_METHODS.map((method) => (
                    <label key={method} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value={method}
                        checked={form.contactMethod === method}
                        onChange={() =>
                          setForm((f) => ({ ...f, contactMethod: method }))
                        }
                        className="w-4 h-4 text-gold border-warm-gray-300 focus:ring-gold"
                      />
                      <span className="text-sm text-warm-gray-600">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-charcoal mb-1.5"
                >
                  Project notes{" "}
                  <span className="text-warm-gray-400 font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Anything useful — rooms, glare, privacy — or leave this blank."
                  className="w-full bg-white border border-warm-gray-200 rounded-lg px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors resize-none"
                />
              </div>

              {errors.form && (
                <p className="text-red-500 text-sm text-center">{errors.form}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-charcoal hover:bg-charcoal/90 disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-white font-semibold py-4 rounded-xl text-base transition-colors"
              >
                {submitting ? "Sending…" : "Request a callback"}
              </button>

              <p className="text-center text-xs text-warm-gray-500">
                We&apos;ll be in touch within 24 hours. Submitting this form is
                not a booked appointment. Full address comes later, when we
                arrange the visit.
              </p>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-warm-gray-200 p-7 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-5">
              What happens after a callback request
            </h3>
            <div className="space-y-5">
              {[
                {
                  num: "1",
                  title: "We reach out",
                  body: "Within 24 hours we call, text, or email — this is follow-up, not a reserved visit.",
                },
                {
                  num: "2",
                  title: "We arrange the visit",
                  body: "That's when we collect your full home address and find a time that works.",
                },
                {
                  num: "3",
                  title: "Free in-home consultation",
                  body: "We come to your home, measure your windows, and walk through what actually fits.",
                },
                {
                  num: "4",
                  title: "One price, quoted once",
                  body: "When you're ready, we install it. Every install is backed by our lifetime guarantee.",
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
              <span className="text-white font-semibold text-sm ml-1">
                {BUSINESS.google.rating.toFixed(1)}
              </span>
              <span className="text-warm-gray-400 text-sm ml-1">
                &middot; {BUSINESS.google.reviewCount} Google reviews
              </span>
            </div>
            <p className="text-warm-gray-300 text-sm italic leading-relaxed mt-3 mb-4">
              &ldquo;Mark was incredibly knowledgeable and patient. He helped us
              find the perfect solution for our tricky west-facing windows. The
              installation was flawless.&rdquo;
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
                  href={BUSINESS.phoneHref}
                  event={CONVERSION_EVENTS.PhoneClick}
                  className="hover:text-white transition-colors"
                >
                  Call {BUSINESS.phone}
                </TrackedCta>
                <span className="text-warm-gray-500">·</span>
                <TrackedCta
                  href={BUSINESS.smsHref}
                  event={CONVERSION_EVENTS.TextClick}
                  className="hover:text-white transition-colors"
                >
                  Text
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
