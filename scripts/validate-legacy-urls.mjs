#!/usr/bin/env node
/**
 * WordPress legacy URL & redirect contract validator.
 *
 * The site was migrated from WordPress. Every URL the old site published is a
 * URL somebody may still follow, and the only complete record of them is the
 * XML export committed at the repository root. This validator makes that record
 * enforceable: every legacy URL must carry an explicit, reasoned classification,
 * and every redirect must be proven to land on a route that actually exists.
 *
 * The failure this prevents is silent. A redirect pointing at a slug that was
 * later renamed still looks like a redirect — it returns 308, the config reads
 * fine, and the build is green. Only following it to the end reveals the 404.
 * Four of this repository's legacy redirects were in exactly that state.
 *
 * Requires a production build: route existence is checked against the prerendered
 * output rather than guessed from the filesystem, because dynamic segments mean
 * app/**\/page.tsx cannot tell you which slugs actually exist. Run via
 * `npm run verify:legacy`, which builds first.
 *
 * Node built-ins only. Exit 1 on failure, 0 when the contract holds.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const XML = join(ROOT, "luxewindowworks.WordPress.2026-02-17.xml");
const MANIFEST = join(ROOT, "config", "legacy-url-manifest.json");
const WP_REDIRECTS = join(ROOT, "scripts", "redirects.json");
const NEXT_CONFIG = join(ROOT, "next.config.mjs");
const BUILD_DIR = join(ROOT, ".next", "server", "app");

const VALID_STATUS = new Set([
  "redirect", "preserved", "attachment-no-redirect",
  "needs-business-decision", "intentionally-gone",
]);

/** Statuses that legitimately do not resolve to a live route. */
const NON_RESOLVING = new Set([
  "attachment-no-redirect", "needs-business-decision", "intentionally-gone",
]);

/**
 * Redirect chains longer than one hop, explicitly permitted with a reason.
 * Empty by design: every chain found so far was an accident, not a decision.
 */
const CHAIN_ALLOWLIST = Object.create(null);

const failures = [];
const fail = (msg) => failures.push(msg);

// ── inputs ──────────────────────────────────────────────────────────────────

if (!existsSync(BUILD_DIR)) {
  console.error(
    "No build output at .next/server/app.\n" +
      "Route existence cannot be verified without it. Run `npm run verify:legacy`."
  );
  process.exit(1);
}
for (const [label, path] of [["XML export", XML], ["manifest", MANIFEST], ["wp redirects", WP_REDIRECTS]]) {
  if (!existsSync(path)) {
    console.error(`Missing ${label}: ${relative(ROOT, path)}`);
    process.exit(1);
  }
}

/** Strip the production hostname; store and compare bare paths only. */
const normalise = (u) =>
  (u
    .replace(/^https?:\/\/(www\.)?luxewindowworks\.com/i, "")
    .split("#")[0]
    .split("?")[0]
    .replace(/\/+$/, "")) || "/";

// ── 1. legacy URLs from the XML export ──────────────────────────────────────

const xml = readFileSync(XML, "utf8");
const xmlPosts = [];
const xmlAttachments = [];
for (const [, item] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const link = item.match(/<link>(.*?)<\/link>/);
  const type = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]>/);
  const status = item.match(/<wp:status><!\[CDATA\[(.*?)\]\]>/);
  if (!link || !type) continue;
  const path = normalise(link[1]);
  if (type[1] === "post" && status?.[1] === "publish") xmlPosts.push(path);
  else if (type[1] === "attachment") xmlAttachments.push(path);
}
const xmlAll = new Set([...xmlPosts, ...xmlAttachments]);

// ── 2. current routes from the build ────────────────────────────────────────

const routes = new Set();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html") && !e.name.startsWith("_")) {
      const r = "/" + relative(BUILD_DIR, p).slice(0, -5);
      routes.add(r === "/index" ? "/" : r);
    }
  }
})(BUILD_DIR);
// Generated non-HTML routes Next serves from app/.
for (const r of ["/icon.png", "/apple-icon.png", "/favicon.ico", "/robots.txt", "/sitemap.xml"]) routes.add(r);

// ── 3. redirect rules ───────────────────────────────────────────────────────

const cfg = readFileSync(NEXT_CONFIG, "utf8");
const rules = []; // { source, destination, origin }

