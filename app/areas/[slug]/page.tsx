import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS, PRODUCTS } from "@/lib/constants";
import { areaPages } from "@/lib/area-data";
import type { AreaPageData } from "@/lib/area-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(areaPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = areaPages[slug];
  if (!area) return {};

  return {
    title: area.metaTitle,
    description: area.metaDescription,
    alternates: {
      canonical: `https://www.luxewindowworks.com/areas/${slug}`,
    },
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      type: "website",
      images: [
        {
          url: "https://www.luxewindowworks.com/images/hero-modern-living.webp",
          width: 1200,
          height: 630,
          alt: "Luxe Window Works — Custom Window Treatments in Northern Idaho",
        },
      ],
    },
  };
}

function AreaSchema({ area, slug }: { area: AreaPageData, slug: string }) {
  const areaName = area.name;
  const areaUrl = `${BUSINESS.url}/areas/${slug}`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${areaUrl}#service`,
    name: `Custom Window Treatments in ${areaName}, Idaho`,
    serviceType: "Custom Window Treatments",
    description: `Professional custom window treatment installation in ${areaName}, Idaho. Luxe Window Works offers cellular shades, plantation shutters, solar shades, roller shades, motorized window treatments, and free in-home consultations throughout ${areaName} and surrounding Northern Idaho communities.`,
    provider: { "@id": `${BUSINESS.url}/#business` },
    areaServed: {
      "@type": "City",
      name: areaName,
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Window Treatment Services in ${areaName}`,
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Cellular Shade Installation in ${areaName}`,
            description: `Energy-efficient honeycomb cellular shades custom-fitted for ${areaName} homes. Reduces energy costs and controls light year-round.`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Plantation Shutter Installation in ${areaName}`,
            description: `Custom-measured plantation shutters for ${areaName} homes. Lasting value, precise light control, and architectural character.`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Solar Shade Installation in ${areaName}`,
            description: `UV-blocking solar shades that preserve ${areaName} lake and mountain views while eliminating glare and heat gain.`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Motorized Window Treatment Installation in ${areaName}`,
            description: `Smart motorized shades for ${areaName} homes — controllable by phone, voice assistant, or wall switch.`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Free In-Home Window Treatment Consultation in ${areaName}`,
            description: `Free in-home consultation for ${areaName} homeowners. We assess your windows, show product samples, and recommend the right solution with no pressure.`,
          },
        },
      ],
    },
    offers: {
      "@type": "Offer",
      name: "Free In-Home Consultation",
      price: "0",
      priceCurrency: "USD",
      description: `Free in-home window treatment consultation for ${areaName} homeowners.`,
      seller: { "@id": `${BUSINESS.url}/#business` },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BUSINESS.url}/` },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: `${BUSINESS.url}/areas/coeur-d-alene` },
      { "@type": "ListItem", position: 3, name: areaName, item: areaUrl },
    ],
  };

  const faqItems = area.faqs && area.faqs.length > 0
    ? area.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      }))
    : [
        {
          "@type": "Question",
          name: `Who does custom window treatments in ${areaName}, Idaho?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Luxe Window Works provides custom window treatment installation in ${areaName}, Idaho. Founded by Mark Abplanalp — who has worked in the window treatment industry since 2002 — Luxe offers free in-home consultations, professional installation, and a lifetime workmanship guarantee. Call 208-660-8643 to schedule.`,
          },
        },
        {
          "@type": "Question",
          name: `What window treatments work best for ${areaName} homes?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `For ${areaName} homes, cellular shades are the top choice for energy efficiency given Northern Idaho's extreme temperature swings. Solar shades are essential for lake and mountain-view properties to control glare without losing the view. Plantation shutters add long-term value and work well in both historic and newer construction. Motorized shades are increasingly popular for hard-to-reach windows and smart home integration.`,
          },
        },
        {
          "@type": "Question",
          name: `Does Luxe Window Works offer free consultations in ${areaName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Yes. Luxe Window Works offers free in-home consultations throughout ${areaName} and surrounding Northern Idaho communities. During the consultation we assess your windows, show product samples, and provide honest recommendations with no pressure and no hidden costs. Call 208-660-8643 or book online to schedule.`,
          },
        },
        {
          "@type": "Question",
          name: `How long does window treatment installation take in ${areaName}?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `Most custom window treatment orders take 3 to 4 weeks from ordering to installation in ${areaName}. Custom drapes and plantation shutters typically run 6 to 8 weeks depending on the manufacturer. Contact Luxe Window Works at 208-660-8643 for current lead times on your specific product.`,
          },
        },
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${areaUrl}#faq`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".area-faqs"],
    },
    mainEntity: faqItems,
  };

  return (
    <>
      <Script
        id={`area-service-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <Script
        id={`area-breadcrumb-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id={`area-faq-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

export default async function AreaPage({ params }: Props) {
  const { slug } = await params;
  const area = areaPages[slug];
  if (!area) notFound();

  return (
    <>
      <AreaSchema area={area} slug={slug} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Service Areas", href: "/areas/coeur-d-alene" },
          { label: area.name },
        ]}
      />

      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center">
        <Image
          src="/images/top-down-bottom-up-shades.jpeg"
          alt="Living room with top-down bottom-up shades overlooking a lake"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="container-luxe relative max-w-4xl">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            Serving {area.name}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight text-balance">
            {area.headline}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-gray-200 leading-relaxed">
            {area.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="/#concierge"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Start Your Consultation
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-charcoal font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              Call Us: {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            Window Treatments in {area.name}
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            {area.description}
          </p>
        </div>
      </section>

      {/* Neighborhoods & Housing */}
      <section className="py-16 md:py-20 bg-cream/50">
        <div className="container-luxe max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Neighborhoods */}
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-6">
                Neighborhoods We Serve
              </h2>
              <div className="flex flex-wrap gap-2">
                {area.neighborhoods.map((neighborhood) => (
                  <span
                    key={neighborhood}
                    className="bg-white border border-warm-gray-200 text-warm-gray-600 px-4 py-2 rounded-full text-sm"
                  >
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>

            {/* Housing Types */}
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-6">
                Local Housing
              </h2>
              <p className="text-warm-gray-600 leading-relaxed">
                {area.housingTypes}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Climate Considerations */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <div className="bg-linen/60 border border-warm-gray-200/60 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-charcoal">
                Climate & Light Considerations
              </h2>
            </div>
            <p className="text-warm-gray-600 leading-relaxed text-[17px]">
              {area.climateConsiderations}
            </p>
          </div>
        </div>
      </section>

      {/* Mark's Local Insight */}
      {area.markInsight && (
        <section className="py-16 md:py-20 bg-cream/50">
          <div className="container-luxe max-w-3xl">
            <div className="bg-linen/60 border border-warm-gray-200/60 rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
                  Mark&apos;s Local Insight
                </h2>
              </div>
              <p className="text-warm-gray-600 leading-relaxed text-[17px] italic">
                &ldquo;{area.markInsight}&rdquo;
              </p>
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {area.faqs && area.faqs.length > 0 && (
        <section className="area-faqs py-16 md:py-20 bg-warm-white">
          <div className="container-luxe max-w-3xl">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">
              Common Questions About Window Treatments in {area.name}
            </h2>
            <div className="space-y-6">
              {area.faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-8 border border-warm-gray-200/60">
                  <h3 className="font-serif text-lg font-semibold text-charcoal mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-warm-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Blog Posts */}
      {area.relatedPosts && area.relatedPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-cream/50">
          <div className="container-luxe max-w-3xl">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">
              Further Reading for {area.name} Homeowners
            </h2>
            <div className="space-y-3">
              {area.relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-5 border border-warm-gray-200/60 hover:border-gold/30 hover:shadow-md transition-all group"
                >
                  <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-charcoal font-medium group-hover:text-gold transition-colors">
                    {post.title}
                  </span>
                  <svg className="w-4 h-4 text-warm-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Available */}
      <section className="py-16 md:py-20 bg-cream/50">
        <div className="container-luxe">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              Products Available in {area.name}
            </h2>
            <p className="mt-3 text-warm-gray-500">
              Every product we carry is available for homes in {area.name} and surrounding areas.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-xl border border-warm-gray-200/60 p-4 text-center hover:shadow-md hover:border-gold/30 transition-all"
              >
                <h3 className="font-serif text-sm font-semibold text-charcoal group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-xs text-warm-gray-500">{product.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
            {area.localCTA}
          </h2>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/#concierge"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Start Your Free Consultation
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-2 border-2 border-warm-gray-600 text-white hover:border-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              Call {BUSINESS.phone}
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-warm-gray-400">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              5.0 Stars
            </span>
            <span>{BUSINESS.experience} Experience</span>
            <span>{BUSINESS.guarantee}</span>
          </div>
        </div>
      </section>
    </>
  );
}
