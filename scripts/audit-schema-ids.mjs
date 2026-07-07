#!/usr/bin/env node
// Duplicate-@id-definition sweep for JSON-LD schema graphs.
// Flags any @id that is *defined* (has @type nearby in the same object) in more
// than one source location — the "entity defined twice" failure mode.
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
        for (let j = i - 1; j >= Math.max(0, i - 8); j--) {
          const prev = lines[j];
          if (/\}\s*,?\s*$/.test(prev)) break;
          if (/"@type":/.test(prev)) { isDef = true; break; }
        }
      }
    }
    if (!isDef) return; // pure reference
    const id = normalize(substituteLocals(raw, consts));
    if (!defs.has(id)) defs.set(id, []);
    defs.get(id).push({ file, line: i + 1, raw });
  });
}

const dupes = [...defs.entries()].filter(([, locs]) => locs.length > 1);

console.log(`Scanned ${files.length} files. Found ${defs.size} @id definition(s).`);
console.log();

if (dupes.length === 0) {
  console.log("PASS — no @id is defined in more than one source location.");
  process.exit(0);
}

console.log(`FAIL — ${dupes.length} @id(s) defined in multiple places:`);
console.log();
for (const [id, locs] of dupes) {
  console.log(`  ${id}`);
  for (const { file, line, raw } of locs) {
    console.log(`    ${file}:${line}   ${raw}`);
  }
  console.log();
}
process.exit(1);
