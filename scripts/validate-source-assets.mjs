#!/usr/bin/env node
/**
 * Source asset + production placeholder validator.  (Phase 1)
 *
 * Two gates, both operating on SOURCE — not build output — so they can run
 * before a build and inside `npm run check`:
 *
 *   1. Every local `/images/...` reference resolves to a real file in public/.
 *   2. No production placeholder token ships in source.
 *
 * Why source rather than rendered HTML: a missing image or a leftover
 * REPLACE_ME is a defect the moment it is written, and catching it without a
 * full production build keeps the feedback loop short. Rendered-output checks
 * (internal links, schema URLs, sitemap parity) are a later phase and
 * deliberately not attempted here.
 *
 * Node built-ins only. Exit 1 on any failure, 0 when clean.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();

/** Production source trees. Anything outside these cannot ship. */
const SCAN_DIRS = ["app", "components", "lib", "content"];

/** Never walk these: generated output, dependencies, VCS internals. */
const SKIP_DIRS = new Set([
  ".next", "node_modules", ".git", ".husky", "coverage", "dist", "out",
]);

const SCAN_EXTS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".md", ".mdx", ".json",
]);

// ── file walking ────────────────────────────────────────────────────────────

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // directory absent — not an error, some trees are optional
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (SCAN_EXTS.has(extname(e.name))) out.push(p);
  }
  return out;
}

/** 1-indexed line number for a character offset. */
const lineOf = (text, index) => text.slice(0, index).split("\n").length;

// ── gate 1: local image references ──────────────────────────────────────────

/**
 * Matches a quoted or parenthesised path starting /images/. Deliberately
 * anchored on the delimiter so a bare mention inside prose is not treated as a
 * reference — only something that occupies an attribute, a JS string, or a
 * markdown image/link target.
 */
const IMAGE_REF = /["'(](\/images\/[^"'()\s>]*)/g;

/**
 * Next.js serves these from app/ as generated routes, not from public/. They
 * are not /images/ paths, but they are the classic false positive for an
 * existence checker, so they are excluded explicitly and documented.
 */
const GENERATED_ROUTES = new Set([
  "/icon.png", "/apple-icon.png", "/favicon.ico", "/opengraph-image", "/twitter-image",
]);

function checkImages(files) {
  const missing = new Map(); // path -> [{file, line}]
  const malformed = [];
  let refCount = 0;
  const seen = new Set();

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(IMAGE_REF)) {
      const raw = m[1];
      if (GENERATED_ROUTES.has(raw)) continue;

      // Strip query and fragment before resolving.
      let path = raw.split("#")[0].split("?")[0];

      // Decode percent-encoding where it is safe to do so. A path that cannot
      // be decoded is reported rather than skipped — a malformed local path is
      // a defect in its own right, not something to pass over quietly.
      try {
        path = decodeURIComponent(path);
      } catch {
        malformed.push({ raw, file: relative(ROOT, file), line: lineOf(text, m.index) });
        continue;
      }

      if (path.endsWith("/") || path === "/images") {
        malformed.push({ raw, file: relative(ROOT, file), line: lineOf(text, m.index) });
        continue;
      }

      refCount++;
      seen.add(path);
      const onDisk = join(ROOT, "public", path);
      if (!existsSync(onDisk) || !statSync(onDisk).isFile()) {
        if (!missing.has(path)) missing.set(path, []);
        missing.get(path).push({ file: relative(ROOT, file), line: lineOf(text, m.index) });
      }
    }
  }
  return { missing, malformed, refCount, distinct: seen.size };
}

// ── gate 2: production placeholders ─────────────────────────────────────────

/**
 * Tokens that must never ship. `example.com` is handled separately below
 * because this repository has one legitimate use of it.
 */
const TOKENS = [
  { token: "PASTE_", caseSensitive: true },
  { token: "REPLACE_ME", caseSensitive: true },
  { token: "YOUR_", caseSensitive: true },
  { token: "localhost", caseSensitive: false },
  { token: "127.0.0.1", caseSensitive: false },
  { token: "blob:", caseSensitive: false },
];

/**
 * The single approved `example.com`: the email input on the booking form uses
 * `you@example.com` as its visible placeholder attribute, which is correct UI
 * copy and RFC 2606's reserved example domain.
 *
 * The exception is narrow on purpose — it matches that exact string only, so
 * a production URL, canonical, or schema value using example.com still fails.
 */
const EXAMPLE_ALLOWED = "you@example.com";

function checkPlaceholders(files) {
  const hits = [];
  let scanned = 0;

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const rel = relative(ROOT, file);
    const lines = text.split("\n");

    lines.forEach((line, i) => {
      scanned++;
      for (const { token, caseSensitive } of TOKENS) {
        const hay = caseSensitive ? line : line.toLowerCase();
        const needle = caseSensitive ? token : token.toLowerCase();
        if (hay.includes(needle)) {
          hits.push({ token, file: rel, line: i + 1, context: line.trim().slice(0, 120) });
        }
      }
      // example.com, minus the one approved placeholder
      if (line.toLowerCase().includes("example.com")) {
        const stripped = line.split(EXAMPLE_ALLOWED).join("");
        if (stripped.toLowerCase().includes("example.com")) {
          hits.push({
            token: "example.com",
            file: rel,
            line: i + 1,
            context: line.trim().slice(0, 120),
          });
        }
      }
    });
  }
  return { hits, scanned };
}

// ── run ─────────────────────────────────────────────────────────────────────

const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
const img = checkImages(files);
const ph = checkPlaceholders(files);

console.log(
  `Scanned ${files.length} source files in ${SCAN_DIRS.join(", ")} — ` +
    `${img.refCount} local image reference(s) (${img.distinct} distinct), ` +
    `${ph.scanned} lines checked for placeholders.`
);

const failures = [];

for (const [path, refs] of img.missing) {
  const where = refs.map((r) => `      ${r.file}:${r.line}`).join("\n");
  failures.push(
    `Missing local image: ${path}\n    expected at public${path}\n    referenced from ${refs.length} location(s):\n${where}`
  );
}
for (const m of img.malformed) {
  failures.push(`Malformed local image path: ${m.raw}\n    ${m.file}:${m.line}`);
}
for (const h of ph.hits) {
  failures.push(`Forbidden placeholder "${h.token}"\n    ${h.file}:${h.line}\n    ${h.context}`);
}

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} issue(s):\n`);
  failures.forEach((f) => console.log(`  ${f}\n`));
  process.exit(1);
}

console.log(
  "\nPASS — every local image reference resolves under public/, and no production placeholder tokens are present."
);
