#!/usr/bin/env node
/**
 * Rendered internal link and schema URL validation. (Phase 2)
 *
 * Built HTML is the primary inventory, not source. A source scan tells you what
 * an author typed; only rendered output tells you what a visitor and a crawler
 * actually receive — including links assembled from data modules, and links a
 * component produced from a slug that no longer exists.
 *
 * Source is searched only *after* a rendered defect is found, to locate the
 * likely authoring line. That ordering matters: source-first would report
 * template strings that never render, and miss composed URLs that do.
 *
 * Two independent inventories, reported separately because they fail for
 * different reasons and are fixed in different places:
 *   1. visible anchors — <a href>
 *   2. internal URLs inside <script type="application/ld+json">
 *
 * Node built-ins only. Exit 1 on failure.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import {
  ROOT, BUILD_APP, PRODUCTION_HOST, GENERATED_ROUTES, API_PREFIX,
  builtPages, publicAssets, redirectRules, normaliseRef, looksLikeAsset,
  checkBuildFreshness, resolveThroughRedirects,
} from "./lib/route-inventory.mjs";
import { allowlist } from "../config/verify-allowlist.mjs";

// ── stale-build protection ──────────────────────────────────────────────────

const fresh = checkBuildFreshness();
if (!fresh.ok) {
  console.error(fresh.reason === "stale" ? fresh.message : `${fresh.message}\nRun npm run build first.`);
  process.exit(1);
}

const built = builtPages();
const routes = new Set(built.pages.map((p) => p.route));
const assets = publicAssets();
const { map: redirects } = redirectRules();
const linkAllow = new Set(allowlist.filter((a) => a.category === "linkTargetExclusions").map((a) => a.path));

const skipped = {
  external: 0, mailtoTelSms: 0, otherScheme: 0, hashOnly: 0,
  nextAssets: 0, apiRoutes: 0, publicAssets: 0, generatedRoutes: 0,
  schemaExternal: 0, schemaFragmentOnly: 0, allowlisted: 0,
};

// ── source location lookup (only after a rendered defect) ───────────────────

function walkSource(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git"].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walkSource(p, out);
    else if ([".tsx", ".ts", ".md", ".mjs", ".json"].includes(extname(e.name))) out.push(p);
  }
  return out;
}
let SOURCE_FILES = null;
function findInSource(needle) {
  // An empty or trivially short needle matches every file; searching for it would
  // point at arbitrary sources and actively mislead whoever reads the finding.
  if (!needle || needle.length < 4) return [];
  if (!SOURCE_FILES)
    SOURCE_FILES = ["app", "components", "lib", "content", "config"].flatMap((d) => walkSource(join(ROOT, d)));
  const hits = [];
  for (const f of SOURCE_FILES) {
    const text = readFileSync(f, "utf8");
    if (!text.includes(needle)) continue;
    const line = text.slice(0, text.indexOf(needle)).split("\n").length;
    hits.push({ file: relative(ROOT, f), line });
    if (hits.length >= 3) break;
  }
  return hits;
}

// ── 1. visible anchors ──────────────────────────────────────────────────────

const linkFindings = new Map(); // target -> { pages:Set, detail }
let visibleChecked = 0;
let redirectsResolved = 0;

for (const { route, file } of built.pages) {
  const html = readFileSync(file, "utf8");
  // Strip <script> wholesale: RSC flight payloads, $undefined sentinels, inline
  // JS, and serialised JSON all live there and none of it is a rendered link.
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");

  for (const m of body.matchAll(/<a\b[^>]*\shref="([^"]*)"/gi)) {
    const raw = m[1];
    const n = normaliseRef(raw);

    if (n.hashOnly) { skipped.hashOnly++; continue; }
    if (n.external) {
      if (n.scheme && ["mailto", "tel", "sms"].includes(n.scheme.toLowerCase())) skipped.mailtoTelSms++;
      else if (n.scheme) skipped.otherScheme++;
      else skipped.external++;
      continue;
    }
    if (n.malformed) {
      const key = `MALFORMED:${raw}`;
      if (!linkFindings.has(key))
        linkFindings.set(key, {
          pages: new Set(),
          detail: `malformed internal URL — ${n.reason}`,
          raw: raw === "" ? 'href="" (empty)' : raw,
        });
      linkFindings.get(key).pages.add(route);
      continue;
    }

    const p = n.path;
    if (p.startsWith("/_next")) { skipped.nextAssets++; continue; }
    if (p.startsWith(API_PREFIX)) { skipped.apiRoutes++; continue; }
    if (GENERATED_ROUTES.has(p)) { skipped.generatedRoutes++; continue; }
    if (linkAllow.has(p)) { skipped.allowlisted++; continue; }
    if (assets.has(p)) { skipped.publicAssets++; continue; }

    visibleChecked++;
    if (routes.has(p)) continue;

    const res = resolveThroughRedirects(p, { routes, redirects, assets });
    if (res.status === "ok") { redirectsResolved++; continue; }

    // An asset-looking path that is not on disk is still a defect, but reported
    // as an asset rather than a missing page so the fix is obvious.
    const kind = looksLikeAsset(p) ? "asset not present in public/" : res.status;
    const key = `${kind}:${p}`;
    if (!linkFindings.has(key))
      linkFindings.set(key, { pages: new Set(), detail: kind, chain: res.chain, final: res.final, raw: p });
    linkFindings.get(key).pages.add(route);
  }
}

// ── 2. internal schema URLs ─────────────────────────────────────────────────

const URL_FIELDS = new Set(["url", "item", "mainEntityOfPage", "contentUrl", "embedUrl", "@id"]);
const schemaFindings = new Map();
let schemaChecked = 0;

function walkSchema(node, page) {
  if (Array.isArray(node)) { node.forEach((n) => walkSchema(n, page)); return; }
  if (!node || typeof node !== "object") return;
  for (const [k, v] of Object.entries(node)) {
    if (URL_FIELDS.has(k) && typeof v === "string" && /^https?:\/\//i.test(v)) {
      const n = normaliseRef(v);
      if (n.external) { skipped.schemaExternal++; }
      else if (n.malformed) {
        const key = `MALFORMED:${v}`;
        if (!schemaFindings.has(key)) schemaFindings.set(key, { pages: new Set(), detail: `malformed internal URL — ${n.reason}`, field: k, url: v });
        schemaFindings.get(key).pages.add(page);
      } else if (n.path === "/" && n.fragment) {
        // Site-scoped entity IDs such as …/#business anchor to the root route
        // and require no standalone page of their own.
        skipped.schemaFragmentOnly++;
      } else {
        schemaChecked++;
        const p = n.path;
        if (routes.has(p) || GENERATED_ROUTES.has(p) || assets.has(p)) continue;
        const res = resolveThroughRedirects(p, { routes, redirects, assets });
        if (res.status === "ok") continue;
        const key = `${res.status}:${p}`;
        if (!schemaFindings.has(key))
          schemaFindings.set(key, { pages: new Set(), detail: res.status, field: k, url: v, chain: res.chain });
        schemaFindings.get(key).pages.add(page);
      }
    }
    walkSchema(v, page);
  }
}

for (const { route, file } of built.pages) {
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walkSchema(JSON.parse(m[1]), route); } catch { /* escaped RSC copies never parse; ignore */ }
  }
}

