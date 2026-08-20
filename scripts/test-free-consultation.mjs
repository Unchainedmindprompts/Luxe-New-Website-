#!/usr/bin/env node
/**
 * Guards for the /free-consultation Meta landing page.
 *
 * Source-level: every CTA is a relative /book link, the page is noindex+follow,
 * Schedule tracking files are untouched, and the landing source does not fire
 * Meta events or name excluded manufacturers.
 *
 * Node built-ins only. Exit 1 on failure.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const exists = (p) => existsSync(join(ROOT, p));
const sha256 = (p) => createHash("sha256").update(read(p)).digest("hex");

const results = [];
let failures = 0;

function test(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => {
      if (!cond) problems.push(detail);
    },
    equal: (a, b, detail) => {
      if (a !== b) {
        problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
      }
    },
  };
  try {
    fn(t);
  } catch (error) {
    problems.push(`threw: ${error?.message ?? error}`);
  }
  if (problems.length) failures++;
  results.push({ name, problems });
}

const PAGE = "app/free-consultation/page.tsx";
const LAYOUT = "app/free-consultation/layout.tsx";
const TRACKING = "app/book/calendly-schedule-tracking.ts";
const TRACKER = "app/book/CalendlyScheduleTracker.tsx";

const TRACKING_SHA = "b39c2faffefaa5a8a7dca0418e99b61277804aaeb1c7d71a45af05cf69e451e4";
const TRACKER_SHA = "cf739f0be71f32e1dbcbbcbf05e2a2c8dd9190ca2381f2abb5705262d269682e";

const HREF = /href=(["'])([^"']+)\1/g;
const CTA_LABELS = [
  "Schedule Free Consultation",
  "Schedule My Free Consultation",
  "Schedule My Free In-Home Consultation",
];

test("1  landing files and raster images exist", (t) => {
  t.ok(exists(PAGE), "missing app/free-consultation/page.tsx");
  t.ok(exists(LAYOUT), "missing app/free-consultation/layout.tsx");
  for (const img of [
    "public/images/free-consultation-hero.jpg",
    "public/images/free-consultation-install.jpg",
  ]) {
    t.ok(exists(img), `missing ${img}`);
    if (exists(img)) {
      const buf = readFileSync(join(ROOT, img));
      t.ok(buf[0] === 0xff && buf[1] === 0xd8, `${img} is not a JPEG`);
      t.ok(statSync(join(ROOT, img)).size > 20_000, `${img} is too small to be a real photo`);
    }
  }

  const heroWebp = "public/images/free-consultation-hero.webp";
  t.ok(exists(heroWebp), `missing ${heroWebp}`);
  if (exists(heroWebp)) {
    const buf = readFileSync(join(ROOT, heroWebp));
    t.equal(buf.length, 50500, `${heroWebp} byte size changed`);
    t.equal(
      createHash("sha256").update(buf).digest("hex"),
      "10ff73a29e12068b49bca381d7023bf8e1212406c76720a4acfa515427f42090",
      `${heroWebp} hash changed — do not recode`
    );
  }

  const page = read(PAGE);
  t.ok(page.includes("/images/free-consultation-hero.webp"), "hero src is not the new webp");
  t.ok(!page.includes("/images/free-consultation-hero.jpg"), "hero src still points at the old jpg");
});

test("2  every CTA is a relative next/link to /book", (t) => {
  const page = read(PAGE);
  t.ok(!page.includes("calendly.com"), "landing page embeds or links Calendly");
  t.ok(!/<form[\s>]/i.test(page), "landing page includes a form");
  t.ok(!page.includes("CalendlyScheduleTracker"), "landing page mounts the Schedule tracker");

  t.ok(/const BOOK_HREF = "\/book"/.test(page), "BOOK_HREF is no longer the relative /book path");
  t.ok(/href=\{BOOK_HREF\}/.test(page), "BookCta no longer uses href={BOOK_HREF}");
  const ctaUses = [...page.matchAll(/<BookCta[\s>]/g)].length;
  t.ok(ctaUses >= 3, `expected at least 3 BookCta uses, found ${ctaUses}`);

  const hrefs = [...page.matchAll(HREF)].map((m) => m[2]);
  t.ok(hrefs.includes("/"), "logo / home exit is missing");
  t.ok(
    hrefs.every((h) => h === "/book" || h === "/" || h.startsWith("/images/")),
    `unexpected href on the landing page: ${hrefs.filter((h) => h !== "/book" && h !== "/" && !h.startsWith("/images/")).join(", ")}`
  );

  for (const label of CTA_LABELS) {
    t.ok(page.includes(label), `CTA label missing: ${label}`);
  }
});

test("3  page robots are noindex, follow; sitemap and robots.ts leave the URL fetchable", (t) => {
  const layout = read(LAYOUT);
  t.ok(/robots:\s*\{[\s\S]*index:\s*false[\s\S]*follow:\s*true/.test(layout), "layout lost robots: { index: false, follow: true }");

  const robots = read("app/robots.ts");
  t.ok(!robots.includes("/free-consultation"), "robots.ts now disallows /free-consultation");

  const sitemap = read("app/sitemap.ts");
  t.ok(!sitemap.includes("/free-consultation"), "sitemap.ts now lists /free-consultation");
});

test("4  Schedule tracking files are unchanged", (t) => {
  t.ok(exists(TRACKING), `missing ${TRACKING}`);
  t.ok(exists(TRACKER), `missing ${TRACKER}`);
  t.equal(sha256(TRACKING), TRACKING_SHA, `${TRACKING} content changed`);
  t.equal(sha256(TRACKER), TRACKER_SHA, `${TRACKER} content changed`);
});

test("5  landing source has no Schedule track, Article JSON-LD, or excluded manufacturer names", (t) => {
  const source = `${read(PAGE)}\n${read(LAYOUT)}`;
  t.ok(!/fbq\s*\(/.test(source), "landing page calls fbq");
  t.ok(!/["']Schedule["']/.test(source), "landing page mentions the Schedule event");
  t.ok(!/application\/ld\+json/.test(source), "landing page emits JSON-LD");
  t.ok(!/"@type":\s*"Article"/.test(source), "landing page adds Article schema");
  t.ok(!/Hunter Douglas|Vignette|Graber|Bali/i.test(source), "landing page names an excluded manufacturer");
  t.ok(!/Ask Luxe|show-me-my-options/i.test(source), "landing page reintroduces Ask Luxe");
});

console.log("Free consultation landing page");
console.log(`  scenarios:  ${results.length}`);
console.log(`  passing:    ${results.length - failures}/${results.length}\n`);
for (const { name, problems } of results) {
  console.log(`  ${problems.length ? "FAIL" : "pass"}  ${name}`);
  for (const p of problems) console.log(`          - ${p}`);
}
if (failures) {
  console.log(`\nFAIL — ${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log(
  "\nPASS — CTAs go to /book; page is noindex,follow; Schedule files unchanged; no Article JSON-LD or excluded brands."
);
