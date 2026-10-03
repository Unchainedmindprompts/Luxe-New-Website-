#!/usr/bin/env node
// Public HTML is the contract: a crawler must receive the real player and
// one canonical video node without executing or clicking client-side UI.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const site = "https://www.luxewindowworks.com";
const cases = [
  { slug: "powerview-roller-shades-west-facing-bedroom", id: "KTcXw-7BbYM", duration: "PT0M48S", date: "2026-10-03T09:50:27-07:00", services: ["roller-shades", "solar-shades", "motorization", "hunter-douglas"] },
  { slug: "vignette-duolite-light-filtering-room-darkening", id: "bo8RyllgYCI", duration: "PT0M58S", date: "2026-10-03T09:58:23-07:00", services: ["roman-shades", "hunter-douglas"] },
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
  assert.deepEqual(video.about.map((ref) => ref["@id"]), item.services.map((slug) => `${site}/products/${slug}#service`));
  const webpage = graph.find((node) => node["@type"] === "WebPage");
  assert.equal(webpage.mainEntity["@id"], video["@id"]);
  assert.equal(webpage.isPartOf["@id"], `${site}/#website`);
  assert.ok(graph.some((node) => node["@type"] === "BreadcrumbList"));
  assert.ok(body.includes(`rel="canonical" href="${url}"`));
  assert.ok(body.includes(`<iframe src="${video.embedUrl}?rel=0&amp;playsinline=1"`));
  assert.ok(body.includes('referrerPolicy="strict-origin-when-cross-origin"'));
  assert.ok(body.includes(`href="https://www.youtube.com/watch?v=${item.id}"`));
  assert.ok(body.includes(`href="/videos/${cases.find((other) => other.id !== item.id).slug}"`));
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
for (const slug of ["exterior-solar-shades", "cellular-shades", "shutters"]) {
  const body = visible(html(`products/${slug}`));
  for (const item of cases) assert.ok(!body.includes(`href="/videos/${item.slug}"`), `Unrelated video injected into ${slug}`);
}
console.log("PASS video associations stay confined to the relevant services");
