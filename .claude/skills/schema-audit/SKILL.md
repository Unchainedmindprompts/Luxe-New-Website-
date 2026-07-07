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

Two checks, both must pass before merge:

**Duplicate-@id-definition sweep.** From project root:
```bash
node scripts/audit-schema-ids.mjs
```
Exit 0 = PASS. Exit 1 = FAIL, investigate each grouping.

**Whole-graph reference resolution.** Site-wide, not per-page. Every `{ "@id": "..." }` reference must resolve to a definition somewhere on the site. Per-page checks false-flag valid cross-document references — the whole point of Rule 2 is that `#business` is defined only on the homepage and referenced from area pages, blog articles, etc.

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

## Provenance and history

Each rule was earned from a real, documented failure on this codebase or a peer client site. See the standards doc (`entity-graph-hygiene-standards.md` in the agency ops folder) for the full case history. Every fix on this branch (commits `a503067` through `48af77d`) applies one of the three rules; the `OWNER_STUB` refactor extends the ruleset with the first documented accepted exception.
