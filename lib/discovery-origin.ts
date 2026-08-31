/**
 * Public origin for agent discovery URLs.
 *
 * Static /agent.json used to hardcode https://www.luxewindowworks.com. On a
 * Vercel Preview that sent outside agents to production, where the new
 * scheduling routes do not exist yet. Discovery documents are therefore
 * host-aware: Preview publishes the request origin; production keeps www.
 *
 * Canonical Schema.org @ids stay on the production host. This module only
 * rewrites agent-facing capability, availability, and execution URLs.
 */

export const PRODUCTION_DISCOVERY_ORIGIN = "https://www.luxewindowworks.com" as const;

const PRODUCTION_HOSTNAMES = new Set(["www.luxewindowworks.com", "luxewindowworks.com"]);

export interface DiscoveryOriginInput {
  readonly host?: string | null;
  readonly forwardedHost?: string | null;
  readonly forwardedProto?: string | null;
  readonly vercelEnv?: string | null;
  readonly vercelUrl?: string | null;
  readonly vercelBranchUrl?: string | null;
}

function firstHeaderValue(value: string | null | undefined): string {
  return (value ?? "").split(",")[0]?.trim() ?? "";
}

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function resolveDiscoveryOrigin(input: DiscoveryOriginInput = {}): string {
  const vercelEnv = input.vercelEnv ?? process.env.VERCEL_ENV ?? "";
  if (vercelEnv === "production") {
    return PRODUCTION_DISCOVERY_ORIGIN;
  }

  const rawHost = firstHeaderValue(input.forwardedHost) || firstHeaderValue(input.host);
  if (rawHost) {
    const hostname = rawHost.replace(/:\d+$/, "").toLowerCase();
    if (PRODUCTION_HOSTNAMES.has(hostname)) {
      return PRODUCTION_DISCOVERY_ORIGIN;
    }
    const proto =
      firstHeaderValue(input.forwardedProto).toLowerCase() ||
      (hostname === "localhost" || hostname === "127.0.0.1" ? "http" : "https");
    const scheme = proto === "http" ? "http" : "https";
    return `${scheme}://${rawHost}`;
  }

  const official =
    input.vercelBranchUrl ||
    input.vercelUrl ||
    process.env.VERCEL_BRANCH_URL ||
    process.env.VERCEL_URL ||
    "";
  if (official) {
    return `https://${stripProtocol(official)}`;
  }

  return PRODUCTION_DISCOVERY_ORIGIN;
}

export function discoveryOriginFromRequest(request: Request): string {
  let fallbackHost = "";
  let fallbackProto = "";
  try {
    const url = new URL(request.url);
    fallbackHost = url.host;
    fallbackProto = url.protocol.replace(":", "");
  } catch {
    // request.url is not required when forwarded headers are present
  }

  return resolveDiscoveryOrigin({
    host: request.headers.get("host") ?? fallbackHost,
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto") ?? fallbackProto,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
  });
}

export function absoluteDiscoveryUrl(origin: string, path: string): string {
  if (!path.startsWith("/")) {
    throw new Error("discovery path must be root-relative");
  }
  return `${origin.replace(/\/+$/, "")}${path}`;
}

export function discoveryResponseHeaders(): HeadersInit {
  return {
    "Cache-Control": "public, max-age=60",
    Vary: "Host, X-Forwarded-Host, X-Forwarded-Proto",
  };
}
