/**
 * Lazy Upstash Redis for consultation controls.
 *
 * Uses the Vercel Marketplace variable names already provisioned on the
 * project. `Redis.fromEnv()` reads KV_REST_API_URL + KV_REST_API_TOKEN.
 * The client is created only when those names have non-empty values so
 * `next build` and pure local tests do not fail.
 *
 * Never log or return secret values.
 */

import { Redis } from "@upstash/redis";

export const CONSULT_REDIS_URL_ENV = "KV_REST_API_URL" as const;
export const CONSULT_REDIS_TOKEN_ENV = "KV_REST_API_TOKEN" as const;

export const CONSULT_REDIS_ENV_NAMES = [
  CONSULT_REDIS_URL_ENV,
  CONSULT_REDIS_TOKEN_ENV,
] as const;

let _redis: Redis | null | undefined;

function envString(name: string): string | undefined {
  const value = process.env[name];
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

export function consultRedisEnvAvailable(): boolean {
  return Boolean(envString(CONSULT_REDIS_URL_ENV) && envString(CONSULT_REDIS_TOKEN_ENV));
}

export function consultRedisEnvNamesPresent(): readonly string[] {
  return CONSULT_REDIS_ENV_NAMES.filter((name) => envString(name));
}

export function consultRedisMissingEnvNames(): readonly string[] {
  return CONSULT_REDIS_ENV_NAMES.filter((name) => !envString(name));
}

export function getConsultRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  if (!consultRedisEnvAvailable()) {
    _redis = null;
    return null;
  }
  _redis = Redis.fromEnv();
  return _redis;
}

/** Test-only. Production must not call this. */
export function resetConsultRedisForTests(): void {
  _redis = undefined;
}
