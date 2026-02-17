import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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

export default function AreaPage({ params }: Props) {
  const area = areaPages[params.slug];
  if (!area) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Service Areas", href: "/areas/coeur-d-alene" },
          { label: area.name },
        ]}
      />

      {/* Hero */}
      <section className="bg-cream pb-16 md:pb-24">
        <div className="container-luxe max-w-4xl">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            Serving {area.name}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight text-balance">
            {area.headline}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-gray-600 leading-relaxed">
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
              className="inline-flex items-center justify-center gap-2 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              Call Mark: {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Area photo placeholder */}
      <section className="container-luxe -mt-4 mb-16">
        <div className="max-w-4xl mx-auto aspect-[16/7] bg-warm-gray-200 rounded-2xl flex items-center justify-center">
          <div className="text-center p-8">
            <svg className="w-16 h-16 text-warm-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-warm-gray-500 text-sm font-medium">{area.name} area photography</p>
            <p className="text-warm-gray-400 text-xs mt-1">Local photography to be added</p>
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
