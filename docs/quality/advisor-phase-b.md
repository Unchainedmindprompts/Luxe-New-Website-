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

## Extraction

Native structured output (`output_config.format` with a JSON schema). No
free-form JSON parsing, no regex over prose.

Three properties carry the weight:

**The schema and the validator cannot drift.** Both are generated from the same
runtime vocabulary tables, and each table is typed `Record<SomeUnion, true>`, so
TypeScript rejects a value that is not in the Phase A union *and* a value
missing from it. Adding a fact to Phase A and forgetting it here is a compile
error.

**Unknown stays unknown.** Every field is nullable. `null` means "did not say";
an empty array means "asked, none". Phase A treats those as different, which is
what stops the advisor re-asking an answered question and what stops it
inventing a fact from silence.

**The model cannot widen the vocabulary.** Validation is an allowlist. An
unrecognised value is dropped and counted, never coerced to a near match.

`goals` (free-text problem statements) is deliberately **not** extracted. The
engine does not reason over it, so carrying homeowner prose would add PII
surface and an injection round-trip for no reasoning value.

### Priority order is never fabricated

A ranking changes almost every Phase A rule, since the condition grammar is
rank-aware (`withinTop`). So extraction has two fields: `priorities` (ranked —
used only when the homeowner made the order clear, or named exactly one thing)
and `unrankedConcerns` (raised, order unstated). Only the first reaches
`ProjectFacts`; the second becomes the highest-scoring question.

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
npm run test:advisor:server   Phase B deterministic suite  — 20/20
npm run eval:advisor:live     opt-in, billable, gates nothing
```

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
