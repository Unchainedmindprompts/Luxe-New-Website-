import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import { areaPages } from "@/lib/area-data";

export const metadata: Metadata = {
  title: "Service Areas | Luxe Window Works — Custom Window Treatments in North Idaho",
  description:
    "Luxe Window Works serves North Idaho with custom window treatments, in-home consultations, and professional installation. Explore our service areas: Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.",
  alternates: {
    canonical: `${BUSINESS.url}/areas`,
  },
  openGraph: {
    title: "Service Areas | Luxe Window Works",
    description:
      "Custom window treatments across North Idaho — Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint.",
    type: "website",
    url: `${BUSINESS.url}/areas`,
  },
};

function AreasHubSchema() {
  const areasUrl = `${BUSINESS.url}/areas`;
  const areasList = Object.values(areaPages);

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${areasUrl}#webpage`,
    url: areasUrl,
    name: "Service Areas — Luxe Window Works",
    description:
      "The North Idaho communities Luxe Window Works serves with custom window treatments, in-home consultations, and professional installation.",
    isPartOf: { "@id": `${BUSINESS.url}/#website` },
    about: { "@id": `${BUSINESS.url}/#business` },
    breadcrumb: { "@id": `${areasUrl}#breadcrumb` },
    inLanguage: "en-US",
    hasPart: areasList.map((area) => ({
      "@id": `${BUSINESS.url}/areas/${area.slug}#webpage`,
    })),
    mainEntity: {
      "@type": "ItemList",
      name: "North Idaho Service Areas",
      numberOfItems: areasList.length,
      itemListElement: areasList.map((area, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Place",
          "@id": `${BUSINESS.url}/areas/${area.slug}#place`,
          name: area.name,
          sameAs: area.wikipediaSameAs,
          url: `${BUSINESS.url}/areas/${area.slug}`,
          containedInPlace: { "@type": "State", name: "Idaho" },
        },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${areasUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BUSINESS.url}/` },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: areasUrl },
    ],
  };

  return (
    <>
      <Script
        id="areas-hub-collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="areas-hub-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default function AreasHubPage() {
  const areasList = Object.values(areaPages);

  return (
    <>
      <AreasHubSchema />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Service Areas" },
        ]}
      />

      {/* Hero */}
      <section className="pt-20 md:pt-28 pb-12 md:pb-16 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            North Idaho
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight text-balance">
            The communities we serve.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-gray-600 leading-relaxed">
            Luxe Window Works is based in Post Falls and provides in-home
            consultations and professional installation across North Idaho. Every
            community below has different homes, different climate stresses on
            windows, and a different mix of what actually works — click through
            to your area to see the specifics.
          </p>
        </div>
      </section>

      {/* Area cards grid */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="container-luxe max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {areasList.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="group block bg-white rounded-2xl border border-warm-gray-200/60 p-8 hover:shadow-lg hover:border-gold/30 transition-all"
              >
                <h2 className="font-serif text-2xl text-charcoal group-hover:text-gold transition-colors mb-3">
                  {area.name}
                </h2>
                <p className="text-warm-gray-600 leading-relaxed mb-6">
                  {area.subheadline}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                  See {area.name} window treatment details
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Regional context — establishes the broader service area */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            The broader area we cover
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg mb-4">
            The five communities above are our primary service areas — where we
            have the deepest experience and can typically schedule the fastest.
            We also travel throughout Kootenai County and the greater Idaho
            Panhandle for larger projects, including surrounding towns and
            unincorporated areas near Hayden Lake, Lake Coeur d&apos;Alene, and
            Lake Pend Oreille.
          </p>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            If your home is in a nearby community that isn&apos;t listed above,
            call{" "}
            <a
              href={BUSINESS.phoneHref}
              className="text-gold hover:text-gold-dark font-medium"
            >
              {BUSINESS.phone}
            </a>{" "}
            and we&apos;ll tell you honestly whether we can serve your area.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
            Ready to schedule a free in-home consultation?
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            We come to your home, measure every window, and walk you through
            the options for your specific space. No pressure, no hidden costs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Book Your Free Consultation
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
