"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export default function PageHero({ title, subtitle, eyebrow }: PageHeroProps) {
  return (
    <section className="relative bg-void pt-40 pb-24 md:pt-48 md:pb-32 overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Gold accent line — top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }}
      />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-5"
        style={{ background: "radial-gradient(ellipse, #C9A84C, transparent 70%)" }}
      />

      <div className="craig-container relative z-10 text-center">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-gold uppercase tracking-widest text-xs font-sans mb-6"
            style={{ letterSpacing: "0.25em" }}
          >
            {eyebrow}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="gold-divider mb-8"
        />

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-serif text-pearl font-light leading-tight"
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)", letterSpacing: "-0.02em" }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
            className="text-mist font-sans mt-6 max-w-xl mx-auto leading-relaxed"
            style={{ fontSize: "1.0625rem" }}
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="gold-divider mt-8"
        />
      </div>
    </section>
  );
}
