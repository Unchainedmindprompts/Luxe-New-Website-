import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { BUSINESS } from "@/lib/constants";
import {
  calculatePrice,
  calculateShipping,
  FRACTIONS,
  roundUpToBracket,
  formatMeasurement,
} from "@/lib/pricing";
import {
  FAUX_WOOD_COLORS,
  FAUX_WOOD_WIDTHS,
  FAUX_WOOD_HEIGHTS,
  FAUX_WOOD_MSRP,
  FAUX_WOOD_SIDE_MOUNT_MSRP_SURCHARGE,
} from "@/data/faux-wood-blinds";
import {
  CELLULAR_COLORS,
  CELLULAR_WIDTHS,
  CELLULAR_HEIGHTS,
  CELLULAR_MSRP,
  CELLULAR_TDBU_MSRP_SURCHARGE,
  CELLULAR_MAX_WIDTH,
} from "@/data/cellular-shades";

export const runtime = "nodejs";

type ProductKey = "faux-wood-blinds" | "cellular-shades";
type Lift = "cordless" | "tdbu";

type IncomingItem = {
  productKey: ProductKey;
  color: string;
  wholeWidth: number;
  fractionWidth: number;
  wholeHeight: number;
  fractionHeight: number;
  lift?: Lift;
  quantity: number;
  // Faux-wood-specific options
  slatSize?: string;
  finish?: string;
  mountType?: string;
  wandDrop?: string;
  sideMountBrackets?: boolean;
  holdDowns?: boolean;
};

type CheckoutBody = { items: IncomingItem[] };

type PricedLine = {
  productName: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  // Metadata fields preserved for the order record
  meta: {
    productKey: string;
    color: string;
    width: string;
    height: string;
    liftSystem: string;
    quantity: number;
  };
};

const VALID_FRACTIONS = new Set<number>(FRACTIONS.map((f) => f.value));

const FAUX_WIDTHS_ARR: number[] = [...FAUX_WOOD_WIDTHS];
const FAUX_HEIGHTS_ARR: number[] = [...FAUX_WOOD_HEIGHTS];
const FAUX_COLOR_SET = new Set<string>(FAUX_WOOD_COLORS);

const CEL_ALL_WIDTHS: number[] = [...CELLULAR_WIDTHS];
const CEL_HEIGHTS_ARR: number[] = [...CELLULAR_HEIGHTS];
const CEL_CORDLESS_WIDTHS: number[] = CEL_ALL_WIDTHS.filter(
  (w) => w <= CELLULAR_MAX_WIDTH
);
const CEL_COLOR_SET = new Set<string>(CELLULAR_COLORS);

const fail = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

function validateItemShape(it: Partial<IncomingItem>): string | null {
  if (
    it.productKey !== "faux-wood-blinds" &&
    it.productKey !== "cellular-shades"
  ) {
    return "Invalid productKey";
  }
  if (typeof it.color !== "string" || !it.color) return "Missing color";
  if (
    typeof it.wholeWidth !== "number" ||
    !Number.isInteger(it.wholeWidth) ||
    typeof it.wholeHeight !== "number" ||
    !Number.isInteger(it.wholeHeight)
  ) {
    return "Whole-inch measurements must be integers";
  }
  if (
    typeof it.fractionWidth !== "number" ||
    typeof it.fractionHeight !== "number" ||
    !VALID_FRACTIONS.has(it.fractionWidth) ||
    !VALID_FRACTIONS.has(it.fractionHeight)
  ) {
    return "Invalid fraction value";
  }
  if (
    typeof it.quantity !== "number" ||
    !Number.isInteger(it.quantity) ||
    it.quantity < 1
  ) {
    return "Quantity must be a positive integer";
  }
  if (it.lift !== undefined && it.lift !== "cordless" && it.lift !== "tdbu") {
    return "Invalid lift system";
  }
  return null;
}

