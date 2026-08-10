/**
 * Luxe Window Advisor — short-term conversational memory.
 *
 * THE ADVISOR COULD NOT HEAR ITSELF TALK. State carried the fact ledger, the
 * turn count and the question ids already asked — everything except the
 * conversation. Neither model call ever received a prior message, its own
 * included, so "Why?" and "What about the other one?" arrived with nothing to
 * refer to. The advisor knew the room was a bedroom and had no idea what it had
 * just recommended.
 *
 * THIS IS A SECOND KIND OF MEMORY, NOT A REPLACEMENT FOR THE FIRST.
 *
 *   The ledger is what is TRUE of the project. Durable, validated, evidence-
 *   backed, and the only thing the deterministic engine ever sees.
 *
 *   The transcript is what was SAID. Recent, bounded, unvalidated, and never
 *   consulted by the engine — it exists so the model can resolve a pronoun.
 *
 * Keeping them separate is what stops the second becoming the first. A fact
 * still has to be quoted out of the customer's current message to enter the
 * ledger, so nothing the assistant said in an earlier turn can promote itself
 * into a Luxe business fact by being repeated back.
 *
 * Pure functions of their inputs, like the rest of the reasoning path, so the
 * `.mjs` harnesses can load this with no build step.
 */

export type TranscriptRole = "customer" | "advisor";

export interface TranscriptMessage {
  readonly role: TranscriptRole;
  readonly text: string;
}

/**
 * Eight exchanges — sixteen messages — is roughly where a window-treatment
 * conversation stops referring backwards. It is enough for "the first option
 * you mentioned" and far short of letting the prompt grow without limit.
 */
export const MAX_TRANSCRIPT_TURNS = 8;
export const MAX_TRANSCRIPT_MESSAGES = MAX_TRANSCRIPT_TURNS * 2;

/**
 * Per message. Generous for a referent, short enough that sixteen of them stay
 * bounded. Facts do not come from here — the ledger holds those — so a long
 * message losing its tail costs context, never truth.
 */
export const MAX_TRANSCRIPT_MESSAGE_CHARS = 800;

const clip = (text: string): string => {
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed.length <= MAX_TRANSCRIPT_MESSAGE_CHARS
    ? trimmed
    : `${trimmed.slice(0, MAX_TRANSCRIPT_MESSAGE_CHARS - 1)}…`;
};

/**
 * Re-validates a transcript arriving from the client.
 *
 * The client holds conversation state, so this is untrusted input and gets the
 * same treatment as everything else that crosses that boundary: unknown roles
 * and non-string text are dropped rather than repaired, and the result is
 * clipped and bounded before it can reach a prompt. A crafted payload can put
 * text in front of the model here — but only as conversation, which the prompts
 * are explicit is not a source of facts, and which cannot pass the evidence
 * check that guards the ledger.
 */
export function validateTranscript(raw: unknown): readonly TranscriptMessage[] {
  if (!Array.isArray(raw)) return [];
  const messages: TranscriptMessage[] = [];
  for (const item of raw.slice(-MAX_TRANSCRIPT_MESSAGES)) {
    if (typeof item !== "object" || item === null) continue;
    const { role, text } = item as Record<string, unknown>;
    if (role !== "customer" && role !== "advisor") continue;
    if (typeof text !== "string") continue;
    const clipped = clip(text);
    if (clipped) messages.push({ role, text: clipped });
  }
  return messages;
}

/**
 * Adds this turn's exchange and drops whatever fell off the front.
 *
 * Both sides are kept. An advisor turn is half the context a follow-up needs —
 * "why?" is a question about what the advisor said, and a transcript of only
 * customer messages would answer it no better than no transcript at all.
 */
export function appendExchange(
  transcript: readonly TranscriptMessage[],
  customerMessage: string,
  advisorMessage: string
): readonly TranscriptMessage[] {
  const next = [...transcript];
  const customer = clip(customerMessage);
  const advisor = clip(advisorMessage);
  if (customer) next.push({ role: "customer", text: customer });
  if (advisor) next.push({ role: "advisor", text: advisor });
  return next.slice(-MAX_TRANSCRIPT_MESSAGES);
}

/**
 * Renders the transcript for a prompt.
 *
 * THE CURRENT MESSAGE IS NEVER IN HERE. It is appended only after the turn
 * completes, so what this renders is strictly what came before — and the model
 * is told separately, and unambiguously, which message it is answering. A
 * current message that also appeared at the end of the history would be the
 * fastest way to make a model answer the wrong thing.
 */
export function renderTranscript(transcript: readonly TranscriptMessage[]): string {
  return transcript
    .map((m) => `${m.role === "customer" ? "CUSTOMER" : "LUXE"}: ${m.text}`)
    .join("\n");
}

/**
 * The text deterministic retrieval should match a follow-up against.
 *
 * "Why?" names nothing. Neither does "what about the other one?" — and matching
 * either against the current message alone finds no approved topic, so the
 * answer path declines and a follow-up question falls through to the product
 * engine, which replies with generic guidance instead of the explanation that
 * was asked for.
 *
 * The subject of a follow-up is in the exchange it follows up on, so that is
 * what gets added: the most recent exchange, and nothing older. Widening it
 * further would let a topic from four turns ago win a match against a question
 * that has moved on.
 *
 * THIS SELECTS WHICH APPROVED ANSWER APPLIES. It never becomes the answer —
 * the content still comes from approved knowledge, and history contributes only
 * the words that say which piece of it is relevant.
 */
export function retrievalContext(
  transcript: readonly TranscriptMessage[],
  currentMessage: string
): string {
  return [...transcript.slice(-2).map((m) => m.text), currentMessage].join(" ");
}
