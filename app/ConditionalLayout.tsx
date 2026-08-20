"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Site chrome. Header + Footer render on every public route except
 * /free-consultation, which is a paid-traffic landing page with its own
 * minimal sticky bar. The skip link stays on both so keyboard users are not
 * trapped in chrome — on the landing page that chrome is only the logo and
 * one CTA, but the jump still exists.
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/free-consultation";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-charcoal focus:px-6 focus:py-3 focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {isLanding ? null : <Header />}
      <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
        {children}
      </main>
      {isLanding ? null : <Footer />}
    </>
  );
}
