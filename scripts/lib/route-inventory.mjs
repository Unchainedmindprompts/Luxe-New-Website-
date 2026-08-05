/**
 * Shared route inventory and URL normalisation. (Phase 2)
 *
 * Both validate-routes.mjs and validate-links.mjs need the same answer to
 * "what URLs does this site actually have?", and getting a different answer in
 * each would be worse than having neither. This module is that single answer.
 *
 * The central fact about this repository: app/**\/page.tsx does NOT describe the
 * public URL set. Fourteen templates produce seventy-six pages, because /blog,
 * /products, and /areas are dynamic segments filled from markdown and from data
 * modules. Only the prerendered output knows which slugs exist, so built HTML is
 * authoritative for *which pages exist* while the filesystem remains a
 * structural cross-check for *which templates should have produced them*.
 *
 * Node built-ins only.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

export const ROOT = process.cwd();
export const BUILD_APP = join(ROOT, ".next", "server", "app");
export const PRODUCTION_HOST = "https://www.luxewindowworks.com";

/** Hostname forms that mean "this site". Anything else is external. */
const INTERNAL_HOSTS = [
  "https://www.luxewindowworks.com",
  "https://luxewindowworks.com",
  "http://www.luxewindowworks.com",
  "http://luxewindowworks.com",
];

/**
 * Built artefacts that are not public pages. _not-found and _global-error are
 * framework fallbacks; the rest are generated non-HTML routes Next serves from
 * app/ rather than from public/, which makes them the classic false positive
 * for anything checking "does this file exist".
 */
