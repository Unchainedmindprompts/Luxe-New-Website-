import "./test-service-voice.mjs";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = "https://www.luxewindowworks.com";
const read = (path) => readFileSync(`.next/server/app/${path}.html`, "utf8");
const text = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const graph = (html) => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => {
  const value = JSON.parse(match[1]);
  return value["@graph"] ?? [value];
});
const area = read("areas/coeur-d-alene");
const shutters = read("products/shutters");
const rollers = read("products/roller-shades");
const two = read("products/two");
const hd = read("products/hunter-douglas");
const localHd = read("hunter-douglas-coeur-d-alene");
const norman = read("blog/norman-shutters-in-north-idaho-premium-craftsmanship-from-luxe-window-works");

for (const [path, html] of [["areas/coeur-d-alene", area], ["products/shutters", shutters], ["products/roller-shades", rollers], ["products/hunter-douglas", hd], ["hunter-douglas-coeur-d-alene", localHd]]) {
  assert.ok(html.includes(`rel="canonical" href="${base}/${path}"`), `${path}: self-canonical`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${path}: one H1`);
  assert.ok(graph(html).some((node) => node["@id"] === `${base}/${path}#webpage`), `${path}: stable page identity`);
  assert.ok(!graph(html).some((node) => node["@type"] === "LocalBusiness"), `${path}: no second business entity`);
}

for (const href of ["/products/blinds", "/products/solar-shades", "/products/cellular-shades", "/products/motorization", "/products/roller-shades", "/products/shutters", "/products/two", "/hunter-douglas-coeur-d-alene"]) {
  const guide = area.split('id="cda-buying-guide"')[1]?.split("</section>")[0];
  assert.ok(guide?.includes(`href="${href}"`), `CDA buying-guide link: ${href}`);
}
assert.ok(text(area).includes("Luxe Window Works is based in Post Falls"));
assert.ok(text(area).includes("Mercedes Bull"));
assert.ok(text(area).includes("C P"));
assert.ok(text(area).includes("coordination of early measurements with the builder"));

for (const [page, id, name] of [[rollers, "cda-roller-shades-review", "Mercedes Bull"], [shutters, "cda-norman-shutters-review", "C P"]]) {
  assert.ok(area.includes(`id="${id}"`), `${id}: target exists`);
  assert.ok(page.includes(`href="/areas/coeur-d-alene#${id}"`), `${id}: contextual backlink`);
  assert.ok(text(page).includes(name), `${id}: client attribution`);
}
for (const [page, id] of [[shutters, "highprofile-classic"], [shutters, "highprofile-poly"], [rollers, "colourvue-control"]]) {
  assert.ok(page.includes(`href="/products/two#${id}"`), `TWO link: ${id}`);
  assert.ok(two.includes(`id="${id}"`), `TWO target: ${id}`);
}
assert.ok(text(shutters).includes("Custom Plantation Shutters in Coeur d’Alene & North Idaho."));
assert.ok(text(shutters).includes("Norman shutters for a Coeur d'Alene home"));
assert.ok(text(rollers).includes("Roller shades for a Coeur d'Alene home"));
assert.ok(hd.includes("Hunter Douglas Collections in North Idaho | Luxe Window Works"));
assert.ok(localHd.includes("Hunter Douglas Dealer in Coeur d’Alene | Luxe Window Works"));
assert.ok(localHd.includes('href="/products/hunter-douglas#collections"'));
assert.ok(hd.includes('href="/hunter-douglas-coeur-d-alene"'));
const showroomAnswer = graph(localHd).find((node) => node["@type"] === "FAQPage").mainEntity.find((question) => /showroom/.test(question.name)).acceptedAnswer.text;
assert.ok(text(localHd).includes(showroomAnswer), "Local HD FAQ and schema agree");
assert.ok(showroomAnswer.includes("We do not have a Coeur d’Alene showroom."));
assert.ok(!text(norman).includes("Not as one option among many"));
assert.ok(norman.includes('href="/products/two"'));
assert.ok(norman.includes('href="/products/shutters"'));

console.log("PASS: CDA buying guide, verified-review links, TWO collection anchors, distinct HD roles, FAQ parity, stable canonical identities, and Norman assortment consistency.");
