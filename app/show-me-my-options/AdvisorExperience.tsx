"use client";

/**
 * Luxe Window Advisor — the customer experience. (Phase C)
 *
 * THE AI IS NOT THE PRODUCT. Booked consultations are. Everything here is
 * shaped by that: the advisor understands the problem, offers one genuinely
 * useful thing, asks at most one question at a time, and makes getting someone
 * to the house the obvious next step.
 *
 * WHAT THIS DELIBERATELY IS NOT. No avatar, no bubble, no typing dots, no
 * robot, no assistant name, no provider branding. It reads as a page on a
 * premium window-treatment site that happens to answer back. A chatbot costume
 * would undercut the one thing the page is for.
 *
 * KNOWLEDGE STAYS IN THE TOOL BELT. The server returns a full assessment;
 * `toAdvisorTurn` narrows it to prose plus a handful of approved labels before
 * it reaches this file, so there is nothing here to accidentally render. No
 * ids, no rule names, no confidence, no provenance.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toAdvisorTurn, type AdvisorTurn, type OpaqueState } from "@/lib/advisor/client/contract";
import {
  advisorBookHandoff,
  advisorBookingClicked,
  advisorEngaged,
  advisorFallback,
  advisorGuidanceRendered,
  advisorRecommendationRendered,
  advisorStarted,
  advisorViewed,
} from "@/lib/advisor/client/analytics";

/** Mirrors the server's own limit so the visitor is told before the round trip. */
const MAX_MESSAGE_CHARS = 2000;

const BOOK_CTA = "Schedule My Free In-Home Consultation";

/**
 * For someone who does not know what to type. Phrased as real sentences a
 * homeowner might actually write, not as categories to pick from — the point
 * is to unblock, not to funnel them back into a questionnaire.
 */
const STARTERS = [
  "Our west-facing living room gets incredibly hot but we don't want to lose the view.",
  "We need the nursery much darker so the baby sleeps past sunrise.",
  "I think I want blinds, but I hate how much they block the window.",
] as const;

interface Exchange {
  readonly id: number;
  readonly from: "homeowner" | "luxe";
  readonly text: string;
  /** Present on Luxe turns that carry a recommendation panel. */
  readonly turn?: AdvisorTurn;
}

export default function AdvisorExperience() {
  const [draft, setDraft] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [state, setState] = useState<OpaqueState>({});
  const [pending, setPending] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [homeownerTurns, setHomeownerTurns] = useState(0);

  const liveRegion = useRef<HTMLDivElement>(null);
  const conversationEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);

  const started = exchanges.length > 0;
  const latest = [...exchanges].reverse().find((e) => e.from === "luxe")?.turn ?? null;

  useEffect(() => {
    advisorViewed();
  }, []);

  useEffect(() => {
    if (started) conversationEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [exchanges, pending, started]);

  const send = useCallback(
    async (text: string, entry: "typed" | "prompt") => {
      const message = text.trim();
      if (!message || pending) return;

      if (message.length > MAX_MESSAGE_CHARS) {
        setInputError(
          `That is a bit longer than we can take in one go — could you trim it to about ${MAX_MESSAGE_CHARS} characters?`
        );
        return;
      }

      setInputError(null);
      const turnNumber = homeownerTurns + 1;
      setHomeownerTurns(turnNumber);
      if (turnNumber === 1) advisorStarted(entry);
      // Engagement is the second message: the first reply has been read and
      // the visitor chose to keep going. See the note in analytics.ts.
      if (turnNumber === 2) advisorEngaged(turnNumber);

      setExchanges((prior) => [
        ...prior,
        { id: nextId.current++, from: "homeowner", text: message },
      ]);
      setDraft("");
      setPending(true);

      let turn: AdvisorTurn;
      try {
        const response = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, state }),
        });
        turn = toAdvisorTurn(await response.json().catch(() => null), state);
      } catch {
        turn = toAdvisorTurn(null, state);
      }

      setState(turn.state);
      setPending(false);

      if (turn.status === "ADVISOR_UNAVAILABLE") advisorFallback("turn-failed");
      if (turn.status === "GUIDANCE_READY") advisorGuidanceRendered(turnNumber);
      if (turn.status === "RECOMMENDATION_READY") advisorRecommendationRendered(turnNumber);

      const spoken = turn.message || FALLBACK_TEXT;
      setExchanges((prior) => [
        ...prior,
        { id: nextId.current++, from: "luxe", text: spoken, turn },
      ]);
      if (liveRegion.current) liveRegion.current.textContent = spoken;
      inputRef.current?.focus();
    },
    [homeownerTurns, pending, state]
  );

  return (
    <div className="bg-warm-white min-h-screen">
      <Opening onStart={(text) => send(text, "prompt")} started={started} />

      <div className="max-w-2xl mx-auto px-4 pb-20">
        {started && (
          <ol className="space-y-6" aria-label="Your conversation with Luxe Window Works">
            {exchanges.map((exchange) => (
              <li key={exchange.id}>
                {exchange.from === "homeowner" ? (
                  <HomeownerSaid text={exchange.text} />
                ) : (
                  <LuxeSaid exchange={exchange} turns={homeownerTurns} />
                )}
              </li>
            ))}
          </ol>
        )}

        {pending && <Thinking />}
        <div ref={conversationEnd} />

        {/* Announces each reply to screen readers without moving focus. */}
        <div ref={liveRegion} aria-live="polite" className="sr-only" />

        <Composer
          ref={inputRef}
          draft={draft}
          setDraft={setDraft}
          onSend={() => send(draft, "typed")}
          pending={pending}
          error={inputError}
          started={started}
        />

        {started && !pending && <ClosingBooking status={latest?.status ?? ""} turns={homeownerTurns} />}
      </div>
    </div>
  );
}

