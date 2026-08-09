/**
 * Explicit exemptions for the Phase 2 validators.
 *
 * Every entry needs a path, a category, and a reason a human can evaluate.
 * There are no wildcards: an exemption that matches a pattern would quietly
 * grow to cover defects nobody has looked at, which is the opposite of what a
 * verification harness is for.
 *
 * The validators fail on entries that are unreasoned, duplicated, in an
 * unsupported category, or stale — naming a route that no longer exists. That
 * last rule matters most: a stale exemption is an exemption nobody is watching.
 */

export const CATEGORIES = [
  "sitemapExclusions",
  "linkTargetExclusions",
  "routeInventoryExclusions",
  "redirectChainExclusions",
];

export const allowlist = [
  {
    path: "/ask-luxe",
    category: "sitemapExclusions",
    reason:
      "Conversational help desk that answers whatever a visitor came to ask — the consultation, " +
      "policies, products, or their own windows. It is a funnel step reached from CTAs on the homepage and the " +
      "products hub, not a destination anyone should arrive at from a search result — its value depends " +
      "entirely on the visitor having context the page itself does not provide. " +
      "It renders <meta name=\"robots\" content=\"noindex, follow\">, verified in the built HTML, so " +
      "excluding it from the sitemap is consistent with its own declared policy rather than in tension " +
      "with it: a sitemap is a list of URLs asking to be indexed, and this page asks not to be. " +
      "'follow' is deliberate — link equity still flows through to the product and area pages it points at. " +
      "Permanent for as long as the page stays noindex. If it is ever made indexable, this entry must be " +
      "removed and the page added to the sitemap; the validator enforces that by failing on a sitemap " +
      "exclusion whose page is not actually noindex.",
  },
];
