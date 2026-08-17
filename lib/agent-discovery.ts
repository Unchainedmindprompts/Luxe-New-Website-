/**
 * Adapters over the internal truth files.
 *
 * `lib/offerings.ts` and `lib/capabilities.ts` emit nothing. That was
 * intentional: Schema.org, agent cards, OpenAPI and llms.txt are each a
 * decision about how to publish a fact, and publishing before the decision
 * is how a request becomes a booking and an evidenced manufacturer becomes
 * a catalogue. This module is that decision — the first consumer those
 * files were written to wait for.
 *
 * IT DOES NOT ADD FACTS. Every offering, manufacturer, capability field,
 * city and phone number here is read from a module that already owns it.
 * If a relationship is unestablished in `OFFERINGS`, it is unpublished
 * here. If `autonomousExecution` is `"not-ready"`, no adapter may say
 * otherwise. Widening a claim means editing the truth file, not this one.
 *
 * WHAT THIS IS NOT. It is not an A2A server, not an MCP server, not a
 * JSON-RPC endpoint, and not Ask Luxe. There is no execution interface
 * for an unattended agent. The consultation route exists; it is not ready
 * for machine traffic, and saying so is the point of publishing it.
 */
import { BUSINESS, PRODUCTS, SERVICE_AREAS } from "@/lib/constants";
import { CARRIED_BRANDS } from "@/lib/brands";
import { CITIES, NORTH_IDAHO_ID, cityPlaceId } from "@/lib/cities";
import {
  CAPABILITIES,
  type CapabilityId,
} from "@/lib/capabilities";
import {
  OFFERINGS,
  offeringServiceRef,
  type OfferingId,
} from "@/lib/offerings";

export const DISCOVERY_VERSION = "1.0.0";

const CONSULTATION = CAPABILITIES["request-in-home-consultation"];

const BRAND_BY_ID = Object.fromEntries(
  CARRIED_BRANDS.map((brand) => [brand["@id"], brand])
) as Record<(typeof CARRIED_BRANDS)[number]["@id"], (typeof CARRIED_BRANDS)[number]>;

function offeringName(id: OfferingId): string {
  if (id === "aluminum-shutters") return "Aluminum Shutters";
  const product = PRODUCTS.find((item) => item.slug === id);
  return product?.name ?? id;
}

function offeringPage(id: OfferingId): string | null {
  if (id === "aluminum-shutters") return null;
  return `${BUSINESS.url}/products/${id}`;
}

function manufacturerName(id: (typeof CARRIED_BRANDS)[number]["@id"]): string {
  return BRAND_BY_ID[id].name;
}

function hoursLine(): string {
  const open = BUSINESS.hours.filter((row) => row.open && row.close);
  const closed = BUSINESS.hours.filter((row) => !row.open);
  const weekdays = open
    .map((row) => `${row.day.slice(0, 3)} ${row.open}–${row.close}`)
    .join(", ");
  const rest = closed.map((row) => `${row.day} closed`).join(", ");
  return rest ? `${weekdays}; ${rest}` : weekdays;
}

export function offeringsDocument() {
  return {
    source: "lib/offerings.ts",
    note:
      "A join, not a catalogue. manufacturersEvidenced is empty when the " +
      "repository has not established the relationship — never when the " +
      "offering has no manufacturer. aluminum-shutters has no product " +
      "Service because it has no /products route.",
    offerings: (Object.keys(OFFERINGS) as OfferingId[]).map((id) => {
      const offering = OFFERINGS[id];
      const service = offeringServiceRef(id);
      return {
        id,
        name: offeringName(id),
        page: offeringPage(id),
        service: service ? service["@id"] : null,
        manufacturersEvidenced: offering.manufacturersEvidenced.map((manufacturerId) => ({
          "@id": manufacturerId,
          name: manufacturerName(manufacturerId),
        })),
        ...(offering.exclusive ? { exclusive: true as const } : {}),
      };
    }),
  };
}

