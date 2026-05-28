"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FAUX_WOOD_WIDTHS,
  FAUX_WOOD_HEIGHTS,
  FAUX_WOOD_MSRP,
  type FauxWoodColor,
} from "@/data/faux-wood-blinds";
import {
  calculatePrice,
  calculateShipping,
  FRACTIONS,
  formatMeasurement,
  roundUpToBracket,
} from "@/lib/pricing";
import { BUSINESS } from "@/lib/constants";
import { addToCart, useCart } from "@/lib/cart";

const PRODUCT_KEY = "faux-wood-blinds" as const;
const PRODUCT_NAME = "SmartPrivacy Cordless Faux Wood Blinds";
const LIFT_SYSTEM = "Cordless";

const COLOR_SWATCHES: { name: FauxWoodColor; hex: string }[] = [
  { name: "Designer White Smooth", hex: "#FFFFFF" },
  { name: "Designer White Embossed", hex: "#F8F8F8" },
  { name: "Pure White Smooth", hex: "#FAFAFA" },
  { name: "Pure White Embossed", hex: "#F5F5F5" },
  { name: "Silk White Smooth", hex: "#F0EFE8" },
  { name: "Silk White Embossed", hex: "#ECEAE0" },
  { name: "Pearl Smooth", hex: "#F5F2E0" },
  { name: "Pearl Embossed", hex: "#EEEBD8" },
  { name: "Bright White Smooth", hex: "#F2F2EE" },
  { name: "Bright White Embossed", hex: "#EBEBE5" },
];

const WIDTHS: number[] = [...FAUX_WOOD_WIDTHS];
const HEIGHTS: number[] = [...FAUX_WOOD_HEIGHTS];

const WIDTH_MIN = WIDTHS[0];
const WIDTH_MAX = WIDTHS[WIDTHS.length - 1];
const HEIGHT_MIN = HEIGHTS[0];
const HEIGHT_MAX = HEIGHTS[HEIGHTS.length - 1];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const parseIntOrZero = (s: string) => {
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
};