// ── report ──────────────────────────────────────────────────────────────────

console.log("Rendered internal link & schema URL validation");
console.log(`  public pages scanned:        ${built.pages.length}`);
console.log(`  visible internal links:      ${visibleChecked} checked`);
console.log(`  resolved via redirect:       ${redirectsResolved}`);
console.log(`  internal schema URLs:        ${schemaChecked} checked`);
console.log("\n  suppressed as out of scope:");
for (const [k, v] of Object.entries(skipped)) if (v) console.log(`    ${k.padEnd(22)}${v}`);

function report(title, findings) {
  if (!findings.size) return 0;
  let total = 0;
  console.log(`\n  [${title}] ${findings.size} distinct target(s)`);
  for (const [, f] of findings) {
    total += 1;
    const pages = [...f.pages].sort();
    console.log(`\n    target:     ${f.url ?? f.raw}`);
    console.log(`    result:     ${f.detail}`);
    if (f.chain && f.chain.length > 1) console.log(`    resolution: ${f.chain.join(" -> ")}`);
    if (f.field) console.log(`    field:      ${f.field}`);
    console.log(`    affects:    ${pages.length} page(s)`);
    pages.slice(0, 6).forEach((p) => console.log(`                ${p}`));
    if (pages.length > 6) console.log(`                … and ${pages.length - 6} more`);
    // Schema URLs are frequently composed at build time — `${BUSINESS.url}/x`
    // never appears in source as a full URL — so fall back to the path, which
    // does. Without this, template-composed defects report no source at all.
    let src = findInSource(f.url ?? f.raw);
    if (!src.length && f.url) {
      const path = f.url.replace(/^https?:\/\/[^/]+/, "");
      if (path && path !== "/") src = findInSource(path);
    }
    if (src.length) {
      console.log(`    likely source:`);
      src.forEach((s) => console.log(`                ${s.file}:${s.line}`));
      if (pages.length > 1)
        console.log(`    FIX ONCE:   one shared definition affects ${pages.length} pages — correct it at the source above, not per page.`);
    }
  }
  return total;
}

const linkCount = report("visible links", linkFindings);
const schemaCount = report("schema URLs", schemaFindings);

if (linkCount || schemaCount) {
  console.log(`\nFAIL — ${linkCount} broken link target(s), ${schemaCount} broken schema URL(s).`);
  process.exit(1);
}

console.log(
  "\nPASS — every internal anchor and every internal schema URL resolves to a real page, asset, or " +
    "generated route, directly or through a redirect."
);
