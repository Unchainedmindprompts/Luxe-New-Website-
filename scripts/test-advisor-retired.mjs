#!/usr/bin/env node
/**
 * Ask Luxe stays retired.
 *
 * The conversational advisor was discontinued as a product decision after
 * customer-experience testing. This file is what is left of it: not a test of
 * the feature, but a test that the feature does not come back by accident.
 *
 * IT USED TO TEST THE OPPOSITE. An earlier version asserted that the reasoning
 * layer was still on disk, because the surface had been withdrawn *pending a
 * redesign* and deleting the engine would have thrown away work we expected to
 * use again. There is no redesign now, the implementation is gone, and the
 * check has been inverted: what was "the engine must still exist" is now "no
 * implementation may reappear".
 *
 * THE WORK IS NOT LOST. It is preserved on `feat/ask-luxe` (PR #197, closed
 * without merging) and in this repository's history. Nothing here is an
 * argument for keeping dead code in the production tree.
 *
 * WHY IT EXISTS AT ALL. Every check below is something that reintroduced the
 * surface by accident once already or plausibly could: a CTA restored in a copy
 * edit, a page file recreated, an endpoint left answering because only the page
 * was deleted. Noindex is not access control, and neither is nobody linking to
 * it.
 *
 * Node built-ins only. Exit 1 on failure.
 */
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const exists = (p) => existsSync(join(ROOT, p));

const results = [];
let failures = 0;

function test(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => { if (!cond) problems.push(detail); },
    equal: (a, b, detail) => {
      if (a !== b) problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
    },
  };
  try { fn(t); } catch (error) { problems.push(`threw: ${error?.message ?? error}`); }
  if (problems.length) failures++;
  results.push({ name, problems });
}

const ADVISOR_ROUTES = ["/show-me-my-options", "/ask-luxe"];

test("1  no advisor page is served at any route", (t) => {
  for (const dir of ["app/show-me-my-options", "app/ask-luxe"]) {
    t.ok(!exists(dir), `${dir} exists — the advisor page is reachable again`);
  }
  t.ok(!exists("app/show-me-my-options/page.tsx"), "the retired page file is back");
});

test("2  every advisor URL redirects somewhere safe", (t) => {
  const config = read("next.config.mjs");
  for (const route of ADVISOR_ROUTES) {
    const entry = new RegExp(`source: '${route}',\\s*\\n\\s*destination: '([^']+)',\\s*\\n\\s*permanent: (true|false)`);
    const match = entry.exec(config);
    t.ok(Boolean(match), `${route} has no redirect`);
    if (!match) continue;
    t.equal(match[1], "/contact", `${route} does not redirect to the agreed destination`);
    // Temporary even though the decision is permanent: a 308 is cached by
    // browsers indefinitely and cannot be withdrawn from this codebase, so it
    // would commit the URL forever on the strength of today's plan.
    t.equal(match[2], "false", `${route} redirects permanently — that cannot be undone later`);
  }
  // The destination has to be a real page.
  t.ok(exists("app/contact/page.tsx"), "the redirect destination does not exist");
  t.ok(exists("app/book/page.tsx"), "the booking page is missing");
});

test("3  no customer-facing page links into the advisor", (t) => {
  const pages = [
    "app/page.tsx",
    "app/products/page.tsx",
    "app/privacy/page.tsx",
    "components/Header.tsx",
    "components/Footer.tsx",
    "lib/constants.ts",
  ].filter((p) => exists(p));

  for (const page of pages) {
    const source = read(page);
    for (const route of ADVISOR_ROUTES) {
      t.ok(!source.includes(`href="${route}"`), `${page} still links to ${route}`);
    }
    t.ok(!/Show Me My Options/i.test(source), `${page} still shows the advisor CTA label`);
    t.ok(!/Ask Luxe/i.test(source), `${page} still shows the Ask Luxe CTA label`);
  }

  // The homepage keeps its booking CTA — removing the advisor must not have
  // taken the primary conversion path with it.
  t.ok(/Book My Free In-Home Consultation/.test(read("app/page.tsx")), "the homepage booking CTA was lost");
  t.ok(/href="\/book"/.test(read("app/products/page.tsx")), "the products hub booking link was lost");
});

