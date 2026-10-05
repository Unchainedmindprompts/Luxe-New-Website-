#!/usr/bin/env node
// Public HTML is the contract: a crawler must receive the real player and
// one canonical video node without executing or clicking client-side UI.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const site = "https://www.luxewindowworks.com";
const cases = [
  { slug: "powerview-roller-shades-west-facing-bedroom", id: "KTcXw-7BbYM", duration: "PT0M48S", date: "2026-10-03T09:50:27-07:00", services: ["roller-shades", "solar-shades", "motorization", "hunter-douglas"] },
  { slug: "vignette-duolite-light-filtering-room-darkening", id: "bo8RyllgYCI", duration: "PT0M58S", date: "2026-10-03T09:58:23-07:00", services: ["roman-shades", "hunter-douglas"] },
  { slug: "large-scale-commercial-window-shades", id: "Jh-f3d5x7vM", duration: "PT0M37S", date: "2026-10-05T08:34:17-07:00", services: [], subject: "Commercial window shades in a large glass-walled space" },
  { slug: "corradi-louvered-patio-roof-exterior-shade", id: "GX1DkG5Ku3E", duration: "PT0M49S", date: "2026-10-05T09:06:49-07:00", services: ["exterior-solar-shades"], subject: "Corradi louvered patio roof and exterior side shade" },
];
const html = (path) => readFileSync(`.next/server/app/${path}.html`, "utf8");
const visible = (text) => text.replace(/<script\b[\s\S]*?<\/script>/gi, "");
const nodes = (text) => [...text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => {
  const data = JSON.parse(match[1]);
  return data["@graph"] || [data];
});
const sitemap = readFileSync(".next/server/app/sitemap.xml.body", "utf8");

for (const item of cases) {
  const path = `/videos/${item.slug}`;
  const url = `${site}${path}`;
  const page = html(path.slice(1));
  const body = visible(page);
  const graph = nodes(page);
  assert.equal(graph.filter((node) => node["@type"] === "VideoObject").length, 1);
  const video = graph.find((node) => node["@type"] === "VideoObject");
  assert.equal(video["@id"], `${url}#video`);
  assert.equal(video.url, url);
  assert.equal(video.mainEntityOfPage, url);
  assert.equal(video.duration, item.duration);
  assert.equal(video.uploadDate, item.date);
  assert.equal(video.embedUrl, `https://www.youtube.com/embed/${item.id}`);
  assert.equal(video.publisher["@id"], `${site}/#business`);
  assert.equal(video.thumbnailUrl, `https://img.youtube.com/vi/${item.id}/maxresdefault.jpg`);
  for (const unverified of ["contentUrl", "creator", "author", "copyrightHolder", "contentLocation", "locationCreated"]) assert.ok(!(unverified in video), `Unverified ${unverified} on ${path}`);
  if (item.subject) {
    assert.deepEqual(video.about, { "@type": "Thing", name: item.subject });
    assert.ok(body.includes(`dateTime="${item.date}">October 5, 2026</time>`));
    const brandPage = html("products/hunter-douglas");
    assert.ok(!visible(brandPage).includes(`href="${path}"`), `Unverified Hunter Douglas association on ${path}`);
    assert.ok(!JSON.stringify(nodes(brandPage)).includes(`${url}#video`), `Unverified Hunter Douglas graph edge on ${path}`);
  } else {
    assert.deepEqual(video.about.map((ref) => ref["@id"]), item.services.map((slug) => `${site}/products/${slug}#service`));
    assert.ok(body.includes(`dateTime="${item.date}">October 3, 2026</time>`));
  }
  if (item.slug === "large-scale-commercial-window-shades") {
    assert.equal(video.name, "Large-Scale Commercial Window Shades | Portfolio Highlight");
    assert.equal(video.description, "A full wall of glass. A clean, coordinated shade installation. This commercial project highlights how window shades can complement the architecture of a large space.");
    const breadcrumb = graph.find((node) => node["@type"] === "BreadcrumbList");
    assert.equal(breadcrumb.itemListElement[1].item, `${site}/gallery`);
    assert.ok(!/Hunter Douglas|PowerView|motorized|Apple|Cupertino|installed by|our installation/i.test(JSON.stringify(video)));
  }
  if (item.slug === "corradi-louvered-patio-roof-exterior-shade") {
    assert.equal(video.name, "Corradi Louvered Patio Roof & Exterior Shade | Outdoor Living");
    assert.match(video.description, /adjustable roof louvers overhead and a shade along the side of the patio/);
    assert.ok(body.includes("Adjustable patio roof louvers") && body.includes("Exterior patio shade"));
    assert.ok(body.includes('href="/products/exterior-solar-shades"') && body.includes('href="/gallery#outdoor"'));
    const breadcrumb = graph.find((node) => node["@type"] === "BreadcrumbList");
    assert.equal(breadcrumb.itemListElement[1].item, `${site}/products/exterior-solar-shades`);
    assert.ok(!/Alba|Bavona|Pergotenda|Somfy|installed by|our installation|North Idaho|Coeur d|Post Falls/i.test(JSON.stringify(video)), "Unverified Corradi model, location or installation attribution");
  }
  const webpage = graph.find((node) => node["@type"] === "WebPage");
  assert.equal(webpage.mainEntity["@id"], video["@id"]);
  assert.equal(webpage.isPartOf["@id"], `${site}/#website`);
  assert.ok(graph.some((node) => node["@type"] === "BreadcrumbList"));
  assert.ok(body.includes(`rel="canonical" href="${url}"`));
  assert.ok(body.includes(`<iframe src="${video.embedUrl}?rel=0&amp;playsinline=1"`));
  assert.ok(body.includes('referrerPolicy="strict-origin-when-cross-origin"'));
  assert.ok(body.includes(`href="https://www.youtube.com/watch?v=${item.id}"`));
  for (const other of cases.filter((other) => other.id !== item.id)) {
    assert.ok(body.includes(`href="/videos/${other.slug}"`), `Missing related video ${other.slug}`);
  }
  const gallery = html("gallery");
  assert.ok(visible(gallery).includes(`href="${path}"`), "Missing gallery backlink");
  const galleryNode = nodes(gallery).find((node) => node["@id"] === `${site}/gallery#webpage`);
  assert.ok(galleryNode.hasPart.some((ref) => ref["@id"] === video["@id"]), "Missing gallery graph edge");
  assert.ok(body.includes('href="/book"'));
  assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  assert.ok(!body.includes('content="noindex'));
  for (const service of item.services) {
    const product = html(`products/${service}`);
    assert.ok(visible(product).includes(`href="${path}"`), `Missing ${service} backlink`);
    const serviceNode = nodes(product).find((node) => node["@id"] === `${site}/products/${service}#service`);
    assert.ok(serviceNode.subjectOf.some((ref) => ref["@id"] === video["@id"]), `Missing ${service} graph edge`);
  }
  console.log(`PASS ${path}: identity, verified metadata, crawlable player, reciprocal service links, canonical, sitemap, and no invented attribution`);
}
for (const slug of ["exterior-solar-shades", "cellular-shades", "shutters", "motorization"]) {
  const body = visible(html(`products/${slug}`));
  for (const item of cases.filter((item) => !item.services.includes(slug))) assert.ok(!body.includes(`href="/videos/${item.slug}"`), `Unrelated video injected into ${slug}`);
}
console.log("PASS video associations stay confined to the relevant services");
