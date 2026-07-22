import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.luxewindowworks.com",
  },
};
import { BUSINESS, PRODUCTS, SERVICE_AREAS, REVIEWS } from "@/lib/constants";
import { OWNER_STUB } from "@/lib/schema";
import { productPages } from "@/lib/product-data";

/**
 * Image for each product card. Pulled from productPages so the homepage card and
 * the product-page hero stay in sync — clicking a card lands on the same photo.
 * Motorization has no still image (uses a YouTube video on its product page),
 * so we fall back to the YouTube thumbnail.
 */
function getProductCardImage(slug: string): string {
  const p = productPages[slug];
  if (p?.image) return p.image;
  if (p?.video) return `https://img.youtube.com/vi/${p.video.youtubeId}/maxresdefault.jpg`;
  return "/images/hero-modern-living.webp";
}

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const BASE = "https://www.luxewindowworks.com";

const businessNode = {
  "@type": ["HomeAndConstructionBusiness", "LocalBusiness", "Organization"],
  "@id": `${BASE}/#business`,
  name: BUSINESS.name,
  legalName: "Luxe Window Works LLC",
  description:
    "Premium custom window treatments in North Idaho — 24 years of installer expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint.",
  url: BASE,
  telephone: BUSINESS.phoneE164,
  email: BUSINESS.email,
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
    streetAddress: BUSINESS.address.street,
    addressLocality: BUSINESS.address.city,
    addressRegion: BUSINESS.address.state,
    postalCode: BUSINESS.address.zip,
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.geo.lat,
    longitude: BUSINESS.geo.lng,
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
    BUSINESS.google.mapsUrl,
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: BUSINESS.google.rating.toFixed(1),
    reviewCount: String(BUSINESS.google.reviewCount),
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

const websiteNode = {
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: BUSINESS.name,
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
    "Custom blinds, shades, shutters, and motorized window treatments in Coeur d'Alene, Post Falls, and Northern Idaho. 24 years of installer expertise. Lifetime installation guarantee.",
  isPartOf: { "@id": `${BASE}/#website` },
  about: { "@id": `${BASE}/#business` },
  mainEntity: { "@id": `${BASE}/#business` },
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

const homepageGraph = {
  "@context": "https://schema.org",
  "@graph": [
    businessNode,
    OWNER_STUB,
    websiteNode,
    webpageNode,
    faqPageNode,
  ],
};

/** Homepage-only short product descriptions (override of constants for scan-mode). */
const HOMEPAGE_PRODUCT_COPY: Record<string, string> = {
  "blinds":
    "Classic wood, faux wood, and composite blinds for clean light control, privacy, and everyday durability.",
  "cellular-shades":
    "Energy-efficient honeycomb shades that help reduce winter heat loss and summer heat gain.",
  "solar-shades":
    "Glare and UV control for bright rooms where you still want to preserve the view.",
  "exterior-solar-shades":
    "Motorized exterior screens that stop heat before it reaches the glass — ideal for patios, decks, and sun-exposed windows.",
  "roller-shades":
    "Clean, modern shades for simple light control and a minimal look.",
  "banded-shades":
    "A flexible option for shifting between privacy and filtered light throughout the day.",
  "roman-shades":
    "Soft fabric shades that add warmth, texture, and a more finished designer look.",
  "shutters":
    "A long-term upgrade with strong light control, architectural character, and lasting value.",
  "motorization":
    "Control hard-to-reach or everyday shades by remote, wall switch, app, or smart home system.",
};

function SunIcon() {
  return (
    <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5z" />
    </svg>
  );
}

function RemoteIcon() {
  return (
    <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <rect x="7.5" y="3" width="9" height="18" rx="2" />
      <path strokeLinecap="round" d="M10.5 8h3M10.5 12h3" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

const PROBLEM_PATHS = [
  {
    title: "Too Much Heat or Glare",
    body: "Reduce harsh sun, UV exposure, and room overheating.",
    href: "/products/solar-shades",
    Icon: SunIcon,
  },
  {
    title: "Need More Privacy Without Losing Light",
    body: "Find the right balance of privacy, filtered light, and views.",
    href: "/products/banded-shades",
    Icon: EyeIcon,
  },
  {
    title: "Better Sleep or Blackout",
    body: "Create darker bedrooms and better light control where it matters most.",
    href: "/products/cellular-shades",
    Icon: MoonIcon,
  },
  {
    title: "Want Motorized Shades",
    body: "Control everyday or hard-to-reach shades by remote, app, wall switch, or smart home system.",
    href: "/products/motorization",
    Icon: RemoteIcon,
  },
] as const;

const PROCESS_STEPS = [
  {
    title: "We Bring the Samples to You",
    body: "See colors, fabrics, opacity levels, slat sizes, and product options in your actual home — not under showroom lighting.",
    image: "/images/process-samples.png",
    alt: "Fabric, color, and material samples laid out on a kitchen island during an in-home consultation",
  },
  {
    title: "We Help You Choose Room by Room",
    body: "Every window has a different job. We help you think through privacy, glare, insulation, blackout, child safety, motorization, and style.",
    image: "/images/process-room-by-room.png",
    alt: "Open-plan North Idaho home with different window treatments matched to each room",
  },
  {
    title: "We Measure and Install Everything",
    body: "No guesswork. No uneven brackets. No products that almost fit. Your treatments are professionally measured, installed, and backed by our lifetime installation guarantee.",
    image: "/images/process-measure-install.png",
    alt: "Measuring tape extended next to fabric samples and window treatments",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageGraph) }}
      />

      {/* 1. Hero */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden min-h-[600px] md:min-h-[700px] lg:min-h-[75vh] xl:min-h-[82vh] 2xl:min-h-[88vh] flex items-center">
        <Image
          src="/images/hero-modern-living.webp"
          alt="Modern living room with custom cellular shades and a mountain view"
          fill
          className="object-cover object-center"
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
              Custom Window Treatments. 24 Years of Selling, Designing, and Installing Them.
            </h1>
            <p className="mt-6 md:mt-8 text-lg md:text-xl text-warm-gray-200 leading-relaxed max-w-2xl">
              You don&apos;t need to know which window treatment to buy. I bring the options to your home, help you choose what works room by room, measure everything, and install it with a lifetime guarantee.
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
              <Link
                href="/show-me-my-options"
                className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
              >
                Show Me My Options
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all border border-white/30 hover:border-white/60 backdrop-blur-sm"
              >
                Book a Free In-Home Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="bg-charcoal text-white py-5">
        <div className="container-luxe">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm md:text-base">
            <span className="text-warm-gray-300">{BUSINESS.experience}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">{BUSINESS.guarantee}</span>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <span className="text-warm-gray-300">
                {BUSINESS.google.rating.toFixed(1)} Google Rating
              </span>
            </div>
            <span className="hidden md:inline text-warm-gray-600">|</span>
            <span className="text-warm-gray-300">Serving North Idaho</span>
          </div>
        </div>
      </section>

      {/* 2b. Featured testimonial — early social proof */}
      <section className="py-14 md:py-20 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <div className="flex justify-center gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} />
            ))}
          </div>
          <blockquote className="font-serif text-2xl md:text-3xl text-charcoal leading-snug italic">
            &ldquo;His design recommendation proved to be perfect.&rdquo;
          </blockquote>
          <p className="mt-5 text-sm text-warm-gray-500 font-medium tracking-wide">
            — Brad G.
          </p>
        </div>
      </section>

      {/* 3. A Simpler Way to Buy — process explainer */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              A Simpler Way to Buy Custom Window Treatments
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="group bg-white rounded-2xl border border-warm-gray-200/60 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-warm-gray-100">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center mb-5">
                    <span className="font-serif text-lg text-gold font-semibold">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-charcoal leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-warm-gray-600 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3b. Problem-first — start with the problem, get to the right product */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              What Are You Trying to Solve?
            </h2>
            <p className="mt-4 text-lg text-warm-gray-600 leading-relaxed">
              Start with the problem. We&apos;ll help you find the right treatment.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PROBLEM_PATHS.map((path) => (
              <Link
                key={path.title}
                href={path.href}
                className="group bg-white rounded-2xl border border-warm-gray-200/60 p-8 hover:shadow-lg hover:border-gold/30 transition-all flex flex-col"
              >
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                  <path.Icon />
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors leading-snug">
                  {path.title}
                </h3>
                <p className="mt-3 text-sm text-warm-gray-500 leading-relaxed flex-1">
                  {path.body}
                </p>
                <span className="inline-flex items-center gap-1 mt-5 text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                  See what works
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

      {/* 4. Products */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              Solutions for Every Window in Your Home
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-2xl border border-warm-gray-200/60 overflow-hidden hover:shadow-lg hover:border-gold/30 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-warm-gray-100">
                  <Image
                    src={getProductCardImage(product.slug)}
                    alt={`${product.name} — installed by Luxe Window Works`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-warm-gray-500 leading-relaxed">
                    {HOMEPAGE_PRODUCT_COPY[product.slug] ?? product.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-charcoal group-hover:text-gold transition-colors">
                    Learn more
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Reviews */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-gold font-medium text-sm uppercase tracking-widest mb-4">
              What Our Clients Say
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              North Idaho Homeowners Trust Luxe Window Works
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
          <div className="mt-12 text-center">
            <a
              href={BUSINESS.google.mapsUrl}
              target="_blank"
              rel="noopener nofollow"
              className="inline-flex items-center gap-2 text-charcoal hover:text-gold font-medium transition-colors group"
            >
              <span className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </span>
              Read all {BUSINESS.google.reviewCount} reviews on Google
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* 6. Why Luxe */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="container-luxe max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              Why Choose Luxe Window Works?
            </h2>
          </div>
          <div className="space-y-6 text-lg text-warm-gray-600 leading-relaxed">
            <p>
              With 24 years of hands-on installation experience, Luxe Window Works helps North Idaho homeowners avoid the most common window treatment mistakes: poor measurements, wrong product choices, bad light gaps, harsh glare, and treatments that do not fit the way the room actually lives.
            </p>
            <p>
              We are not here to push one product. We help you choose what works — for your windows, your home, your budget, and the way you use each room.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Service Areas */}
      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal leading-tight">
              Proudly Serving North Idaho
            </h2>
            <p className="mt-4 text-warm-gray-500 text-base md:text-lg leading-relaxed">
              Luxe Window Works provides in-home consultations and professional installation throughout Post Falls, Coeur d&apos;Alene, Hayden, Rathdrum, Sandpoint, and surrounding North Idaho communities.
            </p>
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

      {/* 8. FAQ */}
      <section className="py-16 md:py-20 bg-cream">
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

      {/* 9. Final CTA */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
            Let&apos;s Find What Works for Your Home
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            Tell us what you are trying to solve — privacy, heat, glare, blackout, style, or motorization — and we will help you choose the right treatment for each window.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Schedule Your Free Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
