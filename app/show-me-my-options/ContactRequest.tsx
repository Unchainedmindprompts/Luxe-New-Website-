"use client";

/**
 * "Have Luxe Contact Me" — the secondary path. (Phase C)
 *
 * SECONDARY IS A DESIGN REQUIREMENT, NOT A DESCRIPTION. Booking stays the
 * primary action everywhere this appears: it keeps the solid button and the
 * gold, and this is a plain text link underneath it in a smaller, quieter
 * weight. Nothing here competes for the same eye.
 *
 * It exists for the homeowner who will not pick a slot from a calendar but
 * will happily give a phone number. Without it that person leaves with nothing
 * recorded, which is the worst outcome on the page.
 *
 * It is closed by default. Expanding it is the visitor's decision, and the
 * booking CTA is still the thing sitting above it when they do.
 */

import { useId, useState } from "react";
import Link from "next/link";
import type { AdvisorTurn } from "@/lib/advisor/client/contract";
import {
  MAX_NOTE_CHARS,
  buildLeadPayload,
  validateContact,
  type LeadContact,
} from "@/lib/advisor/client/lead";
import {
  advisorLeadFailed,
  advisorLeadOpened,
  advisorLeadSubmitted,
} from "@/lib/advisor/client/analytics";

export type LeadPlacement = "recommendation" | "guidance" | "fallback" | "footer";

const EMPTY: LeadContact = { name: "", phone: "", email: "", note: "", hp: "" };

export default function ContactRequest({
  placement,
  turn,
  turns,
}: {
  placement: LeadPlacement;
  /** The narrowed turn on screen. Null after a failed turn — still a real lead. */
  turn: AdvisorTurn | null;
  turns: number;
}) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<LeadContact>(EMPTY);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const formId = useId();

  if (sent) {
    return (
      <div className="mt-4 text-sm text-charcoal">
        <p className="font-semibold">Got it — Luxe will be in touch.</p>
        <p className="text-warm-gray-500 mt-1 leading-relaxed">
          We&rsquo;ll call to arrange a time that works. If you&rsquo;d rather pick one now,{" "}
          <Link
            href="/book"
            className="text-gold font-semibold underline underline-offset-4 hover:text-gold/80"
          >
            book your free in-home consultation
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <p className="mt-4 text-sm text-warm-gray-500">
        Rather we reach out?{" "}
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            advisorLeadOpened(placement);
          }}
          className="text-charcoal underline underline-offset-4 hover:text-charcoal/70 focus:outline-none focus:ring-2 focus:ring-gold/40 rounded"
        >
          Have Luxe contact me
        </button>
        .
      </p>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;

    const check = validateContact(contact);
    if (!check.ok) {
      setError(check.message);
      return;
    }

    setError(null);
    setSending(true);
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildLeadPayload(contact, turn, turns)),
      });
      if (!response.ok) {
        advisorLeadFailed(`status-${response.status}`);
        setError("That didn't go through. Please try again, or call us and we'll sort it out.");
        setSending(false);
        return;
      }
      advisorLeadSubmitted(placement, turns);
      setSent(true);
    } catch {
      advisorLeadFailed("network");
      setError("That didn't go through. Please try again, or call us and we'll sort it out.");
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-4 border-t border-warm-gray-200 pt-4">
      <p className="text-sm font-semibold text-charcoal">Have Luxe contact me</p>
      <p className="text-warm-gray-500 text-xs mt-1 leading-relaxed">
        We&rsquo;ll reach out to arrange a time. This doesn&rsquo;t book an appointment — it just
        tells us how to reach you.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field
          id={`${formId}-name`}
          label="Name"
          value={contact.name}
          onChange={(name) => setContact({ ...contact, name })}
          autoComplete="name"
          required
        />
        <Field
          id={`${formId}-phone`}
          label="Phone"
          type="tel"
          value={contact.phone}
          onChange={(phone) => setContact({ ...contact, phone })}
          autoComplete="tel"
          required
        />
      </div>

      <div className="mt-3">
        <Field
          id={`${formId}-email`}
          label="Email (optional)"
          type="email"
          value={contact.email}
          onChange={(email) => setContact({ ...contact, email })}
          autoComplete="email"
        />
      </div>

      <div className="mt-3">
        <label htmlFor={`${formId}-note`} className="block text-xs text-warm-gray-500 mb-1">
          Anything we should know? (optional)
        </label>
        <textarea
          id={`${formId}-note`}
          rows={2}
          maxLength={MAX_NOTE_CHARS}
          value={contact.note}
          onChange={(event) => setContact({ ...contact, note: event.target.value })}
          className="w-full rounded-lg border border-warm-gray-300 bg-white px-3 py-2 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
        />
      </div>

      {/* Honeypot. Hidden from people, irresistible to bots; the endpoint
          silently accepts and discards anything that fills it. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={contact.hp}
        onChange={(event) => setContact({ ...contact, hp: event.target.value })}
      />

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="border border-charcoal text-charcoal font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-charcoal hover:text-white focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "Sending…" : "Request a call"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-warm-gray-500 underline underline-offset-4 hover:text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/40 rounded"
        >
          Never mind
        </button>
      </div>

      <p className="text-warm-gray-500 text-xs mt-3 leading-relaxed">
        We send your name, number and what you asked about. Your conversation on this page is not
        recorded.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-warm-gray-500 mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-warm-gray-300 bg-white px-3 py-2 text-sm text-charcoal focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
    </div>
  );
}
