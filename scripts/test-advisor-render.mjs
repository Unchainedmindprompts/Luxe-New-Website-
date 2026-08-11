#!/usr/bin/env node
/**
 * Luxe Window Advisor — rendered-output tests. (Phase C)
 *
 * NO NETWORK, NO API KEY, NO COST. This renders the real component tree with
 * `react-dom/server` and asserts on the HTML that comes out.
 *
 * WHY THIS EXISTS. A real preview conversation reported the recommendation
 * paragraph appearing twice on screen. Three rounds of source-reading concluded
 * it could not: one JSX expression mentions the reply, the card carries no
 * prose, the footer stands down. Every one of those statements was true, and
 * the paragraph still appeared twice. Reading source can show what a file says;
 * only rendering can show what the page does.
 *
 * So the assertions here are about the final HTML — a unique marker goes into
 * the response, the tree is rendered, and the marker is counted. Nothing about
 * structure, nothing about which component is responsible.
 *
 * Run with the `tsx` loader so the `.tsx` tree imports directly:
 *   node --import tsx scripts/test-advisor-render.mjs
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Dynamic: the loader compiles the `.tsx` tree to CJS, so named bindings are
// resolved at run time rather than statically.
const { toAdvisorTurn } = await import("../lib/advisor/client/contract.ts");
const { Conversation } = await import("../app/ask-luxe/AdvisorExperience.tsx");

let failures = 0;
const results = [];

function test(name, run) {
  const problems = [];
  const t = {
    ok: (condition, message) => {
      if (!condition) problems.push(message);
    },
    equal: (actual, expected, message) => {
      if (actual !== expected) problems.push(`${message} (got ${actual}, want ${expected})`);
    },
  };
  try {
    run(t);
  } catch (error) {
    problems.push(`threw: ${error?.message ?? error}`);
  }
  if (problems.length) failures++;
  results.push({ name, problems });
}

/** A marker no template, label or product name could ever contain. */
const MARKER = "UNIQUE_RECOMMENDATION_NARRATIVE_12345";

const serverPayload = (over = {}) => ({
  status: "RECOMMENDATION_READY",
  message: MARKER,
  nextQuestion: null,
  preliminaryGuidance: null,
  productEducation: null,
  canonicalResponseId: null,
  assessment: {
    primaryRecommendation: { id: "cellular", label: "Cellular shades", reasons: [] },
    strongCandidates: [{ id: "cellular", label: "Cellular shades", reasons: [] }],
    alternatives: [],
    excluded: [],
    recommendedOptions: [],
    optionsToAvoid: [],
    tradeoffs: [
      { id: "inside-mount", label: "Inside mount", note: "Perimeter gaps are inherent to an inside mount." },
    ],
    verificationRequirements: [],
    escalation: { required: false, triggers: [] },
    requestConflicts: [],
    guardrailIdsInForce: [],
    unknownDimensions: [],
  },
  consultationCta: { recommended: true, reasons: ["requires-physical-verification"] },
  recommendationChange: "new",
  guardrailInterventions: [],
  error: null,
  state: { facts: { room: "bedroom", priorities: ["privacy", "room-darkening"] } },
  ...over,
});

const conversationHtml = (over = {}, extraExchanges = []) => {
  const turn = toAdvisorTurn(serverPayload(over), {});
  const exchanges = [
    ...extraExchanges,
    { id: 99, from: "luxe", text: turn.message, turn },
  ];
  return renderToStaticMarkup(createElement(Conversation, { exchanges, turns: 4 }));
};

const countOf = (haystack, needle) => haystack.split(needle).length - 1;

// ── the defect ──────────────────────────────────────────────────────────────

test("1  a recommendation narrative appears exactly once in the rendered output", (t) => {
  const html = conversationHtml();
  t.equal(countOf(html, MARKER), 1, "the recommendation narrative was rendered a different number of times");
  // The card really is on the page — otherwise this proves nothing.
  t.ok(html.includes("Cellular shades"), "the recommendation card did not render");
  t.ok(/Recommended (direction|for )/.test(html), "the card heading did not render");
});

test("2  the narrative appears once with the consultation block on the page", (t) => {
  // The reported duplicate sat below the consultation section, so that block
  // has to be present for this to reproduce the conditions.
  const html = conversationHtml();
  t.ok(/Seeing the windows in the room/.test(html), "the consultation block did not render");
  t.equal(countOf(html, MARKER), 1, "the narrative repeated around the consultation block");
});

test("3  the narrative appears once with no consultation block", (t) => {
  const html = conversationHtml({ consultationCta: { recommended: false, reasons: [] } });
  t.ok(!/Seeing the windows in the room/.test(html), "the consultation block rendered anyway");
  t.equal(countOf(html, MARKER), 1, "the narrative repeated without a consultation block");
});

test("4  every other status renders its reply exactly once", (t) => {
  for (const [status, extra] of [
    ["ANSWERED", { assessment: null }],
    ["GUIDANCE_READY", {}],
    ["NEED_MORE_INFORMATION", {
      nextQuestion: { id: "q", canonical: "c", phrased: MARKER, materialTo: [] },
      assessment: { ...serverPayload().assessment, primaryRecommendation: null, strongCandidates: [] },
    }],
    ["ADVISOR_UNAVAILABLE", { assessment: null, error: "provider-timeout" }],
  ]) {
    const html = conversationHtml({ status, ...extra });
    t.equal(countOf(html, MARKER), 1, `${status} rendered its reply a different number of times`);
  }
});

