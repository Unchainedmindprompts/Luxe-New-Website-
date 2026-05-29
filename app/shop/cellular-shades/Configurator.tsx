"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CELLULAR_WIDTHS,
  CELLULAR_HEIGHTS,
  CELLULAR_MSRP,
  CELLULAR_COLOR_DATA,
  CELLULAR_TDBU_MSRP_SURCHARGE,
  CELLULAR_CORD_LOOP_MSRP_SURCHARGE,
  CELLULAR_MAX_WIDTH,
} from "@/data/cellular-shades";
import {
  calculatePrice,
  calculateShipping,
  FRACTIONS,
  formatMeasurement,
  roundUpToBracket,
} from "@/lib/pricing";
import { BUSINESS } from "@/lib/constants";
import { addToCart, useCart } from "@/lib/cart";

const PRODUCT_KEY = "cellular-shades" as const;
const PRODUCT_NAME = '9/16" Portrait Honeycomb Cell Shade — Light Filtering';

const TDBU_SURCHARGE = calculatePrice(CELLULAR_TDBU_MSRP_SURCHARGE);
const CORD_LOOP_SURCHARGE = calculatePrice(CELLULAR_CORD_LOOP_MSRP_SURCHARGE);

const ALL_WIDTHS: number[] = [...CELLULAR_WIDTHS];
const HEIGHTS: number[] = [...CELLULAR_HEIGHTS];
const CORDLESS_WIDTHS: number[] = ALL_WIDTHS.filter(
  (w) => w <= CELLULAR_MAX_WIDTH
);

const WIDTH_MIN = CORDLESS_WIDTHS[0];
const WIDTH_MAX = CELLULAR_MAX_WIDTH;
const HEIGHT_MIN = HEIGHTS[0];
const HEIGHT_MAX = HEIGHTS[HEIGHTS.length - 1];

type ColorCode = (typeof CELLULAR_COLOR_DATA)[number]["code"];
type MountType = "Inside Mount" | "Outside Mount";
type LiftValue = "cordless" | "tdbu" | "cordloop";
type CordSide = "Left" | "Right";

