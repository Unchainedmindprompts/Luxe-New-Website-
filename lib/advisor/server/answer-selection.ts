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
