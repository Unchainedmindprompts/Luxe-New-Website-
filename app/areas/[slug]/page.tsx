import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS, PRODUCTS } from "@/lib/constants";
import { areaPages } from "@/lib/area-data";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(areaPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = areaPages[params.slug];
  if (!area) return {};

  return {
    title: area.metaTitle,
    description: area.metaDescription,
    openGraph: {
      title: area.metaTitle,
      description: area.metaDescription,
      type: "website",
    },
  };
}

function AreaSchema({ area, slug }: { area: { name: string; metaDescription?: string; description?: string }, slug: string }) {
  const areaName = area.name;
  const areaUrl = `${BUSINESS.url}/areas/${slug}`;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BUSINESS.url}/#business`,
    name: BUSINESS.name,
    url: BUSINESS.url,
    telephone: BUSINESS.phone,
    email: "mark@luxewindowworks.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.state,
      postalCode: BUSINESS.address.zip,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "City",
      name: areaName,
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Custom Window Treatments in ${areaName}`,
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Custom Cellular Shades Installation in ${areaName}`,
            description: `Energy-efficient honeycomb cellular shades custom-fitted for ${areaName} homes.`,
            areaServed: areaName,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Plantation Shutter Installation in ${areaName}`,
            description: `Custom-measured plantation shutters for ${areaName} homes — lasting value and precise light control.`,
            areaServed: areaName,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Motorized Window Shade Installation in ${areaName}`,
            description: `Smart motorized shades for ${areaName} homes, controllable by phone, voice, or wall switch.`,
            areaServed: areaName,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Solar Shade Installation in ${areaName}`,
            description: `UV-blocking solar shades that preserve ${areaName} views while reducing glare and heat gain.`,
            areaServed: areaName,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Free In-Home Window Treatment Consultation in ${areaName}`,
            description: `Free in-home consultation for ${areaName} homeowners. We assess your windows and recommend the right solution with no pressure and no hidden costs.`,
            areaServed: areaName,
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "14",
      bestRating: "5",
      worstRating: "1",
    },
    sameAs: [
      "https://www.yelp.com/biz/luxe-window-works-post-falls",
      "https://www.bbb.org/us/id/post-falls/profile/blinds/luxe-window-works-llc-1296-1000188314",
      "https://share.google/pRM5IoXZgRTksImvp",
    ],
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${areaUrl}#faq`,
    mainEntity: [
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
    ],
  };

  return (
    <>
      <Script
        id={`area-localbusiness-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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

export default function AreaPage({ params }: Props) {
  const area = areaPages[params.slug];
  if (!area) notFound();

  return (
    <>
      <AreaSchema area={area} slug={params.slug} />
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
