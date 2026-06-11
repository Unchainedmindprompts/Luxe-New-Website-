import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import {
  CELLULAR_MSRP,
  CELLULAR_WIDTHS,
  CELLULAR_HEIGHTS,
  CELLULAR_COLOR_DATA,
} from "@/data/cellular-shades";
import { calculatePrice } from "@/lib/pricing";
import Configurator from "./Configurator";

const BASE = "https://www.luxewindowworks.com";
const PRODUCT_URL = `${BASE}/shop/cellular-shades`;

const cellularPrices = CELLULAR_MSRP.flat().map(calculatePrice);
const cellularLowPrice = Math.min(...cellularPrices).toFixed(2);
const cellularHighPrice = Math.max(...cellularPrices).toFixed(2);
const cellularSizeBracketCount = CELLULAR_WIDTHS.length * CELLULAR_HEIGHTS.length;

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
  name: '9/16" Portrait Honeycomb Cell Shades',
  alternateName: "Norman Portrait Cellular Shades — Light Filtering",
  description:
    'Custom-made Norman 9/16" Portrait honeycomb cellular shades in single-cell construction. Light filtering fabric in 10 designer colors, three lift systems (cordless, top-down/bottom-up, cord loop), inside or outside mount. Built to the customer\'s exact width and height.',
  url: PRODUCT_URL,
  category: "Cellular Shades",
  brand: normanBrand,
  manufacturer: {
    "@id": "https://www.normanwindowfashions.com/#brand",
  },
  hasVariant: CELLULAR_COLOR_DATA.map((c) => ({
    "@type": "ProductModel",
    name: c.name,
    sku: c.code,
    image: `${BASE}${c.image}`,
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
    lowPrice: cellularLowPrice,
    highPrice: cellularHighPrice,
    offerCount: cellularSizeBracketCount,
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
  title: '9/16" Portrait Honeycomb Cell Shades | Shop',
  description:
    'Configure and price 9/16" Portrait honeycomb cell shades — cordless, light filtering, 15 colors, three lift systems including TDBU and Cord Loop. Custom made to your exact size; shipping at cost with no markup.',
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop/cellular-shades",
  },
  openGraph: {
    title: '9/16" Portrait Honeycomb Cell Shades | Shop',
    description:
      "Cordless honeycomb shades, light filtering, custom made to your exact size. Shipping at cost with no markup.",
    type: "website",
  },
};

const PRODUCT_DETAILS = [
  '9/16" single cell construction',
  "Light filtering fabric",
  "Cordless, TDBU, or Cord Loop options",
  "Inside or outside mount",
  "Rail color: default",
  "Max cordless width 96 inches",
  "Norman certified quality",
  "By Norman USA",
];

export default function CellularShadesPage() {
  return (
    <>
      <JsonLd data={productSchema} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Cellular Shades" },
        ]}
      />

      <section className="pt-10 md:pt-14 pb-6 md:pb-8 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight tracking-tight">
            9/16&quot; Portrait Honeycomb Cell Shades
          </h1>
          <p className="mt-4 text-base md:text-lg text-warm-gray-500 leading-relaxed">
            Light filtering · Cordless · 14 colors · Custom made to your exact size
          </p>
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
