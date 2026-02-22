"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import AnimateIn from "@/components/craig/AnimateIn";

// ── Icons ──────────────────────────────────────────────────────────────────
function WaveformIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="12" width="2" height="8" rx="1" fill="#C9A84C" />
      <rect x="5" y="8" width="2" height="16" rx="1" fill="#C9A84C" />
      <rect x="9" y="4" width="2" height="24" rx="1" fill="#C9A84C" />
      <rect x="13" y="10" width="2" height="12" rx="1" fill="#C9A84C" />
      <rect x="17" y="6" width="2" height="20" rx="1" fill="#C9A84C" />
      <rect x="21" y="10" width="2" height="12" rx="1" fill="#C9A84C" />
      <rect x="25" y="8" width="2" height="16" rx="1" fill="#C9A84C" />
      <rect x="29" y="12" width="2" height="8" rx="1" fill="#C9A84C" />
    </svg>
  );
}

function CertBadgeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="14" r="9" stroke="#C9A84C" strokeWidth="1.5" />
      <path d="M11 14l3 3 6-6" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 22l-2 6 8-3 8 3-2-6" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function FilmFrameIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="28" height="20" rx="2" stroke="#C9A84C" strokeWidth="1.5" />
      <rect x="2" y="10" width="5" height="12" rx="0" stroke="#C9A84C" strokeWidth="1.5" />
      <rect x="25" y="10" width="5" height="12" rx="0" stroke="#C9A84C" strokeWidth="1.5" />
      <line x1="9" y1="6" x2="9" y2="26" stroke="#C9A84C" strokeWidth="1" />
      <line x1="23" y1="6" x2="23" y2="26" stroke="#C9A84C" strokeWidth="1" />
      <rect x="12" y="12" width="8" height="8" rx="1" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Pillar Card ────────────────────────────────────────────────────────────
interface PillarCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  delay?: number;
}