test("4  no advisor endpoint exists to be reached", (t) => {
  // Previously a kill switch. The endpoint is deleted now, so the stronger
  // statement is available: there is nothing to switch on.
  t.ok(!exists("app/api/advisor"), "the advisor API route is back");
  t.ok(!exists("app/api/advisor/route.ts"), "the advisor route file is back");
  // The endpoints that remain are the ones the site actually uses.
  t.ok(exists("app/api/consultation/route.ts"), "the consultation endpoint was lost");
});

test("5  the sitemap allowlist names no route that no longer exists", (t) => {
  const allowlist = read("config/verify-allowlist.mjs");
  for (const route of ADVISOR_ROUTES) {
    t.ok(!allowlist.includes(route), `the allowlist still exempts ${route}`);
  }
});

test("6  the privacy policy no longer describes a feature nobody can use", (t) => {
  const privacy = read("app/privacy/page.tsx").replace(/\/\*[\s\S]*?\*\//g, " ");
  for (const stale of [/window-treatment advisor/i, /Anthropic/, /AI-assisted/i, /the advisor/i]) {
    t.ok(!stale.test(privacy), `the privacy policy still describes the advisor: ${stale}`);
  }
  // The disclosures that remain true are untouched.
  for (const kept of [/Microsoft Clarity/, /Meta Pixel/, /Vercel Analytics/, /Calendly/, /Resend/]) {
    t.ok(kept.test(privacy), `an unrelated disclosure was lost: ${kept}`);
  }
  t.ok(/Two places on this site ask for information/.test(privacy.replace(/\s+/g, " ")), "the form count was not corrected");
});

test("7  no advisor implementation remains in the production tree", (t) => {
  // The inverse of what this test used to assert. Preserved on `feat/ask-luxe`
  // and in history; not carried in production as dead weight.
  for (const gone of [
    "lib/advisor",
    "app/api/advisor",
    "scripts/test-advisor-engine.mjs",
    "scripts/test-advisor-phase-b.mjs",
    "scripts/test-advisor-schema-live.mjs",
    "scripts/eval-advisor-live.mjs",
    "scripts/advisor-scenarios.json",
    "docs/quality/advisor-phase-b.md",
  ]) {
    t.ok(!exists(gone), `${gone} is back — the retired implementation returned`);
  }

  // No package depends on the model provider any more, and no source imports it.
  const pkg = read("package.json");
  t.ok(!/@anthropic-ai\/sdk/.test(pkg), "the Anthropic SDK is a dependency again");
  t.ok(!/"test:advisor"|"eval:advisor/.test(pkg), "an advisor script is wired up again");

  // And the environment example no longer advertises a feature that is gone.
  if (exists(".env.local.example")) {
    const env = read(".env.local.example");
    t.ok(!/ADVISOR_ENABLED/.test(env), "ADVISOR_ENABLED is documented again");
    t.ok(!/ANTHROPIC_API_KEY/.test(env), "ANTHROPIC_API_KEY is documented again");
  }
});

// ── report ─────────────────────────────────────────────────────────────────

console.log("Ask Luxe — discontinued, and staying that way");
console.log("  advisor pages on the site:   0");
console.log("  advisor implementation:      0 files");
console.log(`  advisor URLs redirected:     ${ADVISOR_ROUTES.length} → /contact (temporary)`);
console.log(`  scenarios:                   ${results.length}`);
console.log(`  passing:                     ${results.length - failures}/${results.length}\n`);
for (const { name, problems } of results) {
  console.log(`  ${problems.length ? "FAIL" : "pass"}  ${name}`);
  for (const p of problems) console.log(`          - ${p}`);
}
if (failures) {
  console.log(`\nFAIL — ${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log(
  "\nPASS — no advisor page is served, no advisor implementation remains, every advisor URL " +
    "lands on /contact, and no page links to one."
);
