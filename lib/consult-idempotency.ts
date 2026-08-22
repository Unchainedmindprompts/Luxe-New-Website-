/**
 * Durable agent idempotency.
 *
 * Redis keys are a namespace + SHA-256 of the agent key — never the raw key.
 * Records store a fingerprint of the sanitized canonical request, a non-PII
 * request_id, processing/completed state, and the public response. No raw
 * request body or PII is written to Redis.
 */

import { createHash } from "node:crypto";
import type { Redis } from "@upstash/redis";
import {
  CONSULT_IDEMPOTENCY_NAMESPACE,
  CONSULT_IDEMPOTENCY_TTL_SECONDS,
} from "./capabilities";
import type { AgentResponseBody } from "./consult-validation";

export const CONSULT_IDEMPOTENCY_RECORD_VERSION = 1 as const;

export type IdempotencyState = "processing" | "completed";

export interface CanonicalConsultFingerprintInput {
  readonly name: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly city: string;
  readonly postalCode: string;
  readonly message: string;
  readonly preferredContactMethod: string;
  readonly intent: string;
  readonly contractVersion: string;
  readonly productInterests: readonly string[];
  readonly propertyType: string;
  readonly projectGoals: string;
  readonly timing: string;
  readonly windowCount: string;
  readonly accessNotes: string;
}

export interface StoredIdempotencyRecord {
  readonly v: typeof CONSULT_IDEMPOTENCY_RECORD_VERSION;
  readonly request_id: string;
  readonly fingerprint: string;
  readonly state: IdempotencyState;
  readonly publicResponse: AgentResponseBody | null;
  readonly expiresAtMs: number;
}

export type IdempotencyClaimResult =
  | { kind: "claimed"; request_id: string }
  | { kind: "replay"; publicResponse: AgentResponseBody }
  | { kind: "conflict" }
  | { kind: "in_progress" }
  | { kind: "unavailable"; stage: string };

export interface DurableIdempotencyStore {
  claim(input: {
    storageKey: string;
    fingerprint: string;
    requestId: string;
    nowMs: number;
    ttlSeconds: number;
  }): Promise<IdempotencyClaimResult>;
  complete(
    storageKey: string,
    publicResponse: AgentResponseBody,
    nowMs: number,
    ttlSeconds: number
  ): Promise<"ok" | "unavailable">;
  release(storageKey: string): Promise<"ok" | "unavailable">;
  inspect(storageKey: string): Promise<StoredIdempotencyRecord | null>;
}

