/**
 * Official Calendly Scheduling API client.
 *
 * Base URL: https://api.calendly.com
 * Auth: Personal Access Token (CALENDLY_API_KEY), server-side only.
 * Docs: https://developer.calendly.com/schedule-events-with-ai-agents
 *
 * Never logs the token, Authorization header, customer fields, or complete
 * request/response bodies.
 */

import { BUSINESS } from "./constants";
import { SCHEDULING_EVENT_SLUG } from "./capabilities";
import {
  CALENDLY_API_BASE,
  calendlyApiKey,
  calendlyEventTypeUriFromEnv,
} from "./calendly-config";

export type CalendlyFailureKind =
  | "authentication_failure"
  | "calendly_failure"
  | "configuration_failure"
  | "not_found"
  | "invalid_argument";

export class CalendlyApiError extends Error {
  readonly kind: CalendlyFailureKind;
  readonly httpStatus: number;

  constructor(kind: CalendlyFailureKind, httpStatus: number, message: string) {
    super(message);
    this.name = "CalendlyApiError";
    this.kind = kind;
    this.httpStatus = httpStatus;
  }
}

export interface CalendlyCustomQuestion {
  readonly uuid?: string;
  readonly name: string;
  readonly type?: string;
  readonly position?: number;
  readonly enabled?: boolean;
  readonly required?: boolean;
  readonly answer_choices?: readonly string[];
}

export interface CalendlyLocationConfig {
  readonly kind: string;
  readonly location?: string;
  readonly additional_info?: string;
}

export interface CalendlyEventType {
  readonly uri: string;
  readonly name: string;
  readonly active?: boolean;
  readonly slug?: string;
  readonly scheduling_url?: string;
  readonly duration?: number;
  readonly custom_questions?: readonly CalendlyCustomQuestion[];
  readonly locations?: readonly CalendlyLocationConfig[];
  readonly location_configurations?: readonly CalendlyLocationConfig[];
}

export interface CalendlyAvailableTime {
  readonly status: string;
  readonly start_time: string;
  readonly invitees_remaining?: number;
}

export interface CalendlyInviteeResult {
  readonly uri: string;
  readonly event: string;
  readonly status?: string;
  readonly timezone?: string;
  readonly cancel_url: string;
  readonly reschedule_url: string;
  readonly created_at?: string;
}

export interface CreateInviteeInput {
  readonly eventType: string;
  readonly startTime: string;
  readonly name: string;
  readonly email: string;
  readonly timezone: string;
  readonly location?: { kind: string; location?: string };
  readonly questionsAndAnswers?: readonly {
    question: string;
    answer: string;
    position?: number;
  }[];
}

export interface CalendlyClient {
  resolveConsultationEventType(): Promise<CalendlyEventType>;
  listAvailableTimes(
    eventTypeUri: string,
    startTime: string,
    endTime: string
  ): Promise<CalendlyAvailableTime[]>;
  createInvitee(input: CreateInviteeInput): Promise<CalendlyInviteeResult>;
}

