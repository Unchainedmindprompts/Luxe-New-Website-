/**
 * Luxe Window Advisor — server endpoint. (Phase B)
 *
 * The HTTP boundary and the only place the pieces are wired together. It owns
 * input limits and abuse control; all reasoning lives below it.
 *
 * NOT LINKED FROM ANYWHERE. Phase B deliberately ships no UI, no navigation
 * entry, and no route change. The endpoint exists so the reasoning layer can be
 * exercised before conversion UX is involved.
 *
 * LOGGING. No message content, no extracted facts, no generated text. Only
 * shape: status, turn number, which guardrails intervened, and an error class.
 * There is no database and nothing is persisted.
 */
import { NextResponse } from "next/server";
import { BUSINESS } from "@/lib/constants";
import { assess } from "@/lib/advisor/engine";
import { LUXE_KNOWLEDGE } from "@/lib/advisor/knowledge";
import { createAdvisor, unavailable, MAX_TURNS } from "@/lib/advisor/server/advisor";
import {
  EXTRACTION_GROUPS,
  buildGroupSchema,
  describeGroupVocabulary,
  groupsForTurn,
  mergeExtractionGroups,
  mergeFacts,
  validateFacts,
} from "@/lib/advisor/server/extraction";
import { sanitizeForOutput, validateGeneratedText } from "@/lib/advisor/server/guardrails";
import {
  extractionSystemPrompt,
  phrasingUserMessage,
  questionSystemPrompt,
  recommendationSystemPrompt,
} from "@/lib/advisor/server/prompts";
import {
  MAX_BODY_BYTES,
  RATE_LIMIT_MAX_KEYS,
  checkRequestLimits,
  recordAndCheckRate,
} from "@/lib/advisor/server/limits";
import { createAnthropicProvider } from "@/lib/advisor/server/provider";
import { selectNextQuestion } from "@/lib/advisor/server/question-selection";
import type { AdvisorRequest, ConversationState } from "@/lib/advisor/server/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-instance request history for the rate limiter. Deliberately in memory and
 * deliberately not presented as a global limit — see `limits.ts`, which holds
 * the reasoning and the honest statement of what this does and does not cover.
 */
const hits = new Map<string, readonly number[]>();

function rateLimited(key: string): boolean {
  const decision = recordAndCheckRate(hits.get(key) ?? [], Date.now());
  if (hits.size > RATE_LIMIT_MAX_KEYS) hits.clear();
  hits.set(key, decision.history);
  return decision.limited;
}

function fingerprint(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const state: ConversationState = {};

  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return NextResponse.json(unavailable("payload-too-large", state), { status: 400 });
  }
  if (bodyText.length > MAX_BODY_BYTES) {
    return NextResponse.json(unavailable("payload-too-large", state), { status: 413 });
  }

  let body: AdvisorRequest;
  try {
    body = JSON.parse(bodyText) as AdvisorRequest;
  } catch {
    return NextResponse.json(unavailable("message-required", state), { status: 400 });
  }

  const priorState = body?.state ?? state;
  const rejection = checkRequestLimits({
    bodyBytes: bodyText.length,
    message: body?.message,
    turnCount: priorState.turnCount,
    maxTurns: MAX_TURNS,
  });
  if (rejection) {
    const status =
      rejection === "message-required" ? 400 : rejection === "conversation-limit-reached" ? 429 : 413;
    return NextResponse.json(unavailable(rejection, priorState), { status });
  }

  if (rateLimited(fingerprint(request))) {
    return NextResponse.json(unavailable("rate-limited", priorState), { status: 429 });
  }

  const message = (body.message as string).trim();

  const advisor = createAdvisor({
    provider: createAnthropicProvider(),
    knowledge: LUXE_KNOWLEDGE,
    assess,
    validateFacts,
    mergeFacts,
    extractionGroups: EXTRACTION_GROUPS,
    buildGroupSchema,
    describeGroupVocabulary,
    groupsForTurn,
    mergeExtractionGroups,
    selectNextQuestion,
    validateGeneratedText,
    sanitizeForOutput,
    prompts: {
      extractionSystemPrompt,
      questionSystemPrompt,
      recommendationSystemPrompt,
      phrasingUserMessage,
    },
    allowedBrands: BUSINESS.brands,
    signal: request.signal,
  });

  try {
    const result = await advisor.runTurn({ message, state: priorState });
    console.log(
      `[advisor] status=${result.status} turn=${result.state.turnCount} ` +
        `interventions=${result.guardrailInterventions.join("|") || "none"}`
    );
    return NextResponse.json(result, { status: 200 });
  } catch {
    // Any unexpected failure still returns a typed, safe response — never a
    // stack trace, never a provider message, never an invented recommendation.
    console.log("[advisor] status=ADVISOR_UNAVAILABLE reason=unhandled");
    return NextResponse.json(unavailable("provider-unavailable", priorState), {
      status: 200,
    });
  }
}
