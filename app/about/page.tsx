import type { Metadata } from "next";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Mark Abplanalp | 23 Years of Window Treatment Expertise | Luxe Window Works",
  description:
    "Mark Abplanalp has been designing and installing window treatments since 2002 — from Seattle to Bend to Apple retail locations nationwide. Now serving Northern Idaho from Post Falls with Luxe Window Works.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/about",
  },
  openGraph: {
    title: "About Mark Abplanalp | Luxe Window Works",
    description:
      "23 years of window treatment expertise. Apple Visitor Center. Union Square. Now Post Falls, Idaho.",
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
  "@type": "Person",
  "@id": "https://luxewindowworks.com/about#mark-abplanalp",
  name: "Mark Abplanalp",
  jobTitle: "Owner & Window Treatment Specialist",
  description:
    "Mark Abplanalp has worked in the window treatment industry since 2002 — 23 years of hands-on sales, design, and installation experience across Washington, Oregon, and Idaho. He opened his first window treatment business in Issaquah, Washington in April 2002, expanded into Bend, Oregon in 2015, and in 2023 traveled the country installing high-end window treatments for Apple retail locations including the Apple Visitor Center in Cupertino and Apple Union Square in San Francisco. He launched Luxe Window Works in Post Falls, Idaho in March 2025.",
  url: "https://luxewindowworks.com/about",
  image: "https://www.luxewindowworks.com/_next/image?url=%2Fimages%2Fmark-photo.webp&w=3840&q=80",
  telephone: "208-660-8643",
  email: "mark@luxewindowworks.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Post Falls",
    addressRegion: "ID",
    postalCode: "83854",
    addressCountry: "US",
  },
  worksFor: {
    "@type": "LocalBusiness",
    "@id": "https://luxewindowworks.com/#business",
    name: "Luxe Window Works",
    url: "https://luxewindowworks.com",
  },
  foundingDate: "2002",
  hasOccupation: {
    "@type": "Occupation",
    name: "Window Treatment Specialist",
    occupationLocation: {
      "@type": "City",
      name: "Post Falls",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    skills:
      "Custom window treatment design, plantation shutter installation, motorized shade systems, cellular shades, solar shades, roller shades, fenestration consulting, UV mitigation, commercial window treatments, Lutron motorization, exterior solar shades",
  },
  knowsAbout: [
    "custom window treatments",
    "plantation shutters",
    "cellular shades",
    "motorized window treatments",
    "solar shades",
    "roller shades",
    "window treatment installation",
    "energy efficient window coverings",
    "fenestration design",
    "commercial window treatments",
    "UV mitigation",
    "heat reduction window coverings",
    "Lutron motorization",
    "exterior solar shades",
    "Hunter Douglas",
    "Alta Window Fashions",
    "Norman Window Fashions",
    "Lafayette Interior Fashions",
    "Corradi USA exterior shading systems",
  ],
  alumniOf: [],
  areaServed: [
    "Coeur d'Alene, Idaho",
    "Post Falls, Idaho",
    "Hayden, Idaho",
    "Sandpoint, Idaho",
    "Rathdrum, Idaho",
    "Northern Idaho",
  ],
  sameAs: [
    "https://www.yelp.com/biz/luxe-window-works-post-falls",
    "https://www.bbb.org/us/id/post-falls/profile/blinds/luxe-window-works-llc-1296-1000188314",
  ],
};

export default function AboutPage() {
  return (
    <>
      <Script
        id="person-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main className="bg-white">
        {/* Hero */}
        <section className="bg-stone-50 border-b border-stone-200 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm uppercase tracking-widest text-amber-700 font-medium mb-4">
              About Luxe Window Works
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-stone-900 leading-tight mb-6">
              Mark Abplanalp has been designing and installing window treatments since 2002 — across three states, two decades, and some of the most recognizable buildings in the world.
            </h1>
          </div>
        </section>

        {/* Main bio */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <Image
                src="/images/mark-photo.webp"
                alt="Mark Abplanalp, Owner and Installer at Luxe Window Works"
                width={600}
                height={700}
                className="rounded-lg object-cover w-full"
                priority
              />
            </div>
            <div className="space-y-6 text-stone-700 leading-relaxed">
              <p className="text-sm uppercase tracking-widest text-amber-700 font-medium">
                Why Luxe Window Works
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold text-stone-900 leading-tight">
                Built for Northern Idaho Homes
              </h2>
              <p>
                For 23 years, owner Mark Abplanalp has specialized in window treatments that perform in our unique climate — from intense summer sun reflecting off the lake to freezing winters that demand real insulation.
              </p>
              <p>
                Luxe Window Works was founded on that deep experience. We don&apos;t just sell products. We engineer complete solutions tailored to your home, your views, your lifestyle, and the specific challenges of Northern Idaho living. Every project includes precise measurements, expert recommendations, and professional installation backed by a lifetime guarantee.
              </p>
              <p>
                Homes throughout Coeur d&apos;Alene, Post Falls, Hayden, Rathdrum, and Sandpoint trust us because we understand this region — the lake-view glare, the temperature swings, and the practical needs of both new construction and established homes.
              </p>
              <div>
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center bg-amber-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-amber-800 transition-colors"
                >
                  Book a Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Expertise callouts */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-stone-900 mb-10">
              23 Years. Every Product Category. Every Project Type.
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Residential",
                  body: "From new construction in Post Falls to lakeside homes in Coeur d'Alene. Every window type, every budget, every style.",
                },
                {
                  title: "Commercial",
                  body: "High-end commercial fenestration projects including Apple retail locations. Understanding how light affects productivity, comfort, and wellbeing.",
                },
                {
                  title: "Exterior",
                  body: "Corradi USA exterior solar shades, awnings, and motorized aluminum pergola systems with rotating roofs.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-stone-200 rounded-lg p-6">
                  <h3 className="font-semibold text-stone-900 mb-3">{item.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="bg-stone-50 border-t border-stone-200 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-stone-900 mb-4">
              Brands Mark Has Worked With
            </h2>
            <p className="text-stone-600 mb-8">
              Over 23 years, Mark has sold and installed products from every major manufacturer in the industry. At Luxe, he carries the ones he trusts.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                "Lafayette Interior Fashions",
                "Norman Window Fashions",
                "Alta Window Fashions",
                "Hunter Douglas",
                "Graber",
                "Insolroll",
                "Lutron",
                "Corradi USA",
              ].map((brand) => (
                <span
                  key={brand}
                  className="bg-white border border-stone-200 text-stone-700 text-sm px-4 py-2 rounded-full"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-semibold text-stone-900 mb-4">
              Ready to Work With Someone Who Actually Knows Windows?
            </h2>
            <p className="text-stone-600 mb-8">
              Schedule a free in-home consultation with Mark. No pressure, no catalog overwhelm — just honest advice from someone who has been doing this for 23 years.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book"
                className="bg-amber-700 text-white px-8 py-4 rounded-lg font-medium hover:bg-amber-800 transition-colors"
              >
                Book a Free Consultation
              </Link>
              <Link
                href="tel:+12086608643"
                className="border border-stone-300 text-stone-800 px-8 py-4 rounded-lg font-medium hover:bg-stone-50 transition-colors"
              >
                Call 208-660-8643
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
