#!/usr/bin/env node
/**
 * Rendered-output schema integrity sweep.
 *
 * Replaces the source-level scan, which read .ts/.tsx files and counted any
 * `"@id"` sitting near a `"@type"` as a published entity. That assumption
 * failed in a way that mattered: NORMAN_BRAND was defined in lib/brands.ts and
 * imported by exactly one route that used only its @id, so the sweep reported
 * the graph clean while the published JSON-LD referenced an entity that was
 * never emitted anywhere. Source presence is not publication.
 *
 * This reads what actually ships: real <script type="application/ld+json">
 * blocks in the built HTML. RSC flight payloads and hydration data are
 * excluded, because a schema object serialized into the React payload is not
 * something a crawler reading the HTML will ever see — that is precisely the
 * defect this script exists to catch on /about and /areas/*.
 *
 * Run after `next build`. Exit 1 on failure.
 */
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const APP_DIR = join(process.cwd(), ".next", "server", "app");
const SITE = "https://www.luxewindowworks.com";

if (!existsSync(APP_DIR)) {
  console.error("No build output at .next/server/app — run `next build` first.");
  process.exit(1);
}

/** Every prerendered HTML file in the build output. */
function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(p));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/**
 * Only real script tags. Attribute order is not guaranteed, so `type` is
 * matched anywhere in the tag. Anything that fails JSON.parse is ignored
 * rather than guessed at — escaped RSC copies never parse cleanly here.
 */
function publicJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      blocks.push(JSON.parse(m[1]));
    } catch {
      // Not valid JSON — skip. Never treat unparsed text as a definition.
    }
  }
  return blocks;
}

const defs = new Map(); // @id -> [{ type, file }]
const refs = new Map(); // @id -> Set(file)

/**
 * A definition carries @type plus at least one real property beyond @id and
 * @context. A node that is only `{ "@id": "..." }` — or @id plus @type with
 * nothing else — is a pointer, not a published entity.
 */
function walk(node, file) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, file));
  if (!node || typeof node !== "object") return;

  const id = node["@id"];
  if (typeof id === "string") {
    const meaningful = Object.keys(node).filter(
      (k) => !["@id", "@context", "@type"].includes(k)
    );
    if (node["@type"] && meaningful.length > 0) {
      if (!defs.has(id)) defs.set(id, []);
      defs.get(id).push({ type: JSON.stringify(node["@type"]), file });
    } else {
      if (!refs.has(id)) refs.set(id, new Set());
      refs.get(id).add(file);
    }
  }
  for (const v of Object.values(node)) walk(v, file);
}

const files = htmlFiles(APP_DIR);
const perFileBlockCount = new Map();
const notFoundPages = [];
for (const f of files) {
  const html = readFileSync(f, "utf-8");
  // A prerendered page that resolved to notFound() still writes an .html file,
  // so "the build succeeded" says nothing about whether the page exists.
  if (html.includes("NEXT_HTTP_ERROR_FALLBACK;404")) notFoundPages.push(f);
  const blocks = publicJsonLd(html);
  perFileBlockCount.set(f, blocks.length);
  blocks.forEach((b) => walk(b, f));
}

const failures = [];

// ── 0. Prerendered 404s ───────────────────────────────────────────────────
// A blog post whose filename contained a percent-encoded ½ shipped this way:
// generateStaticParams produced the encoded slug, Next decoded it before
// calling the page, the markdown lookup missed, and the route rendered its
// not-found UI. The URL sat in the sitemap and on /blog for months serving a
// 404 to every crawler that followed it, and nothing in the build complained.
for (const f of notFoundPages) {
  failures.push(
    `Prerendered page renders a 404: ${f.replace(APP_DIR, "")}\n` +
      `    it is in the build output and likely the sitemap, but has no content`
  );
}

// ── 1. Conflicting definitions ────────────────────────────────────────────
// Identical repeats are fine and expected: shared constants legitimately
// render on many pages. Only differing @type for one @id is a real conflict.
for (const [id, locs] of defs) {
  const types = [...new Set(locs.map((l) => l.type))];
  if (types.length > 1) {
    failures.push(
      `Conflicting @type for ${id}\n    ${types.join("  vs  ")}`
    );
  }
}

// ── 2. Dangling references ────────────────────────────────────────────────
// Internal Luxe IDs must resolve to a rendered definition. External IDs are
// only required to resolve when this site uses them as graph entities — which
// is exactly the Norman case: we mention it, so we must define it.
for (const [id, fileSet] of refs) {
  if (defs.has(id)) continue;
  const internal = id.startsWith(SITE);
  const from = [...fileSet][0].replace(APP_DIR, "");
  if (internal) {
    failures.push(`Dangling internal @id: ${id}\n    referenced from ${from}`);
  } else {
    failures.push(
      `External @id referenced but never defined in rendered JSON-LD: ${id}\n    referenced from ${from}`
    );
  }
}

// ── 3. Crawlability regression checks ─────────────────────────────────────
// These exist because /about and every /areas/* page shipped their schema
// only inside the RSC payload. The pages returned 200 and looked correct;
// the schema was simply absent from the HTML.
const MUST_EMIT = [
  { file: "/about.html", label: "/about", entity: `${SITE}/#owner` },
  { file: "/areas/coeur-d-alene.html", label: "/areas/coeur-d-alene", entity: `${SITE}/areas/coeur-d-alene#service` },
  { file: "/areas/post-falls.html", label: "/areas/post-falls", entity: `${SITE}/areas/post-falls#service` },
  { file: "/areas/hayden.html", label: "/areas/hayden", entity: `${SITE}/areas/hayden#service` },
  { file: "/areas/rathdrum.html", label: "/areas/rathdrum", entity: `${SITE}/areas/rathdrum#service` },
  { file: "/areas/sandpoint.html", label: "/areas/sandpoint", entity: `${SITE}/areas/sandpoint#service` },
  { file: "/index.html", label: "/", entity: `${SITE}/#business` },
  // Both hubs. /areas shipped with next/script for months and published no
  // structured data at all — the same defect as /about, missed here because
  // this list named the city pages but not the index above them.
  { file: "/areas.html", label: "/areas", entity: `${SITE}/areas#webpage` },
  { file: "/products.html", label: "/products", entity: `${SITE}/products#webpage` },
];

for (const { file, label, entity } of MUST_EMIT) {
  const full = join(APP_DIR, file.replace(/^\//, ""));
  if (!existsSync(full)) {
    failures.push(`Expected build output missing: ${file}`);
    continue;
  }
  const count = perFileBlockCount.get(full) ?? 0;
  if (count === 0) {
    failures.push(
      `${label} emits zero public application/ld+json tags — schema is not crawlable`
    );
    continue;
  }
  // The page renders JSON-LD, but does it publish the entity it is responsible
  // for? An entity present only in the RSC payload will not be found here.
  const defined = (defs.get(entity) || []).some((d) => d.file === full);
  if (!defined) {
    failures.push(
      `${label} renders JSON-LD but does not define ${entity} in its HTML`
    );
  }
}

// ── Report ────────────────────────────────────────────────────────────────
const totalBlocks = [...perFileBlockCount.values()].reduce((a, b) => a + b, 0);
console.log(
  `Scanned ${files.length} rendered pages. ${totalBlocks} public JSON-LD block(s), ` +
    `${defs.size} entity definition(s), ${refs.size} reference-only @id(s).`
);

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} issue(s):\n`);
  failures.forEach((f) => console.log(`  ${f}\n`));
  process.exit(1);
}

console.log(
  "\nPASS — every referenced @id resolves to a rendered definition, no conflicting types, " +
    "and all pages required to publish schema do."
);
