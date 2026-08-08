# Luxe Window Advisor — Phase B server reasoning layer

Adds the server-side AI layer on top of the approved Phase A domain engine.
**No customer-facing UI, no routing change, no link to the endpoint.** The
reasoning can be exercised before conversion UX is involved.

## The shape of a turn

```
homeowner language
  → LLM structured extraction      closed schema, validated server-side
  → deterministic Luxe engine      Phase A — the source of business truth
  → deterministic selection        next question, or ready to recommend
  → LLM phrasing                   constrained to the assessment
  → deterministic validation       guardrails, regenerate once, else fallback
  → typed response
```

The model appears twice and owns neither end. It turns prose into a vocabulary
it cannot widen, and turns a finished assessment into prose it cannot add to.

**"The engine wins" is mechanical, not instructed.** The model is never asked
which product to recommend, so there is no disagreement to arbitrate. The only
thing it can get wrong is wording — and wording is validated and replaceable.

## Provider

| | |
|---|---|
| Provider | Anthropic |
| SDK | `@anthropic-ai/sdk` — the one new dependency |
| Model | `claude-sonnet-5` for **both** extraction and phrasing |
| Effort | `medium`, one value shared by both calls |
| Key | `ANTHROPIC_API_KEY`, server-only, read at call time |

One model for both jobs is deliberate: a split is harder to evaluate and would
be optimising something nobody has measured yet. Model, effort and token budgets
live in `provider.ts` and nowhere else, so trying Haiku or Opus later is a
config change in one file — the advisor architecture does not move.

The key is read inside the call, never at module scope, mirroring the lazy-init
shape `app/api/consultation/route.ts` already uses for Resend. **A missing key
cannot break the build** — verified by building this branch with no key set.

## Extraction — three narrow calls, not one wide one

### Why it was rebuilt

The first implementation sent all twenty `ProjectFacts` fields as a single
structured-output schema. It passed 20/20 deterministic tests and **failed 100%
of the time against the real API.** The live evaluation produced eight identical
failures and zero behavioural data:

```
400 invalid_request_error
"Schemas contains too many parameters with union types (20 parameters with
 type arrays or anyOf) ... limit: 16 parameters with unions"
```

Removing the nullable unions cleared that limit and hit a second one — `Schema
is too complex.` at 20 fields / 144 enum members. A schema that wide is simply
not a shape the structured-output compiler accepts.

**Mocking the provider could not have caught this**, and no number of additional
mocked tests would have. That gap is now closed by
`npm run test:advisor:schema` (below).

### The groups

Each is well inside the limits and validated against the real API. Fields are
existing `ProjectFacts` names — no new concepts.

| Group | Subject | Fields | Enum members | Unions |
|---|---|---:|---:|---:|
| `intent` | What the homeowner wants from the room | 7 | 61 | 0 |
| `physical` | The room and opening as they physically are | 9 | 56 | 0 |
| `product` | Products named and how they expect to operate them | 4 | 27 | 0 |

`intent` — `priorities`, `unrankedConcerns`, `viewImportance`, `privacyNeed`,
`roomDarkening`, `budgetSensitivity`, `aesthetic`
`physical` — `room`, `exposure`, `solarHeat`, `windowUse`, `geometry`,
`moistureExposure`, `access`, `openings`, `exteriorConditions`
`product` — `requestedProducts`, `requestedFeatures`, `motorizationInterest`,
`operationFrequency`

Child-safety and lifestyle requirements are **not** separate fields — they are
`child-safety` and `lifestyle-requirement` members of the `priorities`
vocabulary, so they live in `intent`. Adding parallel fields would have
duplicated a concept Phase A already models.

The split is also better prompting: judging what someone *wants*, what their
window physically *is*, and what they *asked for by name* are three unrelated
judgments, and each now gets a system prompt about one thing.

### Optional, not nullable

Fields are omitted rather than sent as `null`. Omission carries the same meaning
at zero schema cost — **absent means not stated, `[]` means they said there are
none, a value means they said it.** Three states, no unions. Phase A's
distinction between unknown and empty is preserved exactly.

### Conflict handling

`EXTRACTION_GROUPS` is a strict partition — every field belongs to exactly one
group — so two extractors cannot legitimately report the same field.
`assertGroupsPartitionFields()` and test 21 keep it that way, checking for both
duplicated fields and fields no group extracts.

`mergeExtractionGroups` still handles a collision rather than assuming it away:
the earlier group in declaration order wins, the discarded value is recorded in
`conflicts`, and nothing is silently dropped. **A non-empty `conflicts` is a bug
signal, not a routine outcome.**

