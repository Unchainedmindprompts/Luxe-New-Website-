# Luxe Window Advisor — Phase A domain layer & behavioural harness

Converts the approved Luxe Window Advisor business knowledge into a
deterministic, version-controlled domain layer, plus the harness that proves it
behaves the way Luxe decided it should.

**Phase A has no model, no API route, no UI, and no network access.** Nothing
here is customer-facing. What it produces is structured reasoning data that a
later phase can constrain a model with.

## The architectural commitment

```
FACTS → CONSTRAINTS → ELIGIBLE DIRECTIONS → STRONG CANDIDATES
      → TRADEOFFS → REQUIRED QUESTIONS → ESCALATION CONDITIONS
```

Deliberately **not** `FACTS → one mathematically guaranteed product`.

That distinction shapes every design decision below. A window-treatment
recommendation is professional judgment operating inside business boundaries.
Phase A encodes the boundaries exactly and leaves the judgment alone: several
directions routinely finish equal, and that is the correct output, not a
tie-break bug to fix.

## Files

| File | Role |
|---|---|
| `lib/advisor/types.ts` | The vocabulary. Facts, rules, directions, assessment shape. |
| `lib/advisor/knowledge/products.ts` | 11 product directions, 1 cross-cutting option, declared site coverage. |
| `lib/advisor/knowledge/priorities.ts` | The 17 customer priorities and what distinguishes each. |
| `lib/advisor/knowledge/rules.ts` | 7 rule families + 9 canonical business policies. |
| `lib/advisor/knowledge/guardrails.ts` | 22 hard prohibitions. |
| `lib/advisor/engine.ts` | The evaluator. Pure function of (facts, knowledge). |
| `scripts/advisor-scenarios.json` | The 30 approved scenarios. |
| `scripts/test-advisor-engine.mjs` | Three-pass harness. |

## Rules are data, not code

Every rule — contraindication, promotion, escalation trigger, guardrail — is a
serialisable `Condition` tree, not a predicate function:

```ts
{
  id: "cellular-view-while-deployed",
  effect: "deprioritize",
  when: {
    any: [
      { priority: "view-preservation", withinTop: 2 },
      { fact: "viewImportance", is: ["high", "critical"] },
    ],
  },
  reason: "Cellular is not ideal when seeing out while the shade is deployed is a leading priority…",
}
```

Three things follow from that choice.

Someone who does not write TypeScript can read the business contract and say
whether it matches what Luxe decided. A rule change shows up in review as a
data diff rather than as control flow. And one evaluator decides every rule the
same way, so there is no family of rules with subtly different semantics.

The grammar is small: `has`, `fact`/`is`, `priority`/`withinTop`,
`requestedProduct`, `requestedFeature`, `unknown`, and `all`/`any`/`not`.

`{ priority, withinTop }` is ranking-aware on purpose. "Energy efficiency is
their single highest priority" and "they mentioned energy efficiency" are
materially different claims and produce different recommendations, which is the
brief's own point about two homeowners with the same window.

`{ unknown }` lets a rule fire *because* information is missing. That is what
drives the exterior-mounting escalation on a project where nobody has said what
the shade would bolt to.

## "Not told" versus "told, and there are none"

`ProjectFacts` is entirely optional — real conversations supply facts a few at a
time, and the engine has to produce a usable assessment at every stage.

The distinction that does the work: an **undefined** list means the dimension
was never raised; an **empty** list means it was asked and came back clean. A
scalar set to `"unknown"` counts as never raised.

That is what implements the brief's rule against re-asking. Each question rule
declares `askOnlyIfUnknown`, and the question disappears the moment every
dimension it would resolve is known. Scenario 2 exercises exactly this: the
nursery scenario asserts `q-darkening-level` must be *asked or resolved*, and it
passes by being resolved, because the homeowner already said "as dark as
possible".

## Product directions

Nine single directions — cellular, interior roller, interior solar, shutters,
real wood blinds, faux/composite blinds, Roman shades, drapery, exterior solar —
plus two **layered directions** that are first-class candidates in their own
right:

- `exterior-solar-plus-interior-privacy`
- `functional-shade-plus-stationary-panels`

Both are named in the brief as Luxe preferences, and the second is called a core
Luxe recommendation. Forcing every answer into a single SKU-like product would
have lost both. Scenario 30 — competing view, darkening, privacy and budget
priorities — resolves to the layered exterior-plus-interior answer precisely
because no single product serves that brief.

