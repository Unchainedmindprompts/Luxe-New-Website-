#!/usr/bin/env node
/**
 * Route and sitemap validation. (Phase 2)
 *
 * Reads the *emitted* sitemap from build output rather than importing
 * app/sitemap.ts, because app/sitemap.ts is the artifact under test. Half of it
 * is hardcoded — a static list of product, area, and core URLs maintained by
 * hand — so the interesting failure is precisely the one importing the module
 * cannot see: the file says a URL exists, and no page was built for it.
 *
 * Node built-ins only. Exit 1 on failure.
 */
import { existsSync } from "node:fs";
import { relative } from "node:path";
import {
  ROOT, BUILD_APP, PRODUCTION_HOST, GENERATED_ROUTES,
  filesystemRoutes, builtPages, publicAssets, redirectRules, sitemapLocs,
  robotsOf, isNoindex, normaliseRef, checkBuildFreshness, resolveThroughRedirects,
} from "./lib/route-inventory.mjs";
import { allowlist, CATEGORIES } from "../config/verify-allowlist.mjs";

const groups = new Map();
const fail = (category, msg) => {
  if (!groups.has(category)) groups.set(category, []);
  groups.get(category).push(msg);
};

// ── stale-build protection ──────────────────────────────────────────────────

const fresh = checkBuildFreshness();
if (!fresh.ok) {
  console.error(fresh.reason === "stale" ? fresh.message : `${fresh.message}\nRun npm run build first.`);
  process.exit(1);
}

// ── inventory ───────────────────────────────────────────────────────────────

const { templates, unsupported } = filesystemRoutes();
for (const u of unsupported)
  fail("routeStructure", `Unsupported route structure (${u.kind}): ${u.route}\n    segment "${u.seg}" — this module cannot model it correctly, so it refuses to guess.`);

const built = builtPages();
const pages = built.pages;
const routes = new Set(pages.map((p) => p.route));
const assets = publicAssets();
const { literal, pattern, map: redirects } = redirectRules();

const sm = sitemapLocs();
if (!sm) {
  console.error(
    "Missing emitted sitemap artifact under .next/server/app (expected sitemap.xml.body or sitemap.xml).\n" +
      "Run npm run build first."
  );
  process.exit(1);
}

// classify by rendered robots
const indexable = [];
const noindex = [];
for (const p of pages) (isNoindex(robotsOf(p.file)) ? noindex : indexable).push(p.route);
const noindexSet = new Set(noindex);

// ── allowlist integrity ─────────────────────────────────────────────────────

const seenAllow = new Set();
const sitemapExclusions = new Set();
for (const e of allowlist) {
  const id = `${e.category}::${e.path}`;
  if (!e.path || !e.path.startsWith("/")) fail("allowlist", `Allowlist entry has a malformed path: ${JSON.stringify(e.path)}`);
  if (!CATEGORIES.includes(e.category)) fail("allowlist", `Unsupported allowlist category "${e.category}" for ${e.path}`);
  if (!e.reason || !String(e.reason).trim()) fail("allowlist", `Allowlist entry has no reason: ${e.category} ${e.path}`);
  if (seenAllow.has(id)) fail("allowlist", `Duplicate allowlist entry: ${e.category} ${e.path}`);
  seenAllow.add(id);
  if (/[*?]/.test(e.path)) fail("allowlist", `Wildcard allowlist paths are not permitted: ${e.path}`);

  if (e.category === "sitemapExclusions") {
    sitemapExclusions.add(e.path);
    if (!routes.has(e.path)) {
      fail("allowlist", `Stale allowlist entry — no such built page: ${e.path}`);
    } else if (!noindexSet.has(e.path)) {
      // Excluding an indexable page is a policy decision, not a technical one.
      fail(
        "allowlist",
        `Sitemap exclusion contradicts rendered robots policy: ${e.path}\n` +
          `    the page is indexable ("${robotsOf(pages.find((p) => p.route === e.path).file) || "no robots meta"}") ` +
          `but is excluded from the sitemap.\n` +
          `    Either make it noindex, add it to the sitemap, or state the business reason explicitly.`
      );
    }
  }
}

// ── filesystem ↔ built cross-check ──────────────────────────────────────────

for (const t of templates) {
  if (t.dynamic) {
    const prefix = t.route.replace(/\/\[[^\]]+\]$/, "");
    const produced = [...routes].filter((r) => r.startsWith(prefix + "/") && r !== prefix);
    if (produced.length === 0)
      fail("routeStructure", `Dynamic template produced no pages: ${t.route}  (${t.file})`);
  } else if (!routes.has(t.route)) {
    fail("routeStructure", `Route template has no built HTML: ${t.route}  (${t.file})`);
  }
}
for (const r of routes) {
  const staticMatch = templates.some((t) => !t.dynamic && t.route === r);
  const dynamicMatch = templates.some((t) => t.dynamic && r.startsWith(t.route.replace(/\/\[[^\]]+\]$/, "") + "/"));
  if (!staticMatch && !dynamicMatch)
    fail("routeStructure", `Built page has no corresponding route template: ${r}`);
}

