#!/usr/bin/env node
/**
 * Luxe Window Advisor — LIVE provider evaluation.
 *
 * ⚠️  THIS CALLS ANTHROPIC AND COSTS MONEY.
 * ⚠️  It requires ANTHROPIC_API_KEY and is never part of `check`, `build`,
 *     `verify`, or any commit hook. Run it explicitly, on purpose.
 *
 *     npm run eval:advisor:live
 *
 * The deterministic suite (`npm run test:advisor:server`) proves what the
 * *system* does with a given model output. This proves something different:
 * whether the model actually reads a homeowner the way we need it to.
 *
 * MULTI-TURN, BECAUSE THE INTERESTING FAILURES ARE. A single message never
 * exercised whether the advisor can follow a conversation, which is how it
 * shipped unable to. Each case below is a sequence, state is threaded exactly
 * as the real client threads it, and the transcript the model received is
 * printed alongside the reply so a wrong answer can be traced to what it was
 * actually given.
 *
 * Nothing here is asserted in CI, because a live model is not a deterministic
 * fixture and a flaky gate is worse than no gate.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Convenience: pick the key up from .env.local the way `next` would, so the
// harness runs without exporting anything by hand. Never printed.
if (!process.env.ANTHROPIC_API_KEY) {
  try {
    for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split("\n")) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // No .env.local is fine; the check below reports it properly.
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "ANTHROPIC_API_KEY is not set.\n\n" +
      "This script makes real, billable calls to Anthropic. Set the key in\n" +
      ".env.local (gitignored) or in your shell, then run it again:\n\n" +
      "  ANTHROPIC_API_KEY=sk-ant-... npm run eval:advisor:live\n"
  );
  process.exit(1);
}

const load = (p) => import(pathToFileURL(join(ROOT, p)).href);

const [
  products, priorities, rules, guardrailKnowledge, brandKnowledge, answerKnowledge,
  engine, extraction, ledgerModule, transcriptModule, traceModule, counterfactual, questionSelection,
  answerSelection, guardrails, prompts, advisorModule, providerModule, brandResponse,
  productData, areaData, homepageFaqs, constants,
] = await Promise.all([
  load("lib/advisor/knowledge/products.ts"),
  load("lib/advisor/knowledge/priorities.ts"),
  load("lib/advisor/knowledge/rules.ts"),
  load("lib/advisor/knowledge/guardrails.ts"),
  load("lib/advisor/knowledge/brand-responses.ts"),
  load("lib/advisor/knowledge/answers.ts"),
  load("lib/advisor/engine.ts"),
  load("lib/advisor/server/extraction.ts"),
  load("lib/advisor/server/ledger.ts"),
  load("lib/advisor/server/transcript.ts"),
  load("lib/advisor/server/trace.ts"),
  load("lib/advisor/server/counterfactual.ts"),
  load("lib/advisor/server/question-selection.ts"),
  load("lib/advisor/server/answer-selection.ts"),
  load("lib/advisor/server/guardrails.ts"),
  load("lib/advisor/server/prompts.ts"),
  load("lib/advisor/server/advisor.ts"),
  load("lib/advisor/server/provider.ts"),
  load("lib/advisor/server/brand-response.ts"),
  load("lib/product-data.ts"),
  load("lib/area-data.ts"),
  load("lib/homepage-faqs.ts"),
  load("lib/constants.ts"),
]);

/** Assembled exactly as `knowledge/index.ts` assembles it for the app. */
const ANSWER_TOPICS = [
  ...answerKnowledge.BUSINESS_ANSWERS,
  ...answerKnowledge.answerTopicsFromBusiness({
    hours: constants.BUSINESS.hours,
    phone: constants.BUSINESS.phone,
    email: constants.BUSINESS.email,
    serviceAreas: constants.SERVICE_AREAS,
  }),
  ...answerKnowledge.answerTopicsFromFaqs(homepageFaqs.HOMEPAGE_FAQS, "Published homepage FAQ", "faq-home"),
  ...Object.values(productData.productPages).flatMap((page) =>
    answerKnowledge.answerTopicsFromFaqs(page.faqs, `Published FAQ on /products/${page.slug}`, `faq-product-${page.slug}`)
  ),
  ...Object.values(areaData.areaPages).flatMap((page) =>
    answerKnowledge.answerTopicsFromFaqs(page.faqs ?? [], `Published FAQ on /areas/${page.slug}`, `faq-area-${page.slug}`)
  ),
];

