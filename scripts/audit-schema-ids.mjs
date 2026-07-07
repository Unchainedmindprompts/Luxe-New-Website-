#!/usr/bin/env node
// Entity-graph sweep for JSON-LD schema graphs. Two rules enforced:
//   A. No @id is defined in more than one source location.
//   B. Every @id reference that is FULLY RESOLVED at source level (no
//      unresolvable template variables after local-const substitution)
//      must have a matching definition somewhere in source.
//
// Rule B skips references whose runtime value depends on unresolvable
// variables (e.g. ${post.slug}, function params). That coverage comes at
// post-build time from a built-HTML manifest check.
//
// Usage from a Next.js project root:  node audit-schema-ids.mjs
// Exits 1 on findings, 0 on clean.

import fs from "node:fs";
import path from "node:path";

const ROOTS = ["app", "components", "lib", "pages", "src"];
const EXCLUDE = new Set(["node_modules", ".next", ".git", "dist", "build"]);

const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name) || entry.name.startsWith(".")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) files.push(p);
  }
}
ROOTS.forEach(walk);

// Normalize variable base URLs so `${BASE}/#x` and `${BUSINESS.url}/#x` collide.
function normalize(id) {
  return id
    .replace(/https?:\/\/(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/gi, "<HOST>")
    .replace(/\$\{[^}]*(?:BASE|BUSINESS\.url|SITE|BASE_URL|SITE_URL|URL)[^}]*\}/g, "<HOST>");
}

// Extract `const X = "..."` / `const X = \`...\`` bindings from a file, then
// recursively expand template-literal refs inside them. This lets us resolve
// per-file consts like `const SLUG = "foo"` or `const PRODUCT_URL = \`${BASE}/x\``
// before comparing @id strings across files — otherwise two files that both use
// `${SLUG}#article` collide as duplicates even though SLUG differs per file.
function extractLocals(src) {
  const consts = {};
  const re = /const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:`([^`]*)`|"([^"]*)"|'([^']*)')\s*;?/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    consts[m[1]] = m[2] ?? m[3] ?? m[4];
  }
  // Fix-point expansion for chained consts.
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;
    for (const k of Object.keys(consts)) {
      const next = consts[k].replace(/\$\{([A-Za-z_$][\w$]*)\}/g, (mm, name) =>
        consts[name] !== undefined ? consts[name] : mm
      );
      if (next !== consts[k]) { consts[k] = next; changed = true; }
    }
    if (!changed) break;
  }
  return consts;
}

function substituteLocals(id, consts) {
  return id.replace(/\$\{([A-Za-z_$][\w$]*)\}/g, (m, name) =>
    consts[name] !== undefined ? consts[name] : m
  );
}

const defs = new Map(); // normalized @id -> [{file, line, raw}]
const refs = [];        // { normalized @id, file, line, raw, resolvable }

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  const consts = extractLocals(src);
  lines.forEach((line, i) => {
    const m = line.match(/"@id":\s*(?:`([^`]+)`|"([^"]+)")/);
    if (!m) return;
    const raw = m[1] || m[2];
    // The object literal enclosing @id determines classification. A definition
    // has @type in that same object; a reference has only @id.
    //
    // Case A — self-contained single-line inline object: `{ "@id": "..." }` or
    //   `{ "@type": "X", "@id": "..." }`. Detected by presence of `{` before
    //   @id AND `}` after @id on the same line. Same-line @type → def, else
    //   ref (regardless of what parent objects contain).
    // Case B — multi-line object: @id is on its own line inside a larger
    //   `{ ... }`. Scan back for @type; break on `}` that closes a sibling.
    const idIdx = line.indexOf('"@id"');
    const openBraceBeforeId = line.lastIndexOf("{", idIdx) > line.lastIndexOf("}", idIdx);
    const closeBraceAfterId = line.indexOf("}", idIdx) !== -1;
    const selfContained = openBraceBeforeId && closeBraceAfterId;
    let isDef;
    if (selfContained) {
      isDef = /"@type":/.test(line);
    } else {
      isDef = /"@type":/.test(line);
      if (!isDef) {
        // Walk back tracking brace balance. My @id lives inside some `{...}`.
        // Every `{` we cross going backward means we've traversed an OPENING
        // brace of an outer scope — once that happens, any @type we see on
        // that line or further back belongs to an outer object, not mine.
        // Every `}` we cross means a SIBLING closed object.
        let balance = 0;
        for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
          const prev = lines[j];
          if (/"@type":/.test(prev) && balance === 0) {
            isDef = true;
            break;
          }
          for (const ch of prev) {
            if (ch === "{") balance++;
            else if (ch === "}") balance--;
          }
          if (balance > 0) break; // reached opening brace of our object's scope
        }
      }
    }
    const id = normalize(substituteLocals(raw, consts));
    if (isDef) {
      if (!defs.has(id)) defs.set(id, []);
      defs.get(id).push({ file, line: i + 1, raw });
    } else {
      // Reference. Resolvable = no unresolved `${...}` template variables
      // remain and no `<HOST>` placeholder was inserted from a template we
      // couldn't map to a concrete site host.
      const resolvable = !/\$\{/.test(id);
      refs.push({ id, file, line: i + 1, raw, resolvable });
    }
  });
}

