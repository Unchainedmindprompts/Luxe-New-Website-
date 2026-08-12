/**
 * Canonical identities for the manufacturers Luxe carries.
 *
 * One definition per manufacturer, so the fields that identify it (name,
 * alternateName, url, sameAs, foundingDate) cannot drift between the places
 * that describe the same real-world company.
 *
 * WHERE THESE RENDER, as of this commit: `/about` publishes all five, in the
 * `mentions` of its WebPage node — the page already names every one of them in
 * visible copy, which is what makes `mentions` a true statement rather than a
 * schema convenience. Everywhere else references them by `@id`:
 * `moving-into-a-new-home-window-coverings-north-idaho` (Norman, Alta) and
 * `woodlore-plus-shutters-north-idaho` (Norman).
 *
 * `mentions`, NOT `Organization.brand`. Schema.org defines `brand` as the
 * brand "maintained by" an organization — Luxe maintains none of these. It
 * carries their products. Saying otherwise would claim Luxe owns Norman.
 *
 * NO OFFERING RELATIONSHIPS LIVE HERE YET. The copy states plainly which
 * manufacturer supplies which product, and none of it is modelled: no product
 * Service references a manufacturer, and no manufacturer names a product. That
 * is deliberate and deferred — identity first, relationships once there is a
 * decision about how to express them without implying Luxe is a franchise.
 *
 * @id STRATEGY. Each id is the manufacturer's own official domain plus a
 * fragment naming what the entity is. These are not Luxe's entities to name:
 * a Luxe-owned id would assert that this site is the authority on Norman's
 * identity, and it would not survive Luxe changing domains. An external
 * official domain is stable, is what another site would independently pick,
 * and keeps the fragment honest about the type.
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

/**
 * `Brand`, not dual-typed. Alta appears throughout the copy exactly as Norman
 * does — "Alta" the line, "Alta Window Fashions" the company — but nothing
 * here needs an Organization property the way Norman's `foundingDate` did.
 * Norman is dual-typed because a fact forced it, not as a house style, so
 * matching it for symmetry would be inventing a claim about Alta to make a
 * file look tidy.
 */
export const ALTA_BRAND = {
  "@type": "Brand",
  "@id": "https://www.altawindowfashions.com/#brand",
  name: "Alta",
  alternateName: "Alta Window Fashions",
  url: "https://www.altawindowfashions.com",
  sameAs: ["https://www.altawindowfashions.com"],
} as const;

/**
 * `Brand`, on the same reasoning as Alta. The repository treats Lafayette as a
 * product line beside the other two — "Premium brands: Norman, Alta, and
 * Lafayette", "The Lafayette and Norman brands carried by Luxe Window Works" —
 * and states no corporate fact about it.
 */
export const LAFAYETTE_BRAND = {
  "@type": "Brand",
  "@id": "https://www.lafayetteinteriorfashions.com/#brand",
  name: "Lafayette",
  alternateName: "Lafayette Interior Fashions",
  url: "https://www.lafayetteinteriorfashions.com",
  sameAs: ["https://www.lafayetteinteriorfashions.com"],
} as const;

/**
 * `Organization`, not `Brand`. The repository describes Corradi USA in
 * corporate terms rather than as a product mark — the glossary calls it "an
 * Italian-founded outdoor living manufacturer with a U.S. operation", and the
 * name itself denotes that U.S. operation. A company, not a line.
 *
 * No `alternateName: "Corradi"`. The parent Italian company and its U.S. arm
 * are not obviously the same legal entity, and nothing in the repository says
 * they are; asserting the short form as an alias would merge two things this
 * site has no evidence about.
 */
export const CORRADI_USA = {
  "@type": "Organization",
  "@id": "https://www.corradiusa.com/#organization",
  name: "Corradi USA",
  url: "https://www.corradiusa.com",
  sameAs: ["https://www.corradiusa.com"],
} as const;

/**
 * `Organization`, on the same reasoning as Corradi USA — the articles group it
 * with "manufacturers like Norman, Lafayette, and The Window Outfitters". Its
 * product lines (Highprofile Avenir, Weatherwell Elite, ColourVue) are the
 * brand-shaped things; the company is not one of them.
 *
 * ONE ENTITY, NOT THREE. "The Window Outfitters", "TWO USA" and the two-usa.com
 * domain all name the same manufacturer, so the abbreviation is an
 * `alternateName` on this node rather than an id of its own.
 */
export const THE_WINDOW_OUTFITTERS = {
  "@type": "Organization",
  "@id": "https://two-usa.com/#organization",
  name: "The Window Outfitters",
  alternateName: "TWO USA",
  url: "https://two-usa.com",
  sameAs: ["https://two-usa.com"],
} as const;

/**
 * The five manufacturers `BUSINESS.brands` names, in the order the About page
 * lists them. Exists so the page that publishes these entities does not have
 * to restate which ones they are — not as a registry abstraction, and
 * deliberately not wired into `BUSINESS.brands` or the About page's visible
 * chips, which are display strings doing a different job.
 */
export const CARRIED_BRANDS = [
  ALTA_BRAND,
  NORMAN_BRAND,
  LAFAYETTE_BRAND,
  CORRADI_USA,
  THE_WINDOW_OUTFITTERS,
] as const;
