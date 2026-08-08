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
  /** Product labels the assessment actually surfaced, in any standing. */
  readonly allowedProductLabels: readonly string[];
  /** Brand names Luxe genuinely carries, supplied by the caller. */
  readonly allowedBrands: readonly string[];
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

  // Invented products: a brand Luxe does not carry, named as if it did.
  const lower = text.toLowerCase();
  const allowed = context.allowedBrands.map((b) => b.toLowerCase());
  for (const brand of OFF_CATALOGUE_BRANDS) {
    if (allowed.some((a) => brand.includes(a) || a.includes(brand))) continue;
    if (lower.includes(brand)) {
      violations.push({ guardrailId: "no-invented-products", evidence: brand });
      break;
    }
  }

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
