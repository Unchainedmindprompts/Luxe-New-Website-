"use client";

import { useState } from "react";
import AnimateIn from "@/components/craig/AnimateIn";

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 4.5A1.5 1.5 0 014 3h2.5a1 1 0 01.95.684l1 3a1 1 0 01-.502 1.21l-1.13.565a11 11 0 005.224 5.224l.565-1.13a1 1 0 011.21-.502l3 1a1 1 0 01.684.949V16.5a1.5 1.5 0 01-1.5 1.5C7.306 18 2 12.694 2 6.5A4 4 0 012.5 4.5z" stroke="#C9A84C" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4.5" width="16" height="11" rx="1.5" stroke="#C9A84C" strokeWidth="1.4" />
      <path d="M2 7l8 5 8-5" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 11a3 3 0 100-6 3 3 0 000 6z" stroke="#C9A84C" strokeWidth="1.4" />
      <path d="M10 2a7 7 0 017 7c0 5.25-7 11-7 11S3 14.25 3 9a7 7 0 017-7z" stroke="#C9A84C" strokeWidth="1.4" />
    </svg>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", project: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="gold-divider mb-8" />
        <h3
          className="font-serif text-pearl font-light mb-4"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", letterSpacing: "-0.01em" }}
        >
          Message Received
        </h3>
        <p className="text-mist font-sans leading-relaxed mb-8" style={{ fontSize: "1rem", lineHeight: "1.75" }}>
          Craig will be in touch personally. He reads every inquiry himself — and responds to the ones he can genuinely help.
        </p>
        <div className="gold-divider" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="craig-label">Name *</label>
          <input
            type="text" required className="craig-input" placeholder="Your full name"
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="craig-label">Email *</label>
          <input
            type="email" required className="craig-input" placeholder="your@email.com"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="craig-label">
          Phone{" "}
          <span className="text-mist/40 ml-1 lowercase tracking-normal" style={{ fontSize: "0.65rem" }}>(optional)</span>
        </label>
        <input
          type="tel" className="craig-input" placeholder="Your phone number"
          value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="craig-label">Tell me about your project *</label>
        <textarea
          required className="craig-textarea"
          placeholder="What are you imagining? What space are you working with? What would reference-level mean to you? The more context you share, the better conversation we can have."
          value={formData.project} onChange={(e) => setFormData({ ...formData, project: e.target.value })}
        />
      </div>
      <div className="pt-2">
        <button
          type="submit" disabled={submitting} className="btn-gold-solid w-full sm:w-auto"
          style={{ justifyContent: "center" }}
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </div>
      <p className="text-mist/50 font-sans" style={{ fontSize: "0.75rem", lineHeight: "1.7" }}>
        No sales pressure. No forwarding to an assistant. Craig reads and responds personally.
      </p>
    </form>
  );
}