Two conflicts are real and resolved on their own terms:

- **Ranked vs unranked.** A concern the homeowner ranked is removed from
  `unrankedConcerns`, because a stated ranking answers the question that list
  exists to raise.
- **Turn over turn.** New scalars replace old ones (the latest statement is
  current truth, including a correction); lists union (each extraction sees only
  the newest message, so replacing would forget earlier conditions); a fresh
  ranking supersedes the old one outright.

### Call routing

The three groups run **concurrently** — they are independent, and three
sequential round trips would triple the wait for nothing.

The first turn runs every group. Later turns skip any group whose fields are all
settled. If that rule would skip everything, all three run instead, so the
advisor can never go deaf.

**Known limit:** once every field in a group is settled, a homeowner correcting
an already-settled fact in it will not be heard. Groups this wide rarely fill up
before a recommendation, and the alternative costs a call every turn to catch a
rare correction. Revisit if live conversations show corrections being missed.

### Still deliberately not extracted

`goals` (free-text problem statements) remains excluded. The engine does not
reason over it, so carrying arbitrary homeowner prose would add PII surface and
an injection round-trip for no reasoning value. It is listed in the recommended
grouping for this phase but is a deliberate omission, not an oversight — say the
word and it becomes one string field in `intent`.

## Mounting substrate — a question the advisor can now hear answered

`ProjectFacts.mountingSubstrate` (`stone` · `siding` · `fascia` · `soffit` ·
`structural-framing` · `other` · `unknown`) is separate from
`exteriorConditions` because those are *conditions of the site* while this is
*the answer to a question*. Before it existed, a homeowner who said "it mounts
to stone" was recorded as `unknown-mounting-substrate`, so the advisor asked
again and kept escalating as though nobody had answered.

**A named substrate closes the question and nothing more.**
`verify-exterior-mounting` still applies on every exterior project, and
`no-mounting-safety-claim-without-inspection` stays in force — whether *that*
stone, at *that* height, will carry *that* system is a judgement made at the
opening, not from a sentence. Tests 24 and 25 pin both halves.

## Direction-determining vs verification-class questions

The distinction that decides whether the advisor reads as an adviser or an
intake form.

**Direction-determining** — the answer changes which product is right, and only
the homeowner has it. Privacy after dark, darkening level, how the window is
used. These still gate a recommendation.

**Verification-class** — Luxe is going to confirm it at the opening anyway.
Mounting substrate, wind, power, door clearance, stack-back, reach. Each is
paired with the verification requirement that covers it, and a question is only
deferred when that requirement is actually present in the live assessment. They
stay askable, score below the material threshold, and travel with the
recommendation as "what Luxe will verify" — they no longer cost a turn.

## Context preservation

A resolved fact is **sticky**. It is replaced only when it was previously
unknown, or when extraction reports the field in `corrects` — an explicit
signal that the homeowner changed their mind. Mentioning another room in
passing is not a correction, which is what stopped "mostly the living room and
the kids' rooms" from silently replacing an established nursery.

## Scale is not size

Explicit scale language — huge, massive, oversized, floor-to-ceiling — may
record qualitative geometry such as `large-architectural-glass`. That is the
homeowner describing the character of the opening.

It never becomes a dimension. There is no width, height, or size-eligibility
field in the vocabulary, so a number has nowhere to land, and anything numeric
is dropped by the validator rather than coerced. Tests 32 and 33.

## Question selection

Deterministic. The model phrases; it does not choose.

Candidates come only from `assessment.unresolvedQuestions`, which Phase A
populates only when a trigger matches *and* the dimensions it would resolve are
still unknown — so an answered question is unselectable by construction.

| Signal | Weight |
|---|---:|
| Per strong candidate the answer is material to | 6 |
| Per other eligible direction | 2 |
| Resolves a physical condition (can exclude a direction outright) | 4 |
| Its being unknown is itself an escalation trigger | 3 |
| Priority order unstated across 2+ concerns | 100 |

Physical conditions outrank preferences because a physical fact can *eliminate*
a direction — a splash zone rules out fabric — while a preference only reorders
what was already eligible.

Below a score of **4** a question could not change eligible directions, strong
candidates, tradeoffs or escalation, and is not worth a turn. The advisor stops
asking at **8** questions and recommends with what it has.

## Response states

**`NEED_MORE_INFORMATION`** — updated state, assessment summary, one question
(canonical + phrased), CTA intent.

**`RECOMMENDATION_READY`** — updated state, assessment summary, best fit,
alternatives, tradeoffs, verification requirements, customer-facing prose, CTA
intent.