const FALLBACK_TEXT =
  "We could not work through that just now — but our team can go through it with you directly.";

/* ─────────────────────────── opening ─────────────────────────────────────── */

function Opening({ onStart, started }: { onStart: (text: string) => void; started: boolean }) {
  return (
    <header className="bg-charcoal text-white pt-28 pb-14 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">
          Free &middot; No Obligation
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          Find the Right Window Treatments for Your Home
        </h1>
        <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
          Answer a few questions and get personalized recommendations based on your home, your
          priorities, and how you actually use your windows.
        </p>

        {!started && (
          <>
            <div className="mt-8 text-left">
              <p className="text-white/60 text-sm mb-3">Not sure where to start? Try one of these:</p>
              <div className="space-y-2">
                {STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => onStart(starter)}
                    className="w-full text-left text-sm text-white/90 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/15 rounded-lg px-4 py-3 leading-snug transition-colors"
                  >
                    &ldquo;{starter}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* The consultation is the goal, not a fallback — so it is offered
                up front, on equal footing, never framed as opting out. */}
            <div className="mt-8 pt-8 border-t border-white/15">
              <BookLink placement="opening" status="opening" turns={0} variant="quiet" />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/* ─────────────────────────── conversation ────────────────────────────────── */

function HomeownerSaid({ text }: { text: string }) {
  return (
    <div className="ml-auto max-w-[85%] bg-charcoal text-white rounded-2xl rounded-br-sm px-4 py-3">
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function LuxeSaid({ exchange, turns }: { exchange: Exchange; turns: number }) {
  const turn = exchange.turn;
  const isRecommendation = turn?.status === "RECOMMENDATION_READY";

  return (
    <div className="max-w-[92%]">
      <p className="text-warm-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
        Luxe Window Works
      </p>
      <p className="text-charcoal text-base leading-relaxed whitespace-pre-wrap">{exchange.text}</p>

      {isRecommendation && turn && <RecommendationPanel turn={turn} turns={turns} />}

      {turn?.status === "GUIDANCE_READY" && turn.offerConsultation && (
        <div className="mt-5">
          <BookLink placement="guidance" status={turn.status} turns={turns} variant="quiet" />
        </div>
      )}

      {/* A turn that neither asks nor recommends would otherwise be a dead
          end: the visitor is told there is not enough to go on, with nothing
          to answer and nothing to click. Live testing found this happens for
          real, so the consultation is surfaced as the way forward. */}
      {turn?.status === "NEED_MORE_INFORMATION" && !turn.question && (
        <div className="mt-5">
          <BookLink placement="guidance" status={turn.status} turns={turns} variant="solid" />
        </div>
      )}

      {turn?.status === "ADVISOR_UNAVAILABLE" && (
        <div className="mt-5">
          <BookLink placement="fallback" status={turn.status} turns={turns} variant="solid" />
        </div>
      )}
    </div>
  );
}

/**
 * The recommendation.
 *
 * Deliberately not a dump of everything the engine produced: a direction, why
 * it fits, at most one tradeoff, and only the physical items Luxe genuinely
 * needs to see. `verify-dimensions` is filtered upstream because it is true of
 * every project and so tells this homeowner nothing.
 */
function RecommendationPanel({ turn, turns }: { turn: AdvisorTurn; turns: number }) {
  return (
    <section className="mt-6 border border-warm-gray-200 rounded-xl overflow-hidden bg-white">
      {turn.direction && (
        <div className="px-5 py-4 border-b border-warm-gray-200">
          <p className="text-warm-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">
            Recommended direction
          </p>
          <p className="font-serif text-xl text-charcoal">{turn.direction}</p>
        </div>
      )}

      {turn.whatMattersMost.length > 0 && (
        <div className="px-5 py-4 border-b border-warm-gray-200">
          <p className="text-warm-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
            What matters most
          </p>
          <ul className="text-charcoal text-sm space-y-1">
            {turn.whatMattersMost.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {turn.tradeoff && (
        <div className="px-5 py-4 border-b border-warm-gray-200">
          <p className="text-warm-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Worth knowing
          </p>
          <p className="text-charcoal text-sm leading-relaxed">{turn.tradeoff}</p>
        </div>
      )}

      {turn.confirmInHome.length > 0 && (
        <div className="px-5 py-4 border-b border-warm-gray-200">
          <p className="text-warm-gray-500 text-xs font-semibold uppercase tracking-widest mb-2">
            We&rsquo;ll confirm in your home
          </p>
          <ul className="text-charcoal text-sm space-y-1 list-disc pl-5">
            {turn.confirmInHome.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-5 bg-warm-white">
        <BookLink placement="recommendation" status={turn.status} turns={turns} variant="solid" />
        <p className="text-warm-gray-500 text-xs mt-3 leading-relaxed">
          Seeing the windows in the room is how we confirm fit, measure properly, and review fabrics
          in your home&rsquo;s actual light.
        </p>
      </div>
    </section>
  );
}

/**
 * Immediate, quiet feedback. Not a typing indicator pretending someone is
 * there — just a clear signal that the request is in flight, so nobody has to
 * wonder whether the page broke.
 */
function Thinking() {
  return (
    <p className="mt-6 text-warm-gray-500 text-sm" role="status">
      <span className="inline-block w-2 h-2 rounded-full bg-gold animate-pulse mr-2 align-middle" />
      Looking at what you&rsquo;ve described&hellip;
    </p>
  );
}

/* ─────────────────────────── composer ────────────────────────────────────── */

interface ComposerProps {
  draft: string;
  setDraft: (value: string) => void;
  onSend: () => void;
  pending: boolean;
  error: string | null;
  started: boolean;
}

function Composer({
  ref,
  draft,
  setDraft,
  onSend,
  pending,
  error,
  started,
}: ComposerProps & { ref: React.RefObject<HTMLTextAreaElement | null> }) {
  const tooLong = draft.length > MAX_MESSAGE_CHARS;

  return (
    <form
      className={started ? "mt-8" : "-mt-8 relative z-10"}
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <label htmlFor="advisor-input" className="block font-serif text-lg text-charcoal mb-3">
        {started ? "Anything else?" : "What's going on with your windows?"}
      </label>
      <textarea
        ref={ref}
        id="advisor-input"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSend();
          }
        }}
        rows={started ? 2 : 4}
        placeholder={
          started
            ? "Add anything that might matter…"
            : "Tell us about the room, the windows, and what's bothering you."
        }
        aria-describedby={error || tooLong ? "advisor-input-error" : undefined}
        aria-invalid={Boolean(error || tooLong)}
        className="w-full rounded-xl border border-warm-gray-300 bg-white px-4 py-3 text-charcoal text-base leading-relaxed placeholder:text-warm-gray-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
      />

      {(error || tooLong) && (
        <p id="advisor-input-error" className="mt-2 text-sm text-red-700">
          {error ??
            `That is about ${draft.length - MAX_MESSAGE_CHARS} characters longer than we can take in one go — could you trim it a little?`}
        </p>
      )}

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={pending || !draft.trim() || tooLong}
          className="bg-gold text-charcoal font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 focus:outline-none focus:ring-2 focus:ring-gold/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "One moment…" : started ? "Send" : "Find My Best Options"}
        </button>
        {!started && (
          <p className="text-warm-gray-500 text-sm">
            No contact details needed to get started.
          </p>
        )}
      </div>
    </form>
  );
}

/* ─────────────────────────── booking ─────────────────────────────────────── */

/**
 * The consultation link. Never labelled as skipping, escaping or opting out of
 * the advisor — booking is the goal, so it always reads as the next step
 * forward rather than a way around something.
 */
function BookLink({
  placement,
  status,
  turns,
  variant,
}: {
  placement: "opening" | "guidance" | "recommendation" | "fallback" | "footer";
  status: string;
  turns: number;
  variant: "solid" | "quiet";
}) {
  const className =
    variant === "solid"
      ? "inline-block bg-charcoal text-white font-semibold px-6 py-3 rounded-lg hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
      : "inline-block text-gold font-semibold underline underline-offset-4 hover:text-gold/80 focus:outline-none focus:ring-2 focus:ring-gold/40 rounded";

  return (
    <Link
      href="/book"
      className={className}
      onClick={() => {
        advisorBookingClicked(placement, status || "opening");
        advisorBookHandoff(turns, status || "opening");
      }}
    >
      {BOOK_CTA}
    </Link>
  );
}

/**
 * A single quiet booking link below the conversation.
 *
 * Suppressed while a recommendation panel is on screen, which already carries
 * a prominent one — repeating the CTA after every message reads as pressure,
 * and pressure is what makes people leave.
 */
function ClosingBooking({ status, turns }: { status: string; turns: number }) {
  if (status === "RECOMMENDATION_READY" || status === "ADVISOR_UNAVAILABLE") return null;
  return (
    <div className="mt-10 pt-6 border-t border-warm-gray-200 text-center">
      <BookLink placement="footer" status={status} turns={turns} variant="quiet" />
    </div>
  );
}