Every statement in `products.ts` traces to the approved brief. The brief's own
hedges are preserved rather than hardened: roller side gaps stay "roughly 3/4
inch on the drive side, sometimes more", because the brief explicitly says not to
hard-code them as guaranteed dimensions.

## Constraints: exclude versus deprioritize

- `exclude` removes a direction from consideration entirely.
- `deprioritize` keeps it available — a homeowner may still choose it with the
  tradeoff explained — but stops it being surfaced as a strong candidate.

Both record their reasons, because "why not" is as much of the answer as "why".

A deprioritized direction still collects any promotion rationales that fired for
it. Scenario 12 is the clearest case: exterior solar over a frequently used
patio door is promoted hard *and* deprioritized for the access conflict, so the
output says "this is the right product and here is the problem with it", not
"no".

## Ranking, and what the harness refuses to assert

Promotion rules carry a `weight` of 1–3. It sums, it orders the output, and it
elects nothing. **No behavioural assertion depends on rank** — assertions test
set membership only. That is a direct response to the brief's instruction not to
overfit the harness so that only one product ordering can pass.

## The engine

`assess(facts, knowledge)` — a pure function, knowledge injected rather than
imported.

That keeps the engine testable against alternate knowledge sets and impossible
to couple to one snapshot of the business rules. It also has a practical
consequence: because nothing in `lib/advisor/` imports a knowledge module at
runtime, every import in the layer is type-only. Node erases those completely,
so the harness loads the TypeScript directly — no build step, no loader, no new
dependency, and **no change to the shared `tsconfig.json`** — while
`tsc --noEmit` still type-checks every knowledge record against `types.ts`.

Output is structured reasoning data, never prose:

recognized conditions · eligible directions · strong candidates · deprioritized ·
excluded · cross-cutting options · tradeoffs · unresolved questions ·
verification requirements · escalation status and triggers · request conflicts ·
applicable guardrails · business policies · unknown dimensions

Verification requirements come from two directions at once: rules that fire on
the facts, and the standing triggers of whatever direction is still in play.

## Request conflicts are a first-class output

"Recommend solely based on the customer's initial product name" is a hard
prohibition, so the conflict between what someone asked for and what they said
they want cannot be left to emerge from ranking. It is its own output with its
own rules.

Twelve conflict rules cover the cases the brief names — faux wood versus an
energy priority, "blinds" from someone who wants clear glass, an inside-mount
roller against a blackout request, free-hanging exterior shades, rechargeable
battery exterior systems, stained synthetics, "luxury" assumed to mean drapery,
full drapery without stack-back, oversized louvers on a small window,
motorization with no operating reason.

Each names what was requested, where to redirect, and why — so the advisor
acknowledges the request rather than silently ignoring it.

## Guardrails

Twenty-two prohibitions: 14 always in force, 8 surfaced only when the project
makes them live, so a later phase can put the relevant ones in front of a model
rather than the whole list every time.

Every guardrail carries `permittedInstead`. A prohibition with no sanctioned
alternative gets worked around; giving the allowed formulation alongside the ban
is what makes it usable. Every guardrail also cites the brief section it came
from, so a reviewer can check the encoding against the business decision rather
than against this file's own wording.

The brand rule is encoded as a guardrail (`no-owner-personal-name`), including
the explicit ban on "Prefer to talk with Mark?".

## Harness structure

`npm run test:advisor` — deterministic, local, fast, no API key, zero external
cost. Not wired into `check`, `verify`, pre-commit or CI.

Three passes, in order, because a later one is meaningless if an earlier one
failed.

### 1. Structural integrity

Every cross-reference inside the knowledge layer resolves: promotion targets,
verification triggers, tradeoff ids, priority ids, layered components, conflict
redirects, question `materialTo`. Ids are unique. Conditional guardrails have
conditions and always-on ones do not. Every guardrail has a permitted
alternative and a source. Every condition tree is walked and its named ids
validated.

This pass exists because a dangling reference is *silent*. A promotion rule
naming a direction that does not exist simply produces less output, and every
scenario that did not happen to assert on it still passes.

### 2. Site category cross-check

Deliberately **not** name matching. "Solar Shades" and "Exterior Solar Shades"
differ by one word and are materially different products; "Blinds" is one page
covering two advisor directions; drapery has no page at all. Any heuristic over
display names would be wrong in all three cases.

Instead every advisor record **declares** which site slugs it covers, and the
pass enforces agreement in both directions against the site's own data
(`lib/constants.ts` `PRODUCTS` and `lib/product-data.ts` `productPages`, which
are also checked against each other, including that each page's key matches its
own declared slug).

