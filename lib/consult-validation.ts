/**
 * Pure consultation-request policy for agent mode.
 *
 * Deterministic, no I/O. The route still owns honeypot, length limits, and
 * mail. This module answers: given a cleaned agent payload, what status,
 * reason, and follow-up should come back — and whether Mark should get email.
 *
 * Precedence (do not reorder without a contract change):
 *   1. Abuse / length / sanitize / honeypot — handled by the caller
 *   2. Contract version + required agent fields
 *   3. Clear out-of-area
 *   4. Third-party repair/service
 *   5. Unsupported categories
 *   6. Price-only, warranty/existing-customer, explicit human → handoff
 *   7. Edge geography → soft_accepted
 *   8. Commercial → soft_accepted
 *   9. Valid in-area, including single-window → accepted
 */

import {
  CONSULT_AGENT_SOURCE,
  CONSULT_CATEGORY_ALIASES,
  CONSULT_CONTRACT_VERSION,
  CONSULT_DISTANT_CITIES,
  CONSULT_DISTANT_POSTAL_PREFIXES,
  CONSULT_DRAPERY_CATEGORY_ID,
  CONSULT_ELIGIBLE_MARKETS,
  CONSULT_INTENTS,
  CONSULT_NEARBY_POSTAL_PREFIXES,
  CONSULT_OFFERING_CATEGORY_IDS,
  type ConsultCategoryId,
  type ConsultIntentId,
  type ConsultReasonCode,
  type ConsultStatus,
} from "./capabilities";

export interface AgentResponseBody {
  request_id: string;
  status: ConsultStatus;
  reason_code?: ConsultReasonCode;
  next_step: string;
  response_expectation?: string;
  clarification_needed?: string[];
  contract_version: typeof CONSULT_CONTRACT_VERSION;
}

export interface ConsultEmailPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  message: string;
  contactMethod: string;
  intent: ConsultIntentId | "";
  productInterests: ConsultCategoryId[];
  propertyType: string;
  projectGoals: string;
  timing: string;
  windowCount: string;
  accessNotes: string;
  source: string;
}

export interface AgentDecision {
  status: ConsultStatus;
  reason_code?: ConsultReasonCode;
  next_step: string;
  response_expectation?: string;
  clarification_needed?: string[];
  shouldEmail: boolean;
  email: ConsultEmailPayload;
}

export function isExplicitAgentRequest(body: Record<string, unknown>): boolean {
  return (
    body.source === CONSULT_AGENT_SOURCE &&
    typeof body.contractVersion === "string" &&
    body.contractVersion.trim() !== ""
  );
}

