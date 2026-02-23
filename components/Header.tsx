"use client";

import { useState } from "react";
import Link from "next/link";
import { BUSINESS, NAV_LINKS } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-warm-white/95 backdrop-blur-sm border-b border-warm-gray-200/60">
      <div className="container-luxe flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex flex-col" onClick={() => setMobileOpen(false)}>
          <span className="font-serif text-xl md:text-2xl font-bold text-charcoal tracking-tight">
            Luxe Window Works
          </span>
          <span className="text-[10px] md:text-xs text-warm-gray-500 tracking-widest uppercase -mt-1">
            Northern Idaho
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
                className="text-sm text-warm-gray-700 hover:text-charcoal transition-colors font-medium"
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
                  <div className="bg-white rounded-lg shadow-lg border border-warm-gray-200/60 py-2">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-warm-gray-700 hover:bg-cream hover:text-charcoal transition-colors"
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
            className="inline-flex items-center gap-2 text-warm-gray-700 hover:text-charcoal text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {BUSINESS.phone}
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 text-charcoal"
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

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-warm-gray-200/60">
          <nav className="container-luxe py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                <Link
                  href={link.href}
                  className="block py-3 text-warm-gray-700 font-medium"
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
                        className="block py-2 text-sm text-warm-gray-500 hover:text-charcoal"
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
              className="flex items-center justify-center gap-2 border border-warm-gray-200 text-charcoal font-medium py-3 rounded-full mt-2"
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
