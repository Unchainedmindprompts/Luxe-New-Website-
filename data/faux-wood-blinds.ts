/**
 * SmartPrivacy Cordless Faux Wood Blinds — 2" and 2.5" slats.
 * MSRP values from Norman price sheet. Apply calculatePrice() from
 * @/lib/pricing to convert MSRP to the customer-facing price.
 */

export const FAUX_WOOD_WIDTHS = [24, 28, 32, 36, 42, 48, 54, 60, 66, 72] as const;

export const FAUX_WOOD_HEIGHTS = [30, 36, 42, 48, 54, 60, 66, 73, 78, 84, 90, 96] as const;

/** MSRP table: outer index = height (row), inner index = width (column). */
export const FAUX_WOOD_MSRP: number[][] = [
  [134, 146, 156, 176, 186, 201, 218, 255, 272, 291],
  [140, 153, 163, 185, 199, 213, 238, 272, 289, 321],
  [152, 163, 179, 196, 212, 233, 257, 290, 314, 342],
  [161, 176, 186, 209, 227, 249, 274, 309, 336, 367],
  [176, 194, 203, 229, 250, 274, 299, 342, 367, 399],
  [186, 200, 217, 246, 266, 288, 319, 365, 389, 424],
  [196, 211, 229, 258, 279, 307, 337, 387, 414, 460],
  [208, 226, 244, 278, 299, 328, 361, 414, 445, 483],
  [213, 235, 257, 284, 312, 342, 376, 435, 467, 513],
  [226, 246, 269, 304, 328, 361, 401, 456, 494, 546],
  [235, 257, 279, 319, 342, 376, 416, 476, 513, 566],
  [244, 270, 291, 329, 361, 401, 443, 501, 542, 596],
];

export const FAUX_WOOD_COLORS = [
  "Pure White Smooth",
  "Pure White Embossed",
  "Silk White Smooth",
  "Silk White Embossed",
  "Pearl Smooth",
  "Pearl Embossed",
  "Designer White Smooth",
  "Designer White Embossed",
  "Mist Smooth",
] as const;

export type FauxWoodColor = (typeof FAUX_WOOD_COLORS)[number];

/** Operational max width supported. */
export const FAUX_WOOD_MAX_WIDTH = 72;

/** No top-down/bottom-up option on this product. */
export const FAUX_WOOD_TDBU_AVAILABLE = false;

/** Side-mount bracket option surcharge in MSRP dollars (per blind). Apply calculatePrice() to convert. */
export const FAUX_WOOD_SIDE_MOUNT_MSRP_SURCHARGE = 23.0;
