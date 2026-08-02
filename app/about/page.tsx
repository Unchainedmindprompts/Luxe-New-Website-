import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";
import { OWNER_STUB } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Mark Abplanalp | 24 Years in Window Treatments",
  description:
    "Mark Abplanalp has installed window treatments since 2002 — from Seattle to Bend to Apple retail. Now serving North Idaho from Post Falls with Luxe Window Works.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/about",
  },
  openGraph: {
    title: "About Mark Abplanalp | 24 Years in Window Treatments",
    description:
      "24 years of window treatment expertise. Apple Visitor Center. Union Square. Now Post Falls, Idaho.",
    url: "https://www.luxewindowworks.com/about",
    images: [
      {
        url: "/images/mark-photo.webp",
        width: 1200,
        height: 630,
        alt: "Mark Abplanalp, Owner of Luxe Window Works",
      },
    ],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  ...OWNER_STUB,
  jobTitle: "Owner & Window Treatment Specialist",
  description:
    "Mark Abplanalp has worked in the window treatment industry since 2002 — 24 years of hands-on sales, design, and installation experience across Washington, Oregon, and Idaho. He opened his first window treatment business in Issaquah, Washington in April 2002, expanded into Bend, Oregon in 2015, and in 2023 traveled the country installing high-end window treatments for Apple retail locations including the Apple Visitor Center in Cupertino and Apple Union Square in San Francisco. He launched Luxe Window Works in Post Falls, Idaho in March 2025.",
  url: `${BUSINESS.url}/about`,
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
  hasOccupation: {
    "@type": "Occupation",
    name: "Window Treatment Specialist",
    startDate: "2002",
    occupationLocation: {
      "@type": "City",
      name: "Post Falls",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    skills:
      "Custom window treatment design, plantation shutter installation, motorized shade systems, cellular shades, solar shades, roller shades, fenestration consulting, UV mitigation, commercial window treatments, exterior solar shades",
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
    "Alta Window Fashions",
    "Norman Window Fashions",
    "Lafayette Interior Fashions",
    "Corradi USA exterior shading systems",
  ],
};

const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BUSINESS.url}/about#webpage`,
  url: `${BUSINESS.url}/about`,
  name: "About Mark Abplanalp | 24 Years in Window Treatments",
  description:
    "Mark Abplanalp has installed window treatments since 2002 — from Seattle to Bend to Apple retail. Now serving North Idaho from Post Falls with Luxe Window Works.",
  isPartOf: { "@id": `${BUSINESS.url}/#website` },
  about: { "@id": `${BUSINESS.url}/#business` },
  mainEntity: { "@id": `${BUSINESS.url}/#owner` },
  inLanguage: "en-US",
};

export default function AboutPage() {
  return (
    <>
      {/* JsonLd, not next/script. <Script> defers to the client, so this
          page's schema lived only in the RSC payload and never appeared in the
          server-rendered HTML a crawler receives — meaning the owner Person
          entity, the site's whole E-E-A-T signal, was effectively invisible.
          JsonLd emits a real <script type="application/ld+json"> during SSR. */}
      <JsonLd data={personSchema} />
      <JsonLd data={webpageSchema} />
      <main className="bg-white">
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
                Custom Window Treatments for North Idaho Homes
              </h1>
              <p>
                Luxe Window Works measures, sources, and installs custom window
                treatments in{" "}
                <Link href="/areas/coeur-d-alene" className="text-gold-dark hover:text-charcoal transition-colors">Coeur d&apos;Alene</Link>,{" "}
                <Link href="/areas/post-falls" className="text-gold-dark hover:text-charcoal transition-colors">Post Falls</Link>,{" "}
                <Link href="/areas/hayden" className="text-gold-dark hover:text-charcoal transition-colors">Hayden</Link>,{" "}
                <Link href="/areas/rathdrum" className="text-gold-dark hover:text-charcoal transition-colors">Rathdrum</Link>, and{" "}
                <Link href="/areas/sandpoint" className="text-gold-dark hover:text-charcoal transition-colors">Sandpoint</Link>.
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
                  body: "We don't inflate a list price so we can advertise 40% off it later. You get one number for what the product costs, and it's the same number any other customer would get for the same job. It's also among the most competitive in North Idaho, and we'll look at a competing bid if you have one.",
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
                — from Alta, Norman, Lafayette, Corradi USA, and The Window
                Outfitters. That matters because a company carrying one line has
                to recommend that line for every window in the house.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {[
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
          </div>
        </section>

        {/* The experience behind it */}
        <section className="bg-cream border-t border-warm-gray-200 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-6">
              The experience behind it
            </h2>
            <div className="space-y-6 text-warm-gray-700 leading-relaxed">
              <p>
                Luxe Window Works is owned by Mark Abplanalp, who has worked in
                this trade since 2002 — first in Issaquah, Washington, then
                Bend, Oregon, and in North Idaho since 2025. In 2023, that work
                included commercial installations at Apple retail locations
                nationwide, including the Apple Visitor Center in Cupertino and
                Apple Union Square in San Francisco.
              </p>
              <p>
                Twenty-four years of measuring and installing is the reason we
                can put a lifetime guarantee on the work.
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
              Free in-home consultations throughout North Idaho.
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
      </main>
    </>
  );
}
