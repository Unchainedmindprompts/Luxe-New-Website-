"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FAUX_WOOD_WIDTHS,
  FAUX_WOOD_HEIGHTS,
  FAUX_WOOD_MSRP,
  FAUX_WOOD_SIDE_MOUNT_MSRP_SURCHARGE,
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
const PRODUCT_NAME = "SmartPrivacy Cordless Faux Wood Blind";
const LIFT_SYSTEM = "Cordless";

const SIDE_MOUNT_SURCHARGE = calculatePrice(FAUX_WOOD_SIDE_MOUNT_MSRP_SURCHARGE);

const SLAT_SIZES = ['2"', '2½"'] as const;
type SlatSize = (typeof SLAT_SIZES)[number];

const COLORS = [
  { name: "Pure White", hex: "#FAFAFA", finishes: ["Smooth", "Embossed"] as const },
  { name: "Silk White", hex: "#F0EFE8", finishes: ["Smooth", "Embossed"] as const },
  { name: "Pearl", hex: "#F5F2E0", finishes: ["Smooth", "Embossed"] as const },
  { name: "Designer White", hex: "#FFFFFF", finishes: ["Smooth", "Embossed"] as const },
  { name: "Mist", hex: "#D8DCD8", finishes: ["Smooth"] as const },
] as const;

