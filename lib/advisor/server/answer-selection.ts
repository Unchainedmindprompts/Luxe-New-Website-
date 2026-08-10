/**
 * Luxe Window Advisor — choosing which approved answer applies. (Ask Luxe)
 *
 * Deterministic. No model call, no embedding, no network — a visitor's question
 * is scored against approved topics by their own words, and the best match wins
 * only if it clears a bar. That last clause is the whole design: the failure
 * this replaces was a model answering from nothing, so an unconfident match has
 * to return nothing rather than the closest thing on the shelf.
 *
 * `requires` is the gate and `terms` is the score. A topic no part of the
 * question actually names is never eligible, however many generic words it
 * happens to share.
 */
import type { AnswerTopic, ProductDirection } from "../types";

/**
 * Two independent signals, or one specific phrase.
 *
 * A single shared word is not evidence. "Do you install hot tubs?" shares
 * "install" with the installation policy and has nothing to do with it, and an
 * answer beginning "Yes." would be worse than no answer at all. Single words
 * score 1 and phrases score 2, so clearing this bar means the question either
 * named the topic twice or named it precisely once.
 */
const MIN_SCORE = 2;

/** Compound questions exist; answer dumps should not. Two topics is the ceiling. */
const MAX_TOPICS = 2;

/** Words shared by so many product labels that they identify nothing. */
const GENERIC_LABEL_WORDS = new Set([
  "shades", "shade", "blinds", "blind", "interior", "exterior", "and", "full",
  "real", "faux", "functional",
]);

const normalise = (text: string): string =>
  text.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

