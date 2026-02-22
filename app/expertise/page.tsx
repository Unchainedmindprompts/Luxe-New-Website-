import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/craig/PageHero";
import AnimateIn from "@/components/craig/AnimateIn";

export const metadata: Metadata = {
  title: "The Expertise",
  description:
    "Forty years. One standard. THX certified. Trinnov trained. CEDIA board member. The credentials, relationships, and career of Craig Abplanalp.",
  openGraph: {
    title: "The Expertise | Craig Abplanalp",
    description: "Forty years. One standard. THX certified. Trinnov trained. CEDIA board member.",
  },
};

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="8.25" stroke="#C9A84C" strokeWidth="1.5" />
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const timeline = [
  {
    era: "1979–1993",
    title: "The Foundation",
    body: "Craig's journey began at Audio Associates in Laurel, Maryland — one of the finest high-end audio retailers of the era. It was here that the foundational belief took hold: that truly great sound wasn't a luxury, it was a pursuit. From there to Sound Advice and Sound Components in Coral Gables, Florida, each chapter deepened both the expertise and the conviction. These were the years when Craig learned not just what the best equipment could do, but what it demanded — the rooms, the calibration, the uncompromising attention that separates a system from an experience.",
  },
  {
    era: "1993–2018",
    title: "Building Something Extraordinary",
    body: "In 1993, Craig became Owner and President of Definitive Audio in Seattle — what would become one of the most respected high-end audio and custom installation companies in the Pacific Northwest. For 25 years as owner and president, he built not just a business but a reputation: for uncompromising performance, for solutions that worked, for clients who trusted him with their most ambitious projects. This is the era that produced the seven-figure residential theaters, the CEDIA recognition, and the deep industry relationships that would shape everything that followed.",
  },
  {
    era: "2018–Present",
    title: "The Next Frontier",
    body: "As Custom Sales Manager at Definitive Audio, Craig now focuses exclusively on what has always been his true passion — designing and delivering reference-level immersive audio experiences for clients who demand the absolute best. It is in this role that his partnership with Ascendo Immersive Audio has found its fullest expression, and where four decades of accumulated knowledge translate directly into results that simply cannot be replicated by less experienced hands.",
  },
];

const certifications = [
  {
    title: "THX Level 1 & 2 Certification",
    trainer: "Tomlinson Holman & Anthony Grimani",
    description: "Trained by the people who literally invented cinema sound standards. THX certification is the industry's gold standard for acoustic performance — and Craig holds both levels.",
  },
  {
    title: "Trinnov Optimizer Certified",
    trainer: "Arnaud Laborie, CEO of Trinnov",
    description: "Trained directly by the founder and CEO of Trinnov — the gold standard in immersive audio room correction and processing. This isn't a weekend course. It's mastery.",
  },
  {
    title: "CEDIA RP22 Immersive Audio Design",
    trainer: "Peter Aylett",
    description: "Trained by Peter Aylett in the industry's definitive recommended practice for immersive audio design — the framework that defines how properly engineered immersive systems are conceived and executed.",
  },
  {
    title: "CEDIA Board Member",
    trainer: "Custom Electronics Design & Installation Association",
    description: "Helped shape the standards the industry follows today. When Craig says something meets industry standards, he helped write those standards.",
  },
  {
    title: "HTSA Board Member",
    trainer: "Home Technology Specialists of America",
    description: "Active board-level participation in one of the industry's premier buying groups and knowledge-sharing organizations.",
  },
  {
    title: "PARA Board Member",
    trainer: "Professional Audio Retailers Association",
    description: "Long-standing engagement at the leadership level of specialty audio retail — a community that represents the finest audio dealers in North America.",
  },
];

