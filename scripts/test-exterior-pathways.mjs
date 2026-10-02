#!/usr/bin/env node
// Run after npm run build. Checks the rendered pages, not just source strings.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { productPages } from "../lib/product-data.ts";

const built = (route) => readFileSync(new URL(`../.next/server/app/${route}.html`, import.meta.url), "utf8");
const schema = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap((m) => {
  const data = JSON.parse(m[1]);
  return data["@graph"] ?? [data];
});
const visible = (html) => html.replace(/<script\b[^>]*>.*?<\/script>/gs, "");
const hasLink = (html, href) => html.includes(`href="${href}"`);
const exterior = built("products/exterior-solar-shades");
const main = visible(exterior).match(/<main\b.*?<\/main>/s)[0];
const data = productPages["exterior-solar-shades"];
const nodes = schema(exterior);
const serviceId = "https://www.luxewindowworks.com/products/exterior-solar-shades#service";

assert.match(main, /Exterior Solar Shades for Coeur d’Alene Patios/);
assert.match(main, /Request an Exterior Shade Quote/);
assert.ok(hasLink(main, "#exterior-options"));
assert.ok(!hasLink(main, "/estimate"), "exterior page must not imply instant-estimator coverage");
for (const href of ["/areas/coeur-d-alene", "/products/two#shadesol-alfresco", "/products/solar-shades", "/products/motorization", "/book"]) assert.ok(hasLink(main, href), `missing contextual link ${href}`);
for (const word of ["Corradi USA", "Shadesol Complete", "Shadesol Essential", "Somfy", "Rollease Acmeda", "Whispertech"]) assert.ok(main.includes(word), `missing ${word}`);
assert.match(main, /assess the patio, covered deck, or window opening/);
assert.doesNotMatch(main, /heat never enters|built and rated for North Idaho|Mark comes|Mark brings|Mark visits|90-99%/i);
assert.ok(exterior.includes('rel="canonical" href="https://www.luxewindowworks.com/products/exterior-solar-shades"'));
const service = nodes.find((node) => node["@id"] === serviceId);
assert.ok(service.areaServed.some((city) => city["@id"] === "https://www.luxewindowworks.com/areas/coeur-d-alene#place"));
assert.equal(service.provider["@id"], "https://www.luxewindowworks.com/#business");
const faq = nodes.find((node) => node["@type"] === "FAQPage");
assert.equal(faq.mainEntity.length, data.faqs.length);
for (const [i, item] of data.faqs.entries()) {
  assert.equal(faq.mainEntity[i].name, item.question);
  assert.equal(faq.mainEntity[i].acceptedAnswer.text, item.answer);
  assert.ok(main.includes(item.question), `visible FAQ question ${i}`);
  assert.ok(main.includes(item.answer), `visible FAQ answer ${i}`);
}
const cda = built("areas/coeur-d-alene");
assert.match(visible(cda), /A patio you can enjoy in the afternoon/);
assert.ok(schema(cda).some((node) => node["@type"] === "Service" && node.hasOfferCatalog.itemListElement.some((offer) => offer.itemOffered["@id"] === serviceId)));
for (const review of ["Mercedes Bull", "C P", "Norman shutters"]) assert.ok(visible(cda).includes(review), `CDA proof preserved: ${review}`);
const two = built("products/two");
const shadesol = visible(two).match(/<article[^>]*id="shadesol-alfresco".*?<\/article>/s)[0];
assert.ok(hasLink(shadesol, "/products/exterior-solar-shades"));
assert.ok(hasLink(shadesol, "https://two-usa.com/shadesol-alfresco-outdoor-shades/"));
const model = schema(two).find((node) => node["@id"]?.endsWith("#shadesol-alfresco-product") && node["@type"]);
assert.ok(model.isRelatedTo.some((item) => item["@id"] === serviceId));
for (const route of ["products/roller-shades", "products/blinds"]) assert.match(visible(built(route)), /Get an Instant Estimate/);
assert.match(visible(built("products/shutters")), /See Shutter Pricing Guidance/);
console.log("PASS — rendered exterior/CDA/TWO pathways, CTA scope, company voice, qualified claims, FAQ parity, stable service IDs, preserved reviews and other product estimator paths.");
