# Luxe Window Advisor — Phase A domain layer & behavioural harness

Converts the approved Luxe Window Advisor business knowledge into a
deterministic, version-controlled domain layer, plus the harness that proves it
behaves the way Luxe decided it should.

> **Phase A.1** closed the two knowledge gaps Phase A reported and applied one
> approved business-rule correction: banded shades are now a represented
> direction, child safety now materially changes the assessment, and drapery
> with inadequate stack-back deprioritizes instead of excluding. No file was
> created and no architecture changed.

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
| `lib/advisor/knowledge/products.ts` | 12 product directions, 3 cross-cutting options, declared site coverage. |
| `lib/advisor/knowledge/priorities.ts` | The 17 customer priorities and what distinguishes each. |
| `lib/advisor/knowledge/rules.ts` | 7 rule families + 9 canonical business policies. |
| `lib/advisor/knowledge/guardrails.ts` | 23 hard prohibitions. |
| `lib/advisor/engine.ts` | The evaluator. Pure function of (facts, knowledge). |
| `scripts/advisor-scenarios.json` | The approved scenarios — 30 from Phase A, 4 added in A.1. |
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

Ten single directions — cellular, interior roller, banded shades, interior
solar, shutters, real wood blinds, faux/composite blinds, Roman shades, drapery,
exterior solar — plus two **layered directions** that are first-class candidates
in their own right:

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

### Banded shades are a declared roller variant

Luxe's position is that banded shades are functionally very similar to roller
shades and differ in how they look. Restating roller's knowledge under a second
id would let the two drift apart on dimensions where Luxe considers them the
same product, so banded shades declare `variantOf: "interior-roller"` and share
a `ROLLER_FAMILY` record covering privacy, room darkening, energy, moisture,
access, motorization, scale, tradeoffs and verification. The shared
room-darkening contraindication comes from one factory, id-namespaced per member
so each finding is still traceable to the direction that produced it.

That inversion is what makes the record readable: **whatever banded overrides is,
by construction, exactly where it differs** — the horizontal banded appearance,
the modern/contemporary skew of the fabric options, and view behaviour.

View behaviour is the one that carries a rule — see below.

## Preserving the view *while the treatment is down*

The single most important distinction in this layer, and the one it was easiest
to get wrong.

**Seeing out through a lowered treatment** and **clear glass when the treatment
is raised** are different requirements, served by different products. The first
is `view-preservation` / `viewImportance`; the second is
`clear-glass-when-open` / `windowUse: raised-to-clear-glass`.

When keeping the view *while deployed* is a leading priority, **interior solar
is the direction that survives**, because the mesh keeps continuous outward
visibility. Everything opaque or semi-opaque is deprioritized against it:

| Direction | Why it deprioritizes |
|---|---|
| `interior-solar` | — it is the answer |
| `banded-shades` | aligned bands give a partial, peek-a-boo view, not continuous view-through |
| `interior-roller` | a normal opaque roller fabric covers the view when down |
| `cellular` | no outward view while deployed |

**Deprioritized, never excluded.** Privacy, room darkening, aesthetics, cost or
how the window is actually used can all outweigh daytime view, and the homeowner
still gets to choose.

All four reference one shared `VIEW_WHILE_DEPLOYED_IS_LEADING` condition rather
than restating the trigger, so the rule cannot drift apart across directions
while each keeps its own honest explanation.

An earlier revision applied this to banded and cellular but **not** to interior
roller, on the reasoning that only banded has an alignment feature that could be
mistaken for a view product. Luxe corrected that: an opaque roller covers the
view just as completely, and the rule is about the product's behaviour, not
about which product a customer is most likely to misread. Scenario 34 exists to
hold the *other* half of the line — a homeowner who raises the covering for
clear glass, with no view-while-deployed requirement, still gets roller as a
strong candidate.

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

Drapery against inadequate stack-back is the same shape, and Phase A.1 corrected
it. It was originally an `exclude`, on a reading of the brief's word "avoid".
Luxe's position is that limited stack-back does not make functional drapery
impossible — it makes it a weaker answer, because the fabric covers substantial
glass, cuts natural light, visually shrinks the opening and can make the room
feel smaller. So it now deprioritizes: drapery stays eligible, the functional
shade with stationary side panels is promoted hard, and the homeowner still gets
to choose full drapery with the tradeoff stated.

