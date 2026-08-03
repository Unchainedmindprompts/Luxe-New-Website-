"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BUSINESS, NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Charcoal bar. The gold mark only reaches ~2:1 contrast against the old
  // warm-white header; on charcoal it clears 6:1, so the logo carries the bar
  // instead of fading into it. It also matches the footer, which is already
  // bg-charcoal — dark top, dark bottom, warm content between.
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-sm border-b border-white/10">
      <div className="container-luxe flex items-center justify-between h-16 md:h-20">
        {/* Logo. The mark already reads "LUXE / WINDOW WORKS", so stacking the
            wordmark under it would repeat the name. "North Idaho" sits beside
            it behind a hairline rule instead — a lockup rather than a stack —
            which keeps the local signal without a third line of type. The rule
            and tagline drop away under sm so the mark never gets crowded on a
            phone. Explicit width/height are the intrinsic size so Next can
            reserve space and avoid layout shift; h-* + w-auto does the sizing. */}
        <Link
          href="/"
          className="flex items-center gap-3 shrink-0"
          onClick={() => setMobileOpen(false)}
          aria-label="Luxe Window Works — home"
        >
          <Image
            src="/images/luxe-logo-white.webp"
            alt="Luxe Window Works"
            width={925}
            height={388}
            priority
            className="h-10 md:h-14 w-auto"
          />
          <span
            aria-hidden="true"
            className="hidden sm:block h-8 md:h-10 w-px bg-white/20"
          />
          <span className="hidden sm:block text-[10px] md:text-[11px] text-white/60 tracking-[0.2em] uppercase leading-none">
            North
            <br />
            Idaho
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.children && setOpenDropdown(link.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link
                href={link.href}
                className="text-sm text-white/85 hover:text-white transition-colors font-medium"
              >
                {link.label}
                {link.children && (
                  <svg className="inline-block ml-1 w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              {link.children && openDropdown === link.label && (
                <div className="absolute top-full left-0 pt-2 w-56">
                  {/* Panel follows the bar. A white dropdown falling out of a
                      charcoal header reads as a rendering glitch. */}
                  <div className="bg-charcoal rounded-lg shadow-xl border border-white/10 py-2">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            Book a Consultation
          </Link>
          <a
            href={BUSINESS.phoneHref}
            className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {BUSINESS.phone}
          </a>
        </nav>

        {/* Mobile menu */}
        <div className="lg:hidden flex items-center gap-3">
          <button
            className="p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-charcoal border-t border-white/10">
          <nav className="container-luxe py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block py-3 text-white/85 font-medium"
                  onClick={() => {
                    if (!link.children) setMobileOpen(false);
                    else setOpenDropdown(openDropdown === link.label ? null : link.label);
                  }}
                >
                  {link.label}
                </Link>
                {link.children && openDropdown === link.label && (
                  <div className="pl-4 pb-2 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block py-2 text-sm text-white/60 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/book"
              className="flex items-center justify-center bg-gold text-white font-semibold py-3 rounded-full mt-4"
              onClick={() => setMobileOpen(false)}
            >
              Book a Free Consultation
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center justify-center gap-2 border border-white/25 text-white font-medium py-3 rounded-full mt-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Mark: {BUSINESS.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
