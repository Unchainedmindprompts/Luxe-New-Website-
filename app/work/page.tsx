import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/craig/PageHero";
import AnimateIn from "@/components/craig/AnimateIn";

export const metadata: Metadata = {
  title: "The Work",
  description:
    "Seven-figure residential projects. Reference-level results. CEDIA recognized. TechRadar featured. The work of Craig Abplanalp.",
  openGraph: {
    title: "The Work | Craig Abplanalp",
    description: "Seven-figure residential projects. Reference-level results. The work speaks for itself.",
  },
};

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 2.5H2.5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-3M8.5 1.5h4m0 0v4m0-4l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Theater visualization component
function TheaterViz({ variant }: { variant: 1 | 2 | 3 | 4 }) {
  const configs = {
    1: { seats: 12, screen: "wide", aspect: "panoramic" },
    2: { seats: 8, screen: "standard", aspect: "classic" },
    3: { seats: 16, screen: "ultra-wide", aspect: "stadium" },
    4: { seats: 6, screen: "standard", aspect: "intimate" },
  };

  const gradients = {
    1: "linear-gradient(135deg, #0c0907 0%, #1a1408 40%, #0c0907 100%)",
    2: "linear-gradient(135deg, #0a0c0f 0%, #111820 40%, #0a0c0f 100%)",
    3: "linear-gradient(135deg, #0d0a08 0%, #1c140a 40%, #0d0a08 100%)",
    4: "linear-gradient(135deg, #0a0a0c 0%, #141218 40%, #0a0a0c 100%)",
  };

  const screenGlows = {
    1: "rgba(201,168,76,0.08)",
    2: "rgba(100,120,160,0.06)",
    3: "rgba(201,168,76,0.06)",
    4: "rgba(140,100,80,0.06)",
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-between p-8 md:p-12"
      style={{ background: gradients[variant] }}
    >
      {/* Screen */}
      <div className="relative w-full flex-shrink-0" style={{ height: "38%" }}>
        <div
          className="absolute inset-0 rounded-sm"
          style={{
            background: `linear-gradient(180deg, ${screenGlows[variant]} 0%, transparent 100%)`,
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        />
        {/* Screen glow effect */}
        <div
          className="absolute inset-x-0 bottom-0 h-16"
          style={{ background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${screenGlows[variant]}, transparent)` }}
        />
        {/* Screen surface lines */}
        {[1, 2, 3].map((l) => (
          <div
            key={l}
            className="absolute inset-x-0 h-px"
            style={{ top: `${l * 30}%`, background: `rgba(201,168,76,${0.04 - l * 0.01})` }}
          />
        ))}
      </div>

      {/* Seating rows */}
      <div className="w-full flex flex-col gap-2 mt-6">
        {[3, 4, 5].map((seats, row) => (
          <div key={row} className="flex justify-center gap-2">
            {Array.from({ length: seats }).map((_, s) => (
              <div
                key={s}
                className="rounded-sm"
                style={{
                  width: "18px",
                  height: "12px",
                  background: "rgba(201,168,76,0.12)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Floor glow */}
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
      />
    </div>
  );
}

const projects = [
  {
    variant: 1 as const,
    location: "Pacific Northwest Residence",
    tag: "Ascendo Immersive Audio",
    headline: "Purpose-Built for Reference",
    description:
      "A dedicated theater conceived from the ground up around Ascendo Immersive Audio. Infrasonic bass calibrated to pressurize the room from 3Hz. Trinnov Altitude processing for surgical acoustic correction. Every seat a reference position. This is what zero compromise looks like when money is not the limiting factor — vision is.",
    specs: ["Ascendo Immersive Audio", "Trinnov Altitude Processing", "3Hz Infrasonic Capability", "Full Room Calibration"],
  },
  {
    variant: 2 as const,
    location: "Eastside Seattle Estate",
    tag: "Music & Cinema Unified",
    headline: "One Room. Two Disciplines. Zero Compromise.",
    description:
      "The original proof of concept made manifest in a modern residence. Reference two-channel music reproduction coexisting with full Dolby Atmos cinema — not as a compromise between the two, but as a demonstration that at sufficient levels of expertise, the conflict simply disappears.",
    specs: ["Dolby Atmos & DTS:X", "Reference Two-Channel Music", "Wilson Audio Main Speakers", "Mark Levinson Amplification"],
  },
  {
    variant: 3 as const,
    location: "Medina Waterfront Estate",
    tag: "CEDIA Recognized",
    headline: "Stadium Scale in a Private Residence",
    description:
      "An immersive audio installation of a scale rarely seen outside commercial cinema. Nineteen channels of processing. Infrasonic capability below human hearing threshold. A system that doesn't reproduce a film — it recreates the physical experience of being inside it.",
    specs: ["19-Channel Immersive Audio", "Commercial Cinema Scale", "Below 20Hz Infrasonic", "CEDIA Best of Show Recognition"],
  },
  {
    variant: 4 as const,
    location: "Bellevue Private Residence",
    tag: "Intimate Reference",
    headline: "The Intimacy of a Recording Studio",
    description:
      "For the client who understood that reference-level audio doesn't require a stadium — it requires precision. A dedicated two-seat listening room with acoustic treatment, Kaleidescape media storage, and calibration that achieves what few systems in the world can: absolute transparency.",
    specs: ["Kaleidescape Cinema System", "Acoustic Treatment Design", "Studio-Reference Calibration", "Wisdom Audio Speakers"],
  },
];

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="The Work"
        title="Results That Speak."
        subtitle="Seven figures. Zero compromises. Client confidentiality is respected — what follows represents the caliber of work, not its specifics."
      />

      {/* PROJECTS */}
      <section className="section-padding" style={{ background: "#0d0d0d" }}>
        <div className="craig-container">
          <AnimateIn>
            <div className="flex items-center gap-6 mb-16">
              <div className="gold-divider-left" />
              <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                Selected Projects
              </span>
            </div>
          </AnimateIn>

          <div className="space-y-8">
            {projects.map((project, i) => (
              <AnimateIn key={project.location} delay={i * 0.1} direction="up">
                <div className="cinema-card overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Theater visualization */}
                    <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[320px] overflow-hidden">
                      <TheaterViz variant={project.variant} />
                      {/* Tag overlay */}
                      <div className="absolute top-5 left-5 z-10">
                        <span
                          className="inline-block bg-void/80 backdrop-blur-sm border border-gold/30 text-gold font-sans uppercase tracking-widest px-3 py-1"
                          style={{ fontSize: "0.6rem", letterSpacing: "0.18em" }}
                        >
                          {project.tag}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 flex flex-col justify-between">
                      <div>
                        <p
                          className="text-mist/70 font-sans uppercase tracking-widest mb-3"
                          style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
                        >
                          {project.location}
                        </p>
                        <h3
                          className="font-serif text-pearl font-light mb-5"
                          style={{ fontSize: "clamp(1.375rem, 2.5vw, 1.875rem)", letterSpacing: "-0.01em", lineHeight: "1.3" }}
                        >
                          {project.headline}
                        </h3>
                        <p className="text-mist font-sans leading-relaxed mb-8" style={{ fontSize: "0.9375rem", lineHeight: "1.8" }}>
                          {project.description}
                        </p>
                      </div>

                      {/* Specs */}
                      <div className="border-t border-slate pt-6">
                        <div className="flex flex-wrap gap-2">
                          {project.specs.map((spec) => (
                            <span
                              key={spec}
                              className="text-mist/70 border border-slate font-sans px-3 py-1"
                              style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS SECTION */}
      <section className="section-padding" style={{ background: "#111111" }}>
        <div className="craig-container">
          <AnimateIn>
            <div className="flex items-center gap-6 mb-16">
              <div className="gold-divider-left" />
              <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                Recognition
              </span>
            </div>
            <h2
              className="font-serif text-pearl font-light mb-10"
              style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}
            >
              When the Work Is Remarkable,
              <br />
              <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>People Notice</span>
            </h2>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* TechRadar feature */}
            <AnimateIn delay={0.1}>
              <a
                href="https://definitive.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block cinema-card p-8 group"
              >
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="text-gold/60 font-sans uppercase tracking-widest"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
                  >
                    TechRadar
                  </span>
                  <span className="text-mist/40 group-hover:text-gold/60 transition-colors duration-300">
                    <ExternalLinkIcon />
                  </span>
                </div>
                <h3 className="font-serif text-pearl font-light mb-4" style={{ fontSize: "1.375rem", lineHeight: "1.3" }}>
                  Dream Home Cinemas Feature
                </h3>
                <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.8" }}>
                  Definitive Audio&rsquo;s work — shaped by Craig&rsquo;s vision and execution —
                  featured among the world&rsquo;s premier residential cinema installations in
                  TechRadar&rsquo;s editorial coverage of dream home theaters.
                </p>
              </a>
            </AnimateIn>

            {/* CEDIA recognition */}
            <AnimateIn delay={0.15}>
              <div className="cinema-card p-8">
                <div className="mb-5">
                  <span
                    className="text-gold/60 font-sans uppercase tracking-widest"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
                  >
                    CEDIA
                  </span>
                </div>
                <h3 className="font-serif text-pearl font-light mb-4" style={{ fontSize: "1.375rem", lineHeight: "1.3" }}>
                  Best of Show Recognition
                </h3>
                <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.8" }}>
                  CEDIA Best of Show recognition represents the highest peer-evaluated standard
                  in the custom electronics industry. This is not a manufacturer award. It is
                  the industry saying: this is what the work should look like.
                </p>
              </div>
            </AnimateIn>

            {/* Definitive link */}
            <AnimateIn delay={0.2}>
              <a
                href="https://definitive.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block cinema-card p-8 group md:col-span-2"
              >
                <div className="flex items-start justify-between mb-5">
                  <span
                    className="text-gold/60 font-sans uppercase tracking-widest"
                    style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
                  >
                    Definitive Audio
                  </span>
                  <span className="text-mist/40 group-hover:text-gold/60 transition-colors duration-300">
                    <ExternalLinkIcon />
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="font-serif text-pearl font-light mb-4" style={{ fontSize: "1.375rem", lineHeight: "1.3" }}>
                      Pacific Northwest&rsquo;s Premier Audio Destination
                    </h3>
                    <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.8" }}>
                      For 25 years, Craig built Definitive Audio into one of the most respected
                      high-end audio and custom installation companies in the region. The blog,
                      the press coverage, the client work — all of it lives at definitive.com.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-gold font-sans uppercase tracking-widest"
                      style={{ fontSize: "0.75rem", letterSpacing: "0.16em" }}
                    >
                      Visit Definitive Audio
                    </span>
                    <ArrowRight />
                  </div>
                </div>
              </a>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* WHAT MAKES IT DIFFERENT */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, #C9A84C, transparent 70%)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)" }}
        />
        <div className="craig-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <p
                className="text-gold uppercase tracking-widest font-sans mb-8"
                style={{ fontSize: "0.65rem", letterSpacing: "0.25em" }}
              >
                The Difference
              </p>
              <h2
                className="font-serif text-pearl font-light mb-8"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", lineHeight: "1.15" }}
              >
                Why the Results Look
                <br />
                <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>the Way They Do</span>
              </h2>
              <p className="text-mist font-sans leading-relaxed mb-12" style={{ fontSize: "1.0625rem", lineHeight: "1.8", maxWidth: "600px", margin: "0 auto 3rem" }}>
                The results you see here are not produced by better equipment. Equipment is
                available to anyone with sufficient budget. These results are produced by
                four decades of accumulated knowledge about what it actually takes to achieve
                a reference-level experience in a real room for a real human being.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.15}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-14">
                {[
                  { label: "Vision", desc: "Knowing what's possible before the first conversation" },
                  { label: "Precision", desc: "Every measurement, every calibration, every seat" },
                  { label: "Standard", desc: "The same bar held in 1979, and today" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="gold-divider mb-4 mx-auto" />
                    <h4 className="font-serif text-pearl font-light mb-2" style={{ fontSize: "1.375rem" }}>
                      {item.label}
                    </h4>
                    <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.75" }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </AnimateIn>

            <AnimateIn delay={0.25}>
              <Link href="/contact" className="btn-gold-solid">
                Start a Conversation
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 border-t border-slate/50" style={{ background: "#0a0a0a" }}>
        <div className="craig-container text-center">
          <AnimateIn>
            <div className="max-w-2xl mx-auto">
              <div className="gold-divider mb-10" />
              <h3
                className="font-serif text-pearl font-light mb-6"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.01em" }}
              >
                Your room.
                <br />
                <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>This standard.</span>
              </h3>
              <p className="text-mist font-sans mb-10 leading-relaxed" style={{ fontSize: "1rem" }}>
                Every project begins the same way — with an honest conversation about what
                you&rsquo;re trying to achieve, what your space allows, and what it will take
                to get there.
              </p>
              <Link href="/contact" className="btn-gold-solid">
                Begin the Conversation
              </Link>
              <div className="gold-divider mt-10" />
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
