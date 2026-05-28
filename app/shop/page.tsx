import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shop Custom Blinds & Shades",
  description:
    "Custom blinds and shades made to your exact size. Free shipping on every order. Configure and price online from Luxe Window Works.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop",
  },
  openGraph: {
    title: "Shop Custom Blinds & Shades | Luxe Window Works",
    description:
      "Custom blinds and shades made to your exact size. Free shipping on every order.",
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
            Custom Blinds &amp; Shades
          </h1>
          <p className="mt-5 text-lg md:text-xl text-warm-gray-500 leading-relaxed">
            Custom made to your exact size. Free shipping on every order.
          </p>
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
    </>
  );
}
