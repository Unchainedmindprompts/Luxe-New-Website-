import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import YoutubeEmbed from "@/components/YoutubeEmbed";
export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.luxewindowworks.com",
  },
};
import { BUSINESS, PRODUCTS, SERVICE_AREAS, REVIEWS } from "@/lib/constants";

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const BASE = "https://www.luxewindowworks.com";

const businessNode = {
  "@type": ["HomeAndConstructionBusiness", "LocalBusiness"],
  "@id": `${BASE}/#business`,
  name: "Luxe Window Works",
  legalName: "Luxe Window Works LLC",
  description:
    "Premium custom window treatments in Northern Idaho, backed by 23 years of installation expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint. Free in-home consultation.",
  url: BASE,
  telephone: BUSINESS.phoneE164,
  email: "mark@luxewindowworks.com",
  priceRange: "$$",
  foundingDate: "2025",
  image: {
    "@type": "ImageObject",
    url: `${BASE}/images/hero-modern-living.webp`,
    contentUrl: `${BASE}/images/hero-modern-living.webp`,
    width: 900,
    height: 780,
  },
  logo: {
    "@type": "ImageObject",
    "@id": `${BASE}/#logo`,
    url: `${BASE}/icon.png`,
    contentUrl: `${BASE}/icon.png`,
    caption: "Luxe Window Works",
  },
  founder: { "@id": `${BASE}/#owner` },
  address: {
    "@type": "PostalAddress",
    streetAddress: "2972 N Pavo Ln",
    addressLocality: "Post Falls",
    addressRegion: "ID",
    postalCode: "83854",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "47.736435",
    longitude: "-116.879122",
  },
  areaServed: [
    {
      "@type": "AdministrativeArea",
      name: "North Idaho",
      alternateName: "Northern Idaho",
      sameAs: "https://en.wikipedia.org/wiki/Idaho_Panhandle",
    },
    {
      "@type": "AdministrativeArea",
      name: "Kootenai County",
      sameAs: "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    {
      "@type": "City",
      name: "Coeur d'Alene",
      sameAs: "https://en.wikipedia.org/wiki/Coeur_d%27Alene,_Idaho",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Kootenai County",
        containedInPlace: { "@type": "State", name: "Idaho" },
      },
    },
    {
      "@type": "City",
      name: "Post Falls",
      sameAs: "https://en.wikipedia.org/wiki/Post_Falls,_Idaho",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Kootenai County",
        containedInPlace: { "@type": "State", name: "Idaho" },
      },
    },
    {
      "@type": "City",
      name: "Hayden",
      sameAs: "https://en.wikipedia.org/wiki/Hayden,_Idaho",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Kootenai County",
        containedInPlace: { "@type": "State", name: "Idaho" },
      },
    },
    {
      "@type": "City",
      name: "Rathdrum",
      sameAs: "https://en.wikipedia.org/wiki/Rathdrum,_Idaho",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Kootenai County",
        containedInPlace: { "@type": "State", name: "Idaho" },
      },
    },
    {
      "@type": "City",
      name: "Sandpoint",
      sameAs: "https://en.wikipedia.org/wiki/Sandpoint,_Idaho",
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Bonner County",
        containedInPlace: { "@type": "State", name: "Idaho" },
      },
    },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  sameAs: [
    "https://www.google.com/maps/place/Luxe+Window+Works+LLC/@47.7363916,-116.8816972,17z/data=!3m1!4b1!4m6!3m5!1s0x617bcf2eafa50481:0xb488fb56afcb0982!8m2!3d47.7363916!4d-116.8791223!16s%2Fg%2F11m71mk1yq",
    "https://www.bing.com/maps/search?name=Luxe+Window+Works+LLC&trfc=&mepi=139%7E%7EEmbedded%7ELargeMapLink&FORM=MPSRPL&style=r&q=Luxe+Window+Works+LLC&ss=id.ypid%3AYN6F9E5AD2DAFE5C39&ppois=47.73643493652344_-116.87911987304688_Luxe+Window+Works+LLC&cp=47.736435%7E-116.879120&lvl=15",
    "https://maps.apple.com/place?place-id=I907802082955E66F&address=2972+N+Pavo+Ln%2C+Post+Falls%2C+ID++83854%2C+United+States&coordinate=47.736435%2C-116.879122&name=Luxe+Window+Works&_provider=9902",
    "https://www.yelp.com/biz/luxe-window-works-post-falls",
    "https://www.bbb.org/us/id/post-falls/profile/blinds/luxe-window-works-llc-1296-1000188314",
    "https://www.yellowpages.com/post-falls-id/mip/luxe-window-works-llc-579719675",
    "https://www.youtube.com/@LuxeWindowWorks7",
    "https://www.instagram.com/luxewindowworks",
    "https://www.facebook.com/profile.php?id=61573190815920",
    "https://www.houzz.com/pro/webuser-472935533/luxe-window-works-llc",
    "https://nextdoor.com/page/luxe-window-works-llc-post-falls-id/",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "15",
    bestRating: "5",
    worstRating: "1",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Window Treatments",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Blinds",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Horizontal Blinds" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wood Blinds" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Faux Wood Blinds", url: `${BASE}/shop/faux-wood-blinds` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Composite Blinds" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Composite Wood Blinds" } },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Shades",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cellular Shades", url: `${BASE}/products/cellular-shades` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Solar Shades", url: `${BASE}/products/solar-shades` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Roller Shades", url: `${BASE}/products/roller-shades` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Banded Shades", url: `${BASE}/products/banded-shades` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Roman Shades", url: `${BASE}/products/roman-shades` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Exterior Solar Shades", url: `${BASE}/products/exterior-solar-shades` } },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Shutters",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Norman Plantation Shutters", url: `${BASE}/products/shutters` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Aluminum Shutters" } },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Motorization",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Motorized Shades & Blinds", url: `${BASE}/products/motorization` } },
        ],
      },
    ],
  },
};

