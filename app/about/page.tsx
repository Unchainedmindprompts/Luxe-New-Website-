import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { OWNER_STUB } from "@/lib/schema";
import { cityRef } from "@/lib/cities";
import { CARRIED_BRANDS } from "@/lib/brands";

const PAGE_URL = `${BUSINESS.url}/about`;

export const metadata: Metadata = {
  title: "About Mark Abplanalp | 24 Years in Window Treatments",
  description:
    "Luxe Window Works brings 24 years of experience to custom window treatments and outdoor shading projects across North Idaho, Seattle's Eastside, and the Salt Lake area.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "About Mark Abplanalp | 24 Years in Window Treatments",
    description:
      "Luxe Window Works brings 24 years of experience to custom window treatments and outdoor shading projects across North Idaho, Seattle's Eastside, and the Salt Lake area.",
    url: PAGE_URL,
    images: [
      {
        url: `${BUSINESS.url}/images/mark-photo.webp`,
        width: 1024,
        height: 1536,
        alt: "Mark Abplanalp, Owner of Luxe Window Works",
      },
    ],
  },
};

const personSchema = {
  ...OWNER_STUB,
  jobTitle: "Owner & Window Treatment Specialist",
  description:
    "Luxe Window Works brings 24 years in custom window treatments to product selection, measuring and installation, serving homeowners in North Idaho, on Seattle's Eastside, and in the Salt Lake area from consultation through finished installation, to the same standard in every market.",
  url: PAGE_URL,
  image: `${BUSINESS.url}/images/mark-photo.webp`,
  telephone: BUSINESS.phoneE164,
  email: BUSINESS.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: BUSINESS.address.city,
    addressRegion: BUSINESS.address.state,
    postalCode: BUSINESS.address.zip,
    addressCountry: "US",
  },
  worksFor: { "@id": `${BUSINESS.url}/#business` },
  sameAs: ["https://www.linkedin.com/in/mark-abplanalp-46a272371/"],
  hasOccupation: {
    "@type": "Occupation",
    name: "Window Treatment Specialist",
    startDate: "2002",
    occupationLocation: cityRef("Post Falls"),
    skills:
      "Custom window treatment design, plantation shutter installation, motorized shade systems, cellular shades, solar shades, roller shades, fenestration consulting, UV mitigation, commercial window treatments, exterior solar shades, outdoor aluminum shutters, lockable shutter configurations",
  },
  knowsAbout: [
    "Custom window treatments",
    "Plantation shutters",
    "Cellular shades",
    "Motorized window treatments",
    "Solar shades",
    "Roller shades",
    "Window treatment installation",
    "Energy efficient window coverings",
    "Fenestration design",
    "Commercial window treatments",
    "UV mitigation",
    "Heat reduction window coverings",
    "Exterior solar shades",
    "Outdoor aluminum shutters",
    "Lockable Weatherwell Elite shutter configurations",
    "Covered patio shade and privacy",
    "Hunter Douglas window treatments",
    "PowerView automation",
    "TWO shutters, shades and automation",
    "Alta Window Fashions",
    "Norman Window Fashions",
    "Lafayette Interior Fashions",
    "Corradi USA exterior shading systems",
  ],
};

