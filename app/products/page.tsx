import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS, PRODUCTS, SERVICE_AREAS } from "@/lib/constants";

/**
 * The products hub.
 *
 * This page was missing, and its absence showed up in three places at once.
 * The header's "Products" dropdown pointed at /products/cellular-shades, the
 * breadcrumb on every product page did the same, and the BreadcrumbList schema
 * declared that the entity named "Products" *was* the cellular shades URL —
 * so the site was telling Google a category and one of its members were the
 * same thing. All three now resolve here.
 *
 * It also gives the category searches somewhere to land. "Window treatments"
 * and "window coverings" are how people name the whole category rather than a
 * specific product, and until now every page on the site answered to a single
 * product instead. And it gives the nine product pages a hub linking to all of
 * them, which they badly need: Search Console has them at average positions 21
 * to 57 largely because almost nothing pointed at them.
 */

const PAGE_URL = `${BUSINESS.url}/products`;

export const metadata: Metadata = {
  title: "Window Treatments & Window Coverings | North Idaho | Luxe Window Works",
  description:
    "Every window covering we install in North Idaho — blinds, cellular shades, solar shades, roller shades, Roman shades, plantation shutters, and motorization. Custom measured and professionally installed. Free in-home consultation.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Window Treatments & Window Coverings | Luxe Window Works",
    description:
      "Blinds, shades, plantation shutters, and motorization — custom measured and installed across Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.",
    type: "website",
    url: PAGE_URL,
  },
};

function ProductsHubSchema() {
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Window Treatments & Window Coverings — Luxe Window Works",
    description:
      "The full range of window treatments Luxe Window Works measures and installs across North Idaho.",
    isPartOf: { "@id": `${BUSINESS.url}/#website` },
    about: { "@id": `${BUSINESS.url}/#business` },
    breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    inLanguage: "en-US",
    // Each product page defines its own WebPage and Service; reference them by
    // @id rather than restating them here, so there is one definition per node.
    hasPart: PRODUCTS.map((p) => ({
      "@id": `${BUSINESS.url}/products/${p.slug}#webpage`,
    })),
    mainEntity: {
      "@type": "ItemList",
      name: "Window Treatments Installed in North Idaho",
      numberOfItems: PRODUCTS.length,
      itemListElement: PRODUCTS.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${BUSINESS.url}/products/${p.slug}`,
        item: { "@id": `${BUSINESS.url}/products/${p.slug}#service` },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BUSINESS.url}/` },
      { "@type": "ListItem", position: 2, name: "Products", item: PAGE_URL },
    ],
  };

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
    </>
  );
}

export default function ProductsHubPage() {
  const cities = SERVICE_AREAS.map((a) => a.name);

  return (
    <>
      <ProductsHubSchema />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} />

      {/* Hero */}
      <section className="pt-20 md:pt-28 pb-12 md:pb-16 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
            Products
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight text-balance">
            Window treatments and window coverings for North Idaho homes.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-warm-gray-600 leading-relaxed">
            Blinds, shades, plantation shutters, and motorization — every one
            custom measured to your actual window opening and installed by us,
            not dropped off in a box. Below is the full range, and what each one
            is genuinely good at.
          </p>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-12 md:py-16 bg-cream">
        <div className="container-luxe max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group block bg-white rounded-2xl border border-warm-gray-200/60 p-8 hover:shadow-lg hover:border-gold/30 transition-all"
              >
                <h2 className="font-serif text-2xl text-charcoal group-hover:text-gold transition-colors mb-3">
                  {product.name}
                </h2>
                <p className="text-warm-gray-600 leading-relaxed mb-6">
                  {product.shortDescription}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                  See {product.name.toLowerCase()} details
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

      {/* Guidance — the honest answer to "which one do I need?" */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            Not sure which one you need?
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg mb-4">
            Most people arrive knowing the problem, not the product — a room
            that bakes in the afternoon, a window you can&apos;t reach, a view
            you want to keep without the glare. That is the right way round.
            Describe the problem and the product follows from it.
          </p>
          <p className="text-warm-gray-600 leading-relaxed text-lg mb-4">
            The short version: <strong className="text-charcoal">cellular
            shades</strong> for heat and cold, <strong className="text-charcoal">
            solar shades</strong> for glare and views, <strong className="text-charcoal">
            plantation shutters</strong> when you want something permanent that
            adds value, <strong className="text-charcoal">blinds</strong> for
            precise everyday light control, and{" "}
            <strong className="text-charcoal">motorization</strong> on anything
            that is awkward to reach. Roller, Roman, and banded shades are
            mostly about the look you are after.
          </p>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            <Link
              href="/ask-luxe"
              className="text-gold hover:text-gold-dark font-medium"
            >
              Answer a few questions
            </Link>{" "}
            and we&apos;ll narrow it down, or{" "}
            <Link href="/book" className="text-gold hover:text-gold-dark font-medium">
              book a free in-home consultation
            </Link>{" "}
            and we&apos;ll bring samples to your windows, in your light.
          </p>
        </div>
      </section>

      {/* Where we install — ties the category page to the local pages */}
      <section className="py-16 md:py-20 bg-cream/50">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            Where we install
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg">
            Everything above is measured and installed across{" "}
            {SERVICE_AREAS.map((area, i) => (
              <span key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="text-gold hover:text-gold-dark font-medium"
                >
                  {area.name}
                </Link>
                {i < cities.length - 2 ? ", " : i === cities.length - 2 ? ", and " : ""}
              </span>
            ))}
            , plus the surrounding Kootenai County and Idaho Panhandle
            communities. Each area page covers what tends to work in that
            town&apos;s homes and climate.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
            See them in your own windows, in your own light.
          </h2>
          <p className="mt-6 text-lg text-warm-gray-300 leading-relaxed">
            Samples look different on a showroom wall than they do on your
            window. We bring them to you — free, and with no obligation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Book a Free Consultation
            </a>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full text-lg transition-colors"
            >
              Call {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
