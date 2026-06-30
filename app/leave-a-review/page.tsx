import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Leave a Review — Luxe Window Works",
  description:
    "Did Luxe Window Works do a great job for you? A quick Google review helps the next North Idaho homeowner make a confident decision.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/leave-a-review",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LeaveAReviewPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-warm-white pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="container-luxe max-w-3xl text-center">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            Thank You
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
            Help the next North Idaho homeowner decide.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-gray-600 leading-relaxed">
            If we did right by you, a quick Google review is the single most
            useful thing you can do for us. It helps the next homeowner trying
            to figure out who to trust — exactly like you were before we showed up.
          </p>
        </div>
      </section>

      {/* Primary CTA */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="container-luxe max-w-2xl text-center">
          <a
            href={BUSINESS.google.mapsUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-dark text-white font-semibold px-10 py-5 rounded-full text-lg md:text-xl transition-all hover:shadow-xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Leave a Google Review
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="mt-4 text-sm text-warm-gray-500">
            Opens in a new tab. Takes about 60 seconds.
          </p>
        </div>
      </section>

      {/* What to mention prompts */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal text-center mb-8">
            Stuck on what to write? A few prompts.
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-center mb-10">
            You don&apos;t need to write much. One or two specifics is more useful to
            the next reader than a long paragraph. Here&apos;s what tends to be most
            helpful:
          </p>
          <ul className="space-y-4 text-warm-gray-600 leading-relaxed text-base md:text-lg">
            <li className="flex items-start gap-3">
              <span className="text-gold font-semibold mt-0.5 shrink-0">→</span>
              <span>
                <strong className="text-charcoal">What you had us do</strong> —
                cellular shades, plantation shutters, motorized exterior shades,
                a single tricky window, a whole house. Specifics help.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold font-semibold mt-0.5 shrink-0">→</span>
              <span>
                <strong className="text-charcoal">What surprised you</strong> —
                something we caught that you would&apos;ve missed, a product
                recommendation that turned out right, how the install actually
                went vs. how you expected it to go.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold font-semibold mt-0.5 shrink-0">→</span>
              <span>
                <strong className="text-charcoal">How they perform now</strong> —
                if it&apos;s been a few months or years, mention how the shades, shutters,
                or motorization are holding up. Future buyers really care about that.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gold font-semibold mt-0.5 shrink-0">→</span>
              <span>
                <strong className="text-charcoal">Where you are</strong> —
                Coeur d&apos;Alene, Post Falls, Hayden, Sandpoint, Rathdrum. Local
                buyers look for reviews from their town.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Fallback — email Mark directly */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="container-luxe max-w-2xl text-center">
          <h2 className="font-serif text-2xl text-charcoal mb-4">
            Not a Google user, or had an issue?
          </h2>
          <p className="text-warm-gray-600 leading-relaxed mb-6">
            If Google isn&apos;t for you — or if anything about the job wasn&apos;t
            right and we should fix it before any review goes anywhere public —
            email Mark directly. Honest feedback is how we get better.
          </p>
          <a
            href={`mailto:${BUSINESS.email}?subject=${encodeURIComponent("Feedback for Mark")}`}
            className="inline-flex items-center justify-center gap-2 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-semibold px-6 py-3 rounded-full transition-all"
          >
            Email Mark — {BUSINESS.email}
          </a>
        </div>
      </section>

      {/* Sign-off */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-2xl text-center">
          <p className="text-warm-gray-600 leading-relaxed text-lg italic">
            Thank you for the trust. Reviews are how a real local business
            survives next to the big franchises — and they only happen when
            customers like you take a minute. Genuinely appreciate it.
          </p>
          <p className="mt-6 font-serif text-2xl text-charcoal">— Mark</p>
          <p className="text-sm text-warm-gray-500 mt-1">
            Mark Abplanalp · Owner, Luxe Window Works · North Idaho
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="text-sm text-warm-gray-500 hover:text-gold transition-colors"
            >
              ← Back to luxewindowworks.com
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