function priceFauxWood(it: IncomingItem): PricedLine | { error: string } {
  if (!FAUX_COLOR_SET.has(it.color)) return { error: "Invalid color" };
  const widthDecimal = it.wholeWidth + it.fractionWidth;
  const heightDecimal = it.wholeHeight + it.fractionHeight;
  const widthMax = FAUX_WIDTHS_ARR[FAUX_WIDTHS_ARR.length - 1];
  const heightMax = FAUX_HEIGHTS_ARR[FAUX_HEIGHTS_ARR.length - 1];
  if (widthDecimal < FAUX_WIDTHS_ARR[0] || widthDecimal > widthMax) {
    return { error: `Width must be between ${FAUX_WIDTHS_ARR[0]} and ${widthMax} inches` };
  }
  if (heightDecimal < FAUX_HEIGHTS_ARR[0] || heightDecimal > heightMax) {
    return { error: `Height must be between ${FAUX_HEIGHTS_ARR[0]} and ${heightMax} inches` };
  }
  const widthBracket = roundUpToBracket(widthDecimal, FAUX_WIDTHS_ARR);
  const heightBracket = roundUpToBracket(heightDecimal, FAUX_HEIGHTS_ARR);
  const w = FAUX_WIDTHS_ARR.indexOf(widthBracket);
  const h = FAUX_HEIGHTS_ARR.indexOf(heightBracket);
  const msrp = FAUX_WOOD_MSRP[h][w];
  const base = calculatePrice(msrp);
  const sideMountSurcharge = it.sideMountBrackets
    ? calculatePrice(FAUX_WOOD_SIDE_MOUNT_MSRP_SURCHARGE)
    : 0;
  const perUnit = base + sideMountSurcharge;

  const widthStr = formatMeasurement(it.wholeWidth, it.fractionWidth);
  const heightStr = formatMeasurement(it.wholeHeight, it.fractionHeight);
  const productName = "SmartPrivacy Cordless Faux Wood Blinds";
  const liftSystem = "Cordless";

  const descParts: string[] = [];
  if (it.slatSize) descParts.push(`Slat: ${it.slatSize}`);
  descParts.push(`Color: ${it.color}`);
  descParts.push(`Size: ${widthStr} x ${heightStr}`);
  if (it.mountType) descParts.push(`Mount: ${it.mountType}`);
  if (it.sideMountBrackets) descParts.push("Side-mount brackets");
  if (it.holdDowns) descParts.push("Hold downs");
  descParts.push(`Lift: ${liftSystem}`);

  return {
    productName,
    description: descParts.join(" · "),
    quantity: it.quantity,
    unitPriceCents: Math.round(perUnit * 100),
    meta: {
      productKey: "faux-wood-blinds",
      color: it.color,
      width: widthStr,
      height: heightStr,
      liftSystem,
      quantity: it.quantity,
    },
  };
}

