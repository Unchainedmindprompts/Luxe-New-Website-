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
  // /estimate was removed in Oct 2026 (the instant estimator retired and the
  // URL redirects to /book), so it no longer emits entities to audit.
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

// ── 4. Capability truth + article author/publisher inlining ───────────────
// WebSite must not claim a public checkout Luxe does not have. Article
// author/publisher must carry @type + name on the article page itself —
// Google will not merge the homepage graph to fill those in.
const homepageHtmlPath = join(APP_DIR, "index.html");
if (existsSync(homepageHtmlPath)) {
  for (const block of publicJsonLd(readFileSync(homepageHtmlPath, "utf-8"))) {
    const nodes = block["@graph"] || [block];
    for (const node of Array.isArray(nodes) ? nodes : [nodes]) {
      if (!node || typeof node !== "object") continue;
      const types = [].concat(node["@type"] || []);
      if (!types.includes("WebSite")) continue;
      const desc = String(node.description || "");
      if (/online ordering|checkout|order online/i.test(desc)) {
        failures.push(
          `WebSite description claims a checkout Luxe does not have: ${JSON.stringify(desc)}`
        );
      }
      if (!/in-home consultation/i.test(desc)) {
        failures.push(
          `WebSite description must name the live offer (free in-home consultation): ${JSON.stringify(desc)}`
        );
      }
    }
  }
}

function articleAuthorPublisherOk(node) {
  const author = node.author;
  const publisher = node.publisher;
  if (!author || typeof author !== "object" || Array.isArray(author)) return "author missing";
  const authorTypes = [].concat(author["@type"] || []);
  if (!authorTypes.includes("Person")) return "author missing @type Person";
  if (author.name !== "Mark Abplanalp") return `author name is ${JSON.stringify(author.name)}`;
  if (author["@id"] !== `${SITE}/#owner`) return `author @id is ${JSON.stringify(author["@id"])}`;
  if (!publisher || typeof publisher !== "object" || Array.isArray(publisher)) {
    return "publisher missing";
  }
  const publisherTypes = [].concat(publisher["@type"] || []);
  if (
    !publisherTypes.includes("Organization") &&
    !publisherTypes.includes("HomeAndConstructionBusiness")
  ) {
    return `publisher @type is ${JSON.stringify(publisher["@type"])}`;
  }
  if (publisher.name !== "Luxe Window Works") {
    return `publisher name is ${JSON.stringify(publisher.name)}`;
  }
  if (publisher["@id"] !== `${SITE}/#business`) {
    return `publisher @id is ${JSON.stringify(publisher["@id"])}`;
  }
  return null;
}

let articleChecked = 0;
for (const f of files) {
  if (!f.includes(`${join("app", "blog")}`) && !f.includes("/blog/")) continue;
  if (f.endsWith(`${join("blog.html")}`) || f.endsWith("/blog.html")) continue;
  const blocks = publicJsonLd(readFileSync(f, "utf-8"));
  for (const block of blocks) {
    const nodes = block["@graph"] || [block];
    for (const node of Array.isArray(nodes) ? nodes : [nodes]) {
      if (!node || typeof node !== "object") continue;
      const types = [].concat(node["@type"] || []);
      if (!types.includes("BlogPosting")) continue;
      articleChecked += 1;
      const err = articleAuthorPublisherOk(node);
      if (err) {
        failures.push(
          `Article ${f.replace(APP_DIR, "")} author/publisher not inlined: ${err}`
        );
      }
    }
  }
}
if (articleChecked === 0) {
  failures.push("No BlogPosting nodes found in rendered blog HTML to verify author/publisher inlining");
}

// ── 5. Single @graph script per indexable route, WebPage/Breadcrumb/Logo/ISO/FAQ/H1 parity ──
const WEBPAGE_TYPES = new Set([
  "WebPage",
  "CollectionPage",
  "ContactPage",
  "ImageGallery",
  "AboutPage",
]);
const ISO_OFFSET_RE = /(?:Z|[+-]\d{2}:\d{2})$/;