export function consultRequestFingerprint(
  input: CanonicalConsultFingerprintInput
): string {
  const canonical = {
    name: input.name,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    message: input.message,
    preferredContactMethod: input.preferredContactMethod,
    intent: input.intent,
    contractVersion: input.contractVersion,
    productInterests: [...input.productInterests].slice().sort(),
    propertyType: input.propertyType,
    projectGoals: input.projectGoals,
    timing: input.timing,
    windowCount: input.windowCount,
    accessNotes: input.accessNotes,
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function idempotencyStorageKey(rawKey: string): string {
  const digest = createHash("sha256")
    .update(`${CONSULT_IDEMPOTENCY_NAMESPACE}:${rawKey}`)
    .digest("hex");
  return `${CONSULT_IDEMPOTENCY_NAMESPACE}:${digest}`;
}

export function consultEmailIdempotencyKey(rawKey: string): string {
  const digest = createHash("sha256")
    .update(`consult:email:v1:${rawKey}`)
    .digest("hex");
  return `consult-email-v1-${digest}`;
}

function isStoredRecord(value: unknown): value is StoredIdempotencyRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rec = value as StoredIdempotencyRecord;
  return (
    rec.v === CONSULT_IDEMPOTENCY_RECORD_VERSION &&
    typeof rec.request_id === "string" &&
    rec.request_id.length > 0 &&
    typeof rec.fingerprint === "string" &&
    rec.fingerprint.length > 0 &&
    (rec.state === "processing" || rec.state === "completed") &&
    typeof rec.expiresAtMs === "number" &&
    (rec.publicResponse === null ||
      (typeof rec.publicResponse === "object" &&
        typeof rec.publicResponse.request_id === "string"))
  );
}

function publicFromRecord(record: StoredIdempotencyRecord): AgentResponseBody | null {
  if (record.state !== "completed" || !record.publicResponse) return null;
  const body = record.publicResponse;
  return {
    request_id: body.request_id,
    status: body.status,
    next_step: body.next_step,
    contract_version: body.contract_version,
    ...(body.reason_code ? { reason_code: body.reason_code } : {}),
    ...(body.response_expectation
      ? { response_expectation: body.response_expectation }
      : {}),
    ...(body.clarification_needed
      ? { clarification_needed: body.clarification_needed }
      : {}),
  };
}

function decideExisting(
  record: StoredIdempotencyRecord,
  fingerprint: string,
  nowMs: number
): IdempotencyClaimResult | null {
  if (record.expiresAtMs <= nowMs) return null;
  if (record.state === "processing") return { kind: "in_progress" };
  if (record.fingerprint !== fingerprint) return { kind: "conflict" };
  const publicResponse = publicFromRecord(record);
  if (!publicResponse) return { kind: "unavailable", stage: "idempotency-incomplete-record" };
  return { kind: "replay", publicResponse };
}

export function memoryIdempotencyStore(options?: {
  now?: () => number;
}): DurableIdempotencyStore {
  const map = new Map<string, StoredIdempotencyRecord>();
  const clock = options?.now ?? Date.now;

  return {
    async claim({ storageKey, fingerprint, requestId, nowMs, ttlSeconds }) {
      const existing = map.get(storageKey);
      if (existing) {
        const decided = decideExisting(existing, fingerprint, nowMs);
        if (decided) return decided;
        map.delete(storageKey);
      }
      map.set(storageKey, {
        v: CONSULT_IDEMPOTENCY_RECORD_VERSION,
        request_id: requestId,
        fingerprint,
        state: "processing",
        publicResponse: null,
        expiresAtMs: nowMs + ttlSeconds * 1000,
      });
      return { kind: "claimed", request_id: requestId };
    },
    async complete(storageKey, publicResponse, nowMs, ttlSeconds) {
      const existing = map.get(storageKey);
      if (!existing) return "unavailable";
      const remaining = Math.max(1, existing.expiresAtMs - nowMs);
      map.set(storageKey, {
        ...existing,
        state: "completed",
        publicResponse,
        expiresAtMs: nowMs + Math.min(remaining, ttlSeconds * 1000),
      });
      return "ok";
    },
    async release(storageKey) {
      map.delete(storageKey);
      return "ok";
    },
    async inspect(storageKey) {
      const existing = map.get(storageKey);
      if (!existing) return null;
      if (existing.expiresAtMs <= clock()) {
        map.delete(storageKey);
        return null;
      }
      return existing;
    },
  };
}

export function createRedisIdempotencyStore(redis: Redis): DurableIdempotencyStore {
  return {
    async claim({ storageKey, fingerprint, requestId, nowMs, ttlSeconds }) {
      const pending: StoredIdempotencyRecord = {
        v: CONSULT_IDEMPOTENCY_RECORD_VERSION,
        request_id: requestId,
        fingerprint,
        state: "processing",
        publicResponse: null,
        expiresAtMs: nowMs + ttlSeconds * 1000,
      };
      try {
        const set = await redis.set(storageKey, pending, {
          nx: true,
          ex: ttlSeconds,
        });
        if (set === "OK") return { kind: "claimed", request_id: requestId };

        const existing = await redis.get<unknown>(storageKey);
        if (existing === null || existing === undefined) {
          return { kind: "unavailable", stage: "idempotency-claim-race" };
        }
        if (!isStoredRecord(existing)) {
          return { kind: "unavailable", stage: "idempotency-unexpected-record" };
        }
        return (
          decideExisting(existing, fingerprint, nowMs) ?? {
            kind: "unavailable",
            stage: "idempotency-expired-during-claim",
          }
        );
      } catch {
        return { kind: "unavailable", stage: "idempotency-claim-error" };
      }
    },
    async complete(storageKey, publicResponse, nowMs, ttlSeconds) {
      try {
        const existing = await redis.get<unknown>(storageKey);
        if (!isStoredRecord(existing)) {
          return "unavailable";
        }
        const ttl = await redis.ttl(storageKey);
        const ex =
          typeof ttl === "number" && ttl > 0
            ? ttl
            : Math.max(1, Math.ceil((existing.expiresAtMs - nowMs) / 1000) || ttlSeconds);
        const completed: StoredIdempotencyRecord = {
          ...existing,
          state: "completed",
          publicResponse,
        };
        await redis.set(storageKey, completed, { ex });
        return "ok";
      } catch {
        return "unavailable";
      }
    },
    async release(storageKey) {
      try {
        await redis.del(storageKey);
        return "ok";
      } catch {
        return "unavailable";
      }
    },
    async inspect(storageKey) {
      try {
        const existing = await redis.get<unknown>(storageKey);
        return isStoredRecord(existing) ? existing : null;
      } catch {
        return null;
      }
    },
  };
}

export { CONSULT_IDEMPOTENCY_TTL_SECONDS };
