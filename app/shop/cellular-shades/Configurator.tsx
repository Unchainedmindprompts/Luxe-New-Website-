"use client";

import { useMemo, useState } from "react";
import {
  CELLULAR_WIDTHS,
  CELLULAR_HEIGHTS,
  CELLULAR_MSRP,
  CELLULAR_TDBU_MSRP_SURCHARGE,
  CELLULAR_MAX_WIDTH,
  type CellularColor,
} from "@/data/cellular-shades";
import {
  calculatePrice,
  calculateShipping,
  FRACTIONS,
  roundUpToBracket,
} from "@/lib/pricing";
import { BUSINESS } from "@/lib/constants";

const PRODUCT_KEY = "cellular-shades";

const COLOR_SWATCHES: { name: CellularColor; hex: string }[] = [
  { name: "Brilliant White", hex: "#FAFAFA" },
  { name: "Gardenia", hex: "#F5F0E0" },
  { name: "Natural Tan", hex: "#E8DCC8" },
  { name: "Pale Oak", hex: "#DDD0B8" },
  { name: "Wheat", hex: "#D4BC8C" },
  { name: "New Camel", hex: "#C8A870" },
  { name: "Silver Dusk", hex: "#C0BDB5" },
  { name: "Dew", hex: "#D8DDD0" },
  { name: "French Silver", hex: "#C8C8C0" },
  { name: "Iron Mountain", hex: "#6B6B6B" },
  { name: "Space Gray", hex: "#808080" },
  { name: "Florida Keys", hex: "#A8C0A0" },
  { name: "Bella Blue", hex: "#A0B0C8" },
  { name: "Whipped Mocha", hex: "#B89880" },
];

const ALL_WIDTHS: number[] = [...CELLULAR_WIDTHS];
const HEIGHTS: number[] = [...CELLULAR_HEIGHTS];
const CORDLESS_WIDTHS: number[] = ALL_WIDTHS.filter(
  (w) => w <= CELLULAR_MAX_WIDTH
);

const WIDTH_MIN = CORDLESS_WIDTHS[0];
const WIDTH_MAX = CELLULAR_MAX_WIDTH;
const HEIGHT_MIN = HEIGHTS[0];
const HEIGHT_MAX = HEIGHTS[HEIGHTS.length - 1];

const TDBU_SURCHARGE = calculatePrice(CELLULAR_TDBU_MSRP_SURCHARGE);

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const parseIntOrZero = (s: string) => {
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
};

type LiftSystem = "cordless" | "tdbu";

