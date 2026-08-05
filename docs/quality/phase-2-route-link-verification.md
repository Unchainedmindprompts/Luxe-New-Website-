# Phase 2 — Route, Sitemap & Rendered Link Verification

Proves that the URLs this site claims to have are the URLs it actually has, and
that every link and schema URL it publishes resolves to one of them.

## Luxe's route architecture

Fourteen files in `app/**/page.tsx` produce **76 public pages**. The gap is the
whole reason this phase needs built output:

| Template | Produces |
|---|---|
| 11 static templates | 11 pages |
| `/blog/[slug]` | 51 pages from `content/blog/*.md` |
| `/products/[slug]` | 9 pages from `lib/product-data.ts` |
| `/areas/[slug]` | 5 pages from `lib/area-data.ts` |

**65 of 76 pages are generated.** `app/**/page.tsx` cannot tell you which slugs
exist — only `generateStaticParams` running against markdown and data modules
knows that, and the only place its answer is written down is the build output.

So: **built HTML is authoritative for which pages exist**, and the filesystem is
a structural cross-check for which templates should have produced them. Both
directions are validated — a template producing nothing fails, and a built page
with no template fails.

## Why built output rather than source

A source scan tells you what an author typed. Only rendered output tells you
what a visitor and a crawler receive.

This phase found a defect that proves the point: four articles contain
`<a href="tel:+12086608643">` in their markdown, and every one renders as
`<a href="">`. ReactMarkdown's default URL sanitiser does not allow the `tel:`
scheme, so it strips it. The source is correct. The page is broken. No
source-level check could ever see it.

Source *is* searched — but only **after** a rendered defect is found, to locate
the likely authoring line. Source-first would report template strings that never
render and miss URLs composed at build time.

## Route inventory rules

`scripts/lib/route-inventory.mjs` is the single shared answer to "what URLs
exist", used by both validators so they cannot disagree.

Normalisation: hostname stripped for the four internal forms (`https`/`http` ×
`www`/apex), query and fragment removed for resolution, percent-encoding decoded
only when it round-trips, trailing slashes stripped because `next.config.mjs`
sets no `trailingSlash` and Next normalises them.

A path whose percent-encoding cannot be decoded is **reported, not skipped** — a
malformed internal URL is a defect in its own right.

