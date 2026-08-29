/**
 * Durable scheduling idempotency.
 *
 * Redis keys are a namespace + SHA-256 of the agent key — never the raw key.
 * Records store a fingerprint of the sanitized canonical request, a non-PII
 * request_id, processing/completed state, and the public non-PII response
 * (including Calendly event/invitee URIs and cancel/reschedule links).
 * No raw request body or customer PII is written to Redis.
 */

import { createHash } from "node:crypto";
import type { Redis } from "@upstash/redis";
import { SCHEDULING_IDEMPOTENCY_NAMESPACE } from "./scheduling";
import {
  publicSchedulingBody,
  type SchedulingPublicResponse,
} from "./scheduling-validation";

export const SCHEDULING_IDEMPOTENCY_RECORD_VERSION = 1 as const;

export type SchedulingIdempotencyState = "processing" | "completed";

export interface StoredCalendlyCreation {
  readonly inviteeUri: string;
  readonly eventUri: string;
  readonly cancelUrl: string;
  readonly rescheduleUrl: string;
  readonly startTime: string;
  readonly timezone: string;
  readonly durationMinutes: number;
}

export interface CanonicalSchedulingFingerprintInput {
  readonly startTime: string;
  readonly customerName: string;
  readonly customerEmail: string;
  readonly customerTimezone: string;
  readonly customerConfirmed: boolean;
  readonly questionsAndAnswers: readonly { question: string; answer: string }[];
  readonly locationKind: string;
  readonly locationValue: string;
}

export interface StoredSchedulingIdempotencyRecord {
  readonly v: typeof SCHEDULING_IDEMPOTENCY_RECORD_VERSION;
  readonly request_id: string;
  readonly fingerprint: string;
  readonly state: SchedulingIdempotencyState;
  readonly publicResponse: SchedulingPublicResponse | null;
  readonly expiresAtMs: number;
  readonly createdInvitee?: StoredCalendlyCreation | null;
}

export type SchedulingIdempotencyClaimResult =
  | { kind: "claimed"; request_id: string }
  | { kind: "replay"; publicResponse: SchedulingPublicResponse }
  | { kind: "conflict" }
  | { kind: "in_progress" }
  | { kind: "needs_reconciliation"; record: StoredSchedulingIdempotencyRecord }
  | { kind: "unavailable"; stage: string };

export interface SchedulingIdempotencyStore {
  claim(input: {
    storageKey: string;
    fingerprint: string;
    requestId: string;
    nowMs: number;
    ttlSeconds: number;
  }): Promise<SchedulingIdempotencyClaimResult>;
  complete(
    storageKey: string,
    publicResponse: SchedulingPublicResponse,
    nowMs: number,
    ttlSeconds: number
  ): Promise<"ok" | "unavailable">;
  rememberCreatedInvitee(
    storageKey: string,
    input: {
      requestId: string;
      fingerprint: string;
      created: StoredCalendlyCreation;
      nowMs: number;
      ttlSeconds: number;
    }
  ): Promise<"ok" | "unavailable">;
  release(storageKey: string): Promise<"ok" | "unavailable">;
  inspect(storageKey: string): Promise<StoredSchedulingIdempotencyRecord | null>;
}

export function schedulingRequestFingerprint(
  input: CanonicalSchedulingFingerprintInput
): string {
  const canonical = {
    startTime: input.startTime,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerTimezone: input.customerTimezone,
    customerConfirmed: input.customerConfirmed,
    questionsAndAnswers: [...input.questionsAndAnswers]
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
      .sort((a, b) => a.question.localeCompare(b.question)),
    locationKind: input.locationKind,
    locationValue: input.locationValue,
  };
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function schedulingIdempotencyStorageKey(rawKey: string): string {
  const digest = createHash("sha256")
    .update(`${SCHEDULING_IDEMPOTENCY_NAMESPACE}:${rawKey}`)
    .digest("hex");
  return `${SCHEDULING_IDEMPOTENCY_NAMESPACE}:${digest}`;
}

function isCreatedInvitee(value: unknown): value is StoredCalendlyCreation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rec = value as StoredCalendlyCreation;
  return (
    typeof rec.inviteeUri === "string" &&
    rec.inviteeUri.length > 0 &&
    typeof rec.eventUri === "string" &&
    rec.eventUri.length > 0 &&
    typeof rec.cancelUrl === "string" &&
    rec.cancelUrl.length > 0 &&
    typeof rec.rescheduleUrl === "string" &&
    rec.rescheduleUrl.length > 0 &&
    typeof rec.startTime === "string" &&
    rec.startTime.length > 0 &&
    typeof rec.timezone === "string" &&
    rec.timezone.length > 0 &&
    typeof rec.durationMinutes === "number"
  );
}