export default function Configurator() {
  const [color, setColor] = useState<CellularColor>(COLOR_SWATCHES[0].name);
  const [wholeWidth, setWholeWidth] = useState<number>(WIDTH_MIN);
  const [fractionWidth, setFractionWidth] = useState<number>(0);
  const [wholeHeight, setWholeHeight] = useState<number>(HEIGHT_MIN);
  const [fractionHeight, setFractionHeight] = useState<number>(0);
  const [lift, setLift] = useState<LiftSystem>("cordless");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widthDecimal = wholeWidth + fractionWidth;
  const widthExceeded = widthDecimal > CELLULAR_MAX_WIDTH;

  const { basePrice, tdbuSurcharge, pricePerShade, shipping, total } =
    useMemo(() => {
      if (widthExceeded) {
        return {
          basePrice: 0,
          tdbuSurcharge: 0,
          pricePerShade: 0,
          shipping: 0,
          total: 0,
        };
      }
      const heightDecimal = wholeHeight + fractionHeight;
      const widthBracket = roundUpToBracket(widthDecimal, CORDLESS_WIDTHS);
      const heightBracket = roundUpToBracket(heightDecimal, HEIGHTS);
      const w = ALL_WIDTHS.indexOf(widthBracket);
      const h = HEIGHTS.indexOf(heightBracket);
      const msrp = CELLULAR_MSRP[h][w];
      const base = calculatePrice(msrp);
      const surcharge = lift === "tdbu" ? TDBU_SURCHARGE : 0;
      const perShade = base + surcharge;
      const ship = calculateShipping(quantity);
      return {
        basePrice: base,
        tdbuSurcharge: surcharge,
        pricePerShade: perShade,
        shipping: ship,
        total: perShade * quantity + ship,
      };
    }, [
      widthExceeded,
      widthDecimal,
      wholeHeight,
      fractionHeight,
      lift,
      quantity,
    ]);

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productKey: PRODUCT_KEY,
          color,
          wholeWidth,
          fractionWidth,
          wholeHeight,
          fractionHeight,
          lift,
          quantity,
        }),
      });
      if (!response.ok) throw new Error("Checkout request failed");
      const { url } = (await response.json()) as { url?: string };
      if (!url) throw new Error("No checkout URL returned");
      window.location.href = url;
    } catch (err) {
      console.error(err);
      setError("Could not start checkout. Please try again or call us.");
      setLoading(false);
    }
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
                id="cs-width-whole"
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
                id="cs-width-frac"
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
                id="cs-height-whole"
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
                id="cs-height-frac"
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
        {widthExceeded && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-600 leading-relaxed"
          >
            Cordless shades have a maximum width of 96 inches. Please adjust
            your width or call us to discuss options.
          </p>
        )}
      </div>

      {/* Step 3 — Lift System */}
      <div className="mb-8">
        <div className="font-serif text-lg md:text-xl text-charcoal mb-3">
          Lift System
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setLift("cordless")}
            aria-pressed={lift === "cordless"}
            className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none ${
              lift === "cordless"
                ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30 bg-[#9CAF88]/5"
                : "border-warm-gray-200 hover:border-warm-gray-400 bg-white"
            }`}
          >
            <div className="font-semibold text-charcoal">Cordless</div>
            <div className="mt-1 text-sm text-warm-gray-500 leading-snug">
              Clean look, no cords. Max width 96 inches.
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLift("tdbu")}
            aria-pressed={lift === "tdbu"}
            className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none ${
              lift === "tdbu"
                ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30 bg-[#9CAF88]/5"
                : "border-warm-gray-200 hover:border-warm-gray-400 bg-white"
            }`}
          >
            <div className="font-semibold text-charcoal">
              Top Down Bottom Up (TDBU)
            </div>
            <div className="mt-1 text-sm text-warm-gray-500 leading-snug">
              Lower from top or raise from bottom. Maximum privacy and light
              control.
            </div>
            <div className="mt-2 text-sm font-semibold text-charcoal">
              +{fmt(TDBU_SURCHARGE)}
            </div>
          </button>
        </div>
      </div>

      {/* Step 4 — Quantity */}
      <div className="mb-8">
        <label
          htmlFor="cs-qty"
          className="block font-serif text-lg md:text-xl text-charcoal mb-3"
        >
          Quantity
        </label>
        <input
          id="cs-qty"
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
        {widthExceeded ? (
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-warm-gray-500">Price per shade</span>
            <span className="font-serif text-2xl text-warm-gray-400">—</span>
          </div>
        ) : lift === "tdbu" ? (
          <>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-warm-gray-500">Base price</span>
              <span className="text-charcoal">{fmt(basePrice)}</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-warm-gray-500">TDBU upgrade</span>
              <span className="text-charcoal">+{fmt(tdbuSurcharge)}</span>
            </div>
            <div className="flex items-baseline justify-between mb-2 pt-2 border-t border-warm-gray-200/60">
              <span className="text-sm text-warm-gray-500">
                Price per shade
              </span>
              <span className="font-serif text-2xl text-charcoal">
                {fmt(pricePerShade)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-warm-gray-500">Price per shade</span>
            <span className="font-serif text-2xl text-charcoal">
              {fmt(pricePerShade)}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-warm-gray-500">Shipping</span>
          <span className="text-charcoal">
            {widthExceeded ? "—" : fmt(shipping)}
          </span>
        </div>
        <div className="flex items-baseline justify-between pt-3 border-t border-warm-gray-200">
          <span className="font-semibold text-charcoal">Order Total</span>
          <span className="font-serif text-2xl font-semibold text-charcoal">
            {widthExceeded ? "—" : fmt(total)}
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

      {/* Checkout */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={widthExceeded || loading}
        className="w-full text-white font-semibold px-6 py-3.5 rounded-full bg-[#9CAF88] hover:bg-[#7B9A6E] transition-all hover:shadow-lg disabled:bg-warm-gray-300 disabled:hover:bg-warm-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
      >
        {loading ? "Processing…" : "Proceed to Checkout"}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
