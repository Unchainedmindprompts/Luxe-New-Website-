/**
 * Luxe Window Advisor — where a turn actually spends its time.
 *
 * WRITTEN BEFORE ANY OPTIMISATION, ON PURPOSE. "Two model calls, roughly five
 * seconds each" was an assumption from watching output scroll past, and an
 * assumption is a poor thing to rebuild an architecture around. This makes the
 * question answerable: which stage, how long, how many provider calls, and did
 * anything fall back.
 *
 * SHAPE ONLY, NEVER CONTENT. A trace carries durations, counts, a route name
 * and a boolean — no message text, no facts, no prose. It is safe to log in
 * production because there is nothing in it worth protecting, and it is dropped
 * at the client boundary because `toAdvisorTurn` does not know the field exists.
 *
 * `now` is injected rather than imported so this stays a pure function of its
 * inputs like everything else in the reasoning path, and so tests can drive it
 * with a fake clock instead of sleeping.
 */

export type TraceStage =
  | "extraction"
  | "retrieval"
  | "assessment"
  | "counterfactual"
  | "phrasing"
  | "phrasing-retry";

export interface TurnTrace {
  /** Which branch answered. Names the behaviour, not the customer. */
  route:
    | "fast-answer"
    | "brand-answer"
    | "answer"
    | "unknown"
    | "discovery"
    | "question"
    | "guidance"
    | "recommendation"
    | "unavailable";
  /** Milliseconds per stage. Absent stages did not run. */
  readonly stages: Record<string, number>;
  /** Provider round trips. The number this phase exists to reduce. */
  providerCalls: number;
  /** True when the reply came from deterministic text rather than the model. */
  deterministic: boolean;
  /** True when a guardrail forced a regeneration or a fallback. */
  fellBack: boolean;
  totalMs: number;
}

export interface Trace {
  readonly mark: <T>(stage: TraceStage, work: () => Promise<T>) => Promise<T>;
  readonly countProviderCall: () => void;
  readonly setRoute: (route: TurnTrace["route"]) => void;
  readonly setDeterministic: () => void;
  readonly setFellBack: () => void;
  readonly done: () => TurnTrace;
}

/** A trace that measures nothing, for callers that do not want the overhead. */
export const NO_TRACE: Trace = {
  mark: async (_stage, work) => work(),
  countProviderCall: () => undefined,
  setRoute: () => undefined,
  setDeterministic: () => undefined,
  setFellBack: () => undefined,
  done: () => ({ route: "unavailable", stages: {}, providerCalls: 0, deterministic: false, fellBack: false, totalMs: 0 }),
};

export function createTrace(now: () => number): Trace {
  const started = now();
  const stages: Record<string, number> = {};
  let route: TurnTrace["route"] = "unavailable";
  let providerCalls = 0;
  let deterministic = false;
  let fellBack = false;

  return {
    async mark(stage, work) {
      const at = now();
      try {
        return await work();
      } finally {
        // Accumulated, not overwritten: a retry is a second phrasing call and
        // the total is what the customer waited for.
        stages[stage] = (stages[stage] ?? 0) + (now() - at);
      }
    },
    countProviderCall: () => {
      providerCalls += 1;
    },
    setRoute: (value) => {
      route = value;
    },
    setDeterministic: () => {
      deterministic = true;
    },
    setFellBack: () => {
      fellBack = true;
    },
    done: () => ({
      route,
      stages,
      providerCalls,
      deterministic,
      fellBack,
      totalMs: now() - started,
    }),
  };
}

/** One line, no customer content, for a server log. */
export function formatTrace(trace: TurnTrace): string {
  const stages = Object.entries(trace.stages)
    .map(([stage, ms]) => `${stage}=${Math.round(ms)}ms`)
    .join(" ");
  return `[ADVISOR_TURN] route=${trace.route} total=${Math.round(trace.totalMs)}ms calls=${trace.providerCalls}${
    trace.deterministic ? " deterministic" : ""
  }${trace.fellBack ? " fellback" : ""} ${stages}`.trim();
}
