"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CartIcon({ className = "" }: { className?: string }) {
  const cart = useCart();
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  if (count === 0) return null;

  return (
    <Link
      href="/shop/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`relative inline-flex items-center text-charcoal hover:text-gold transition-colors ${className}`}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1.5 11a2 2 0 01-2 1.75h-7a2 2 0 01-2-1.75L5 9z"
        />
      </svg>
      <span
        className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#9CAF88] text-white text-[10px] font-semibold leading-none"
        aria-hidden="true"
      >
        {count}
      </span>
    </Link>
  );
}
