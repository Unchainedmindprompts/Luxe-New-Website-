/**
 * HTTP-facing discovery documents with host-aware absolute URLs.
 *
 * Internal contracts in lib/scheduling.ts and lib/capabilities.ts keep
 * root-relative paths. This module does not invent a second catalogue — it
 * prefixes those same paths with the current discovery origin.
 */

import {
  CONSULT_DISCOVERY_PATH,
  SCHEDULING_DISCOVERY_PATH,
  consultationDiscoveryDocument,
} from "./capabilities";
import {
  PRODUCTION_DISCOVERY_ORIGIN,
  absoluteDiscoveryUrl,
} from "./discovery-origin";
import { LLMS_TEMPLATE } from "./llms-text";
import { schedulingDiscoveryDocument } from "./scheduling";

const AGENT_JSON_PATH = "/agent.json";

const DISCOVERY_CHAIN_PATHS = [
  AGENT_JSON_PATH,
  CONSULT_DISCOVERY_PATH,
  SCHEDULING_DISCOVERY_PATH,
] as const;

function abs(origin: string, path: string): string {
  return absoluteDiscoveryUrl(origin, path);
}

export function publicSchedulingDiscoveryDocument(origin: string) {
  const doc = schedulingDiscoveryDocument();
  return {
    ...doc,
    discoveryUrl: abs(origin, doc.discoveryUrl),
    execution: {
      ...doc.execution,
      availability: {
        ...doc.execution.availability,
        url: abs(origin, doc.execution.availability.url),
      },
      booking: {
        ...doc.execution.booking,
        url: abs(origin, doc.execution.booking.url),
      },
    },
    customQuestions: {
      ...doc.customQuestions,
      retrieveFrom: abs(origin, doc.customQuestions.retrieveFrom),
    },
    consultationRequestFallback: {
      ...doc.consultationRequestFallback,
      discoveryUrl: abs(origin, doc.consultationRequestFallback.discoveryUrl),
      executionUrl: abs(origin, doc.consultationRequestFallback.executionUrl),
    },
  };
}

export function publicConsultationDiscoveryDocument(origin: string) {
  const doc = consultationDiscoveryDocument();
  return {
    ...doc,
    discoveryUrl: abs(origin, doc.discoveryUrl),
    execution: {
      ...doc.execution,
      url: abs(origin, doc.execution.url),
    },
    relatedScheduling: {
      ...doc.relatedScheduling,
      discoveryUrl: abs(origin, doc.relatedScheduling.discoveryUrl),
      availabilityUrl: abs(origin, doc.relatedScheduling.availabilityUrl),
      bookingUrl: abs(origin, doc.relatedScheduling.bookingUrl),
    },
  };
}

export function rewriteLlmsDiscoveryUrls(template: string, origin: string): string {
  let out = template;
  for (const path of DISCOVERY_CHAIN_PATHS) {
    const productionUrl = `${PRODUCTION_DISCOVERY_ORIGIN}${path}`;
    const hostedUrl = abs(origin, path);
    out = out.split(productionUrl).join(hostedUrl);
  }
  return out;
}

export function llmsTextForOrigin(origin: string, template: string = LLMS_TEMPLATE): string {
  return rewriteLlmsDiscoveryUrls(template, origin);
}
