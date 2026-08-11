/**
 * Luxe Window Advisor — post-generation guardrail validation. (Phase B)
 *
 * The brief is explicit that prompt instructions are not enough, and it is
 * right: a system prompt is a request, and a model under pressure — or under
 * prompt injection — can decline it. So every piece of customer-facing text the
 * model produces is checked here before it can leave the server. A violation is
 * never returned: the turn is regenerated once, and if it violates again the
 * response falls back to deterministic text assembled from the assessment.
 *
 * VALIDATION IS UNCONDITIONAL. Phase A scopes some guardrails to the projects
 * where they are live, which controls what the model is *told*. Checking is not
 * scoped the same way — a fabricated price is wrong on every project, whether
 * or not pricing came up. Scope narrows instruction; it must not narrow
 * enforcement.
 *
 * HONEST LIMITS. Some guardrails are enforceable by pattern and some are not.
 * `no-recommendation-from-product-name-alone` is structural — the engine
 * decides candidates, so text cannot violate it. `no-substitute-for-
 * professional-measurement` is a stance rather than a phrase. Those are
 * prompt-enforced only, and are listed as such in
 * `docs/quality/advisor-phase-b.md` rather than given a pattern that would
 * mostly produce false positives.
 *
 * Approved Luxe knowledge must survive these checks. "roughly 3/4 inch",
 * "around 3% openness" and "approximately 48-72 hours" are things the advisor
 * is supposed to say, so the patterns below are written to let them through and
 * catch the guarantee, not the number.
 */

export interface GuardrailViolation {
  readonly guardrailId: string;
  readonly evidence: string;
}

export interface GuardrailContext {
  /**
   * Every product name that is REAL — Luxe's whole catalogue, plus the proper
   * nouns its own approved material uses.
   *
   * NOT "what this turn is allowed to talk about". Relevance is the prompt's
   * job and the engine's; this list answers a narrower, factual question: does
   * this product exist? A recommendation that promotes an alternative over the
   * chosen direction is a prompt failure the engine already makes unreachable.
   * A recommendation that offers "CrystalWeave Luxe shades" is a claim about
   * Luxe's catalogue that is simply false, and it used to pass — the field was
   * declared here and never read.
   */
  readonly allowedProductLabels: readonly string[];
  /** Brand names Luxe genuinely carries, supplied by the caller. */
  readonly allowedBrands: readonly string[];
  /**
   * The verified material this turn was given to write from.
   *
   * Used for one thing: deciding whether a superlative is earned. The corpus
   * says cellular is "among Luxe's preferred directions when a customer wants a
   * very dark room", and a live reply upgraded that to "genuinely the strongest
   * darkening option we offer" — a ranking nobody made. It also says, of a
   * different property, "the strongest energy direction in the Luxe range",
   * where the same word is exactly right.
   *
   * So the word is not banned; the claim has to appear in the material. Absent
   * material, no superlative is supported.
   */
  readonly supportingMaterial?: string;
}

interface Rule {
  readonly guardrailId: string;
  readonly patterns: readonly RegExp[];
}

/**
 * Third-party names that would be an invented claim about what Luxe sells.
 * Deliberately a short, concrete list of the retailers and manufacturers a
 * model is most likely to reach for unprompted — an exhaustive brand list is
 * impossible, which is why the docs record this as partial coverage.
 */
const OFF_CATALOGUE_BRANDS = [
  "hunter douglas", "levolor", "bali blinds", "graber", "budget blinds",
  "3 day blinds", "select blinds", "blinds.com", "smith & noble",
  "the shade store", "ikea", "home depot", "lowe's", "costco",
];

