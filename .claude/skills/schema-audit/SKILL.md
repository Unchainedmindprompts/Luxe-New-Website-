---
name: schema-audit
description: Audit JSON-LD entity graph for hardcode drift and duplicate-@id-definition bugs. Run before merging any commit that touches schema, before replatform cutover, and at least quarterly.
---

# schema-audit

Enforces the three entity-graph hygiene rules on this codebase.

## The three rules

1. **Scalars — reference the constant.** Never hardcode a value that a constant already owns. Business identity fields (name, phone, email, base URL, geo) live in `lib/constants.ts` under `BUSINESS`. All JSON-LD scalars that surface those fields must reference the constant.

2. **Entities — define once, reference by @id.** Every canonical `@id` is *defined* exactly once, on its most semantically appropriate page or module. Elsewhere it appears only as `{ "@id": "..." }` references. No inline mini-definitions with duplicated fields (e.g. `isPartOf: { "@type": "Blog", "@id": ".../blog", name: "Window Treatment Insights", ... }` — collapse to `isPartOf: { "@id": ".../blog" }`).

3. **`sameAs` scoping.** `sameAs` attaches to the entity it actually represents. Business profiles (Yelp, BBB, GBP) on `#business`. Personal profiles (LinkedIn, personal socials) on `#owner`. Don't cross-post business identifiers to Person nodes just because the person owns the business.

## How to run the audit

