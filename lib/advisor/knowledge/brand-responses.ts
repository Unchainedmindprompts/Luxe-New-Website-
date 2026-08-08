/**
 * Luxe Window Advisor — canonical brand responses.
 *
 * Approved, verbatim answers to questions about specific brands.
 *
 * WHY THESE ARE NOT GENERATED. Everything else the advisor says is assembled
 * from the assessment and phrased by the model under guardrails. That is right
 * for product guidance and wrong here: what Luxe says about another company is
 * a business and reputational statement, and the exact wording is the decision.
 * A model paraphrasing it could soften it, sharpen it, or drift into a claim
 * nobody approved. So the text below is returned word for word, and the model
 * is never asked to rewrite it.
 *
 * WHY THEY ARE NARROWLY TRIGGERED. The advisor must never volunteer commentary
 * about a competitor. These fire only when the homeowner actually asks whether
 * Luxe carries the brand, or why it does not — see `matchBrandResponse` in
 * `lib/advisor/server/brand-response.ts` for the mechanism, which requires an
 * explicit asking intent rather than a passing mention.
 *
 * WHAT THE APPROVED TEXT IS CAREFUL ABOUT. It states Luxe's own judgement
 * ("we felt the direction of the brand was no longer the best fit") and stops
 * there. It does not claim the ownership change caused any specific quality or
 * service failure, and there is no elaboration path: a homeowner who presses
 * for allegations gets the same measured answer, because there is nothing
 * further here to give them.
 */
import type { BrandResponse } from "../types";

export const BRAND_RESPONSES: readonly BrandResponse[] = [
  {
    id: "hunter-douglas-not-carried",
    brand: "Hunter Douglas",
    brandTerms: ["hunter douglas", "hunterdouglas"],
    response:
      "We no longer carry Hunter Douglas. After the company came under 3G Capital’s controlling ownership, we felt the direction of the brand was no longer the best fit for Luxe Window Works or the level of product quality, dealer support, and customer service we want for our clients. We’ve chosen instead to work with suppliers whose products and support better align with our client-first approach.",
  },
  {
    /**
     * The natural follow-up. Answered from the approved brand list rather than
     * from anything written here, so the two can never disagree — `{brands}` is
     * filled at runtime from `BUSINESS.brands`.
     */
    id: "brands-carried",
    brand: "Luxe brand list",
    brandTerms: [],
    asksWhatIsCarried: true,
    response:
      "We work with {brands}. Which of those fits your project depends on the opening and what you need the treatment to do, and our team will go through the options with you at the consultation.",
  },
];
