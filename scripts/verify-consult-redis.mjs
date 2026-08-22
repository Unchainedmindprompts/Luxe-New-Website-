#!/usr/bin/env node
/**
 * Namespaced Upstash verification for consultation controls.
 *
 * Connects with already-provisioned Preview/local Marketplace variables.
 * Never prints secret values. Never POSTs /api/consultation. Never sends email.
 * Temporary keys are prefixed and deleted before exit.
 */
import { Redis } from "@upstash/redis";

const REQUIRED_NAMES = ["KV_REST_API_URL", "KV_REST_API_TOKEN"];
const PREFIX = `consult:verify:tmp:${Date.now().toString(16)}`;

function present(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim() !== "";
}

const missing = REQUIRED_NAMES.filter((name) => !present(name));
if (missing.length) {
  console.log("REDIS_VERIFY=blocked");
  console.log(`missing_env_names=${missing.join(",")}`);
  console.log("No secret values were printed.");
  process.exit(2);
}

console.log("REDIS_VERIFY=starting");
console.log(`env_names_present=${REQUIRED_NAMES.join(",")}`);
console.log(`temp_prefix=${PREFIX}`);

const redis = Redis.fromEnv();
const keyA = `${PREFIX}:nx`;
const keyB = `${PREFIX}:dup`;
let failed = 0;

function check(ok, label) {
  if (!ok) {
    failed += 1;
    console.log(`FAIL ${label}`);
  } else {
    console.log(`pass ${label}`);
  }
}

try {
  const first = await redis.set(keyA, { v: 1, state: "processing" }, { nx: true, ex: 60 });
  check(first === "OK", "SET NX first claim");

  const duplicate = await redis.set(keyA, { v: 1, state: "other" }, { nx: true, ex: 60 });
  check(duplicate === null || duplicate === undefined, "SET NX duplicate rejected");

  const read = await redis.get(keyA);
  check(read && read.state === "processing", "GET returns claimed record");

  const expire = await redis.expire(keyA, 30);
  check(expire === 1 || expire === true, "EXPIRE accepted");

  const ttl = await redis.ttl(keyA);
  check(typeof ttl === "number" && ttl > 0 && ttl <= 30, "TTL remaining is bounded");

  await redis.set(keyB, { v: 1 }, { ex: 30 });
  const deleted = await redis.del(keyA, keyB);
  check(typeof deleted === "number" && deleted >= 1, "temporary keys deleted");

  const gone = await redis.get(keyA);
  check(gone === null, "deleted key is gone");
} catch (error) {
  failed += 1;
  console.log(`FAIL unexpected-error name=${error instanceof Error ? error.name : "unknown"}`);
} finally {
  try {
    await redis.del(keyA, keyB);
  } catch {
    // cleanup best-effort; do not print connection details
  }
}

if (failed) {
  console.log("REDIS_VERIFY=failed");
  console.log("No secret values were printed.");
  process.exit(1);
}

console.log("REDIS_VERIFY=ok");
console.log("No secret values were printed. No consultation POST. No email.");
process.exit(0);