Excluded as non-pages: `_not-found`, `_global-error`, `/icon.png`,
`/apple-icon.png`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`,
`/manifest.webmanifest`, and `/api/*` route handlers.

The module **fails loudly** on parallel, intercepting, catch-all, and optional
catch-all segments. It has not been taught to model them, and confidently
mis-modelling a route is worse than refusing to run. None exist today.

## Sitemap parity

The validator reads the **emitted** `sitemap.xml.body` from build output, never
`app/sitemap.ts`. That module is the artifact under test: roughly half of it is a
hand-maintained list of static, product, and area URLs, so the interesting
failure is exactly the one importing it cannot see — the file claims a URL and no
page was built for it.

Fails on: a sitemap URL with no page, an indexable page absent from the sitemap
and not allowlisted, a noindex page present in the sitemap, duplicates, wrong
host, fragments or queries, trailing-slash inconsistency, and any sitemap URL
that only resolves *through a redirect* rather than directly.

Current state: **75 sitemap URLs = 75 indexable pages**, exactly.

## Robots and indexability

Indexability is read from each page's rendered `<meta name="robots">`, not
inferred from config. 75 indexable, 1 noindex.

## Allowlist rules

`config/verify-allowlist.mjs`. Every entry needs a path, a category, and a
reason. Categories: `sitemapExclusions`, `linkTargetExclusions`,
`routeInventoryExclusions`, `redirectChainExclusions`.

Fails on: missing reasons, duplicates, unsupported categories, **wildcards**, and
**stale entries** naming routes that no longer exist. A stale exemption is an
exemption nobody is watching.

One entry exists: `/show-me-my-options`. It was verified by inspection — not
assumed — to render `<meta name="robots" content="noindex, follow">`, so its
sitemap exclusion agrees with its own declared policy rather than overriding it.
The validator enforces the link between the two: **a sitemap exclusion whose page
is actually indexable fails**, because that is a business decision that must be
stated, not a technical exemption.

## Rendered link validation

Anchors are read from built HTML with `<script>` blocks stripped wholesale —
that removes RSC flight payloads, `$undefined` sentinels, inline JS, and
serialised JSON in one move, none of which are rendered links.

Each internal link is normalised, then resolved through redirects to a page,
asset, or generated route. Fails on dead targets, loops, malformed URLs,
framework-only paths, and asset paths not present in `public/`.

Skipped without route validation: external URLs, `mailto:`/`tel:`/`sms:`, other
schemes, protocol-relative hosts, hash-only links, `/_next/*`, `/api/*`,
generated routes, real `public/` assets, and allowlisted targets.

**Shared failures are grouped.** One broken footer link produces one finding
naming all 76 affected pages, the shared source file and line, and explicit
"fix once" guidance — not 76 separate findings.

## Schema URL validation

Parsed separately from `<script type="application/ld+json">` and reported as its
own category, because schema failures are fixed in different places than visible
links.

Fields checked: `url`, `item`, `mainEntityOfPage`, `contentUrl`, `embedUrl`, and
`@id` values that are full internal URLs.

Only URLs on the Luxe production host are validated. External `sameAs`,
citations, brand references, and third-party media hosts are ignored.

Two rules that prevent large false-positive classes:

- **Site-scoped fragments** such as `https://www.luxewindowworks.com/#business`
  anchor to the root route and need no standalone page. 287 suppressed.
- **Assets are resolved against `public/`, not the route table.** An
  `ImageObject.contentUrl` pointing at `/images/foo.webp` is correct. A naive
  page-only check reports 38 false failures here; all 38 are real files.

### Locating a schema defect in source

Schema URLs are almost always composed at build time — `` `${BUSINESS.url}/x` ``
— so the full rendered URL never appears literally anywhere in source. A plain
search for it finds nothing, which made the source lookup close to useless for
this entire category.

The lookup therefore runs in two steps:

1. search for the **full rendered URL**, which works for hardcoded values;
2. if that finds nothing, fall back to the **path portion only**
   (`/kodecite-test-g-schema-url`), which is what actually appears in the
   template literal.

When the path is found, the finding reports the likely **source file and line**
alongside the URL, the schema field, and every affected page. Test G confirmed
this: before the fallback existed it reported the URL and 9 pages but no source;
with it, the same defect resolves to `app/products/[slug]/page.tsx:108`.

## Redirect-aware resolution

Both validators follow redirects from `scripts/redirects.json` and
`next.config.mjs` (tuple and object forms), first-rule-wins as Next does, with
loop detection and a 10-hop ceiling. 136 links currently resolve via a redirect
rather than directly — all legitimate.

Pattern redirects (`/:year/:month/:day/:slug`, `/:year/:month/:slug`,
`/post/:slug`) are **not** statically resolved and are reported separately. See
limitations.

## Stale-build protection

Both validators refuse to run when `.next/server/app` is missing, the emitted
sitemap is missing, or the newest file under `app/`, `components/`, `lib/`,
`content/`, `config/`, `next.config.mjs`, `scripts/redirects.json`, or
`package.json` is newer than `.next/BUILD_ID`.

`docs/` is deliberately excluded — prose cannot change generated output.

The error names the newest source file, its timestamp, the build artifact and
its timestamp. A validator that passes against stale output is worse than one
that does not run: it reports success for code nobody has checked.

## Client-state-gated navigation — a real limitation

`components/Header.tsx` renders its dropdown children only when
`openDropdown === link.label`, and the mobile menu only when `mobileOpen`. Those
links are **absent from server-rendered HTML**, verified directly: no
`/products/roman-shades` or `/areas/sandpoint` link appears inside `<header>` in
any built page.

**Rendered validation does not cover the header dropdown links themselves.**

It does, however, cover every destination they point to — all nine product pages
and all five area pages appear in the footer on every page, unconditionally. So
no destination goes unvalidated; only that particular path to it does. Validating
the links themselves would require a browser, which is deferred.

## Clean-state counts

Measured on the final tree with every injected defect reverted:

| Measure | Value |
|---|---:|
| Public pages scanned | 76 |
| Visible internal links checked | **2,880** |
| Internal schema URLs checked | **1,186** |
| Resolved via redirect | 139 |
| **Broken visible links** | **0** |
| **Broken schema URLs** | **0** |

## Commands

| Command | Runs |
|---|---|
| `npm run validate:routes` | route inventory + sitemap parity |
| `npm run validate:links` | rendered anchors + schema URLs |
| `npm run verify:build` | both, against existing build output |
| `npm run verify` | `check` → `build` → `validate:legacy` → `verify:build` |

Neither is in `npm run check`, which stays a fast source-level gate, and neither
is wired into `postbuild`.

## Controlled failure-test results

| Test | Injected | Result | Exit |
|---|---|---|---:|
| A | sitemap URL `/kodecite-phase-2-missing-route` | reported the URL and that no built page exists | **1** |
| B | indexable page absent from sitemap | reported the route with the three ways to resolve it | **1** |
| C | same page made noindex | **passed**, counted as intentional noindex | **0** |
| D | anchor to `/kodecite-test-d-broken-link` in one article | reported the target, the one affected page, and `content/blog/moisture-proof-window-treatments-kitchens-bathrooms-lake-homes.md:14` | **1** |
| E | footer link changed to `/kodecite-test-e-shared-link` | **one grouped finding** naming all 76 pages, `components/Footer.tsx:157`, and fix-once guidance | **1** |
| F | client-state investigation | documented above — not a failure test | — |
| G | `BreadcrumbList.item` set to `…/kodecite-test-g-schema-url` | classified under **`[schema URLs]`**, exact URL reported, field `item`, 9 affected pages, source located at `app/products/[slug]/page.tsx:108` | **1** |
| H | false-positive guards | 305 external, 332 mailto/tel/sms, 98 hash-only, 42 schema-external, 287 schema-fragment suppressed; 21 `$undefined` and 8 `/_next/` hrefs on `/` alone, zero surviving the `<script>` strip | **0** |
| I | touched `lib/constants.ts` | both validators reported stale build with both timestamps | **1** |
| J | removed the emitted sitemap | reported the missing artifact | **1** |

Tests A, B and C used `/kodecite-phase-2-missing-route` and a temporary
`app/kodecite-test-indexable/` page; D, E and G used the `kodecite-test-*` tokens
above. Every injected defect was reverted and confirmed by MD5 against a
baseline captured beforehand, and each of D, E and G was run as its own isolated
step — an earlier attempt to batch them was interrupted midway and left an
injected anchor behind, which a residue check caught before it could be
committed.

Test J initially crashed with `EISDIR` rather than reporting cleanly: Next emits
`sitemap.xml` as a **directory** alongside `sitemap.xml.body`, so `existsSync`
passed and `readFileSync` threw. Fixed by requiring a regular file.

## Known limitations

- **Pattern redirects are not resolved.** A link matching `/:year/:month/:day/:slug`
  is reported as dead even though Next would rewrite it at runtime. One such link
  exists today, and it dies either way — its rewritten target does not exist.
- **No HTTP requests.** Resolution is computed from config and build output.
  Middleware, hosting rules, and edge behaviour are invisible.
- **Header dropdown links are unvalidated** (above).
- **External links are never fetched.** A link to a dead third-party page passes.
- **Anchor fragments are not verified** against element IDs on the target page.
- **Schema field coverage is a fixed list.** A URL in a field outside that list is
  not checked.

## Deliberately deferred

WordPress image localization · canonical validation · title and description
validation · Open Graph image validation · schema completeness changes ·
accessibility · browser-driven crawling · Playwright · Lighthouse · GitHub
Actions · branch protection