const KNOWLEDGE = {
  directions: products.PRODUCT_DIRECTIONS,
  crossCuttingOptions: products.CROSS_CUTTING_OPTIONS,
  unrepresentedSiteProducts: products.UNREPRESENTED_SITE_PRODUCTS,
  priorities: priorities.PRIORITIES,
  recognition: rules.RECOGNITION_RULES,
  promotions: rules.PROMOTION_RULES,
  tradeoffs: rules.TRADEOFF_RULES,
  questions: rules.QUESTION_RULES,
  verifications: rules.VERIFICATION_RULES,
  escalations: rules.ESCALATION_RULES,
  conflicts: rules.CONFLICT_RULES,
  guardrails: guardrailKnowledge.GUARDRAILS,
  businessPolicies: rules.BUSINESS_POLICIES,
  brandResponses: brandKnowledge.BRAND_RESPONSES,
  answers: ANSWER_TOPICS,
};

/** Mirrors `describeLedger` in app/api/advisor/route.ts. */
const describeLedger = (ledger) =>
  Object.entries(ledger)
    .map(([field, entry]) => {
      const values = Array.isArray(entry)
        ? entry.map((r) => `${r.value} (${r.basis})`).join(", ")
        : `${entry.value} (${entry.basis})`;
      return values ? `${field}: ${values}` : "";
    })
    .filter(Boolean)
    .join("\n");

/**
 * Token usage for the turn being run, filled in by the provider adapter.
 *
 * The whole point of reporting it here: a `cache_control` marker that fails to
 * cache produces a completely normal response, so "caching is enabled" is not a
 * claim this harness is willing to make from configuration. `cache_read` above
 * zero on turn two is the evidence, and it is printed per call.
 */
let turnUsage = [];

const makeAdvisor = (trace) => advisorModule.createAdvisor({
  trace,
  provider: providerModule.createAnthropicProvider({
    onUsage: (u) => turnUsage.push(u),
  }),
  knowledge: KNOWLEDGE,
  assess: engine.assess,
  validateUpdates: extraction.validateUpdates,
  buildDeltaSchema: extraction.buildDeltaSchema,
  describeVocabulary: extraction.describeVocabulary,
  isListField: extraction.isListField,
  isInformational: extraction.isInformational,
  isSchedulingIntent: extraction.isSchedulingIntent,
  selectAnswerTopics: answerSelection.selectAnswerTopics,
  selectNamedDirections: answerSelection.selectNamedDirections,
  describeDirection: answerSelection.describeDirection,
  selectVerifiedAnswer: answerSelection.selectVerifiedAnswer,
  unknownAnswer: answerKnowledge.unknownAnswerText({ phone: constants.BUSINESS.phone, email: constants.BUSINESS.email }),
  transcript: {
    validate: transcriptModule.validateTranscript,
    append: transcriptModule.appendExchange,
    render: transcriptModule.renderTranscript,
    retrievalContext: transcriptModule.retrievalContext,
  },
  ledger: {
    validate: (raw) =>
      ledgerModule.validateLedger(
        raw,
        (field) => extraction.EXTRACTION_FIELDS.includes(field),
        (field, value) => extraction.allowedValues(field).includes(value),
        (field) => extraction.isListField(field)
      ),
    apply: ledgerModule.applyUpdates,
    project: ledgerModule.projectFacts,
    describe: describeLedger,
  },
  classifyQuestions: counterfactual.classifyQuestions,
  isVerificationClass: questionSelection.isVerificationClass,
  allowedValues: extraction.allowedValues,
  selectNextQuestion: questionSelection.selectNextQuestion,
  validateGeneratedText: guardrails.validateGeneratedText,
  sanitizeForOutput: guardrails.sanitizeForOutput,
  prompts: {
    extractionSystemPrompt: prompts.extractionSystemPrompt,
    extractionUserMessage: prompts.extractionUserMessage,
    answerSystemPrompt: prompts.answerSystemPrompt,
    discoverySystemPrompt: prompts.discoverySystemPrompt,
    questionSystemPrompt: prompts.questionSystemPrompt,
    recommendationSystemPrompt: prompts.recommendationSystemPrompt,
    guidanceSystemPrompt: prompts.guidanceSystemPrompt,
    phrasingUserMessage: prompts.phrasingUserMessage,
  },
  allowedBrands: constants.BUSINESS.brands,
  matchBrandResponse: brandResponse.matchBrandResponse,
});

