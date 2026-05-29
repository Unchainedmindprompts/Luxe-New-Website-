import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import CartView from "./CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your Luxe Window Works order before checkout.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/shop/cart",
  },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Cart" },
        ]}
      />

      <section className="pt-10 md:pt-14 pb-6 bg-warm-white">
        <div className="container-luxe max-w-3xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight tracking-tight">
            Your Cart
          </h1>
        </div>
      </section>

      <section className="pb-16 md:pb-24 bg-warm-white">
        <div className="container-luxe max-w-3xl">
          <CartView />
        </div>
      </section>
    </>
  );
}
