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
const lead = await import("../lib/advisor/client/lead.ts");

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

const EXPERIENCE = read("app/ask-luxe/AdvisorExperience.tsx");
const PAGE = read("app/ask-luxe/page.tsx");
const PRIVACY = read("app/privacy/page.tsx");
const ANALYTICS = read("lib/advisor/client/analytics.ts");
const CONTRACT_SRC = read("lib/advisor/client/contract.ts");
const CONTACT = read("app/ask-luxe/ContactRequest.tsx");
const LEAD_SRC = read("lib/advisor/client/lead.ts");
const CONSULTATION_ROUTE = read("app/api/consultation/route.ts");

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
    primaryRecommendation: { id: "exterior-solar", label: "Exterior solar shades", reasons: ["x"] },
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

test("1  the advisor lives at /ask-luxe and stays out of search", (t) => {
  t.ok(/AdvisorExperience/.test(PAGE), "the page does not render the advisor");
  t.ok(/index:\s*false/.test(PAGE), "the page is no longer noindex");
  t.ok(/follow:\s*true/.test(PAGE), "the follow posture changed");
  t.ok(/ask-luxe/.test(PAGE), "the canonical no longer points at this route");
  const allowlist = read("config/verify-allowlist.mjs");
  t.ok(/ask-luxe/.test(allowlist), "the sitemap exclusion was dropped");
  t.ok(!/show-me-my-options/.test(allowlist), "the allowlist still names the retired route");

  // The old path is not abandoned — it has been live and may sit in histories.
  const config = read("next.config.mjs");
  t.ok(/source: '\/show-me-my-options'/.test(config), "the old route has no redirect");
  t.ok(/destination: '\/ask-luxe'/.test(config), "the redirect does not point at the new route");

  // Every inbound CTA moved with it.
  for (const page of ["app/page.tsx", "app/products/page.tsx", "app/privacy/page.tsx"]) {
    t.ok(!/href="\/show-me-my-options"/.test(read(page)), `${page} still links to the retired route`);
  }
});