- A site product no advisor record claims → **fail**. A new category has to get
  an explicit decision.
- An advisor claim for a slug the site no longer has → **fail**.
- A direction with no site page → allowed, but only with a written
  `siteCoverageNote`.
- A category Luxe sells but the brief supplies no knowledge for → allowed only
  via an explicit `UNREPRESENTED_SITE_PRODUCTS` entry with a reason.

### 3. Behavioural scenarios

The 30 approved categories. Each supplies structured project facts and asserts
required direction and prohibited behaviour — never wording, never ranking.

| Assertion | Passes when |
|---|---|
| `mustRecognize` | the condition appears in `recognizedConditions` |
| `mustIncludeCandidate` | the direction is not excluded |
| `mustStronglyConsider` | the direction is in `strongCandidates` |
| `mustExclude` | the direction is in `excludedDirections` |
| `mustDeprioritize` | the direction is in `deprioritizedDirections` |
| `mustIdentifyTradeoff` | the tradeoff is surfaced |
| `mustAskOrResolve` | the question is still open **or** every dimension it resolves is known |
| `mustEscalateFor` | the escalation trigger fired |
| `mustApplyGuardrail` | the guardrail is in force |
| `mustSurfaceConflict` | the request conflict is surfaced |
| `mustSurfaceOption` | the cross-cutting option is indicated |

The last two are additions to the list the brief sketched, which said the
categories "may include" the nine it named. Request conflicts and motorization
are both first-class engine outputs, and asserting on them any other way would
have meant testing them indirectly.

`mustAskOrResolve` carries the only real logic, and it is the assertion that
encodes a business rule rather than an outcome: a scenario can insist something
is dealt with without forcing the advisor to ask a question the homeowner has
already answered.

An assertion naming an id that does not exist is reported as a **harness
defect**, distinct from a behaviour failure — otherwise a typo reads as the
engine misbehaving.

## Current state

| Measure | Value |
|---|---:|
| Product directions | 11 (9 single, 2 layered) |
| Cross-cutting options | 1 |
| Priorities | 17 |
| Recognition rules | 39 |
| Promotion rules | 30 |
| Tradeoff rules | 11 |
| Question rules | 14 |
| Verification rules | 16 |
| Escalation rules | 15 |
| Conflict rules | 12 |
| Contraindications | 29 |
| Guardrails | 22 (14 always, 8 conditional) |
| Business policies | 9 |
| Scenarios | 30 |
| Assertions | 225 |
| **Scenarios passing** | **30 / 30** |

## Are the assertions actually discriminating?

Thirty of thirty passing on the first run is not evidence of anything by itself.
Every scenario's assertion set was therefore run against every *other* scenario's
facts — 6,525 off-diagonal checks. If the assertions were vacuous, most would
pass anyway.

**16.2% satisfied off-diagonal.** Only 3 of 870 wrong-facts pairings satisfied a
scenario's whole assertion set, and all three are near-duplicate pairs by
construction (01/30 both west-facing view-plus-severe-heat; 15/20 both
rarely-operated; 18/27 both very-wide).

Per assertion type, off-diagonal satisfaction — lower is stronger:

| Assertion | Rate |
|---|---:|
| `mustSurfaceConflict` | 0% |
| `mustExclude` | 1% |
| `mustIdentifyTradeoff` | 5% |
| `mustEscalateFor` | 7% |
| `mustSurfaceOption` | 7% |
| `mustRecognize` | 8% |
| `mustStronglyConsider` | 12% |
| `mustDeprioritize` | 16% |
| `mustApplyGuardrail` | 21% |
| `mustAskOrResolve` | 22% |
| `mustIncludeCandidate` | **99%** |

`mustIncludeCandidate` is weak by construction and is reported honestly rather
than quietly: "eligible" means "not excluded", so nearly everything is eligible
nearly always. It is a useful **negative** guard — it would catch an over-eager
exclusion, which is how it is used in scenarios 6, 9, 12 and 17 — but it should
never be read as evidence that a direction was recommended.

## Controlled failure tests

Every injected defect was reverted and confirmed by MD5 against a baseline
captured beforehand.

