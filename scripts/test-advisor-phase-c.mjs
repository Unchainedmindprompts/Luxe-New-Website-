#!/usr/bin/env node
/**
 * Luxe Window Advisor — the customer-facing surface is withdrawn.
 *
 * This harness used to check how the advisor rendered. The advisor page has
 * been removed from the site pending a redesign, so there is nothing to render
 * and the honest thing for this file to test is that it STAYS removed.
 *
 * The full Phase C rendering suite is not lost — it lives on the redesign
 * branch (`feat/ask-luxe`, PR #197) along with the experience it tests, and
 * comes back with it.
 *
 * WHY THIS EXISTS AT ALL. Every check below is something that reintroduced the
 * surface by accident once already or plausibly could: a CTA restored in a
 * copy edit, a page file recreated, an endpoint left answering because only the
 * page was deleted. Noindex is not access control, and neither is nobody
 * linking to it.
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
    // Temporary on purpose: a 308 is cached by browsers indefinitely and
    // would keep sending returning visitors to /contact after a redesign.
    t.equal(match[2], "false", `${route} redirects permanently — a redesign could not undo it`);
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

test("4  the advisor endpoint is off unless explicitly enabled", (t) => {
  const route = read("app/api/advisor/route.ts");
  t.ok(/ADVISOR_ENABLED === "true"/.test(route), "the endpoint has no kill switch");
  t.ok(/status: 404/.test(route), "the disabled endpoint does not 404");
  // Absence must mean disabled: production needs no configuration to be safe.
  t.ok(!/ADVISOR_ENABLED !== "false"/.test(route), "the switch defaults to enabled");
  t.ok(
    /if \(!advisorEnabled\(\)\)/.test(route),
    "the switch is not checked at the top of the handler"
  );
  // And it is checked before any provider work happens.
  const guardAt = route.indexOf("advisorEnabled()");
  const providerAt = route.indexOf("createAnthropicProvider()");
  t.ok(guardAt > 0 && guardAt < providerAt, "the provider is constructed before the switch is checked");
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

test("7  the reasoning work is preserved, not deleted", (t) => {
  // Removing the surface must not have taken the engine with it.
  for (const kept of [
    "lib/advisor/engine.ts",
    "lib/advisor/types.ts",
    "lib/advisor/knowledge/products.ts",
    "lib/advisor/knowledge/rules.ts",
    "lib/advisor/knowledge/brand-responses.ts",
    "lib/advisor/server/advisor.ts",
    "lib/advisor/server/extraction.ts",
    "lib/advisor/server/ledger.ts",
    "scripts/test-advisor-engine.mjs",
    "scripts/test-advisor-phase-b.mjs",
  ]) {
    t.ok(exists(kept), `${kept} was deleted — this was a surface removal, not a teardown`);
  }
  // The approved Hunter Douglas wording in particular.
  const brand = read("lib/advisor/knowledge/brand-responses.ts");
  t.ok(/3G Capital/.test(brand), "the canonical brand response was altered");
});

// ── report ─────────────────────────────────────────────────────────────────

console.log("Luxe Window Advisor — customer-facing surface withdrawn");
console.log("  advisor pages on the site:   0");
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
  "\nPASS — no advisor page is served, every advisor URL lands on /contact, no page links to " +
    "one, the endpoint is off by default, and the reasoning layer is intact for the redesign."
);
