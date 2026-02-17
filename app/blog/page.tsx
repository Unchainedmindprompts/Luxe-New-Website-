import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Blog | Window Treatment Tips & Guides",
  description: `Expert window treatment advice from ${BUSINESS.name}. Tips on choosing the right blinds, shades, and shutters for Northern Idaho homes.`,
  openGraph: {
    title: "Blog | Luxe Window Works",
    description: "Expert window treatment advice for Northern Idaho homeowners.",
    type: "website",
  },
};

// Blog categories for future use
const CATEGORIES = [
  { name: "All", slug: "all" },
  { name: "Buying Guides", slug: "buying-guides" },
  { name: "Product Spotlights", slug: "product-spotlights" },
  { name: "Home Design Tips", slug: "home-design-tips" },
  { name: "Energy Efficiency", slug: "energy-efficiency" },
  { name: "Northern Idaho Living", slug: "northern-idaho-living" },
];

export default function BlogPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />

      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden min-h-[350px] md:min-h-[400px] flex items-center">
        <Image
          src="/images/top-down-bottom-up-shades.jpeg"
          alt="Living room with top-down bottom-up shades overlooking a lake"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="container-luxe relative max-w-4xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
            Window Treatment Insights
          </h1>
          <p className="mt-4 text-lg text-warm-gray-200 leading-relaxed">
            Expert advice, buying guides, and design inspiration from nearly 20 years
            of hands-on experience in Northern Idaho homes.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-warm-gray-200 bg-warm-white sticky top-16 md:top-20 z-30">
        <div className="container-luxe">
          <div className="flex gap-6 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${
                  cat.slug === "all"
                    ? "text-gold border-b-2 border-gold pb-1"
                    : "text-warm-gray-500 hover:text-charcoal"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Empty state */}
      <section className="py-24 md:py-32 bg-warm-white">
        <div className="container-luxe text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-cream rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-warm-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
            New Content Coming Soon
          </h2>
          <p className="text-warm-gray-500 text-lg leading-relaxed">
            We&apos;re preparing a library of helpful articles — from buying guides and product
            comparisons to design tips specific to Northern Idaho homes. Check back soon.
          </p>
          <div className="mt-10">
            <Link
              href="/#concierge"
              className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Get Personalized Advice Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
