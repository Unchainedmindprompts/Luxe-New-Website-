import { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Order Received",
  description: "Thank you for your Luxe Window Works order.",
  robots: { index: false, follow: true },
};

export default function SuccessPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: "Order Received" },
        ]}
      />

      <section className="py-16 md:py-24 bg-warm-white">
        <div className="container-luxe max-w-2xl text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight tracking-tight">
            Order Received!
          </h1>
          <p className="mt-6 text-base md:text-lg text-warm-gray-500 leading-relaxed">
            Thank you for your order. Your custom window treatments are being
            processed. You will receive a confirmation email shortly.
          </p>
          <p className="mt-4 text-warm-gray-500">
            Questions? Call us at{" "}
            <a
              href={BUSINESS.phoneHref}
              className="text-gold font-semibold hover:underline"
            >
              {BUSINESS.phone}
            </a>
            .
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 mt-10 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:shadow-lg"
          >
            Back to Shop
          </Link>
        </div>
      </section>
    </>
  );
}
