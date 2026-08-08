/**
 * Luxe Window Advisor — input limits and abuse control. (Phase B)
 *
 * Pure functions, deliberately separate from the route, so the limits are
 * exercised by the test harness rather than only reachable over HTTP. An
 * abuse control nobody tests is a comment.
 *
 * WHAT THESE ACTUALLY GUARANTEE. The size and turn limits are exact: they are
 * computed from the request in front of us and hold on every instance. The rate
 * limiter is not — see `recordAndCheckRate`.
 */
import type { AdvisorErrorCode } from "./types";

/** A homeowner describing a room does not need more than this. */
export const MAX_MESSAGE_CHARS = 2000;
/** Whole-payload ceiling, checked before parsing. */
export const MAX_BODY_BYTES = 32_000;
/** Requests per fingerprint per window, per instance. */
export const RATE_LIMIT_REQUESTS = 20;
export const RATE_LIMIT_WINDOW_MS = 60_000;
/** Bounds the limiter's own memory footprint. */
export const RATE_LIMIT_MAX_KEYS = 5_000;

export interface RequestShape {
  readonly bodyBytes: number;
  readonly message: unknown;
  readonly turnCount: unknown;
  readonly maxTurns: number;
}

/**
 * The first thing every request goes through. Returns the error code to reject
 * with, or null to proceed.
 *
 * Order matters: size is checked before content so an oversized payload is
 * rejected without being parsed, and the turn cap is checked before any model
 * call so a long conversation cannot keep spending.
 */
export function checkRequestLimits(input: RequestShape): AdvisorErrorCode | null {
  if (input.bodyBytes > MAX_BODY_BYTES) return "payload-too-large";

  if (typeof input.message !== "string" || !input.message.trim()) return "message-required";
  if (input.message.length > MAX_MESSAGE_CHARS) return "message-too-long";

  const turns = typeof input.turnCount === "number" ? Math.trunc(input.turnCount) : 0;
  if (Number.isFinite(turns) && turns >= input.maxTurns) return "conversation-limit-reached";

  return null;
}

export interface RateDecision {
  readonly history: readonly number[];
  readonly limited: boolean;
}

/**
 * Sliding-window counter over one fingerprint's request timestamps.
 *
 * THIS IS NOT A GLOBAL RATE LIMIT, and the docs say so plainly. Each serverless
 * instance holds its own history, so a caller spread across instances gets a
 * multiple of the allowance, and a cold start resets it. It is a cheap brake on
 * the obvious case — one client hammering one instance — chosen because the
 * brief rules out a database or Redis for V1.
 *
 * The limits that genuinely hold everywhere are the exact ones above: payload
 * size, message length, and turns per conversation. A distributed limit needs
 * infrastructure and is deferred rather than faked.
 */
export function recordAndCheckRate(
  history: readonly number[],
  now: number,
  limit: number = RATE_LIMIT_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): RateDecision {
  const live = history.filter((t) => now - t < windowMs);
  live.push(now);
  return { history: live, limited: live.length > limit };
}
