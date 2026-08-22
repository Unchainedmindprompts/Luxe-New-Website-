/**
 * Client identity for agent rate limits.
 *
 * Raw IPs are normalized, hashed, then discarded. Redis keys and logs may
 * only see the hash. IPv6 is bucketed to /64 so rotating the interface
 * identifier cannot bypass the limit.
 */

import { createHash } from "node:crypto";
import { ipAddress } from "@vercel/functions";

export const CONSULT_IP_HASH_NAMESPACE = "consult:ip:v1" as const;

export function parseIpv4(raw: string): string | null {
  const parts = raw.trim().split(".");
  if (parts.length !== 4) return null;
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const value = Number(part);
    if (!Number.isInteger(value) || value < 0 || value > 255) return null;
    octets.push(value);
  }
  return octets.join(".");
}

function expandIpv6Groups(raw: string): string[] | null {
  const noZone = raw.split("%")[0] ?? raw;
  if (noZone.includes(".")) return null;
  if ((noZone.match(/::/g) ?? []).length > 1) return null;

  const [head = "", tail = ""] = noZone.split("::");
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  if (headParts.some((part) => part === "") || tailParts.some((part) => part === "")) {
    return null;
  }

  const missing = 8 - headParts.length - tailParts.length;
  if (noZone.includes("::")) {
    if (missing < 0) return null;
  } else if (headParts.length !== 8) {
    return null;
  }

  const groups = noZone.includes("::")
    ? [...headParts, ...Array(missing).fill("0"), ...tailParts]
    : headParts;

  if (groups.length !== 8) return null;
  const normalized: string[] = [];
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/i.test(group)) return null;
    normalized.push(group.toLowerCase().padStart(4, "0"));
  }
  return normalized;
}

function ipv4MappedFromIpv6(raw: string): string | null {
  const noZone = raw.split("%")[0] ?? raw;
  const mapped = noZone.match(/^(?:(?:0:){0,5}|(?::)|(?:0:){0,4}:):?ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return parseIpv4(mapped[1]);

  const groups = expandIpv6Groups(noZone);
  if (!groups) return null;
  const isMapped =
    groups[0] === "0000" &&
    groups[1] === "0000" &&
    groups[2] === "0000" &&
    groups[3] === "0000" &&
    groups[4] === "0000" &&
    groups[5] === "ffff";
  if (!isMapped) return null;
  const hi = Number.parseInt(groups[6], 16);
  const lo = Number.parseInt(groups[7], 16);
  return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`;
}

/**
 * Canonical form used before hashing.
 * IPv4 → dotted decimal without leading zeros.
 * IPv6 → first 64 bits as eight-nibble hextets + "/64".
 */
export function normalizeClientIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const unwrapped = trimmed.replace(/^\[/, "").replace(/\]$/, "");

  const v4 = parseIpv4(unwrapped);
  if (v4) return v4;

  const mapped = ipv4MappedFromIpv6(unwrapped);
  if (mapped) return mapped;

  const groups = expandIpv6Groups(unwrapped);
  if (!groups) return null;
  return `${groups.slice(0, 4).join(":")}/64`;
}

export function hashNormalizedClientIp(normalized: string): string {
  return createHash("sha256")
    .update(`${CONSULT_IP_HASH_NAMESPACE}:${normalized}`)
    .digest("hex");
}

export function hashClientIp(raw: string | null | undefined): string | null {
  const normalized = normalizeClientIp(raw);
  if (!normalized) return null;
  return hashNormalizedClientIp(normalized);
}

/**
 * Official Vercel client-IP helper (`x-real-ip` on this runtime).
 * Returns only the hash. The raw IP never leaves this function.
 */
export function hashedClientIpFromRequest(request: Request): string | null {
  const raw = ipAddress(request);
  return hashClientIp(raw);
}

export function rateLimitRedisIdentifier(
  window: "hour" | "day",
  hashedId: string
): string {
  return `consult:rl:v1:${window}:${hashedId}`;
}
