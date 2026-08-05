import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Site chrome. This used to be a client component that read the pathname to
 * hide the header and footer on /admin. That route left with Payload, so the
 * check — and the "use client" it forced — are both gone.
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        Skip link. The header carries the logo, six nav items and two dropdowns
        with fourteen children between them, so anyone navigating by keyboard —
        a screen reader user, or someone who cannot use a mouse — was pressing
        Tab roughly twenty-five times before reaching a word of content, on
        every page of the site.

        sr-only keeps it out of the visual layout until it takes focus, when
        focus:not-sr-only brings it back. z-[100] puts it above the fixed
        header, which sits at z-50 and would otherwise cover it.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-charcoal focus:px-6 focus:py-3 focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Header />
      {/* tabIndex -1 makes the target focusable, so the jump moves the keyboard
          cursor rather than only scrolling the page. */}
      <main id="main-content" tabIndex={-1} className="min-h-screen focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
