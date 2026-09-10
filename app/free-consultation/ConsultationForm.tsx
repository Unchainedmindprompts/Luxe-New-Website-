"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { CONVERSION_EVENTS, trackConversionEvent } from "@/lib/conversion-events";
import { TrackedCta } from "@/components/TrackedCta";

export function ConsultationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const successHeading = useRef<HTMLHeadingElement>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("firstName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    if (!name || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter your name and a phone number with area code.");
      return;
    }
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: name,
          phone,
          city: String(data.get("city") ?? "").trim(),
          contactMethod: String(data.get("contactMethod") ?? "Phone call"),
          source: "free-consultation",
          originatingPath: "/free-consultation",
        }),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error("Request was not accepted");
      setSubmitted(true);
      // Count confirmed form delivery only. An inquiry is not a booked visit.
      try {
        trackConversionEvent(CONVERSION_EVENTS.ContactFormSubmit, {
          page_path: "/free-consultation",
          originating_path: "/free-consultation",
        });
      } catch {
        // Analytics failures must not turn a delivered inquiry into a retry.
      }
      requestAnimationFrame(() => successHeading.current?.focus());
    } catch {
      setError("Your request could not be confirmed. Please try again, or call/text 208-660-8643 so we can help.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const input = "mt-1.5 block min-h-12 w-full rounded-lg border border-warm-gray-400 bg-white px-3.5 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-gold";
  return (
    <div className="rounded-2xl bg-white p-6 text-charcoal shadow-xl sm:p-8">
      {submitted ? <div role="status" className="py-8">
        <span aria-hidden="true" className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-2xl">✓</span>
        <h2 ref={successHeading} tabIndex={-1} className="font-serif text-3xl focus:outline-none">Thanks. Your request is in.</h2>
        <p className="mt-4 text-base leading-relaxed text-warm-gray-700">We’ll call or text within 24 hours to talk about your project and arrange your free in-home consultation.</p>
        <p className="mt-4 text-sm text-warm-gray-700">No appointment is booked yet. We’ll agree on a time together.</p>
        <Link href="/book" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-charcoal px-5 py-3 font-semibold text-white">Prefer to book a time now?</Link>
      </div> : <form onSubmit={submit} aria-labelledby="request-heading" aria-busy={busy}>
        <p className="text-sm font-semibold uppercase tracking-widest text-[#876623]">Let’s start with your windows</p>
        <h2 id="request-heading" className="mt-2 font-serif text-[1.8rem] leading-tight sm:text-3xl">Request a Call or Text</h2>
        <p className="mt-3 text-base leading-relaxed text-warm-gray-700">Leave your details. We’ll get in touch within 24 hours to help you get started.</p>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium" htmlFor="landing-name">Your name<input id="landing-name" name="firstName" autoComplete="name" required maxLength={100} className={input} /></label>
          <label className="block text-sm font-medium" htmlFor="landing-phone">Phone number<input id="landing-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} className={input} /></label>
          <label className="block text-sm font-medium" htmlFor="landing-city">City <span className="font-normal text-warm-gray-700">(optional)</span><input id="landing-city" name="city" autoComplete="address-level2" maxLength={100} className={input} /></label>
          <fieldset><legend className="text-sm font-medium">How should we reach you?</legend><div className="mt-2 grid grid-cols-2 gap-3">{["Phone call", "Text message"].map((method, i) => <label key={method} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-warm-gray-300 px-3 text-sm has-[:checked]:border-charcoal has-[:checked]:bg-cream"><input type="radio" name="contactMethod" value={method} defaultChecked={i === 0} className="h-4 w-4 accent-charcoal" />{method}</label>)}</div></fieldset>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className="mt-5 flex min-h-14 w-full items-center justify-center rounded-lg bg-charcoal px-4 py-4 text-base font-semibold text-white transition-colors hover:bg-black disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal">{busy ? "Sending your request…" : "Request My Call or Text"}<span aria-hidden="true" className="ml-3">→</span></button>
        <p className="mt-3 text-center text-sm text-warm-gray-700">No obligation. No appointment to choose right now.</p>
        <p className="mt-4 text-sm leading-relaxed text-warm-gray-700">By submitting, you’re asking Luxe Window Works to contact you about your project by your selected method. <Link href="/privacy" className="underline underline-offset-2">Privacy policy</Link></p>
      </form>}
      <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-2 border-t border-warm-gray-200 pt-4 text-sm">
        <span className="text-warm-gray-700">Prefer to reach us directly?</span>
        <TrackedCta href={BUSINESS.phoneHref} event={CONVERSION_EVENTS.PhoneClick} className="font-semibold underline underline-offset-4">Call</TrackedCta>
        <TrackedCta href={`sms:${BUSINESS.phoneE164}`} event={CONVERSION_EVENTS.TextClick} className="font-semibold underline underline-offset-4">Text</TrackedCta>
      </div>
    </div>
  );
}
