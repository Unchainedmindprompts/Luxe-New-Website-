/**
 * Canonical Brand schema nodes for JSON-LD.
 *
 * One definition per manufacturer, so the fields that identify it (name,
 * alternateName, url, sameAs, foundingDate) cannot drift between the places
 * that describe the same real-world company.
 *
 * WHERE THESE ACTUALLY RENDER, as of this commit: `app/blog/[slug]/page.tsx`
 * is the only importer. Both nodes are spread into the `mentions` of
 * `moving-into-a-new-home-window-coverings-north-idaho`, which is the one page
 * that publishes them; `woodlore-plus-shutters-north-idaho` reaches Norman by
 * `@id` reference. No product page emits a brand node, and none references one
 * — the brand/offering relationships the copy states are not modelled in the
 * graph yet. This comment describes what the code does, not what it may do
 * later; an earlier version claimed every product page referenced these, which
 * was never true.
 */

/**
 * Norman is typed as both `Brand` and `Organization` because the site needs it
 * to be both and it is one real-world entity either way.
 *
 * An article's `mentions` used to carry a second, anonymous
 * `Organization { name: "Norman Window Fashions", foundingDate }` beside this
 * Brand — the same manufacturer described twice, and the two copies had
 * already drifted on the founding year. Collapsing that duplicate into this
 * node meant bringing `foundingDate` with it, and `foundingDate` is an
 * Organization property: a bare `Brand` may not carry it. The dual type is
 * what makes the collapse legal rather than merely convenient, and it matches
 * the multi-typing `businessNode` already uses on the homepage.
 *
 * 1974 is Norman's own stated founding year, corroborated in the body of
 * `content/blog/woodlore-plus-shutters-north-idaho.md`. The glossary's
 * conflicting 1976 now reads this field rather than restating it.
 */
export const NORMAN_BRAND = {
  "@type": ["Brand", "Organization"],
  "@id": "https://www.normanwindowfashions.com/#brand",
  name: "Norman",
  alternateName: "Norman Window Fashions",
  url: "https://www.normanwindowfashions.com",
  foundingDate: "1974",
  sameAs: [
    "https://www.normanwindowfashions.com",
    "https://normanusa.com",
    "https://en.wikipedia.org/wiki/Norman_(window_treatment_brand)",
  ],
} as const;

export const ALTA_BRAND = {
  "@type": "Brand",
  "@id": "https://www.altawindowfashions.com/#brand",
  name: "Alta",
  alternateName: "Alta Window Fashions",
  url: "https://www.altawindowfashions.com",
  sameAs: ["https://www.altawindowfashions.com"],
} as const;