for (const m of cfg.matchAll(/\['((?:[^'\\]|\\.)*)',\s*\n?\s*'((?:[^'\\]|\\.)*)'\]/g))
  rules.push({ source: m[1], destination: m[2], origin: "next.config.mjs" });
for (const m of cfg.matchAll(
  /source:\s*'((?:[^'\\]|\\.)*)',\s*(?:\n\s*(?:has:[\s\S]*?\n\s*)?)?destination:\s*'((?:[^'\\]|\\.)*)'/g
))
  rules.push({ source: m[1], destination: m[2], origin: "next.config.mjs" });
for (const r of JSON.parse(readFileSync(WP_REDIRECTS, "utf8")))
  rules.push({ source: r.source, destination: r.destination, origin: "scripts/redirects.json" });

// Pattern rules (":" in the source) are not statically resolvable and are
// reported separately rather than treated as literal redirects.
const patternRules = rules.filter((r) => r.source.includes(":"));
const literalRules = rules.filter((r) => !r.source.includes(":"));

// duplicate + conflicting sources
const bySource = new Map();
for (const r of literalRules) {
  const key = normalise(r.source);
  if (!bySource.has(key)) bySource.set(key, []);
  bySource.get(key).push(r);
}
for (const [src, defs] of bySource) {
  if (defs.length < 2) continue;
  const dests = [...new Set(defs.map((d) => d.destination))];
  const where = defs.map((d) => `        ${d.origin}: -> ${d.destination}`).join("\n");
  if (dests.length > 1) fail(`Conflicting redirect destinations for ${src}\n${where}`);
  else fail(`Duplicate redirect source ${src} (${defs.length} definitions)\n${where}`);
}

const dmap = new Map();
for (const r of literalRules) {
  const key = normalise(r.source);
  if (!dmap.has(key)) dmap.set(key, r.destination); // first rule wins, as Next does
}

/** Follow a path to a live route, a loop, or a dead end. */
function resolve(start) {
  const chain = [];
  let cur = normalise(start);
  for (let i = 0; i <= 10; i++) {
    if (chain.includes(cur)) return { status: "loop", chain: [...chain, cur] };
    chain.push(cur);
    if (routes.has(cur)) return { status: "ok", chain, final: cur, hops: chain.length - 1 };
    if (!dmap.has(cur)) return { status: "dead", chain, final: cur };
    cur = normalise(dmap.get(cur));
  }
  return { status: "loop", chain };
}

// malformed internal paths
for (const r of literalRules) {
  for (const [label, val] of [["source", r.source], ["destination", r.destination]]) {
    if (!val.startsWith("/") && !val.startsWith("http"))
      fail(`Malformed redirect ${label} (no leading slash): ${val}\n        ${r.origin}`);
    if (/^https?:\/\/(www\.)?luxewindowworks\.com/i.test(val))
      fail(`Redirect ${label} hardcodes the production hostname: ${val}\n        ${r.origin}`);
  }
}

// every literal redirect must land somewhere real, in one hop
for (const r of literalRules) {
  const res = resolve(r.source);
  const src = normalise(r.source);
  if (res.status === "loop") fail(`Redirect loop:\n        ${res.chain.join("\n     -> ")}`);
  else if (res.status === "dead")
    fail(`Redirect destination is not a live route\n        ${src}\n     -> ${res.final}\n        (${r.origin})`);
  else if (res.hops > 1 && !CHAIN_ALLOWLIST[src])
    fail(`Redirect chain longer than one hop (${res.hops})\n        ${res.chain.join("\n     -> ")}`);
}

// ── 4. manifest ─────────────────────────────────────────────────────────────

let manifest;
try {
  manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
} catch (err) {
  console.error(`config/legacy-url-manifest.json is not valid JSON: ${err.message}`);
  process.exit(1);
}
if (!Array.isArray(manifest)) {
  console.error("config/legacy-url-manifest.json must be an array.");
  process.exit(1);
}

const seen = new Set();
const byStatus = {};
for (const e of manifest) {
  const src = e.source;
  if (!src) { fail(`Manifest entry with no source: ${JSON.stringify(e).slice(0, 120)}`); continue; }
  if (!src.startsWith("/")) fail(`Manifest source is not a normalised path: ${src}`);
  if (/^https?:\/\//i.test(src)) fail(`Manifest source includes a hostname: ${src}`);
  if (seen.has(src)) fail(`Duplicate manifest source: ${src}`);
  seen.add(src);

  if (!e.wordpressType) fail(`Manifest entry missing wordpressType: ${src}`);
  if (!VALID_STATUS.has(e.status)) {
    fail(`Manifest entry has invalid status "${e.status}": ${src}`);
    continue;
  }
  byStatus[e.status] = (byStatus[e.status] || 0) + 1;

  if (!e.reason || !String(e.reason).trim())
    fail(`Manifest entry missing a reason (required for status "${e.status}"): ${src}`);

  if (e.status === "redirect") {
    if (!e.destination) { fail(`redirect entry missing destination: ${src}`); continue; }
    const res = resolve(src);
    if (res.status !== "ok")
      fail(`Manifest says redirect but ${src} does not reach a live route (${res.status}: ${res.final ?? ""})`);
    else if (res.final !== normalise(e.destination))
      fail(
        `Manifest destination does not match the actual redirect\n        ${src}\n` +
          `        manifest: ${normalise(e.destination)}\n        actual:   ${res.final}`
      );
  }

  if (e.status === "preserved" && !routes.has(normalise(src)))
    fail(`Manifest says preserved but no current route exists: ${src}`);

  // A URL classified as non-resolving must not silently be redirecting anyway.
  if (NON_RESOLVING.has(e.status) && dmap.has(normalise(src)))
    fail(`Manifest classifies ${src} as "${e.status}" but a redirect rule exists for it`);

  if (!xmlAll.has(src) && !e.manuallyPreserved)
    fail(
      `Manifest source is not in the WordPress export: ${src}\n` +
        `        add "manuallyPreserved": true with a reason if this is intentional`
    );
}

// every XML URL must be classified
for (const u of xmlAll) if (!seen.has(u)) fail(`WordPress URL is unclassified — not present in the manifest: ${u}`);

// XML counts must match the manifest's coverage of them
const xmlCovered = [...xmlAll].filter((u) => seen.has(u)).length;
if (xmlCovered !== xmlAll.size)
  fail(`XML export has ${xmlAll.size} URLs but only ${xmlCovered} are classified — regenerate the manifest`);

// ── report ──────────────────────────────────────────────────────────────────

const chains = literalRules
  .map((r) => resolve(r.source))
  .filter((r) => r.status === "ok" && r.hops > 1);

console.log("WordPress legacy URL contract");
console.log(`  XML posts discovered:          ${xmlPosts.length}`);
console.log(`  XML attachments discovered:    ${xmlAttachments.length}`);
console.log(`  XML unique URLs:               ${xmlAll.size}`);
console.log(`  manifest entries:              ${manifest.length}`);
console.log(`  redirect rules (literal):      ${literalRules.length}`);
console.log(`  redirect rules (pattern):      ${patternRules.length}  ${patternRules.map((r) => r.source).join(", ")}`);
console.log(`  current routes:                ${routes.size}`);
console.log(`  redirect chains >1 hop:        ${chains.length}`);
console.log(`  duplicate redirect sources:    ${[...bySource.values()].filter((d) => d.length > 1).length}`);
console.log("\n  by manifest status:");
for (const s of [...VALID_STATUS]) console.log(`    ${s.padEnd(26)}${byStatus[s] || 0}`);

const unresolved = manifest.filter((e) => NON_RESOLVING.has(e.status));
if (unresolved.length) {
  const decisions = unresolved.filter((e) => e.status === "needs-business-decision");
  console.log(
    `\n  NOT REDIRECTED — ${unresolved.length} legacy URL(s) intentionally do not resolve.\n` +
      "  These are classified and reasoned, not fixed. They are NOT completed redirects."
  );
  const counts = {};
  for (const e of unresolved) counts[e.status] = (counts[e.status] || 0) + 1;
  for (const [s, n] of Object.entries(counts)) console.log(`    ${s}: ${n}`);
  if (decisions.length) {
    console.log("\n  AWAITING A BUSINESS DECISION:");
    for (const e of decisions) console.log(`    ${e.source}`);
  }
}

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} issue(s):\n`);
  failures.forEach((f) => console.log(`  ${f}\n`));
  process.exit(1);
}

console.log(
  "\nPASS — every WordPress URL is classified, every redirect resolves to a live route in one hop, " +
    "and no duplicate, conflicting, looping, or dead rules remain."
);
