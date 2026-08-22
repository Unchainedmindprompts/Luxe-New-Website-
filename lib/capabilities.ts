/**
 * What a person or an agent can actually initiate with Luxe.
 *
 * INTERNAL BUSINESS TRUTH, like `lib/offerings.ts`. This module is the source
 * of the consultation-request contract. Public discovery is derived from it;
 * the POST route executes it. There is no second catalogue of intents,
 * geography, or readiness.
 *
 * THE CAPABILITY IS NOT THE ENDPOINT. "Luxe accepts requests for an in-home
 * consultation" is a fact about the business and stays true if the form, the
 * mail provider or the route ever change. `POST /api/consultation` is today's
 * execution surface for it — one way to perform the capability, with its own
 * outcome and its own readiness.
 *
 * REQUEST, NEVER BOOKING. The endpoint sends an email. It touches no calendar,
 * checks no availability, returns no time, reserves nothing, and creates no
 * appointment. A successful submission means Luxe was asked to follow up.
 *
 * TWO GEOGRAPHY CONCERNS, KEPT APART.
 *   1. Canonical website markets (`SERVICE_AREAS` in lib/constants.ts) — five
 *      city pages, Place entities, nav, SEO. Untouched by this contract.
 *   2. Operational consultation eligibility — the larger set of markets Mark
 *      will accept a request from. Agents validate against (2). They must not
 *      invent pages or schema for it.
 *
 * DRAPERY. Custom draperies are a real offering and a valid consultation
 * category. The repository has no drapery product page and no Service `@id`.
 * That absence is recorded here rather than filled in.
 *
 * READINESS. `autonomousExecution` stays the literal `"not-ready"`. There is
 * no durable rate limiter and no durable idempotency store in this repository
 * (no Upstash, no Redis, no other provider — and this phase does not add one).
 * The decision policy can still be proven in tests, but production agent
 * submission is disabled until readiness is deliberately changed after those
 * controls exist. No environment variable can flip this.
 */

import type { OfferingId } from "./offerings";
import { BUSINESS, PRODUCTS } from "./constants";

export type CapabilityId = "request-in-home-consultation";

export const CONSULT_CONTRACT_VERSION = "1.0" as const;
export const CONSULT_CAPABILITY_ID = "request-in-home-consultation" as const;
export const CONSULT_DISCOVERY_PATH =
  "/api/capabilities/request-in-home-consultation" as const;
export const CONSULT_EXECUTION_PATH = "/api/consultation" as const;
export const CONSULT_AGENT_SOURCE = "agent" as const;

/**
 * One way to perform a capability.
 *
 * Separate from the capability because the two can be true and false
 * independently: Luxe accepts consultation requests today regardless of whether
 * this particular endpoint is fit for unattended machine traffic.
 */
export interface ExecutionSurface {
  readonly endpoint: typeof CONSULT_EXECUTION_PATH;
  readonly method: "POST";

  /**
   * WHAT A 2xx ACTUALLY MEANS.
   *
   * Human forms still receive `{ ok: true }` when the endpoint took the
   * submission. That includes the honeypot path, which answers the same way
   * and sends no email. Agent mode uses the status/reason contract instead;
   * `accepted` there still means the request was delivered for human follow-up,
   * not that a visit exists.
   */
  readonly successMeans: "submission-acknowledged-by-endpoint";

  /**
   * A literal, not a boolean. Flipping this is a claim that the transport is
   * fit for unattended traffic. It is not: there is no durable rate limiter
   * and no durable idempotency store. See `requestSubmission` on the agent
   * contract.
   */
  readonly autonomousExecution: typeof CONSULT_AUTONOMOUS_EXECUTION;
}

export interface Capability {
  readonly summary: string;
  readonly actionType: "request";
  readonly outcome: "consultation-requested";
  readonly requiresHumanFollowUp: true;
  /**
   * Fields the human forms already send. Agent mode adds more; those live on
   * the agent contract so a browser form cannot suddenly be asked for a
   * postal code or an idempotency key.
   */
  readonly input: {
    readonly identifiesCustomerBy: readonly string[];
    readonly required: readonly string[];
    readonly optional: readonly string[];
  };
  readonly executionSurfaces: readonly ExecutionSurface[];
}

