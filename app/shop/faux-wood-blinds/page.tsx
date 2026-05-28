import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Configurator from "./Configurator";

export const metadata: Metadata = {
  title: "SmartPrivacy Cordless Faux Wood Blinds | Shop",
  description:
    'Configure and price SmartPrivacy cordless faux wood blinds — 2" and 2.5" slats, custom made to your exact size, free shipping on every order.',
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop/faux-wood-blinds",
  },
  openGraph: {
    title: "SmartPrivacy Cordless Faux Wood Blinds | Luxe Window Works",
    description:
      "Custom faux wood blinds, cordless, made to your exact size. Free shipping on every order.",
    type: "website",
  },
};

const PRODUCT_DETAILS = [
  "Cordless lift system",
  "SmartPrivacy for light and privacy control",
  "Impact resistant PolyDeco headrail included",
  "Engineered trapezoid bottom rail",
  "Wand tilt standard left",
  "Max width 72 inches",
  "Made in the USA",
];

export default function FauxWoodBlindsPage() {
  return (
    <>
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