### Operating systems

Cordless and corded/chain operation join motorization as cross-cutting options —
things that apply *across* directions rather than competing with them. They
carry the same two-tier treatment directions get: `deprioritizedWhen` beats
`indicatedWhen`, mirroring how a contraindication beats a promotion, so an
option that is contraindicated stays contraindicated even when it was explicitly
asked for.

Where child safety is a priority, cordless and motorized operation surface and
corded/chain operation is steered away from. What the advisor deliberately does
**not** do is assert which products can be supplied cordless or motorized — that
depends on product, size and application, so it becomes a verification
requirement and a guardrail rather than a claim.

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
| `mustDeprioritizeOption` | the cross-cutting option is steered away from |
| `mustRequireVerification` | Luxe is required to confirm this at the opening |

The last four are additions to the list the brief sketched, which said the
categories "may include" the nine it named. Request conflicts, operating-system
options and verification requirements are all first-class engine outputs, and
asserting on them any other way would have meant testing them indirectly.
`mustRequireVerification` closed a real hole — verification requirements had
been an output no assertion could reach.

`mustAskOrResolve` carries the only real logic, and it is the assertion that
encodes a business rule rather than an outcome: a scenario can insist something
is dealt with without forcing the advisor to ask a question the homeowner has
already answered.

An assertion naming an id that does not exist is reported as a **harness
defect**, distinct from a behaviour failure — otherwise a typo reads as the
engine misbehaving.

## Current state

| Measure | Phase A | Phase A.1 |
|---|---:|---:|
| Product directions | 11 (9 single, 2 layered) | **12 (10 single, 2 layered)** |
| Cross-cutting options | 1 | **3** |
| Priorities | 17 | 17 |
| Recognition rules | 39 | **41** |
| Promotion rules | 30 | **33** |
| Tradeoff rules | 11 | 11 |
| Question rules | 14 | 14 |
| Verification rules | 16 | **17** |
| Escalation rules | 15 | 15 |
| Conflict rules | 12 | **13** |
| Contraindications | 29 | **32** |
| Guardrails | 22 (14 / 8) | **23 (14 always, 9 conditional)** |
| Business policies | 9 | 9 |
| Scenarios | 30 | **34** |
| Assertions | 225 | **254** |
| **Scenarios passing** | 30 / 30 | **34 / 34** |

## Are the assertions actually discriminating?

Everything passing on the first run is not evidence of anything by itself. Every
scenario's assertion set was therefore run against every *other* scenario's facts
— 8,382 off-diagonal checks. If the assertions were vacuous, most would pass
anyway.

**17.0% satisfied off-diagonal** (16.2% before Phase A.1). Only 5 of 1,122
wrong-facts pairings satisfied a scenario's whole assertion set, and all five are
near-duplicate pairs by construction: 01/30 both west-facing
view-plus-severe-heat, 15/20 both rarely-operated, 18/27 both very-wide, and 08
against two scenarios whose facts include the modern-minimal aesthetic that 08's
assertions test.

Per assertion type, off-diagonal satisfaction — lower is stronger:

| Assertion | Rate |
|---|---:|
| `mustSurfaceConflict` | 0% |
| `mustExclude` | 0% |
| `mustDeprioritizeOption` | 3% |
| `mustIdentifyTradeoff` | 5% |
| `mustEscalateFor` | 6% |
| `mustRecognize` | 7% |
| `mustSurfaceOption` | 8% |
| `mustRequireVerification` | 9% |
| `mustStronglyConsider` | 12% |
| `mustDeprioritize` | 18% |
| `mustApplyGuardrail` | 19% |
| `mustAskOrResolve` | 20% |
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

### Phase A.1 probes