export const CONSULT_INTENTS = [
  { id: "new_window_treatments", label: "New window treatments" },
  { id: "motorization_consultation", label: "Motorization consultation" },
  { id: "exterior_solar_consultation", label: "Exterior solar consultation" },
  { id: "commercial_project", label: "Commercial project" },
  { id: "single_window_project", label: "Single-window project" },
  {
    id: "third_party_repair_or_service",
    label: "Third-party product repair/service",
  },
  { id: "price_only", label: "Price-only request" },
  {
    id: "existing_customer_or_warranty",
    label: "Existing-customer or warranty support",
  },
  { id: "speak_to_human", label: "Speak to a human" },
  { id: "other", label: "Other/needs clarification" },
] as const;

export type ConsultIntentId = (typeof CONSULT_INTENTS)[number]["id"];

export const CONSULT_STATUSES = [
  "accepted",
  "soft_accepted",
  "rejected",
  "handoff_required",
] as const;
export type ConsultStatus = (typeof CONSULT_STATUSES)[number];

export const CONSULT_REASON_CODES = [
  "in_service_area",
  "edge_geography",
  "out_of_area",
  "incomplete_request",
  "unsupported_category",
  "third_party_service",
  "commercial_review",
  "wants_price_now",
  "existing_customer_or_warranty",
  "human_requested",
  "clarification_required",
  "unsupported_contract_version",
  "capability_not_ready",
] as const;
export type ConsultReasonCode = (typeof CONSULT_REASON_CODES)[number];

/**
 * Offering ids the consult surface accepts, plus nothing else.
 *
 * Type-only check against `OfferingId` so adding a product/offering fails
 * `tsc` here until the consult list is updated — the same compile-time
 * discipline as `OFFERINGS` itself. Drapery is not in this list on purpose:
 * it is not an `OfferingId` and must not be forced into that registry.
 */
export const CONSULT_OFFERING_CATEGORY_IDS = [
  "blinds",
  "cellular-shades",
  "solar-shades",
  "exterior-solar-shades",
  "roller-shades",
  "banded-shades",
  "roman-shades",
  "shutters",
  "motorization",
  "aluminum-shutters",
] as const satisfies readonly OfferingId[];

type ConsultOfferingCategoryId = (typeof CONSULT_OFFERING_CATEGORY_IDS)[number];
type _AllOfferingsCovered = OfferingId extends ConsultOfferingCategoryId
  ? true
  : never;
const _allOfferingsCovered: _AllOfferingsCovered = true;
void _allOfferingsCovered;

export const CONSULT_DRAPERY_CATEGORY_ID = "custom-draperies" as const;
export type ConsultCategoryId =
  | ConsultOfferingCategoryId
  | typeof CONSULT_DRAPERY_CATEGORY_ID;

/**
 * Operational markets Mark will accept a consultation request from.
 * Not website SERVICE_AREAS. Do not generate pages or Place entities from this.
 */
export const CONSULT_ELIGIBLE_MARKETS = [
  { city: "Post Falls", state: "ID", aliases: ["post falls"] },
  {
    city: "Coeur d'Alene",
    state: "ID",
    aliases: ["coeur d alene", "coeur dalene", "cda"],
  },
  { city: "Hayden", state: "ID", aliases: ["hayden"] },
  { city: "Rathdrum", state: "ID", aliases: ["rathdrum"] },
  { city: "Sandpoint", state: "ID", aliases: ["sandpoint"] },
  { city: "Athol", state: "ID", aliases: ["athol"] },
  { city: "Liberty Lake", state: "WA", aliases: ["liberty lake"] },
  { city: "Spokane Valley", state: "WA", aliases: ["spokane valley"] },
  { city: "Spokane", state: "WA", aliases: ["spokane"] },
] as const;

export const CONSULT_DISTANT_CITIES = ["boise"] as const;