function isStoredRecord(value: unknown): value is StoredSchedulingIdempotencyRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rec = value as StoredSchedulingIdempotencyRecord;
  return (
    rec.v === SCHEDULING_IDEMPOTENCY_RECORD_VERSION &&
    typeof rec.request_id === "string" &&
    rec.request_id.length > 0 &&
    typeof rec.fingerprint === "string" &&
    rec.fingerprint.length > 0 &&
    (rec.state === "processing" || rec.state === "completed") &&
    typeof rec.expiresAtMs === "number" &&
    (rec.publicResponse === null ||
      (typeof rec.publicResponse === "object" &&
        typeof rec.publicResponse.request_id === "string")) &&
    (rec.createdInvitee == null || isCreatedInvitee(rec.createdInvitee))
  );
}

function decideExisting(
  record: StoredSchedulingIdempotencyRecord,
  fingerprint: string,
  nowMs: number
): SchedulingIdempotencyClaimResult | null {
  if (record.expiresAtMs <= nowMs) return null;
  if (record.state === "processing") {
    if (record.createdInvitee) {
      return { kind: "needs_reconciliation", record };
    }
    return { kind: "in_progress" };
  }
  if (record.fingerprint !== fingerprint) return { kind: "conflict" };
  if (!record.publicResponse) {
    return { kind: "unavailable", stage: "idempotency-incomplete-record" };
  }
  return { kind: "replay", publicResponse: publicSchedulingBody(record.publicResponse) };
}

export function memorySchedulingIdempotencyStore(options?: {
  now?: () => number;
}): SchedulingIdempotencyStore {
  const map = new Map<string, StoredSchedulingIdempotencyRecord>();
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
        v: SCHEDULING_IDEMPOTENCY_RECORD_VERSION,
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
        publicResponse: publicSchedulingBody(publicResponse),
        expiresAtMs: nowMs + Math.min(remaining, ttlSeconds * 1000),
      });
      return "ok";
    },
    async rememberCreatedInvitee(storageKey, input) {
      const existing = map.get(storageKey);
      if (existing && existing.fingerprint !== input.fingerprint) {
        return "unavailable";
      }
      const expiresAtMs = existing
        ? existing.expiresAtMs
        : input.nowMs + input.ttlSeconds * 1000;
      map.set(storageKey, {
        v: SCHEDULING_IDEMPOTENCY_RECORD_VERSION,
        request_id: existing?.request_id ?? input.requestId,
        fingerprint: existing?.fingerprint ?? input.fingerprint,
        state: "processing",
        publicResponse: existing?.publicResponse ?? null,
        createdInvitee: input.created,
        expiresAtMs,
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

export function createRedisSchedulingIdempotencyStore(
  redis: Redis
): SchedulingIdempotencyStore {
  return {
    async claim({ storageKey, fingerprint, requestId, nowMs, ttlSeconds }) {
      const pending: StoredSchedulingIdempotencyRecord = {
        v: SCHEDULING_IDEMPOTENCY_RECORD_VERSION,
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
        if (!isStoredRecord(existing)) return "unavailable";
        const ttl = await redis.ttl(storageKey);
        const ex =
          typeof ttl === "number" && ttl > 0
            ? ttl
            : Math.max(
                1,
                Math.ceil((existing.expiresAtMs - nowMs) / 1000) || ttlSeconds
              );
        const completed: StoredSchedulingIdempotencyRecord = {
          ...existing,
          state: "completed",
          publicResponse: publicSchedulingBody(publicResponse),
        };
        await redis.set(storageKey, completed, { ex });
        return "ok";
      } catch {
        return "unavailable";
      }
    },
    async rememberCreatedInvitee(storageKey, input) {
      try {
        const existingRaw = await redis.get<unknown>(storageKey);
        const existing = isStoredRecord(existingRaw) ? existingRaw : null;
        if (existing && existing.fingerprint !== input.fingerprint) {
          return "unavailable";
        }
        const ttl = existing ? await redis.ttl(storageKey) : input.ttlSeconds;
        const ex =
          typeof ttl === "number" && ttl > 0
            ? ttl
            : Math.max(
                1,
                existing
                  ? Math.ceil((existing.expiresAtMs - input.nowMs) / 1000) ||
                      input.ttlSeconds
                  : input.ttlSeconds
              );
        const pending: StoredSchedulingIdempotencyRecord = {
          v: SCHEDULING_IDEMPOTENCY_RECORD_VERSION,
          request_id: existing?.request_id ?? input.requestId,
          fingerprint: existing?.fingerprint ?? input.fingerprint,
          state: "processing",
          publicResponse: existing?.publicResponse ?? null,
          createdInvitee: input.created,
          expiresAtMs: existing?.expiresAtMs ?? input.nowMs + input.ttlSeconds * 1000,
        };
        await redis.set(storageKey, pending, { ex });
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