/**
 * `watch` is a soft signal for a human reader, not an assertion. Each entry is
 * a note about what the reply to that turn has to demonstrate.
 */
const CONVERSATIONS = [
  {
    name: "lake view, heat, then a decision — does it hold the thread?",
    turns: [
      { say: "I have huge west-facing windows overlooking the lake." },
      { say: "The heat is the biggest problem." },
      { say: "I don't want to lose the view though." },
      { say: "So which one would you recommend?", watch: "must decide, using all three turns — not re-ask" },
    ],
  },
  {
    name: "product comparison, then follow-ups that name nothing",
    turns: [
      { say: "What is the difference between roller and cellular shades?" },
      { say: "Which gives me a cleaner look?", watch: "must know which two products are being compared" },
      { say: "And what about insulation?", watch: "still the same two products" },
      { say: "Okay, what would you put in your own house?", watch: "must not restart discovery" },
    ],
  },
  {
    name: 'the bare "why?"',
    turns: [
      { say: "Would you recommend cellular or roller shades for a bedroom?" },
      { say: "Why?", watch: "must explain the previous answer, not ask what room it is" },
    ],
  },
  {
    name: "answering the advisor's own question",
    turns: [
      { say: "My bedroom faces west." },
      { say: "Mostly heat, but I still want it dark at night.", watch: "must read as an answer to whatever was just asked" },
      { say: "So which one would you do?", watch: "must commit" },
    ],
  },
  {
    name: "recalling its own earlier answer",
    turns: [
      { say: "My living room gets really hot in the afternoon." },
      { say: "What was the first option you mentioned?", watch: "must name what it actually said" },
    ],
  },
  {
    name: "phase 2 — a conversation, not an interrogation",
    turns: [
      { say: "What's better, cellular or roller shades?", watch: "must answer, not ask what room" },
      { say: "I mostly care about insulation." },
      { say: "But I still want a clean look." },
      { say: "So what would you choose?", watch: "must decide; no booking pitch yet" },
    ],
  },
  {
    name: "phase 2 — unknown business question",
    turns: [
      { say: "Do you have a showroom?", watch: "honest unknown; must NOT ask what room the shades are for" },
    ],
  },
  {
    name: "phase 2 — product education",
    turns: [
      { say: "What do roller shades look like?", watch: "answer; no qualification, no booking prompt" },
    ],
  },
  {
    name: "phase 2 — genuine next-step intent",
    turns: [
      { say: "I think I'm ready to have someone come out.", watch: "booking path SHOULD appear here" },
    ],
  },
  {
    name: "phase 3 — latency by route",
    turns: [
      { say: "What are your hours?", watch: "verified answer: expect 0 model calls" },
      { say: "Do you have a showroom?", watch: "unknown: expect extraction only" },
      { say: "What's the difference between roller and cellular shades?", watch: "genuine reasoning: 2 calls" },
      { say: "Which gives me the best view?", watch: "contextual follow-up" },
      { say: "What about insulation?", watch: "contextual follow-up" },
    ],
  },
  {
    name: "phase 3 — project reasoning keeps its calls",
    turns: [
      { say: "I have huge west-facing windows and the heat is terrible, but I don't want to lose my lake view." },
      { say: "What would you recommend?", watch: "real reasoning; slower is acceptable here" },
    ],
  },
  {
    name: "changing rooms without losing the project",
    turns: [
      { say: "West-facing living room, brutal afternoon heat." },
      { say: "Would that work in the bedroom too?", watch: "must carry the heat/exposure context to the new room" },
    ],
  },
];