export const CONSULT_NEARBY_POSTAL_PREFIXES = ["838", "990", "992"] as const;
export const CONSULT_DISTANT_POSTAL_PREFIXES = ["837"] as const;

export const CONSULT_IDEMPOTENCY_NAMESPACE = "consult:v1" as const;
export const CONSULT_IDEMPOTENCY_TTL_SECONDS = 7 * 24 * 60 * 60;

export const CONSULT_READINESS = "not-ready" as const;
export const CONSULT_AUTONOMOUS_EXECUTION = "not-ready" as const;
export const CONSULT_READINESS_BLOCKERS = [
  "durable-idempotency-unavailable",
  "durable-rate-limit-unavailable",
] as const;

/**
 * Fields that only the agent contract uses. Presence of any of these, or
 * `source: "agent"`, means the request is agent-intended and must never be
 * processed as a human form — even when the payload is incomplete.
 *
 * Human `/contact` and `/book` send none of these. `source` values that are
 * page paths (`contact`, `book`, `/contact`, …) are not agent markers.
 */
export const CONSULT_AGENT_EXCLUSIVE_FIELDS = [
  "contractVersion",
  "idempotencyKey",
  "postalCode",
  "zip",
  "intent",
  "preferredContactMethod",
  "productInterests",
  "propertyType",
  "projectGoals",
  "timing",
  "windowCount",
  "accessNotes",
  "streetAddress",
] as const;

export const CONSULT_NOT_READY_HTTP_STATUS = 503 as const;
export const CONSULT_NOT_READY_NEXT_STEP =
  "Agent submission is not currently available. Do not retry automatically. A person must contact Luxe through the normal human channels.";
export const CONSULT_NOT_READY_EXPECTATION =
  "No consultation request was submitted or delivered.";

/**
 * Production gate. Derived only from this contract — no env override.
 * False while readiness / autonomousExecution are the literal `"not-ready"`.
 */
export function isConsultAgentSubmissionEnabled(): boolean {
  return (
    CONSULT_READINESS !== "not-ready" &&
    CONSULT_AUTONOMOUS_EXECUTION !== "not-ready"
  );
}

export const CONSULT_CATEGORY_ALIASES: Record<string, ConsultCategoryId> = {
  drapery: "custom-draperies",
  draperies: "custom-draperies",
  drapes: "custom-draperies",
  "custom drapery": "custom-draperies",
  "custom draperies": "custom-draperies",
  "custom drapes": "custom-draperies",
  "custom-drapery": "custom-draperies",
  "custom-drapes": "custom-draperies",
  "plantation shutters": "shutters",
  "plantation-shutters": "shutters",
  honeycomb: "cellular-shades",
  "honeycomb shades": "cellular-shades",
  "cellular shades": "cellular-shades",
  "solar shades": "solar-shades",
  "exterior solar": "exterior-solar-shades",
  "exterior solar shades": "exterior-solar-shades",
  "exterior screens": "exterior-solar-shades",
  "roller shades": "roller-shades",
  "banded shades": "banded-shades",
  "roman shades": "roman-shades",
  "aluminum shutters": "aluminum-shutters",
  motorized: "motorization",
  motors: "motorization",
};

export interface ConsultCategoryPublic {
  readonly id: ConsultCategoryId;
  readonly offered: true;
  readonly canonicalProductPage: string | null;
  readonly canonicalServiceId: string | null;
}

export function consultCategoriesPublic(): readonly ConsultCategoryPublic[] {
  const fromPages: ConsultCategoryPublic[] = PRODUCTS.map((product) => ({
    id: product.slug,
    offered: true as const,
    canonicalProductPage: `/products/${product.slug}`,
    // Same URL shape as `productServiceRef` in lib/schema.ts. Built here so
    // this module does not import the schema graph — and so drapery / aluminum
    // shutters never receive a fabricated Service `@id`.
    canonicalServiceId: `${BUSINESS.url}/products/${product.slug}#service`,
  }));

  return [
    ...fromPages,
    {
      id: "aluminum-shutters",
      offered: true,
      canonicalProductPage: null,
      canonicalServiceId: null,
    },
    {
      id: CONSULT_DRAPERY_CATEGORY_ID,
      offered: true,
      canonicalProductPage: null,
      canonicalServiceId: null,
    },
  ];
}