const personNode = {
  "@type": "Person",
  "@id": `${BASE}/#owner`,
  name: "Mark Abplanalp",
  jobTitle: "Owner & Window Treatment Specialist",
  description:
    "Mark Abplanalp has worked in the window treatment industry since 2002 — 23 years of hands-on sales, design, and installation experience across Washington, Oregon, and Idaho. He opened his first window treatment business in Issaquah, Washington in April 2002, expanded into Bend, Oregon in 2015, and in 2023 traveled the country installing high-end window treatments for Apple retail locations including the Apple Visitor Center in Cupertino and Apple Union Square in San Francisco. He launched Luxe Window Works in Post Falls, Idaho in March 2025.",
  url: `${BASE}/about`,
  image: `${BASE}/images/mark-photo.webp`,
  telephone: BUSINESS.phoneE164,
  email: "mark@luxewindowworks.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Post Falls",
    addressRegion: "ID",
    postalCode: "83854",
    addressCountry: "US",
  },
  worksFor: { "@id": `${BASE}/#business` },
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
  areaServed: [
    "Coeur d'Alene, Idaho",
    "Post Falls, Idaho",
    "Hayden, Idaho",
    "Sandpoint, Idaho",
    "Rathdrum, Idaho",
    "Kootenai County, Idaho",
    "North Idaho",
    "Northern Idaho",
  ],
};

const websiteNode = {
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: "Luxe Window Works",
  description:
    "Custom window treatments in Northern Idaho — blinds, shades, shutters, and motorized systems. Direct online ordering of custom Norman shades.",
  publisher: { "@id": `${BASE}/#business` },
  inLanguage: "en-US",
};