export const FRAMEWORK_HTML = new Set(["_not-found", "_global-error"]);
export const GENERATED_ROUTES = new Set([
  "/icon.png",
  "/apple-icon.png",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

/** Route-handler paths — real endpoints, but never pages. */
export const API_PREFIX = "/api/";

// ── normalisation ───────────────────────────────────────────────────────────

/**
 * Reduce any internal reference to a comparable path.
 *
 * Returns { path, fragment, query, external, malformed }. Callers decide what
 * to do with each; nothing is silently dropped, because a malformed internal
 * URL is a defect rather than something to skip.
 *
 * Trailing slashes are stripped because next.config.mjs does not set
 * trailingSlash, so Next normalises "/foo/" to "/foo" — comparing them as
 * different paths would invent failures that do not exist in production.
 */
export function normaliseRef(raw) {
  if (typeof raw !== "string" || raw.length === 0) {
    return { malformed: true, reason: "empty reference" };
  }
  let s = raw.trim();

  // Protocol-relative and non-http schemes are somebody else's problem.
  if (s.startsWith("//")) return { external: true };
  const scheme = s.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme && !/^https?$/i.test(scheme[1])) return { external: true, scheme: scheme[1] };

  if (/^https?:\/\//i.test(s)) {
    const host = INTERNAL_HOSTS.find((h) => s.toLowerCase().startsWith(h));
    if (!host) return { external: true };
    s = s.slice(host.length) || "/";
    if (!s.startsWith("/")) s = "/" + s;
  }

  if (s.startsWith("#")) return { hashOnly: true, fragment: s.slice(1) };
  if (!s.startsWith("/")) return { malformed: true, reason: "internal reference has no leading slash", raw };

  const hashAt = s.indexOf("#");
  const fragment = hashAt >= 0 ? s.slice(hashAt + 1) : "";
  if (hashAt >= 0) s = s.slice(0, hashAt);

  const qAt = s.indexOf("?");
  const query = qAt >= 0 ? s.slice(qAt + 1) : "";
  if (qAt >= 0) s = s.slice(0, qAt);

  // Decode only when it round-trips. A path that cannot be decoded is reported,
  // and one whose decoded form differs meaningfully keeps BOTH forms so a
  // historical percent-encoded URL is never silently merged with its decoded twin.
  let decoded = s;
  try {
    decoded = decodeURIComponent(s);
  } catch {
    return { malformed: true, reason: "path is not valid percent-encoding", raw };
  }

  const strip = (p) => (p.length > 1 ? p.replace(/\/+$/, "") : p) || "/";
  return {
    path: strip(s),
    decodedPath: strip(decoded),
    fragment,
    query,
    external: false,
  };
}

/** True when a path looks like a static asset rather than a page. */
const ASSET_EXT = new Set([
  ".webp", ".jpg", ".jpeg", ".png", ".gif", ".svg", ".avif", ".ico",
  ".mp4", ".webm", ".mov", ".pdf", ".txt", ".xml", ".json", ".woff", ".woff2", ".css", ".js",
]);
export const looksLikeAsset = (p) => ASSET_EXT.has(extname(p).toLowerCase());

// ── inventory ───────────────────────────────────────────────────────────────

function walkDir(dir, test, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walkDir(p, test, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}

/**
 * Filesystem route templates from app/**\/page.tsx.
 *
 * Fails loudly on route structures this module has not been taught to reason
 * about. Silently mis-modelling a parallel or intercepting route would produce
 * confident, wrong output — worse than refusing to run.
 */
export function filesystemRoutes() {
  const pages = walkDir(join(ROOT, "app"), (n) => n === "page.tsx");
  const templates = [];
  const unsupported = [];

  for (const p of pages) {
    const rel = relative(join(ROOT, "app"), p).replace(/\/page\.tsx$/, "");
    const segments = rel === "page.tsx" ? [] : rel.split("/");
    for (const seg of segments) {
      if (/^@/.test(seg)) unsupported.push({ route: "/" + rel, seg, kind: "parallel route" });
      else if (/^\(\.{1,3}\)/.test(seg)) unsupported.push({ route: "/" + rel, seg, kind: "intercepting route" });
      else if (/^\[\[\.\.\./.test(seg)) unsupported.push({ route: "/" + rel, seg, kind: "optional catch-all" });
      else if (/^\[\.\.\./.test(seg)) unsupported.push({ route: "/" + rel, seg, kind: "catch-all" });
    }
    const route = "/" + segments.filter((s) => !/^\(.*\)$/.test(s)).join("/");
    templates.push({
      route: route === "/" ? "/" : route.replace(/\/$/, ""),
      dynamic: segments.some((s) => s.startsWith("[")),
      file: relative(ROOT, p),
    });
  }
  return { templates, unsupported };
}

/**
 * Built public pages — the authoritative list of URLs that actually exist.
 * Framework fallbacks are separated rather than dropped so callers can report
 * on them explicitly.
 */
export function builtPages() {
  if (!existsSync(BUILD_APP)) return null;
  const files = walkDir(BUILD_APP, (n) => n.endsWith(".html"));
  const pages = [];
  const framework = [];
  for (const f of files) {
    const base = f.split("/").pop().replace(/\.html$/, "");
    let route = "/" + relative(BUILD_APP, f).replace(/\.html$/, "");
    if (route === "/index") route = "/";
    (FRAMEWORK_HTML.has(base) ? framework : pages).push({ route, file: f });
  }
  return { pages, framework };
}

/** Files actually present under public/. */
export function publicAssets() {
  const files = walkDir(join(ROOT, "public"), () => true);
  return new Set(files.map((f) => "/" + relative(join(ROOT, "public"), f)));
}

/** Every literal and pattern redirect, from both definition sites. */
export function redirectRules() {
  const cfgPath = join(ROOT, "next.config.mjs");
  const cfg = readFileSync(cfgPath, "utf8");
  const rules = [];
  for (const m of cfg.matchAll(/\['((?:[^'\\]|\\.)*)',\s*\n?\s*'((?:[^'\\]|\\.)*)'\]/g))
    rules.push({ source: m[1], destination: m[2], origin: "next.config.mjs" });
  for (const m of cfg.matchAll(
    /source:\s*'((?:[^'\\]|\\.)*)',\s*(?:\n\s*(?:has:[\s\S]*?\n\s*)?)?destination:\s*'((?:[^'\\]|\\.)*)'/g
  ))
    rules.push({ source: m[1], destination: m[2], origin: "next.config.mjs" });

  const wpPath = join(ROOT, "scripts", "redirects.json");
  if (existsSync(wpPath))
    for (const r of JSON.parse(readFileSync(wpPath, "utf8")))
      rules.push({ source: r.source, destination: r.destination, origin: "scripts/redirects.json" });

  const literal = rules.filter((r) => !r.source.includes(":"));
  const pattern = rules.filter((r) => r.source.includes(":"));
  const map = new Map();
  for (const r of literal) {
    const k = normaliseRef(r.source).path;
    if (k && !map.has(k)) map.set(k, r.destination); // first wins, as Next does
  }
  return { literal, pattern, map };
}

/** Follow a path through redirects to a live route, a loop, or a dead end. */
export function resolveThroughRedirects(start, { routes, redirects, assets, extra = new Set() }) {
  const chain = [];
  let cur = normaliseRef(start).path;
  for (let i = 0; i <= 10; i++) {
    if (cur === undefined) return { status: "malformed", chain };
    if (chain.includes(cur)) return { status: "loop", chain: [...chain, cur] };
    chain.push(cur);
    if (routes.has(cur) || extra.has(cur) || GENERATED_ROUTES.has(cur) || assets.has(cur))
      return { status: "ok", final: cur, chain, hops: chain.length - 1 };
    if (!redirects.has(cur)) return { status: "dead", final: cur, chain };
    cur = normaliseRef(redirects.get(cur)).path;
  }
  return { status: "loop", chain };
}

/** Sitemap <loc> values from the prerendered artefact — never from app/sitemap.ts. */
export function sitemapLocs() {
  // Next emits sitemap.xml as a DIRECTORY alongside sitemap.xml.body, so
  // existsSync alone is not enough — reading the directory throws EISDIR.
  for (const name of ["sitemap.xml.body", "sitemap.xml"]) {
    const p = join(BUILD_APP, name);
    if (existsSync(p) && statSync(p).isFile()) {
      const xml = readFileSync(p, "utf8");
      return { file: p, locs: [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].trim()) };
    }
  }
  return null;
}

/** Rendered robots directive for a built page. */
export function robotsOf(file) {
  const html = readFileSync(file, "utf8");
  const m = html.match(/<meta name="robots" content="([^"]*)"/i);
  return m ? m[1] : "";
}
export const isNoindex = (directive) => /\bnoindex\b/i.test(directive);

// ── stale-build protection ──────────────────────────────────────────────────

/**
 * Refuse to validate output that predates its inputs. A validator reporting a
 * pass against a stale build is worse than one that does not run: it reports
 * success for code nobody has actually checked.
 *
 * docs/ is excluded — prose cannot change generated output.
 */
const STALE_ROOTS = ["app", "components", "lib", "content", "config"];
const STALE_FILES = ["next.config.mjs", "scripts/redirects.json", "package.json"];

export function checkBuildFreshness() {
  const marker = join(ROOT, ".next", "BUILD_ID");
  if (!existsSync(BUILD_APP) || !existsSync(marker))
    return { ok: false, reason: "missing", message: "No build output at .next/server/app." };

  const buildTime = statSync(marker).mtimeMs;
  let newest = null;
  const consider = (p) => {
    const t = statSync(p).mtimeMs;
    if (!newest || t > newest.time) newest = { file: relative(ROOT, p), time: t };
  };
  for (const r of STALE_ROOTS) walkDir(join(ROOT, r), () => true).forEach(consider);
  for (const f of STALE_FILES) if (existsSync(join(ROOT, f))) consider(join(ROOT, f));

  if (newest && newest.time > buildTime)
    return {
      ok: false,
      reason: "stale",
      newest,
      buildTime,
      message:
        "Built output may be stale. Run npm run build first.\n" +
        `  newest source: ${newest.file}\n` +
        `  source time:   ${new Date(newest.time).toISOString()}\n` +
        `  build artifact: .next/BUILD_ID\n` +
        `  build time:    ${new Date(buildTime).toISOString()}`,
    };
  return { ok: true, buildTime, newest };
}
