import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import Configurator from "./Configurator";

export const metadata: Metadata = {
  title: '9/16" Portrait Honeycomb Cell Shades | Shop',
  description:
    'Configure and price 9/16" Portrait honeycomb cell shades — cordless, light filtering, 14 colors, optional Top Down Bottom Up. Custom made to your exact size with free shipping.',
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop/cellular-shades",
  },
  openGraph: {
    title: '9/16" Portrait Honeycomb Cell Shades | Luxe Window Works',
    description:
      "Cordless honeycomb shades, light filtering, custom made to your exact size. Free shipping on every order.",
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
  "Made in the USA",
];

export default function CellularShadesPage() {
  return (
    <>
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