function PillarCard({ icon, title, body, href, delay = 0 }: PillarCardProps) {
  return (
    <AnimateIn delay={delay} direction="up">
      <Link href={href} className="block group h-full">
        <div
          className="cinema-card relative p-8 md:p-10 h-full cursor-pointer"
          style={{ borderTop: "1px solid #C9A84C" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
          />
          <div className="mb-6">{icon}</div>
          <h3
            className="font-serif text-pearl mb-4 font-light"
            style={{ fontSize: "1.625rem", letterSpacing: "-0.01em" }}
          >
            {title}
          </h3>
          <p className="text-mist text-sm leading-relaxed font-sans mb-6" style={{ lineHeight: "1.75" }}>
            {body}
          </p>
          <span className="text-link-gold text-xs uppercase tracking-widest" style={{ letterSpacing: "0.14em" }}>
            Explore <ArrowRight />
          </span>
        </div>
      </Link>
    </AnimateIn>
  );
}

// ── Testimonial ────────────────────────────────────────────────────────────
function TestimonialItem({ quote, delay }: { quote: string; delay?: number }) {
  return (
    <AnimateIn delay={delay} direction="up">
      <div className="text-center px-4 py-8 md:px-8">
        <div className="quote-mark mb-2">&ldquo;</div>
        <p
          className="font-serif italic text-pearl/90"
          style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.625rem)", lineHeight: "1.5", fontWeight: 300 }}
        >
          {quote}
        </p>
      </div>
    </AnimateIn>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section
      ref={heroRef}
      className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden"
    >
      {/* Cinematic background */}
      <motion.div style={{ y: yParallax }} className="absolute inset-[-15%] z-0">
        <Image
          src="/craig-hero.png"
          alt="Craig Abplanalp"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 50% at 50% 20%, rgba(201,168,76,0.04) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 50% 15%, rgba(201,168,76,0.06) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="absolute inset-y-0 left-0 w-1/4"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-1/4"
          style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
        />
      </motion.div>

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.95) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="gold-divider mb-8"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-gold uppercase tracking-widest text-xs font-sans mb-8"
          style={{ letterSpacing: "0.28em" }}
        >
          Craig Abplanalp
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-serif text-pearl font-light mb-8 text-balance"
          style={{ fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
        >
          Some people buy home theaters.
          <br />
          <span className="italic">A few pursue something else entirely.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: "easeOut" }}
          className="text-mist font-sans mb-12 max-w-xl mx-auto"
          style={{ fontSize: "1.0625rem", lineHeight: "1.7", letterSpacing: "0.01em" }}
        >
          Craig Abplanalp has spent four decades building the difference.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/contact" className="btn-gold-solid">
            Start a Conversation
          </Link>
          <Link href="/philosophy" className="btn-gold">
            The Philosophy <ArrowRight />
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 scroll-indicator"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-mist/50 uppercase tracking-widest font-sans" style={{ fontSize: "0.55rem", letterSpacing: "0.25em" }}>
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-mist/30 to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* THREE PILLARS */}
      <section className="bg-void section-padding border-t border-slate/30">
        <div className="craig-container">
          <AnimateIn>
            <div className="text-center mb-16 md:mb-20">
              <p className="text-gold uppercase tracking-widest font-sans mb-4" style={{ fontSize: "0.7rem", letterSpacing: "0.24em" }}>
                The Foundation
              </p>
              <h2
                className="font-serif text-pearl font-light"
                style={{ fontSize: "clamp(1.875rem, 4vw, 3.25rem)", letterSpacing: "-0.01em" }}
              >
                Forty Years. One Standard.
              </h2>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              icon={<WaveformIcon />}
              title="The Philosophy"
              body="Zero compromise. Always. A belief system built over four decades that has never wavered. The world's finest audio brands. The most ambitious residential projects. One unbroken standard."
              href="/philosophy"
              delay={0}
            />
            <PillarCard
              icon={<CertBadgeIcon />}
              title="The Expertise"
              body="THX certified. Trinnov trained. CEDIA board member. Forty years at the absolute frontier — from Audio Associates and Sound Components to building one of the Pacific Northwest's most respected firms."
              href="/expertise"
              delay={0.1}
            />
            <PillarCard
              icon={<FilmFrameIcon />}
              title="The Work"
              body="Seven-figure residential projects. Reference-level results every time. The kind of work that earns editorial coverage in TechRadar and recognition at CEDIA Best of Show."
              href="/work"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ORIGIN STORY TEASER */}
      <section className="relative py-28 md:py-40 overflow-hidden" style={{ background: "#0d0d0d" }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, #C9A84C, transparent 70%)" }}
        />
        <div className="craig-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn>
              <div className="flex items-center justify-center gap-6 mb-10">
                <div className="gold-divider" style={{ width: "40px" }} />
                <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                  Origin
                </span>
                <div className="gold-divider" style={{ width: "40px" }} />
              </div>
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <blockquote
                className="pull-quote text-pearl mb-10"
                style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)", lineHeight: "1.7" }}
              >
                &ldquo;In the late 1990s, Craig was driving Wilson Audio Grand Slams with dedicated
                Mark Levinson No.&nbsp;33 Monoblocks &mdash; one amplifier per speaker &mdash;
                in a home theater at a time when most people had never heard the term.&rdquo;
              </blockquote>
            </AnimateIn>
            <AnimateIn delay={0.2}>
              <div className="gold-divider mb-10" />
              <Link href="/philosophy" className="text-link-gold uppercase" style={{ letterSpacing: "0.15em", fontSize: "0.75rem" }}>
                Read the full story <ArrowRight />
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ASCENDO FEATURE */}
      <section className="section-padding" style={{ background: "#111111" }}>
        <div className="craig-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Image side */}
            <AnimateIn direction="left">
              <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#1a1a1a" }}>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)" }}
                >
                  <div className="relative w-48 h-48 md:w-64 md:h-64">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="absolute inset-0 rounded-full border"
                        style={{ borderColor: `rgba(201,168,76,${0.15 - i * 0.03})`, transform: `scale(${i * 0.28 + 0.16})` }}
                      />
                    ))}
                    <div
                      className="absolute inset-[35%] rounded-full"
                      style={{
                        background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.05) 60%, transparent 100%)",
                        border: "1px solid rgba(201,168,76,0.3)",
                      }}
                    />
                    <div className="absolute inset-[46%] rounded-full" style={{ background: "#C9A84C" }} />
                  </div>
                </div>
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, rgba(10,10,10,0.4) 0%, transparent 50%)" }}
                />
                <div className="absolute bottom-6 left-6">
                  <span className="text-mist/60 uppercase tracking-widest font-sans" style={{ fontSize: "0.6rem", letterSpacing: "0.25em" }}>
                    Ascendo Immersive Audio
                  </span>
                </div>
              </div>
            </AnimateIn>

            {/* Text side */}
            <AnimateIn direction="right" delay={0.15}>
              <div>
                <p className="text-gold uppercase tracking-widest font-sans mb-5" style={{ fontSize: "0.7rem", letterSpacing: "0.24em" }}>
                  Current Partnership
                </p>
                <h2
                  className="font-serif text-pearl font-light mb-8 leading-tight"
                  style={{ fontSize: "clamp(1.875rem, 4vw, 3rem)", letterSpacing: "-0.01em" }}
                >
                  The Instrument Has Evolved.
                  <br />
                  <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>The Standard Hasn&rsquo;t.</span>
                </h2>
                <div className="space-y-5 text-mist font-sans leading-relaxed" style={{ fontSize: "0.9375rem", lineHeight: "1.8" }}>
                  <p>
                    After decades working with the world&rsquo;s finest audio brands &mdash; Mark Levinson,
                    Wilson Audio, Revel, Wisdom Audio, Kaleidescape &mdash; Craig has found in Ascendo
                    Immersive Audio the most complete expression of everything he has pursued.
                  </p>
                  <p>
                    Infrasonic bass that pressurizes the room. Coaxial precision that places every
                    sound exactly where it belongs. Reference-level immersion without compromise.
                  </p>
                  <p style={{ color: "rgba(245,245,245,0.85)" }}>Not marketing. Physics.</p>
                </div>
                <div className="mt-10">
                  <Link href="/work" className="text-link-gold uppercase" style={{ letterSpacing: "0.15em", fontSize: "0.75rem" }}>
                    Discover what&rsquo;s possible <ArrowRight />
                  </Link>
                </div>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 relative overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)" }}
        />
        <div className="craig-container">
          <AnimateIn>
            <div className="text-center mb-12">
              <p className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.25em" }}>
                Client Experiences
              </p>
            </div>
          </AnimateIn>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate">
            <TestimonialItem quote="I didn&rsquo;t know this was possible." delay={0} />
            <TestimonialItem quote="It stopped being sound. It became physical." delay={0.1} />
            <TestimonialItem quote="Nothing has been the same since." delay={0.2} />
          </div>
          <AnimateIn delay={0.3}>
            <div className="text-center mt-14">
              <Link href="/contact" className="btn-gold">
                Begin the Conversation <ArrowRight />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* CREDENTIALS STRIP */}
      <section className="py-12 border-t border-b border-slate/50" style={{ background: "#111111" }}>
        <div className="craig-container">
          <AnimateIn direction="none">
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {["THX Level 1 & 2 Certified", "Trinnov Optimizer Certified", "CEDIA RP22 Certified", "CEDIA Board Member", "40+ Years Experience", "Ascendo Authorized"].map((cred) => (
                <div key={cred} className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-gold" />
                  <span className="text-mist font-sans uppercase tracking-widest" style={{ fontSize: "0.65rem", letterSpacing: "0.18em" }}>
                    {cred}
                  </span>
                </div>
              ))}
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 md:py-40" style={{ background: "#0a0a0a" }}>
        <div className="craig-container text-center">
          <AnimateIn>
            <div className="gold-divider mb-10" />
            <h2
              className="font-serif text-pearl font-light mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.02em", lineHeight: "1.15" }}
            >
              Ready to pursue
              <br />
              <span className="italic" style={{ color: "rgba(201,168,76,0.9)" }}>something extraordinary?</span>
            </h2>
            <p className="text-mist font-sans mb-12 max-w-lg mx-auto" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
              Reference-level immersive audio begins with a conversation. No sales pitch. Just
              an honest discussion about what&rsquo;s possible and whether it&rsquo;s right for your space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-gold-solid">
                Start a Conversation
              </Link>
              <Link href="/expertise" className="btn-gold">
                Explore the Expertise
              </Link>
            </div>
            <div className="gold-divider mt-10" />
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
