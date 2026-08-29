/**
 * Durable scheduling rate limits. Distinct prefixes from consult-request
 * so the two surfaces cannot collide. Thresholds stay internal.
 *
 * Official @upstash/ratelimit fail-open timeout is disabled (`timeout: 0`).
 */

import { Ratelimit } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";
import type { AgentRateLimiter, RateLimitDecision } from "./consult-rate-limit";

export const SCHEDULING_AGENT_HOURLY_LIMIT = 5;
export const SCHEDULING_AGENT_DAILY_LIMIT = 20;
export const SCHEDULING_AGENT_HOURLY_WINDOW = "1 h" as const;
export const SCHEDULING_AGENT_DAILY_WINDOW = "1 d" as const;
export const SCHEDULING_RL_HOUR_PREFIX = "sched:rl:v1:hour" as const;
export const SCHEDULING_RL_DAY_PREFIX = "sched:rl:v1:day" as const;

function retryAfterSeconds(resetAtMs: number, nowMs: number): number {
  return Math.max(1, Math.ceil((resetAtMs - nowMs) / 1000));
}

function interpretLimit(
  result: { success: boolean; reset: number; reason?: string },
  stage: string,
  nowMs: number
): RateLimitDecision {
  if (result.reason === "timeout") {
    return { kind: "unavailable", stage: `${stage}-timeout` };
  }
  if (!result.success) {
    return {
      kind: "limited",
      retryAfterSeconds: retryAfterSeconds(result.reset, nowMs),
    };
  }
  return { kind: "allowed" };
}

export function memorySchedulingRateLimiter(options?: {
  hourlyLimit?: number;
  dailyLimit?: number;
  now?: () => number;
}): AgentRateLimiter {
  const hourlyLimit = options?.hourlyLimit ?? SCHEDULING_AGENT_HOURLY_LIMIT;
  const dailyLimit = options?.dailyLimit ?? SCHEDULING_AGENT_DAILY_LIMIT;
  const now = options?.now ?? Date.now;
  const hourly = new Map<string, number[]>();
  const daily = new Map<string, number[]>();

  function consumeWindow(
    map: Map<string, number[]>,
    hashedId: string,
    limit: number,
    windowMs: number,
    at: number
  ): RateLimitDecision {
    const kept = (map.get(hashedId) ?? []).filter((stamp) => at - stamp < windowMs);
    if (kept.length >= limit) {
      const oldest = kept[0] ?? at;
      return {
        kind: "limited",
        retryAfterSeconds: retryAfterSeconds(oldest + windowMs, at),
      };
    }
    kept.push(at);
    map.set(hashedId, kept);
    return { kind: "allowed" };
  }

  return {
    async consume(hashedId) {
      if (!hashedId) {
        return { kind: "unavailable", stage: "rate-limit-missing-id" };
      }
      const at = now();
      const hour = consumeWindow(hourly, hashedId, hourlyLimit, 60 * 60 * 1000, at);
      if (hour.kind !== "allowed") return hour;
      return consumeWindow(daily, hashedId, dailyLimit, 24 * 60 * 60 * 1000, at);
    },
  };
}

export function createUpstashSchedulingRateLimiter(redis: Redis): AgentRateLimiter {
  const hourly = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      SCHEDULING_AGENT_HOURLY_LIMIT,
      SCHEDULING_AGENT_HOURLY_WINDOW
    ),
    prefix: SCHEDULING_RL_HOUR_PREFIX,
    analytics: false,
    timeout: 0,
    ephemeralCache: false,
    enableProtection: false,
  });
  const daily = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      SCHEDULING_AGENT_DAILY_LIMIT,
      SCHEDULING_AGENT_DAILY_WINDOW
    ),
    prefix: SCHEDULING_RL_DAY_PREFIX,
    analytics: false,
    timeout: 0,
    ephemeralCache: false,
    enableProtection: false,
  });

  return {
    async consume(hashedId) {
      if (!hashedId) {
        return { kind: "unavailable", stage: "rate-limit-missing-id" };
      }
      try {
        const hour = await hourly.limit(hashedId);
        const hourDecision = interpretLimit(hour, "rate-limit-hourly", Date.now());
        if (hourDecision.kind !== "allowed") return hourDecision;
        const day = await daily.limit(hashedId);
        return interpretLimit(day, "rate-limit-daily", Date.now());
      } catch {
        return { kind: "unavailable", stage: "rate-limit-error" };
      }
    },
  };
}
