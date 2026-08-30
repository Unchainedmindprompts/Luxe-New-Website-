#!/usr/bin/env node
/**
 * Guards for commercial-intent pathways, unique titles, and conversion events.
 * Node built-ins only. Exit 1 on failure.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ARTICLE_PATHWAYS, PRODUCT_DECISION_ARTICLES } from "../lib/article-pathways.ts";
import { CONVERSION_EVENTS, isCustomConversionEvent, shouldSendMetaCustomEvents } from "../lib/conversion-events.ts";
import { sanitizeOriginatingPath } from "../lib/originating-path.ts";
import { productPages } from "../lib/product-data.ts";
import { areaPages } from "../lib/area-data.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const exists = (p) => existsSync(join(ROOT, p));

const results = [];
let failures = 0;

function test(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => {
      if (!cond) problems.push(detail);
    },
    equal: (a, b, detail) => {
      if (a !== b) problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
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

test("1  pathway slugs exist as markdown files", (t) => {
  for (const slug of Object.keys(ARTICLE_PATHWAYS)) {
    t.ok(exists(`content/blog/${slug}.md`), `missing content/blog/${slug}.md`);
  }
});

test("2  pathway destinations are existing product and area routes", (t) => {
  for (const [slug, pathway] of Object.entries(ARTICLE_PATHWAYS)) {
    const productSlug = pathway.productHref.replace("/products/", "");
    t.ok(productPages[productSlug], `${slug} product ${productSlug} is missing`);
    t.equal(pathway.bookHref, "/book", `${slug} book href`);
    if (pathway.areaHref) {
      const areaSlug = pathway.areaHref.replace("/areas/", "");
      t.ok(areaPages[areaSlug], `${slug} area ${areaSlug} is missing`);
    }
  }
});

test("3  SmartDrape points at motorization; Costco article stays unpublished", (t) => {
  const smart = ARTICLE_PATHWAYS["smartdrape-patio-door-shades-in-coeur-dalene-post-falls"];
  t.ok(smart, "SmartDrape pathway missing");
  t.equal(smart.productHref, "/products/motorization", "SmartDrape destination");
  t.ok(
    !exists("content/blog/are-costco-window-treatments-worth-it-a-local-dealer-tells-you-the-truth.md"),
    "Costco markdown should stay absent"
  );
  t.ok(
    ARTICLE_PATHWAYS[
      "why-are-window-treatments-so-expensive-a-first-time-buyers-guide-to-smart-stylish-and-budget-friendly-choices"
    ],
    "surviving cost-guide pathway missing"
  );
});

test("4  restringing pathway is bottom-only; pathway articles hide the generic CTA", (t) => {
  const restring = ARTICLE_PATHWAYS["how-to-restring-blinds-like-a-pro-step-by-step-guide"];
  t.equal(restring.placement, "bottom-only", "restringing placement");
  t.ok(/replacement/i.test(restring.heading), "restringing heading");
  const blog = read("app/blog/[slug]/page.tsx");
  t.ok(
    blog.includes("const showGenericConsultCta = !pathway"),
    "generic consult CTA still shows on pathway articles"
  );
});

test("5  decision-article slugs exist", (t) => {
  for (const articles of Object.values(PRODUCT_DECISION_ARTICLES)) {
    for (const article of articles) {
      t.ok(exists(`content/blog/${article.slug}.md`), `missing ${article.slug}`);
    }
  }
});

test("6  conversion events are custom and never Lead or Schedule", (t) => {
  const names = Object.values(CONVERSION_EVENTS);
  t.ok(names.includes("ConsultCtaClick"), "ConsultCtaClick");
  t.ok(names.includes("PhoneClick"), "PhoneClick");
  t.ok(names.includes("ContactCtaClick"), "ContactCtaClick");
  t.ok(names.includes("ProductCtaClick"), "ProductCtaClick");
  t.ok(names.includes("ContactFormSubmit"), "ContactFormSubmit");
  for (const name of names) {
    t.ok(isCustomConversionEvent(name), `${name} is registered`);
    t.ok(name !== "Lead" && name !== "Schedule", `${name} must not be a standard Meta event`);
  }
  const conversion = read("lib/conversion-events.ts");
  t.ok(conversion.includes('fbq("trackCustom"'), "uses trackCustom");
  t.ok(!conversion.includes('fbq("track", "Lead"'), "does not fire Lead");
  t.ok(!conversion.includes('fbq("track", "Schedule"'), "does not fire Schedule");
});

test("7  originating-path sanitizer keeps a path and rejects unsafe values", (t) => {
  t.equal(sanitizeOriginatingPath("/blog/faux-wood"), "/blog/faux-wood", "safe path");
  t.equal(sanitizeOriginatingPath("/blog/x?email=a@b.com"), "/blog/x", "query is stripped");
  t.equal(sanitizeOriginatingPath("/ok#hash"), "/ok", "hash is stripped");
  t.equal(sanitizeOriginatingPath("https://evil.example/path"), "", "protocol rejected");
  t.equal(sanitizeOriginatingPath("//evil.example"), "", "protocol-relative rejected");
  t.equal(sanitizeOriginatingPath("not-a-path"), "", "relative rejected");
  t.equal(sanitizeOriginatingPath("/path?phone=208-660-8643"), "/path", "phone query stripped");
  t.equal(sanitizeOriginatingPath("/path?name=Jane+Doe"), "/path", "name query stripped");
});

test("8  commercial titles and descriptions are unique", (t) => {
  const titles = [
    "Custom Window Treatments in Coeur d'Alene & Post Falls | Luxe Window Works",
    productPages.blinds.metaTitle,
    productPages.motorization.metaTitle,
    productPages["roller-shades"].metaTitle,
    productPages.shutters.metaTitle,
    productPages["cellular-shades"].metaTitle,
    areaPages["post-falls"].metaTitle,
    areaPages["coeur-d-alene"].metaTitle,
  ];
  const descriptions = [
    productPages.blinds.metaDescription,
    productPages.motorization.metaDescription,
    productPages["roller-shades"].metaDescription,
    productPages.shutters.metaDescription,
    productPages["cellular-shades"].metaDescription,
    areaPages["post-falls"].metaDescription,
    areaPages["coeur-d-alene"].metaDescription,
  ];
  t.equal(new Set(titles).size, titles.length, "duplicate titles");
  t.equal(new Set(descriptions).size, descriptions.length, "duplicate descriptions");
});

test("9  no new articles, no Ask Luxe, no scheduling contract edits", (t) => {
  const blogFiles = readdirSync(join(ROOT, "content/blog")).filter((f) => f.endsWith(".md"));
  t.ok(blogFiles.length >= 40, "blog corpus still present");
  t.ok(!read("app/layout.tsx").includes("/ask-luxe"), "layout does not revive Ask Luxe");
  t.ok(exists("public/agent.json"), "agent.json left in place");
  const calendly = read("app/book/calendly-schedule-tracking.ts");
  t.ok(calendly.includes("Schedule"), "Calendly Schedule tracker still present");
});

test("10  Meta custom events stay off Preview hosts", (t) => {
  t.equal(shouldSendMetaCustomEvents("luxewindowworks.com", "production"), true, "production host");
  t.equal(shouldSendMetaCustomEvents("www.luxewindowworks.com", "production"), true, "www production");
  t.equal(
    shouldSendMetaCustomEvents("luxe-new-website-git-cursor-com-6d3dc1-mark-abplanalps-projects.vercel.app", "preview"),
    false,
    "preview env"
  );
  t.equal(shouldSendMetaCustomEvents("localhost", "development"), false, "local");
  t.equal(
    shouldSendMetaCustomEvents("example.vercel.app", "production"),
    false,
    "vercel.app host is never treated as production"
  );
});

test("11  consultation block is context-aware and area pages do not double the buttons", (t) => {
  const expectSource = read("components/ConsultationExpect.tsx");
  t.ok(expectSource.includes("productName"), "productName prop missing");
  t.ok(expectSource.includes("showCtas"), "showCtas prop missing");
  t.ok(
    read("app/products/[slug]/page.tsx").includes("productName={product.name}"),
    "product pages do not pass the product name"
  );
  t.ok(
    read("app/areas/[slug]/page.tsx").includes("showCtas={false}"),
    "area pages still render a second consult button pair"
  );
});

test("12  new copy does not name excluded manufacturers or publish GSC numbers", (t) => {
  const files = [
    "lib/article-pathways.ts",
    "components/ArticlePathway.tsx",
    "components/ConsultationExpect.tsx",
    "components/RelatedDecisionArticles.tsx",
    "lib/conversion-events.ts",
    "lib/originating-path.ts",
  ];
  const banned = /Hunter Douglas|Vignette|Graber|Bali|67,477|79\.6%/;
  for (const file of files) {
    t.ok(!banned.test(read(file)), `${file} contains banned names or GSC numbers`);
  }
});

for (const result of results) {
  if (result.problems.length) {
    console.error(`FAIL  ${result.name}`);
    for (const problem of result.problems) console.error(`  - ${problem}`);
  } else {
    console.log(`PASS  ${result.name}`);
  }
}

if (failures) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}

console.log("\nPASS — commercial pathways, unique titles, and custom events hold.");
