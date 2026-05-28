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