export function capabilitiesDocument() {
  const id: CapabilityId = "request-in-home-consultation";
  const capability = CAPABILITIES[id];
  return {
    source: "lib/capabilities.ts",
    note:
      "A request asks. It does not schedule, reserve, hold or confirm. " +
      "A 2xx from the current surface means the endpoint took the " +
      "submission — not that Luxe received it, and not that a visit exists.",
    capabilities: [
      {
        id,
        summary: capability.summary,
        actionType: capability.actionType,
        outcome: capability.outcome,
        requiresHumanFollowUp: capability.requiresHumanFollowUp,
        input: capability.input,
        executionSurfaces: capability.executionSurfaces,
        humanSurfaces: [
          {
            path: "/book",
            url: `${BUSINESS.url}/book`,
            role: "human-scheduling-and-request",
            note:
              "People can pick a time in the Calendly embed, or submit the " +
              "fallback form. The form is a request. The embed is a " +
              "third-party scheduler, not an API this site exposes to agents.",
          },
          {
            path: "/contact",
            url: `${BUSINESS.url}/contact`,
            role: "human-request",
            note: "The contact form posts the same consultation request.",
          },
        ],
      },
    ],
  };
}

/**
 * Business discovery card. Replaces the hand-written public/agent.json,
 * which advertised a booking the contract does not model and assigned
 * manufacturers the offering registry has not established.
 *
 * Not an A2A Agent Card. A spec-compliant card requires a JSON-RPC `url`.
 * Publishing one without a server would be the same class of lie as
 * ReserveAction on a mailbox.
 */
export function agentCard() {
  const offerings = offeringsDocument().offerings;
  const capability = capabilitiesDocument().capabilities[0];

  return {
    schema_version: "1.1",
    protocol: "luxe-discovery",
    protocolVersion: DISCOVERY_VERSION,
    a2a: false,
    mcp: false,
    jsonrpc: false,
    name: BUSINESS.name,
    description:
      "Custom window treatment specialist in Post Falls, Idaho. Consultation, " +
      "product guidance, measurement, custom order, and professional " +
      "installation for North Idaho homes. There is no online checkout. " +
      "A consultation request is a request — it does not book a visit.",
    url: BUSINESS.url,
    entity: {
      business: `${BUSINESS.url}/#business`,
      owner: `${BUSINESS.url}/#owner`,
      website: `${BUSINESS.url}/#website`,
      region: NORTH_IDAHO_ID,
    },
    contact: {
      name: BUSINESS.ownerFullName,
      title: "Owner",
      phone: BUSINESS.phone,
      phoneE164: BUSINESS.phoneE164,
      email: BUSINESS.email,
      address: BUSINESS.address.full,
      hours: hoursLine(),
    },
    service_area: {
      region: { name: "North Idaho", "@id": NORTH_IDAHO_ID },
      cities: SERVICE_AREAS.map((area) => ({
        name: area.name,
        url: `${BUSINESS.url}/areas/${area.slug}`,
        "@id": cityPlaceId(area.name),
        county: CITIES[area.name]?.county.name ?? null,
      })),
    },
    capabilities: [
      {
        id: capability.id,
        name: "Request an in-home consultation",
        description: CONSULTATION.summary,
        actionType: capability.actionType,
        outcome: capability.outcome,
        requiresHumanFollowUp: capability.requiresHumanFollowUp,
        url: `${BUSINESS.url}/book`,
        type: "request",
        cost: "free",
        executionSurfaces: capability.executionSurfaces,
        humanSurfaces: capability.humanSurfaces,
      },
    ],
    offerings: offerings.map((offering) => ({
      id: offering.id,
      name: offering.name,
      url: offering.page,
      service: offering.service,
      manufacturersEvidenced: offering.manufacturersEvidenced.map((item) => item.name),
      ...(offering.exclusive ? { exclusive: true as const } : {}),
    })),
    manufacturers: CARRIED_BRANDS.map((brand) => ({
      "@id": brand["@id"],
      name: brand.name,
      url: brand.url,
    })),
    not_offered: [
      "online checkout",
      "autonomous booking or reservation",
      "Ask Luxe / conversational advisor",
      "A2A, MCP, or JSON-RPC execution",
    ],
    primary_cta: {
      label: "Request a Free Consultation",
      url: `${BUSINESS.url}/book`,
      description:
        "Request a free in-home consultation. Submitting the form does not " +
        "schedule a visit — Luxe follows up to arrange one. People who want " +
        "to pick a time themselves can use the Calendly embed on the same page.",
    },
    discovery: discoveryIndex().documents,
  };
}

