import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/craig/PageHero";
import AnimateIn from "@/components/craig/AnimateIn";

export const metadata: Metadata = {
  title: "The Philosophy",
  description:
    "Zero compromise. From the beginning. The story of how Craig Abplanalp spent four decades pursuing the impossible — and proved it wasn't.",
  openGraph: {
    title: "The Philosophy | Craig Abplanalp",
    description: "Zero compromise. From the beginning. Four decades of reference-level pursuit.",
  },
};

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PhilosophyPage() {
  return (
    <>
      <PageHero
        eyebrow="The Philosophy"
        title="Zero Compromise."
        subtitle="From the beginning. And every day since."
      />

      {/* ORIGIN STORY */}
      <section className="section-padding" style={{ background: "#0d0d0d" }}>
        <div className="craig-container">
          <div className="max-w-3xl mx-auto">

            <AnimateIn>
              <div className="flex items-center gap-6 mb-12">
                <div className="gold-divider-left" />
                <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                  The Origin
                </span>
              </div>
            </AnimateIn>

            <div className="space-y-8 font-sans text-pearl/80 leading-relaxed" style={{ fontSize: "1.0625rem", lineHeight: "1.85" }}>
              <AnimateIn delay={0.05}>
                <p>
                  In the late 1990s, Craig Abplanalp set out to answer a question the industry
                  hadn&rsquo;t yet asked.
                </p>
              </AnimateIn>

              <AnimateIn delay={0.1}>
                <p>
                  What would it look like to build a home environment with absolutely zero
                  compromise &mdash; where reference music reproduction and reference cinema
                  experience weren&rsquo;t competing priorities, but a single unified pursuit?
                </p>
              </AnimateIn>

              <AnimateIn delay={0.15}>
                <p style={{ color: "#F5F5F5" }}>Nobody was building that. Craig was.</p>
              </AnimateIn>

              <AnimateIn delay={0.2}>
                <div
                  className="my-12 p-8 md:p-10 border-l-2"
                  style={{ borderColor: "#C9A84C", background: "rgba(201,168,76,0.04)" }}
                >
                  <p
                    className="font-serif italic text-pearl"
                    style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)", lineHeight: "1.65" }}
                  >
                    The system he conceived used Wilson Audio Grand Slams as main front speakers
                    &mdash; among the most respected loudspeakers ever made &mdash; each driven
                    by its own dedicated Mark Levinson No.&nbsp;33 Monoblock. One amplifier.
                    One speaker. Zero shared power.
                  </p>
                </div>
              </AnimateIn>

              <AnimateIn delay={0.25}>
                <p>
                  Wilson Audio WATT/Puppies handled center and surround channels, driven by
                  multi-channel Mark Levinson amplification. Dual stacked Sony G90 CRT
                  projectors with Faroudja Line Quadrupler processing completed the picture.
                </p>
              </AnimateIn>

              <AnimateIn delay={0.3}>
                <p>
                  The total investment ran well into six figures &mdash; in 1990s dollars.
                </p>
              </AnimateIn>

              <AnimateIn delay={0.35}>
                <p>
                  This wasn&rsquo;t extravagance. It was a proof of concept. Craig wanted to
                  demonstrate that the artificial boundary between audiophile music reproduction
                  and cinematic immersion was just that &mdash; artificial. With the right
                  vision, the right tools, and an absolute refusal to compromise, a single
                  room could do both at the highest level in the world.
                </p>
              </AnimateIn>

              <AnimateIn delay={0.4}>
                <p style={{ color: "#F5F5F5", fontWeight: 500 }}>It could.</p>
              </AnimateIn>

              <AnimateIn delay={0.45}>
                <p>
                  That proof of concept became a philosophy. That philosophy became a career.
                  And that career &mdash; now spanning more than four decades &mdash; has never
                  once wavered from the original premise.
                </p>
              </AnimateIn>
            </div>

            {/* Pull quote break */}
            <AnimateIn delay={0.5}>
              <div className="my-16 md:my-24 text-center">
                <div className="gold-divider mb-8" />
                <blockquote
                  className="font-serif italic text-pearl"
                  style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", lineHeight: "1.4", letterSpacing: "-0.01em", fontWeight: 300 }}
                >
                  &ldquo;The tools have evolved.
                  <br />
                  The standard hasn&rsquo;t.&rdquo;
                </blockquote>
                <div className="gold-divider mt-8" />
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* WHAT ZERO COMPROMISE MEANS */}
      <section className="section-padding" style={{ background: "#111111" }}>
        <div className="craig-container">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <div className="flex items-center gap-6 mb-12">
                <div className="gold-divider-left" />
                <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                  The Principles
                </span>
              </div>
              <h2
                className="font-serif text-pearl font-light mb-10"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}
              >
                What Zero Compromise Actually Means
              </h2>
            </AnimateIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  number: "01",
                  title: "Physics Before Marketing",
                  body: "Every claim Craig makes is grounded in acoustics, mathematics, and verifiable measurement. When he says a room is calibrated, it is calibrated — not just voiced to sound pleasant during a demo.",
                },
                {
                  number: "02",
                  title: "Every Seat, Not Just the Sweet Spot",
                  body: "A truly great room doesn't have one perfect position and several acceptable ones. Every listening position should deliver the designer's intent — that's the standard Craig works to.",
                },
                {
                  number: "03",
                  title: "Integration Over Isolation",
                  body: "Music and cinema are not separate pursuits requiring separate rooms. Done correctly — with the right philosophy, components, and calibration — one room serves both at the highest level.",
                },
                {
                  number: "04",
                  title: "The Room Is Half the System",
                  body: "The most expensive loudspeakers in the world cannot overcome a poorly designed or treated space. Craig's philosophy starts with the room, not the equipment catalog.",
                },
              ].map((item, i) => (
                <AnimateIn key={item.number} delay={i * 0.1} direction="up">
                  <div className="cinema-card p-8 h-full">
                    <span
                      className="font-serif text-gold/30 block mb-4"
                      style={{ fontSize: "2.5rem", lineHeight: 1, fontWeight: 300 }}
                    >
                      {item.number}
                    </span>
                    <h3 className="font-serif text-pearl font-light mb-4" style={{ fontSize: "1.375rem" }}>
                      {item.title}
                    </h3>
                    <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.8" }}>
                      {item.body}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ASCENDO CONNECTION */}
      <section className="section-padding" style={{ background: "#0d0d0d" }}>
        <div className="craig-container">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <div className="flex items-center gap-6 mb-12">
                <div className="gold-divider-left" />
                <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                  Where It Leads
                </span>
              </div>
              <h2
                className="font-serif text-pearl font-light mb-8"
                style={{ fontSize: "clamp(1.875rem, 4vw, 2.75rem)", letterSpacing: "-0.01em" }}
              >
                The Most Complete Expression Yet
              </h2>
            </AnimateIn>

            <div className="space-y-7 font-sans text-pearl/80 leading-relaxed" style={{ fontSize: "1.0625rem", lineHeight: "1.85" }}>
              <AnimateIn delay={0.1}>
                <p>
                  Today, that same pursuit finds its most complete expression in Ascendo
                  Immersive Audio &mdash; a German manufacturer whose founding principles align
                  with Craig&rsquo;s own in ways that feel less like coincidence and more like
                  inevitability.
                </p>
              </AnimateIn>
              <AnimateIn delay={0.15}>
                <p>
                  Where others compromise, Ascendo chooses precision. Where others market myths,
                  Ascendo trusts science. And where others settle for good enough, Ascendo
                  &mdash; like Craig &mdash; refuses.
                </p>
              </AnimateIn>
              <AnimateIn delay={0.2}>
                <p>
                  Infrasonic bass that reproduces frequencies as low as 3Hz. Bass that
                  doesn&rsquo;t just play low &mdash; it pressurizes the room, makes a car chase
                  feel real, turns a thunderstorm into something you feel in your chest before
                  you consciously register it.
                </p>
              </AnimateIn>
              <AnimateIn delay={0.25}>
                <p
                  className="font-serif italic text-pearl"
                  style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.625rem)", lineHeight: "1.55" }}
                >
                  This is what zero compromise sounds like in 2026.
                </p>
              </AnimateIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA TRANSITION */}
      <section className="py-24 md:py-32 border-t border-slate/50" style={{ background: "#0a0a0a" }}>
        <div className="craig-container">
          <AnimateIn>
            <div className="max-w-2xl mx-auto text-center">
              <div className="gold-divider mb-10" />
              <h3
                className="font-serif text-pearl font-light mb-6"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.01em" }}
              >
                Forty years.{" "}
                <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>One unbroken standard.</span>
              </h3>
              <p className="text-mist font-sans mb-10 leading-relaxed" style={{ fontSize: "1rem" }}>
                Read about the expertise that turned philosophy into practice — the certifications,
                the relationships, and the career built on a single conviction.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/expertise" className="btn-gold-solid">
                  The Expertise
                </Link>
                <Link href="/contact" className="btn-gold">
                  Start a Conversation <ArrowRight />
                </Link>
              </div>
              <div className="gold-divider mt-10" />
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
