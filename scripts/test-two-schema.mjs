import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base = 'https://www.luxewindowworks.com';
const two = `${base}/products/two`;
const aluminum = `${base}/products/aluminum-shutters`;
function page(path) {
  const html = readFileSync(`.next/server/app/${path}.html`, 'utf8');
  const nodes = [];
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(walk);
    nodes.push(value);
    Object.values(value).forEach(walk);
  }
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) walk(JSON.parse(match[1]));
  return { html, nodes, get: id => nodes.find(n => n['@id'] === id && n['@type']) };
}
const collection = page('products/two');
const elite = page('products/aluminum-shutters');
const home = page('index');
const hub = page('products');
const products = collection.nodes.filter(n => n['@type'] === 'ProductModel');
assert.equal(products.length, 6);
assert.equal(new Set(products.map(n => n['@id'])).size, 6);
for (const p of products) {
  assert.equal(p.manufacturer['@id'], 'https://two-usa.com/#organization');
  assert.equal(p.isRelatedTo['@id'], `${two}#service`);
  assert.ok(collection.html.includes(p.name));
  const anchor = p.url.split('#')[1];
  assert.ok(collection.html.includes(`id="${anchor}"`), `Missing visible anchor: ${anchor}`);
  assert.equal(p.aggregateRating, undefined);
}
const catalog = collection.get(`${two}#catalog`);
assert.equal(catalog.itemListElement.length, 6);
for (const offer of catalog.itemListElement) {
  assert.equal(offer.seller['@id'], `${base}/#business`);
  assert.ok(products.some(p => p['@id'] === offer.itemOffered['@id']));
  assert.equal(offer.price, undefined);
}
for (const [p, url] of [[collection, two], [elite, aluminum]]) {
  const service = p.get(`${url}#service`);
  assert.equal(service.provider['@id'], `${base}/#business`);
  assert.equal(service.areaServed.length, 5);
  assert.ok(p.get(`${url}#webpage`).mainEntity);
  assert.ok(p.get(`${url}#breadcrumb`));
}
assert.equal(elite.get(`${aluminum}#service`).offers.itemOffered['@id'], `${two}#weatherwell-elite-product`);
const faq = elite.get(`${aluminum}#faq`);
assert.ok(faq.mainEntity.some(q => /security/.test(q.name)));
for (const q of faq.mainEntity) assert.ok(elite.html.includes(q.name));
assert.ok(home.nodes.some(n => n['@id'] === `${two}#catalog`));
assert.ok(home.nodes.some(n => n['@id'] === `${aluminum}#service`));
assert.ok(hub.nodes.some(n => n['@type'] === 'ListItem' && n.url === two));
const about = page('about');
assert.ok(!about.get(`${base}/#owner`).description.includes('Apple'));
assert.ok(about.get(`${base}/#owner`).knowsAbout.includes('Outdoor aluminum shutters'));
console.log('PASS: six TWO products, provider/manufacturer/catalog links, visible anchors, outdoor FAQ parity, homepage/hub discovery and updated owner schema.');

assert.ok(!collection.html.includes("Highprofile Avenir"));
assert.ok(!collection.html.includes("Weatherwell Standard"));
for (const name of ["Colourvue Essential", "Colourvue Basic", "Shadesol Complete", "Shadesol Essential"]) assert.ok(collection.html.includes(name));