test("2  the opening welcomes rather than qualifies", (t) => {
  const flatText = flat(EXPERIENCE);
  t.ok(/How Can We Help\?/.test(EXPERIENCE), "the welcoming H1 is missing");
  t.ok(/What can we help you with\?/.test(EXPERIENCE), "the open prompt is missing");
  t.ok(/Ask a question or tell us what brought you here/.test(EXPERIENCE), "the placeholder has drifted");
  t.ok(/"Ask Luxe"/.test(EXPERIENCE), "the submit label has drifted");
  t.ok(
    /Thanks for stopping by Luxe Window Works\. If you have any questions about window treatments, your project, or working with Luxe, just ask\./.test(flatText),
    "the welcome copy has drifted"
  );
  t.ok(/Not sure where to start\? Just tell us what brought you here\./.test(flatText), "the helper text is missing");
  t.ok(/textarea/.test(EXPERIENCE), "there is no free-text input — natural language is not primary");

  // The old product-discovery framing must be gone, not merely demoted.
  for (const retired of [/Find the Right Window Treatments for Your Home/, /Find My Best Options/, /What's going on with your windows/]) {
    t.ok(!retired.test(EXPERIENCE), `the retired product-discovery framing survives: ${retired}`);
  }
});

test("2a nothing on the opening screen nudges toward a topic", (t) => {
  const visible = renderable(EXPERIENCE);

  // No starter list of any kind, under any name.
  t.ok(!/STARTERS/.test(EXPERIENCE), "a starter prompt list still exists");
  // Against the renderable source: the doc comment explaining why there are no
  // suggested questions must not itself read as one.
  for (const shape of [/const (SUGGESTIONS|EXAMPLES|PROMPTS|CHIPS|TOPICS)\b/, /Try one of these/i, /suggested questions?/i]) {
    t.ok(!shape.test(visible), `a suggestion mechanism was reintroduced: ${shape}`);
  }

  // The opening renders exactly one button — submit — and one link, booking.
  // From the renderable source: a comment explaining why the eyebrow was
  // removed must not itself fail the check for the eyebrow.
  const opening = /function Opening\(([\s\S]*?)\n}/.exec(visible)?.[1] ?? "";
  t.ok(opening.length > 0, "the Opening component could not be found");
  t.ok(!/<button/.test(opening), "the opening screen renders clickable topic buttons");
  t.ok(!/\.map\(/.test(opening), "the opening screen renders a list of options");

  // Nothing proactively raises a topic before the visitor does.
  for (const topic of [
    /Hunter Douglas/, /consultation\?/i, /west-facing/i, /cellular/i, /roller/i, /shutters/i,
    /how much (do|does)/i, /\bprice\b/i, /\bcost\b/i, /warranty/i, /minimum/i, /pressure/i,
  ]) {
    t.ok(!topic.test(opening), `the opening screen raises a topic unprompted: ${topic}`);
  }

  // And no product category is named anywhere on the opening screen.
  for (const category of [/blinds/i, /shades/i, /drapery/i, /motoriz/i]) {
    t.ok(!category.test(opening), `a product category appears on the opening screen: ${category}`);
  }

  // No objection framing before the visitor has said anything.
  for (const preframe of [/No Obligation/i, /Free &middot;/, /no pressure/i, /risk[- ]free/i]) {
    t.ok(!preframe.test(opening), `the opening answers an objection nobody raised: ${preframe}`);
  }

  // The entry analytics no longer claims a dimension that cannot vary.
  t.ok(!/"typed" \| "prompt"/.test(visible + ANALYTICS), "the retired starter entry mode still exists");
});

test("3  booking is offered up front and never framed as opting out", (t) => {
  t.ok(/Schedule My Free In-Home Consultation/.test(EXPERIENCE), "the booking CTA has drifted");
  t.ok(/placement="opening"/.test(EXPERIENCE), "booking is not offered on the opening state");
  t.ok(/Ready for us to take a look\?/.test(flat(EXPERIENCE)), "the booking invitation copy is missing");
  // Present but quiet: the welcome is the message, not the CTA.
  t.ok(/placement="opening"[\s\S]{0,120}variant="quiet"/.test(EXPERIENCE), "the opening booking link dominates the welcome");
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
      assessment: { ...serverTurn().assessment, strongCandidates: [], primaryRecommendation: null },
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
      assessment: { ...serverTurn().assessment, strongCandidates: [], primaryRecommendation: null },
    }),
    {}
  );
  t.equal(stuck.question, null, "the stuck case did not reproduce");
  t.ok(
    /NEED_MORE_INFORMATION" && !turn\.question/.test(EXPERIENCE),
    "a turn with no question and no recommendation offers no way forward"
  );
});

test("5a preliminary guidance renders as conversation, not as a recommendation", (t) => {
  // Phase 6: the server may now precede the gating question with what the
  // engine already knows. The customer must read it as a leaning, not a
  // verdict, and the page must not dress it up as one.
  const spoken =
    "Solar shades are where we would start looking, because they cut glare while " +
    "keeping more of the view. Nighttime privacy is the part that changes it — " +
    "how important is privacy after dark?";
  const turn = contract.toAdvisorTurn(
    serverTurn({
      status: "NEED_MORE_INFORMATION",
      message: spoken,
      nextQuestion: {
        id: "q-nighttime-privacy",
        canonical: "Do you need privacy in that room after dark?",
        phrased: spoken,
        materialTo: ["interior-solar-shades"],
      },
      preliminaryGuidance: {
        leaning: { id: "interior-solar-shades", label: "Interior solar shades" },
        favour: [],
        avoid: [],
      },
      consultationCta: { recommended: false, reasons: [] },
    }),
    {}
  );

  // The whole utterance is what the visitor sees — the page renders `message`.
  t.equal(turn.message, spoken, "the guidance was truncated before rendering");
  t.ok(/\{exchange\.text\}/.test(EXPERIENCE), "the page does not render the spoken message");

  // NO CARD. `direction` is the field the panel reads, and it stays null on
  // anything short of a finished recommendation.
  t.equal(turn.direction, null, "a leaning direction was promoted to the recommendation card");
  t.equal(turn.status, "NEED_MORE_INFORMATION", "status not carried");

  // NO BOOKING PRESSURE. Phase 2's rule is server-owned and unchanged: naming a
  // direction we are leaning toward does not earn the consultation.
  t.equal(turn.offerConsultation, false, "leaning toward a product created booking pressure");

  // And it is not the dead-end shape either, so no fallback form appears.
  t.ok(turn.question !== null, "the gating question was lost");
});