export const CONSULT_REQUIRED_AGENT_FIELDS = [
  "name",
  "phone",
  "city",
  "postalCode",
  "preferredContactMethod",
  "intent",
  "source",
  "contractVersion",
  "idempotencyKey",
] as const;

export const CONSULT_OPTIONAL_AGENT_FIELDS = [
  "address",
  "productInterests",
  "propertyType",
  "projectGoals",
  "timing",
  "windowCount",
  "accessNotes",
  "message",
  "email",
] as const;

export const CONSULT_NEVER_REQUIRED_FIELDS = [
  "measurements",
  "photos",
  "productExpertise",
  "finalProductSelection",
  "budget",
  "payment",
] as const;

export interface ConsultationDiscoveryDocument {
  readonly id: typeof CONSULT_CAPABILITY_ID;
  readonly name: string;
  readonly description: string;
  readonly contractVersion: typeof CONSULT_CONTRACT_VERSION;
  readonly discoveryUrl: typeof CONSULT_DISCOVERY_PATH;
  readonly execution: {
    readonly url: typeof CONSULT_EXECUTION_PATH;
    readonly method: "POST";
    readonly availableForUnattendedAgentExecution: boolean;
  };
  readonly agentMode: {
    readonly source: typeof CONSULT_AGENT_SOURCE;
    readonly contractVersion: typeof CONSULT_CONTRACT_VERSION;
    readonly note: string;
  };
  readonly submissionEnabled: boolean;
  readonly doNotRetryAutomaticallyWhen: "capability_not_ready";
  readonly requiredFields: readonly string[];
  readonly optionalFields: readonly string[];
  readonly conditionallyRequired: readonly {
    readonly field: string;
    readonly when: string;
  }[];
  readonly neverRequired: readonly string[];
  readonly allowedIntents: readonly {
    readonly id: ConsultIntentId;
    readonly label: string;
  }[];
  readonly supportedProductCategories: readonly ConsultCategoryPublic[];
  readonly geography: {
    readonly websiteCanonicalMarketsUnchanged: true;
    readonly eligibleMarkets: readonly {
      readonly city: string;
      readonly state: string;
    }[];
    readonly nearbyPostalPrefixes: readonly string[];
    readonly distantPostalExample: "837xx";
    readonly policy: string;
  };
  readonly response: {
    readonly statuses: readonly ConsultStatus[];
    readonly reasonCodes: readonly ConsultReasonCode[];
    readonly everyResponseIncludes: readonly string[];
  };
  readonly requiresHumanFollowUp: true;
  readonly directBookingAvailable: false;
  readonly pricingAvailable: false;
  readonly checkoutAvailable: false;
  readonly successMeans: "request-delivered-for-human-follow-up-not-an-appointment";
  readonly idempotency: {
    readonly required: true;
    readonly durableStoreAvailable: false;
    readonly note: string;
  };
  readonly rateLimit: {
    readonly durableLimiterAvailable: false;
    readonly agentsShareHumanEndpoint: true;
    readonly note: string;
  };
  readonly readiness: typeof CONSULT_READINESS;
  readonly readinessBlockers: readonly (typeof CONSULT_READINESS_BLOCKERS)[number][];
}

