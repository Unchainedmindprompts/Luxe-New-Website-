/**
 * Luxe Window Advisor — canonical brand-response matching. (Phase B)
 *
 * Decides, deterministically, whether the homeowner actually asked about a
 * brand — and returns the approved answer verbatim if so.
 *
 * THE HARD PART IS NOT MATCHING THE BRAND, IT IS MATCHING THE ASK. Naming
 * Hunter Douglas is not the same as asking about it. "We replaced our Hunter
 * Douglas blinds last year" is a fact about their house; answering it with a
 * statement about why Luxe dropped the brand would be volunteering competitor
 * commentary at someone who did not ask. So a brand term alone never fires.
 * There must also be an asking intent: a carrying verb, a second-person
 * question, or an explicit "why not".
 *
 * NO MODEL IS INVOLVED. This is a pure function over the message text, for the
 * same reason the copy is verbatim — the decision of when Luxe comments on a
 * competitor should not depend on a model's reading of tone.
 */
import type { BrandResponse } from "../types";

/**
 * Verbs that mean "does Luxe supply this". Deliberately about supply, not use:
 * "we have Hunter Douglas" is the homeowner describing their house, while "do
 * you have Hunter Douglas" is a question for Luxe, and only the second should
 * fire.
 */
const CARRYING_INTENT = [
  /\b(carry|carries|carrying|sell|sells|selling|stock|stocks|offer|offers|supply|supplies|source|install|installs)\b/i,
  /\b(do|does|did|can|could|will|would|are)\s+(you|luxe|they|y'?all)\b/i,
  /\bwhy\s+(don'?t|do\s+not|doesn'?t|does\s+not|no\s+longer|did\s+you\s+stop|aren'?t)\b/i,
  /\b(what|how)\s+about\b/i,
  /\bdeal\s+(with|in)\b/i,
  /\bwork\s+with\b/i,
];

/** Ways of asking what Luxe does carry, which is the natural follow-up. */
const WHAT_IS_CARRIED = [
  /\bwhat\s+(brands?|lines?|makes?|manufacturers?)\b/i,
  // A noun may sit between the interrogative and the verb — "which
  // manufacturers do you work with" is the same question as "which do you
  // work with", and both should be answered.
  /\b(what|which|who)\s+(\w+\s+){0,2}(do|does)\s+(you|luxe)\s+(carry|sell|offer|stock|use|source|work\s+with|buy\s+from)\b/i,
  /\bcarry\s+instead\b/i,
  /\binstead\b.*\bcarry\b/i,
];

export interface BrandResponseMatch {
  readonly id: string;
  readonly brand: string;
  /** The approved copy, with any placeholder already filled. */
  readonly response: string;
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Returns the approved response when the homeowner has genuinely asked about a
 * brand, and `null` otherwise.
 *
 * `approvedBrands` is passed in rather than imported so the answer to "what do
 * you carry instead?" comes from the single source of truth in
 * `lib/constants.ts` and can never drift from the site.
 */
export function matchBrandResponse(
  message: string,
  responses: readonly BrandResponse[],
  approvedBrands: readonly string[]
): BrandResponseMatch | null {
  const text = normalise(message);
  if (!text) return null;

  // A named brand takes precedence over the generic "what do you carry"
  // answer: someone asking specifically about Hunter Douglas deserves the
  // specific answer, not a list.
  for (const entry of responses) {
    if (!entry.brandTerms.length) continue;
    const named = entry.brandTerms.some((term) => text.includes(normalise(term)));
    if (!named) continue;
    const asking = CARRYING_INTENT.some((pattern) => pattern.test(text));
    if (!asking) continue;
    return { id: entry.id, brand: entry.brand, response: entry.response };
  }

  for (const entry of responses) {
    if (!entry.asksWhatIsCarried) continue;
    if (!WHAT_IS_CARRIED.some((pattern) => pattern.test(text))) continue;
    return {
      id: entry.id,
      brand: entry.brand,
      response: entry.response.replace("{brands}", formatBrandList(approvedBrands)),
    };
  }

  return null;
}

/** "Alta, Norman, Lafayette, Corradi USA and The Window Outfitters". */
function formatBrandList(brands: readonly string[]): string {
  if (!brands.length) return "a small number of carefully chosen suppliers";
  if (brands.length === 1) return brands[0];
  return `${brands.slice(0, -1).join(", ")} and ${brands[brands.length - 1]}`;
}