export default function Configurator() {
  const [color, setColor] = useState<FauxWoodColor>(COLOR_SWATCHES[0].name);
  const [wholeWidth, setWholeWidth] = useState<number>(WIDTH_MIN);
  const [fractionWidth, setFractionWidth] = useState<number>(0);
  const [wholeHeight, setWholeHeight] = useState<number>(HEIGHT_MIN);
  const [fractionHeight, setFractionHeight] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const cart = useCart();
  const cartHasItems = cart.length > 0;

  const { pricePerBlind, shipping, total } = useMemo(() => {
    const widthDecimal = wholeWidth + fractionWidth;
    const heightDecimal = wholeHeight + fractionHeight;
    const widthBracket = roundUpToBracket(widthDecimal, WIDTHS);
    const heightBracket = roundUpToBracket(heightDecimal, HEIGHTS);
    const w = WIDTHS.indexOf(widthBracket);
    const h = HEIGHTS.indexOf(heightBracket);
    const msrp = FAUX_WOOD_MSRP[h][w];
    const p = calculatePrice(msrp);
    const s = calculateShipping(quantity);
    return { pricePerBlind: p, shipping: s, total: p * quantity + s };
  }, [wholeWidth, fractionWidth, wholeHeight, fractionHeight, quantity]);

  function handleAddToCart() {
    addToCart({
      id: crypto.randomUUID(),
      product: PRODUCT_NAME,
      color,
      width: formatMeasurement(wholeWidth, fractionWidth),
      height: formatMeasurement(wholeHeight, fractionHeight),
      liftSystem: LIFT_SYSTEM,
      quantity,
      unitPrice: pricePerBlind,
      shippingCost: shipping,
      productKey: PRODUCT_KEY,
      wholeWidth,
      fractionWidth,
      wholeHeight,
      fractionHeight,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8 shadow-sm">
      {/* Step 1 — Color */}
      <div className="mb-8">
        <div className="font-serif text-lg md:text-xl text-charcoal mb-3">
          Select Color
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {COLOR_SWATCHES.map((c) => {
            const selected = color === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setColor(c.name)}
                aria-pressed={selected}
                aria-label={c.name}
                className="group flex flex-col items-center text-center focus:outline-none"
              >
                <div
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selected
                      ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30"
                      : "border-warm-gray-200 group-hover:border-warm-gray-400"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
                <span className="mt-2 text-xs leading-tight text-warm-gray-500">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Size */}
      <div className="mb-8">
        <div className="font-serif text-lg md:text-xl text-charcoal mb-3">
          Select Size
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-warm-gray-500 mb-1.5">
              Width (inches)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                id="fw-width-whole"
                type="number"
                min={WIDTH_MIN}
                max={WIDTH_MAX}
                value={wholeWidth}
                aria-label="Width whole inches"
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setWholeWidth(parseIntOrZero(e.target.value))}
                className="w-full bg-white border border-warm-gray-300 rounded-lg px-3 py-2.5 text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              <select
                id="fw-width-frac"
                value={fractionWidth}
                aria-label="Width fraction"
                onChange={(e) => setFractionWidth(Number(e.target.value))}
                className="w-full bg-white border border-warm-gray-300 rounded-lg px-3 py-2.5 text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {FRACTIONS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-warm-gray-500 mb-1.5">
              Height (inches)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                id="fw-height-whole"
                type="number"
                min={HEIGHT_MIN}
                max={HEIGHT_MAX}
                value={wholeHeight}
                aria-label="Height whole inches"
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => setWholeHeight(parseIntOrZero(e.target.value))}
                className="w-full bg-white border border-warm-gray-300 rounded-lg px-3 py-2.5 text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
              <select
                id="fw-height-frac"
                value={fractionHeight}
                aria-label="Height fraction"
                onChange={(e) => setFractionHeight(Number(e.target.value))}
                className="w-full bg-white border border-warm-gray-300 rounded-lg px-3 py-2.5 text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              >
                {FRACTIONS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-warm-gray-400 leading-relaxed">
          Enter your exact window measurement. We size up to the nearest
          bracket — standard practice for a proper fit.
        </p>
      </div>

      {/* Step 3 — Quantity */}
      <div className="mb-8">
        <label
          htmlFor="fw-qty"
          className="block font-serif text-lg md:text-xl text-charcoal mb-3"
        >
          Quantity
        </label>
        <input
          id="fw-qty"
          type="number"
          min={1}
          value={quantity}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = parseInt(e.target.value || "1", 10);
            setQuantity(isNaN(v) || v < 1 ? 1 : v);
          }}
          className="w-32 bg-white border border-warm-gray-300 rounded-lg px-3 py-2.5 text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>

      {/* Price Display */}
      <div className="bg-cream rounded-xl p-5 mb-6">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-sm text-warm-gray-500">Price per blind</span>
          <span className="font-serif text-2xl text-charcoal">
            {fmt(pricePerBlind)}
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-warm-gray-500">Shipping (single)</span>
          <span className="text-charcoal">{fmt(shipping)}</span>
        </div>
        <div className="flex items-baseline justify-between pt-3 border-t border-warm-gray-200">
          <span className="font-semibold text-charcoal">If ordered alone</span>
          <span className="font-serif text-2xl font-semibold text-charcoal">
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-warm-gray-500 mb-6 leading-relaxed">
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

      {/* Add to Cart */}
      <button
        type="button"
        onClick={handleAddToCart}
        className="w-full text-white font-semibold px-6 py-3.5 rounded-full bg-[#9CAF88] hover:bg-[#7B9A6E] transition-all hover:shadow-lg"
      >
        Add to Cart
      </button>

      {added && (
        <p
          role="status"
          aria-live="polite"
          className="mt-3 text-sm text-center text-[#7B9A6E] font-medium"
        >
          Added to cart ✓
        </p>
      )}

      {/* Proceed to Checkout — only when cart has items */}
      {cartHasItems && (
        <Link
          href="/shop/cart"
          className="block w-full text-center mt-3 px-6 py-3.5 rounded-full border-2 border-[#9CAF88] text-[#7B9A6E] font-semibold hover:bg-[#9CAF88]/10 transition-all"
        >
          Proceed to Checkout
        </Link>
      )}
    </div>
  );
}
