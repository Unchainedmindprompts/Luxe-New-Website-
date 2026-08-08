/**
 * Luxe Window Advisor — Anthropic provider adapter. (Phase B)
 *
 * The only module in the advisor that knows a model exists. Everything above it
 * talks to the `AdvisorProvider` port, so changing model, effort, or vendor is
 * a change to this file and nothing else — which is what makes a later Haiku or
 * Opus comparison a config experiment rather than a refactor.
 *
 * SERVER ONLY. The key is read from `process.env.ANTHROPIC_API_KEY` at call
 * time, never at module scope, so a missing key cannot break a static build —
 * the same lazy-init shape `app/api/consultation/route.ts` already uses for
 * Resend. There is no `NEXT_PUBLIC_` variant and no path by which a key or a
 * raw provider response reaches the client.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { AdvisorProvider } from "./types";

/**
 * V1 runs one model for both jobs — extraction and phrasing — because a single
 * model is far easier to evaluate than a split, and splitting before there is
 * evidence would be optimising something nobody has measured.
 */
export const ADVISOR_MODEL = "claude-sonnet-5";

/**
 * Effort is the tuning knob for this layer, and it is deliberately one value
 * shared by both calls. `medium` because extraction has real judgment in it
 * (deciding whether a homeowner actually ranked their priorities is not a
 * lookup) while neither call is open-ended enough to want the `high` default's
 * latency in an interactive conversation.
 */
const EFFORT = "medium";

/**
 * Generous relative to what either call needs. Adaptive thinking is on by
 * default on this model and `max_tokens` caps thinking *and* output together —
 * a tight budget would risk a response truncated mid-sentence, which is a worse
 * failure than a few unused tokens.
 */
const EXTRACTION_MAX_TOKENS = 2048;
const PHRASING_MAX_TOKENS = 1024;

/** Wall-clock ceiling per model call. */
export const PROVIDER_TIMEOUT_MS = 25_000;

/** The error shape `advisor.ts` recognises structurally, by `code`. */
export class ProviderError extends Error {
  readonly code: "provider-unavailable" | "provider-timeout";
  constructor(code: "provider-unavailable" | "provider-timeout", message: string) {
    super(message);
    this.name = "ProviderError";
    this.code = code;
  }
}

let cached: Anthropic | undefined;

function getClient(): Anthropic {
  if (!cached) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new ProviderError("provider-unavailable", "ANTHROPIC_API_KEY is not configured");
    cached = new Anthropic({ apiKey });
  }
  return cached;
}

/** Joins the text blocks of a response, ignoring thinking and everything else. */
function textOf(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/**
 * Maps any failure to one of two codes. Provider messages are deliberately
 * dropped rather than propagated — they can echo request content, and nothing
 * downstream needs them to choose a safe response.
 */
function toProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  const name = (error as { name?: string })?.name;
  const status = (error as { status?: number })?.status;
  if (name === "AbortError" || name === "TimeoutError" || status === 408) {
    return new ProviderError("provider-timeout", "model call timed out");
  }
  return new ProviderError("provider-unavailable", "model call failed");
}

/**
 * Combines the caller's abort signal with a local timeout, so a hung request
 * cannot outlive the route regardless of what the SDK does.
 */
function withTimeout(signal?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const forward = () => controller.abort();
  signal?.addEventListener("abort", forward, { once: true });
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", forward);
    },
  };
}

export function createAnthropicProvider(): AdvisorProvider {
  return {
    async extract({ system, userMessage, schema, signal }) {
      const timeout = withTimeout(signal);
      try {
        const response = await getClient().messages.create(
          {
            model: ADVISOR_MODEL,
            max_tokens: EXTRACTION_MAX_TOKENS,
            system,
            output_config: {
              effort: EFFORT,
              // Native structured output. The schema is closed
              // (`additionalProperties: false`), so the model cannot widen the
              // fact vocabulary — and nothing here parses free-form prose.
              format: { type: "json_schema", schema },
            },
            messages: [{ role: "user", content: userMessage }],
          },
          { signal: timeout.signal }
        );
        const text = textOf(response.content);
        if (!text) throw new ProviderError("provider-unavailable", "empty extraction response");
        try {
          return JSON.parse(text) as unknown;
        } catch {
          // Malformed structured output is a provider failure, not a business
          // outcome. It must never become a guessed set of facts.
          throw new ProviderError("provider-unavailable", "extraction was not valid JSON");
        }
      } catch (error) {
        throw toProviderError(error);
      } finally {
        timeout.dispose();
      }
    },

    async phrase({ system, userMessage, maxTokens, signal }) {
      const timeout = withTimeout(signal);
      try {
        const response = await getClient().messages.create(
          {
            model: ADVISOR_MODEL,
            max_tokens: Math.min(maxTokens, PHRASING_MAX_TOKENS),
            system,
            output_config: { effort: EFFORT },
            messages: [{ role: "user", content: userMessage }],
          },
          { signal: timeout.signal }
        );
        return textOf(response.content);
      } catch (error) {
        throw toProviderError(error);
      } finally {
        timeout.dispose();
      }
    },
  };
}