test("6  GUIDANCE_READY renders without a best-fit claim", (t) => {
  const turn = contract.toAdvisorTurn(
    serverTurn({ status: "GUIDANCE_READY", assessment: { ...serverTurn().assessment, strongCandidates: [], primaryRecommendation: null } }),
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
      assessment: { ...serverTurn().assessment, strongCandidates: [], primaryRecommendation: null } }),
    {}
  );
  t.equal(turn.message, approved, "the approved wording was altered in the client");
  // The component renders `message` as text, never reformatted.
  t.ok(/whitespace-pre-wrap/.test(EXPERIENCE), "reply text is not rendered as written");
});

test("10 the owner's personal name never appears in the advisor experience", (t) => {
  for (const source of [["experience", EXPERIENCE], ["page", PAGE], ["contract", CONTRACT_SRC], ["contact form", CONTACT]]) {
    t.ok(!/\bMark\b/.test(source[1]), `the owner's name appears in ${source[0]}`);
    t.ok(!/\bAbplanalp\b/i.test(source[1]), `the owner's surname appears in ${source[0]}`);
  }
  t.ok(/Luxe Window Works/.test(EXPERIENCE), "the brand name is not used in the experience");
});

test("11 no provider or AI-product branding appears", (t) => {
  const visible = renderable(EXPERIENCE) + renderable(CONTACT);
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
  // The link text has to name the page it goes to.
  t.ok(!/Find the Right Window Treatments/.test(PRIVACY), "the privacy policy links to a page title that no longer exists");
  t.ok(/>\s*Ask Luxe\s*</.test(PRIVACY), "the privacy policy does not name the advisor page");

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
  t.ok(/turnNumber === 1\) advisorStarted\(\)/.test(EXPERIENCE), "the first message is not counted");
  // No message text, facts or state in any event payload.
  for (const leak of [/track\([^)]*message/, /track\([^)]*facts/, /track\([^)]*state/, /draft/]) {
    t.ok(!leak.test(ANALYTICS), `an event payload may carry content: ${leak}`);
  }
  t.ok(/@vercel\/analytics/.test(ANALYTICS), "a new analytics vendor was introduced");
});

// ── 17-24: the secondary lead path ─────────────────────────────────────────

/** A narrowed turn, built through the real contract rather than hand-made. */
const narrowed = (over = {}) => contract.toAdvisorTurn(serverTurn(over), {});