export function consultationDiscoveryDocument(): ConsultationDiscoveryDocument {
  return {
    id: CONSULT_CAPABILITY_ID,
    name: "Request an in-home consultation",
    description:
      "Structured consultation-request contract. Agent submission is currently " +
      "disabled. The endpoint is documented but unavailable for unattended " +
      "execution. Humans can still use /contact or /book. A successful request, " +
      "when submission is later enabled, is delivery and acknowledgement — not " +
      "an appointment, a quote, a price, or project acceptance.",
    contractVersion: CONSULT_CONTRACT_VERSION,
    discoveryUrl: CONSULT_DISCOVERY_PATH,
    execution: {
      url: CONSULT_EXECUTION_PATH,
      method: "POST",
      availableForUnattendedAgentExecution: isConsultAgentSubmissionEnabled(),
    },
    agentMode: {
      source: CONSULT_AGENT_SOURCE,
      contractVersion: CONSULT_CONTRACT_VERSION,
      note:
        "A valid agent request includes source \"agent\" and contractVersion " +
        `"${CONSULT_CONTRACT_VERSION}". Any agent-contract marker (source "agent", ` +
        "contractVersion, idempotencyKey, or another exclusive agent field) is " +
        "treated as agent-intended and is never processed as a human form. " +
        "User-Agent headers are ignored.",
    },
    submissionEnabled: isConsultAgentSubmissionEnabled(),
    doNotRetryAutomaticallyWhen: "capability_not_ready",
    requiredFields: CONSULT_REQUIRED_AGENT_FIELDS,
    optionalFields: CONSULT_OPTIONAL_AGENT_FIELDS,
    conditionallyRequired: [
      {
        field: "email",
        when: "preferredContactMethod is email",
      },
    ],
    neverRequired: CONSULT_NEVER_REQUIRED_FIELDS,
    allowedIntents: CONSULT_INTENTS.map((intent) => ({
      id: intent.id,
      label: intent.label,
    })),
    supportedProductCategories: consultCategoriesPublic(),
    geography: {
      websiteCanonicalMarketsUnchanged: true,
      eligibleMarkets: CONSULT_ELIGIBLE_MARKETS.map((market) => ({
        city: market.city,
        state: market.state,
      })),
      nearbyPostalPrefixes: CONSULT_NEARBY_POSTAL_PREFIXES,
      distantPostalExample: "837xx",
      policy:
        "Exact approved market → accepted. Unrecognized city with a North Idaho / " +
        "greater Spokane postal pattern (838xx, 990xx, 992xx) → soft_accepted " +
        "edge_geography. Clearly distant (Boise / 837xx, other state, unrelated " +
        "postal) → rejected out_of_area. Missing or unusable location → rejected " +
        "incomplete_request. Canonical website service-area pages stay the original five.",
    },
    response: {
      statuses: CONSULT_STATUSES,
      reasonCodes: CONSULT_REASON_CODES,
      everyResponseIncludes: [
        "request_id",
        "status",
        "next_step",
        "contract_version",
      ],
    },
    requiresHumanFollowUp: true,
    directBookingAvailable: false,
    pricingAvailable: false,
    checkoutAvailable: false,
    successMeans: "request-delivered-for-human-follow-up-not-an-appointment",
    idempotency: {
      required: true,
      durableStoreAvailable: false,
      note:
        "Agent requests must include idempotencyKey. A durable store is not " +
        "configured. Agent submission stays disabled until one exists and is verified.",
    },
    rateLimit: {
      durableLimiterAvailable: false,
      agentsShareHumanEndpoint: true,
      note:
        "No durable rate limiter is configured. Agent submission stays disabled " +
        "until one exists and is verified. No thresholds are published.",
    },
    readiness: CONSULT_READINESS,
    readinessBlockers: [...CONSULT_READINESS_BLOCKERS],
  };
}

export const CAPABILITIES: Record<CapabilityId, Capability> = {
  "request-in-home-consultation": {
    summary:
      "Luxe Window Works accepts requests for a free in-home window treatment " +
      "consultation. Luxe follows up to arrange a visit; submitting a request " +
      "does not schedule one.",
    actionType: "request",
    outcome: "consultation-requested",
    requiresHumanFollowUp: true,
    input: {
      identifiesCustomerBy: ["name", "firstName", "lastName"],
      required: ["phone"],
      optional: [
        "email",
        "address",
        "city",
        "message",
        "needs",
        "contactMethod",
        "problem",
        "source",
      ],
    },
    executionSurfaces: [
      {
        endpoint: CONSULT_EXECUTION_PATH,
        method: "POST",
        successMeans: "submission-acknowledged-by-endpoint",
        autonomousExecution: CONSULT_AUTONOMOUS_EXECUTION,
      },
    ],
  },
};
