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
];