const brands = [
  { name: "Wilson Audio", note: "Grand Slams, WATT/Puppy" },
  { name: "Mark Levinson", note: "No. 33 Monoblocks, multi-channel" },
  { name: "Ascendo", note: "Current partnership, immersive audio" },
  { name: "Revel", note: "Performa & Ultima series" },
  { name: "Wisdom Audio", note: "Planar magnetic systems" },
  { name: "Kaleidescape", note: "Cinema-grade video systems" },
  { name: "Trinnov", note: "Altitude room processing" },
  { name: "Sony", note: "Professional projectors" },
];

export default function ExpertisePage() {
  return (
    <>
      <PageHero
        eyebrow="The Expertise"
        title="Forty Years."
        subtitle="One standard — held without exception from 1979 to today."
      />

      {/* CAREER TIMELINE */}
      <section className="section-padding" style={{ background: "#0d0d0d" }}>
        <div className="craig-container">
          <AnimateIn>
            <div className="flex items-center gap-6 mb-16">
              <div className="gold-divider-left" />
              <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                The Journey
              </span>
            </div>
          </AnimateIn>

          <div className="max-w-4xl">
            <div className="relative">
              {/* Vertical timeline line */}
              <div
                className="absolute left-0 top-0 bottom-0 w-px hidden md:block"
                style={{ background: "linear-gradient(to bottom, transparent, #C9A84C 10%, #C9A84C 90%, transparent)" }}
              />

              <div className="space-y-0">
                {timeline.map((item, i) => (
                  <AnimateIn key={item.era} delay={i * 0.15} direction="up">
                    <div className="relative md:pl-14 pb-16 md:pb-20">
                      {/* Timeline dot */}
                      <div
                        className="hidden md:block absolute left-[-5px] top-2 w-[10px] h-[10px] rounded-full"
                        style={{ background: "#C9A84C", boxShadow: "0 0 12px rgba(201,168,76,0.4)" }}
                      />

                      <span
                        className="inline-block text-gold uppercase tracking-widest font-sans mb-3"
                        style={{ fontSize: "0.7rem", letterSpacing: "0.2em" }}
                      >
                        {item.era}
                      </span>
                      <h3
                        className="font-serif text-pearl font-light mb-5"
                        style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.01em" }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="text-mist font-sans leading-relaxed"
                        style={{ fontSize: "1rem", lineHeight: "1.85", maxWidth: "660px" }}
                      >
                        {item.body}
                      </p>
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section className="section-padding" style={{ background: "#111111" }}>
        <div className="craig-container">
          <AnimateIn>
            <div className="mb-16">
              <div className="flex items-center gap-6 mb-8">
                <div className="gold-divider-left" />
                <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                  Certifications
                </span>
              </div>
              <h2
                className="font-serif text-pearl font-light"
                style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}
              >
                Credentials That Cannot Be Faked
              </h2>
              <p className="text-mist font-sans mt-4 max-w-2xl" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
                These aren&rsquo;t marketing badges. They represent direct training from the people who invented
                the standards — the researchers, engineers, and technologists who defined what reference-level
                audio means.
              </p>
            </div>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certifications.map((cert, i) => (
              <AnimateIn key={cert.title} delay={i * 0.08} direction="up">
                <div className="cert-card p-8 h-full">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="mt-0.5 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <div>
                      <h3 className="font-serif text-pearl font-light" style={{ fontSize: "1.25rem", letterSpacing: "-0.005em" }}>
                        {cert.title}
                      </h3>
                      <p className="text-gold/70 font-sans text-xs mt-1 tracking-wide" style={{ fontSize: "0.75rem" }}>
                        {cert.trainer}
                      </p>
                    </div>
                  </div>
                  <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.8", paddingLeft: "2.25rem" }}>
                    {cert.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* KEY RELATIONSHIPS */}
      <section className="section-padding" style={{ background: "#0d0d0d" }}>
        <div className="craig-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* The Todd relationship */}
            <div>
              <AnimateIn>
                <div className="flex items-center gap-6 mb-10">
                  <div className="gold-divider-left" />
                  <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                    Trust Built Over Decades
                  </span>
                </div>
                <h2
                  className="font-serif text-pearl font-light mb-8"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", letterSpacing: "-0.01em" }}
                >
                  The Relationships That Define the Work
                </h2>
              </AnimateIn>
              <AnimateIn delay={0.1}>
                <div className="space-y-6 font-sans text-pearl/80 leading-relaxed" style={{ fontSize: "1rem", lineHeight: "1.85" }}>
                  <p>
                    Some of the most important credentials cannot be printed on a certificate.
                    Craig&rsquo;s 20+ year relationship with Todd Sutherland &mdash; spanning
                    the Madrigal/Mark Levinson era through Wisdom Audio, Kaleidescape, and now
                    Ascendo &mdash; represents something deeper than a business partnership.
                  </p>
                  <p>
                    It represents trust. The kind that accumulates when someone has seen your
                    work for two decades and still calls you first.
                  </p>
                  <p>
                    When the U.S. importer of Ascendo Immersive Audio has a client who demands
                    reference-level results in the Pacific Northwest, there is one person he
                    calls.
                  </p>
                  <p
                    className="font-serif italic text-pearl"
                    style={{ fontSize: "1.25rem", lineHeight: "1.55" }}
                  >
                    That says more than any certification.
                  </p>
                </div>
              </AnimateIn>
            </div>

            {/* Brand experience */}
            <div>
              <AnimateIn delay={0.1}>
                <div className="flex items-center gap-6 mb-10">
                  <div className="gold-divider-left" />
                  <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                    The Brands
                  </span>
                </div>
                <h3
                  className="font-serif text-pearl font-light mb-8"
                  style={{ fontSize: "clamp(1.375rem, 3vw, 2rem)", letterSpacing: "-0.01em" }}
                >
                  Four Decades of Working with the World&rsquo;s Best
                </h3>
              </AnimateIn>

              <div className="space-y-3">
                {brands.map((brand, i) => (
                  <AnimateIn key={brand.name} delay={i * 0.06} direction="left">
                    <div
                      className="flex items-center justify-between py-4 border-b"
                      style={{ borderColor: "rgba(42,42,42,0.8)" }}
                    >
                      <span className="font-serif text-pearl font-light" style={{ fontSize: "1.125rem" }}>
                        {brand.name}
                      </span>
                      <span className="text-mist font-sans text-xs tracking-wide" style={{ fontSize: "0.75rem" }}>
                        {brand.note}
                      </span>
                    </div>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE NUMBER */}
      <section
        className="py-24 md:py-32 relative overflow-hidden"
        style={{ background: "#111111" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(ellipse, #C9A84C, transparent 70%)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)" }}
        />
        <div className="craig-container relative z-10 text-center">
          <AnimateIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 max-w-3xl mx-auto">
              {[
                { number: "40+", label: "Years of Experience" },
                { number: "6", label: "Certifications & Board Roles" },
                { number: "1", label: "Unbroken Standard" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="font-serif text-gold font-light"
                    style={{ fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1 }}
                  >
                    {stat.number}
                  </div>
                  <p className="text-mist font-sans uppercase tracking-widest mt-3" style={{ fontSize: "0.7rem", letterSpacing: "0.2em" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-slate/50" style={{ background: "#0a0a0a" }}>
        <div className="craig-container text-center">
          <AnimateIn>
            <div className="max-w-2xl mx-auto">
              <div className="gold-divider mb-10" />
              <h3
                className="font-serif text-pearl font-light mb-6"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.01em" }}
              >
                Ready to see what expertise
                <br />
                <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>actually delivers?</span>
              </h3>
              <p className="text-mist font-sans mb-10 leading-relaxed" style={{ fontSize: "1rem" }}>
                Explore the work that this four-decade foundation has produced, or start a
                conversation directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/work" className="btn-gold-solid">
                  See the Work
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
