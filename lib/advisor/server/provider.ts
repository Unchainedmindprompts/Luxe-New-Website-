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
import type { AdvisorProvider, ProviderUsage, SystemPrompt } from "./types";

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
/**
 * Timeouts, set against measured behaviour rather than guessed.
 *
 * Both calls used to share a 25-second budget, which was chosen when nothing
 * had been measured. Live tracing puts extraction at 2.3–4.4s and phrasing at
 * 2.7–4.8s, so 25 seconds is not a safety margin — it is a promise to keep a
 * customer staring at a spinner for half a minute before admitting failure.
 *
 * They differ because their failure costs differ. A failed phrasing call has a
 * deterministic fallback ready on every route, so waiting longer buys almost
 * nothing. A failed extraction has no such luxury on a project turn, so it
 * keeps more headroom — roughly four times the slowest call observed.
 */
export const EXTRACTION_TIMEOUT_MS = 18_000;
export const PHRASING_TIMEOUT_MS = 12_000;

/** @deprecated Kept as the shared default; prefer the per-call values above. */
export const PROVIDER_TIMEOUT_MS = EXTRACTION_TIMEOUT_MS;

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
 * The smallest prefix Anthropic will cache, in tokens, for this model.
 *
 * Sonnet-class models require 1024; a `cache_control` marker on anything
 * shorter is accepted and then silently ignored, which is the worst possible
 * failure mode — the request succeeds, the config looks right, and nothing is
 * cached. So the marker is applied only when the prefix is comfortably clear of
 * the floor, and everything else is left alone rather than decorated with a
 * marker that does nothing.
 *
 * The char figure is the gate actually used, because it needs no tokeniser at
 * request time. Four characters per token is the conservative direction for
 * English prose (measured on these prompts: 13,752 chars ≈ 3,438 tokens, so
 * 4.0), and the 1.5× margin means a prompt has to shrink by a third before the
 * gate is wrong in the direction that costs anything.
 */
const CACHE_MINIMUM_TOKENS = 1024;
const CACHE_MINIMUM_CHARS = CACHE_MINIMUM_TOKENS * 4 * 1.5;

/**
 * Renders a system prompt as Anthropic content blocks, marking the stable half
 * as cacheable when it is big enough to be worth caching.
 *
 * TWO BLOCKS, NOT ONE STRING. A prefix cache matches on an exact prefix of the
 * rendered request, so the boundary has to be a real boundary — the stable text
 * first, the turn's material after it, and nothing dynamic interleaved. That is
 * exactly what `SystemPrompt` already expresses, which is why this adapter has
 * no restructuring to do.
 *
 * The default five-minute TTL is deliberate and is not a shrug: it is the
 * lifetime that matches the traffic. A conversation is a burst of turns seconds
 * apart, so every turn after the first hits a warm cache; an hour-long TTL
 * would cost 2× on the write to keep a prefix alive between visitors who may
 * never arrive.
 */
function systemBlocks(system: SystemPrompt): Anthropic.TextBlockParam[] {
  const cacheable = system.stable.length >= CACHE_MINIMUM_CHARS;
  const blocks: Anthropic.TextBlockParam[] = [
    {
      type: "text",
      text: system.stable,
      ...(cacheable ? { cache_control: { type: "ephemeral" as const } } : {}),
    },
  ];
  if (system.dynamic?.trim()) blocks.push({ type: "text", text: system.dynamic });
  return blocks;
}

/** Reads the usage block defensively — every field is optional on the wire. */
function readUsage(
  stage: ProviderUsage["stage"],
  usage: Anthropic.Usage | undefined
): ProviderUsage {
  return {
    stage,
    inputTokens: usage?.input_tokens ?? 0,
    outputTokens: usage?.output_tokens ?? 0,
    cacheCreationTokens: usage?.cache_creation_input_tokens ?? 0,
    cacheReadTokens: usage?.cache_read_input_tokens ?? 0,
  };
}

/**
 * Combines the caller's abort signal with a local timeout, so a hung request
 * cannot outlive the route regardless of what the SDK does.
 */
function withTimeout(timeoutMs: number, signal?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
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

export interface AnthropicProviderOptions {
  /**
   * Called with the token usage of every completed call.
   *
   * The only way to know whether caching is actually working: a marker that
   * fails to cache produces a perfectly normal response. `cacheReadTokens`
   * above zero is a hit and the only acceptable evidence that the prefix split
   * is doing its job.
   */
  readonly onUsage?: (usage: ProviderUsage) => void;
}

export function createAnthropicProvider(options: AnthropicProviderOptions = {}): AdvisorProvider {
  return {
    async extract({ system, userMessage, schema, signal }) {
      const timeout = withTimeout(EXTRACTION_TIMEOUT_MS, signal);
      try {
        const response = await getClient().messages.create(
          {
            model: ADVISOR_MODEL,
            max_tokens: EXTRACTION_MAX_TOKENS,
            system: systemBlocks(system),
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
        options.onUsage?.(readUsage("extraction", response.usage));
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
      const timeout = withTimeout(PHRASING_TIMEOUT_MS, signal);
      try {
        const response = await getClient().messages.create(
          {
            model: ADVISOR_MODEL,
            max_tokens: Math.min(maxTokens, PHRASING_MAX_TOKENS),
            system: systemBlocks(system),
            output_config: { effort: EFFORT },
            messages: [{ role: "user", content: userMessage }],
          },
          { signal: timeout.signal }
        );
        options.onUsage?.(readUsage("phrasing", response.usage));
        return textOf(response.content);
      } catch (error) {
        throw toProviderError(error);
      } finally {
        timeout.dispose();
      }
    },
  };
}