// ── sitemap validation ──────────────────────────────────────────────────────

const smPaths = [];
const smSeen = new Set();
for (const loc of sm.locs) {
  if (!loc.startsWith(PRODUCTION_HOST)) {
    fail("sitemap", `Sitemap URL is not on the production host: ${loc}`);
    continue;
  }
  const tail = loc.slice(PRODUCTION_HOST.length) || "/";
  if (tail !== "/" && tail !== tail.replace(/\/+$/, ""))
    fail("sitemap", `Sitemap URL has an inconsistent trailing slash: ${loc}`);
  const n = normaliseRef(loc);
  if (n.malformed) {
    fail("sitemap", `Malformed sitemap URL: ${loc} — ${n.reason}`);
    continue;
  }
  if (n.fragment || n.query) fail("sitemap", `Sitemap URL carries a fragment or query: ${loc}`);
  if (smSeen.has(n.path)) fail("sitemap", `Duplicate sitemap entry: ${loc}`);
  smSeen.add(n.path);
  smPaths.push(n.path);

  if (!routes.has(n.path)) {
    const res = resolveThroughRedirects(n.path, { routes, redirects, assets });
    if (res.status === "ok")
      fail("sitemap", `Sitemap URL resolves through a redirect instead of directly to a page:\n    ${loc}\n    -> ${res.final}`);
    else fail("sitemap", `Sitemap URL has no built public page: ${loc}`);
    continue;
  }
  if (noindexSet.has(n.path)) fail("sitemap", `Sitemap includes a noindex page: ${loc}`);
}

for (const r of indexable) {
  if (smSeen.has(r)) continue;
  if (sitemapExclusions.has(r)) continue;
  fail(
    "sitemap",
    `Indexable page missing from the sitemap: ${r}\n` +
      `    It renders as indexable and is not in config/verify-allowlist.mjs.\n` +
      `    Add it to app/sitemap.ts, make it noindex, or allowlist it with a reason.`
  );
}

// ── redirect destinations that claim to be pages ────────────────────────────

for (const r of literal) {
  const n = normaliseRef(r.destination);
  if (n.external || n.malformed || n.hashOnly) continue;
  if (routes.has(n.path) || GENERATED_ROUTES.has(n.path) || assets.has(n.path)) continue;
  const res = resolveThroughRedirects(n.path, { routes, redirects, assets });
  if (res.status !== "ok")
    fail("redirects", `Redirect destination looks like a public page but none exists:\n    ${r.source}\n    -> ${r.destination}\n    (${r.origin})`);
}

// ── report ──────────────────────────────────────────────────────────────────

const destinations = new Set(literal.map((r) => normaliseRef(r.destination).path).filter(Boolean));
console.log("Route & sitemap validation");
console.log(`  filesystem page templates:   ${templates.length}  (${templates.filter((t) => t.dynamic).length} dynamic)`);
console.log(`  built public HTML pages:     ${pages.length}`);
console.log(`  framework-only pages:        ${built.framework.length}  (excluded)`);
console.log(`  generated non-HTML routes:   ${GENERATED_ROUTES.size}  (excluded)`);
console.log(`  generated public routes:     ${pages.length - templates.filter((t) => !t.dynamic).length}  (from dynamic templates)`);
console.log(`  indexable pages:             ${indexable.length}`);
console.log(`  noindex pages:               ${noindex.length}  ${noindex.join(", ")}`);
console.log(`  sitemap URLs:                ${smPaths.length}  (${relative(ROOT, sm.file)})`);
console.log(`  intentional exclusions:      ${sitemapExclusions.size}  ${[...sitemapExclusions].join(", ")}`);
console.log(`  redirect sources:            ${literal.length} literal, ${pattern.length} pattern`);
console.log(`  redirect destinations:       ${destinations.size} distinct`);

if (groups.size) {
  const total = [...groups.values()].reduce((a, b) => a + b.length, 0);
  console.log(`\nFAIL — ${total} issue(s):`);
  for (const [cat, msgs] of groups) {
    console.log(`\n  [${cat}] ${msgs.length}`);
    msgs.forEach((m) => console.log(`    ${m}\n`));
  }
  process.exit(1);
}

console.log(
  "\nPASS — every built page maps to a template, every indexable page is in the sitemap or explicitly " +
    "excluded with a reason, and no sitemap URL is missing, duplicated, redirected, or noindex."
);