| Test | Injected | Result | Exit |
|---|---|---|---:|
| A | promotion rule retargeted to a non-existent direction | structural failure naming the rule and the bad target, **and** the downstream behavioural consequence in scenario 14 | **1** |
| B | `UNREPRESENTED_SITE_PRODUCTS` emptied | cross-check reported `banded-shades` unclaimed, naming it as advisor drift | **1** |
| C | `cellular` retargeted to a `honeycomb-shades` slug | two findings — the orphaned real category *and* the claim on a category that does not exist | **1** |
| D | the "don't default to cellular on a view window" rule weakened so it never fires | **no structural error**; scenarios 01 and 30 failed on `mustDeprioritize: cellular` | **1** |
| E | one assertion id misspelled (`modern-minimal-asthetic`) | reported as a harness defect — "is not a known id" — not as a behaviour failure | **1** |

Test D is the one that matters. It removes a business rule without breaking
anything structural, and only the behavioural layer catches it. That is the
harness doing the job it exists for.

## Knowledge gaps the harness reports without failing

Three diagnostics print on every run. None fails the build, because failing
would only pressure someone into inventing knowledge Luxe has not supplied —
which is itself a hard guardrail.

**`banded-shades` has a product page and zero advisor knowledge.** The approved
brief contains no banded/zebra shade material at all — no strengths, no weak
fits, no tradeoffs. It is declared unrepresented, and the advisor will not
recommend it until Luxe supplies the knowledge.

**Drapery has substantial knowledge and no product page.** The reverse gap.

**Five priorities have no rule behind them:** `functionality`, `child-safety`,
`convenience`, `moisture-resistance`, `lifestyle-requirement`. They are in the
vocabulary because the brief lists them; nothing reasons about them yet.
`child-safety` is the most significant — the brief names it as a priority but
supplies no cord or operating-system safety knowledge.

`moisture-resistance` is inert for a different and deliberate reason: the wet-area
rules key off the *condition* (`moistureExposure`), not off the customer having
named moisture as a priority. The condition is the more reliable signal.

## Judgment calls made where the brief was silent or ambiguous

Recorded because they are business decisions encoded by an engineer, and any of
them could be reversed by Luxe with a one-line change.

1. **Solar shades deprioritized under a maximum-darkening requirement.** Not
   stated in the brief. Derived from the brief's own openness model — the
   openness that preserves the outward view is the same openness that transmits
   light. Rule id `solar-room-darkening`; delete it if Luxe disagrees.

2. **`withinTop` thresholds are a calibration, not a business rule.** The brief
   says "a top priority" and "leading priority" without numbers. The encoding
   uses `withinTop: 1` for "the primary goal", `2` for "leading", `3` for
   "present and material".

3. **Shutter obstructions deprioritize rather than exclude.** The brief says
   physical conditions "must be evaluated", not "avoid". A stricter reading
   would exclude.

4. **Drapery is *excluded* on inadequate stack-back.** The brief says "avoid
   drapery where … inadequate stack-back exists", and "avoid" was read as
   exclude. If Luxe would still sell it there with the tradeoff explained, this
   should become a deprioritize.

5. **Humid ≠ direct splash for real wood.** The brief says avoid real wood in
   "repeated direct moisture exposure", so a merely humid bathroom leaves real
   wood blinds eligible. That may be more permissive than Luxe intends.

6. **Motorization is a cross-cutting option, not a tenth direction.** It is a
   real product page and a real decision, but not a window covering; modelling
   it as a direction would make it compete with products it is meant to
   accompany. An architectural call, not a stated rule.

7. **Shutter material is a decision inside the shutters direction**, not a set
   of separate directions. Real wood, composite, poly and aluminium all live
   under one product heading in the brief, so Phase A does not select material.

8. **Openness percentages are prose, not machine rules.** 3% west / 5% east live
   in `viewBehavior` text and drive nothing, because the brief calls them "a
   starting direction, not an immutable specification". The engine will never
   emit "use 3%".

9. **The 5–8 question target is not enforced.** Phase A emits every unresolved
   question that applies and neither caps nor ranks them; conversation pacing is
   a later-phase concern. Scenario 1 happens to produce 5.

10. **`serviceAreaConfirmed` exists on `ProjectFacts` but no rule reads it.**
    The service-area requirement is encoded only as an always-on guardrail;
    there is no location data in this layer to reason with.

11. **`room: "commercial"` currently changes nothing.** "Luxe serves residential
    and commercial" is recorded as a business policy, but the brief supplies no
    commercial-specific product knowledge.

## Deliberately out of scope for Phase A

No LLM · no LLM SDK · no API route · no rate limiting · no UI · no changes to
`/show-me-my-options` · no `/advisor` route · no routing changes · no booking or
Calendly changes · no analytics · no privacy-policy changes · no dependency
changes · not added to pre-commit or CI.

The choice between `/advisor` and `/show-me-my-options` is frozen and belongs to
the customer-facing UI phase.
