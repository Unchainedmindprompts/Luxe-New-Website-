import type { Metadata } from "next";
import Link from "next/link";
import OptionsFlow from "./OptionsFlow";

export const metadata: Metadata = {
  title: "Show Me My Options — Luxe Window Works",
  description:
    "Tell us what you're trying to solve — heat, glare, privacy, blackout, energy efficiency, style, motorization — and we'll help you find the right window treatment for each room.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/show-me-my-options",
  },
  robots: { index: false, follow: true },
};

export default function ShowMeMyOptionsPage() {
  return (
    <div className="bg-warm-white min-h-screen">
      {/* Hero */}
      <div className="bg-charcoal text-white pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-3">
            Free &middot; No Obligation
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Let&apos;s Find What Works for Your Windows
          </h1>
          <p className="text-warm-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            You don&apos;t need to know which product to buy. Tell us what
            you&apos;re trying to solve — we&apos;ll help you find the right
            treatment room by room.
          </p>
        </div>
      </div>

      {/* Flow */}
      <div className="max-w-3xl mx-auto px-4 py-14">
        <OptionsFlow />

        <p className="mt-10 text-center text-sm text-warm-gray-500">
          Prefer to talk directly?{" "}
          <Link href="/book" className="text-gold font-medium hover:text-gold-dark">
            Book a free in-home consultation
          </Link>{" "}
          or call{" "}
          <a href="tel:+12086608643" className="text-gold font-medium hover:text-gold-dark">
            208-660-8643
          </a>
          .
        </p>
      </div>
    </div>
  );
}
