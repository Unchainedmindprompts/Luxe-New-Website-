import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
export const metadata: Metadata = {
  title: "Custom Window Treatments in Coeur d'Alene & Post Falls | Luxe Window Works",
  description:
    "Independent in-home consultations for custom blinds, shades, shutters, and motorization. We bring samples to your home across Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.",
  alternates: {
    canonical: "https://www.luxewindowworks.com",
  },
};
import { TrackedCta } from "@/components/TrackedCta";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { BUSINESS, SERVICE_AREAS, REVIEWS } from "@/lib/constants";
import { cityRef, northIdahoRef } from "@/lib/cities";
import { TWO_URL } from "@/lib/two";
import { BUSINESS_STUB, OWNER_STUB, productServiceRef } from "@/lib/schema";

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

const BASE = "https://www.luxewindowworks.com";

const businessNode = {
  ...BUSINESS_STUB,
  legalName: "Luxe Window Works LLC",
  description:
    "Premium custom window treatments in North Idaho — 24 years consulting, designing, and installing. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint.",
  url: BASE,
  telephone: BUSINESS.phoneE164,
  email: BUSINESS.email,
  priceRange: "$$",
  foundingDate: "2025",
  image: {
    "@type": "ImageObject",
    url: `${BASE}/images/hero-lake-room.webp`,
    contentUrl: `${BASE}/images/hero-lake-room.webp`,
    width: 1672,
    height: 941,
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
    // Everything here is a reference except the county. The five cities are
    // defined on their own /areas/{slug} pages; North Idaho is defined on the
    // /areas hub, which has no {slug} of its own but is the page that
    // represents the region. Their county containment moved into
    // lib/cities.ts so it travels with the entity instead of living only on
    // this page.
    //
    // Kootenai County stays a literal node: it is a different geographic
    // concept from the region, it has no page of its own, and collapsing it
    // into North Idaho would claim the two are the same place.
    northIdahoRef(),
    {
      "@type": "AdministrativeArea",
      name: "Kootenai County",
      sameAs: "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    ...SERVICE_AREAS.map((area) => cityRef(area.name)),
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
    "https://www.tiktok.com/@luxewindowworks77",
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
    // Identity added, entity unchanged. This catalog already existed and
    // already enumerated everything Luxe sells; it just had no @id, so nothing
    // could point at it. Articles now use it as their canonical subject rather
    // than each minting an anonymous Thing named "Custom Window Coverings".
    // No new entity is introduced — an existing one becomes referenceable.
    "@id": `${BASE}/#window-treatments`,
    name: "Window Treatments",
    // Product services and the TWO catalog retain their canonical identities.
    itemListElement: [
      { "@id": `${TWO_URL}#catalog` },
      {
        "@type": "OfferCatalog",
        name: "Blinds",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Horizontal Blinds" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Wood Blinds" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Faux Wood Blinds", url: `${BASE}/products/blinds` } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Composite Blinds" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Composite Wood Blinds" } },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Shades",
        itemListElement: [
          { "@type": "Offer", itemOffered: productServiceRef("cellular-shades") },
          { "@type": "Offer", itemOffered: productServiceRef("solar-shades") },
          { "@type": "Offer", itemOffered: productServiceRef("roller-shades") },
          { "@type": "Offer", itemOffered: productServiceRef("banded-shades") },
          { "@type": "Offer", itemOffered: productServiceRef("roman-shades") },
          { "@type": "Offer", itemOffered: productServiceRef("exterior-solar-shades") },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Shutters",
        itemListElement: [
          { "@type": "Offer", itemOffered: productServiceRef("shutters") },
          { "@type": "Offer", itemOffered: productServiceRef("aluminum-shutters") },
        ],
      },
      {
        "@type": "OfferCatalog",
        name: "Motorization",
        itemListElement: [
          { "@type": "Offer", itemOffered: productServiceRef("motorization") },
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
    "Custom window treatments in Northern Idaho — blinds, shades, shutters, and motorized systems. Free in-home consultation.",
  publisher: { "@id": `${BASE}/#business` },
  inLanguage: "en-US",
};

const webpageNode = {
  "@type": "WebPage",
  "@id": `${BASE}/#webpage`,
  url: BASE,
  name: "Premium Custom Window Treatments in Northern Idaho | Luxe Window Works",
  description:
    "Custom blinds, shades, shutters, and motorized window treatments in Coeur d'Alene, Post Falls, and Northern Idaho. 24 years consulting, designing, and installing. Lifetime installation guarantee.",
  isPartOf: { "@id": `${BASE}/#website` },
  about: { "@id": `${BASE}/#business` },
  mainEntity: { "@id": `${BASE}/#business` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${BASE}/images/hero-lake-room.webp`,
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
    question: "What's included in the lifetime installation guarantee?",
    answer:
      "Every window treatment we professionally install is backed by a lifetime installation guarantee. If a treatment we installed develops any installation-related issue — a loose bracket, a misaligned headrail, anything tied to how it was put up — we come back and make it right for as long as you own the home.",
  },
  {
    question: "Why do you recommend cellular shades for Northern Idaho homes?",
    answer:
      "Cellular (honeycomb) shades trap air inside their hexagonal cells, making them the most energy-efficient window covering available — R-values up to 7.86 on double-cell room darkening configurations. In Northern Idaho's heating-dominated climate, that translates to meaningfully lower winter heat loss and reduced summer heat gain.",
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

const PROBLEM_PATHS = [
  {
    title: "Too Much Heat or Glare",
    body: "Reduce harsh sun, UV exposure, and room overheating.",
    href: "/products/solar-shades",
    image: "/images/solutions/heat-glare.webp",
    alt: "Solar roller shades softening afternoon sunlight in a warm living room",
  },
  {
    title: "Need More Privacy Without Losing Light",
    body: "Find the right balance of privacy, filtered light, and views.",
    href: "/products/banded-shades",
    image: "/images/solutions/privacy-daylight.webp",
    alt: "Light-filtering banded shades in a bright sitting room",
  },
  {
    title: "Better Sleep or Room Darkening",
    body: "Create darker bedrooms and better light control where it matters most.",
    href: "/products/cellular-shades",
    image: "/images/solutions/blackout-bedroom.webp",
    alt: "Closed cellular room darkening shades in a softly lit bedroom",
  },
  {
    title: "Want Motorized Shades",
    body: "Control everyday or hard-to-reach shades by remote, app, wall switch, or smart home system.",
    href: "/products/motorization",
    image: "/images/solutions/motorized-shades.webp",
    alt: "A handheld remote controlling roller shades on tall living room windows",
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
    body: "Every window has a different job. We help you think through privacy, glare, insulation, room darkening, child safety, motorization, and style.",
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

      {/* Full-width hero featuring an actual Luxe installation. */}
      <section aria-labelledby="hero-title" className="bg-charcoal pt-16 md:pt-20">
        <div className="relative isolate w-full overflow-hidden">
          <Image
            src="/images/luxe-completed-installation.webp"
            alt="Actual Luxe Window Works installation: custom shades filtering daylight in a living room with timber beams and a stone fireplace"
            fill
            className="object-cover object-[35%_center] md:object-center"
            priority
            sizes="100vw"
            quality={90}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/35 md:bg-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 sm:px-10 py-16 md:py-24 lg:py-28 min-h-[640px] md:min-h-[680px] lg:min-h-[740px] flex flex-col justify-center">
            <div className="max-w-2xl text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90 mb-5">Custom Window Treatments · North Idaho</p>
              <h1 id="hero-title" className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-white text-balance">Beautiful options.<br />Personal service.<br />That’s Luxe.</h1>
              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white">Discover custom window treatments for your style and budget, with personal guidance from the first samples to the final installation.</p>
              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <TrackedCta href="/book" event={CONVERSION_EVENTS.ConsultCtaClick} className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-charcoal rounded-full px-7 py-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Request a Free Consultation</TrackedCta>
              </div>
            </div>
          </div>
          <p className="absolute z-10 bottom-4 left-6 sm:left-10 rounded-sm bg-charcoal/80 text-white px-3 py-2 text-[11px] sm:text-xs tracking-wide">An actual Luxe Window Works installation</p>
        </div>
      </section>

      {/* Trust banner */}
      <section className="bg-charcoal text-white py-5">
        <div className="container-luxe">
          {/* Tighter gaps and a slightly smaller step at md than before:
              "24 Years Consulting, Designing & Installing" is long enough that
              the previous gap-x-8 / text-base combination wrapped "Serving
              North Idaho" onto a second row around 2000px. */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 lg:gap-x-7 gap-y-3 text-sm lg:text-[15px]">
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

      {/* Featured TWO collection */}
      <section id="two-collection" aria-labelledby="two-collection-title" className="bg-warm-white pt-10 md:pt-16 scroll-mt-24">
        <div className="max-w-[1600px] mx-auto overflow-hidden bg-charcoal">
          <div className="grid grid-cols-3 gap-1">
            {[
              { src: "/images/two/highprofile-classic.webp", alt: "TWO Highprofile Classic interior wood shutters in a bright sitting room", label: "Interior Shutters" },
              { src: "/images/two/colourvue-living-natural.jpg", alt: "TWO Colourvue roller shades in a bright contemporary living room", label: "Roller Shades" },
              { src: "/images/weatherwell-elite/IMG_1086.jpeg", alt: "Dark TWO exterior aluminum shutters with folding panels on a modern home", label: "Exterior Shutters" },
            ].map((item) => (
              <figure key={item.label} className="min-w-0">
                <div className="relative aspect-[3/4] sm:aspect-[4/3]">
                  <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1600px) 533px, 33vw" className="object-cover" />
                </div>
                <figcaption className="px-2 py-3 sm:px-5 sm:py-4 text-center text-xs sm:text-base font-medium text-white">{item.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="border-t border-white/15 p-6 sm:p-10 lg:px-14 lg:py-12 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">New at Luxe Window Works</p>
              <h2 id="two-collection-title" className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight mt-3">Meet the TWO collection.</h2>
              <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/90">Interior shutters, roller shades, outdoor aluminum shutters, exterior shades and automation—six product families, with Luxe’s personal service.</p>
            </div>
            <Link href="/products/two" className="inline-flex self-start lg:self-center shrink-0 items-center justify-center rounded-full bg-cream text-charcoal px-7 py-4 font-semibold hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              Explore the Collection <span aria-hidden="true" className="ml-3">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured testimonial */}
      <section className="py-10 md:py-14 bg-warm-white">
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
          <p className="mt-6 text-warm-gray-600 leading-relaxed">
            Our experience in window treatments began in 2002. We have served North Idaho since 2025,
            bringing 24 years of hands-on knowledge to every consultation and installation.
          </p>
          <Link href="/about" className="inline-block mt-4 font-medium text-charcoal underline underline-offset-4">
            Meet the experience behind Luxe
          </Link>
        </div>
      </section>

      {/* Find the right treatment */}
      <section id="find-your-solution" className="py-20 md:py-28 bg-cream scroll-mt-24">
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
                className="group bg-white rounded-2xl border border-warm-gray-200/60 overflow-hidden hover:shadow-lg hover:border-gold/30 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-warm-gray-100">
                  <Image
                    src={path.image}
                    alt={path.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
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
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/products" className="inline-flex items-center justify-center gap-3 rounded-full bg-charcoal text-white px-7 py-4 font-semibold hover:bg-warm-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              Explore All Window Treatments <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Process and the Luxe experience */}
      <section className="py-20 md:py-28 bg-warm-white">
        <div className="container-luxe">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              A Simpler Way to Buy Custom Window Treatments
            </h2>
            <p className="mt-4 text-lg text-warm-gray-600 leading-relaxed">
              Personal guidance from your first look at samples to the final installation. We help you compare styles, materials, and features so you can choose confidently within your budget.
            </p>
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
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal">Not sure where to start?</h3>
            <p className="mt-4 text-base leading-relaxed text-warm-gray-600">Explore a selection of our best-value blinds and shades, compare options, and get a feel for your budget. Our instant estimator is a simple place to begin.</p>
            <Link href="/estimate" className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-charcoal text-white px-7 py-4 font-semibold hover:bg-warm-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              Explore the Instant Estimator <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-warm-gray-600">No pressure. No email required. Professional measuring and installation included in your estimate.</p>
          </div>
        </div>
      </section>

      {/* Customer reviews */}
      <section className="py-20 md:py-28 bg-cream">
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

      {/* Service areas */}
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

      {/* FAQ */}
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

      {/* Final consultation invitation */}
      <section className="py-20 md:py-28 bg-charcoal text-white">
        <div className="container-luxe text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
            Bring the Luxe Experience Home
          </h2>
          <p className="mt-6 text-lg text-warm-gray-400 leading-relaxed">
            Beautiful blinds and shades. Expert guidance. Options that fit your budget. It all starts with a free in-home consultation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <TrackedCta
              href="/book"
              event={CONVERSION_EVENTS.ConsultCtaClick}
              className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
            >
              Schedule Your Free Consultation
            </TrackedCta>
          </div>
        </div>
      </section>
    </>
  );
}