| Probe | Injected | Result | Exit |
|---|---|---|---:|
| P1 | banded shades' `siteProductSlugs` emptied | cross-check reported `banded-shades` unclaimed — the same drift finding that previously guarded it as an unrepresented declaration | **1** |
| P2 | `corded-operation`'s `deprioritizedWhen` rewired so child safety never triggers it | scenario 33 failed on `mustDeprioritizeOption: corded-operation`, with no structural error | **1** |
| P3 | drapery stack-back restored to `exclude` | scenario 10 failed on both `mustIncludeCandidate: drapery` and `mustDeprioritize: drapery` | **1** |
| P4 | `roller-view-while-deployed` deleted | scenario 32 failed on `mustDeprioritize: interior-roller`, with no structural error | **1** |

P3 is worth noting in both directions. The same scenario passed under the old
`exclude` rule and passes under the new `deprioritize` rule, because its
assertions were rewritten alongside the rule — which is exactly what should
happen when a business decision changes. What the probe proves is that the
assertions are load-bearing: reverting the rule without reverting the assertions
fails immediately.

## Knowledge gaps the harness reports without failing

Two diagnostics print on every run. Neither fails the build, because failing
would only pressure someone into inventing knowledge Luxe has not supplied —
which is itself a hard guardrail.

**Every product category on the public site is now represented.**
`UNREPRESENTED_SITE_PRODUCTS` is empty as of Phase A.1; `banded-shades` was its
only entry and is now a full direction.

**Drapery has substantial knowledge and no product page.** The reverse gap, and
the only one left. Two layered directions likewise have no page, which is
expected — they are compositions, not products.

**Four priorities have no rule behind them:** `functionality`, `convenience`,
`moisture-resistance`, `lifestyle-requirement`. They are in the vocabulary
because the brief lists them; nothing reasons about them yet. `child-safety` was
the fifth and the most significant, and Phase A.1 closed it.

Two of the four are inert for deliberate reasons rather than missing knowledge.
`moisture-resistance` is inert because the wet-area rules key off the *condition*
(`moistureExposure`), not off the customer having named moisture as a priority —
the condition is the more reliable signal. `convenience` overlaps almost entirely
with the access and motorization rules, which fire on physical facts instead.

`functionality` and `lifestyle-requirement` are genuinely too generic to
discriminate between directions on the knowledge Luxe has supplied so far.

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
   would exclude. *Confirmed by Luxe in Phase A.1 — keep.*

4. ~~**Drapery is *excluded* on inadequate stack-back.**~~ **Corrected in Phase
   A.1 to `deprioritize`.** The original encoding read the brief's "avoid" as a
   hard exclusion. Luxe's position is that limited stack-back makes full
   drapery weaker, not impossible.

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

Added in Phase A.1:

12. **Child safety changes operating systems, not product directions.** The rule
    says favour treatments *and* operating systems that eliminate accessible
    cords, but naming which directions are cord-free would mean asserting
    cordless availability per product — which the same rule forbids. So child
    safety surfaces cordless and motorized operation, deprioritizes corded, and
    routes availability to verification. It promotes and excludes no direction.
    Shutters are the one direction the approved knowledge already describes as
    operated at the louvers rather than by a lift cord; promoting shutters on
    child safety would be defensible, but it is a derivation rather than a rule
    Luxe has stated, so it was left out.

13. **A nursery is treated as implying child safety.** `room: "nursery"` triggers
    the child-safety rules even when the priority is not stated. Reasonable, but
    it is an inference the brief does not make explicitly.

14. ~~**Banded shades deprioritize on a view priority; interior roller does
    not.**~~ **Corrected by Luxe.** Both deprioritize now, along with cellular,
    against interior solar. The original reasoning — that only banded has an
    alignment feature that could be mistaken for view-through — described which
    product a customer might misread rather than what the product does. An
    opaque roller covers the view just as completely. See "Preserving the view
    while the treatment is down" above.

15. **"Horizontal detail" is a design preference, not a product name.** Banded
    shades are surfaced from an aesthetic flag describing what the homeowner
    wants the treatment to look like, so the advisor is never simply matching a
    product to its own description.

## Deliberately out of scope for Phase A

No LLM · no LLM SDK · no API route · no rate limiting · no UI · no changes to
`/show-me-my-options` · no `/advisor` route · no routing changes · no booking or
Calendly changes · no analytics · no privacy-policy changes · no dependency
changes · not added to pre-commit or CI.

The choice between `/advisor` and `/show-me-my-options` is frozen and belongs to
the customer-facing UI phase.
