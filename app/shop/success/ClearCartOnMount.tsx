"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

/** Empties the cart once the customer lands on /shop/success after Stripe redirect. */
export default function ClearCartOnMount() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
