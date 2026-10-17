import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import { areaPages } from "@/lib/area-data";
import { cityRef, northIdahoNode } from "@/lib/cities";

export const metadata: Metadata = {
  title: "Areas We Serve | Luxe Window Works",
  description:
    "Explore the areas Luxe Window Works serves: custom window treatments with in-home consultations and professional installation across North Idaho, and Hunter Douglas service on Seattle's Eastside. Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint, Bellevue, Kirkland, Sammamish, Issaquah, Renton, and Maple Valley.",
  alternates: {
    canonical: `${BUSINESS.url}/areas`,
  },
  openGraph: {
    title: "Areas We Serve | Luxe Window Works",
    description:
      "Custom window treatments across North Idaho, plus Hunter Douglas service on Seattle's Eastside.",
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
    name: "Areas We Serve — Luxe Window Works",
    description:
      "The communities Luxe Window Works serves: North Idaho, with custom window treatments, in-home consultations, and professional installation, and Seattle's Eastside, with Hunter Douglas service by appointment.",
    isPartOf: { "@id": `${BUSINESS.url}/#website` },
    about: { "@id": `${BUSINESS.url}/#business` },
    breadcrumb: { "@id": `${areasUrl}#breadcrumb` },
    inLanguage: "en-US",
    hasPart: areasList.map((area) => ({
      "@id": `${BUSINESS.url}/areas/${area.slug}#webpage`,
    })),
    mainEntity: {
      "@type": "ItemList",
      name: "Service Areas",
      numberOfItems: areasList.length,
      itemListElement: areasList.map((area, i) => ({
        "@type": "ListItem",
        position: i + 1,
        // Reference only. Each city is defined on its own /areas/{slug} page,
        // which is the URL its @id names — the hub lists them, it does not
        // own them.
        item: cityRef(area.name),
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

  // Plain <script>, not next/script. <Script> defers to the client, so the
  // JSON-LD landed only in the RSC flight payload and never in the HTML a
  // crawler reads — this page was publishing zero structured data. Same defect
  // that hit /about and the city pages; this index was missed because the
  // audit's must-emit list did not name it. It does now.
  return (
    <>
      <JsonLd data={collectionPageSchema} />
      {/* This hub is where North Idaho is defined — the region has no
          /areas/{slug} route of its own, and this is the page that actually
          represents it. Everywhere else references the @id. Same shape the
          area detail pages use for their canonical City. */}
      <JsonLd data={{ "@context": "https://schema.org", ...northIdahoNode() }} />
      <JsonLd data={breadcrumbSchema} />
    </>
  );
}

type AreaEntry = (typeof areaPages)[string];

function AreaCard({ area }: { area: AreaEntry }) {
  return (
    <Link
      href={`/areas/${area.slug}`}
      className="group block bg-white rounded-2xl border border-warm-gray-200/60 p-8 hover:shadow-lg hover:border-gold/30 transition-all"
    >
      <h3 className="font-serif text-2xl text-charcoal group-hover:text-gold transition-colors mb-3">
        {area.name}
      </h3>
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
  );
}

export default function AreasHubPage() {
  const areasList = Object.values(areaPages);
  const idahoAreas = areasList.filter((area) => !area.state);
  const eastsideAreas = areasList.filter(
    (area) => area.state === "Washington"
  );

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
            Areas We Serve
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight text-balance">
            The communities we serve.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-gray-600 leading-relaxed">
            Luxe Window Works is based in Post Falls and provides in-home
            consultations and professional installation across North Idaho. We
            also serve six communities on Seattle&apos;s Eastside with Hunter
            Douglas, by appointment, with measuring and installation through
            Hunter Douglas&apos;s own certified installation service. Every
            community below has different homes, different climate stresses on
            windows, and a different mix of what actually works. Click through
            to your area to see the specifics.
          </p>
        </div>
      </section>

      {/* Area cards, grouped by region */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="container-luxe max-w-5xl">
          <h2 className="font-serif text-3xl text-charcoal mb-8">
            North Idaho
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {idahoAreas.map((area) => (
              <AreaCard key={area.slug} area={area} />
            ))}
          </div>

          <h2 className="font-serif text-3xl text-charcoal mt-16 mb-4">
            Seattle Eastside
          </h2>
          <p className="text-warm-gray-600 leading-relaxed max-w-3xl mb-8">
            These are Hunter Douglas service areas. Luxe sells Hunter Douglas
            exclusively on the Eastside, with in-home consultations by
            appointment and measuring and installation handled through Hunter
            Douglas Installation Services.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eastsideAreas.map((area) => (
              <AreaCard key={area.slug} area={area} />
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
            The five North Idaho communities above are our primary service
            areas, where we have the deepest experience and can typically
            schedule the fastest.
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
