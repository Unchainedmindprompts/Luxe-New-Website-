/**
 * Shop pricing utilities — shared across product configurators.
 *
 * Formula: customer price = ((MSRP × COST_FACTOR) ÷ MARGIN) × CC_FEE,
 * rounded UP to the next cent.
 */

export const COST_FACTOR = 0.40;
export const MARGIN = 0.70;
export const CC_FEE = 1.03;
export const SHIPPING_FIRST = 25.0;
export const SHIPPING_ADDITIONAL = 11.0;

/** Convert an MSRP value to the customer-facing price (rounded up to the cent). */
export function calculatePrice(msrp: number): number {
  const cost = msrp * COST_FACTOR;
  const retail = cost / MARGIN;
  return Math.ceil(retail * CC_FEE * 100) / 100;
}

/** Flat shipping: SHIPPING_FIRST for the first unit, SHIPPING_ADDITIONAL per extra unit. */
export function calculateShipping(quantity: number): number {
  if (quantity <= 0) return 0;
  return SHIPPING_FIRST + SHIPPING_ADDITIONAL * (quantity - 1);
}

/** Standard 1/8" fraction increments used in the measurement inputs. */
export const FRACTIONS = [
  { label: "0", value: 0 },
  { label: "1/8", value: 0.125 },
  { label: "1/4", value: 0.25 },
  { label: "3/8", value: 0.375 },
  { label: "1/2", value: 0.5 },
  { label: "5/8", value: 0.625 },
  { label: "3/4", value: 0.75 },
  { label: "7/8", value: 0.875 },
] as const;

/**
 * Round a decimal measurement UP to the next available bracket value.
 * Industry-standard window-treatment pricing: always size up, never down.
 * Brackets must be sorted ascending. Returns the largest bracket if the
 * measurement exceeds it (caller is responsible for max-size validation).
 */
export function roundUpToBracket(
  measurement: number,
  brackets: readonly number[]
): number {
  for (const b of brackets) {
    if (b >= measurement) return b;
  }
  return brackets[brackets.length - 1];
}