export function discoveryIndex() {
  return {
    protocol: "luxe-discovery",
    protocolVersion: DISCOVERY_VERSION,
    a2a: false,
    mcp: false,
    jsonrpc: false,
    note:
      "Discovery documents only. There is no agent execution interface. " +
      "Do not treat POST /api/consultation as ready for unattended traffic.",
    documents: {
      agent: `${BUSINESS.url}/agent.json`,
      wellKnownAgent: `${BUSINESS.url}/.well-known/agent.json`,
      discovery: `${BUSINESS.url}/discovery.json`,
      wellKnownDiscovery: `${BUSINESS.url}/.well-known/discovery.json`,
      capabilities: `${BUSINESS.url}/capabilities.json`,
      offerings: `${BUSINESS.url}/offerings.json`,
      openapi: `${BUSINESS.url}/openapi.json`,
      llms: `${BUSINESS.url}/llms.txt`,
    },
  };
}

/**
 * Length ceilings copied from `app/api/consultation/route.ts` LIMITS.
 *
 * Duplicated on purpose, the same way `lib/capabilities.ts` duplicates
 * field names: exporting LIMITS would mean editing the hardened route,
 * which this phase does not do. The adapter audit fails the build if
 * these numbers stop matching the route.
 */
export const CONSULTATION_FIELD_LIMITS = {
  name: 100,
  firstName: 100,
  lastName: 100,
  phone: 30,
  email: 200,
  address: 200,
  city: 100,
  message: 2000,
  needs: 2000,
  contactMethod: 50,
  problem: 100,
  source: 50,
} as const;

export function openApiDocument() {
  const capability = CAPABILITIES["request-in-home-consultation"];
  const properties: Record<string, Record<string, unknown>> = {};
  const documented = [
    ...capability.input.identifiesCustomerBy,
    ...capability.input.required,
    ...capability.input.optional,
  ];
  const seen = new Set<string>();
  for (const field of documented) {
    if (seen.has(field)) continue;
    seen.add(field);
    const maxLength =
      CONSULTATION_FIELD_LIMITS[field as keyof typeof CONSULTATION_FIELD_LIMITS];
    properties[field] = {
      type: "string",
      maxLength,
    };
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "Luxe Window Works — consultation request",
      version: DISCOVERY_VERSION,
      description:
        "Documents the existing consultation request surface. This is a " +
        "REQUEST, not a booking. A 2xx means the endpoint acknowledged the " +
        "submission. It does not mean a visit is scheduled. Autonomous " +
        "execution is not-ready: do not call this from unattended agents.",
    },
    "x-action-type": capability.actionType,
    "x-outcome": capability.outcome,
    "x-requires-human-follow-up": capability.requiresHumanFollowUp,
    "x-autonomous-execution": "not-ready",
    "x-success-means": "submission-acknowledged-by-endpoint",
    servers: [{ url: BUSINESS.url }],
    paths: {
      "/api/consultation": {
        post: {
          operationId: "requestInHomeConsultation",
          summary: "Submit a consultation request",
          description: capability.summary,
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [...capability.input.required],
                  properties,
                  additionalProperties: false,
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Submission acknowledged by the endpoint. May also be the " +
                "honeypot path. Does not mean Luxe received an email or " +
                "that an appointment exists.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ok: { type: "boolean", const: true } },
                    required: ["ok"],
                  },
                },
              },
            },
            "400": {
              description: "Invalid or incomplete request.",
            },
            "500": {
              description: "The request could not be sent. Retry or call.",
            },
            "502": {
              description: "The mail provider rejected the send.",
            },
          },
        },
      },
    },
  };
}