const webpageNode = {
  "@type": "WebPage",
  "@id": `${BASE}/#webpage`,
  url: BASE,
  name: "Premium Custom Window Treatments in Northern Idaho | Luxe Window Works",
  description:
    "Custom blinds, shades, shutters, and motorized window treatments in Coeur d'Alene, Post Falls, and Northern Idaho. 23 years of expertise. Lifetime installation guarantee.",
  isPartOf: { "@id": `${BASE}/#website` },
  about: { "@id": `${BASE}/#business` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${BASE}/images/hero-modern-living.webp`,
  },
  inLanguage: "en-US",
};

const HOMEPAGE_FAQS = [
  {
    question: "What areas does Luxe Window Works serve?",
    answer:
      "We serve Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint, and the surrounding Kootenai County area. Free in-home consultations are available throughout Northern Idaho.",
  },
  {
    question: "Can I buy custom window treatments online from Luxe Window Works?",
    answer:
      "Yes — we offer direct online ordering of custom Norman shades through our shop. Norman SmartPrivacy faux wood blinds and 9/16\" Portrait cellular shades can be configured to your exact width and height and shipped at cost. All other products — Lafayette, Corradi USA exterior shades, plantation shutters, and motorized systems — are quoted and professionally installed through an in-home consultation.",
  },
  {
    question: "What's included in the lifetime installation guarantee?",
    answer:
      "Every window treatment we professionally install is backed by a lifetime installation guarantee. If a treatment we installed develops any installation-related issue — a loose bracket, a misaligned headrail, anything tied to how it was put up — we come back and make it right for as long as you own the home.",
  },
  {
    question: "How does shipping work on online orders?",
    answer:
      "Shipping is passed through at actual freight cost — no markup. The flat rate is $25 for the first unit and $11 for each additional unit on the same order.",
  },
  {
    question: "Why do you recommend cellular shades for Northern Idaho homes?",
    answer:
      "Cellular (honeycomb) shades trap air inside their hexagonal cells, making them the most energy-efficient window covering available — R-values up to 7.86 on double-cell blackout configurations. In Northern Idaho's heating-dominated climate, that translates to meaningfully lower winter heat loss and reduced summer heat gain.",
  },
] as const;

const faqPageNode = {
  "@type": "FAQPage",
  "@id": `${BASE}/#faq`,
  isPartOf: { "@id": `${BASE}/#webpage` },
  mainEntity: HOMEPAGE_FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

const videoNode = {
  "@type": "VideoObject",
  "@id": `${BASE}/#video-overview`,
  name: "Premium Window Treatments for Northern Idaho Homes — Luxe Window Works",
  description:
    "Transform your view, elevate your lifestyle. At Luxe Window Works, we don't just cover windows—we craft custom solutions that enhance beauty, boost energy efficiency, and increase the value of your Northern Idaho home. From stunning shutters to smart shades, this showcase highlights what true window elegance looks like when design meets craftsmanship. Serving Post Falls, Coeur d'Alene, Hayden & beyond.",
  thumbnailUrl: "https://img.youtube.com/vi/8FiVnMSHuc4/maxresdefault.jpg",
  uploadDate: "2025-11-07",
  duration: "PT1M6S",
  embedUrl: "https://www.youtube.com/embed/8FiVnMSHuc4",
  contentUrl: "https://www.youtube.com/watch?v=8FiVnMSHuc4",
  publisher: { "@id": `${BASE}/#business` },
};

const homepageGraph = {
  "@context": "https://schema.org",
  "@graph": [
    businessNode,
    personNode,
    websiteNode,
    webpageNode,
    faqPageNode,
    videoNode,
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageGraph) }}
      />
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
        <Image
          src="/images/hero-modern-living.webp"
          alt="Modern living room with custom cellular shades and a mountain view"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-charcoal/55" />

        {/* Shop quick link — upper right of hero */}
        <div className="hidden md:block absolute top-28 right-6 lg:right-10 z-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-charcoal font-semibold pl-6 pr-5 py-3 rounded-full text-base shadow-md hover:shadow-lg transition-all"
          >
            Shop Online
            <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="container-luxe relative">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] tracking-tight text-balance">
              The right window treatment for every room in your home.
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl italic text-warm-gray-200 leading-relaxed max-w-2xl">
              We&apos;ll walk you through what works — and what doesn&apos;t.
            </p>

            {/* Mobile shop pill — desktop has it floating upper-right */}
            <div className="md:hidden mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-white/95 text-charcoal font-semibold px-5 py-2.5 rounded-full text-sm shadow-md"
              >
                Shop Online
                <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href={BUSINESS.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
              >
                208-660-8643 · Call Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="sms:+12086608643"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-charcoal font-semibold px-8 py-4 rounded-full text-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Text us a photo of your windows
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-charcoal text-white py-5">
        <div className="container-luxe">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <span className="text-warm-gray-300">
                {BUSINESS.google.rating} Stars · {BUSINESS.google.reviewCount} Google Reviews
              </span>
            </div>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">{BUSINESS.experience}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">{BUSINESS.guarantee}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">Serving North Idaho</span>
          </div>
        </div>
      </section>

      {/* Social Proof / Reviews */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
              What Our Clients Say
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              5.0 Stars Across Every Review
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl p-8 border border-warm-gray-200/60 shadow-sm ${
                  i === 0 ? "md:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <StarIcon key={j} />
                  ))}
                </div>
                <p className="text-charcoal leading-relaxed text-[15px]">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="mt-4 text-sm text-warm-gray-500 font-medium">
                  — {review.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="w-full">
        <YoutubeEmbed
          videoId="8FiVnMSHuc4"
          title="Luxe Window Works — Premium Window Treatments for Northern Idaho Homes"
        />
      </section>

      {/* Products Overview */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
              Solutions, Not Just Products
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              The Right Treatment for Every Window
            </h2>
            <p className="mt-4 text-warm-gray-500 text-lg">
              Each product solves a specific problem. We&apos;ll match the right one to your home,
              your light conditions, and your lifestyle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-2xl border border-warm-gray-200/60 p-6 hover:shadow-lg hover:border-gold/30 transition-all"
              >
                <div className="w-12 h-12 bg-cream rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-colors">
                  <svg className="w-6 h-6 text-warm-gray-500 group-hover:text-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gold font-medium">{product.tagline}</p>
                <p className="mt-2 text-sm text-warm-gray-500 leading-relaxed">
                  {product.shortDescription}
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                  Learn more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Strip */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="container-luxe">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
              Proudly Serving North Idaho
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {SERVICE_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="bg-white hover:bg-charcoal hover:text-white text-charcoal border border-warm-gray-200 px-6 py-3 rounded-full font-medium transition-all hover:shadow-md"
              >
                {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal">
              Frequently Asked Questions
            </h2>
          </div>
          <dl className="space-y-8">
            {HOMEPAGE_FAQS.map((f) => (
              <div key={f.question}>
                <dt className="font-serif text-lg md:text-xl text-charcoal leading-snug">
                  {f.question}
                </dt>
                <dd className="mt-2 text-base md:text-lg text-warm-gray-600 leading-relaxed">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
            Let&apos;s Find What Works for Your Home
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            23 years of expertise, zero pressure. We come to you, measure everything, and recommend
            exactly what fits your space, your style, and your budget.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Schedule Your Free Consultation
            </Link>
            <a
              href={BUSINESS.phoneHref}
              className="inline-flex items-center justify-center gap-2 border-2 border-warm-gray-600 text-white hover:border-white font-semibold px-8 py-4 rounded-full text-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {BUSINESS.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