const RULES: readonly Rule[] = [
  {
    guardrailId: "no-fabricated-pricing",
    patterns: [
      /\$\s?\d/,
      /\b\d[\d,]*(\.\d+)?\s*(dollars|usd)\b/i,
      /\b(costs?|priced?|price of|runs?)\s+(about|around|roughly|approximately)?\s*\$?\d/i,
    ],
  },
  {
    guardrailId: "no-binding-quote",
    patterns: [
      /\b(quote|estimate)\b[^.]{0,30}\$?\s?\d/i,
      /\bI can quote\b/i,
      /\byour total (would|will) be\b/i,
    ],
  },
  {
    guardrailId: "no-total-blackout-guarantee",
    patterns: [
      /\b(guarantee|guaranteed|promise|ensure|assure)[^.]{0,60}black-?out/i,
      /black-?out[^.]{0,60}\b(guarantee|guaranteed|promise|complete|total|100\s?%)/i,
      /\b(complete|total|absolute|100\s?%|true)\s+black-?out\b/i,
      /\b(completely|totally|fully|entirely)\s+dark\b/i,
      /\bno light (at all|whatsoever|gets? (in|through))\b/i,
      /\bzero light\b/i,
    ],
  },
  {
    guardrailId: "no-guaranteed-temperature-reduction",
    patterns: [
      /\b\d+\s*(°|degrees?\b|deg\b)/i,
      /\b(cooler|warmer|reduce[sd]? the temperature)\b[^.]{0,30}\bby\s+\d/i,
    ],
  },
  {
    guardrailId: "no-guaranteed-wind-performance",
    patterns: [
      /\b(withstand|rated for|handles?|holds? up to)\b[^.]{0,40}\b\d+\s*(mph|km\/h|kph)\b/i,
      /\b(guarantee|guaranteed|promise)[^.]{0,40}\bwind\b/i,
      /\bwind-?proof\b/i,
    ],
  },
  {
    guardrailId: "no-guaranteed-fit",
    patterns: [
      /\b(guarantee|guaranteed|promise)[^.]{0,40}\bfits?\b/i,
      /\bwill fit (perfectly|exactly)\b/i,
    ],
  },
  {
    guardrailId: "no-pretended-measurement",
    patterns: [
      /\b(I|we)\s+(have\s+|'ve\s+)?measured\b/i,
      /\bbased on (my|our|the) measurements\b/i,
      /\byour (window|opening) (is|measures)\s+\d/i,
    ],
  },
  {
    guardrailId: "no-financing",
    patterns: [/\bfinanc(e|ing)\b/i, /\bpayment plans?\b/i, /\bmonthly payments?\b/i, /\b0\s?%\s*(apr|interest)\b/i],
  },
  {
    guardrailId: "no-service-of-products-luxe-did-not-sell",
    patterns: [
      /\bwe (can|could|will|do)\b[^.]{0,30}\b(service|repair|fix)\b[^.]{0,40}\b(existing|current|old|other|another|any)\b/i,
      /\bwe service (all|any)\b/i,
    ],
  },
  {
    guardrailId: "no-guaranteed-appointment-availability",
    patterns: [
      /\b(guarantee|guaranteed|promise)[^.]{0,40}\b(appointment|slot|visit)\b/i,
      /\bwe (can|will) (definitely )?(be there|come out)\b[^.]{0,30}\b(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    ],
  },
  {
    guardrailId: "no-guaranteed-manufacturer-availability",
    patterns: [
      /\b(guarantee|guaranteed)[^.]{0,40}\b(available|in stock)\b/i,
      /\b(always|definitely) in stock\b/i,
    ],
  },
  {
    guardrailId: "no-owner-personal-name",
    // Case-sensitive so "market", "marked" and "marketing" do not trip it.
    patterns: [/\bMark\b/, /\bAbplanalp\b/i],
  },
  {
    guardrailId: "no-fabricated-manufacturer-specification",
    patterns: [
      /\bR-?values?\b/i,
      /\bblocks?\s+\d+\s?%/i,
      /\b\d+\s?%\s*(of\s+)?(uv|heat|glare|light|energy|solar)\b/i,
      /\breduces?\b[^.]{0,30}\bby\s+\d+\s?%/i,
      /\b(u-factor|shgc|solar heat gain coefficient)\b/i,
    ],
  },
  {
    guardrailId: "no-assumed-cordless-or-motorized-availability",
    patterns: [
      /\b(all|every|any|each)\b[^.]{0,30}\b(cordless|motoriz)/i,
      /\b(cordless|motoriz\w+)\b[^.]{0,30}\bon (all|any|every)\b/i,
    ],
  },
  {
    guardrailId: "no-hardcoded-gap-dimensions",
    patterns: [/\bexactly\s+\d/i, /\bgaps?\b[^.]{0,30}\bexactly\b/i],
  },
  {
    guardrailId: "no-mounting-safety-claim-without-inspection",
    patterns: [
      /\b(safe|secure|strong enough|sturdy enough)\s+(to|for)\s+(mount|hang|attach)/i,
      /\b(mounting|the mount|it)\s+(is|will be)\s+(safe|secure|fine|solid)\b/i,
      /\bwill (definitely )?hold\b/i,
    ],
  },
  {
    guardrailId: "no-unsecured-exterior-shade",
    patterns: [/\bfree-?hanging\b/i, /\bhangs? freely\b/i, /\bunsecured\s+(exterior\s+)?shade/i],
  },
  {
    guardrailId: "no-guaranteed-nighttime-privacy-from-solar",
    patterns: [
      /\b(guarantee|guaranteed|complete|full|total)[^.]{0,40}\bnight-?time privacy\b/i,
      /\bsolar\b[^.]{0,60}\bprivacy at night\b/i,
    ],
  },
  {
    guardrailId: "no-guaranteed-maximum-size",
    patterns: [/\b(up to|maximum of|max of)\s+\d+\s*(feet|ft\b|foot|inches|in\b|")/i],
  },
  {
    guardrailId: "no-unconfirmed-service-area-promise",
    patterns: [
      /\bwe (serve|service|cover|come out to)\b[^.]{0,30}\b(anywhere|nationwide|the whole|all of|any location)\b/i,
    ],
  },
];

/**
 * The nouns a product name attaches to. A capitalised word in front of one of
 * these is being used as a product's NAME, which is the shape being policed.
 */
const PRODUCT_NOUN =
  "(?:shades?|blinds?|shutters?|drapery|draperies|panels?|treatments?|systems?|collections?)";

/**
 * Words that are capitalised because a sentence started, not because they name
 * anything. Without these, "These shades work well" reads as a product called
 * "These".
 */
const SENTENCE_WORDS = new Set([
  "the", "these", "those", "this", "that", "our", "your", "their", "both",
  "all", "any", "some", "most", "many", "other", "another", "either", "neither",
  "each", "every", "no", "two", "three", "several", "few", "custom", "if",
  "for", "with", "and", "but", "so", "because", "when", "where", "what",
  "which", "how", "why", "we", "you", "they", "it", "here", "there", "in",
  "on", "at", "as", "than", "then", "yes", "absolutely", "good", "great",
]);

const tokenise = (text: string): readonly string[] =>
  text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * A product name that does not exist.
 *
 * The audit that prompted this could get "CrystalWeave Luxe shades" past every
 * check on the page, because `allowedProductLabels` was declared and never
 * read and the only name check was a fifteen-entry list of competitors. An
 * invented name is a worse failure than an invented competitor: a homeowner can
 * look up Hunter Douglas and find it real, but they will ring Luxe and ask for
 * something nobody sells.
 *
 * WHAT IS POLICED IS A NAME, NOT A CATEGORY. "Cellular shades" is a category —
 * it names a kind of thing, it appears in Luxe's catalogue, and the advisor is
 * supposed to say it. "CrystalWeave shades" is a name — a specific product,
 * capitalised as a proper noun, that Luxe would have to stock. So the check
 * looks for the three shapes a fabricated name actually takes, and clears every
 * one of them against the real catalogue:
 *
 *   FUSED CAPITALS — CrystalWeave, SunGuard, PowerView, SmartShade. English
 *     words are not built this way; product names are.
 *   TRADEMARK MARKERS — anything carrying (tm) or the symbols. Approved Luxe
 *     copy does not use them.
 *   A CAPITALISED NAME IN FRONT OF A PRODUCT NOUN — "Aurora shades",
 *     "Serenity Collection blinds". Sentence-initial single words are exempt,
 *     because "Cellular shades trap air" starts a sentence rather than naming a
 *     brand.
 *
 * Deliberately shape-based rather than a list. A list of names Luxe does not
 * sell cannot be written down: the whole point of an invented name is that
 * nobody has heard it before.
 */
function inventedProductName(text: string, context: GuardrailContext): string | null {
  const real = new Set<string>();
  for (const label of [...context.allowedProductLabels, ...context.allowedBrands]) {
    for (const word of tokenise(label)) real.add(word);
  }
  // Luxe's own name is not a product name, and it appears in almost every reply.
  for (const word of ["luxe", "window", "works"]) real.add(word);

  const known = (word: string): boolean =>
    real.has(word.toLowerCase()) || SENTENCE_WORDS.has(word.toLowerCase());

  const fused = text.match(/\b[A-Z][a-z]+[A-Z][A-Za-z]*\b/g) ?? [];
  for (const word of fused) if (!known(word)) return word;

  const trademark = /[®™]|\((?:tm|r)\)/i.exec(text);
  if (trademark) return trademark[0];

  const named = new RegExp(`((?:\\b[A-Z][a-z]+ ){1,3})(${PRODUCT_NOUN})\\b`, "g");
  for (const match of text.matchAll(named)) {
    const words = match[1].trim().split(/\s+/);
    // "Cellular shades keep the heat out." opens a sentence; it does not name a
    // product. Two capitalised words in a row is a different matter — English
    // does not do that by accident mid-reply.
    const start = match.index === 0 || /[.!?]\s+$|^["“'(]$/.test(text.slice(Math.max(0, match.index - 2), match.index));
    if (words.length === 1 && start) continue;
    const invented = words.find((word) => !known(word));
    if (invented) return `${match[1].trim()} ${match[2]}`;
  }

  return null;
}

/**
 * Superlatives, which are claims about a ranking.
 *
 * "Among our preferred directions" and "the strongest option we offer" are not
 * the same sentence. The second says Luxe compared its whole range and this
 * came first; the corpus rarely says that, and a model reaching for emphasis
 * says it easily.
 */
const SUPERLATIVES = [
  "strongest", "best", "darkest", "quietest", "warmest", "coolest", "toughest",
  "most effective", "most efficient", "most durable", "most popular",
  "number one", "unbeatable", "unmatched", "second to none",
];

/**
 * A superlative the material does not support.
 *
 * WORD-LEVEL EVIDENCE, DELIBERATELY. The material is what this turn was told;
 * if it says "strongest", "strongest" is earned, and if it says nothing of the
 * kind then no ranking has been established to report. That keeps the same word
 * legitimate on an energy project — where the corpus really does say "the
 * strongest energy direction in the Luxe range" — and unavailable on a
 * darkening one, where it says only "among Luxe's preferred directions".
 */
function unsupportedSuperlative(text: string, material: string): string | null {
  const lower = text.toLowerCase();
  const source = material.toLowerCase();
  for (const claim of SUPERLATIVES) {
    if (!new RegExp(`\\b${claim}\\b`).test(lower)) continue;
    if (new RegExp(`\\b${claim}\\b`).test(source)) continue;
    return claim;
  }
  return null;
}

/**
 * Checks generated customer-facing text against every deterministic rule.
 * Returns every violation found, not just the first — a caller regenerating the
 * turn benefits from knowing all of them.
 */
export function validateGeneratedText(
  text: string,
  context: GuardrailContext
): readonly GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = pattern.exec(text);
      if (!match) continue;
      if (seen.has(rule.guardrailId)) break;
      seen.add(rule.guardrailId);
      violations.push({ guardrailId: rule.guardrailId, evidence: match[0].trim().slice(0, 80) });
      break;
    }
  }

  // A ranking the material does not make.
  const superlative = unsupportedSuperlative(text, context.supportingMaterial ?? "");
  if (superlative) {
    violations.push({ guardrailId: "no-unsupported-superlative", evidence: superlative });
  }

  // Invented products, in two flavours: a real brand Luxe does not carry, and
  // a product name that is not real at all.
  const lower = text.toLowerCase();
  const allowed = context.allowedBrands.map((b) => b.toLowerCase());
  const offCatalogue = OFF_CATALOGUE_BRANDS.find(
    (brand) => !allowed.some((a) => brand.includes(a) || a.includes(brand)) && lower.includes(brand)
  );
  const invented = offCatalogue ?? inventedProductName(text, context);
  if (invented) violations.push({ guardrailId: "no-invented-products", evidence: invented });

  return violations;
}

/**
 * Strips characters that would let generated text impersonate structure in a
 * downstream surface. Not a guardrail — a hygiene pass applied to every string
 * that leaves the server.
 */
export function sanitizeForOutput(text: string, maxLength: number): string {
  return text
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
