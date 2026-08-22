#!/usr/bin/env node
/**
 * Preview-only verification of the REAL Redis-backed consult adapters.
 *
 * Runs only when VERCEL_ENV === "preview". Local and Production skip (exit 0).
 * Preview missing vars or a failed Redis op fails the deployment (exit 1).
 *
 * Never prints secret values, Redis URLs, tokens, raw IPs, PII, or stored
 * values. Never POSTs /api/consultation. Never sends email or imports Resend.
 */
import { createHash, randomUUID } from "node:crypto";
import { CONSULT_CONTRACT_VERSION } from "../lib/capabilities.ts";
import {
  CONSULT_AGENT_HOURLY_LIMIT,
  CONSULT_RL_DAY_PREFIX,
  CONSULT_RL_HOUR_PREFIX,
  createUpstashAgentRateLimiter,
} from "../lib/consult-rate-limit.ts";
import { createRedisIdempotencyStore } from "../lib/consult-idempotency.ts";
import {
  CONSULT_REDIS_ENV_NAMES,
  consultRedisEnvAvailable,
  consultRedisMissingEnvNames,
  getConsultRedis,
} from "../lib/consult-redis.ts";

const VERIFY_TTL_SECONDS = 60;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const environment = process.env.VERCEL_ENV || "local";

if (environment !== "preview") {
  console.log(`REDIS_VERIFY=skipped environment=${environment}`);
  process.exit(0);
}

if (!consultRedisEnvAvailable()) {
  const missing = consultRedisMissingEnvNames();
  console.log("REDIS_VERIFY=failed environment=preview");
  console.log(`missing_env_names=${missing.join(",") || CONSULT_REDIS_ENV_NAMES.join(",")}`);
  console.log("No secret values were printed.");
  process.exit(1);
}

const seed = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || randomUUID();
const id = createHash("sha256").update(`consult-verify-preview:${seed}`).digest("hex").slice(0, 16);
const prefix = `consult:verify:preview:v1:${id}`;
const nxKey = `${prefix}:nx`;
const hashedId = createHash("sha256").update(`${prefix}:rl`).digest("hex");
const storageKey = `${prefix}:idem`;

const redis = getConsultRedis();
if (!redis) {
  console.log("REDIS_VERIFY=failed environment=preview");
  console.log("stage=redis-client");
  process.exit(1);
}

const limiter = createUpstashAgentRateLimiter(redis);
const store = createRedisIdempotencyStore(redis);

let failed = 0;
const ownedKeys = [nxKey, storageKey];

function check(ok, label) {
  if (!ok) {
    failed += 1;
    console.log(`FAIL ${label}`);
    return;
  }
  console.log(`pass ${label}`);
}

function slidingKeys(ratePrefix, windowMs) {
  const current = Math.floor(Date.now() / windowMs);
  const ident = `${ratePrefix}:${hashedId}`;
  return [`${ident}:${current}`, `${ident}:${current - 1}`];
}

async function cleanup() {
  const extra = [
    ...slidingKeys(CONSULT_RL_HOUR_PREFIX, HOUR_MS),
    ...slidingKeys(CONSULT_RL_DAY_PREFIX, DAY_MS),
  ];
  try {
    await redis.del(...ownedKeys, ...extra);
  } catch {
    // best-effort; do not print connection details
  }
}

try {
  const ping = await redis.ping();
  check(ping === "PONG", "redis-connectivity");

  const firstSet = await redis.set(nxKey, { v: 1, kind: "verify" }, {
    nx: true,
    ex: VERIFY_TTL_SECONDS,
  });
  check(firstSet === "OK", "atomic-set-nx");

  const duplicateSet = await redis.set(nxKey, { v: 1, kind: "other" }, {
    nx: true,
    ex: VERIFY_TTL_SECONDS,
  });
  check(duplicateSet === null || duplicateSet === undefined, "duplicate-set-nx-rejected");

  const read = await redis.get(nxKey);
  check(Boolean(read) && typeof read === "object" && read.kind === "verify", "read-claimed-record");

  const expire = await redis.expire(nxKey, VERIFY_TTL_SECONDS);
  check(expire === 1 || expire === true, "expire-accepted");

  const ttl = await redis.ttl(nxKey);
  check(typeof ttl === "number" && ttl > 0 && ttl <= VERIFY_TTL_SECONDS, "ttl-bounded");

  const nowMs = Date.now();
  const firstClaim = await store.claim({
    storageKey,
    fingerprint: "fp-verify-a",
    requestId: "verify-preview-1",
    nowMs,
    ttlSeconds: VERIFY_TTL_SECONDS,
  });
  check(firstClaim.kind === "claimed", "idempotency-first-claim");

  const inProgress = await store.claim({
    storageKey,
    fingerprint: "fp-verify-a",
    requestId: "verify-preview-2",
    nowMs,
    ttlSeconds: VERIFY_TTL_SECONDS,
  });
  check(inProgress.kind === "in_progress", "idempotency-duplicate-in-progress");

  const completed = await store.complete(
    storageKey,
    {
      request_id: "verify-preview-1",
      status: "accepted",
      next_step: "verification-only",
      contract_version: CONSULT_CONTRACT_VERSION,
    },
    nowMs,
    VERIFY_TTL_SECONDS
  );
  check(completed === "ok", "idempotency-complete");

  const inspected = await store.inspect(storageKey);
  check(
    Boolean(inspected) &&
      inspected.state === "completed" &&
      inspected.fingerprint === "fp-verify-a" &&
      inspected.request_id === "verify-preview-1",
    "idempotency-retrieve-completed"
  );

  const replay = await store.claim({
    storageKey,
    fingerprint: "fp-verify-a",
    requestId: "verify-preview-3",
    nowMs,
    ttlSeconds: VERIFY_TTL_SECONDS,
  });
  check(replay.kind === "replay", "idempotency-same-fingerprint-replay");

  const conflict = await store.claim({
    storageKey,
    fingerprint: "fp-verify-b",
    requestId: "verify-preview-4",
    nowMs,
    ttlSeconds: VERIFY_TTL_SECONDS,
  });
  check(conflict.kind === "conflict", "idempotency-conflict-fingerprint");

  let allowed = 0;
  let limited = 0;
  let unavailable = 0;
  for (let i = 0; i < CONSULT_AGENT_HOURLY_LIMIT + 1; i += 1) {
    const decision = await limiter.consume(hashedId);
    if (decision.kind === "allowed") allowed += 1;
    else if (decision.kind === "limited") limited += 1;
    else unavailable += 1;
  }
  check(unavailable === 0, "rate-limit-determined");
  check(allowed === CONSULT_AGENT_HOURLY_LIMIT, "rate-limit-allows-under-threshold");
  check(limited === 1, "rate-limit-enforces-threshold");

  await cleanup();
  const goneNx = await redis.get(nxKey);
  const goneIdem = await store.inspect(storageKey);
  check(goneNx === null && goneIdem === null, "cleanup");
} catch (error) {
  failed += 1;
  console.log(
    `FAIL unexpected-error name=${error instanceof Error ? error.name : "unknown"}`
  );
} finally {
  await cleanup();
}

if (failed) {
  console.log("REDIS_VERIFY=failed environment=preview");
  console.log("No secret values were printed. No consultation POST. No email.");
  process.exit(1);
}

console.log("REDIS_VERIFY=passed environment=preview");
console.log("No secret values were printed. No consultation POST. No email.");
process.exit(0);
