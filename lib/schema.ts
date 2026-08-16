/**
 * Shared schema-graph stubs used across pages.
 *
 * OWNER_STUB — minimal Person representation of the business owner referenced
 * by @id from the homepage `businessNode.founder`. The canonical Person node
 * lives on the About page and is built by SPREADING this stub
 * (`{ ...OWNER_STUB, jobTitle, image, ... }`) so the literal @type/@id/name
 * appears exactly ONCE in source (right here).
 *
 * The homepage emits this stub as a node in its @graph so single-page AI
 * consumers (GPTBot, ClaudeBot, PerplexityBot) that don't resolve
 * cross-document @id references still see the founder's identity when they
 * fetch just /.
 *
 * See .claude/skills/schema-audit/SKILL.md → "Accepted exceptions" for the
 * rationale and why this doesn't violate the define-once entity rule.
 */
import { BUSINESS, PRODUCTS } from "@/lib/constants";

export const OWNER_STUB = {
  "@type": "Person",
  "@id": `${BUSINESS.url}/#owner`,
  name: BUSINESS.ownerFullName,
} as const;

/**
 * BUSINESS_STUB — the same pattern for the business, and for the same reason.
 *
 * Articles referenced their publisher as a bare `{ "@id": ... }`. Correct, but
 * a crawler that fetches one article and does not chase cross-document
 * references learns only that a publisher exists, not who. Emitting this stub
 * gives it type, identity and name without a second entity appearing anywhere.
 *
 * The `@type` array is the load-bearing part: the canonical business node on
 * the homepage builds itself by SPREADING this, so the two can never disagree.
 * A hand-written `@type: "Organization"` on the article pages would have been a
 * different type for the same `@id`, which the rendered sweep reports as a
 * conflict — correctly, because it would be two claims about one thing.
 *
 * The schema-audit skill lists this as the anticipated companion to
 * OWNER_STUB; see "Accepted exceptions → Exception A".
 */
export const BUSINESS_STUB = {
  "@type": ["HomeAndConstructionBusiness", "LocalBusiness", "Organization"],
  "@id": `${BUSINESS.url}/#business`,
  name: BUSINESS.name,
} as const;

/**
 * The nine products that own a `/products/{slug}` route. Derived from the
 * `PRODUCTS` const rather than restated, so a slug that isn't a real product
 * fails `tsc` instead of minting a dangling `@id` nobody notices until the
 * post-build sweep.
 */
export type ProductSlug = (typeof PRODUCTS)[number]["slug"];

/**
 * The `serviceType` every Luxe service shares.
 *
 * The area pages have used this exact phrase since they were written; the
 * product pages did not classify themselves at all. Both read it from here now
 * so one taxonomy term has one owner — the same reason the glossary reads
 * Norman's founding year off the brand rather than restating it.
 *
 * It says what the nine product Services and the five area Services have in
 * common. The `name` on each is what distinguishes them: a category on the
 * product pages, a city on the area pages.
 */
export const CUSTOM_WINDOW_TREATMENTS = "Custom Window Treatments";

/**
 * A REFERENCE to the canonical product Service — `{ "@id": ... }` and nothing
 * else. The full definition lives on `app/products/[slug]/page.tsx` and stays
 * there; this only lets other pages point at it.
 *
 * Same discipline as `cityRef` in `lib/cities.ts`, and for the same reason: the
 * schema sweep classifies any object carrying `@type` beside `@id` as a
 * *definition*, so a helper that emitted `@type`, `name` or `url` alongside the
 * canonical id would turn every call site into a duplicate-definition bug.
 *
 * The `@id` is deliberately spelled out here as a template literal rather than
 * assembled from a returned string, so the source sweep still recognises this
 * line as a reference to the `<HOST>/products/${slug}#service` pattern def.
 */
export function productServiceRef(slug: ProductSlug) {
  return { "@id": `${BUSINESS.url}/products/${slug}#service` };
}
