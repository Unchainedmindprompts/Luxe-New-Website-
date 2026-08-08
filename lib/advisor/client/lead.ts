/**
 * Luxe Window Advisor — the secondary lead path. (Phase C)
 *
 * Booking is the goal. This is for the homeowner who wants a person to reach
 * out instead of picking a slot themselves, and it exists because losing that
 * person entirely is worse than capturing them a second-best way.
 *
 * IT REUSES THE EXISTING CONSULTATION ENDPOINT. No new backend, no CRM, no
 * second inbox. `/api/consultation` already takes a name, a phone, an optional
 * email, a message and a source, so this builds exactly that shape.
 *
 * WHAT IT NEVER SENDS: the conversation. Not the homeowner's messages, not the
 * advisor's replies, not the fact ledger, not the opaque state. The context
 * that goes with a lead is assembled here from the same narrowed turn the page
 * already renders — approved product and priority labels only — so anything
 * Luxe receives is something the visitor already saw on screen.
 */
import type { AdvisorTurn } from "./contract";

/** Identifies advisor leads in Luxe's inbox. Mapped to a path by the endpoint. */
export const LEAD_SOURCE = "luxe-advisor";

/**
 * The subject-line tag. A callback request is NOT a booked consultation, and
 * the email has to say so before anyone counts it as one.
 */
export const LEAD_SUBJECT_TAG = "Advisor callback request";

/** Keeps a pasted essay out of the lead email; the consultation is for detail. */
export const MAX_NOTE_CHARS = 500;

export interface LeadContact {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly note: string;
  /** Honeypot. Always empty for a person; the endpoint discards anything else. */
  readonly hp: string;
}

export interface LeadPayload {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly message: string;
  readonly problem: string;
  readonly source: string;
  readonly _hp: string;
}

export type LeadValidation =
  | { readonly ok: true }
  | { readonly ok: false; readonly field: "name" | "phone" | "note"; readonly message: string };

/**
 * Mirrors the endpoint's own requirements — name and phone — so the visitor is
 * told before the round trip rather than after it.
 */
export function validateContact(contact: LeadContact): LeadValidation {
  if (!contact.name.trim()) {
    return { ok: false, field: "name", message: "We need a name to know who to ask for." };
  }
  if (contact.phone.replace(/\D/g, "").length < 10) {
    return { ok: false, field: "phone", message: "Please add a phone number we can reach you on." };
  }
  if (contact.note.length > MAX_NOTE_CHARS) {
    return {
      ok: false,
      field: "note",
      message: `That is a little long for this box — the rest is worth saving for the visit.`,
    };
  }
  return { ok: true };
}

/**
 * Builds the consultation-endpoint body for an advisor callback request.
 *
 * `turn` may be null: a visitor can ask to be contacted after a failed turn,
 * and that lead is worth just as much as any other.
 */
export function buildLeadPayload(
  contact: LeadContact,
  turn: AdvisorTurn | null,
  homeownerTurns: number
): LeadPayload {
  const lines: string[] = [
    "Requested a callback from the Luxe Window Advisor. This is a contact request, not a booked consultation.",
    "",
  ];

  const note = contact.note.trim();
  if (note) {
    lines.push("What they said when asking for a call:", note, "");
  }

  if (turn?.direction) lines.push(`Direction discussed: ${turn.direction}`);
  if (turn?.whatMattersMost.length) {
    lines.push(`What matters most: ${turn.whatMattersMost.join("; ")}`);
  }
  if (turn?.confirmInHome.length) {
    lines.push(`To confirm on site: ${turn.confirmInHome.join("; ")}`);
  }
  lines.push(
    `Advisor exchange: ${homeownerTurns} message${homeownerTurns === 1 ? "" : "s"} before asking for contact.`
  );
  lines.push("", "The conversation itself is not recorded or sent.");

  return {
    name: contact.name.trim(),
    phone: contact.phone.trim(),
    email: contact.email.trim(),
    message: lines.join("\n").trim(),
    problem: LEAD_SUBJECT_TAG,
    source: LEAD_SOURCE,
    _hp: contact.hp,
  };
}