const only = process.argv[2];
const selected = only
  ? CONVERSATIONS.filter((c) => c.name.toLowerCase().includes(only.toLowerCase()))
  : CONVERSATIONS;

console.log(`Live advisor evaluation — model ${providerModule.ADVISOR_MODEL}`);
console.log(`${selected.length} conversation(s), ${selected.reduce((n, c) => n + c.turns.length, 0)} turns. This makes billable calls.\n`);

for (const conversation of selected) {
  console.log("═".repeat(78));
  console.log(`CONVERSATION  ${conversation.name}`);
  console.log("═".repeat(78));

  // State threaded exactly as the browser threads it: whatever came back last
  // turn goes back in unmodified.
  let state = {};

  for (const [index, turn] of conversation.turns.entries()) {
    const started = Date.now();
    let result;
    turnUsage = [];
    const trace = traceModule.createTrace(() => Date.now());
    try {
      result = await makeAdvisor(trace).runTurn({ message: turn.say, state });
    } catch (error) {
      console.log(`\n  TURN ${index + 1} THREW  ${error?.code ?? error?.name ?? error}`);
      break;
    }
    const elapsed = Date.now() - started;

    // What the model was given to work with, before this turn was recorded.
    const historyIn = transcriptModule.renderTranscript(
      transcriptModule.validateTranscript(state.transcript)
    );

    console.log(`\n  ── turn ${index + 1} ${"─".repeat(60)}`);
    if (historyIn) {
      console.log("  HISTORY IN");
      for (const line of historyIn.split("\n")) console.log(`    ${line}`);
    } else {
      console.log("  HISTORY IN   (none — first turn)");
    }
    console.log(`  SAID         ${turn.say}`);
    const d = result.diagnostics;
    console.log(`  STATUS       ${result.status}   (${(elapsed / 1000).toFixed(1)}s)`);
    console.log(
      `  COST         ${d?.providerCalls ?? "?"} model call(s)   route=${d?.route ?? "?"}` +
        (d?.deterministic ? "   DETERMINISTIC" : "") + (d?.fellBack ? "   fell-back" : "")
    );
    if (d) {
      console.log(
        "  BREAKDOWN    " +
          Object.entries(d.stages).map(([k, v]) => `${k} ${Math.round(v)}ms`).join("  ")
      );
    }
    if (turnUsage.length) {
      console.log(
        "  TOKENS       " +
          turnUsage
            .map(
              (u) =>
                `${u.stage} in=${u.inputTokens} out=${u.outputTokens} ` +
                `cache_write=${u.cacheCreationTokens} cache_read=${u.cacheReadTokens}` +
                (u.cacheReadTokens > 0 ? " HIT" : u.cacheCreationTokens > 0 ? " miss(written)" : "")
            )
            .join("\n               ")
      );
    }
    console.log(`  FACTS        ${JSON.stringify(result.state.facts ?? {})}`);
    if (result.assessment) {
      console.log(`  PRIMARY      ${result.assessment.primaryRecommendation?.label ?? "(none)"}`);
    }
    console.log(
      `  BOOKING CTA  ${result.consultationCta.recommended ? "SHOWN" : "not shown"}` +
        (result.consultationCta.reasons.length ? `  (${result.consultationCta.reasons.join(", ")})` : "")
    );
    if (result.nextQuestion) console.log(`  ASKED        ${result.nextQuestion.id}`);
    if (result.error) console.log(`  ERROR        ${result.error}`);
    if (result.guardrailInterventions.length) {
      console.log(`  INTERVENED   ${result.guardrailInterventions.join(", ")}`);
    }
    console.log(`  REPLY        ${result.message}`);
    if (turn.watch) console.log(`  WATCH FOR    ${turn.watch}`);

    state = result.state;
  }

  const finalTranscript = transcriptModule.validateTranscript(state.transcript);
  console.log(
    `\n  transcript retained: ${finalTranscript.length} message(s), cap ${transcriptModule.MAX_TRANSCRIPT_MESSAGES}`
  );
  console.log("");
}

console.log("═".repeat(78));
console.log("Read the output above. Nothing here gates a build.");
console.log("The question to ask of each reply: could it have been written without");
console.log("the HISTORY IN block? If yes, the memory is not doing its job.");