/** Whole-word-ish containment, so "area" does not match "arearug". */
function mentions(haystack: string, needle: string): boolean {
  if (needle.includes(" ")) return haystack.includes(needle);
  return new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(s|es)?\\b`).test(haystack);
}

export interface ScoredTopic {
  readonly topic: AnswerTopic;
  readonly score: number;
}

/**
 * The approved topics that genuinely answer this message, best first.
 *
 * Returns an empty array when nothing clears the bar, which is a real and
 * useful answer — it routes the turn to "we don't have that on hand" instead
 * of to a guess.
 */
export function selectAnswerTopics(
  message: string,
  topics: readonly AnswerTopic[]
): readonly ScoredTopic[] {
  const text = normalise(message);

  const scored: ScoredTopic[] = [];
  for (const topic of topics) {
    // The gate: this topic has to be named, not merely adjacent.
    if (!topic.requires.some((term) => mentions(text, normalise(term)))) continue;

    let score = 0;
    for (const term of topic.terms) {
      if (mentions(text, normalise(term))) score += normalise(term).includes(" ") ? 2 : 1;
    }
    // The bar is cleared on the question's own words. The priority bonus then
    // orders what survives — it must never be what lets something through,
    // or every business topic would match on a single incidental word.
    if (score < MIN_SCORE) continue;
    // A business answer is written for this question; a page FAQ merely shares
    // vocabulary with it. Break ties toward the one that was authored to answer.
    scored.push({ topic, score: topic.priority === "business" ? score + 1.5 : score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.topic.id.localeCompare(b.topic.id))
    .slice(0, MAX_TOPICS);
}

/**
 * Product directions the visitor named, for comparison questions.
 *
 * "What's the difference between cellular and roller shades?" is answerable
 * from knowledge Luxe already has — it just was not reachable without going
 * through project qualification first. This finds the products by name so the
 * comparison can be answered on the spot.
 */
export function selectNamedDirections(
  message: string,
  directions: readonly ProductDirection[]
): readonly ProductDirection[] {
  const text = normalise(message);
  const named = directions.filter((direction) => {
    if (direction.kind !== "single") return false;
    // Nobody types "interior roller shades". They type "roller". Match on the
    // words that actually distinguish one product from another, dropping the
    // category nouns and qualifiers every label shares.
    const distinctive = normalise(direction.label)
      .split(/\s+/)
      .filter((word) => !GENERIC_LABEL_WORDS.has(word) && word.length >= 5);
    return (
      mentions(text, normalise(direction.label)) ||
      distinctive.some((word) => mentions(text, word))
    );
  });
  // Three products named at once is a survey, not a question.
  return named.slice(0, 3);
}

/**
 * Is this message ASKING something, as opposed to telling us something?
 *
 * A grammatical test, deliberately, and not a list of question topics. "I
 * already have cellular shades and want something else" names a product
 * without asking about it, and explaining cellular shades back to that person
 * is a lecture they did not request.
 *
 * Kept to a handful of openers plus the question mark, because the cost of
 * being wrong is small in both directions: a false negative asks the
 * qualification question, which was the old behaviour, and a false positive
 * explains a product the customer just named.
 */
const ASKING_OPENERS =
  /^(what|which|how|why|when|where|who|whose|do|does|did|is|are|was|were|can|could|would|will|should|any|tell me|talk me)\b/i;

function isAsking(message: string): boolean {
  const text = message.trim();
  return text.includes("?") || ASKING_OPENERS.test(text);
}

/**
 * Product directions the homeowner is asking about, on a turn that is otherwise
 * about their project.
 *
 * THE CUSTOMER CHOOSES THE SUBJECT, WHICH IS THE WHOLE SAFETY ARGUMENT. Phase 7
 * exists because "would cellular shades work for my west-facing bedroom?" was
 * being answered with "how dark does the room need to be?" and nothing else —
 * the question they actually asked went unanswered because the message also
 * carried project facts.
 *
 * Returning only directions they named is what keeps this education rather than
 * recommendation. It cannot invent a shortlist, because it never picks: given
 * twelve eligible directions and no product named, it returns nothing and the
 * turn asks its question exactly as before. Measured against the corpus in
 * Phase 7 — "what do you actually carry for a bright west bedroom?" names no
 * product and correctly yields nothing here.
 */
export function selectProductEducation(
  message: string,
  directions: readonly ProductDirection[]
): readonly ProductDirection[] {
  if (!isAsking(message)) return [];
  return selectNamedDirections(message, directions);
}

/** Approved knowledge for one direction, as plain lines for the phrasing layer. */
export function describeDirection(direction: ProductDirection): string {
  const lines = [
    `${direction.label}:`,
    ...direction.strengths.slice(0, 3).map((s) => `- ${s}`),
    direction.viewBehavior ? `- View: ${direction.viewBehavior}` : "",
    direction.energyBehavior ? `- Energy: ${direction.energyBehavior}` : "",
    direction.roomDarkeningBehavior ? `- Darkening: ${direction.roomDarkeningBehavior}` : "",
    direction.privacyBehavior ? `- Privacy: ${direction.privacyBehavior}` : "",
    direction.designCharacteristics ? `- Character: ${direction.designCharacteristics}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Deliberately stricter than `selectAnswerTopics`, because this one skips the
 * model entirely and a wrong answer here is served verbatim.
 */
const FAST_PATH_MIN_SCORE = 4;

/**
 * Long enough for any single question — the longest approved one is about
 * fifty characters — and short enough to exclude a message doing two jobs.
 */
const FAST_PATH_MAX_CHARS = 100;

/** How far ahead the winning answer must be before it is served unassisted. */
const FAST_PATH_LEAD = 2;

/**
 * How many sentences a fast-path message may contain.
 *
 * "What are your hours? My living room is hot." is short enough to pass a
 * length check and would lose the second half, because the fast path skips
 * extraction. Counting sentences targets the actual risk — a message carrying
 * more than one thing — rather than approximating it with a character budget.
 */
function sentenceCount(message: string): number {
  return message.split(/[.?!]+/).filter((part) => part.trim().length > 0).length;
}

/**
 * An approved answer good enough to serve without asking a model anything.
 *
 * MEASURED: extraction costs 2.3–4.4s and phrasing 2.7–4.8s, while the entire
 * deterministic pipeline costs about a millisecond. "What are your hours?" was
 * paying seven seconds and two model calls to reach a sentence the server
 * already had written down.
 *
 * Every condition below exists to make serving that sentence verbatim safe:
 *
 *   ONE topic, so a compound question is not half-answered.
 *   BUSINESS priority, so the text was written as customer-facing prose for
 *     this exact question rather than lifted from a page about something else.
 *   A HIGH score, well above the bar that merely makes a topic eligible.
 *   NO product named, because naming a product means they want it discussed,
 *     not a policy quoted at them.
 *   SHORT, because a long message is usually carrying more than one thing.
 *
 * Anything else returns null and takes the full path. This never decides what
 * is true — it decides only whether the model needs to be involved in saying
 * something already approved.
 */
export function selectVerifiedAnswer(
  message: string,
  topics: readonly AnswerTopic[],
  directions: readonly ProductDirection[]
): AnswerTopic | null {
  if (message.length > FAST_PATH_MAX_CHARS) return null;
  if (sentenceCount(message) > 1) return null;
  if (selectNamedDirections(message, directions).length > 0) return null;

  const scored = selectAnswerTopics(message, topics);
  if (!scored.length) return null;

  const [best, runnerUp] = scored;
  if (best.topic.priority !== "business") return null;
  if (best.score < FAST_PATH_MIN_SCORE) return null;

  // A published page FAQ often shares a word or two with a policy question, so
  // "exactly one match" was too strict once seventy-four of them were in the
  // pool. What matters is that the business answer clearly WINS: two topics
  // scoring close together means the question genuinely touches both, and a
  // compound question should be phrased rather than half-served.
  if (runnerUp && best.score - runnerUp.score < FAST_PATH_LEAD) return null;
  return best.topic;
}
