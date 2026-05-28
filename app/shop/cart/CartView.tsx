"use client";

import Link from "next/link";
import { useState } from "react";
import {
  useCart,
  removeFromCart,
  getCartSubtotal,
  getCartShipping,
  getCartTotal,
} from "@/lib/cart";
import { BUSINESS } from "@/lib/constants";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function CartView() {
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-gray-200/60 p-8 md:p-12 text-center shadow-sm">
        <p className="text-lg text-warm-gray-500 mb-6">
          Your cart is empty.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-3.5 rounded-full transition-all hover:shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const subtotal = getCartSubtotal();
  const shipping = getCartShipping();
  const total = getCartTotal();

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          data.error || `Checkout request failed (${response.status})`
        );
      }
      const { url } = (await response.json()) as { url?: string };
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      const msg =
        err instanceof Error ? err.message : "Could not start checkout.";
      setError(`${msg}. Please try again or call us.`);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Items */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-warm-gray-200/60 p-5 md:p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-serif text-lg md:text-xl text-charcoal leading-snug">
                  {item.product}
                </div>
                <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">
                      Color
                    </dt>
                    <dd className="text-charcoal">{item.color}</dd>
                  </div>
                  <div>
                    <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">
                      Size
                    </dt>
                    <dd className="text-charcoal">
                      {item.width}&quot; × {item.height}&quot;
                    </dd>
                  </div>
                  <div>
                    <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">
                      Lift
                    </dt>
                    <dd className="text-charcoal">{item.liftSystem}</dd>
                  </div>
                  <div>
                    <dt className="text-warm-gray-400 text-xs uppercase tracking-wide">
                      Qty
                    </dt>
                    <dd className="text-charcoal">{item.quantity}</dd>
                  </div>
                </dl>
                <div className="mt-3 text-sm text-warm-gray-500">
                  {fmt(item.unitPrice)} each ·{" "}
                  <span className="text-charcoal font-semibold">
                    {fmt(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.product}`}
                className="p-2 text-warm-gray-400 hover:text-red-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-cream rounded-2xl p-6 md:p-7">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-warm-gray-500">Subtotal</span>
          <span className="text-charcoal">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-warm-gray-500">Shipping</span>
          <span className="text-charcoal">{fmt(shipping)}</span>
        </div>
        <p className="mt-1 text-xs text-warm-gray-400 leading-relaxed">
          Actual freight cost — we don&apos;t mark up shipping.
        </p>
        <div className="flex items-baseline justify-between pt-4 mt-4 border-t border-warm-gray-200">
          <span className="font-semibold text-charcoal">Order Total</span>
          <span className="font-serif text-2xl font-semibold text-charcoal">
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-warm-gray-500 leading-relaxed">
        Custom made to your specifications. All sales final on custom orders.
        Questions? Call us at{" "}
        <a
          href={BUSINESS.phoneHref}
          className="text-gold font-semibold hover:underline"
        >
          {BUSINESS.phone}
        </a>
        .
      </p>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/shop"
          className="block text-center px-6 py-3.5 rounded-full border-2 border-warm-gray-300 text-charcoal font-semibold hover:bg-warm-gray-100 transition-all"
        >
          Continue Shopping
        </Link>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="text-white font-semibold px-6 py-3.5 rounded-full bg-[#9CAF88] hover:bg-[#7B9A6E] transition-all hover:shadow-lg disabled:bg-warm-gray-300 disabled:hover:bg-warm-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {loading ? "Processing…" : "Proceed to Checkout"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
