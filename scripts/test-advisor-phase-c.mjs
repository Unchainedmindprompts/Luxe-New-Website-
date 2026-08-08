#!/usr/bin/env node
/**
 * Luxe Window Advisor — Phase C customer-experience tests.
 *
 * NO NETWORK, NO API KEY, NO COST. These check the customer-facing layer: what
 * the browser is allowed to know, what renders for each status, what must never
 * appear on screen, and that the booking path survives every failure.
 *
 * The response-narrowing contract is exercised directly, and the component and
 * page are checked as source — which is the honest scope for a build with no
 * DOM test runner. Anything asserted here is asserted about the real files.
 *
 * Node built-ins only. Exit 1 on failure.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const contract = await import("../lib/advisor/client/contract.ts");

/**
 * Strips comments before asserting on what can appear on screen. A doc comment
 * explaining why the UI is not a chatbot must not itself fail a check for the
 * word "chatbot" — the assertion is about rendered output, so the source it
 * runs against has to be the part that renders.
 */
const renderable = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");

/** JSX wraps prose across lines; collapse it before matching sentences. */
const flat = (source) => source.replace(/\s+/g, " ");

const EXPERIENCE = read("app/show-me-my-options/AdvisorExperience.tsx");
const PAGE = read("app/show-me-my-options/page.tsx");
const PRIVACY = read("app/privacy/page.tsx");
const ANALYTICS = read("lib/advisor/client/analytics.ts");
const CONTRACT_SRC = read("lib/advisor/client/contract.ts");

const results = [];
let failures = 0;

