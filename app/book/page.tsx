"use client";

import { useState } from "react";
import Link from "next/link";

export default function BookPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch("https://formsubmit.co/ajax/mark@luxewindowworks.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Consultation Request — ${form.firstName} ${form.lastName}`,
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          address: form.address || "—",
          message: form.message || "—",
          _captcha: "false",
        }),
      });

      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please call Mark directly at 208-660-8643 or email mark@luxewindowworks.com." });
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
          value={form[id]}
          onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
          placeholder={placeholder}
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
            Mark personally visits your home to see your windows, understand
            your goals, and recommend the right solution. No pressure, no
            guesswork — just honest advice from someone who&apos;s been doing
            this for two decades.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-5 gap-12">
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
                You&apos;re All Set!
              </h2>
              <p className="text-warm-gray-600 leading-relaxed mb-6">
                Your request has been sent to Mark. He&apos;ll personally reach
                out within <strong>24 hours</strong> to schedule your free
                in-home consultation.
              </p>
              <p className="text-sm text-warm-gray-500 mb-8">
                Prefer to reach out directly?{" "}
                <a
                  href="tel:+12086608643"
                  className="text-gold font-medium hover:text-gold-dark"
                >
                  Call 208-660-8643
                </a>{" "}
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
                Your Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("firstName", "First Name")}
                {field("lastName", "Last Name")}
              </div>

              {field("phone", "Phone Number", "tel", "e.g. 208-555-0100")}
              {field("email", "Email Address", "email", "you@example.com")}
              {field(
                "address",
                "Home Address",
                "text",
                "123 Main St, Post Falls, ID"
              )}

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
                <p className="text-red-500 text-sm text-center">{errors.form}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gold hover:bg-gold-dark disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-white font-semibold py-4 rounded-xl text-base transition-colors"
              >
                {submitting ? "Sending…" : "Request My Free Consultation"}
              </button>

              <p className="text-center text-xs text-warm-gray-400">
                Mark will personally reach out within 24 hours.
              </p>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-warm-gray-200 p-7 shadow-sm">
            <h3 className="font-serif text-lg font-semibold text-charcoal mb-5">
              What Happens Next
            </h3>
            <div className="space-y-5">
              {[
                {
                  num: "1",
                  title: "Mark calls you",
                  body: "Within 24 hours, Mark reaches out personally to introduce himself and find a time that works.",
                },
                {
                  num: "2",
                  title: "Free in-home visit",
                  body: "Mark comes to your home, measures your windows, and assesses the light, layout, and your goals.",
                },
                {
                  num: "3",
                  title: "Honest recommendation",
                  body: "He walks you through exactly what he'd recommend and why — no upsell, no pressure.",
                },
                {
                  num: "4",
                  title: "Expert installation",
                  body: "When you're ready, Mark handles everything. Every install is backed by his lifetime guarantee.",
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
                &middot; 14 Google reviews
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
                <a
                  href="tel:+12086608643"
                  className="hover:text-white transition-colors"
                >
                  208-660-8643
                </a>
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
