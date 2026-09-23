/**
 * Agent-facing Calendly scheduling contract.
 *
 * INTERNAL BUSINESS TRUTH, sibling of the consultation-request contract in
 * lib/capabilities.ts. Public discovery is derived from this module. The
 * availability and booking routes execute it. There is no second catalogue
 * of readiness or required fields.
 *
 * DIRECT SCHEDULING IS AVAILABLE when both `CALENDLY_API_KEY` and
 * `CALENDLY_EVENT_TYPE_URI` are present. Discovery must not claim the
 * capability is ready if either is missing. There is no event-type list or
 * slug rediscovery. Event-type questions are loaded from the configured
 * official event type, never invented from the human /book fallback form.
 *
 * CUSTOMER CONFIRMATION IS MANDATORY. A booking is created only after the
 * customer explicitly confirms the chosen start time. A Calendly booking
 * after that confirmation IS a booked consultation. A consultation-request
 * remains a request, not an appointment.
 *
 * CALENDLY IS THE SCHEDULING SYSTEM. This module does not write to Google
 * Calendar. Availability, buffers, conflicts, required questions, and
 * location rules stay with Calendly.
 */

import { BUSINESS } from "./constants";
import {
  CONSULT_CAPABILITY_ID,
  CONSULT_DISCOVERY_PATH,
  CONSULT_EXECUTION_PATH,
  SCHEDULING_AGENT_SOURCE,
  SCHEDULING_AVAILABILITY_PATH,
  SCHEDULING_BOOKING_PATH,
  SCHEDULING_CAPABILITY_ID,
  SCHEDULING_CONTRACT_VERSION,
  SCHEDULING_DISCOVERY_PATH,
  SCHEDULING_EVENT_SLUG,
  SCHEDULING_PROVIDER,
} from "./capabilities";

export { SCHEDULING_CONTRACT_VERSION };
import { calendlyCredentialsPresent, calendlyMissingEnvNames } from "./calendly-config";

export const SCHEDULING_READINESS_CONFIGURED = "calendly-credentials-present" as const;
export const SCHEDULING_READINESS_NOT_READY = "not-ready" as const;

export const SCHEDULING_IDEMPOTENCY_NAMESPACE = "sched:v1" as const;
export const SCHEDULING_IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;

export const SCHEDULING_ERROR_CODES = [
  "configuration_failure",
  "unavailable_slot",
  "invalid_information",
  "rate_limited",
  "calendly_authentication_failure",
  "calendly_failure",
  "missing_confirmation",
  "idempotency_conflict",
  "request_in_progress",
  "reconciliation_required",
  "infrastructure_unavailable",
] as const;
export type SchedulingErrorCode = (typeof SCHEDULING_ERROR_CODES)[number];

export const SCHEDULING_DO_NOT_RETRY_AUTOMATICALLY = [
  "configuration_failure",
  "rate_limited",
  "infrastructure_unavailable",
  "calendly_authentication_failure",
  "missing_confirmation",
  "idempotency_conflict",
  "request_in_progress",
  "reconciliation_required",
] as const;

export const SCHEDULING_REQUIRED_BOOKING_FIELDS = [
  "startTime",
  "customerName",
  "customerEmail",
  "customerTimezone",
  "customerConfirmed",
  "idempotencyKey",
] as const;

export const SCHEDULING_OPTIONAL_BOOKING_FIELDS = [
  "questionsAndAnswers",
  "location",
] as const;

export const SCHEDULING_NEVER_REQUIRED_FIELDS = [
  "measurements",
  "photos",
  "budget",
  "payment",
  "productExpertise",
  "finalProductSelection",
] as const;

export const SCHEDULING_RATE_LIMITED_NEXT_STEP =
  "This request was rate limited. retry_after is the number of seconds until a new request would be allowed. Do not wait and retry automatically. Stop and return control to the customer." as const;

export const SCHEDULING_NOT_READY_HTTP_STATUS = 503 as const;
export const SCHEDULING_RATE_LIMITED_HTTP_STATUS = 429 as const;
export const SCHEDULING_IDEMPOTENCY_HTTP_STATUS = 409 as const;
export const SCHEDULING_UNAVAILABLE_HTTP_STATUS = 409 as const;
export const SCHEDULING_INVALID_HTTP_STATUS = 400 as const;
export const SCHEDULING_AUTH_HTTP_STATUS = 502 as const;
export const SCHEDULING_CALENDLY_HTTP_STATUS = 502 as const;

export function isSchedulingConfigured(): boolean {
  return calendlyCredentialsPresent();
}