test("5  a multi-turn conversation renders each reply exactly once", (t) => {
  // Whatever else is on screen, one reply is one appearance.
  const earlier = [
    { id: 1, from: "homeowner", text: "I just purchased a new home" },
    { id: 2, from: "luxe", text: "EARLIER_REPLY_ABC", turn: toAdvisorTurn(serverPayload({
      status: "ANSWERED", message: "EARLIER_REPLY_ABC", assessment: null,
      consultationCta: { recommended: false, reasons: [] },
    }), {}) },
    { id: 3, from: "homeowner", text: "I want the bedrooms dark" },
  ];
  const html = conversationHtml({}, earlier);
  t.equal(countOf(html, MARKER), 1, "the latest reply was rendered more than once");
  t.equal(countOf(html, "EARLIER_REPLY_ABC"), 1, "an earlier reply was rendered more than once");
  t.equal(countOf(html, "I just purchased a new home"), 1, "a homeowner message was rendered more than once");
});

test("6  a recommendation card says which room it is for", (t) => {
  // A card headed "Cellular shades" with no scope reads as the answer for the
  // house. A homeowner who had just described bedrooms AND living spaces could
  // not tell which one it meant.
  const html = conversationHtml();
  t.ok(/Recommended for the bedroom/.test(html), "the card does not name the room it applies to");
  t.ok(!/Recommended direction/.test(html), "the unscoped heading is still used when a room is known");

  // With no room established, it falls back rather than implying the home.
  const noRoom = conversationHtml({ state: { facts: { priorities: ["privacy"] } } });
  t.ok(/Recommended direction/.test(noRoom), "the unscoped heading is missing when no room is known");
  t.ok(!/Recommended for/.test(noRoom), "a room was named that was never established");

  // Phase 7: the scope comes from the ACTIVE AREA, and uses the homeowner's own
  // words when they gave any — "the primary bedroom" beats a vocabulary label
  // they never said.
  const scoped = conversationHtml({
    state: {
      facts: { room: "bedroom" },
      project: {
        shared: {},
        activeAreaId: "bedroom:primary",
        areas: [
          { id: "bedroom:primary", room: "bedroom", label: "the primary bedroom", ledger: {} },
          { id: "living", room: "living", label: "the living spaces", ledger: {} },
        ],
      },
    },
  });
  t.ok(/Recommended for the primary bedroom/.test(scoped), "the card ignored the active area");
  t.ok(!/living/.test(scoped), "another area leaked onto the card");
});

test("7  an unchanged recommendation does not render the card a second time", (t) => {
  // A live conversation showed the same bedroom card on two consecutive turns
  // because a reinforcing fact was treated as a fresh recommendation. Asserted
  // on the rendered HTML, per change value.
  const shown = conversationHtml({ recommendationChange: "new" });
  t.ok(/Recommended for the bedroom/.test(shown), "a new recommendation did not render its card");
  t.ok(shown.includes("Cellular shades"), "the direction is missing from a new recommendation");

  const again = conversationHtml({ recommendationChange: "unchanged" });
  t.ok(!/Recommended for/.test(again), "the card rendered again for an unchanged recommendation");
  t.ok(!again.includes("Cellular shades"), "the direction rendered again for an unchanged recommendation");
  // The reply itself is still shown — only the card stands down.
  t.equal(countOf(again, MARKER), 1, "the reply was suppressed along with the card");

  const moved = conversationHtml({ recommendationChange: "changed" });
  t.ok(/Recommended for the bedroom/.test(moved), "a changed recommendation did not render its card");
});

test("8  the reply is never echoed into a second field the page could render", (t) => {
  // `nextQuestion.phrased` is identical to `message` on a question turn by
  // design. If the page ever rendered both, the customer would read it twice —
  // so the rendered output is what is asserted, not the contract.
  const turn = toAdvisorTurn(
    serverPayload({
      status: "NEED_MORE_INFORMATION",
      message: MARKER,
      nextQuestion: { id: "q", canonical: "canonical text", phrased: MARKER, materialTo: [] },
      assessment: { ...serverPayload().assessment, primaryRecommendation: null, strongCandidates: [] },
    }),
    {}
  );
  t.equal(turn.message, turn.question, "the scenario no longer reproduces — message and question differ");
  const html = renderToStaticMarkup(
    createElement(Conversation, {
      exchanges: [{ id: 1, from: "luxe", text: turn.message, turn }],
      turns: 2,
    })
  );
  t.equal(countOf(html, MARKER), 1, "message and question were both rendered");
});

test("9  the reply exists in the document exactly once, with no hidden mirror", (t) => {
  // The reply used to be copied into a separate `sr-only` live region, which
  // put the whole paragraph in the document a second time — hidden by a utility
  // class, positioned between the card and the composer, which is exactly where
  // a real preview reported it appearing again. The conversation announces its
  // own additions now, so the text exists once.
  const shell = readFileSync(new URL("../app/ask-luxe/AdvisorExperience.tsx", import.meta.url), "utf8");
  t.ok(!/liveRegion/.test(shell), "the reply is still mirrored into a second node");
  t.ok(!/textContent\s*=/.test(shell), "the reply is still written into the DOM imperatively");
  t.ok(/aria-live="polite"/.test(shell), "the conversation is no longer announced to assistive technology");
  t.ok(/aria-relevant="additions"/.test(shell), "the whole conversation would be re-announced each turn");
});

// ── report ──────────────────────────────────────────────────────────────────

console.log("Luxe Window Advisor — rendered-output tests");
console.log("  renderer:                    react-dom/server, real component tree");
console.log("  network calls:               0");
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
console.log("\nPASS — every reply appears exactly once in the rendered conversation.");
