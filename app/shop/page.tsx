import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop Custom Blinds & Shades",
  description:
    "Custom blinds and shades made to your exact size. Shipping at cost — no markup. Configure and price online from Luxe Window Works.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop",
  },
  openGraph: {
    title: "Shop Custom Blinds & Shades | Luxe Window Works",
    description:
      "Custom blinds and shades made to your exact size. Shipping at cost — no markup.",
    type: "website",
  },
};

const SHOP_PRODUCTS = [
  {
    name: "SmartPrivacy Cordless Faux Wood Blinds",
    image: "/images/wood-blinds.jpeg",
    href: "/shop/faux-wood-blinds",
  },
  {
    name: "9/16 Portrait Honeycomb Cell Shades",
    image: "/images/cellular-shades.jpeg",
    href: "/shop/cellular-shades",
  },
] as const;

export default function ShopPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <section className="pt-12 md:pt-16 pb-8 md:pb-12 bg-warm-white">
        <div className="container-luxe max-w-4xl text-center">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal leading-tight tracking-tight">
            Premium blinds and shades, delivered to your door.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-warm-gray-500 leading-relaxed">
            Skip the big box. Order direct.
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <div className="space-y-5 text-base md:text-lg text-warm-gray-700 leading-relaxed">
            <p>
              We get it — everything has gotten more expensive, and window
              treatments are no exception. That&apos;s why we&apos;ve taken two of
              our best sellers and made them available online at honest prices,
              shipped directly to you.
            </p>
            <p>
              Norman USA faux wood blinds and cellular shades aren&apos;t the
              cheapest option out there. They&apos;re not meant to be. What they
              are is premium quality — custom made to your exact measurements —
              backed by one of the best warranties in the industry. If anything
              malfunctions under normal use, Norman sends you a replacement. No
              hassle, no runaround. Try getting that kind of service from a big
              box store or a membership warehouse.
            </p>
            <p>
              Order online, configure to your exact size, and have them
              delivered to your door.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-warm-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {SHOP_PRODUCTS.map((product) => (
              <div
                key={product.href}
                className="group bg-white rounded-2xl overflow-hidden border border-warm-gray-200/60 hover:border-gold/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 md:p-8">
                  <h2 className="font-serif text-xl md:text-2xl text-charcoal leading-snug">
                    {product.name}
                  </h2>
                  <Link
                    href={product.href}
                    className="inline-flex items-center gap-2 mt-6 bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg"
                  >
                    Configure &amp; Price
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-12 md:pb-16 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <div className="bg-cream border-2 border-[#9CAF88] rounded-2xl p-6 md:p-8 text-center">
            <p className="text-base md:text-lg text-charcoal leading-relaxed">
              <span className="font-semibold">Live in North Idaho?</span> We can
              help with professional installation. Minimum trip and installation
              fees apply.{" "}
              <Link
                href="/contact"
                className="text-[#7B9A6E] font-semibold hover:underline"
              >
                Contact us
              </Link>{" "}
              for a quote.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 bg-warm-white">
        <div className="container-luxe max-w-5xl">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              "Norman USA — Industry Leading Warranty",
              "Custom Made to Your Exact Size",
              "Shipping at Cost — No Markup",
              "23 Years of Window Treatment Experience",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm md:text-base text-charcoal leading-snug"
              >
                <svg
                  className="w-5 h-5 mt-0.5 text-[#9CAF88] flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
