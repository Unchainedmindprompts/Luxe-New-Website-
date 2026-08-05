# WordPress Legacy URL & Redirect Contract

Every URL the old WordPress site published is a URL somebody may still follow —
from a Bing post, a Facebook share, a directory listing, or Google's index. This
gate makes that inheritance enforceable.

## Why this needs its own contract

A redirect that points at a slug which was later renamed **still looks like a
redirect**. It returns 308. The config reads correctly. The build is green. The
only way to discover it is broken is to follow it to the end and check whether a
page exists there.

Four of this repository's legacy redirects were in exactly that state, including
one pointing at an article whose filename had been changed weeks earlier. Nothing
in the build, the schema audits, or Phase 1 could see it, because none of them
resolve a redirect.

Generic tooling does not solve this either. A link checker crawls links that
exist on the current site; it has no idea the old site ever published
`/norman-shutters-north-idaho`. Only the export knows that.

## Source of truth

`luxewindowworks.WordPress.2026-02-17.xml` — the WordPress export committed at
the repository root.

| | |
|---|---|
| Published post URLs | **62** |
| Attachment URLs | **84** |
| Unique legacy URLs | **146** |

A prior audit reported 147. That figure counted the channel-level `<link>`
element, which is the site root rather than an item. The correct count is 146.

`config/legacy-url-manifest.json` is generated from this export, not hand-typed.
The validator re-derives the URL set from the XML on every run, so the manifest
cannot drift: if the export changes and the manifest does not, validation fails.

## Manifest statuses

| Status | Meaning | Must resolve? |
|---|---|---|
| `redirect` | A migrated successor exists and is proven live | yes, in one hop |
| `preserved` | The URL still exists unchanged on the new site | yes |
| `attachment-no-redirect` | WordPress attachment page with no current equivalent | no |
| `needs-business-decision` | Content is gone; destination is a business call | no |
| `intentionally-gone` | Deliberately retired | no |

Every entry requires `source`, `wordpressType`, `status`, and a non-empty
`reason`. `redirect` entries additionally require `destination`, and the
validator checks that the declared destination matches where the redirect
**actually** lands — a manifest that disagrees with the config is itself a
failure.

## Redirect resolution rules

The validator loads rules from `scripts/redirects.json` and `next.config.mjs`
(both the tuple array and object form), then follows each source until it
reaches a live route, a loop, or a dead end. Route existence is checked against
**prerendered build output**, not the filesystem, because dynamic segments mean
`app/**/page.tsx` cannot tell you which slugs exist.

Failure conditions:

- destination is not a live route
- destination is itself another redirect (chain > 1 hop)
- redirect loop
- duplicate source
- conflicting destinations for one source
- malformed path, or a path hardcoding the production hostname
- a URL classified as non-resolving that nonetheless has a redirect rule

Pattern rules — `/:year/:month/:day/:slug`, `/:year/:month/:slug`, `/post/:slug`
— cannot be statically resolved and are reported separately rather than treated
as literal redirects.

Chains longer than one hop can be allowlisted with a reason via
`CHAIN_ALLOWLIST`. It is currently **empty by design**: every chain found so far
was an accident, not a decision.

## Attachment policy

All 84 attachment URLs are classified `attachment-no-redirect`.

WordPress generated a page per uploaded image. The new site has no equivalent,
and there is no correct automatic destination — redirecting all of them to their
parent article would be a guess, and redirecting them to the image file itself
serves a bare asset to a human visitor.

Choosing real destinations requires evidence this repository does not contain:
which attachment URLs actually have backlinks, and which are still indexed. Until
that evidence exists, they are documented as unresolved rather than papered over.

The validator still requires **every one of the 84** to appear in the manifest.
Silence is not an option; only an explicit, reasoned decision is.

## Business decisions outstanding

**`/the-experts-guide-to-custom-shutters-for-arched-windows-in-post-falls-homes`**

No successor exists. The article was not carried across in the migration, and no
current article has arched or specialty-shaped windows as its subject.

Candidates, none applied automatically:

| Candidate | Trade-off |
|---|---|
| `/products/shutters` | Closest topical match, and does state shutters are custom-built for arches, angles, French and patio doors — but it is a product page, not a guide |
| `/blog/the-ultimate-shutter-guide-for-northern-idaho-homes-…` | Nearest editorial equivalent; does not address arches specifically |
| `/blog/how-to-measure-and-install-plantation-shutters-like-a-pro` | Nearest how-to |
| Rewrite the article | Restores the content rather than approximating it |

The dead redirect that previously pointed this URL at a non-existent article has
been **removed**. A redirect to a 404 is worse than no redirect: a 404 at the
original URL tells a crawler the content is gone, whereas a redirect to a 404 is
a broken promise that wastes the crawl and retains none of the authority.

## Commands

| Command | Runs | Notes |
|---|---|---|
| `npm run validate:legacy` | the validator alone | Requires existing build output |
| `npm run verify:legacy` | `npm run build && npm run validate:legacy` | Use this one |

`validate:legacy` is deliberately **not** part of `npm run check`. It needs
prerendered output, and `check` is meant to stay fast enough to run before every
commit. It refuses to run at all if `.next/server/app` is missing, rather than
silently reporting a pass against stale or absent output.

## Controlled failure-test results

| Test | Injected | Result | Exit |
|---|---|---|---:|
| A | removed one post from the manifest | reported the unclassified URL **and** the 146 vs 145 count mismatch | **1** |
| B | destination → `/kodecite-missing-legacy-destination` | reported source, dead destination, and origin file | **1** |
| C | duplicated a redirect source | reported the source and both definitions with their origins | **1** |
| D | two-hop chain | printed the complete chain | **1** |
| E | loop between two paths | printed the full loop | **1** |
| F | 84 attachment entries with reasons | **passed**, reported as unresolved | **0** |
| G | arched-shutters `needs-business-decision` | **passed**, reported under "AWAITING A BUSINESS DECISION" | **0** |
| G2 | same entry with its reason blanked | correctly rejected | **1** |

## Known limitations — what this gate does NOT prove

- **Whether an old URL has backlinks.** No backlink data exists in this
  repository. A redirect may be pointed at a perfectly reasonable destination and
  still be worthless because nothing links to the source.
- **Whether Google currently indexes an old attachment page.** The 84
  unredirected attachments may be entirely inert, or may be receiving traffic.
  This gate cannot distinguish those cases.
- **Whether external WordPress CDN images still resolve.** Two articles reference
  `i0.wp.com/luxewindowworks.com/wp-content/…`. Whether those still load depends
  on infrastructure outside this repository and is not checked here.
- **Whether a broad redirect is the right content strategy.** The pattern rules
  match wide; the validator confirms they are syntactically safe and cannot
  shadow a real route, not that they send visitors somewhere useful.
- **Whether a `needs-business-decision` destination is commercially appropriate.**
  That judgement is the point of the status.
- **Live HTTP behaviour.** Resolution is computed from the config and build
  output, not by issuing requests against a running server.

## Deliberately deferred

Route inventory · sitemap parity · general rendered-link validation · canonical
validation · metadata validation · Open Graph image validation · schema changes ·
WordPress asset localization · accessibility · browser testing · Lighthouse ·
GitHub Actions · branch protection
