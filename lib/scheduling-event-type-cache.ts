/**
 * Event-type metadata and questions, cached separately from available times.
 *
 * Availability never lists or rediscovers event types. The configured
 * CALENDLY_EVENT_TYPE_URI is loaded with GET /event_types/{uuid} and stored
 * here so a later available-times fetch does not repeat that read.
 * Never stores customer PII, tokens, or request bodies.
 */

import { createHash } from "node:crypto";
import type { Redis } from "@upstash/redis";
import type { CalendlyCustomQuestion, CalendlyEventType } from "./calendly-client";

export const SCHEDULING_EVENT_TYPE_CACHE_TTL_SECONDS = 15 * 60;
export const SCHEDULING_EVENT_TYPE_META_PREFIX = "sched:etype:meta:v1" as const;
export const SCHEDULING_EVENT_TYPE_QUESTIONS_PREFIX = "sched:etype:questions:v1" as const;

export interface CachedEventTypeMetadata {
  readonly uri: string;
  readonly name: string;
  readonly active?: boolean;
  readonly slug?: string;
  readonly scheduling_url?: string;
  readonly duration?: number;
  readonly locations?: CalendlyEventType["locations"];
  readonly location_configurations?: CalendlyEventType["location_configurations"];
}

export interface CachedEventTypeQuestions {
  readonly custom_questions: readonly CalendlyCustomQuestion[];
}

export interface SchedulingEventTypeCache {
  getMetadata(eventTypeUri: string): Promise<CachedEventTypeMetadata | null>;
  setMetadata(
    eventTypeUri: string,
    value: CachedEventTypeMetadata,
    ttlSeconds: number
  ): Promise<void>;
  getQuestions(eventTypeUri: string): Promise<CachedEventTypeQuestions | null>;
  setQuestions(
    eventTypeUri: string,
    value: CachedEventTypeQuestions,
    ttlSeconds: number
  ): Promise<void>;
}

export function eventTypeCacheKey(eventTypeUri: string): string {
  return createHash("sha256").update(`v1|${eventTypeUri}`).digest("hex");
}

export function eventTypeFromCaches(
  metadata: CachedEventTypeMetadata,
  questions: CachedEventTypeQuestions
): CalendlyEventType {
  return {
    uri: metadata.uri,
    name: metadata.name,
    active: metadata.active,
    slug: metadata.slug,
    scheduling_url: metadata.scheduling_url,
    duration: metadata.duration,
    custom_questions: questions.custom_questions,
    locations: metadata.locations,
    location_configurations: metadata.location_configurations,
  };
}

export function metadataFromEventType(eventType: CalendlyEventType): CachedEventTypeMetadata {
  return {
    uri: eventType.uri,
    name: eventType.name,
    active: eventType.active,
    slug: eventType.slug,
    scheduling_url: eventType.scheduling_url,
    duration: eventType.duration,
    locations: eventType.locations,
    location_configurations: eventType.location_configurations,
  };
}

export function questionsFromEventType(eventType: CalendlyEventType): CachedEventTypeQuestions {
  return { custom_questions: eventType.custom_questions ?? [] };
}

function isMetadata(value: unknown): value is CachedEventTypeMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rec = value as CachedEventTypeMetadata;
  return typeof rec.uri === "string" && rec.uri.length > 0 && typeof rec.name === "string";
}

function isQuestions(value: unknown): value is CachedEventTypeQuestions {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rec = value as CachedEventTypeQuestions;
  return Array.isArray(rec.custom_questions);
}

export function memorySchedulingEventTypeCache(): SchedulingEventTypeCache {
  const metadata = new Map<string, { value: CachedEventTypeMetadata; expiresAtMs: number }>();
  const questions = new Map<string, { value: CachedEventTypeQuestions; expiresAtMs: number }>();
  const read = <T,>(
    map: Map<string, { value: T; expiresAtMs: number }>,
    key: string
  ): T | null => {
    const row = map.get(key);
    if (!row) return null;
    if (row.expiresAtMs <= Date.now()) {
      map.delete(key);
      return null;
    }
    return row.value;
  };
  return {
    async getMetadata(eventTypeUri) {
      return read(metadata, eventTypeCacheKey(eventTypeUri));
    },
    async setMetadata(eventTypeUri, value, ttlSeconds) {
      metadata.set(eventTypeCacheKey(eventTypeUri), {
        value,
        expiresAtMs: Date.now() + ttlSeconds * 1000,
      });
    },
    async getQuestions(eventTypeUri) {
      return read(questions, eventTypeCacheKey(eventTypeUri));
    },
    async setQuestions(eventTypeUri, value, ttlSeconds) {
      questions.set(eventTypeCacheKey(eventTypeUri), {
        value,
        expiresAtMs: Date.now() + ttlSeconds * 1000,
      });
    },
  };
}

export function createRedisSchedulingEventTypeCache(redis: Redis): SchedulingEventTypeCache {
  const metaKey = (uri: string) =>
    `${SCHEDULING_EVENT_TYPE_META_PREFIX}:${eventTypeCacheKey(uri)}`;
  const questionsKey = (uri: string) =>
    `${SCHEDULING_EVENT_TYPE_QUESTIONS_PREFIX}:${eventTypeCacheKey(uri)}`;
  return {
    async getMetadata(eventTypeUri) {
      try {
        const raw = await redis.get<CachedEventTypeMetadata | string>(metaKey(eventTypeUri));
        if (!raw) return null;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return isMetadata(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    async setMetadata(eventTypeUri, value, ttlSeconds) {
      try {
        await redis.set(metaKey(eventTypeUri), value, { ex: ttlSeconds });
      } catch {
        // Cache writes are optional.
      }
    },
    async getQuestions(eventTypeUri) {
      try {
        const raw = await redis.get<CachedEventTypeQuestions | string>(
          questionsKey(eventTypeUri)
        );
        if (!raw) return null;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return isQuestions(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    async setQuestions(eventTypeUri, value, ttlSeconds) {
      try {
        await redis.set(questionsKey(eventTypeUri), value, { ex: ttlSeconds });
      } catch {
        // Cache writes are optional.
      }
    },
  };
}