const dupes = [...defs.entries()].filter(([, locs]) => locs.length > 1);

// A "pattern def" is a def whose normalized @id still contains an unresolvable
// `${...}` template var — the def matches multiple runtime @ids that share the
// pattern (e.g. `<HOST>/blog/${post.slug}#article` matches every article page's
// #article @id). Convert each pattern def to a regex so a specific-instance
// reference like `<HOST>/blog/some-slug#article` can be recognized as resolved.
const patternDefRegexes = [...defs.keys()]
  .filter((id) => /\$\{/.test(id))
  .map((id) => {
    // Escape regex metacharacters, then replace `${...}` with a slug-match group.
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const withPlaceholder = escaped.replace(/\\\$\\\{[^}]*\\\}/g, "[^/#]+");
    return new RegExp(`^${withPlaceholder}$`);
  });

function refMatchesPatternDef(refId) {
  return patternDefRegexes.some((re) => re.test(refId));
}

// Dangling refs: resolvable references with no matching definition anywhere
// (neither exact-match def nor pattern-def). External refs (host is not the
// site's) are ignored — they're pointers to third-party entities we don't own.
const SITE_HOSTS = new Set(["<HOST>"]);
const dangling = refs
  .filter((r) => r.resolvable)
  .filter((r) => {
    const hostMatch = r.id.match(/^(<HOST>|https?:\/\/[^/]+)/);
    if (!hostMatch) return false;
    return SITE_HOSTS.has(hostMatch[1]);
  })
  .filter((r) => !defs.has(r.id) && !refMatchesPatternDef(r.id));

console.log(
  `Scanned ${files.length} files. Found ${defs.size} @id definition(s) and ${refs.length} reference(s).`
);
console.log();

if (dupes.length === 0 && dangling.length === 0) {
  console.log("PASS — no duplicate @id definitions and no dangling references.");
  process.exit(0);
}

if (dupes.length > 0) {
  console.log(`FAIL — ${dupes.length} @id(s) defined in multiple places:`);
  console.log();
  for (const [id, locs] of dupes) {
    console.log(`  ${id}`);
    for (const { file, line, raw } of locs) {
      console.log(`    ${file}:${line}   ${raw}`);
    }
    console.log();
  }
}

if (dangling.length > 0) {
  console.log(`FAIL — ${dangling.length} dangling site-owned @id reference(s):`);
  console.log();
  for (const { id, file, line, raw } of dangling) {
    console.log(`  ${id}`);
    console.log(`    ${file}:${line}   ${raw}`);
  }
  console.log();
}
process.exit(1);
