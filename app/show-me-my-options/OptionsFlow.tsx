"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

const PROBLEMS = [
  "Too much heat or glare",
  "More privacy",
  "Better blackout or sleep",
  "Motorized shades",
  "Better insulation / energy efficiency",
  "Updating the style of my home",
  "Window treatments for a new home",
  "I'm not sure yet",
] as const;

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  city: "",
  message: "",
};

export default function OptionsFlow() {
  const [problem, setProblem] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.phone.trim()) next.phone = "Please enter a phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          city: form.city,
          message: form.message,
          problem,
          source: "show-me-my-options",
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
    } catch {
      setError(
        "Something went wrong. Please call us at 208-660-8643 or email mark@luxewindowworks.com."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (submitted) {
    return (
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
          We&apos;ll be in touch within <strong>24 hours</strong> to talk
          through your options and schedule your free consultation.
        </p>
        <p className="text-sm text-warm-gray-500">
          Prefer to reach out directly?{" "}
          <a
            href="tel:+12086608643"
            className="text-gold font-medium hover:text-gold-dark"
          >
            Call 208-660-8643
          </a>
          {" "}or{" "}
          <a
            href="mailto:mark@luxewindowworks.com"
            className="text-gold font-medium hover:text-gold-dark"
          >
            mark@luxewindowworks.com
          </a>
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-warm-gray-500 hover:text-charcoal transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Step 1 — Problem selection
  if (!problem) {
    return (
      <div className="bg-white rounded-2xl border border-warm-gray-200 p-8 sm:p-10 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-widest mb-2">
          <span>Step 1 of 2</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal leading-tight mb-2">
          What are you trying to solve?
        </h2>
        <p className="text-warm-gray-500 text-sm mb-8">
          Pick whichever is closest — you can share more detail next.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROBLEMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProblem(p)}
              className="text-left px-5 py-4 rounded-xl border border-warm-gray-200 bg-warm-white hover:bg-gold/5 hover:border-gold/50 hover:shadow-sm transition-all group"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-charcoal font-medium text-[15px] leading-snug">
                  {p}
                </span>
                <svg
                  className="w-4 h-4 text-warm-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 2 — Contact form
  return (
    <div className="bg-white rounded-2xl border border-warm-gray-200 p-8 sm:p-10 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-widest mb-2">
        <span>Step 2 of 2</span>
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal leading-tight mb-2">
        Where should we reach you?
      </h2>
      <p className="text-warm-gray-500 text-sm mb-6">
        We&apos;ll only use this to talk through your options — no spam, no
        pushy sales.
      </p>

      {/* Selected-problem chip w/ change link */}
      <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-sm">
        <span className="text-warm-gray-500 text-xs">You picked:</span>
        <span className="text-charcoal font-medium">{problem}</span>
        <button
          type="button"
          onClick={() => setProblem(null)}
          className="ml-1 text-gold hover:text-gold-dark text-xs font-medium underline underline-offset-2"
        >
          Change
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          id="name"
          label="Name"
          required
          value={form.name}
          error={errors.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder="Your name"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            id="phone"
            label="Phone"
            required
            type="tel"
            value={form.phone}
            error={errors.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="(208) 555-0123"
          />
          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            placeholder="you@email.com"
          />
        </div>
        <Field
          id="city"
          label="City"
          value={form.city}
          error={errors.city}
          onChange={(v) => setForm((f) => ({ ...f, city: v }))}
          placeholder="Coeur d'Alene, Post Falls, Hayden…"
        />
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-1.5">
            Anything else? <span className="text-warm-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Which rooms, any specific goals, or anything we should know."
            className="w-full bg-white border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors resize-none"
          />
        </div>

        {/* Honeypot */}
        <input
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gold hover:bg-gold-dark disabled:bg-warm-gray-200 disabled:text-warm-gray-400 text-white font-semibold py-4 rounded-full text-base transition-colors"
        >
          {submitting ? "Sending…" : "Send My Request"}
        </button>
        <p className="text-center text-xs text-warm-gray-400">
          We&apos;ll be in touch within 24 hours.
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal mb-1.5">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors ${
          error ? "border-red-400" : "border-warm-gray-200"
        }`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