**Automatic gates (already wired):**
- `npm run build` runs the sweep first (via the `prebuild` npm script). Duplicate `@id` defs or dangling `@id` refs cause the build to abort before `next build` runs.
- `git commit` runs the sweep first (via the husky `pre-commit` hook installed on `npm install` via the `prepare` script). Same failure classes block the commit.
- Fresh clones activate both gates as soon as `npm install` completes (husky's `prepare` script runs on install).

**Manual invocation:**
```bash
npm run audit:schema
# or:
node scripts/audit-schema-ids.mjs
```
Exit 0 = PASS. Exit 1 = FAIL, investigate.

**Two failure classes the sweep catches at source level:**
1. **Duplicate `@id` definitions** — the same `@id` value defined (with `@type` + content fields) in more than one source location. Full-fidelity detection.
2. **Dangling `@id` references** — a `{ "@id": "..." }` reference to an `@id` shape that has no matching definition or pattern-def anywhere in source. Coverage is high but not total: references whose URL shape happens to match an existing pattern-def (e.g. `<HOST>/#anything` matches the VideoObject pattern `<HOST>/#${videoSlug}`) can slip past the source-level check. Those are caught by post-build verification against the built-HTML manifest — see "Post-build manifest audit" below.

**Post-build manifest audit** (whole-graph resolution against server-rendered HTML). Run when the fingerprint check matters — before merging schema changes, before replatform cutover, when investigating a specific rich-result miss. Not currently automated in `npm run build`; run manually:
```bash
# Extractor and manifest analyzer live in the session scratchpad — copy to
# scripts/ if you want this permanently automated.
python3 scripts/extract-jsonld.py  # emits audit-manifest.json
python3 -c "..."                    # cross-checks refs vs defs
```
This complements the sweep by verifying every `@id` reference in *rendered* HTML resolves against a definition somewhere on the site — the runtime-truth version of Rule 2. Catches cases the source-level sweep misses.

## Accepted exceptions

Cases where the rules apply differently than the naive reading would suggest. Each exception documented here has a specific rationale and a specific safety property that makes it not a drift risk.

### Exception A — Minimal `{@type, @id, name}` stub for a canonical entity defined elsewhere

**Pattern:** a shared const in `lib/schema.ts` defines a minimal stub — `@type`, `@id`, and `name` only, where `name` is sourced from a `BUSINESS`-level constant. The canonical full entity node lives on its semantically-appropriate page and is built by **spreading** the same stub (`{ ...OWNER_STUB, jobTitle, image, ... }`) rather than re-declaring `@type`/`@id`/`name`. Other pages that need the entity's minimal identity emit the stub directly in their `@graph`.

**Why this doesn't violate Rule 2:** the literal `"@type"` and `"@id"` field pair appears exactly once in source (inside the stub definition in `lib/schema.ts`). The canonical page pulls those fields in via spread; the stub-emitting page pulls them in by direct reference. There is no second literal definition to drift from the first. The `name` field is constant-sourced (`BUSINESS.ownerFullName`, not a string literal) so it can't drift either — changing the constant changes both surface simultaneously.

**Why this is worth doing:** single-page AI consumers (GPTBot, ClaudeBot, PerplexityBot, and many SERP-preview / structured-data-testing tools) fetch one URL at a time and do not chase cross-document `@id` references. A reference like `founder: { "@id": ".../#owner" }` on the homepage tells them "the founder is an entity" but doesn't tell them the founder's name. The stub gives them just enough — entity type, identity, and name — to attribute the reference without recreating the full property surface.

**How to verify at review time:**
- Grep the codebase for the literal `"@id": "<the-canonical-id>"` and confirm exactly one hit.
- Grep for the literal `"@type": "<canonical-type>"` alongside that `@id` and confirm exactly one hit at the same location.
- Confirm the canonical page uses the spread operator (`...STUB`), not a hand-written re-declaration of the same fields.
- Confirm the stub-emitting page imports and emits the const directly, not via spread + additions.
- Run the sweep. It should PASS. If it FAILS, the pattern was implemented via a raw literal instead of via spread — fix the implementation, do not tune the sweep.

**Current instances in this repo:**
- `OWNER_STUB` — `lib/schema.ts`. Canonical Person node built via spread on `app/about/page.tsx`. Stub emitted directly in homepage `@graph` in `app/page.tsx`.

**Related pattern to consider for `#business`:** the same NAP-stub + enrichment via spread approach could be applied to the `LocalBusiness` node (define a `BUSINESS_STUB` with `@type`, `@id`, `name`, and the minimal NAP fields; canonical `LocalBusiness` in `app/page.tsx` spreads it and enriches with `hasOfferCatalog`, `aggregateRating`, `openingHoursSpecification`, etc.). Not currently implemented but structurally equivalent to `OWNER_STUB`. Add if a similar single-page-consumer signal is needed for the business entity in contexts where the homepage isn't fetched.

## Extended checklist — red-team-derived rules (F-1 through F-13)

Each rule below closes a class of bug that a critical outside reviewer could have surfaced against the current graph. Every one was earned from a real finding on this codebase or on Luxe/Shirin's live schema. Add each to the standard per-commit checklist so those classes cannot recur.

**F-1. `mainEntityOfPage` shape.** Must be either a plain URL string or a real WebPage node with content fields (`isPartOf`, `about`, `mainEntity`, `breadcrumb`, name, description). A bare `{ "@type": "WebPage", "@id": "URL" }` stub is neither — it's a dangling typed reference. Ban it.

**F-2. Every `Service` node has `provider: { "@id": "#business" }`.** Both top-level Services on area/product pages and standalone Service nodes. Homepage inline mini-Services nested inside `Offer.itemOffered` inside `hasOfferCatalog` are exempt — the enclosing `businessNode` context implicitly provides them.

**F-3. Every `WebPage`-family node has `mainEntity`.** Points at the entity the page is primarily about. Homepage `#webpage` → `#business`. About → `#owner`. Area → `#service`. Product → `#service`. Shop product → `#product`. Blog listing → `#blog`.

**F-4. `Article.about` references the article's real subject, not reflexively `#business`.** For articles about specific products, use the product Service `@id`. For articles about locations, use the area Service `@id`. For meta/topical articles, emit a `Thing` with the topic name (`sameAs` to Wikipedia/schema.org when a canonical URL exists).

**F-5. Hub / collection pages emit `CollectionPage` + `BreadcrumbList`.** `/blog`, `/areas`, `/products`, `/shop`, `/glossary`. Add an `ItemList` of children when the hub is dense (>5 items).

**F-6. Person nodes may not use Organization-only properties.** `foundingDate` belongs on Organization; a person's career-start goes on `hasOccupation.startDate`. `areaServed` in the business sense goes on Service or Business, not Person. `numberOfEmployees`, `legalName`, `taxID` etc. — never on Person.

**F-7. `generateStaticParams` must handle Unicode / URL-encoded slugs.** Next.js file-system routing URL-decodes `params.slug` before the page runs; content lookup functions must accept the decoded form OR the content file must use the raw (non-encoded) slug in its filename. A slug that renders zero schema in built HTML fails this rule.

**F-8. Business entity types include `Organization` explicitly in the `@type` array.** `["HomeAndConstructionBusiness", "LocalBusiness", "Organization"]`. Some LLM-based validators don't walk the schema.org inheritance chain — explicit membership is the safe move.

**F-10. Every route in `sitemap.ts` emits at least a WebPage-family node + BreadcrumbList.** No route in the sitemap may render zero schema or a bare page with only OG tags. Homepage is exempt from BreadcrumbList by convention (root of hierarchy).

**F-12. Every geographic entity in schema carries Wikipedia `sameAs` when the entity has a Wikipedia article.** Applies to `Article.mentions` cities, `Service.areaServed` cities, `containedInPlace` state/county chains, `#business.areaServed` nested Cities. Use the shared `lib/cities.ts` (or equivalent) registry.

**F-13. `WebSite.potentialAction: SearchAction` only if a real search UX exists.** Grep for search input/role first. Adding SearchAction without on-page search is a phantom that Google Rich Results Test will flag.

## Known coverage boundaries

**Source-level dangling-ref detection is high-precision but not total.** A dangling `@id` reference whose URL shape happens to match an existing pattern-def evades detection. Specific known gap: any ref matching `<HOST>/#<any-string>` will be accepted because the VideoObject pattern def `${BUSINESS.url}/#${video.idSlug}` matches everything fragment-only. Post-build manifest audit closes this gap by comparing against actual runtime @ids.

**Runtime template variables in pattern-defs create permissive regexes.** `<HOST>/blog/${post.slug}#article` becomes `<HOST>/blog/[^/#]+#article`, accepting refs to any URL-shaped blog article slug even if the specific post doesn't exist. Post-build audit catches these too.

## Provenance and history

Each rule was earned from a real, documented failure on this codebase or a peer client site. See the standards doc (`entity-graph-hygiene-standards.md` in the agency ops folder) for the full case history.

Session commit sequence (`a503067` → current head):
- `a503067` — area-page schema graph refactor, `/areas` hub, strict `@id`-only pattern
- `6e379b2` — `#owner` consolidation, About becomes canonical
- `2d35b8b` — three-fix entity-graph hygiene (`sameAs` scoping + two scalar fixes)
- `64a1095` — `#blog` collapse + Norman `#brand` extraction
- `48af77d` — `[slug]` template hardcode scrub
- `04b8f39` — `OWNER_STUB` name-stub for single-page AI consumers (Exception A)
- `365eed7` — P0 correctness: 5 Rule 1 hardcodes, Rule 4 Person, 48-site `mainEntityOfPage` collapse
- `e21204d` — P1 completeness: WebPage + BreadcrumbList on 10 pages that owned routes
- `ae855eb` — P2 connections/hygiene: `Organization` type, city Wikipedia sameAs, `Article.about` de-reflexed
- Gate wiring commit (this one) — prebuild + husky pre-commit + prepare, F-1..F-13 checklist rules, synthetic-regression proof