export interface SchedulingDiscoveryDocument {
  readonly id: typeof SCHEDULING_CAPABILITY_ID;
  readonly name: string;
  readonly description: string;
  readonly contractVersion: typeof SCHEDULING_CONTRACT_VERSION;
  readonly discoveryUrl: typeof SCHEDULING_DISCOVERY_PATH;
  readonly provider: typeof SCHEDULING_PROVIDER;
  readonly humanSchedulingPage: "/book";
  readonly calendlySchedulingUrl: typeof BUSINESS.calendlyUrl;
  readonly eventTypeSlug: typeof SCHEDULING_EVENT_SLUG;
  readonly consultationNotInstallation: true;
  readonly execution: {
    readonly availability: {
      readonly url: typeof SCHEDULING_AVAILABILITY_PATH;
      readonly method: "GET";
    };
    readonly booking: {
      readonly url: typeof SCHEDULING_BOOKING_PATH;
      readonly method: "POST";
    };
    readonly availableForUnattendedAgentExecution: boolean;
  };
  readonly agentMode: {
    readonly source: typeof SCHEDULING_AGENT_SOURCE;
    readonly contractVersion: typeof SCHEDULING_CONTRACT_VERSION;
    readonly note: string;
  };
  readonly configured: boolean;
  readonly submissionEnabled: boolean;
  readonly doNotRetryAutomaticallyWhen: readonly (typeof SCHEDULING_DO_NOT_RETRY_AUTOMATICALLY)[number][];
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly neverRequired: readonly string[];
  readonly customQuestions: {
    readonly source: "calendly-event-type";
    readonly loaded: false;
    readonly retrieveFrom: typeof SCHEDULING_AVAILABILITY_PATH;
    readonly note: string;
  };
  readonly confirmation: {
    readonly required: true;
    readonly field: "customerConfirmed";
    readonly note: string;
  };
  readonly location: {
    readonly publicLabel: "Client's home - Northern Idaho";
    readonly note: string;
  };
  readonly availability: {
    readonly source: "calendly";
    readonly maxWindowDays: 31;
    readonly startTimesAreUtcWithTrailingZ: true;
    readonly note: string;
  };
  readonly cancellationAndRescheduling: {
    readonly handledBy: "calendly";
    readonly note: string;
  };
  readonly consultationRequestFallback: {
    readonly id: typeof CONSULT_CAPABILITY_ID;
    readonly discoveryUrl: typeof CONSULT_DISCOVERY_PATH;
    readonly executionUrl: typeof CONSULT_EXECUTION_PATH;
    readonly note: string;
  };
  readonly response: {
    readonly errorCodes: readonly SchedulingErrorCode[];
    readonly everyBookingResponseIncludes: readonly string[];
  };
  readonly requiresHumanConfirmation: true;
  readonly directBookingAvailable: boolean;
  readonly pricingAvailable: false;
  readonly checkoutAvailable: false;
  readonly successMeans: "calendly-booking-after-explicit-customer-confirmation";
  readonly idempotency: {
    readonly required: true;
    readonly note: string;
  };
  readonly rateLimit: {
    readonly retryAfterField: "retry_after";
    readonly automaticRetryForbidden: true;
    readonly availabilityAndBookingHaveSeparateBudgets: true;
    readonly note: string;
  };
  readonly readiness: typeof SCHEDULING_READINESS_CONFIGURED | typeof SCHEDULING_READINESS_NOT_READY;
  readonly readinessBlockers: readonly string[];
}