const LIFT_OPTIONS: {
  value: LiftValue;
  title: string;
  description: string;
  surcharge: number;
}[] = [
  {
    value: "cordless",
    title: "SmartRise Cordless",
    description:
      "Clean cordless operation. Simply push up or pull down. No cords, no loops, child safe.",
    surcharge: 0,
  },
  {
    value: "tdbu",
    title: "Cordless TDBU",
    description:
      "Top Down Bottom Up. Lower from the top or raise from the bottom for maximum privacy and light control.",
    surcharge: TDBU_SURCHARGE,
  },
  {
    value: "cordloop",
    title: "Cord Loop",
    description:
      "Traditional cord loop operation. Smooth, reliable lift for larger or heavier shades.",
    surcharge: CORD_LOOP_SURCHARGE,
  },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const parseIntOrZero = (s: string) => {
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
};

const SAGE = "#9CAF88";

function StepHeader({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-semibold"
        style={{ backgroundColor: SAGE }}
      >
        {number}
      </span>
      <h2 className="font-serif text-lg md:text-xl text-charcoal leading-none">
        {label}
      </h2>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none ${
        selected
          ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30 bg-[#9CAF88]/5"
          : "border-warm-gray-200 hover:border-warm-gray-400 bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function RadioOption({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all focus:outline-none ${
        selected
          ? "border-[#9CAF88] bg-[#9CAF88]/10 text-charcoal"
          : "border-warm-gray-200 hover:border-warm-gray-400 bg-white text-warm-gray-700"
      }`}
    >
      <span
        className={`inline-block w-3 h-3 rounded-full border-2 ${
          selected ? "border-[#9CAF88] bg-[#9CAF88]" : "border-warm-gray-300"
        }`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default function Configurator() {
  // Step 1
  const [colorCode, setColorCode] = useState<ColorCode>(
    CELLULAR_COLOR_DATA[0].code
  );
  // Step 2
  const [mountType, setMountType] = useState<MountType>("Inside Mount");
  // Step 3
  const [wholeWidth, setWholeWidth] = useState<number>(WIDTH_MIN);
  const [fractionWidth, setFractionWidth] = useState<number>(0);
  const [wholeHeight, setWholeHeight] = useState<number>(HEIGHT_MIN);
  const [fractionHeight, setFractionHeight] = useState<number>(0);
  // Step 4
  const [lift, setLift] = useState<LiftValue>("cordless");
  const [cordSide, setCordSide] = useState<CordSide>("Left");
  // Step 5
  const [quantity, setQuantity] = useState<number>(1);

  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);
  const cart = useCart();
  const cartHasItems = cart.length > 0;

  // Close lightbox on ESC and lock background scroll while it's open.
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  const widthDecimal = wholeWidth + fractionWidth;
  const widthExceeded = widthDecimal > CELLULAR_MAX_WIDTH;

  const currentColor = CELLULAR_COLOR_DATA.find((c) => c.code === colorCode)!;
  const currentLift = LIFT_OPTIONS.find((o) => o.value === lift)!;

  const { basePrice, liftSurcharge, pricePerShade, subtotal, shipping, total } =
    useMemo(() => {
      if (widthExceeded) {
        return {
          basePrice: 0,
          liftSurcharge: 0,
          pricePerShade: 0,
          subtotal: 0,
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
      const surcharge = currentLift.surcharge;
      const perShade = base + surcharge;
      const sub = perShade * quantity;
      const ship = calculateShipping(quantity);
      return {
        basePrice: base,
        liftSurcharge: surcharge,
        pricePerShade: perShade,
        subtotal: sub,
        shipping: ship,
        total: sub + ship,
      };
    }, [
      widthExceeded,
      widthDecimal,
      wholeHeight,
      fractionHeight,
      currentLift,
      quantity,
    ]);

  const widthStr = formatMeasurement(wholeWidth, fractionWidth);
  const heightStr = formatMeasurement(wholeHeight, fractionHeight);

  function handleAddToCart() {
    if (widthExceeded) return;
    addToCart({
      id: crypto.randomUUID(),
      product: PRODUCT_NAME,
      color: currentColor.name,
      colorCode: currentColor.code,
      width: widthStr,
      height: heightStr,
      liftSystem: currentLift.title,
      quantity,
      unitPrice: pricePerShade,
      shippingCost: shipping,
      productKey: PRODUCT_KEY,
      wholeWidth,
      fractionWidth,
      wholeHeight,
      fractionHeight,
      lift,
      mountType,
      ...(lift === "cordloop" ? { cordSide } : {}),
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const measurementNote =
    mountType === "Inside Mount"
      ? 'Measure your window opening exactly. The factory will automatically deduct 3/8" from your width for a proper inside mount fit.'
      : 'Measure the area you want covered. We recommend adding 1.5" to 3" on each side for best light coverage. No deductions are taken from your measurements.';

  return (
    <>
    <div className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8 shadow-sm">
      {/* STEP 1 — Color */}
      <section className="mb-10">
        <StepHeader number={1} label="Select Color" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {CELLULAR_COLOR_DATA.map((c) => {
            const selected = colorCode === c.code;
            return (
              <div
                key={c.code}
                className="relative flex flex-col items-center text-center"
              >
                <button
                  type="button"
                  onClick={() => setColorCode(c.code)}
                  aria-pressed={selected}
                  aria-label={`Select ${c.name}`}
                  className="group w-full focus:outline-none"
                >
                  <div
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all bg-warm-gray-100 ${
                      selected
                        ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30"
                        : "border-warm-gray-200 group-hover:border-warm-gray-400"
                    }`}
                  >
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 33vw, 20vw"
                      className="object-cover object-top"
                    />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox({ src: c.image, name: c.name })}
                  aria-label={`View ${c.name} fabric larger`}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-white/90 hover:bg-white rounded-full shadow-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#9CAF88] transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5 text-charcoal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
                <span className="mt-2 text-xs leading-tight text-charcoal font-medium">
                  {c.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* STEP 2 — Mount Type */}
      <section className="mb-10">
        <StepHeader number={2} label="Mount Type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            selected={mountType === "Inside Mount"}
            onClick={() => setMountType("Inside Mount")}
          >
            <div className="font-semibold text-charcoal">Inside Mount</div>
            <div className="mt-1 text-sm text-warm-gray-500 leading-snug">
              Shade mounts inside the window frame. Clean built-in look.
            </div>
            <div className="mt-2 text-xs text-warm-gray-400 leading-snug">
              Note: Factory will deduct 3/8&quot; from your width measurement
              for proper fit.
            </div>
          </OptionCard>
          <OptionCard
            selected={mountType === "Outside Mount"}
            onClick={() => setMountType("Outside Mount")}
          >
            <div className="font-semibold text-charcoal">Outside Mount</div>
            <div className="mt-1 text-sm text-warm-gray-500 leading-snug">
              Shade mounts outside the window frame. Better light blockage and
              makes window appear larger.
            </div>
            <div className="mt-2 text-xs text-warm-gray-400 leading-snug">
              No deduction taken from your measurements.
            </div>
          </OptionCard>
        </div>
      </section>

      {/* STEP 3 — Size */}
      <section className="mb-10">
        <StepHeader number={3} label="Enter Your Window Measurements" />
        <p className="text-xs text-warm-gray-500 leading-relaxed mb-4">
          {measurementNote}
        </p>
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
        {widthExceeded && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-600 leading-relaxed"
          >
            Maximum width for cordless shades is 96 inches. Please call us to
            discuss options for wider windows.
          </p>
        )}
      </section>

      {/* STEP 4 — Operating System */}
      <section className="mb-10">
        <StepHeader number={4} label="Operating System" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LIFT_OPTIONS.map((opt) => (
            <OptionCard
              key={opt.value}
              selected={lift === opt.value}
              onClick={() => setLift(opt.value)}
            >
              <div className="font-semibold text-charcoal">{opt.title}</div>
              <div className="mt-1 text-sm text-warm-gray-500 leading-snug">
                {opt.description}
              </div>
              {opt.surcharge > 0 && (
                <div className="mt-2 text-sm font-semibold text-charcoal">
                  +{fmt(opt.surcharge)} per shade
                </div>
              )}
            </OptionCard>
          ))}
        </div>

        {/* Cord Side — only shown for Cord Loop */}
        {lift === "cordloop" && (
          <div className="mt-5">
            <div className="text-sm font-semibold text-charcoal mb-2">
              Cord Loop Side
            </div>
            <div className="flex flex-wrap gap-2">
              <RadioOption
                selected={cordSide === "Left"}
                onClick={() => setCordSide("Left")}
                label="Left"
              />
              <RadioOption
                selected={cordSide === "Right"}
                onClick={() => setCordSide("Right")}
                label="Right"
              />
            </div>
          </div>
        )}
      </section>

      {/* STEP 5 — Quantity */}
      <section className="mb-10">
        <StepHeader number={5} label="Quantity" />
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
        <p className="mt-2 text-xs text-warm-gray-400 leading-relaxed">
          Each shade is built to the exact size entered. For different sizes
          add each to cart separately.
        </p>
      </section>

      {/* PRICE DISPLAY */}
      <div className="bg-cream rounded-xl p-5 mb-6">
        {widthExceeded ? (
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm text-warm-gray-500">Price per shade</span>
            <span className="font-serif text-2xl text-warm-gray-400">—</span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-warm-gray-500">
                Base price per shade
              </span>
              <span className="text-charcoal">{fmt(basePrice)}</span>
            </div>
            {liftSurcharge > 0 && (
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm text-warm-gray-500">
                  Operating system upgrade
                </span>
                <span className="text-charcoal">+{fmt(liftSurcharge)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between mb-2 pt-2 border-t border-warm-gray-200/60">
              <span className="text-sm text-warm-gray-500">Price per shade</span>
              <span className="font-serif text-xl text-charcoal">
                {fmt(pricePerShade)}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-warm-gray-500">Quantity</span>
              <span className="text-charcoal">× {quantity}</span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm text-warm-gray-500">Subtotal</span>
              <span className="text-charcoal">{fmt(subtotal)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-warm-gray-500">Shipping</span>
              <span className="text-charcoal">{fmt(shipping)}</span>
            </div>
            <p className="mt-1 text-xs text-warm-gray-400 leading-relaxed">
              Actual freight — not marked up.
            </p>
          </>
        )}
        <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-warm-gray-200">
          <span className="font-semibold text-charcoal">Order Total</span>
          <span className="font-serif text-2xl font-semibold text-charcoal">
            {widthExceeded ? "—" : fmt(total)}
          </span>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="bg-white border border-warm-gray-200/60 rounded-xl p-5 mb-6">
        <div className="font-serif text-base text-charcoal mb-3">
          Your Configuration
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between sm:block sm:col-span-2">
            <dt className="text-warm-gray-400">Product</dt>
            <dd className="text-charcoal sm:mt-0.5">{PRODUCT_NAME}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Color</dt>
            <dd className="text-charcoal sm:mt-0.5">
              {currentColor.name} ({currentColor.code})
            </dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Mount Type</dt>
            <dd className="text-charcoal sm:mt-0.5">{mountType}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Size</dt>
            <dd className="text-charcoal sm:mt-0.5">
              {widthStr}&quot; × {heightStr}&quot;
            </dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Operating System</dt>
            <dd className="text-charcoal sm:mt-0.5">{currentLift.title}</dd>
          </div>
          {lift === "cordloop" && (
            <div className="flex justify-between sm:block">
              <dt className="text-warm-gray-400">Cord Side</dt>
              <dd className="text-charcoal sm:mt-0.5">{cordSide}</dd>
            </div>
          )}
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Quantity</dt>
            <dd className="text-charcoal sm:mt-0.5">{quantity}</dd>
          </div>
        </dl>
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
        disabled={widthExceeded}
        className="w-full text-white font-semibold px-6 py-3.5 rounded-full bg-[#9CAF88] hover:bg-[#7B9A6E] transition-all hover:shadow-lg disabled:bg-warm-gray-300 disabled:hover:bg-warm-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
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

      {cartHasItems && (
        <Link
          href="/shop/cart"
          className="block w-full text-center mt-3 px-6 py-3.5 rounded-full border-2 border-[#9CAF88] text-[#7B9A6E] font-semibold hover:bg-[#9CAF88]/10 transition-all"
        >
          View Cart
        </Link>
      )}
    </div>

    {lightbox && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${lightbox.name} fabric color`}
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4"
        onClick={() => setLightbox(null)}
      >
        <div
          className="relative max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.src}
            alt={`${lightbox.name} — Norman cellular shade fabric color`}
            className="max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-xl shadow-2xl block"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-warm-gray-100 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
          >
            <svg
              className="w-5 h-5 text-charcoal"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
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
    )}
    </>
  );
}