export function normalizeCityKey(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const STATE_ALIASES: Record<string, "ID" | "WA"> = {
  id: "ID",
  idaho: "ID",
  wa: "WA",
  washington: "WA",
};

const OTHER_STATES = new Set([
  "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "il",
  "in", "ia", "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo",
  "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd", "oh", "ok", "or",
  "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "va", "wv", "wi", "wy",
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
  "connecticut", "delaware", "florida", "georgia", "hawaii", "illinois",
  "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri",
  "montana", "nebraska", "nevada", "new hampshire", "new jersey",
  "new mexico", "new york", "north carolina", "north dakota", "ohio",
  "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
  "south dakota", "tennessee", "texas", "utah", "vermont", "virginia",
  "west virginia", "wisconsin", "wyoming",
]);

export function parseCityInput(raw: string): {
  cityKey: string;
  state: "ID" | "WA" | null;
  otherState: boolean;
} {
  const trimmed = raw.trim();
  const comma = trimmed.match(/^(.*?)[,]\s*([A-Za-z .]+)$/);
  const spaced = trimmed.match(/^(.*)\s+([A-Za-z]{2})$/);
  let cityPart = trimmed;
  let stateRaw = "";

  if (comma) {
    cityPart = comma[1];
    stateRaw = comma[2];
  } else if (spaced) {
    const maybeState = spaced[2].toLowerCase();
    if (STATE_ALIASES[maybeState] || OTHER_STATES.has(maybeState)) {
      cityPart = spaced[1];
      stateRaw = spaced[2];
    }
  }

  const stateKey = normalizeCityKey(stateRaw);
  const known = STATE_ALIASES[stateKey];
  const otherState = stateKey !== "" && !known && OTHER_STATES.has(stateKey);
  return {
    cityKey: normalizeCityKey(cityPart),
    state: known ?? null,
    otherState,
  };
}

export function parsePostalCode(raw: string): string | null {
  const match = raw.trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match ? match[1] : null;
}

export type GeoClass =
  | "incomplete"
  | "out_of_area"
  | "edge_geography"
  | "in_service_area";

export function classifyGeography(cityRaw: string, postalRaw: string): GeoClass {
  const cityUsable = cityRaw.trim() !== "";
  const zip5 = parsePostalCode(postalRaw);
  if (!cityUsable || !zip5) return "incomplete";

  const parsed = parseCityInput(cityRaw);
  if (parsed.otherState) return "out_of_area";

  const prefix = zip5.slice(0, 3);
  if ((CONSULT_DISTANT_POSTAL_PREFIXES as readonly string[]).includes(prefix)) {
    return "out_of_area";
  }

  if ((CONSULT_DISTANT_CITIES as readonly string[]).includes(parsed.cityKey)) {
    return "out_of_area";
  }

  const nearby = (CONSULT_NEARBY_POSTAL_PREFIXES as readonly string[]).includes(
    prefix
  );

  const markets = [...CONSULT_ELIGIBLE_MARKETS].sort(
    (a, b) => b.city.length - a.city.length
  );
  const matched = markets.find((market) => {
    const keys = [normalizeCityKey(market.city), ...market.aliases];
    return keys.includes(parsed.cityKey);
  });

  if (matched) {
    if (parsed.state && parsed.state !== matched.state) return "out_of_area";
    return nearby ? "in_service_area" : "out_of_area";
  }

  return nearby ? "edge_geography" : "out_of_area";
}

const CONTACT_ALIASES: Record<string, "phone" | "text" | "email"> = {
  phone: "phone",
  call: "phone",
  "phone call": "phone",
  tel: "phone",
  telephone: "phone",
  text: "text",
  sms: "text",
  "text message": "text",
  email: "email",
  "e-mail": "email",
  "e mail": "email",
};

export function normalizeContactMethod(
  raw: string
): "phone" | "text" | "email" | null {
  const key = normalizeCityKey(raw);
  return CONTACT_ALIASES[key] ?? null;
}

export function normalizeIntent(raw: string): ConsultIntentId | null {
  const key = normalizeCityKey(raw);
  if (!key) return null;
  for (const intent of CONSULT_INTENTS) {
    if (intent.id === raw.trim() || normalizeCityKey(intent.label) === key) {
      return intent.id;
    }
    if (normalizeCityKey(intent.id.replace(/_/g, " ")) === key) {
      return intent.id;
    }
  }
  return null;
}

const OFFERING_ID_SET = new Set<string>(CONSULT_OFFERING_CATEGORY_IDS);

export function normalizeCategory(raw: string): ConsultCategoryId | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed === CONSULT_DRAPERY_CATEGORY_ID) return trimmed;
  if (OFFERING_ID_SET.has(trimmed)) return trimmed as ConsultCategoryId;

  const key = normalizeCityKey(trimmed);
  if (key === CONSULT_DRAPERY_CATEGORY_ID.replace(/-/g, " ")) {
    return CONSULT_DRAPERY_CATEGORY_ID;
  }
  if (OFFERING_ID_SET.has(key.replace(/\s+/g, "-"))) {
    return key.replace(/\s+/g, "-") as ConsultCategoryId;
  }
  return CONSULT_CATEGORY_ALIASES[key] ?? CONSULT_CATEGORY_ALIASES[trimmed.toLowerCase()] ?? null;
}

export function classifyProductInterests(
  raw: unknown
): { ok: true; ids: ConsultCategoryId[] } | { ok: false } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, ids: [] };
  }

  let parts: string[] = [];
  if (Array.isArray(raw)) {
    if (raw.some((item) => typeof item !== "string")) return { ok: false };
    parts = raw as string[];
  } else if (typeof raw === "string") {
    parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  } else {
    return { ok: false };
  }

  const ids: ConsultCategoryId[] = [];
  for (const part of parts) {
    const id = normalizeCategory(part);
    if (!id) return { ok: false };
    if (!ids.includes(id)) ids.push(id);
  }
  return { ok: true, ids };
}

function nextStepFor(status: ConsultStatus, reason?: ConsultReasonCode): string {
  switch (status) {
    case "accepted":
      return "Luxe will follow up to discuss this request. This is not an appointment.";
    case "soft_accepted":
      if (reason === "edge_geography") {
        return "Luxe will review whether this location can be served and then follow up.";
      }
      if (reason === "commercial_review") {
        return "Luxe will review this commercial project and then follow up.";
      }
      return "Luxe will review this request and follow up if it can proceed.";
    case "handoff_required":
      return "A person at Luxe needs to continue this conversation and will follow up.";
    case "rejected":
      if (reason === "out_of_area") {
        return "This location is outside Luxe's consultation area. No visit will be arranged from this request.";
      }
      if (reason === "third_party_service") {
        return "Luxe does not repair or service unrelated third-party installations.";
      }
      if (reason === "unsupported_category") {
        return "That product category is not a Luxe consultation offering.";
      }
      if (reason === "unsupported_contract_version") {
        return "Use contractVersion 1.0 as published on the discovery document.";
      }
      return "This request cannot be accepted as submitted.";
  }
}

function expectationFor(status: ConsultStatus): string {
  switch (status) {
    case "accepted":
      return "Human follow-up by phone or the preferred contact method. No time is reserved.";
    case "soft_accepted":
      return "Human review first, then follow-up if the request can proceed. No time is reserved.";
    case "handoff_required":
      return "A person at Luxe will contact the customer. This is not an appointment.";
    case "rejected":
      return "No consultation will be scheduled from this request.";
  }
}