export function schedulingDiscoveryDocument(): SchedulingDiscoveryDocument {
  const configured = isSchedulingConfigured();
  return {
    id: SCHEDULING_CAPABILITY_ID,
    name: "Schedule an in-home consultation",
    description: configured
      ? "Direct online scheduling for a free in-home window treatment " +
        "consultation. Calendly is the scheduling system and checks Mark's " +
        "connected Google Calendar. The customer must explicitly select and " +
        "confirm the appointment time. This schedules a consultation, not " +
        "product installation or factory work. No public pricing. The " +
        "consultation-request path remains the fallback."
      : "Direct online scheduling for a free in-home window treatment " +
        "consultation exists, but the Calendly integration is not configured " +
        "in this environment. Do not claim a time is booked. Retrieve the " +
        "discovery document again after configuration, or use the " +
        "consultation-request fallback. This schedules a consultation, not " +
        "product installation. No public pricing.",
    contractVersion: SCHEDULING_CONTRACT_VERSION,
    discoveryUrl: SCHEDULING_DISCOVERY_PATH,
    provider: SCHEDULING_PROVIDER,
    humanSchedulingPage: "/book",
    calendlySchedulingUrl: BUSINESS.calendlyUrl,
    eventTypeSlug: SCHEDULING_EVENT_SLUG,
    consultationNotInstallation: true,
    execution: {
      availability: {
        url: SCHEDULING_AVAILABILITY_PATH,
        method: "GET",
      },
      booking: {
        url: SCHEDULING_BOOKING_PATH,
        method: "POST",
      },
      availableForUnattendedAgentExecution: configured,
    },
    agentMode: {
      source: SCHEDULING_AGENT_SOURCE,
      contractVersion: SCHEDULING_CONTRACT_VERSION,
      note:
        "Retrieve available times once per customer request. Present only those " +
        "times. Require the customer to confirm the chosen start time, then POST " +
        "the booking with customerConfirmed true. Never invent or auto-select a " +
        "time. Never poll availability. Never wait and retry HTTP 429 automatically. " +
        "Never bypass Calendly availability, buffers, conflicts, required questions, " +
        "or location rules.",
    },
    configured,
    submissionEnabled: configured,
    doNotRetryAutomaticallyWhen: [...SCHEDULING_DO_NOT_RETRY_AUTOMATICALLY],
    requiredFields: SCHEDULING_REQUIRED_BOOKING_FIELDS,
    optionalFields: SCHEDULING_OPTIONAL_BOOKING_FIELDS,
    neverRequired: SCHEDULING_NEVER_REQUIRED_FIELDS,
    customQuestions: {
      source: "calendly-event-type",
      loaded: false,
      retrieveFrom: SCHEDULING_AVAILABILITY_PATH,
      note: configured
        ? "Required Calendly questions are loaded from the official event-type " +
          "payload and published by the availability endpoint. Do not copy the " +
          "human /book fallback form fields onto Calendly unless that event type " +
          "defines them."
        : "Configuration is missing. Required Calendly questions are not published " +
          "here so they cannot be invented. Use the consultation-request fallback.",
    },
    confirmation: {
      required: true,
      field: "customerConfirmed",
      note: "The booking endpoint rejects the request unless customerConfirmed is the boolean true. explicitConfirmation true is also accepted.",
    },
    location: {
      publicLabel: "Client's home - Northern Idaho",
      note:
        "Location kind is taken from the Calendly event type at request time. " +
        "Do not invent Zoom or Meet. If the event type requires invitee location " +
        "input, the availability document says so and the booking must include it.",
    },
    availability: {
      source: "calendly",
      maxWindowDays: 31,
      startTimesAreUtcWithTrailingZ: true,
      note:
        "Only Calendly-valid slots are returned. Start times are UTC with a trailing Z. " +
        "Maximum 31 days per request. One inbound availability request makes at most one " +
        "Calendly available-times call. Identical windows may be served from a short " +
        "server cache. Do not poll this endpoint.",
    },
    cancellationAndRescheduling: {
      handledBy: "calendly",
      note: "A successful booking response includes Calendly cancel_url and reschedule_url. Use those links. Do not invent cancellation endpoints.",
    },
    consultationRequestFallback: {
      id: CONSULT_CAPABILITY_ID,
      discoveryUrl: CONSULT_DISCOVERY_PATH,
      executionUrl: CONSULT_EXECUTION_PATH,
      note: "A submitted consultation request is not a booked appointment. This request path remains the fallback when scheduling is unconfigured or the customer cannot confirm a time.",
    },
    response: {
      errorCodes: SCHEDULING_ERROR_CODES,
      everyBookingResponseIncludes: [
        "request_id",
        "status",
        "next_step",
        "contract_version",
      ],
    },
    requiresHumanConfirmation: true,
    directBookingAvailable: configured,
    pricingAvailable: false,
    checkoutAvailable: false,
    successMeans: "calendly-booking-after-explicit-customer-confirmation",
    idempotency: {
      required: true,
      note: "Booking requests must include idempotencyKey. Replays of the same key and same request return the original public result. A different payload with the same key is rejected. Thresholds and storage internals are not published.",
    },
    rateLimit: {
      retryAfterField: "retry_after",
      automaticRetryForbidden: true,
      availabilityAndBookingHaveSeparateBudgets: true,
      note:
        "Availability and booking use separate rate-limit budgets. Thresholds are not " +
        "published. HTTP 429 responses include retry_after in seconds. rate_limited is " +
        "listed in doNotRetryAutomaticallyWhen. The calling agent must not wait and " +
        "retry automatically. Stop and return control to the customer. Do not retry " +
        "automatically when infrastructure is unavailable.",
    },
    readiness: configured ? SCHEDULING_READINESS_CONFIGURED : SCHEDULING_READINESS_NOT_READY,
    readinessBlockers: configured ? [] : [...calendlyMissingEnvNames()],
  };
}
