/**
 * Pure scheduling input policy. No I/O.
 *
 * Validates confirmation, identity, timezone, start time, and Calendly
 * question answers. Does not invent questions or location kinds.
 */

import type { CalendlyCustomQuestion, CalendlyEventType } from "./calendly-client";
import { enabledCustomQuestions, eventTypeLocations } from "./calendly-client";
import {
  SCHEDULING_CONTRACT_VERSION,
  type SchedulingErrorCode,
} from "./scheduling";

export const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const KINDS_NEEDING_INVITEE_LOCATION = new Set([
  "ask_invitee",
  "outbound_call",
]);

export interface SchedulingQuestionAnswer {
  readonly question: string;
  readonly answer: string;
  readonly position?: number;
}

export interface SchedulingLocationInput {
  readonly kind?: string;
  readonly location?: string;
}

export interface PublicAvailableSlot {
  readonly start_time: string;
}

export interface SchedulingPublicResponse {
  request_id: string;
  status: "booked" | "rejected" | "unavailable";
  next_step: string;
  contract_version: typeof SCHEDULING_CONTRACT_VERSION;
  error?: SchedulingErrorCode;
  start_time?: string;
  timezone?: string;
  duration_minutes?: number;
  event_uri?: string;
  invitee_uri?: string;
  cancel_url?: string;
  reschedule_url?: string;
  alternatives?: PublicAvailableSlot[];
  clarification_needed?: string[];
}

export function schedulingResponse(
  requestId: string,
  fields: Omit<SchedulingPublicResponse, "request_id" | "contract_version">
): SchedulingPublicResponse {
  return {
    request_id: requestId,
    contract_version: SCHEDULING_CONTRACT_VERSION,
    ...fields,
  };
}

export function publicSchedulingBody(
  body: SchedulingPublicResponse
): SchedulingPublicResponse {
  return {
    request_id: body.request_id,
    status: body.status,
    next_step: body.next_step,
    contract_version: body.contract_version,
    ...(body.error ? { error: body.error } : {}),
    ...(body.start_time ? { start_time: body.start_time } : {}),
    ...(body.timezone ? { timezone: body.timezone } : {}),
    ...(typeof body.duration_minutes === "number"
      ? { duration_minutes: body.duration_minutes }
      : {}),
    ...(body.event_uri ? { event_uri: body.event_uri } : {}),
    ...(body.invitee_uri ? { invitee_uri: body.invitee_uri } : {}),
    ...(body.cancel_url ? { cancel_url: body.cancel_url } : {}),
    ...(body.reschedule_url ? { reschedule_url: body.reschedule_url } : {}),
    ...(body.alternatives ? { alternatives: body.alternatives } : {}),
    ...(body.clarification_needed?.length
      ? { clarification_needed: body.clarification_needed }
      : {}),
  };
}