type ColorName = (typeof COLORS)[number]["name"];
type Finish = "Smooth" | "Embossed";
type MountType = "Inside Mount" | "Outside Mount";
type WandDrop = "Standard" | "Optional";

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
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className={`text-left p-4 rounded-xl border-2 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
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
  const [slatSize, setSlatSize] = useState<SlatSize>('2"');
  // Step 2
  const [colorName, setColorName] = useState<ColorName>("Pure White");
  const [finish, setFinish] = useState<Finish>("Smooth");
  // Step 3
  const [mountType, setMountType] = useState<MountType>("Inside Mount");
  // Step 4
  const [wholeWidth, setWholeWidth] = useState<number>(WIDTH_MIN);
  const [fractionWidth, setFractionWidth] = useState<number>(0);
  const [wholeHeight, setWholeHeight] = useState<number>(HEIGHT_MIN);
  const [fractionHeight, setFractionHeight] = useState<number>(0);
  // Step 5
  const [wandDrop, setWandDrop] = useState<WandDrop>("Standard");
  const [sideMountBrackets, setSideMountBrackets] = useState<boolean>(false);
  const [holdDowns, setHoldDowns] = useState<boolean>(false);
  // Step 6
  const [quantity, setQuantity] = useState<number>(1);

  const [added, setAdded] = useState(false);
  const cart = useCart();
  const cartHasItems = cart.length > 0;

  // Force Smooth when Mist is selected (Mist has no Embossed option)
  function handleColorChange(c: ColorName) {
    setColorName(c);
    if (c === "Mist") setFinish("Smooth");
  }

  const combinedColor = `${colorName} ${finish}`;

  const { basePrice, sideMountFee, pricePerBlind, subtotal, shipping, total } =
    useMemo(() => {
      const widthDecimal = wholeWidth + fractionWidth;
      const heightDecimal = wholeHeight + fractionHeight;
      const widthBracket = roundUpToBracket(widthDecimal, WIDTHS);
      const heightBracket = roundUpToBracket(heightDecimal, HEIGHTS);
      const w = WIDTHS.indexOf(widthBracket);
      const h = HEIGHTS.indexOf(heightBracket);
      const msrp = FAUX_WOOD_MSRP[h][w];
      const base = calculatePrice(msrp);
      const surcharge = sideMountBrackets ? SIDE_MOUNT_SURCHARGE : 0;
      const perBlind = base + surcharge;
      const sub = perBlind * quantity;
      const ship = calculateShipping(quantity);
      return {
        basePrice: base,
        sideMountFee: surcharge,
        pricePerBlind: perBlind,
        subtotal: sub,
        shipping: ship,
        total: sub + ship,
      };
    }, [
      wholeWidth,
      fractionWidth,
      wholeHeight,
      fractionHeight,
      quantity,
      sideMountBrackets,
    ]);

  const widthStr = formatMeasurement(wholeWidth, fractionWidth);
  const heightStr = formatMeasurement(wholeHeight, fractionHeight);

  function handleAddToCart() {
    addToCart({
      id: crypto.randomUUID(),
      product: PRODUCT_NAME,
      color: combinedColor,
      width: widthStr,
      height: heightStr,
      liftSystem: LIFT_SYSTEM,
      quantity,
      unitPrice: pricePerBlind,
      shippingCost: shipping,
      productKey: PRODUCT_KEY,
      wholeWidth,
      fractionWidth,
      wholeHeight,
      fractionHeight,
      slatSize,
      finish,
      mountType,
      wandDrop,
      sideMountBrackets,
      holdDowns,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const currentColor = COLORS.find((c) => c.name === colorName)!;
  const embossedAvailable = currentColor.finishes.includes("Embossed" as never);

  const measurementNote =
    mountType === "Inside Mount"
      ? "Measure your window opening exactly. The factory will automatically deduct 3/8\" from your width for a proper inside mount fit."
      : "Measure the area you want covered. We recommend adding 1.5\" to 3\" on each side for best light coverage. No deductions are taken from your measurements.";

  return (
    <div className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8 shadow-sm">
      {/* STEP 1 — Slat Size */}
      <section className="mb-10">
        <StepHeader number={1} label="Slat Size" />
        <div className="grid grid-cols-2 gap-3">
          {SLAT_SIZES.map((size) => (
            <OptionCard
              key={size}
              selected={slatSize === size}
              onClick={() => setSlatSize(size)}
            >
              <div className="font-semibold text-charcoal">{size} Slats</div>
              <div className="mt-1 text-xs text-warm-gray-500">
                Same price either way
              </div>
            </OptionCard>
          ))}
        </div>
      </section>

      {/* STEP 2 — Color & Finish */}
      <section className="mb-10">
        <StepHeader number={2} label="Color" />
        <p className="text-xs text-warm-gray-500 leading-relaxed mb-4">
          Browse the available colors below. Pick your color and finish in
          the selectors that follow to commit them to your order.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {COLORS.map((c) => {
            const selected = colorName === c.name;
            return (
              <div
                key={c.name}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    selected
                      ? "border-[#9CAF88] ring-2 ring-[#9CAF88]/30"
                      : "border-warm-gray-200"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-hidden="true"
                />
                <span className="mt-2 text-xs leading-tight text-charcoal font-medium">
                  {c.name}
                </span>
                <span className="mt-0.5 text-[10px] text-warm-gray-400">
                  {c.finishes.join(" · ")}
                </span>
              </div>
            );
          })}
        </div>

        {/* Color selector */}
        <div className="mb-5">
          <label
            htmlFor="fw-color-select"
            className="block text-sm font-semibold text-charcoal mb-2"
          >
            Select your color
          </label>
          <select
            id="fw-color-select"
            value={colorName}
            onChange={(e) => handleColorChange(e.target.value as ColorName)}
            className="w-full bg-white border border-warm-gray-300 rounded-lg px-3 py-2.5 text-charcoal focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          >
            {COLORS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Finish */}
        <div>
          <div className="text-sm font-semibold text-charcoal mb-2">Finish</div>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              selected={finish === "Smooth"}
              onClick={() => setFinish("Smooth")}
              label="Smooth"
            />
            {embossedAvailable && (
              <RadioOption
                selected={finish === "Embossed"}
                onClick={() => setFinish("Embossed")}
                label="Embossed"
              />
            )}
          </div>
        </div>
      </section>

      {/* STEP 3 — Mount Type */}
      <section className="mb-10">
        <StepHeader number={3} label="Mount Type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <OptionCard
            selected={mountType === "Inside Mount"}
            onClick={() => setMountType("Inside Mount")}
          >
            <div className="font-semibold text-charcoal">Inside Mount</div>
            <div className="mt-1 text-sm text-warm-gray-500 leading-snug">
              Blind mounts inside the window frame. Clean, built-in look.
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
              Blind mounts outside the window frame. Provides better light
              blockage and makes window appear larger.
            </div>
            <div className="mt-2 text-xs text-warm-gray-400 leading-snug">
              No deduction taken from your measurements.
            </div>
          </OptionCard>
        </div>
      </section>

      {/* STEP 4 — Size */}
      <section className="mb-10">
        <StepHeader number={4} label="Enter Your Window Measurements" />
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
      </section>

      {/* STEP 5 — Options */}
      <section className="mb-10">
        <StepHeader number={5} label="Additional Options" />

        {/* Wand Drop */}
        <div className="mb-5">
          <div className="text-sm font-semibold text-charcoal mb-2">
            Wand Drop
          </div>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              selected={wandDrop === "Standard"}
              onClick={() => setWandDrop("Standard")}
              label="Standard"
            />
            <RadioOption
              selected={wandDrop === "Optional"}
              onClick={() => setWandDrop("Optional")}
              label="Optional"
            />
          </div>
        </div>

        {/* Side Mount Brackets */}
        <div className="mb-5">
          <div className="text-sm font-semibold text-charcoal mb-2">
            Side Mount Brackets
          </div>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              selected={!sideMountBrackets}
              onClick={() => setSideMountBrackets(false)}
              label="No"
            />
            <RadioOption
              selected={sideMountBrackets}
              onClick={() => setSideMountBrackets(true)}
              label={`Yes (+${fmt(SIDE_MOUNT_SURCHARGE)} per blind)`}
            />
          </div>
          <p className="mt-2 text-xs text-warm-gray-400 leading-relaxed">
            Required for outside mount on some window types.
          </p>
        </div>

        {/* Hold Downs */}
        <div>
          <div className="text-sm font-semibold text-charcoal mb-2">
            Hold Downs
          </div>
          <div className="flex flex-wrap gap-2">
            <RadioOption
              selected={!holdDowns}
              onClick={() => setHoldDowns(false)}
              label="No"
            />
            <RadioOption
              selected={holdDowns}
              onClick={() => setHoldDowns(true)}
              label="Yes"
            />
          </div>
          <p className="mt-2 text-xs text-warm-gray-400 leading-relaxed">
            Recommended for bottom-up operation in windy areas.
          </p>
        </div>
      </section>

      {/* STEP 6 — Quantity */}
      <section className="mb-10">
        <StepHeader number={6} label="Quantity" />
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
        <p className="mt-2 text-xs text-warm-gray-400 leading-relaxed">
          Ordering multiple blinds for the same window? Each blind is built to
          the exact size entered. For different sizes add each to cart
          separately.
        </p>
      </section>

      {/* PRICE DISPLAY */}
      <div className="bg-cream rounded-xl p-5 mb-6">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-warm-gray-500">Base price per blind</span>
          <span className="text-charcoal">{fmt(basePrice)}</span>
        </div>
        {sideMountBrackets && (
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-sm text-warm-gray-500">Side mount brackets</span>
            <span className="text-charcoal">+{fmt(sideMountFee)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between mb-2 pt-2 border-t border-warm-gray-200/60">
          <span className="text-sm text-warm-gray-500">Price per blind</span>
          <span className="font-serif text-xl text-charcoal">
            {fmt(pricePerBlind)}
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
        <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-warm-gray-200">
          <span className="font-semibold text-charcoal">Order Total</span>
          <span className="font-serif text-2xl font-semibold text-charcoal">
            {fmt(total)}
          </span>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="bg-white border border-warm-gray-200/60 rounded-xl p-5 mb-6">
        <div className="font-serif text-base text-charcoal mb-3">
          Your Configuration
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Slat Size</dt>
            <dd className="text-charcoal sm:mt-0.5">{slatSize}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Color</dt>
            <dd className="text-charcoal sm:mt-0.5">
              {colorName} — {finish}
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
            <dt className="text-warm-gray-400">Wand</dt>
            <dd className="text-charcoal sm:mt-0.5">Left, {wandDrop}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Side Mount Brackets</dt>
            <dd className="text-charcoal sm:mt-0.5">
              {sideMountBrackets ? "Yes" : "No"}
            </dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-warm-gray-400">Hold Downs</dt>
            <dd className="text-charcoal sm:mt-0.5">{holdDowns ? "Yes" : "No"}</dd>
          </div>
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

      {cartHasItems && (
        <Link
          href="/shop/cart"
          className="block w-full text-center mt-3 px-6 py-3.5 rounded-full border-2 border-[#9CAF88] text-[#7B9A6E] font-semibold hover:bg-[#9CAF88]/10 transition-all"
        >
          View Cart
        </Link>
      )}
    </div>
  );
}