function eventTypeUuid(uri: string): string | null {
  const match = uri.trim().match(/\/event_types\/([^/?#]+)$/);
  return match ? match[1] : null;
}

export function normalizeCalendlySchedulingUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "").split("?")[0]?.toLowerCase() ?? "";
}

export function isLuxeConsultationEventType(eventType: CalendlyEventType): boolean {
  const canonical = normalizeCalendlySchedulingUrl(BUSINESS.calendlyUrl);
  const url = eventType.scheduling_url
    ? normalizeCalendlySchedulingUrl(eventType.scheduling_url)
    : "";
  if (url && url === canonical) return true;
  if (url && url.endsWith("/mark-luxewindowworks/2hr")) return true;
  if (eventType.slug === SCHEDULING_EVENT_SLUG) return true;
  return false;
}

export function eventTypeLocations(
  eventType: CalendlyEventType
): readonly CalendlyLocationConfig[] {
  if (Array.isArray(eventType.locations) && eventType.locations.length > 0) {
    return eventType.locations;
  }
  if (
    Array.isArray(eventType.location_configurations) &&
    eventType.location_configurations.length > 0
  ) {
    return eventType.location_configurations;
  }
  return [];
}

export function enabledCustomQuestions(
  eventType: CalendlyEventType
): CalendlyCustomQuestion[] {
  const raw = eventType.custom_questions ?? [];
  return raw.filter((question) => {
    if (!question || typeof question.name !== "string" || !question.name.trim()) {
      return false;
    }
    return question.enabled !== false;
  });
}

function classifyHttpStatus(status: number): CalendlyFailureKind {
  if (status === 401) return "authentication_failure";
  if (status === 404) return "not_found";
  if (status === 400) return "invalid_argument";
  return "calendly_failure";
}

async function calendlyFetch(
  token: string,
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const url = path.startsWith("http") ? path : `${CALENDLY_API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new CalendlyApiError("calendly_failure", 0, "Calendly request failed.");
  }

  if (response.status === 401) {
    throw new CalendlyApiError(
      "authentication_failure",
      401,
      "Calendly authentication failed."
    );
  }

  if (!response.ok) {
    throw new CalendlyApiError(
      classifyHttpStatus(response.status),
      response.status,
      "Calendly request failed."
    );
  }

  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    throw new CalendlyApiError("calendly_failure", response.status, "Calendly request failed.");
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseEventType(value: unknown): CalendlyEventType | null {
  const rec = asRecord(value);
  if (!rec || typeof rec.uri !== "string" || !rec.uri) return null;
  const custom: CalendlyCustomQuestion[] | undefined = Array.isArray(rec.custom_questions)
    ? rec.custom_questions.reduce<CalendlyCustomQuestion[]>((acc, item) => {
        const q = asRecord(item);
        if (!q || typeof q.name !== "string") return acc;
        acc.push({
          name: q.name,
          uuid: typeof q.uuid === "string" ? q.uuid : undefined,
          type: typeof q.type === "string" ? q.type : undefined,
          position: typeof q.position === "number" ? q.position : undefined,
          enabled: typeof q.enabled === "boolean" ? q.enabled : undefined,
          required: typeof q.required === "boolean" ? q.required : undefined,
          answer_choices: Array.isArray(q.answer_choices)
            ? q.answer_choices.filter((choice): choice is string => typeof choice === "string")
            : undefined,
        });
        return acc;
      }, [])
    : undefined;
  const parseLocs = (raw: unknown): CalendlyLocationConfig[] | undefined => {
    if (!Array.isArray(raw)) return undefined;
    const locs: CalendlyLocationConfig[] = [];
    for (const item of raw) {
      const loc = asRecord(item);
      if (!loc || typeof loc.kind !== "string" || !loc.kind) continue;
      locs.push({
        kind: loc.kind,
        location: typeof loc.location === "string" ? loc.location : undefined,
        additional_info:
          typeof loc.additional_info === "string" ? loc.additional_info : undefined,
      });
    }
    return locs;
  };
  return {
    uri: rec.uri,
    name: typeof rec.name === "string" ? rec.name : "In-home consultation",
    active: typeof rec.active === "boolean" ? rec.active : undefined,
    slug: typeof rec.slug === "string" ? rec.slug : undefined,
    scheduling_url:
      typeof rec.scheduling_url === "string" ? rec.scheduling_url : undefined,
    duration: typeof rec.duration === "number" ? rec.duration : undefined,
    custom_questions: custom,
    locations: parseLocs(rec.locations),
    location_configurations: parseLocs(rec.location_configurations),
  };
}

function parseInvitee(value: unknown): CalendlyInviteeResult | null {
  const rec = asRecord(value);
  if (!rec) return null;
  if (typeof rec.uri !== "string" || !rec.uri) return null;
  if (typeof rec.event !== "string" || !rec.event) return null;
  if (typeof rec.cancel_url !== "string" || !rec.cancel_url) return null;
  if (typeof rec.reschedule_url !== "string" || !rec.reschedule_url) return null;
  return {
    uri: rec.uri,
    event: rec.event,
    status: typeof rec.status === "string" ? rec.status : undefined,
    timezone: typeof rec.timezone === "string" ? rec.timezone : undefined,
    cancel_url: rec.cancel_url,
    reschedule_url: rec.reschedule_url,
    created_at: typeof rec.created_at === "string" ? rec.created_at : undefined,
  };
}

async function listAllEventTypes(
  token: string,
  queryName: "user" | "organization",
  queryValue: string
): Promise<CalendlyEventType[]> {
  const found: CalendlyEventType[] = [];
  let path: string | null =
    `/event_types?${queryName}=${encodeURIComponent(queryValue)}&count=100`;

  while (path) {
    const payload = asRecord(await calendlyFetch(token, path));
    const collection = payload && Array.isArray(payload.collection) ? payload.collection : [];
    for (const item of collection) {
      const parsed = parseEventType(item);
      if (parsed) found.push(parsed);
    }
    const pagination = payload ? asRecord(payload.pagination) : null;
    const next =
      pagination && typeof pagination.next_page === "string" ? pagination.next_page : null;
    path = next;
  }
  return found;
}

export function createCalendlyClient(token: string): CalendlyClient {
  return {
    async resolveConsultationEventType() {
      const configured = calendlyEventTypeUriFromEnv();
      if (configured) {
        const uuid = eventTypeUuid(configured);
        if (!uuid) {
          throw new CalendlyApiError(
            "configuration_failure",
            0,
            "Calendly event type URI is invalid."
          );
        }
        const payload = asRecord(await calendlyFetch(token, `/event_types/${uuid}`));
        const parsed = payload ? parseEventType(payload.resource) : null;
        if (!parsed) {
          throw new CalendlyApiError(
            "configuration_failure",
            0,
            "Calendly event type could not be loaded."
          );
        }
        return parsed;
      }

      const me = asRecord(await calendlyFetch(token, "/users/me"));
      const user = me ? asRecord(me.resource) : null;
      const userUri = user && typeof user.uri === "string" ? user.uri : "";
      const orgUri =
        user && typeof user.current_organization === "string"
          ? user.current_organization
          : "";
      if (!userUri) {
        throw new CalendlyApiError(
          "configuration_failure",
          0,
          "Calendly user could not be resolved."
        );
      }

      const fromUser = await listAllEventTypes(token, "user", userUri);
      const match =
        fromUser.find((et) => et.active !== false && isLuxeConsultationEventType(et)) ??
        fromUser.find((et) => isLuxeConsultationEventType(et));
      if (match) return match;

      if (orgUri) {
        const fromOrg = await listAllEventTypes(token, "organization", orgUri);
        const orgMatch =
          fromOrg.find((et) => et.active !== false && isLuxeConsultationEventType(et)) ??
          fromOrg.find((et) => isLuxeConsultationEventType(et));
        if (orgMatch) return orgMatch;
      }

      throw new CalendlyApiError(
        "configuration_failure",
        0,
        "Calendly consultation event type could not be resolved."
      );
    },

    async listAvailableTimes(eventTypeUri, startTime, endTime) {
      const path =
        `/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}` +
        `&start_time=${encodeURIComponent(startTime)}` +
        `&end_time=${encodeURIComponent(endTime)}`;
      const payload = asRecord(await calendlyFetch(token, path));
      const collection = payload && Array.isArray(payload.collection) ? payload.collection : [];
      const slots: CalendlyAvailableTime[] = [];
      for (const item of collection) {
        const rec = asRecord(item);
        if (!rec || typeof rec.start_time !== "string") continue;
        const status = typeof rec.status === "string" ? rec.status : "available";
        if (status !== "available") continue;
        slots.push({
          status,
          start_time: rec.start_time,
          invitees_remaining:
            typeof rec.invitees_remaining === "number" ? rec.invitees_remaining : undefined,
        });
      }
      return slots;
    },

    async createInvitee(input) {
      const body: Record<string, unknown> = {
        event_type: input.eventType,
        start_time: input.startTime,
        invitee: {
          name: input.name,
          email: input.email,
          timezone: input.timezone,
        },
        tracking: { utm_source: "agent" },
      };
      if (input.location) {
        body.location = input.location.location
          ? { kind: input.location.kind, location: input.location.location }
          : { kind: input.location.kind };
      }
      if (input.questionsAndAnswers?.length) {
        body.questions_and_answers = input.questionsAndAnswers.map((qa) => ({
          question: qa.question,
          answer: qa.answer,
          ...(typeof qa.position === "number" ? { position: qa.position } : {}),
        }));
      }
      const payload = asRecord(
        await calendlyFetch(token, "/invitees", {
          method: "POST",
          body: JSON.stringify(body),
        })
      );
      const parsed = payload ? parseInvitee(payload.resource) : null;
      if (!parsed) {
        throw new CalendlyApiError(
          "calendly_failure",
          201,
          "Calendly booking response was incomplete."
        );
      }
      return parsed;
    },
  };
}

export function createCalendlyClientFromEnv(): CalendlyClient | null {
  const token = calendlyApiKey();
  if (!token) return null;
  return createCalendlyClient(token);
}