export function isIanaTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeUtcInstant(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function instantsEqual(a: string, b: string): boolean {
  const left = Date.parse(a);
  const right = Date.parse(b);
  if (Number.isNaN(left) || Number.isNaN(right)) return false;
  return left === right;
}

export function confirmationAccepted(body: Record<string, unknown>): boolean {
  return body.customerConfirmed === true || body.explicitConfirmation === true;
}

export function parseQuestionAnswers(raw: unknown): SchedulingQuestionAnswer[] | null {
  if (raw === undefined || raw === null || raw === "") return [];
  if (!Array.isArray(raw)) return null;
  const answers: SchedulingQuestionAnswer[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return null;
    const rec = item as Record<string, unknown>;
    const question =
      typeof rec.question === "string"
        ? rec.question
        : typeof rec.name === "string"
          ? rec.name
          : typeof rec.uuid === "string"
            ? rec.uuid
            : "";
    if (!question || typeof rec.answer !== "string") return null;
    answers.push({
      question: question.trim(),
      answer: rec.answer,
      position: typeof rec.position === "number" ? rec.position : undefined,
    });
  }
  return answers;
}

function questionKey(value: string): string {
  return value.trim().toLowerCase();
}

export function matchQuestionAnswers(
  eventType: CalendlyEventType,
  submitted: readonly SchedulingQuestionAnswer[]
):
  | { ok: true; answers: SchedulingQuestionAnswer[]; missing: string[] }
  | { ok: false; missing: string[] } {
  const questions = enabledCustomQuestions(eventType);
  const byKey = new Map<string, SchedulingQuestionAnswer>();
  for (const item of submitted) {
    byKey.set(questionKey(item.question), item);
  }

  const mapped: SchedulingQuestionAnswer[] = [];
  const missing: string[] = [];
  for (const question of questions) {
    const match =
      byKey.get(questionKey(question.name)) ??
      (question.uuid ? byKey.get(questionKey(question.uuid)) : undefined);
    if (question.required && (!match || !match.answer.trim())) {
      missing.push(question.name);
      continue;
    }
    if (match && match.answer.trim()) {
      mapped.push({
        question: question.name,
        answer: match.answer.trim(),
        position: question.position,
      });
    }
  }
  if (missing.length) return { ok: false, missing };
  return { ok: true, answers: mapped, missing: [] };
}

export function locationRequiresInviteeInput(eventType: CalendlyEventType): boolean {
  const locs = eventTypeLocations(eventType);
  if (locs.length === 0) return false;
  if (locs.length > 1) {
    const physicalOrCustom = locs.filter(
      (loc) => loc.kind === "physical" || loc.kind === "custom" || loc.kind === "ask_invitee"
    );
    if (physicalOrCustom.length > 1) return true;
  }
  return locs.some((loc) => KINDS_NEEDING_INVITEE_LOCATION.has(loc.kind));
}

export function buildCalendlyLocation(
  eventType: CalendlyEventType,
  input?: SchedulingLocationInput
):
  | { ok: true; omit: true }
  | { ok: true; location: { kind: string; location?: string } }
  | { ok: false; missing: string[] } {
  const locs = eventTypeLocations(eventType);
  if (locs.length === 0) return { ok: true, omit: true };

  if (locs.length === 1) {
    const loc = locs[0];
    if (locationRequiresInviteeInput(eventType)) {
      const value = input?.location?.trim();
      if (!value) return { ok: false, missing: ["location.location"] };
      return { ok: true, location: { kind: loc.kind, location: value } };
    }
    return { ok: true, location: { kind: loc.kind } };
  }

  const chosenKind = input?.kind?.trim();
  const chosen = chosenKind
    ? locs.find((loc) => loc.kind === chosenKind)
    : undefined;
  if (!chosen) return { ok: false, missing: ["location.kind"] };
  if (
    KINDS_NEEDING_INVITEE_LOCATION.has(chosen.kind) ||
    chosen.kind === "physical" ||
    chosen.kind === "custom"
  ) {
    const value = input?.location?.trim();
    if (!value && locationRequiresInviteeInput(eventType)) {
      return { ok: false, missing: ["location.location"] };
    }
    return value
      ? { ok: true, location: { kind: chosen.kind, location: value } }
      : { ok: true, location: { kind: chosen.kind } };
  }
  return { ok: true, location: { kind: chosen.kind } };
}

export function publicQuestions(eventType: CalendlyEventType): readonly {
  name: string;
  type?: string;
  required: boolean;
  position?: number;
  answer_choices?: readonly string[];
}[] {
  return enabledCustomQuestions(eventType).map((question: CalendlyCustomQuestion) => ({
    name: question.name,
    ...(question.type ? { type: question.type } : {}),
    required: question.required === true,
    ...(typeof question.position === "number" ? { position: question.position } : {}),
    ...(question.answer_choices?.length
      ? { answer_choices: question.answer_choices }
      : {}),
  }));
}

export function publicLocation(eventType: CalendlyEventType): {
  required: boolean;
  kinds: string[];
  inviteeInputRequired: boolean;
  publicLabel: string;
} {
  const locs = eventTypeLocations(eventType);
  return {
    required: locs.length > 0,
    kinds: locs.map((loc) => loc.kind),
    inviteeInputRequired: locationRequiresInviteeInput(eventType),
    publicLabel: "Client's home - Northern Idaho",
  };
}