test("17 the callback reuses the existing consultation endpoint and adds no backend", (t) => {
  t.ok(/fetch\("\/api\/consultation"/.test(CONTACT), "the form does not post to the existing endpoint");
  const shipped = renderable(CONTACT) + renderable(LEAD_SRC);
  for (const banned of [/\/api\/lead/, /\/api\/contact-request/, /\bcrm\b/i, /hubspot/i, /salesforce/i, /mailchimp/i]) {
    t.ok(!banned.test(shipped), `a new lead destination was introduced: ${banned}`);
  }
  // The endpoint's own requirements, unchanged: name and phone.
  t.ok(/if \(!name \|\| !phone\)/.test(CONSULTATION_ROUTE), "the endpoint contract has shifted under the form");
  t.ok(/luxe-advisor/.test(CONSULTATION_ROUTE), "the endpoint does not recognise the advisor source");
});

test("18 booking stays primary and the callback stays visually secondary", (t) => {
  // The primary CTA is untouched: same words, same solid treatment, still the
  // thing offered first everywhere it appears.
  t.ok(/BOOK_CTA = "Schedule My Free In-Home Consultation"/.test(EXPERIENCE), "the primary CTA has drifted");
  t.ok(/placement="recommendation"[\s\S]{0,200}variant="solid"/.test(EXPERIENCE), "the recommendation CTA is no longer solid");
  // The callback is a text link in a smaller, quieter weight — never a button
  // competing with the gold, and never on the gold.
  t.ok(/Have Luxe contact me/.test(CONTACT), "the secondary option is missing");
  t.ok(/text-sm text-warm-gray-500/.test(CONTACT), "the secondary option is not visually quieter");
  t.ok(!/bg-gold/.test(CONTACT), "the secondary option uses the primary CTA's colour");
  // Booking is never described as the lesser option, here or on success.
  for (const banned of [/instead of booking/i, /skip the (booking|consultation)/i, /don't want to book/i]) {
    t.ok(!banned.test(CONTACT), `booking is framed as the weaker path: ${banned}`);
  }
  t.ok(/book your free in-home consultation/i.test(CONTACT), "the success state drops the booking path");
});

test("19 the callback appears only at moments that earn it", (t) => {
  const placement = (over) => {
    const turn = narrowed(over);
    if (turn.status === "RECOMMENDATION_READY") return "recommendation";
    if (turn.status === "GUIDANCE_READY" && turn.offerConsultation) return "guidance";
    if (turn.status === "ADVISOR_UNAVAILABLE") return "fallback";
    if (turn.status === "NEED_MORE_INFORMATION" && !turn.question) return "fallback";
    return null;
  };
  t.equal(placement(), "recommendation", "a recommendation does not offer the callback");
  t.equal(
    placement({ status: "GUIDANCE_READY", assessment: { ...serverTurn().assessment, strongCandidates: [], primaryRecommendation: null } }),
    "guidance",
    "guidance does not offer the callback"
  );
  t.equal(
    placement({ status: "NEED_MORE_INFORMATION", nextQuestion: { phrased: "Do you need privacy after dark?" } }),
    null,
    "a plain question turn offers a form instead of an answer"
  );
  // The rule the component actually applies, not a restatement of it.
  t.ok(/inlineLeadPlacement/.test(EXPERIENCE), "placement is not decided in one place");
  t.ok(/isLatest \? inlineLeadPlacement/.test(EXPERIENCE), "the callback is not confined to the current turn");
  t.ok(/inlineLeadPlacement\(turn\) === null && turns >= 2/.test(EXPERIENCE), "the footer can duplicate or fire too early");
});

test("20 the lead carries project context and never the conversation", (t) => {
  const payload = lead.buildLeadPayload(
    { name: " Dana ", phone: "208-555-0134", email: "dana@example.com", note: "Afternoons are best.", hp: "" },
    narrowed(),
    3
  );
  t.equal(payload.name, "Dana", "the name is not trimmed");
  t.ok(/Exterior solar shades/.test(payload.message), "the direction discussed is not passed on");
  t.ok(/keeping the view/.test(payload.message), "what matters most is not passed on");
  t.ok(/Afternoons are best\./.test(payload.message), "the visitor's own note is dropped");
  t.ok(/3 messages/.test(payload.message), "the exchange length is not recorded");

  // The transcript is the thing that must never travel. Neither side of it.
  t.ok(!/Exterior solar shades fit here/.test(payload.message), "an advisor reply reached the lead email");
  for (const leak of [/exterior-solar\b/, /view-preservation/, /verify-/, /ledger/i, /basis/i, /turnCount/]) {
    t.ok(!leak.test(payload.message), `an internal identifier reached the lead email: ${leak}`);
  }
  t.ok(!/state/i.test(JSON.stringify(Object.keys(payload))), "the opaque state is part of the payload");
  t.equal(Object.keys(payload).sort().join(","), "_hp,email,message,name,phone,problem,source", "the payload shape has drifted");
  // Nothing in the component reaches for the conversation to send it.
  t.ok(!/exchanges/.test(CONTACT), "the form has access to the conversation");
});

test("21 an advisor lead is identifiable and never presented as a booking", (t) => {
  const payload = lead.buildLeadPayload({ name: "Dana", phone: "2085550134", email: "", note: "", hp: "" }, null, 1);
  t.equal(payload.source, "luxe-advisor", "the lead does not identify the advisor as its source");
  t.ok(/not a booked consultation/i.test(payload.message), "the email does not say this is not a booking");
  t.ok(/callback request/i.test(payload.problem), "the subject line does not distinguish a callback request");
  // The visitor is told the same thing, in their own words.
  t.ok(/doesn&rsquo;t book an appointment|does not book an appointment/.test(CONTACT), "the form implies it books a time");
  t.ok(/conversation .{0,40}not recorded|not recorded or sent/i.test(flat(CONTACT + LEAD_SRC)), "the visitor is not told the conversation stays put");
});

test("22 the minimum fields are required, and refused in human language", (t) => {
  const base = { name: "Dana", phone: "2085550134", email: "", note: "", hp: "" };
  t.ok(lead.validateContact(base).ok, "a valid contact was refused");
  const noName = lead.validateContact({ ...base, name: "  " });
  t.equal(noName.ok, false, "a missing name was accepted");
  t.equal(noName.field, "name", "the wrong field was blamed");
  t.equal(lead.validateContact({ ...base, phone: "555" }).ok, false, "an unusable phone number was accepted");
  t.ok(lead.validateContact({ ...base, email: "" }).ok, "email was treated as required");
  t.equal(lead.validateContact({ ...base, note: "x".repeat(lead.MAX_NOTE_CHARS + 1) }).ok, false, "an unbounded note was accepted");
  for (const message of [noName.message, lead.validateContact({ ...base, phone: "555" }).message]) {
    t.ok(/[a-z]/.test(message) && message.split(" ").length > 3, "an error message is not a human sentence");
    t.ok(!/\b(400|422|required field|invalid input)\b/i.test(message), `a technical error reached the visitor: ${message}`);
  }
});

test("23 a failed submission keeps the visitor rather than swallowing them", (t) => {
  t.ok(/advisorLeadFailed/.test(CONTACT), "a failed submission is invisible");
  t.ok(/didn't go through/i.test(CONTACT), "there is no human-readable failure message");
  // Success is claimed on exactly one path. A rejected request and a thrown
  // one both leave the form open with the details still typed in it.
  const rejected = /!response\.ok\)\s*\{([\s\S]*?)\n      \}/.exec(CONTACT)?.[1] ?? "";
  const thrown = /\} catch \{([\s\S]*?)\n    \}/.exec(CONTACT)?.[1] ?? "";
  t.ok(rejected.length > 0 && thrown.length > 0, "the failure branches could not be found to check");
  t.ok(!/setSent\(true\)/.test(rejected), "a rejected request is reported to the visitor as sent");
  t.ok(!/setSent\(true\)/.test(thrown), "a thrown request is reported to the visitor as sent");
  t.ok(/return;/.test(rejected), "a rejected request falls through into the success path");
  // The honeypot is wired to what is actually sent, not decoration.
  t.ok(/_hp: contact\.hp/.test(LEAD_SRC), "the honeypot field is never transmitted");
  t.ok(/body\._hp/.test(CONSULTATION_ROUTE), "the endpoint no longer checks the honeypot");
});

test("24 lead analytics separate interest from a request, and claim no bookings", (t) => {
  for (const event of ["advisor_lead_opened", "advisor_lead_submitted", "advisor_lead_failed"]) {
    t.ok(ANALYTICS.includes(event), `${event} is not defined`);
    t.ok(CONTACT.includes(toCamel(event)), `${event} is never fired`);
  }
  // Opened is interest; submitted is a request that reached the endpoint. They
  // are different numbers and the code has to keep them different.
  t.ok(/advisorLeadOpened\(placement\)/.test(CONTACT), "opening the form is not counted");
  t.ok(/advisorLeadSubmitted\(placement, turns\)[\s\S]{0,60}setSent/.test(CONTACT), "submission is counted before the endpoint accepted it");
  t.ok(/NOT BOOKED CONSULTATIONS/.test(ANALYTICS), "nothing warns against counting these as bookings");
  // Still no content in any payload, and still no new vendor.
  for (const leak of [/track\([^)]*name/, /track\([^)]*phone/, /track\([^)]*email/, /track\([^)]*note/, /track\([^)]*message/]) {
    t.ok(!leak.test(ANALYTICS), `a lead event payload may carry contact details: ${leak}`);
  }
  t.ok(!/analytics/i.test(CONTACT.replace(/advisor\/client\/analytics/g, "")), "a second analytics vendor reached the form");
  // The failure path is documented as unsolved rather than quietly closed.
  t.ok(/KNOWN GAP: THIS IS NOT A BOOKING/.test(ANALYTICS), "the Calendly attribution gap was dropped");
});

// ── 25: the card cannot name a different product than the prose ────────────

test("25 the card renders the server's canonical direction, never its own pick", (t) => {
  // Several strong candidates, and the canonical direction is deliberately NOT
  // the one a naive `strongCandidates[0]` would show. If the card still picks
  // for itself, this is where it gets caught.
  const many = serverTurn({
    assessment: {
      ...serverTurn().assessment,
      primaryRecommendation: { id: "cellular", label: "Cellular shades", reasons: ["x"] },
      strongCandidates: [
        { id: "banded-shades", label: "Banded shades", reasons: ["x"] },
        { id: "cellular", label: "Cellular shades", reasons: ["x"] },
        { id: "interior-roller", label: "Interior roller shades", reasons: ["x"] },
      ],
    },
  });
  t.equal(contract.toAdvisorTurn(many, {}).direction, "Cellular shades", "the card chose its own winner");

  // The client must read the canonical field and nothing else.
  t.ok(/primaryRecommendation/.test(CONTRACT_SRC), "the client does not read the canonical direction");
  t.ok(!/strongCandidates\?\.\[0\]/.test(CONTRACT_SRC), "the client still derives a direction from the candidate list");
  t.ok(!/strongCandidates/.test(EXPERIENCE), "the component reaches into the candidate list directly");

  // No canonical direction means no card headline, whatever else is present.
  const none = serverTurn({
    status: "GUIDANCE_READY",
    assessment: { ...serverTurn().assessment, primaryRecommendation: null, strongCandidates: [] },
  });
  t.equal(contract.toAdvisorTurn(none, {}).direction, null, "a direction appeared with none established");

  // A malformed or missing field degrades to no claim rather than a guess.
  const missing = serverTurn({ assessment: { ...serverTurn().assessment, primaryRecommendation: undefined } });
  t.equal(contract.toAdvisorTurn(missing, {}).direction, null, "a missing canonical direction was filled in by the client");

  // Alternatives are still available to the prose — they are simply not the card.
  t.equal(contract.toAdvisorTurn(many, {}).status, "RECOMMENDATION_READY", "the multi-candidate turn stopped recommending");
});

// ── 26: ANSWERED is a reply, not a result ──────────────────────────────────

test("26 ANSWERED renders an answer and never a recommendation card", (t) => {
  // What the server sends for "what are your hours?" — no candidates, no
  // question, no card to render, and deliberately no consultation pitch.
  const answered = serverTurn({
    status: "ANSWERED",
    message: "We're open Monday to Friday, 9:00 AM to 5:00 PM, and Saturday until 2:00 PM.",
    nextQuestion: null,
    assessment: {
      ...serverTurn().assessment,
      primaryRecommendation: null,
      strongCandidates: [],
      tradeoffs: [],
      verificationRequirements: [],
    },
    consultationCta: { recommended: false, reasons: [] },
    state: { facts: {} },
  });
  const turn = contract.toAdvisorTurn(answered, {});

  t.equal(turn.status, "ANSWERED", "the status was not carried through the client contract");
  t.equal(turn.direction, null, "a product direction was claimed on a plain answer");
  t.equal(turn.question, null, "a qualification question was rendered on an answer");
  t.equal(turn.tradeoff, null, "a product tradeoff was attached to a business answer");
  t.equal(turn.confirmInHome.length, 0, "an in-home checklist was attached to a business answer");
  t.equal(turn.offerConsultation, false, "a consultation was pushed after a question that did not invite one");
  t.ok(turn.message.includes("9:00 AM"), "the answer text did not survive");

  // The panel is gated on RECOMMENDATION_READY, so ANSWERED cannot reach it.
  t.ok(
    /isRecommendation = turn\?\.status === "RECOMMENDATION_READY"/.test(EXPERIENCE),
    "the recommendation panel is no longer gated on the recommendation status"
  );
  t.ok(/turn\?\.status === "ANSWERED" && turn\.offerConsultation/.test(EXPERIENCE), "ANSWERED has no rendering branch");
  // And the callback form does not appear under an answer that never invited one.
  t.ok(
    /if \(turn\.status === "ANSWERED"\) return turn\.offerConsultation \? "guidance" : null;/.test(EXPERIENCE),
    "the callback form can appear under any answer"
  );

  // When the topic does invite a consultation, the offer is available.
  const inviting = contract.toAdvisorTurn(
    { ...answered, consultationCta: { recommended: true, reasons: ["guidance-ready"] } },
    {}
  );
  t.equal(inviting.offerConsultation, true, "a consultation-relevant answer cannot offer one");
  t.equal(inviting.direction, null, "an inviting answer still claimed a direction");
});

test("27 every consultation prompt answers to the same server decision", (t) => {
  // Four surfaces could show one: the recommendation card, the footer, the
  // inline links and the callback form. They answered to two different rules —
  // the card rendered unconditionally while the rest obeyed the server — which
  // is how a customer could be shown a next step nobody had decided to offer.
  const withCta = contract.toAdvisorTurn(serverTurn(), {});
  t.equal(withCta.offerConsultation, true, "the fixture does not authorise a CTA");

  const withoutCta = contract.toAdvisorTurn(
    serverTurn({ consultationCta: { recommended: false, reasons: [] } }),
    {}
  );
  t.equal(withoutCta.offerConsultation, false, "the server decision was not carried through");
  t.equal(withoutCta.direction, "Exterior solar shades", "the recommendation itself was suppressed with its CTA");

  // Every branch in the component is gated on the same field.
  for (const gate of [
    /turn\.offerConsultation && \(\s*<div className="px-5 py-5 bg-warm-white">/,
    /turn\?\.status === "ANSWERED" && turn\.offerConsultation/,
    /turn\?\.status === "GUIDANCE_READY" && turn\.offerConsultation/,
    /if \(!turn\?\.offerConsultation\) return null;/,
  ]) {
    t.ok(gate.test(EXPERIENCE), `a consultation surface does not consult the server: ${gate}`);
  }
  // And the callback form follows the same rule on a recommendation.
  t.ok(
    /RECOMMENDATION_READY"\) return turn\.offerConsultation \? "recommendation" : null;/.test(EXPERIENCE),
    "the callback form can appear where the CTA was not authorised"
  );
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
