import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { GLOSSARY } from "@/data/glossary";

const BASE = "https://www.luxewindowworks.com";
const PAGE_URL = `${BASE}/glossary`;

export const metadata: Metadata = {
  title: "Window Treatment Glossary | Luxe Window Works",
  description:
    "Plain-English definitions of window treatment industry terms — cellular shades, TDBU, R-value, SmartPrivacy, plantation shutters, and more — from a 24-year industry expert.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Window Treatment Glossary | Luxe Window Works",
    description:
      "Industry-expert definitions of the terms that matter when buying custom blinds, shades, and shutters.",
    type: "website",
    url: PAGE_URL,
  },
};

const sortedTerms = [...GLOSSARY].sort((a, b) =>
  a.term.localeCompare(b.term)
);

const definedTermSetSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": `${PAGE_URL}#termset`,
  name: "Luxe Window Works Window Treatment Glossary",
  description:
    "Industry-expert definitions of window treatment terms used by Luxe Window Works and the broader custom window covering industry.",
  url: PAGE_URL,
  publisher: { "@id": `${BASE}/#business` },
  inLanguage: "en-US",
  hasDefinedTerm: sortedTerms.map((t) => ({
    "@type": "DefinedTerm",
    "@id": `${PAGE_URL}#${t.id}`,
    name: t.term,
    ...(t.alternateTerms && t.alternateTerms.length > 0
      ? { alternateName: t.alternateTerms }
      : {}),
    description: t.definition,
    inDefinedTermSet: { "@id": `${PAGE_URL}#termset` },
    url: `${PAGE_URL}#${t.id}`,
  })),
};

const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Window Treatment Glossary | Luxe Window Works",
  description:
    "Plain-English definitions of window treatment industry terms — cellular shades, TDBU, R-value, SmartPrivacy, plantation shutters, and more — from a 24-year industry expert.",
  isPartOf: { "@id": `${BASE}/#website` },
  about: { "@id": `${BASE}/#business` },
  mainEntity: { "@id": `${PAGE_URL}#termset` },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  inLanguage: "en-US",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Glossary", item: PAGE_URL },
  ],
};

export default function GlossaryPage() {
  return (
    <>
      <JsonLd data={webpageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={definedTermSetSchema} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Glossary" },
        ]}
      />

      <section className="pt-10 md:pt-14 pb-6 md:pb-8 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight tracking-tight">
            Window Treatment Glossary
          </h1>
          <p className="mt-4 text-base md:text-lg text-warm-gray-500 leading-relaxed">
            Plain-English definitions of the terms that matter when you&apos;re buying
            custom blinds, shades, and shutters — written by a 24-year industry installer.
          </p>
        </div>
      </section>

      <section className="pb-6 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <nav aria-label="Glossary index" className="flex flex-wrap gap-2 justify-center">
            {sortedTerms.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="text-sm text-charcoal/80 hover:text-gold border border-warm-gray-200 hover:border-gold rounded-full px-3 py-1 transition-colors"
              >
                {t.term}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <dl className="space-y-10">
            {sortedTerms.map((t) => (
              <div key={t.id} id={t.id} className="scroll-mt-24">
                <dt>
                  <h2 className="font-serif text-2xl md:text-3xl text-charcoal leading-tight">
                    {t.term}
                  </h2>
                  {t.alternateTerms && t.alternateTerms.length > 0 && (
                    <p className="mt-1 text-sm text-warm-gray-500 italic">
                      Also called: {t.alternateTerms.join(", ")}
                    </p>
                  )}
                </dt>
                <dd className="mt-3 text-base md:text-lg text-warm-gray-600 leading-relaxed">
                  {t.definition}
                </dd>
                {t.relatedUrl && (
                  <div className="mt-3">
                    <Link
                      href={t.relatedUrl}
                      className="text-sm font-medium text-gold hover:text-charcoal transition-colors"
                    >
                      Related product →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream">
        <div className="container-luxe max-w-3xl text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-4">
            Have a question we didn&apos;t cover?
          </h2>
          <p className="text-base md:text-lg text-warm-gray-600 leading-relaxed mb-6">
            Mark has been installing custom window treatments for 24 years. If there&apos;s
            a term, product, or installation question you want a plain-English answer to,
            ask him directly.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-charcoal hover:bg-gold text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Ask Mark a Question
          </Link>
        </div>
      </section>
    </>
  );
}