function decide(
  status: ConsultStatus,
  reason: ConsultReasonCode | undefined,
  email: ConsultEmailPayload,
  clarification?: string[]
): AgentDecision {
  return {
    status,
    reason_code: reason,
    next_step: nextStepFor(status, reason),
    response_expectation: expectationFor(status),
    clarification_needed: clarification,
    shouldEmail: status !== "rejected",
    email,
  };
}

export interface AgentFieldInput {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  message: string;
  preferredContactMethod: string;
  intent: string;
  contractVersion: string;
  idempotencyKey: string;
  productInterests: unknown;
  propertyType: string;
  projectGoals: string;
  timing: string;
  windowCount: string;
  accessNotes: string;
}

export function decideAgentRequest(input: AgentFieldInput): AgentDecision {
  const emptyEmail: ConsultEmailPayload = {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    message: input.message,
    contactMethod: input.preferredContactMethod,
    intent: "",
    productInterests: [],
    propertyType: input.propertyType,
    projectGoals: input.projectGoals,
    timing: input.timing,
    windowCount: input.windowCount,
    accessNotes: input.accessNotes,
    source: CONSULT_AGENT_SOURCE,
  };

  if (input.contractVersion !== CONSULT_CONTRACT_VERSION) {
    return decide("rejected", "unsupported_contract_version", emptyEmail, [
      "contractVersion",
    ]);
  }

  const missing: string[] = [];
  if (!input.name) missing.push("name");
  if (!input.phone) missing.push("phone");
  if (!input.city) missing.push("city");
  if (!input.postalCode) missing.push("postalCode");
  if (!input.preferredContactMethod) missing.push("preferredContactMethod");
  if (!input.intent) missing.push("intent");
  if (!input.idempotencyKey) missing.push("idempotencyKey");

  const contact = input.preferredContactMethod
    ? normalizeContactMethod(input.preferredContactMethod)
    : null;
  if (input.preferredContactMethod && !contact) {
    missing.push("preferredContactMethod");
  }
  if (contact === "email" && !input.email) {
    missing.push("email");
  }

  const intent = input.intent ? normalizeIntent(input.intent) : null;
  if (input.intent && !intent) {
    missing.push("intent");
  }

  if (missing.length > 0) {
    return decide(
      "rejected",
      "incomplete_request",
      emptyEmail,
      [...new Set(missing)]
    );
  }

  const geo = classifyGeography(input.city, input.postalCode);
  if (geo === "incomplete") {
    return decide("rejected", "incomplete_request", emptyEmail, [
      "city",
      "postalCode",
    ]);
  }
  if (geo === "out_of_area") {
    return decide("rejected", "out_of_area", emptyEmail);
  }

  if (intent === "third_party_repair_or_service") {
    return decide("rejected", "third_party_service", emptyEmail);
  }

  const categories = classifyProductInterests(input.productInterests);
  if (!categories.ok) {
    return decide("rejected", "unsupported_category", emptyEmail, [
      "productInterests",
    ]);
  }

  const email: ConsultEmailPayload = {
    ...emptyEmail,
    intent: intent as ConsultIntentId,
    productInterests: categories.ids,
    contactMethod: contact as string,
  };

  if (intent === "price_only") {
    return decide("handoff_required", "wants_price_now", email);
  }
  if (intent === "existing_customer_or_warranty") {
    return decide("handoff_required", "existing_customer_or_warranty", email);
  }
  if (intent === "speak_to_human") {
    return decide("handoff_required", "human_requested", email);
  }

  if (geo === "edge_geography") {
    return decide("soft_accepted", "edge_geography", email);
  }
  if (intent === "commercial_project") {
    return decide("soft_accepted", "commercial_review", email);
  }
  if (intent === "other") {
    return decide("soft_accepted", "clarification_required", email, ["intent"]);
  }

  return decide("accepted", "in_service_area", email);
}

export function agentResponse(
  requestId: string,
  decision: Pick<
    AgentDecision,
    | "status"
    | "reason_code"
    | "next_step"
    | "response_expectation"
    | "clarification_needed"
  >
): AgentResponseBody {
  const body: AgentResponseBody = {
    request_id: requestId,
    status: decision.status,
    next_step: decision.next_step,
    response_expectation: decision.response_expectation,
    contract_version: CONSULT_CONTRACT_VERSION,
  };
  if (decision.reason_code) body.reason_code = decision.reason_code;
  if (decision.clarification_needed?.length) {
    body.clarification_needed = decision.clarification_needed;
  }
  return body;
}

export function opaqueAgentHoneypot(requestId: string): AgentResponseBody {
  return agentResponse(requestId, {
    status: "accepted",
    reason_code: "in_service_area",
    next_step: nextStepFor("accepted", "in_service_area"),
    response_expectation: expectationFor("accepted"),
  });
}