**`ADVISOR_UNAVAILABLE`** — every failure path. Never an invented recommendation
from a failed extraction, and it deliberately keeps the consultation open: a
broken model is exactly when talking to a person is the right next step.

The consultation CTA is **structured intent only** — `recommended` plus reasons
(`recommendation-ready`, `requires-physical-verification`,
`high-complexity-project`, `exterior-mounting-or-power-conditions`,
`request-conflict-needs-discussion`). No Calendly, no rendering, no analytics.

## Guardrail enforcement

Prompt instruction is the first line, never the only one. Every generated string
is pattern-checked before it can leave the server. On violation: **regenerate
once**, then fall back to deterministic text assembled from the assessment. The
violating text is never returned and never logged.

**Validation is unconditional.** Phase A scopes some guardrails to the projects
where they are live, which controls what the model is *told*. Checking is not
scoped the same way — a fabricated price is wrong on every project. Scope
narrows instruction; it must not narrow enforcement.

Approved knowledge has to survive the checks, so the patterns catch the
guarantee rather than the number: "roughly 3/4 inch", "around 3% openness" and
"approximately 48-72 hours" all pass, while "exactly 3/4 inch", "blocks 90% of
UV" and "15 degrees cooler" do not.

**Deterministically enforced (20):** fabricated pricing · binding quote · total
blackout · temperature reduction · wind performance · guaranteed fit ·
pretended measurement · financing · servicing outside products · appointment
availability · manufacturer availability · owner's personal name · fabricated
manufacturer spec · assumed cordless/motorized availability · hardcoded gap
dimensions · mounting safety without inspection · unsecured exterior shade ·
guaranteed nighttime privacy from solar · guaranteed maximum size · unconfirmed
service area. Plus **invented products** (off-catalogue brands).

**Prompt-enforced only (2), and stated as such rather than given a pattern that
would mostly misfire:**

- `no-recommendation-from-product-name-alone` — structural. The engine chooses
  candidates, so generated text cannot violate it.
- `no-substitute-for-professional-measurement` — a stance, not a phrase.

**Known limit:** the invented-brand list is a short, concrete set of the
retailers a model is most likely to reach for unprompted. An exhaustive brand
list is impossible. Brands Luxe genuinely carries are passed in by the caller
and never flagged.

## Prompt injection

Treated as untrusted data throughout, and made low-impact structurally rather
than by asking the model nicely:

- Homeowner text is **only ever a user turn** — never a system prompt. Verified
  by test 19, which plants a canary string and asserts it appears in no system
  prompt, no phrasing turn, and no reply.
- Extraction output is a **closed schema**; anything outside it is dropped.
- Product eligibility, exclusions and guardrails are **deterministic**.
- The phrasing call is told exactly which product labels it may name.

The most a successful injection achieves is setting facts the domain layer
already understands — which the engine then reasons about under its own rules.

## Abuse control

| Control | Value | Holds globally? |
|---|---|---|
| Payload size | 32 KB, checked before parsing | **Yes** |
| Message length | 2,000 chars | **Yes** |
| Turns per conversation | 12 hard cap; advisor stops asking at 8 | **Yes** |
| Provider timeout | 25 s per call, plus the caller's abort signal | **Yes** |
| Requests per fingerprint | 20 / 60 s | **No — per instance** |

**The rate limiter is not a global limit and is not presented as one.** Each
serverless instance keeps its own map, so a caller spread across instances gets
a multiple of the allowance, and a cold start resets it. It is a cheap brake on
one client hammering one instance, chosen because the brief rules out a database
or Redis for V1. The limits that genuinely hold everywhere are the exact ones
above. A distributed limit needs infrastructure and is deferred rather than
faked.

Limits live in `limits.ts` as pure functions so the harness exercises them
directly — an abuse control nobody tests is a comment.

## Fallback behaviour

| Failure | Result |
|---|---|
| Extraction times out or fails | `ADVISOR_UNAVAILABLE`, no assessment, consultation offered |
| Extraction returns malformed JSON | Treated as a provider failure — never guessed facts |
| Extraction returns a parseable non-object | Degrades to zero facts, conversation continues |
| Phrasing violates a guardrail | Regenerate once, then deterministic fallback text |
| Phrasing times out | Deterministic fallback text; the turn survives |
| Anything unhandled | Typed safe response — never a stack trace or provider message |

## PII and logging

No message content, no extracted facts, no generated text is logged. The single
log line carries status, turn number, guardrail intervention ids and an error
class. Nothing is persisted — there is no database in Phase B. The advisor does
not ask for contact information.

