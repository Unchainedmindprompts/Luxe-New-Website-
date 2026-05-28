"use client";

import { useSyncExternalStore } from "react";

/**
 * Cart item shape.
 *
 * Display fields (product/color/width/height/liftSystem/unitPrice/shippingCost)
 * power the cart UI. Input fields (productKey/wholeWidth/fractionWidth/.../lift)
 * are what the server uses at checkout to recompute the authoritative price
 * — same hardening we did on /api/checkout previously, preserved here so a
 * tampered cart can't lower the charge.
 */
export type CartItem = {
  id: string;
  // Display fields
  product: string;
  color: string;
  width: string;
  height: string;
  liftSystem: string;
  quantity: number;
  unitPrice: number;
  shippingCost: number;
  // Server-trusted inputs for price recomputation
  productKey: "faux-wood-blinds" | "cellular-shades";
  wholeWidth: number;
  fractionWidth: number;
  wholeHeight: number;
  fractionHeight: number;
  lift?: "cordless" | "tdbu";
  // Faux-wood-specific options (optional, ignored by other products)
  slatSize?: string;
  finish?: string;
  mountType?: string;
  wandDrop?: string;
  sideMountBrackets?: boolean;
  holdDowns?: boolean;
};

const STORAGE_KEY = "luxe-cart";
const SHIPPING_FIRST = 25;
const SHIPPING_ADDITIONAL = 11;

const EMPTY_CART: CartItem[] = [];
const listeners = new Set<() => void>();

let cachedSnapshot = "[]";
let cachedCart: CartItem[] = EMPTY_CART;

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function refreshCache() {
  const current = readRaw();
  if (current === cachedSnapshot) return;
  cachedSnapshot = current;
  try {
    const parsed = JSON.parse(current);
    cachedCart = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY_CART;
  } catch {
    cachedCart = EMPTY_CART;
  }
}

function writeStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  if (items.length === 0) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  refreshCache();
  for (const l of listeners) l();
}

// ── Public API ──────────────────────────────────────────────────────────────

export function getCart(): CartItem[] {
  refreshCache();
  return cachedCart;
}

export function addToCart(item: CartItem): void {
  const current = getCart();
  writeStorage([...current, item]);
}

export function removeFromCart(id: string): void {
  const current = getCart();
  writeStorage(current.filter((i) => i.id !== id));
}

export function clearCart(): void {
  writeStorage([]);
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function getCartSubtotal(): number {
  return getCart().reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function getCartShipping(): number {
  const totalUnits = getCartCount();
  if (totalUnits <= 0) return 0;
  return SHIPPING_FIRST + SHIPPING_ADDITIONAL * (totalUnits - 1);
}

export function getCartTotal(): number {
  return getCartSubtotal() + getCartShipping();
}

// ── React hook ──────────────────────────────────────────────────────────────

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function getSnapshot(): CartItem[] {
  refreshCache();
  return cachedCart;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

/** Reactive cart hook — re-renders the calling component when the cart changes. */
export function useCart(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
