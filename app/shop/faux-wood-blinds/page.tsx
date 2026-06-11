import { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import {
  FAUX_WOOD_MSRP,
  FAUX_WOOD_WIDTHS,
  FAUX_WOOD_HEIGHTS,
  FAUX_WOOD_COLORS,
} from "@/data/faux-wood-blinds";
import { calculatePrice } from "@/lib/pricing";
import Configurator from "./Configurator";

const BASE = "https://www.luxewindowworks.com";
const PRODUCT_URL = `${BASE}/shop/faux-wood-blinds`;

const fauxWoodPrices = FAUX_WOOD_MSRP.flat().map(calculatePrice);
const fauxWoodLowPrice = Math.min(...fauxWoodPrices).toFixed(2);
const fauxWoodHighPrice = Math.max(...fauxWoodPrices).toFixed(2);
const fauxWoodSizeBracketCount = FAUX_WOOD_WIDTHS.length * FAUX_WOOD_HEIGHTS.length;

const normanBrand = {
  "@type": "Brand",
  "@id": "https://www.normanwindowfashions.com/#brand",
  name: "Norman",
  alternateName: "Norman Window Fashions",
  url: "https://www.normanwindowfashions.com",
  sameAs: [
    "https://www.normanwindowfashions.com",
    "https://en.wikipedia.org/wiki/Norman_(window_treatment_brand)",
  ],
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${PRODUCT_URL}#product`,
  name: "SmartPrivacy Cordless Faux Wood Blinds",
  alternateName: 'Norman SmartPrivacy 2" and 2.5" Cordless Faux Wood Blinds',
  description:
    "Custom-made Norman SmartPrivacy cordless faux wood blinds with patented rear-route holes for tighter closure, lead-free composite slats, valance-free PolyDeco headrail, and a certified Best for Kids cordless lift system. Built to the customer's exact width and height.",
  url: PRODUCT_URL,
  image: [
    `${BASE}/images/smartprivacy-tightest-closure.png`,
    `${BASE}/images/smartprivacy-valance-free-headrail.png`,
    `${BASE}/images/smartprivacy-lead-free.png`,
  ],
  category: "Faux Wood Blinds",
  brand: normanBrand,
  manufacturer: {
    "@id": "https://www.normanwindowfashions.com/#brand",
  },
  hasVariant: FAUX_WOOD_COLORS.map((color) => ({
    "@type": "ProductModel",
    name: color,
  })),
  audience: {
    "@type": "PeopleAudience",
    geographicArea: {
      "@type": "AdministrativeArea",
      name: "Northern Idaho",
    },
  },
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: fauxWoodLowPrice,
    highPrice: fauxWoodHighPrice,
    offerCount: fauxWoodSizeBracketCount,
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    seller: { "@id": `${BASE}/#business` },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "US",
      },
      description:
        "Shipping passed through at cost — no markup. $25 first unit, $11 each additional unit.",
    },
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2"],
  },
};

export const metadata: Metadata = {
  title: "SmartPrivacy Cordless Faux Wood Blinds | Shop",
  description:
    'Configure and price SmartPrivacy cordless faux wood blinds — 2" and 2.5" slats, custom made to your exact size, shipping at cost with no markup.',
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop/faux-wood-blinds",
  },
  openGraph: {
    title: "SmartPrivacy Cordless Faux Wood Blinds | Shop",
    description:
      "Custom faux wood blinds, cordless, made to your exact size. Shipping at cost with no markup.",
    type: "website",
  },
};

const PRODUCT_DETAILS = [
  '2" or 2½" slat options',
  "Cordless lift system",
  "SmartPrivacy light and privacy control",
  "Impact resistant PolyDeco headrail included",
  "Engineered trapezoid bottom rail",
  "Wand tilt — left standard",
  "Max width 72 inches",
  "By Norman USA",
];

export default function FauxWoodBlindsPage() {
  return (
    <>
      <JsonLd data={productSchema} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Faux Wood Blinds" },
        ]}
      />

      <section className="pt-10 md:pt-14 pb-6 md:pb-8 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight tracking-tight">
            SmartPrivacy Cordless Faux Wood Blinds
          </h1>
          <p className="mt-4 text-base md:text-lg text-warm-gray-500 leading-relaxed">
            2&quot; &amp; 2.5&quot; slats · Cordless · Custom made to your exact size
          </p>
        </div>
      </section>

      <section className="pt-8 md:pt-12 pb-12 md:pb-16 bg-cream">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-6 leading-tight">
            Why SmartPrivacy Faux Wood Blinds?
          </h2>
          <div className="space-y-5 text-base md:text-lg text-warm-gray-600 leading-relaxed">
            <p>
              Traditional blinds have a design flaw — route holes in the middle
              of every slat let light bleed through and compromise your privacy.
              Norman&apos;s patented SmartPrivacy technology fixes that by moving
              the route holes to the back of the slat. The result is a blind
              that closes more tightly, rotates more consistently, and keeps
              slats locked in place so they never fall out or become misaligned.
              The bottom rail stays level when raising and lowering. They&apos;re
              almost like blinds reinvented. Actually, they pretty much are.
            </p>
            <p>
              Cordless operation means no dangerous tangles, no cords within
              reach of kids or pets. Norman&apos;s cordless lift system is
              certified Best for Kids — just tap or pull to raise and lower.
              Clean, quiet, and safe for any room in the house.
            </p>
            <p>
              Faux wood construction makes these ideal for kitchens, bathrooms,
              and any high-humidity space where real wood would warp or
              deteriorate. Durable enough for daily wear, stylish enough for
              living rooms and bedrooms. Built to last and backed by
              Norman&apos;s industry-leading replacement warranty.
            </p>
          </div>

          <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <Image
              src="/images/smartprivacy-tightest-closure.png"
              alt="Tightest closure: Norman's exclusive bottom rail pivots 90 degrees when closed for the tightest top-to-bottom seal in the market."
              width={941}
              height={1672}
              className="w-full h-auto rounded-2xl bg-white shadow-sm"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <Image
              src="/images/smartprivacy-valance-free-headrail.png"
              alt="Valance-free headrail: impact-resistant polydeco headrail with a slim, modern profile that blends into most window trims."
              width={941}
              height={1672}
              className="w-full h-auto rounded-2xl bg-white shadow-sm"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <Image
              src="/images/smartprivacy-lead-free.png"
              alt="Lead-free: proprietary formulation that's lightweight, durable, and contains no lead."
              width={941}
              height={1672}
              className="w-full h-auto rounded-2xl bg-white shadow-sm"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </div>

          <div
            className="mt-12 md:mt-16 h-px bg-[#9CAF88]/40 max-w-xs mx-auto"
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="pb-12 md:pb-16 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <Configurator />
        </div>
      </section>

      <section className="py-12 md:py-16 bg-cream">
        <div className="container-luxe max-w-3xl">
          <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-6">
            Product Details
          </h2>
          <ul className="space-y-3 text-warm-gray-500">
            {PRODUCT_DETAILS.map((d) => (
              <li key={d} className="flex gap-3 items-start">
                <svg
                  className="w-5 h-5 mt-0.5 text-gold flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
