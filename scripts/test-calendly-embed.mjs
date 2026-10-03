#!/usr/bin/env node
// Isolated lifecycle tests. No requests, appointments, or customer data.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CALENDLY_LOAD_TIMEOUT, CALENDLY_SCRIPT_URL, loadCalendly, mountCalendly } from "../app/book/calendly-embed.ts";

const listeners = new Set();
const timers = new Map();
const scripts = [];
let id = 0;
const saved = { window: globalThis.window, document: globalThis.document, setTimeout, clearTimeout };
globalThis.setTimeout = (fn, delay) => { assert.equal(delay, CALENDLY_LOAD_TIMEOUT); timers.set(++id, fn); return id; };
globalThis.clearTimeout = (key) => timers.delete(key);
globalThis.window = {
  addEventListener: (name, fn) => { assert.equal(name, "message"); listeners.add(fn); },
  removeEventListener: (name, fn) => { assert.equal(name, "message"); listeners.delete(fn); },
};
globalThis.document = {
  createElement: (tag) => { assert.equal(tag, "script"); return { remove() { this.removed = true; } }; },
  head: { appendChild: (script) => scripts.push(script) },
};
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
const fireTimers = () => { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach((fn) => fn()); };
const send = (source, event = "calendly.event_type_viewed", origin = "https://calendly.com") => {
  for (const listener of listeners) listener({ source, origin, data: { event } });
};
const parent = () => ({
  frame: null,
  querySelector(selector) { assert.equal(selector, "iframe"); return this.frame; },
  replaceChildren() { this.frame = null; },
});
let initialized = 0;
const api = { initInlineWidget({ url, parentElement }) {
  assert.equal(url, "https://calendly.com/mark-luxewindowworks/2hr");
  initialized++;
  parentElement.frame = { contentWindow: {} };
} };
const url = "https://calendly.com/mark-luxewindowworks/2hr";
const cases = [];
async function test(name, fn) { await fn(); cases.push(name); console.log(`pass ${name}`); }

try {
  await test("failed script request is shared, removed, and can be retried", async () => {
    const first = loadCalendly();
    assert.equal(loadCalendly(), first);
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, CALENDLY_SCRIPT_URL);
    scripts[0].onerror();
    await assert.rejects(first);
    assert.ok(scripts[0].removed);
    const second = loadCalendly();
    assert.equal(scripts.length, 2);
    fireTimers();
    await assert.rejects(second);
    assert.ok(scripts[1].removed);
    const third = loadCalendly();
    window.Calendly = api;
    scripts[2].onload();
    assert.equal(await third, api);
    assert.equal(await loadCalendly(), api);
    assert.equal(scripts.length, 3);
  });
  await test("initial mount, cleanup, route revisit, and repeated remount initialize one frame each", async () => {
    const host = parent();
    for (let i = 0; i < 3; i++) {
      const before = initialized;
      const stop = mountCalendly(host, url, () => {}, () => {});
      await tick();
      assert.equal(initialized, before + 1);
      assert.ok(host.frame);
      assert.equal(listeners.size, 1);
      stop();
      assert.equal(host.frame, null);
      assert.equal(listeners.size, 0);
      assert.equal(timers.size, 0);
    }
  });
  await test("Strict Mode/unmount before script resolves cannot initialize a stale container", async () => {
    let resolve;
    const host = parent();
    const before = initialized;
    const stop = mountCalendly(host, url, () => {}, () => {}, () => new Promise((done) => { resolve = done; }));
    stop(); resolve(api); await tick();
    assert.equal(initialized, before);
    assert.equal(host.frame, null);
  });
  await test("provider error/timeout reveals recovery; late genuine readiness still restores calendar", async () => {
    const host = parent(); let ready = 0; let unavailable = 0;
    const stop = mountCalendly(host, url, () => ready++, () => unavailable++);
    await tick();
    const frame = host.frame.contentWindow;
    send(frame, "calendly.event_type_viewed", "https://evil.example");
    send({}, "calendly.event_type_viewed");
    send(frame, "calendly.page_height");
    send(frame, "calendly.profile_page_viewed");
    send(frame, 123);
    assert.equal(ready, 0);
    fireTimers(); assert.equal(unavailable, 1);
    assert.ok(host.frame, "timeout must not destroy a slow provider frame");
    send(frame); assert.equal(ready, 1);
    stop();
  });
  await test("retry rejects messages from the replaced iframe and accepts the current one", async () => {
    const host = parent(); let ready = 0;
    const first = mountCalendly(host, url, () => ready++, () => {});
    await tick(); const oldFrame = host.frame.contentWindow; first();
    const second = mountCalendly(host, url, () => ready++, () => {});
    await tick();
    send(oldFrame); assert.equal(ready, 0);
    send(host.frame.contentWindow); assert.equal(ready, 1);
    assert.equal(timers.size, 0);
    second();
  });
  await test("script or initialization failures surface recovery without leaking listeners", async () => {
    for (const loader of [() => Promise.reject(Error("offline")), () => Promise.resolve({ initInlineWidget() { throw Error("provider"); } })]) {
      let unavailable = 0;
      const stop = mountCalendly(parent(), url, () => {}, () => unavailable++, loader);
      await tick(); assert.equal(unavailable, 1); assert.equal(timers.size, 0); stop();
    }
    assert.equal(listeners.size, 0);
  });
  await test("direct booking/callback/phone links and mobile heights remain available", () => {
    const component = readFileSync(new URL("../app/book/CalendlyEmbed.tsx", import.meta.url), "utf8");
    for (const token of ['href={BUSINESS.calendlyUrl}', 'href="#callback"', 'href={BUSINESS.phoneHref}', 'data-auto-load="false"', 'Retry calendar', 'h-[1180px]', 'sm:h-[1020px]', 'lg:h-[980px]']) assert.ok(component.includes(token), token);
    assert.ok(!component.includes('data-url='), "auto-scan must not race with explicit initialization");
    assert.ok(!component.includes('fbq('), "embed readiness/retries must not fire conversions");
  });
  console.log(`PASS — ${cases.length} calendar lifecycle and recovery scenarios`);
} finally {
  Object.assign(globalThis, saved);
}