export interface LlmsPost {
  slug: string;
  title: string;
}

export function llmsTxt(posts: readonly LlmsPost[]): string {
  const offerings = offeringsDocument().offerings;
  const cities = SERVICE_AREAS.map(
    (area) => `- [${area.name}, ID](${BUSINESS.url}/areas/${area.slug})`
  ).join("\n");
  const productLines = PRODUCTS.map(
    (product) => `- [${product.name}](${BUSINESS.url}/products/${product.slug})`
  ).join("\n");
  const offeringLines = offerings
    .map((offering) => {
      const brands =
        offering.manufacturersEvidenced.length > 0
          ? offering.manufacturersEvidenced.map((item) => item.name).join(", ")
          : "manufacturer relationship unestablished";
      const exclusive = offering.exclusive ? "; exclusive" : "";
      const page = offering.page ?? "no product page";
      return `- ${offering.name}: ${brands}${exclusive} (${page})`;
    })
    .join("\n");
  const blogLines = posts
    .map((post) => `- [${post.title}](${BUSINESS.url}/blog/${post.slug})`)
    .join("\n");

  return `# Luxe Window Works — Custom Window Treatments in Northern Idaho

> Custom blinds, shades, shutters, and motorized window treatments for North Idaho homes. Consultation-led: there is no online checkout. A consultation request is a request, not a booking.

Luxe Window Works is a custom window treatment business in Post Falls, Idaho, serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint. Owner ${BUSINESS.ownerFullName}. Every project begins with an in-home consultation; Luxe helps select the product, measures, prices the specific job, places the order, and installs it.

## What an agent can actually initiate

- **Request an in-home consultation** — ${CONSULTATION.summary}
- actionType: ${CONSULTATION.actionType} (not a booking)
- outcome: ${CONSULTATION.outcome}
- requiresHumanFollowUp: true
- autonomousExecution: not-ready — do not POST /api/consultation from unattended agents
- **Human surfaces:** ${BUSINESS.url}/book (Calendly embed + request form), ${BUSINESS.url}/contact
- **Not offered:** online checkout, autonomous reservation, Ask Luxe conversational advisor, A2A/MCP execution

## Discovery documents

- [Agent card](${BUSINESS.url}/agent.json)
- [Capabilities contract](${BUSINESS.url}/capabilities.json)
- [Offering relationships](${BUSINESS.url}/offerings.json)
- [OpenAPI (request surface)](${BUSINESS.url}/openapi.json)
- [Discovery index](${BUSINESS.url}/discovery.json)

## Core Pages

- [Homepage](${BUSINESS.url}/)
- [About](${BUSINESS.url}/about)
- [Blog](${BUSINESS.url}/blog)
- [Request a Free Consultation](${BUSINESS.url}/book)
- [Contact](${BUSINESS.url}/contact)
- [Window Treatment Glossary](${BUSINESS.url}/glossary)
- [Leave a Review](${BUSINESS.url}/leave-a-review)

## Products

${productLines}

## Service Areas

- [Service Areas — Overview](${BUSINESS.url}/areas)
${cities}

## Offerings and evidenced manufacturers

Empty manufacturer lists mean the relationship is unestablished in first-party copy, not that no manufacturer exists.

${offeringLines}

## Blog & Expert Content

${blogLines}

## Contact & Business Info

- Owner: ${BUSINESS.ownerFullName}
- Phone: ${BUSINESS.phone}
- Email: ${BUSINESS.email}
- Address: ${BUSINESS.address.full}
- Hours: ${hoursLine()}
- Entity graph: ${BUSINESS.url}/#business (Organization), ${BUSINESS.url}/#owner (Person)

## Authority Signals

- ${BUSINESS.experience} (career history belongs to the owner, not the 2025 LLC)
- ${BUSINESS.guarantee}
- Carried manufacturers: ${CARRIED_BRANDS.map((brand) => brand.name).join(", ")}
- Serving North Idaho homeowners from Post Falls
`;
}

export function jsonBody(data: unknown): string {
  return `${JSON.stringify(data, null, 2)}\n`;
}