function priceCellular(it: IncomingItem): PricedLine | { error: string } {
  if (!CEL_COLOR_SET.has(it.color)) return { error: "Invalid color" };
  if (it.lift !== "cordless" && it.lift !== "tdbu") {
    return { error: "Invalid lift system" };
  }
  const widthDecimal = it.wholeWidth + it.fractionWidth;
  const heightDecimal = it.wholeHeight + it.fractionHeight;
  const heightMax = CEL_HEIGHTS_ARR[CEL_HEIGHTS_ARR.length - 1];
  if (widthDecimal < CEL_CORDLESS_WIDTHS[0]) {
    return { error: `Width must be at least ${CEL_CORDLESS_WIDTHS[0]} inches` };
  }
  if (widthDecimal > CELLULAR_MAX_WIDTH) {
    return {
      error: `Cordless shades have a maximum width of ${CELLULAR_MAX_WIDTH} inches`,
    };
  }
  if (heightDecimal < CEL_HEIGHTS_ARR[0] || heightDecimal > heightMax) {
    return { error: `Height must be between ${CEL_HEIGHTS_ARR[0]} and ${heightMax} inches` };
  }
  const widthBracket = roundUpToBracket(widthDecimal, CEL_CORDLESS_WIDTHS);
  const heightBracket = roundUpToBracket(heightDecimal, CEL_HEIGHTS_ARR);
  const w = CEL_ALL_WIDTHS.indexOf(widthBracket);
  const h = CEL_HEIGHTS_ARR.indexOf(heightBracket);
  const msrp = CELLULAR_MSRP[h][w];
  const base = calculatePrice(msrp);
  const surcharge =
    it.lift === "tdbu" ? calculatePrice(CELLULAR_TDBU_MSRP_SURCHARGE) : 0;
  const perUnit = base + surcharge;

  const widthStr = formatMeasurement(it.wholeWidth, it.fractionWidth);
  const heightStr = formatMeasurement(it.wholeHeight, it.fractionHeight);
  const productName = '9/16" Portrait Honeycomb Cell Shades';
  const liftSystem =
    it.lift === "tdbu" ? "Top Down Bottom Up (TDBU)" : "Cordless";

  return {
    productName,
    description: `Color: ${it.color} · Size: ${widthStr} x ${heightStr} · Lift: ${liftSystem}`,
    quantity: it.quantity,
    unitPriceCents: Math.round(perUnit * 100),
    meta: {
      productKey: "cellular-shades",
      color: it.color,
      width: widthStr,
      height: heightStr,
      liftSystem,
      quantity: it.quantity,
    },
  };
}

export async function POST(request: Request) {
  let raw: Partial<CheckoutBody>;
  try {
    raw = (await request.json()) as Partial<CheckoutBody>;
  } catch {
    return fail("Invalid JSON body");
  }

  const items = raw.items;
  if (!Array.isArray(items) || items.length === 0) {
    return fail("Cart is empty");
  }
  if (items.length > 50) {
    return fail("Too many items in cart");
  }

  const priced: PricedLine[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i] as Partial<IncomingItem>;
    const shapeError = validateItemShape(it);
    if (shapeError) return fail(`Item ${i + 1}: ${shapeError}`);
    const valid = it as IncomingItem;
    const result =
      valid.productKey === "faux-wood-blinds"
        ? priceFauxWood(valid)
        : priceCellular(valid);
    if ("error" in result) return fail(`Item ${i + 1}: ${result.error}`);
    if (result.unitPriceCents < 1) {
      return fail(`Item ${i + 1}: computed price is invalid`);
    }
    priced.push(result);
  }

  // Cart-level shipping: $25 first unit + $11 per additional unit.
  const totalUnits = priced.reduce((sum, p) => sum + p.quantity, 0);
  const shippingDollars = totalUnits > 0 ? 25 + 11 * (totalUnits - 1) : 0;
  const shippingCents = Math.round(shippingDollars * 100);

  const origin = request.headers.get("origin") || BUSINESS.url;
  const stripe = getStripe();

  // Stripe metadata caps each value at 500 chars; serialize the cart compactly.
  const cartMetadata = priced.map((p, idx) => ({
    n: idx + 1,
    product: p.meta.productKey,
    color: p.meta.color,
    size: `${p.meta.width}x${p.meta.height}`,
    lift: p.meta.liftSystem,
    qty: p.meta.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        ...priced.map((p) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: p.productName,
              description: p.description,
            },
            unit_amount: p.unitPriceCents,
          },
          quantity: p.quantity,
        })),
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Shipping",
              description: "Actual freight cost",
            },
            unit_amount: shippingCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop/cancel`,
      shipping_address_collection: { allowed_countries: ["US"] },
      metadata: {
        itemCount: String(priced.length),
        totalUnits: String(totalUnits),
        cart: JSON.stringify(cartMetadata).slice(0, 500),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: `Checkout failed: ${message}` },
      { status: 500 }
    );
  }
}