function test(name, fn) {
  const problems = [];
  const t = {
    ok: (cond, detail) => { if (!cond) problems.push(detail); },
    equal: (a, b, detail) => {
      if (a !== b) problems.push(`${detail} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
    },
  };
  try { fn(t); } catch (error) { problems.push(`threw: ${error?.message ?? error}`); }
  if (problems.length) failures++;
  results.push({ name, problems });
}

/** A server response shaped like the real one. */
const serverTurn = (over = {}) => ({
  status: "RECOMMENDATION_READY",
  message: "Exterior solar shades fit here.",
  nextQuestion: null,
  assessment: {
    strongCandidates: [{ id: "exterior-solar", label: "Exterior solar shades", reasons: ["x"] }],
    alternatives: [], excluded: [], recommendedOptions: [], optionsToAvoid: [],
    tradeoffs: [{ id: "view-vs-privacy", label: "View vs privacy", note: "Solar fabric reverses after dark." }],
    verificationRequirements: [
      { id: "verify-dimensions", label: "Dimensions" },
      { id: "verify-exterior-mounting", label: "Mounting" },
    ],
    escalation: { required: false, triggers: [] },
    requestConflicts: [],
    guardrailIdsInForce: ["no-fabricated-pricing", "no-total-blackout-guarantee"],
    unknownDimensions: ["privacyNeed"],
  },
  consultationCta: { recommended: true, reasons: ["recommendation-ready"] },
  state: { facts: { priorities: ["view-preservation", "energy-efficiency"], room: "living" } },
  guardrailInterventions: [],
  canonicalResponseId: null,
  ...over,
});

// ── 1-4: route, opening, booking, transport ────────────────────────────────

test("1  the advisor lives at /show-me-my-options and stays out of search", (t) => {
  t.ok(/AdvisorExperience/.test(PAGE), "the page does not render the advisor");
  t.ok(/index:\s*false/.test(PAGE), "the page is no longer noindex");
  t.ok(/show-me-my-options/.test(PAGE), "the canonical no longer points at this route");
  const allowlist = read("config/verify-allowlist.mjs");
  t.ok(/show-me-my-options/.test(allowlist), "the sitemap exclusion was dropped");
});

test("2  the opening asks for natural language, not a fixed choice", (t) => {
  t.ok(/What's going on with your windows\?/.test(EXPERIENCE), "the open prompt is missing");
  t.ok(/Find the Right Window Treatments for Your Home/.test(EXPERIENCE), "the H1 copy has drifted");
  t.ok(/Find My Best Options/.test(EXPERIENCE), "the primary CTA has drifted");
  t.ok(/textarea/.test(EXPERIENCE), "there is no free-text input");
  // Optional starters are sentences, not categories to pick from.
  t.ok(/STARTERS/.test(EXPERIENCE), "no starter prompts for someone who is stuck");
});

test("3  booking is offered up front and never framed as opting out", (t) => {
  t.ok(/Schedule My Free In-Home Consultation/.test(EXPERIENCE), "the booking CTA has drifted");
  t.ok(/placement="opening"/.test(EXPERIENCE), "booking is not offered on the opening state");
  for (const banned of [/Prefer to talk/i, /Skip the AI/i, /Talk to Mark/i, /instead of the advisor/i, /human instead/i]) {
    t.ok(!banned.test(EXPERIENCE), `booking is framed as a fallback: ${banned}`);
  }
});

test("4  messages post to the server route, never to a provider", (t) => {
  t.ok(/fetch\("\/api\/advisor"/.test(EXPERIENCE), "the client does not call /api/advisor");
  for (const banned of [/api\.anthropic/i, /@anthropic-ai/i, /ANTHROPIC_API_KEY/]) {
    t.ok(!banned.test(EXPERIENCE), `the client references a provider directly: ${banned}`);
  }
});

// ── 5-8: status rendering ──────────────────────────────────────────────────

test("5  NEED_MORE_INFORMATION shows one question and claims nothing more", (t) => {
  const turn = contract.toAdvisorTurn(
    serverTurn({
      status: "NEED_MORE_INFORMATION",
      message: "Do you need privacy after dark?",
      nextQuestion: { id: "q-nighttime-privacy", canonical: "…", phrased: "Do you need privacy after dark?", materialTo: [] },
      assessment: { ...serverTurn().assessment, strongCandidates: [] },
    }),
    {}
  );
  t.equal(turn.status, "NEED_MORE_INFORMATION", "status not carried");
  t.equal(turn.direction, null, "a recommendation was claimed while still asking");
  t.ok(turn.question !== null, "no question surfaced");
  // The panel is recommendation-only.
  t.ok(/status === "RECOMMENDATION_READY"/.test(EXPERIENCE), "the panel is not gated on the status");

  // A turn that neither asks nor recommends must still offer a way forward.
  // Live testing produced exactly this shape, and without a CTA it is a dead
  // end: nothing to answer, nothing to click.
  const stuck = contract.toAdvisorTurn(
    serverTurn({
      status: "NEED_MORE_INFORMATION",
      nextQuestion: null,
      assessment: { ...serverTurn().assessment, strongCandidates: [] },
    }),
    {}
  );
  t.equal(stuck.question, null, "the stuck case did not reproduce");
  t.ok(
    /NEED_MORE_INFORMATION" && !turn\.question/.test(EXPERIENCE),
    "a turn with no question and no recommendation offers no way forward"
  );
});

test("6  GUIDANCE_READY renders without a best-fit claim", (t) => {
  const turn = contract.toAdvisorTurn(
    serverTurn({ status: "GUIDANCE_READY", assessment: { ...serverTurn().assessment, strongCandidates: [] } }),
    {}
  );
  t.equal(turn.status, "GUIDANCE_READY", "status not carried");
  t.equal(turn.direction, null, "a direction was claimed with no strong candidate");
  for (const banned of [/Best Fit/i, /best-fit/i]) {
    t.ok(!banned.test(EXPERIENCE), `the UI labels guidance as a best fit: ${banned}`);
  }
});

test("7  RECOMMENDATION_READY renders a concise, structured recommendation", (t) => {
  const turn = contract.toAdvisorTurn(serverTurn(), {});
  t.equal(turn.direction, "Exterior solar shades", "the direction label is missing");
  t.equal(turn.tradeoff, "Solar fabric reverses after dark.", "the tradeoff is missing");
  t.equal(turn.whatMattersMost.length, 2, "priorities were not translated");
  t.ok(turn.whatMattersMost.includes("keeping the view"), "priorities are not in plain language");
  // verify-dimensions is on every project, so it says nothing about this one.
  t.equal(turn.confirmInHome.length, 1, "the confirm list was not filtered");
  t.ok(!turn.confirmInHome.some((x) => /dimension/i.test(x)), "the universal item was kept");
  for (const heading of ["Recommended direction", "Worth knowing", "confirm in your home"]) {
    t.ok(new RegExp(heading, "i").test(EXPERIENCE), `the "${heading}" section is missing`);
  }
});

test("8  ADVISOR_UNAVAILABLE keeps the booking path and hides the cause", (t) => {
  const turn = contract.toAdvisorTurn({ status: "ADVISOR_UNAVAILABLE", error: "provider-timeout" }, {});
  t.equal(turn.status, "ADVISOR_UNAVAILABLE", "status not carried");
  t.ok(/placement="fallback"/.test(EXPERIENCE), "booking is not offered on the failure path");
  // A thrown fetch degrades to the same safe turn rather than a broken page.
  t.equal(contract.toAdvisorTurn(null, {}).status, "ADVISOR_UNAVAILABLE", "a null response did not degrade safely");
  t.equal(contract.toAdvisorTurn("not json", {}).status, "ADVISOR_UNAVAILABLE", "a malformed response did not degrade safely");
});

// ── 9-12: what must never appear ───────────────────────────────────────────

test("9  a canonical brand answer renders verbatim", (t) => {
  const approved =
    "We no longer carry Hunter Douglas. After the company came under 3G Capital’s controlling ownership, we felt the direction of the brand was no longer the best fit for Luxe Window Works or the level of product quality, dealer support, and customer service we want for our clients. We’ve chosen instead to work with suppliers whose products and support better align with our client-first approach.";
  const turn = contract.toAdvisorTurn(
    serverTurn({ status: "GUIDANCE_READY", message: approved, canonicalResponseId: "hunter-douglas-not-carried",
      assessment: { ...serverTurn().assessment, strongCandidates: [] } }),
    {}
  );
  t.equal(turn.message, approved, "the approved wording was altered in the client");
  // The component renders `message` as text, never reformatted.
  t.ok(/whitespace-pre-wrap/.test(EXPERIENCE), "reply text is not rendered as written");
});

test("10 the owner's personal name never appears in the advisor experience", (t) => {
  for (const source of [["experience", EXPERIENCE], ["page", PAGE], ["contract", CONTRACT_SRC]]) {
    t.ok(!/\bMark\b/.test(source[1]), `the owner's name appears in ${source[0]}`);
    t.ok(!/\bAbplanalp\b/i.test(source[1]), `the owner's surname appears in ${source[0]}`);
  }
  t.ok(/Luxe Window Works/.test(EXPERIENCE), "the brand name is not used in the experience");
});

test("11 no provider or AI-product branding appears", (t) => {
  const visible = renderable(EXPERIENCE);
  for (const banned of [/\bClaude\b/i, /Anthropic/i, /\bGPT\b/i, /OpenAI/i, /chatbot/i, /\bbot\b/i, /assistant/i, /🤖/]) {
    t.ok(!banned.test(visible), `the experience shows AI branding: ${banned}`);
  }
  // Privacy is the one place Anthropic is named — a legal disclosure, not branding.
  t.ok(/Anthropic/.test(PRIVACY), "the privacy policy does not disclose the provider");
});

test("12 internal identifiers cannot reach the screen", (t) => {
  const turn = contract.toAdvisorTurn(serverTurn(), {});
  const rendered = JSON.stringify({ ...turn, state: undefined });
  for (const leak of [/\bq-[a-z-]+/, /\bverify-[a-z-]+/, /\bescalate-[a-z-]+/, /\bno-[a-z-]{6,}/, /exterior-solar\b/, /view-preservation/, /guardrail/i, /unknownDimensions/, /provenance/i, /\bbasis\b/]) {
    t.ok(!leak.test(rendered), `an internal identifier survived narrowing: ${leak}`);
  }
  // The narrowed shape simply has no field to hold them.
  for (const field of ["guardrailIdsInForce", "unknownDimensions", "escalation", "recognizedConditions"]) {
    t.ok(!(field in turn), `the client contract still exposes ${field}`);
  }
});

// ── 13-16: input, layout, privacy, analytics ───────────────────────────────

test("13 an over-long message is refused in human language, before the round trip", (t) => {
  t.ok(/MAX_MESSAGE_CHARS = 2000/.test(EXPERIENCE), "the client limit no longer mirrors the server");
  t.ok(/could you trim it/i.test(EXPERIENCE), "the length error is not human-friendly");
  for (const banned of [/\b413\b/, /payload-too-large/, /message-too-long/]) {
    t.ok(!banned.test(EXPERIENCE), `a technical error code is shown to the visitor: ${banned}`);
  }
});

test("14 the layout is mobile-first and accessible", (t) => {
  t.ok(/max-w-2xl/.test(EXPERIENCE), "the reading column is not constrained");
  t.ok(/sm:/.test(EXPERIENCE), "there are no responsive breakpoints");
  t.ok(/flex-col sm:flex-row/.test(EXPERIENCE), "the action row does not stack on mobile");
  t.ok(/aria-live="polite"/.test(EXPERIENCE), "replies are not announced to screen readers");
  t.ok(/htmlFor="advisor-input"/.test(EXPERIENCE), "the input has no associated label");
  t.ok(/aria-invalid/.test(EXPERIENCE), "invalid input is not marked for assistive tech");
  t.ok(/focus:ring/.test(EXPERIENCE), "interactive elements have no visible focus ring");
  // No fixed-position chat furniture.
  for (const banned of [/fixed bottom-/, /rounded-full.*w-14/, /z-50/]) {
    t.ok(!banned.test(EXPERIENCE), `the UI uses floating-widget styling: ${banned}`);
  }
});

test("15 the privacy policy discloses the advisor accurately", (t) => {
  const policy = flat(PRIVACY);
  for (const required of [
    /Anthropic/, /window-treatment advisor/i, /AI-assisted|AI that powers/i,
    /not a quote/i, /book a free in-home consultation/i,
  ]) {
    t.ok(required.test(policy), `the privacy policy is missing: ${required}`);
  }
  // It must not claim storage that does not happen, nor make unverifiable
  // claims about what the provider does with what it receives.
  t.ok(/There is no database behind the advisor/i.test(flat(PRIVACY)), "the no-storage behaviour is not stated");
  for (const overclaim of [/Anthropic does not (train|retain|store)/i, /deleted within \d+/i, /never used for training/i]) {
    t.ok(!overclaim.test(policy), `an unverifiable provider claim was made: ${overclaim}`);
  }
});

test("16 analytics fire from intended interactions and carry no content", (t) => {
  for (const event of [
    "advisor_viewed", "advisor_started", "advisor_engaged", "advisor_guidance_rendered",
    "advisor_recommendation_rendered", "advisor_booking_clicked", "advisor_fallback", "advisor_book_handoff",
  ]) {
    t.ok(ANALYTICS.includes(event), `${event} is not defined`);
    t.ok(EXPERIENCE.includes(toCamel(event)), `${event} is never fired from the experience`);
  }
  // Engagement is deliberately not a page view and not the first message.
  t.ok(/turnNumber === 2\) advisorEngaged/.test(EXPERIENCE), "engagement is not the second message");
  // No message text, facts or state in any event payload.
  for (const leak of [/track\([^)]*message/, /track\([^)]*facts/, /track\([^)]*state/, /draft/]) {
    t.ok(!leak.test(ANALYTICS), `an event payload may carry content: ${leak}`);
  }
  t.ok(/@vercel\/analytics/.test(ANALYTICS), "a new analytics vendor was introduced");
});

function toCamel(event) {
  return event.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// ── report ─────────────────────────────────────────────────────────────────

console.log("Luxe Window Advisor — Phase C customer experience");
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
console.log(
  "\nPASS — the advisor renders each status honestly, exposes no internal identifiers, keeps the " +
    "booking path on every failure, and discloses the AI provider in the privacy policy."
);
