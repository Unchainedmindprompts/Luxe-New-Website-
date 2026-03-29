import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.luxewindowworks.com",
  },
};
import { BUSINESS, PRODUCTS, SERVICE_AREAS, REVIEWS } from "@/lib/constants";

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        <Image
          src="/images/hero-modern-living.webp"
          alt="Modern living room with custom cellular shades and a mountain view"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="container-luxe relative">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight text-balance">
              Premium Window Treatments for Northern Idaho Homes
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl text-warm-gray-200 leading-relaxed max-w-2xl">
              Custom solutions that solve real problems — energy efficiency, glare control, privacy,
              and lasting beauty — installed with 23 years of local expertise.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
              >
                Book Your Free In-Home Consultation
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-charcoal font-semibold px-8 py-4 rounded-full text-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call {BUSINESS.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-charcoal text-white py-5">
        <div className="container-luxe">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <span className="text-warm-gray-300">
                {BUSINESS.google.rating} Stars · {BUSINESS.google.reviewCount} Google Reviews
              </span>
            </div>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">{BUSINESS.experience}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">{BUSINESS.guarantee}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">Serving Northern Idaho</span>
          </div>
        </div>
      </section>

      {/* Social Proof / Reviews */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
              What Our Clients Say
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              5.0 Stars Across Every Review
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 border border-warm-gray-200/60 shadow-sm ${
                  i === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>
                <p className="text-charcoal leading-relaxed text-[15px]">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="mt-4 text-sm text-warm-gray-500 font-medium">
                  — {review.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Northern Idaho Homes */}
      <section className="py-20 md:py-28 bg-linen/40">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 lg:order-1">
              <Image
                src="/images/mark-photo.webp"
                alt="Mark Abplanalp, owner and installer at Luxe Window Works"
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={80}
              />
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
                Why Luxe Window Works
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
                Built for Northern Idaho Homes
              </h2>
              <div className="mt-6 space-y-4 text-warm-gray-600 leading-relaxed text-[17px]">
                <p>
                  For 23 years, owner Mark Abplanalp has specialized in window treatments that
                  perform in our unique climate — from intense summer sun reflecting off the lake
                  to freezing winters that demand real insulation.
                </p>
                <p>
                  Luxe Window Works was founded on that deep experience. We don&apos;t just sell
                  products. We engineer complete solutions tailored to your home, your views, your
                  lifestyle, and the specific challenges of Northern Idaho living. Every project
                  includes precise measurements, expert recommendations, and professional
                  installation backed by a lifetime guarantee.
                </p>
                <p>
                  Homes throughout Coeur d&apos;Alene, Post Falls, Hayden, Rathdrum, and Sandpoint
                  trust us because we understand this region — the lake-view glare, the temperature
                  swings, and the practical needs of both new construction and established homes.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full transition-all"
                >
                  Book a Free Consultation
                </Link>
                <a
                  href={BUSINESS.phoneHref}
                  className="inline-flex items-center justify-center gap-2 text-charcoal font-semibold hover:text-gold transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call {BUSINESS.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Overview */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
              Solutions, Not Just Products
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              The Right Treatment for Every Window
            </h2>
            <p className="mt-4 text-warm-gray-500 text-lg">
              Each product solves a specific problem. We&apos;ll match the right one to your home,
              your light conditions, and your lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-2xl border border-warm-gray-200/60 p-6 hover:shadow-lg hover:border-gold/30 transition-all"
              >
                <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-colors">
                  <svg className="w-6 h-6 text-warm-gray-500 group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gold font-medium">{product.tagline}</p>
                <p className="mt-2 text-sm text-warm-gray-500 leading-relaxed">
                  {product.shortDescription}
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                  Learn more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Strip */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="container-luxe">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              Proudly Serving Northern Idaho
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {SERVICE_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="bg-white hover:bg-charcoal hover:text-white text-charcoal border border-warm-gray-200 px-6 py-3 rounded-full font-medium transition-all hover:shadow-md"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
            Ready for Window Treatments That Actually Solve Your Problems?
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            Get a free in-home consultation — no pressure, no surprises. We&apos;ll measure your
            windows, understand your needs, and recommend exactly what works for your home.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Book Your Free Consultation
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-2 border-2 border-warm-gray-600 text-white hover:border-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
