/**
 * Machine-readable /agent.json, derived from the capability registry.
 *
 * This is not a second catalogue. Scheduling and consultation-request URLs
 * come from lib/capabilities.ts. Scheduling readiness flags come from
 * schedulingDiscoveryDocument() so /agent.json cannot claim live booking
 * when the detailed discovery document is not-ready. Only those
 * agent-facing URLs are host-aware. Business identity, product pages, and
 * the human /book page stay on https://www.luxewindowworks.com.
 */

import {
  CONSULT_DISCOVERY_PATH,
  CONSULT_EXECUTION_PATH,
  CONSULT_READINESS,
  SCHEDULING_AVAILABILITY_PATH,
  SCHEDULING_BOOKING_PATH,
  SCHEDULING_DISCOVERY_PATH,
  isConsultAgentSubmissionEnabled,
} from "./capabilities";
import {
  PRODUCTION_DISCOVERY_ORIGIN,
  absoluteDiscoveryUrl,
} from "./discovery-origin";
import {
  SCHEDULING_READINESS_NOT_READY,
  schedulingDiscoveryDocument,
} from "./scheduling";

function discoveryUrl(origin: string, path: string): string {
  return absoluteDiscoveryUrl(origin, path);
}

export function agentDiscoveryDocument(origin: string) {
  const enabled = isConsultAgentSubmissionEnabled();
  const scheduling = schedulingDiscoveryDocument();
  const schedulingReady =
    scheduling.configured &&
    scheduling.submissionEnabled &&
    scheduling.directBookingAvailable &&
    scheduling.readiness !== SCHEDULING_READINESS_NOT_READY;
  return {
    schema_version: "1.0",
    name: "Luxe Window Works",
    description:
      "Custom window treatment specialist serving Northern Idaho. Custom blinds, shades, shutters, and motorized window coverings with lifetime installation guarantee.",
    url: PRODUCTION_DISCOVERY_ORIGIN,
    contact: {
      name: "Mark Abplanalp",
      title: "Owner & Window Treatment Specialist",
      phone: "(208) 660-8643",
      address: "2972 N Pavo Ln, Post Falls, ID 83854",
      hours: "Mon-Fri 9am-5pm, Sat 9am-2pm",
      service_area: [
        "Coeur d'Alene, ID",
        "Post Falls, ID",
        "Hayden, ID",
        "Hayden Lake, ID",
        "Rathdrum, ID",
        "Sandpoint, ID",
        "Kootenai County, ID",
        "Northern Idaho",
        "Inland Northwest",
      ],
    },
    capabilities: [
      {
        name: "Schedule an in-home consultation",
        description: schedulingReady
          ? "Direct Calendly scheduling for a free in-home consultation. The customer must explicitly confirm the appointment time. This schedules a consultation, not product installation. Consultation-request remains the fallback. Humans: /book."
          : "Direct Calendly scheduling for a free in-home consultation exists, but it is not configured in this environment. Do not claim a time is booked. Read the discovery document. Use the consultation-request fallback. Humans: /book.",
        url: discoveryUrl(origin, SCHEDULING_DISCOVERY_PATH),
        availability_url: discoveryUrl(origin, SCHEDULING_AVAILABILITY_PATH),
        execution_url: discoveryUrl(origin, SCHEDULING_BOOKING_PATH),
        type: "schedule",
        direct_booking: schedulingReady,
        submission_enabled: schedulingReady,
        requires_human_confirmation: true,
        pricing_available: false,
        readiness: scheduling.readiness,
        cost: "free",
      },
      {
        name: "Request an in-home consultation",
        description:
          "Structured consultation-request contract. Agent submission delivers a request for human follow-up. It does not book, reserve, or price a visit. Direct scheduling is available through the sibling scheduling capability when that discovery document reports the Calendly integration is configured. This request path remains the fallback. Humans can still use /contact or /book.",
        url: discoveryUrl(origin, CONSULT_DISCOVERY_PATH),
        execution_url: discoveryUrl(origin, CONSULT_EXECUTION_PATH),
        type: "request",
        direct_booking: false,
        pricing_available: false,
        requires_human_follow_up: true,
        submission_enabled: enabled,
        readiness: CONSULT_READINESS,
        cost: "free",
      },
      {
        name: "Custom Blinds & Shades",
        description:
          "Custom-fitted cellular, roller, solar, roman, and banded shades for any window size or shape including arches, skylights, and specialty angles.",
        url: `${PRODUCTION_DISCOVERY_ORIGIN}/`,
        type: "service",
      },
      {
        name: "Motorization & Smart Home Integration",
        description:
          "Professional motorized shade installation with Bond Bridge Pro and smart home scene automation. Solves RF signal issues in large homes.",
        url: `${PRODUCTION_DISCOVERY_ORIGIN}/products/motorization`,
        type: "service",
      },
      {
        name: "Plantation Shutters",
        description:
          "Premium custom plantation shutters for light control, privacy, and home value.",
        url: `${PRODUCTION_DISCOVERY_ORIGIN}/products/shutters`,
        type: "service",
      },
      {
        name: "Energy Efficiency Consultation",
        description:
          "Cellular honeycomb shades that reduce energy costs up to 20% with R-values up to 7.86. Expert advice on energy-efficient window treatments for Northern Idaho climate.",
        url: `${PRODUCTION_DISCOVERY_ORIGIN}/products/cellular-shades`,
        type: "service",
      },
    ],
    expertise: [
      "Custom Window Treatments",
      "Motorized Shades",
      "Smart Home Integration",
      "Cellular Honeycomb Shades",
      "Energy Efficient Window Coverings",
      "Plantation Shutters",
      "Child-Safe Cordless Blinds",
      "Bond Bridge Pro Installation",
      "Northern Idaho Window Treatments",
      "Coeur d'Alene Blinds and Shades",
    ],
    differentiators: [
      "24 years industry expertise",
      "Lifetime installation guarantee",
      "Direct manufacturer relationships",
      "Local Post Falls business",
      "No-pressure consultation approach",
      "Smart home motorization specialist",
    ],
    manufacturer_partners: [
      {
        name: "Norman USA",
        url: "https://www.normanwindowfashions.com",
        products: [
          "Faux Wood Blinds",
          "Cellular Shades",
          "Shutters",
          "Roller Shades",
          "Roman Shades",
          "Banded Shades",
          "Motorized Shades",
        ],
        available_in_home: true,
      },
      {
        name: "Lafayette Interior Fashions",
        products: [
          "Allure Transitional Shades",
          "Roman Shades",
          "Roller Shades",
          "Cellular Shades",
        ],
        available_online: false,
        available_in_home: true,
      },
      {
        name: "Corradi USA",
        products: ["Exterior Solar Shades", "Patio Screens"],
        available_online: false,
        available_in_home: true,
      },
      {
        name: "Alta",
        products: ["Window Fashions"],
        available_online: false,
        available_in_home: true,
      },
      {
        name: "The Window Outfitters",
        products: ["Specialty Window Treatments"],
        available_online: false,
        available_in_home: true,
      },
    ],
    primary_cta: {
      label: "Schedule a Free In-Home Consultation",
      url: discoveryUrl(origin, SCHEDULING_DISCOVERY_PATH),
      human_url: `${PRODUCTION_DISCOVERY_ORIGIN}/book`,
      fallback_url: discoveryUrl(origin, CONSULT_DISCOVERY_PATH),
      description: schedulingReady
        ? "Discovery document for direct Calendly scheduling. The customer must confirm the time. A successful Calendly booking is a booked consultation. Consultation-request remains the fallback. Humans: /book."
        : "Scheduling exists but is not ready in this environment. Do not claim a time is booked. Read the discovery document. Use the consultation-request fallback. Humans: /book.",
    },
  };
}
