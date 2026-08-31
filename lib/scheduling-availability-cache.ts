/**
 * Short availability cache. Keyed by the requested UTC window only.
 * Stores public non-PII slots and event-type metadata. Never stores
 * customer names, emails, phones, addresses, or request bodies.
 *
 * A cache hit must not call Calendly. Cache failures are treated as a miss
 * so a Redis hiccup does not invent slots or retry Calendly.
 */

import { createHash } from "node:crypto";
import type { Redis } from "@upstash/redis";
import type { PublicAvailableSlot } from "./scheduling-validation";

export const SCHEDULING_AVAILABILITY_CACHE_TTL_SECONDS = 45;
export const SCHEDULING_AVAILABILITY_CACHE_PREFIX = "sched:avail:cache:v1" as const;

export interface CachedAvailability {
  readonly window: { readonly start_time: string; readonly end_time: string };
  readonly event_type: Record<string, unknown>;
  readonly slots: readonly PublicAvailableSlot[];
  readonly provider: "calendly";
}

export interface SchedulingAvailabilityCache {
  get(key: string): Promise<CachedAvailability | null>;
  set(key: string, value: CachedAvailability, ttlSeconds: number): Promise<void>;
}

export function availabilityCacheKey(startTime: string, endTime: string): string {
  return createHash("sha256").update(`v1|${startTime}|${endTime}`).digest("hex");
}

export function memorySchedulingAvailabilityCache(): SchedulingAvailabilityCache {
  const map = new Map<string, { value: CachedAvailability; expiresAtMs: number }>();
  return {
    async get(key) {
      const row = map.get(key);
      if (!row) return null;
      if (row.expiresAtMs <= Date.now()) {
        map.delete(key);
        return null;
      }
      return row.value;
    },
    async set(key, value, ttlSeconds) {
      map.set(key, {
        value,
        expiresAtMs: Date.now() + ttlSeconds * 1000,
      });
    },
  };
}

export function createRedisSchedulingAvailabilityCache(
  redis: Redis
): SchedulingAvailabilityCache {
  const namespaced = (key: string) => `${SCHEDULING_AVAILABILITY_CACHE_PREFIX}:${key}`;
  return {
    async get(key) {
      try {
        const raw = await redis.get<CachedAvailability | string>(namespaced(key));
        if (!raw) return null;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!parsed || typeof parsed !== "object") return null;
        if (!Array.isArray(parsed.slots) || !parsed.window) return null;
        return parsed as CachedAvailability;
      } catch {
        return null;
      }
    },
    async set(key, value, ttlSeconds) {
      try {
        await redis.set(namespaced(key), value, { ex: ttlSeconds });
      } catch {
        // Cache writes are optional. Do not retry Calendly.
      }
    },
  };
}