const webpageSchema = {
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "About Mark Abplanalp | 24 Years in Window Treatments",
  description:
    "Luxe Window Works brings 24 years of experience to custom window treatments and outdoor shading projects across North Idaho, Seattle's Eastside, and the Salt Lake area.",
  isPartOf: { "@id": `${BUSINESS.url}/#website` },
  about: { "@id": `${BUSINESS.url}/#business` },
  mainEntity: { "@id": `${BUSINESS.url}/#owner` },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${BUSINESS.url}/images/mark-photo.webp`,
    width: 1024,
    height: 1536,
  },
  mentions: CARRIED_BRANDS,
  inLanguage: "en-US",
};

const breadcrumbSchema = {
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url },
    { "@type": "ListItem", position: 2, name: "About", item: PAGE_URL },
  ],
};

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [personSchema, webpageSchema, breadcrumbSchema],
        }}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      {/* A div, not <main>: the layout already provides the single <main>
          landmark, and nesting a second one is invalid and confuses the
          "skip to main content" target. */}
      <div className="bg-white">
        {/* Intro. Carries the page's h1 — the previous version of this page had
            none at all, only h2s, which gave up a ranking signal on a page that
            targets the core service term. */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Image
                src="/images/mark-photo.webp"
                alt="Mark Abplanalp, Owner and Installer at Luxe Window Works"
                width={600}
                height={700}
                className="rounded-2xl object-cover w-full"
                priority
              />
            </div>
            <div className="space-y-6 text-warm-gray-700 leading-relaxed">
              <p className="text-sm uppercase tracking-widest text-gold-dark font-medium">
                Why Luxe Window Works
              </p>
              <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
                Custom Window Treatments, Backed by 24 Years of Experience
              </h1>
              <p>
                Luxe Window Works measures, sources, and installs custom window
                treatments in{" "}
                <Link href="/areas" className="text-gold-dark hover:text-charcoal transition-colors">North Idaho</Link>,{" "}
                on{" "}
                <Link href="/eastside" className="text-gold-dark hover:text-charcoal transition-colors">Seattle&apos;s Eastside</Link>,{" "}
                in{" "}
                <Link href="/areas/salt-lake-city" className="text-gold-dark hover:text-charcoal transition-colors">Salt Lake City</Link>,
                and in surrounding communities.
                Consultations are free and done at your house, because the right
                recommendation depends on the light, the view, and the actual
                windows.
              </p>
              <div>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center bg-gold text-white px-8 py-4 rounded-full font-semibold hover:bg-gold-dark transition-colors"
                >
                  Book a Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How we work */}
        <section className="bg-cream border-t border-warm-gray-200 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-10">
              How we work
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Timelines you can plan around.",
                  body: "Custom shades run about four weeks from order to installation. Shutters and custom drapery can take up to eight. You get that time frame before you order, and if it changes on the manufacturer's end, you hear it from us instead of finding out when nothing shows up.",
                },
                {
                  title: "One price, quoted once.",
                  body: "We don't inflate a list price so we can advertise 40% off it later. You get one number for what the product costs, and it's the same number any other customer would get for the same job. We'll look at a competing bid if you have one.",
                },
                {
                  title: "A lifetime installation guarantee.",
                  body: "For as long as you own the home: if a bracket pulls loose, a headrail sags, or anything about the way we mounted it stops holding, we come back and fix it at no charge.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="font-semibold text-charcoal mb-3">{item.title}</h3>
                  <p className="text-warm-gray-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products that work in this climate */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">
              Products that work in this climate
            </h2>
            <div className="space-y-6 text-warm-gray-700 leading-relaxed">
              <p>
                Windows here have to do two opposite jobs. In July, west- and
                south-facing glass brings in glare and heat all afternoon and
                fades whatever it lands on. In January, that same glass is the
                coldest surface in the house. A lot of homes in this area were
                also built around the view, with large windows nobody wants to
                cover permanently.
              </p>
              <p>
                That&apos;s what makes the product choice matter: which{" "}
                <Link href="/products/cellular-shades" className="text-gold-dark hover:text-charcoal transition-colors">cellular shade</Link>{" "}
                actually holds heat, where a{" "}
                <Link href="/products/solar-shades" className="text-gold-dark hover:text-charcoal transition-colors">solar shade</Link>{" "}
                is worth the cost, and which rooms need light control rather
                than insulation.
              </p>
              <p>
                We carry every category —{" "}
                <Link href="/products/blinds" className="text-gold-dark hover:text-charcoal transition-colors">blinds</Link>,
                cellular shades, solar and exterior solar shades, roller,
                banded, and roman shades,{" "}
                <Link href="/products/shutters" className="text-gold-dark hover:text-charcoal transition-colors">shutters</Link>, and{" "}
                <Link href="/products/motorization" className="text-gold-dark hover:text-charcoal transition-colors">motorization</Link>{" "}
                — from Hunter Douglas, Alta, Norman, Lafayette, Corradi USA, and The Window
                Outfitters. That matters because a company carrying one line has
                to recommend that line for every window in the house.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                "Hunter Douglas",
                "Alta Window Fashions",
                "Norman Window Fashions",
                "Lafayette Interior Fashions",
                "Corradi USA",
                "The Window Outfitters",
              ].map((brand) => (
                <span
                  key={brand}
                  className="bg-white border border-warm-gray-200 text-warm-gray-700 text-sm px-4 py-2 rounded-full"
                >
                  {brand}
                </span>
              ))}
            </div>
            <div className="mt-10">
              <h3 className="font-serif text-2xl md:text-3xl text-charcoal mb-5">
                More room to enjoy the outdoors
              </h3>
              <div className="space-y-6 text-warm-gray-700 leading-relaxed">
                <p>
                  Your living space doesn’t have to end at the patio door.{" "}
                  <Link href="/products/two" className="text-gold-dark hover:text-charcoal transition-colors">TWO’s outdoor shades and aluminum shutters</Link>{" "}
                  help turn covered patios and decks into more comfortable, private
                  spaces—giving you more opportunities to relax, entertain, and enjoy the view.
                </p>
                <p>
                  For homeowners who spend winters elsewhere, lockable{" "}
                  <Link href="/products/aluminum-shutters" className="text-gold-dark hover:text-charcoal transition-colors">Weatherwell Elite aluminum shutters</Link>{" "}
                  can also add a layer of security while you’re away. We’ll help you
                  choose the right configuration for your space, balancing shade,
                  airflow, privacy, and protection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The experience behind Luxe */}
        <section className="bg-cream border-t border-warm-gray-200 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">
              The experience behind Luxe
            </h2>
            <div className="space-y-6 text-warm-gray-700 leading-relaxed">
              <p>
                With 24 years in custom window treatments, owner Mark Abplanalp
                brings practical knowledge and a hands-on standard to Luxe
                Window Works. From choosing the right fabrics and features to
                measuring and installation, the Luxe team helps you make
                confident decisions for your home and budget.
              </p>
              <p>
                Luxe Window Works works with you from the first consultation
                through the finished installation, and holds the same standard
                of service in every market we serve.
              </p>
            </div>
          </div>
        </section>

        {/* Get a quote */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
              Get a quote
            </h2>
            <p className="text-warm-gray-600 mb-8">
              Free in-home consultations throughout every market we serve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="bg-gold text-white px-8 py-4 rounded-full font-semibold hover:bg-gold-dark transition-colors"
              >
                Book a Free Consultation
              </Link>
              <Link
                href={BUSINESS.phoneHref}
                className="border border-warm-gray-300 text-charcoal px-8 py-4 rounded-full font-semibold hover:bg-cream transition-colors"
              >
                Call {BUSINESS.phone}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