export default function ContactClient() {
  return (
    <>
      {/* MAIN CONTACT */}
      <section className="section-padding" style={{ background: "#0d0d0d" }}>
        <div className="craig-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">
            {/* Left */}
            <div className="lg:col-span-2">
              <AnimateIn direction="left">
                <div className="flex items-center gap-6 mb-10">
                  <div className="gold-divider-left" />
                  <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                    The Approach
                  </span>
                </div>
                <p className="font-sans text-pearl/80 leading-relaxed mb-8" style={{ fontSize: "1.0625rem", lineHeight: "1.85" }}>
                  Reference-level immersive audio begins with a conversation. There&rsquo;s no
                  sales pitch here &mdash; just an honest discussion about what&rsquo;s possible
                  and whether it&rsquo;s right for your space.
                </p>
                <p className="font-sans text-pearl/80 leading-relaxed mb-12" style={{ fontSize: "1.0625rem", lineHeight: "1.85" }}>
                  Some projects are right for this work. Some aren&rsquo;t. Craig will tell you
                  the truth either way, because the goal was never to sell a system &mdash;
                  it was always to deliver a result.
                </p>

                {/* Direct contact */}
                <div className="space-y-5 border-t border-slate pt-10">
                  <p className="text-gold uppercase tracking-widest font-sans mb-6" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                    Direct Contact
                  </p>
                  <a href="tel:2066509017" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 border border-slate flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors duration-300">
                      <PhoneIcon />
                    </div>
                    <div>
                      <span className="block text-pearl font-sans group-hover:text-gold transition-colors duration-300" style={{ fontSize: "1.0625rem" }}>
                        206.650.9017
                      </span>
                      <span className="block text-mist font-sans" style={{ fontSize: "0.75rem" }}>Direct line</span>
                    </div>
                  </a>
                  <a href="mailto:craig@craigabplanalp.com" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 border border-slate flex items-center justify-center flex-shrink-0 group-hover:border-gold/40 transition-colors duration-300">
                      <MailIcon />
                    </div>
                    <div>
                      <span className="block text-pearl font-sans group-hover:text-gold transition-colors duration-300" style={{ fontSize: "0.9375rem" }}>
                        craig@craigabplanalp.com
                      </span>
                      <span className="block text-mist font-sans" style={{ fontSize: "0.75rem" }}>Read personally</span>
                    </div>
                  </a>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-slate flex items-center justify-center flex-shrink-0">
                      <LocationIcon />
                    </div>
                    <div>
                      <a
                        href="https://definitive.com" target="_blank" rel="noopener noreferrer"
                        className="block text-pearl hover:text-gold transition-colors duration-300 font-sans"
                        style={{ fontSize: "0.9375rem" }}
                      >
                        Definitive Audio
                      </a>
                      <span className="block text-mist font-sans" style={{ fontSize: "0.75rem" }}>Bellevue, Washington</span>
                    </div>
                  </div>
                </div>

                {/* What to expect */}
                <div className="mt-12 p-8 border border-slate/50" style={{ background: "rgba(201,168,76,0.03)" }}>
                  <p className="text-gold uppercase tracking-widest font-sans mb-5" style={{ fontSize: "0.65rem", letterSpacing: "0.22em" }}>
                    What to Expect
                  </p>
                  <div className="space-y-4">
                    {[
                      "A personal response from Craig — not an assistant",
                      "An honest assessment of your project",
                      "No pressure, no pitch, no obligation",
                      "Real answers about what's possible in your space",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-1 h-1 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                        <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.7" }}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimateIn>
            </div>

            {/* Right: Form */}
            <div className="lg:col-span-3">
              <AnimateIn direction="right" delay={0.1}>
                <div className="flex items-center gap-6 mb-10">
                  <div className="gold-divider-left" />
                  <span className="text-gold uppercase tracking-widest font-sans" style={{ fontSize: "0.65rem", letterSpacing: "0.24em" }}>
                    Send a Message
                  </span>
                </div>
                <ContactForm />
              </AnimateIn>
            </div>
          </div>
        </div>
      </section>

      {/* QUALIFYING SECTION */}
      <section className="py-20 md:py-28 border-t border-slate/50" style={{ background: "#111111" }}>
        <div className="craig-container">
          <div className="max-w-3xl mx-auto">
            <AnimateIn>
              <h2
                className="font-serif text-pearl font-light mb-8"
                style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", letterSpacing: "-0.01em" }}
              >
                Is this the right conversation?
              </h2>
              <p className="text-mist font-sans leading-relaxed mb-10" style={{ fontSize: "1rem", lineHeight: "1.85" }}>
                Craig works with clients who are genuinely committed to the pursuit. Not everyone
                is &mdash; and that&rsquo;s perfectly fine. But if you&rsquo;ve read the philosophy,
                studied the work, and felt something resonate, you&rsquo;re probably the kind of
                client this conversation is for.
              </p>
            </AnimateIn>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  q: "Is budget a constraint?",
                  a: "Reference-level work requires serious investment. If budget is the primary filter, this may not be the right fit. If the result is the primary filter, we should talk.",
                },
                {
                  q: "Is my space fixed?",
                  a: "Room design is half the system. If you're in design phase, that's ideal. If the room is fixed, Craig will tell you honestly what's achievable within its parameters.",
                },
                {
                  q: "Am I in the Pacific Northwest?",
                  a: "Craig is based in Bellevue, WA and primarily serves the Pacific Northwest — though exceptional projects may warrant broader conversations.",
                },
              ].map((item, i) => (
                <AnimateIn key={item.q} delay={i * 0.1} direction="up">
                  <div className="cinema-card p-7 h-full">
                    <h4 className="font-serif text-pearl font-light mb-4" style={{ fontSize: "1.125rem" }}>
                      {item.q}
                    </h4>
                    <p className="text-mist font-sans text-sm leading-relaxed" style={{ lineHeight: "1.8" }}>
                      {item.a}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL */}
      <section className="py-24 md:py-32 border-t border-slate/50" style={{ background: "#0a0a0a" }}>
        <div className="craig-container text-center">
          <AnimateIn>
            <div className="max-w-xl mx-auto">
              <div className="gold-divider mb-10" />
              <blockquote
                className="font-serif italic text-pearl/90 mb-10"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.875rem)", lineHeight: "1.5", fontWeight: 300 }}
              >
                &ldquo;The conversation costs nothing.
                <br />
                The right room changes everything.&rdquo;
              </blockquote>
              <p className="text-mist font-sans mb-1" style={{ fontSize: "0.875rem" }}>Craig Abplanalp</p>
              <p className="text-mist/50 font-sans" style={{ fontSize: "0.75rem" }}>Custom Sales Manager, Definitive Audio</p>
              <div className="gold-divider mt-10" />
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
