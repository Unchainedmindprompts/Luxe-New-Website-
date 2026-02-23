import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import { productPages } from "@/lib/product-data";
import type { ProductPageData } from "@/lib/product-data";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(productPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = productPages[params.slug];
  if (!product) return {};

  return {
    title: product.metaTitle,
    description: product.metaDescription,
    openGraph: {
      title: product.metaTitle,
      description: product.metaDescription,
      type: "website",
    },
  };
}

function ServiceSchema({ product }: { product: ProductPageData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${product.name} Installation`,
    provider: {
      "@type": "LocalBusiness",
      "@id": "https://luxewindowworks.com/#business",
      name: BUSINESS.name,
      telephone: BUSINESS.phone,
    },
    areaServed: {
      "@type": "State",
      name: "Idaho",
    },
    description: product.solution,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".product-subheadline"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function FAQSchema({ product }: { product: ProductPageData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function ProductPage({ params }: Props) {
  const product = productPages[params.slug];
  if (!product) notFound();

  return (
    <>
      <ServiceSchema product={product} />
      <FAQSchema product={product} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products/cellular-shades" },
          { label: product.name },
        ]}
      />

      {/* Hero */}
      <section className="bg-cream pb-16 md:pb-24">
        <div className="container-luxe max-w-4xl">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            {product.name}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight text-balance">
            {product.headline}
          </h1>
          <p className="product-subheadline mt-6 text-lg md:text-xl text-warm-gray-600 leading-relaxed">
            {product.subheadline}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="/#concierge"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Get Expert Recommendations
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

      {/* Product image */}
      <section className="container-luxe -mt-4 mb-16">
        {product.image ? (
          <div className="max-w-4xl mx-auto relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image
              src={product.image}
              alt={`${product.name} — installed by Luxe Window Works`}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto aspect-[16/7] bg-warm-gray-200 rounded-2xl flex items-center justify-center">
            <div className="text-center p-8">
              <svg className="w-16 h-16 text-warm-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-warm-gray-500 text-sm font-medium">{product.name} — Professional photography</p>
              <p className="text-warm-gray-400 text-xs mt-1">Real installation photos to be added</p>
            </div>
          </div>
        )}
      </section>

      {/* The Problem */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            The Problem
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            {product.problem}
          </p>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-16 md:py-20 bg-cream/50">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            The Solution
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            {product.solution}
          </p>
        </div>
      </section>

      {/* Mark's Expert Insight */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <div className="bg-linen/60 border border-warm-gray-200/60 rounded-2xl p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
                Mark&apos;s Installer Insight
              </h2>
            </div>
            <p className="text-warm-gray-600 leading-relaxed text-[17px] italic">
              &ldquo;{product.expertInsight}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Features & Ideal For */}
      <section className="py-16 md:py-20 bg-cream/50">
        <div className="container-luxe max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Features */}
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Key Features</h2>
              <ul className="space-y-3">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-warm-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideal For */}
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-6">Ideal For</h2>
              <ul className="space-y-3">
                {product.idealFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-warm-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Local Context */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            Why {product.name} in Northern Idaho
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            {product.localContext}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-cream/50">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">
            Common Questions About {product.name}
          </h2>
          <div className="space-y-6">
            {product.faqs.map((faq, i) => (
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

      {/* CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
            Ready to See If {product.name} Are Right for Your Home?
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            Start with our free concierge consultation to get personalized recommendations,
            or call Mark directly to schedule a free in-home visit.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/#concierge"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Start the Consultation
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-2 border-2 border-warm-gray-600 text-white hover:border-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
