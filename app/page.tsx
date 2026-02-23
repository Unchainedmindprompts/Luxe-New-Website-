import Link from "next/link";
import Image from "next/image";
import ConciergeChat from "@/components/ConciergeChat";
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
          src="/images/hero-modern-living.jpeg"
          alt="Modern living room with custom cellular shades and a mountain view"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="container-luxe relative">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight text-balance">
              Northern Idaho&apos;s Most Trusted Window Treatment Specialist
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl text-warm-gray-200 leading-relaxed max-w-2xl">
              Free in-home consultation with Mark — nearly 20 years of hands-on expertise,
              not a sales pitch. He&apos;ll help you find exactly what works for your space,
              your style, and your budget.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="#concierge"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
              >
                Start the Consultation
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-charcoal font-semibold px-8 py-4 rounded-full text-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Mark Now
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
            <span className="text-warm-gray-300">{BUSINESS.experience} Experience</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">{BUSINESS.guarantee}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">Serving Northern Idaho</span>
          </div>
        </div>
      </section>

      {/* Concierge Introduction */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            A Better Way to Shop for Window Treatments
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
            Skip the Overwhelming Showroom Experience
          </h2>
          <p className="mt-6 text-lg text-warm-gray-600 leading-relaxed">
            Most window treatment companies throw a catalog at you and hope something sticks.
            That&apos;s not how Mark works. With two decades of installation experience, he knows
            that the right window covering depends on your room, your light, your climate, and your life —
            not just what looks good in a brochure.
          </p>
          <p className="mt-4 text-lg text-warm-gray-600 leading-relaxed">
            Start with our concierge consultation below. Answer a few simple questions,
            and we&apos;ll help you narrow down exactly what makes sense for your home —
            before anyone ever sets foot in your door.
          </p>
        </div>
      </section>

      {/* AI Concierge Chat */}
      <section id="concierge" className="py-16 md:py-24 bg-cream/50 scroll-mt-20">
        <div className="container-luxe text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-3">
            Your Personal Window Treatment Concierge
          </h2>
          <p className="text-warm-gray-500 mb-10 max-w-lg mx-auto">
            Tell us about your space, and we&apos;ll help you figure out the perfect solution.
          </p>
          <ConciergeChat />
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

      {/* About Mark */}
      <section className="py-20 md:py-28 bg-linen/40">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden order-2 lg:order-1">
              <Image
                src="/images/mark-photo.png"
                alt="Mark, owner and installer at Luxe Window Works"
                fill
                className="object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
                Meet Your Installer
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
                Your Neighbor. Your Expert. Your Installer.
              </h2>
              <div className="mt-6 space-y-4 text-warm-gray-600 leading-relaxed text-[17px]">
                <p>
                  With 20 years of hands-on installations, Mark has seen every
                  type of window, every challenging angle, and every &ldquo;impossible&rdquo; situation
                  that Northern Idaho homes can throw at you.
                </p>
                <p>
                  He&apos;s not here to upsell you on the most expensive option. He&apos;s here to
                  figure out what actually works — for your windows, your home, your family,
                  and your budget. That&apos;s why every project starts with a free in-home consultation,
                  not a sales pitch.
                </p>
                <p>
                  From lakeside homes in Coeur d&apos;Alene to new construction in Post Falls,
                  Mark knows the unique challenges that come with living in this part of Idaho —
                  the extreme temperature swings, the intense summer sun off the lake, the
                  need for real insulation when winter hits. And he backs every installation
                  with a lifetime guarantee.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a
                  href="#concierge"
                  className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full transition-all"
                >
                  Start Your Consultation
                </a>
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
              The Right Covering for Every Room
            </h2>
            <p className="mt-4 text-warm-gray-500 text-lg">
              Each product solves a specific problem. Mark will help you match the right one to yours.
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
            Ready to Stop Guessing and Get It Right?
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            Schedule your free in-home consultation with Mark. He&apos;ll measure your windows,
            understand your needs, and recommend exactly what works — no pressure, no surprises.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#concierge"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Start Your Free Consultation
            </a>
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