Provider error messages are dropped rather than propagated, since they can echo
request content and nothing downstream needs them to choose a safe response.

## Testing

```
npm run test:advisor          Phase A behavioural harness — unchanged, 34/34
npm run test:advisor:server   Phase B deterministic suite  — 23/23, mocked
npm run test:advisor:schema   real-provider schema contract — opt-in, needs a key
npm run eval:advisor:live     opt-in, billable, gates nothing
```

### The real-provider schema test

`test:advisor:schema` is the check whose absence let the original bug reach a
live run. For each group it sends the actual schema to Anthropic, proves the API
accepts it, parses the response, and requires that response to survive the same
closed-vocabulary validator the pipeline uses — schema acceptance alone would
not prove the two agree. It also asserts no group has reintroduced a union type
or crossed the field limit.

It needs `ANTHROPIC_API_KEY`, costs a few cents, and is **not** in `check`,
`build`, `verify`, or any hook. If Anthropic tightens schema constraints again,
this fails with the API's own message rather than a live conversation failing
silently.

The deterministic suite mocks the provider **at the `AdvisorProvider` port**, so
every test drives the real extraction validator, the real Phase A engine, the
real question selector and the real guardrail validator — only the model is
fake. No network, no key, no cost, and it is not wired into `check`, `verify`,
`build` or any hook.

That boundary is also the honest limit: these tests prove what the *system* does
with a given model output, not what the model will say. Whether Claude actually
reads "west-facing lake view" correctly is what `eval:advisor:live` is for, and
it prints for a human rather than asserting — a flaky gate is worse than no
gate.

| # | Scenario |
|---:|---|
| 1 | West-facing lake view — facts reach the engine and shape the assessment |
| 2 | Priority order — an unranked list is not turned into a ranking |
| 3 | Unknown facts remain unknown — nulls and junk are never coerced |
| 4 | "Blinds" does not force a blind recommendation |
| 5 | Total-blackout request never produces a guarantee |
| 6 | Exact temperature claim is rejected |
| 7 | Exterior high wind requires verification and escalates |
| 8 | Child-safety text produces child-safety reasoning |
| 9 | Continuous view favours solar over banded and roller |
| 10 | Drapery with poor stack-back is deprioritized, not excluded |
| 11 | Prompt injection cannot override business rules |
| 12 | Fabricated pricing in generated text is rejected |
| 13 | An invented brand in generated text is rejected |
| 14 | An already-answered question is never re-asked |
| 15 | Malformed model extraction fails safely |
| 16 | Provider timeout fails safely |
| 17 | Maximum turn count is enforced |
| 18 | Oversized input is rejected before any model call |
| 19 | Homeowner text never reaches a system prompt |
| 20 | The engine owns candidates — phrasing is told only what it may name |

Tests 19 and 20 are additions beyond the 18 the brief required. Both close gaps
that would otherwise be invisible: the first proves the injection boundary
rather than asserting it, and the second proves the phrasing call is actually
constrained to the assessment's product set.

## Required privacy-policy change before Phase C/D ships publicly

**The customer-facing advisor must not go live until `/privacy` is updated.**
Phase B is server-only and unlinked, so nothing has changed for visitors yet —
but the moment a UI exists, the policy is materially incomplete.

What must be disclosed:

1. **A third-party AI sub-processor.** Anthropic (PBC, USA) receives the
   homeowner's typed messages to produce the structured facts and the reply.
2. **What is sent.** The message text and the structured project facts derived
   from it. Not name, phone, email, or address — the advisor never asks for
   contact details, and `goals` free-text is deliberately not extracted.
3. **What is stored.** Nothing, by Luxe. There is no database and no
   server-side session; conversation state lives in the visitor's browser for
   the length of the conversation. Anthropic's own retention applies to what it
   receives and should be linked rather than paraphrased.
4. **International transfer.** Processing happens on US infrastructure.
5. **That it is AI-assisted, and what that means.** Output is guidance, not a
   quote, a measurement, or a binding commitment — which is also what the
   guardrails enforce.
6. **How to avoid it.** The consultation booking path and phone number remain
   available without using the advisor.

Anthropic's current commercial terms state that API inputs and outputs are not
used to train models — worth confirming against their terms at the time of
writing rather than restating from here.

## Deliberately not in Phase B

No UI · no `/advisor` page · no change to `/show-me-my-options` · no routing
change · no navigation change · no Calendly change · no analytics events · no
privacy-policy edit (see above) · no database · no persistence · no streaming ·
no conversation transcripts · not wired into `check`, `verify` or any hook.