function normalizeVisibleText(str) {
  return String(str || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;|&#x27;|&#39;|&lsquo;|&rsquo;/g, "'")
    .replace(/&quot;|&#34;|&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&reg;/g, "®")
    .replace(/&trade;/g, "™")
    .replace(/&frac12;|&#189;/g, "½")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

for (const f of files) {
  const rel = f.replace(APP_DIR, "");
  if (rel === "/_not-found.html" || rel === "/_global-error.html") continue;

  const html = readFileSync(f, "utf-8");
  const blocks = publicJsonLd(html);

  // Paid noindex landing page intentionally stays schema-free (Decision #4).
  if (rel === "/free-consultation.html") {
    if (blocks.length !== 0) {
      failures.push(`/free-consultation.html should emit 0 JSON-LD blocks, found ${blocks.length}`);
    }
    continue;
  }

  // 5a. Exactly 1 <script type="application/ld+json"> with @graph per indexable page
  if (blocks.length !== 1) {
    failures.push(`${rel} emits ${blocks.length} JSON-LD <script> tags (expected exactly 1 @graph block)`);
    continue;
  }
  const graph = blocks[0]["@graph"];
  if (!Array.isArray(graph)) {
    failures.push(`${rel} JSON-LD root does not use @graph array`);
    continue;
  }

  // 5b. Exactly 1 visible <h1> per indexable page
  const htmlNoScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");
  const h1Count = (htmlNoScripts.match(/<h1\b[^>]*>/gi) || []).length;
  if (h1Count !== 1) {
    failures.push(`${rel} renders ${h1Count} <h1> elements (expected exactly 1)`);
  }

  const visibleText = normalizeVisibleText(html);

  // 5c. WebPage-family node + mainEntity + no about === mainEntity + BreadcrumbList
  let hasWebPage = false;
  let hasBreadcrumb = false;
  for (const node of graph) {
    if (!node || typeof node !== "object") continue;
    const types = [].concat(node["@type"] || []);

    if (types.some((t) => WEBPAGE_TYPES.has(t))) {
      hasWebPage = true;
      if (!node.mainEntity) {
        failures.push(`${rel} WebPage node ${node["@id"] || ""} is missing mainEntity`);
      } else {
        const mainId = typeof node.mainEntity === "object" ? node.mainEntity["@id"] : null;
        if (mainId && node.about) {
          const aboutList = Array.isArray(node.about) ? node.about : [node.about];
          if (aboutList.some((a) => a && typeof a === "object" && a["@id"] === mainId)) {
            failures.push(`${rel} WebPage node duplicates mainEntity (${mainId}) inside about`);
          }
        }
      }
    }

    if (types.includes("BreadcrumbList")) {
      hasBreadcrumb = true;
      for (const item of node.itemListElement || []) {
        if (item?.item === `${SITE}/`) {
          failures.push(`${rel} BreadcrumbList uses trailing-slash root ${SITE}/ instead of ${SITE}`);
        }
      }
    }

    // 5d. #business.logo raster + >= 112x112
    if (node["@id"] === `${SITE}/#business` && node.logo) {
      const logoUrl = String(node.logo.url || "").split("?")[0];
      if (logoUrl.endsWith(".svg")) {
        failures.push(`#business.logo must be raster, got SVG: ${node.logo.url}`);
      }
      if (!(Number(node.logo.width) >= 112 && Number(node.logo.height) >= 112)) {
        failures.push(
          `#business.logo dimensions (${node.logo.width}x${node.logo.height}) violate 112x112 minimum`
        );
      }
    }

    // 5e. ISO 8601 timezone checks on BlogPosting and VideoObject
    if (types.includes("BlogPosting")) {
      const dp = String(node.datePublished || "");
      const dm = String(node.dateModified || "");
      if (!ISO_OFFSET_RE.test(dp)) {
        failures.push(`${rel} BlogPosting.datePublished lacks explicit timezone: ${dp}`);
      }
      if (!ISO_OFFSET_RE.test(dm)) {
        failures.push(`${rel} BlogPosting.dateModified lacks explicit timezone: ${dm}`);
      }
      if (ISO_OFFSET_RE.test(dp) && ISO_OFFSET_RE.test(dm) && dp.endsWith("Z") !== dm.endsWith("Z")) {
        failures.push(`${rel} BlogPosting mixes UTC Z and local offset (${dp} vs ${dm})`);
      }
    }

    if (types.includes("VideoObject") && node.uploadDate) {
      const ud = String(node.uploadDate);
      if (!ISO_OFFSET_RE.test(ud)) {
        failures.push(`${rel} VideoObject.uploadDate lacks explicit timezone: ${ud}`);
      }
    }

    // 5f. 100% FAQPage Question.name parity with visible DOM text
    if (types.includes("FAQPage")) {
      for (const q of node.mainEntity || []) {
        const qNorm = normalizeVisibleText(q?.name || "");
        if (!qNorm || !visibleText.includes(qNorm)) {
          failures.push(`${rel} FAQPage question not found in visible DOM: ${JSON.stringify(q?.name)}`);
        }
      }
    }
  }

  if (!hasWebPage) {
    failures.push(`${rel} does not emit a WebPage-family node`);
  }
  if (rel !== "/index.html" && !hasBreadcrumb) {
    failures.push(`${rel} does not emit a BreadcrumbList node`);
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
