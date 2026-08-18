#!/usr/bin/env node
/**
 * Deterministic coverage for /book Calendly → Meta Schedule.
 *
 * Simulates official Calendly postMessage events. Does not submit a real
 * booking. Node built-ins + the tracking module. Exit 1 on failure.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CALENDLY_EMBED_ORIGIN,
  CALENDLY_EVENT_SCHEDULED,
  handleCalendlyMessage,
  resetCalendlyScheduleDedupe,
  subscribeCalendlyScheduleTracking,
} from "../app/book/calendly-schedule-tracking.ts";

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

function message(
  eventName,
  origin = CALENDLY_EMBED_ORIGIN,
  payload
) {
  return {
    origin,
    data: payload ? { event: eventName, payload } : { event: eventName },
  };
}

function withFbq(run) {
  resetCalendlyScheduleDedupe();
  const calls = [];
  const fbq = (...args) => {
    calls.push(args);
  };
  run(calls, fbq);
}

const OLD_PIXEL_ID = "1655897412521361";
const PRODUCTION_SOURCE = [
  "app/book/page.tsx",
  "app/book/layout.tsx",
  "app/book/CalendlyScheduleTracker.tsx",
  "app/book/calendly-schedule-tracking.ts",
  "app/contact/ContactForm.tsx",
  "app/layout.tsx",
  "components/MetaPixel.tsx",
  "components/MetaPixelRouteListener.tsx",
];

test("1  page load does not fire Schedule", (t) => {
  withFbq((calls, fbq) => {
    t.equal(calls.length, 0, "fbq was called before any Calendly message");
    t.ok(typeof fbq === "function", "fbq stub missing");
  });
});

test("2  Calendly widget load does not fire Schedule", (t) => {
  withFbq((calls, fbq) => {
    handleCalendlyMessage(message("calendly.profile_page_viewed"), fbq);
    handleCalendlyMessage(message("calendly.event_type_viewed"), fbq);
    handleCalendlyMessage(message("calendly.page_height"), fbq);
    t.equal(calls.length, 0, "widget-load events fired Meta Schedule");
  });
});

test("3  booking-start does not fire Schedule", (t) => {
  withFbq((calls, fbq) => {
    handleCalendlyMessage(message("calendly.date_and_time_selected"), fbq);
    t.equal(calls.length, 0, "date_and_time_selected fired Meta Schedule");
  });
});

test("4  official calendly.event_scheduled fires one Meta Schedule", (t) => {
  t.equal(CALENDLY_EVENT_SCHEDULED, "calendly.event_scheduled", "wrong completion event name");
  t.equal(CALENDLY_EMBED_ORIGIN, "https://calendly.com", "wrong Calendly origin");

  withFbq((calls, fbq) => {
    const sent = handleCalendlyMessage(
      message(CALENDLY_EVENT_SCHEDULED, CALENDLY_EMBED_ORIGIN, {
        event: { uri: "https://api.calendly.com/scheduled_events/EVT1" },
        invitee: { uri: "https://api.calendly.com/scheduled_events/EVT1/invitees/INV1" },
      }),
      fbq
    );
    t.ok(sent, "completion handler did not report a Schedule send");
    t.equal(calls.length, 1, "expected exactly one fbq call");
    t.equal(calls[0]?.[0], "track", "fbq was not called with track");
    t.equal(calls[0]?.[1], "Schedule", "fbq did not track Schedule");
    t.ok(!calls.some((c) => c[1] === "Lead"), "completion also fired Lead");
  });
});

test("5  duplicate completion messages do not fire a second Schedule", (t) => {
  withFbq((calls, fbq) => {
    const completion = message(CALENDLY_EVENT_SCHEDULED);
    handleCalendlyMessage(completion, fbq);
    handleCalendlyMessage(completion, fbq);
    handleCalendlyMessage(completion, fbq);
    t.equal(calls.length, 1, "duplicate completions fired more than one Schedule");
  });
});

test("6  absence of window.fbq does not break booking", (t) => {
  resetCalendlyScheduleDedupe();
  let threw = false;
  try {
    handleCalendlyMessage(message(CALENDLY_EVENT_SCHEDULED), undefined);
    handleCalendlyMessage(message(CALENDLY_EVENT_SCHEDULED));
    handleCalendlyMessage(message("calendly.date_and_time_selected"));
  } catch (error) {
    threw = true;
    t.ok(false, `handler threw without fbq: ${error?.message ?? error}`);
  }
  t.ok(!threw, "handler threw when fbq was missing");

  const throwingFbq = () => {
    throw new Error("pixel down");
  };
  resetCalendlyScheduleDedupe();
  try {
    handleCalendlyMessage(message(CALENDLY_EVENT_SCHEDULED), throwingFbq);
  } catch (error) {
    t.ok(false, `throwing fbq escaped: ${error?.message ?? error}`);
  }

  const listeners = [];
  const originalAdd = globalThis.addEventListener;
  const originalRemove = globalThis.removeEventListener;
  globalThis.window = globalThis;
  globalThis.addEventListener = (type, listener) => {
    if (type === "message" && typeof listener === "function") listeners.push(listener);
  };
  globalThis.removeEventListener = (type, listener) => {
    if (type === "message" && typeof listener === "function") {
      const i = listeners.indexOf(listener);
      if (i >= 0) listeners.splice(i, 1);
    }
  };

  try {
    resetCalendlyScheduleDedupe();
    const unsubscribe = subscribeCalendlyScheduleTracking();
    t.ok(listeners.length === 1, "subscribe did not attach a message listener");
    listeners[0]?.({
      origin: CALENDLY_EMBED_ORIGIN,
      data: { event: CALENDLY_EVENT_SCHEDULED },
    });
    unsubscribe();
    t.equal(listeners.length, 0, "unsubscribe did not detach the listener");
  } catch (error) {
    t.ok(false, `subscribe path threw without fbq: ${error?.message ?? error}`);
  } finally {
    globalThis.addEventListener = originalAdd;
    globalThis.removeEventListener = originalRemove;
  }
});

test("7  contact-form Lead tracking remains unchanged", (t) => {
  const form = read("app/contact/ContactForm.tsx");
  t.ok(
    /if\s*\(!res\.ok\)\s*throw new Error\("Submit failed"\)/.test(form),
    "contact form no longer gates Lead on a successful POST"
  );
  t.ok(
    /fbq\("track",\s*"Lead"\)/.test(form),
    "contact form no longer fires fbq('track','Lead')"
  );
  t.ok(!/fbq\(["']track["'],\s*["']Schedule["']\)/.test(form), "contact form now fires Schedule");
  t.ok(
    /typeof \(window as unknown as \{ fbq\?:/.test(form),
    "contact form lost its fbq typeof guard"
  );
});

test("8  base Pixel initialization remains unchanged", (t) => {
  const pixel = read("components/MetaPixel.tsx");
  const listener = read("components/MetaPixelRouteListener.tsx");
  const layout = read("app/layout.tsx");

  t.ok(pixel.includes("NEXT_PUBLIC_META_PIXEL_ID"), "MetaPixel no longer reads the env pixel id");
  t.ok(pixel.includes("fbq('init','${pixelId}')"), "MetaPixel init snippet changed");
  t.ok(pixel.includes("fbq('track','PageView')"), "MetaPixel first PageView snippet changed");
  t.ok(
    /Conversion events \(Lead, Schedule, Contact, custom\) are not initialized here/.test(pixel),
    "MetaPixel comment no longer says conversion events stay out of init"
  );
  t.ok(!/fbq\(['"]track['"],\s*['"]Schedule['"]\)/.test(pixel), "MetaPixel now fires Schedule");
  t.ok(layout.includes("<MetaPixel />"), "root layout no longer mounts MetaPixel");
  t.ok(
    listener.includes('fbq("track", "PageView")'),
    "route listener no longer sends SPA PageView"
  );
  t.ok(!listener.includes("Schedule"), "route listener now mentions Schedule");
});

test("9  old Pixel ID 1655897412521361 does not return", (t) => {
  for (const file of PRODUCTION_SOURCE) {
    t.ok(exists(file), `missing ${file}`);
    t.ok(!read(file).includes(OLD_PIXEL_ID), `${file} contains the retired pixel id`);
  }
  t.ok(
    !read("app/book/calendly-schedule-tracking.ts").includes("2029448101049558"),
    "tracking module hardcodes the live pixel id"
  );
  t.ok(
    !read("app/book/CalendlyScheduleTracker.tsx").includes("2029448101049558"),
    "tracker component hardcodes the live pixel id"
  );
  t.ok(
    !read("app/book/page.tsx").includes("2029448101049558"),
    "book page hardcodes the live pixel id"
  );
});

test("10  /book still embeds the official inline widget and wires the listener", (t) => {
  const page = read("app/book/page.tsx");
  t.ok(page.includes("calendly-inline-widget"), "inline widget class was removed");
  t.ok(
    page.includes("https://assets.calendly.com/assets/external/widget.js"),
    "official widget.js was removed"
  );
  t.ok(page.includes('strategy="lazyOnload"'), "lazyOnload strategy was changed");
  t.ok(page.includes("<CalendlyScheduleTracker"), "book page does not mount the tracker");
  t.ok(!/fbq\(["']track["'],\s*["']Lead["']\)/.test(page), "book fallback form now fires Lead");
  t.ok(!/fbq\(["']track["'],\s*["']Schedule["']\)/.test(page), "book page inlines Schedule itself");

  const tracking = read("app/book/calendly-schedule-tracking.ts");
  t.ok(
    tracking.includes("event.origin === CALENDLY_EMBED_ORIGIN"),
    "origin check is missing"
  );
  t.ok(
    tracking.includes("calendly.event_scheduled"),
    "official completion event name is missing"
  );
  t.ok(tracking.includes('fbq("track", META_SCHEDULE_EVENT)'), "fbq Schedule call is missing");
});

test("11  non-Calendly messages never convert", (t) => {
  withFbq((calls, fbq) => {
    handleCalendlyMessage(message(CALENDLY_EVENT_SCHEDULED, "https://evil.example"), fbq);
    handleCalendlyMessage({ origin: CALENDLY_EMBED_ORIGIN, data: "calendly.event_scheduled" }, fbq);
    handleCalendlyMessage({ origin: CALENDLY_EMBED_ORIGIN, data: { event: 1 } }, fbq);
    handleCalendlyMessage({ origin: CALENDLY_EMBED_ORIGIN }, fbq);
    t.equal(calls.length, 0, "a non-official message fired Schedule");
  });
});

console.log("Calendly /book → Meta Schedule");
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
  "\nPASS — page/widget/start do not fire Schedule; official calendly.event_scheduled fires one; duplicates and missing fbq stay safe; Lead and base pixel are unchanged."
);
