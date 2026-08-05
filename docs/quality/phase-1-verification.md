# Verification Harness — Phase 1

Source-level checks that run before a build. Everything here answers one
question: **does the source contain a defect we can prove without deploying?**

Phase 1 deliberately does not look at rendered output. Route, sitemap, link,
redirect, and legacy-URL validation all require a production build to be
trustworthy, and they are separate phases.

## Why this exists

Before Phase 1, this repository ran two schema audits and nothing else.

- `package.json` had `"lint": "next lint"`. Next.js 16 removed the `lint`
  subcommand, so the script failed with
  `Invalid project directory provided, no such directory: …/lint`.
- `next.config.mjs` set `eslint.ignoreDuringBuilds: true` with the comment
  *"Lint is run separately in CI"*. No CI existed.

Between those two facts, **ESLint had never run against this codebase.** The
comment asserted a safeguard that did not exist. Both are corrected here.

## What Phase 1 protects

| Gate | Catches |
|---|---|
| `typecheck` | Type errors, independent of the build |
| `lint` | ESLint errors across all source |
| `validate:source` | Local `/images/` references with no file in `public/` |
| `validate:source` | Malformed local image paths |
| `validate:source` | Production placeholder tokens |

## Commands

| Command | Runs | When to run |
|---|---|---|
| `npm run typecheck` | `tsc --noEmit` | Before committing; part of `check` |
| `npm run lint` | `eslint .` | Before committing; part of `check` |
| `npm run validate:source` | `node scripts/validate-source-assets.mjs` | Before committing; part of `check` |
| `npm run check` | all three, in order | **Before every push** |

Existing build-lifecycle gates are unchanged and still run:

| Command | Hook | Unchanged |
|---|---|---|
| `npm run audit:schema` | `prebuild` + `.husky/pre-commit` | yes |
| `npm run audit:rendered` | `postbuild` | yes |

`check` is not wired into `build` or the pre-commit hook. Running it is
currently a matter of discipline; enforcement belongs to the CI phase.

## Files scanned

`scripts/validate-source-assets.mjs` walks:

```
app/  components/  lib/  content/
```

Extensions: `.ts .tsx .js .jsx .mjs .cjs .md .mdx .json`

Never walked: `.next/`, `node_modules/`, `.git/`, `.husky/`, `coverage/`,
`dist/`, `out/`.

`scripts/` is **not** scanned. That is deliberate — the validator names the
tokens it forbids, and scanning itself would guarantee a permanent failure.

## Image rules

A reference is anything matching `/images/…` immediately after a quote or an
opening parenthesis, so an attribute value, a JS string, or a markdown target
counts and a bare mention in prose does not.

For each reference the validator strips the query string and fragment, decodes
percent-encoding, and requires a real file at `public/<path>`.

Excluded from the existence check:

- external URLs and `data:` URLs (never match the `/images/` anchor)
- `blob:` URLs — rejected by the placeholder gate instead, which reports them
  more usefully than "file not found"
- Next.js generated icon routes — `/icon.png`, `/apple-icon.png`,
  `/favicon.ico`, `/opengraph-image`, `/twitter-image`. These are served from
  `app/`, not `public/`, and would otherwise fail on every page.

A path that cannot be decoded, or that ends in `/`, is reported as **malformed**
rather than skipped.

## Placeholder rules

Rejected anywhere in scanned source:

| Token | Case-sensitive |
|---|---|
| `PASTE_` | yes |
| `REPLACE_ME` | yes |
| `YOUR_` | yes |
| `localhost` | no |
| `127.0.0.1` | no |
| `blob:` | no |
| `example.com` | no — see exception |

### The `you@example.com` exception

`app/book/page.tsx` uses `you@example.com` as the visible placeholder attribute
on the booking form's email input. That is correct UI copy, and `example.com` is
reserved for exactly this purpose by RFC 2606.

The exception is **narrow by token, not by file**: the validator removes every
occurrence of the exact string `you@example.com` from a line, then re-checks the
remainder. A canonical URL, schema value, or API base using `example.com` still
fails, including on the same line.

The trade-off is stated plainly: the exception is not scoped to
`app/book/page.tsx`, so `you@example.com` would also be allowed elsewhere. That
was chosen over a path-scoped rule because a path-scoped rule breaks silently
the moment the form moves file. If a second legitimate `example.com` usage
appears that is *not* this string, add it to the list explicitly rather than
broadening the match.

## Controlled failure-test results

Each gate was proven with a temporary file in a scanned directory, then removed.

| Test | Injected | Result | Exit |
|---|---|---|---|
| **A** missing image | `/images/kodecite-missing-image-test.webp` | reported path, expected location, and `lib/__phase1-controlled-test.ts:1` | 1 |
| **B** placeholder | `REPLACE_ME_BEFORE_LAUNCH` | reported token, file, line, and line context | 1 |
| **C** localhost URL | `http://localhost:3000/api/consultation` | reported token, file, line, and line context | 1 |
| **D** negative control | existing `you@example.com` | **passed** — not flagged | 0 |
| **D2** exception narrowness | `https://example.com/products/shutters` | correctly rejected | 1 |
| **E** clean tree | — | `typecheck`, `lint`, `validate:source`, `check` all clean | 0 |

Residue search after reverting confirmed zero occurrences of
`kodecite-missing-image-test`, `__phase1-controlled-test`, `localhost:3000`, or
`https://example.com` in scanned source. The only `REPLACE_ME` remaining is the
token definition inside the validator, which is not scanned.

## Known limitations

- **Source, not output.** A reference that resolves in source can still 404 in
  production — a renamed route, a broken redirect, a stale internal link. Phase
  1 cannot see any of that.
- **Only `/images/`.** Other public assets — PDFs, videos, fonts, downloads —
  are not existence-checked.
- **Remote images unchecked.** `next.config.mjs` allows `i0.wp.com`; whether
  those URLs still resolve is not verified here.
- **Regex, not AST.** A `/images/` path built by string concatenation at runtime
  is invisible to this validator.
- **`example.com` exception is token-scoped**, as described above.
- **`check` is not enforced.** Nothing prevents a push that skips it. That is
  the CI phase's job.
- **ESLint still does not block `next build`.** `ignoreDuringBuilds` remains
  `true` so build behaviour is unchanged in this phase; lint is enforced through
  `npm run check` instead.

## Deliberately deferred

None of the following are implemented or attempted in Phase 1:

- route inventory
- sitemap consistency
- rendered internal links
- rendered schema URLs
- stale-build protection
- WordPress legacy URL contract
- redirect resolution
- canonical validation
- metadata validation
- Open Graph image validation
- accessibility testing
- browser testing
- Lighthouse
- GitHub Actions and branch protection
