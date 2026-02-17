"use client";

import { useState, FormEvent } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In production, this would submit to an API endpoint or email service
    setSubmitted(true);
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
          Mark will be in touch soon to schedule your free consultation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1.5">
          Name <span className="text-gold">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
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
            required
            className="w-full border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-warm-white"
            placeholder="(208) 555-0123"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full border border-warm-gray-200 rounded-xl px-4 py-3 text-sm text-charcoal placeholder:text-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold bg-warm-white"
            placeholder="you@email.com"
          />
        </div>
      </div>

      {/* What do you need help with */}
      <div>
        <label htmlFor="needs" className="block text-sm font-medium text-charcoal mb-1.5">
          What do you need help with? <span className="text-gold">*</span>
        </label>
        <textarea
          id="needs"
          name="needs"
          required
          rows={4}
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

      <button
        type="submit"
        className="w-full bg-gold hover:bg-gold-dark text-white font-semibold py-3.5 rounded-full transition-colors text-sm"
      >
        Request Free Consultation
      </button>

      <p className="text-xs text-warm-gray-400 text-center">
        No obligation. Mark will reach out to discuss your needs and schedule
        a convenient time for your free in-home consultation.
      </p>
    </form>
  );
}
