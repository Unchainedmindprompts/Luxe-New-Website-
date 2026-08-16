#!/usr/bin/env node
// Guards four claims in the rendered graph that are easy to reintroduce by
// accident and expensive to get wrong. Runs at postbuild beside the entity
// sweep, so a regression fails `npm run build` rather than reaching production.
//
//   1. No page claims customers can order or check out online. Luxe quotes a
//      project after measuring it; there is no checkout to send anyone to.
//   2. Every article's author carries the canonical #owner id AND its type and
//      name, so a single-page reader learns who wrote it.
//   3. Every article's publisher does the same for #business.
//   4. The owner and the business each have exactly one identity. A second
//      Person named Mark, or a second node carrying the business name under a
//      different id, means the graph has split one real thing into two.
//
// Rule 4 is the reason 2 and 3 are safe to state at all: inlining identity on
// every article is only correct while it stays one entity.

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const APP_DIR = join(process.cwd(), ".next", "server", "app");
const SITE = "https://www.luxewindowworks.com";
const OWNER_ID = `${SITE}/#owner`;
const BUSINESS_ID = `${SITE}/#business`;

/** Phrases that would promise a transaction this business cannot complete. */
const ORDERING_CLAIMS = [
  /direct online ordering/i,
  /order (?:custom )?(?:\w+ ){0,3}online (?:now|today|here)/i,
  /\border online\b(?!\s+or\b)/i,
  /\bbuy (?:it |them |your )?online\b/i,
  /\bpurchase online\b/i,
  /\bshop online\b/i,
  /\badd to cart\b/i,
  /\bonline checkout\b(?!\.)/i,
  /\bbook instantly\b/i,
  /\binstant(?:ly)? book/i,
];

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(p));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function jsonLdBlocks(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")));
    } catch {
      // A block that will not parse is the entity sweep's problem, not this one.
    }
  }
  return blocks;
}

function walk(node, visit) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, visit));
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const value of Object.values(node)) walk(value, visit);
}

const typesOf = (node) => [].concat(node["@type"] ?? []);

const failures = [];
const files = htmlFiles(APP_DIR);

// Every node claiming to BE the owner or the business, wherever it renders.
const ownerNodes = [];
const businessNodes = [];
// Nodes carrying one of those names WITHOUT the canonical id — a split identity.
const impostors = [];

let articlesChecked = 0;

for (const file of files) {
  const page = "/" + relative(APP_DIR, file).replace(/\.html$/, "").replace(/^index$/, "");
  const html = readFileSync(file, "utf-8");

  // ── 1. Ordering claims ──────────────────────────────────────────────────
  // Checked against the whole rendered document, not only JSON-LD: a promise
  // in visible copy misleads a reader exactly as much as one in the graph.
  for (const claim of ORDERING_CLAIMS) {
    const hit = html.match(claim);
    if (hit) {
      failures.push(
        `Unsupported ordering claim on ${page}\n    matched: ${JSON.stringify(hit[0])}\n` +
          `    Luxe has no checkout — a project is quoted after an in-home measure.`
      );
    }
  }

  for (const block of jsonLdBlocks(html)) {
    walk(block, (node) => {
      const id = node["@id"];
      const types = typesOf(node);

      if (id === OWNER_ID) ownerNodes.push({ page, types, name: node.name });
      if (id === BUSINESS_ID) businessNodes.push({ page, types, name: node.name });

      // A node wearing the owner's or the business's name under some other id.
      if (typeof node.name === "string" && id !== undefined) {
        const isOwnerName = node.name === "Mark Abplanalp";
        const isBusinessName = node.name === "Luxe Window Works";
        if (isOwnerName && id !== OWNER_ID) impostors.push({ page, id, name: node.name });
        if (isBusinessName && id !== BUSINESS_ID && types.includes("Organization")) {
          impostors.push({ page, id, name: node.name });
        }
      }

      // ── 2 & 3. Article author and publisher ──────────────────────────────
      if (!types.some((t) => t === "Article" || t === "BlogPosting")) return;
      articlesChecked += 1;

      for (const [role, expectedId] of [
        ["author", OWNER_ID],
        ["publisher", BUSINESS_ID],
      ]) {
        const value = node[role];
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          failures.push(`Article ${role} missing or malformed on ${page}`);
          continue;
        }
        if (value["@id"] !== expectedId) {
          failures.push(
            `Article ${role} is not the canonical entity on ${page}\n` +
              `    expected @id ${expectedId}, got ${JSON.stringify(value["@id"])}`
          );
        }
        if (typesOf(value).length === 0) {
          failures.push(`Article ${role} has no @type on ${page} — not self-describing`);
        }
        if (typeof value.name !== "string" || value.name.trim() === "") {
          failures.push(`Article ${role} has no name on ${page} — not self-describing`);
        }
      }
    });
  }
}

// ── 4. One identity each ──────────────────────────────────────────────────
for (const [label, nodes] of [["owner", ownerNodes], ["business", businessNodes]]) {
  // Only nodes that actually declare a type can disagree about one. A bare
  // `{ "@id": ... }` reference has none by design — that is what makes it a
  // reference — so including them here would report every correct pointer as a
  // conflict, which is exactly what the first run of this script did.
  const declared = nodes.filter((n) => n.types.length > 0);
  const shapes = new Set(declared.map((n) => JSON.stringify(n.types)));
  if (shapes.size > 1) {
    failures.push(
      `The ${label} entity renders with conflicting @type: ${[...shapes].join("  vs  ")}`
    );
  }
  if (declared.length === 0) {
    failures.push(`The ${label} entity is never defined — only referenced`);
  }
}
for (const { page, id, name } of impostors) {
  failures.push(
    `Duplicate identity on ${page}: "${name}" appears under ${id}, not the canonical id`
  );
}

console.log(
  `Scanned ${files.length} rendered pages. Checked ${articlesChecked} article node(s), ` +
    `${ownerNodes.length} owner node(s), ${businessNodes.length} business node(s).`
);
console.log();

if (failures.length === 0) {
  console.log(
    "PASS — no unsupported ordering claims, article author and publisher are " +
      "canonical and self-describing, and the owner and business each have one identity."
  );
  process.exit(0);
}

console.log(`FAIL — ${failures.length} finding(s):`);
console.log();
for (const failure of failures) console.log(`  ${failure}\n`);
process.exit(1);
