/**
 * 9/16" Portrait Honeycomb Cordless Single Cell shades.
 * MSRP values from Norman price sheet. Apply calculatePrice() from
 * @/lib/pricing to convert MSRP — including the optional TDBU surcharge —
 * to the customer-facing price.
 */

export const CELLULAR_WIDTHS = [24, 30, 36, 42, 48, 54, 60, 66, 72, 84, 96, 108, 120] as const;

export const CELLULAR_HEIGHTS = [36, 42, 48, 54, 60, 66, 72, 78, 84, 90, 96, 108, 120, 144] as const;

/** MSRP table: outer index = height (row), inner index = width (column). */
export const CELLULAR_MSRP: number[][] = [
  [212, 254, 274, 297, 318, 362, 437, 460, 508, 551, 630, 711, 791],
  [238, 270, 282, 312, 336, 385, 460, 486, 543, 579, 659, 737, 814],
  [248, 278, 291, 328, 366, 404, 485, 513, 573, 616, 695, 771, 849],
  [252, 286, 304, 340, 374, 423, 512, 543, 607, 659, 747, 837, 923],
  [266, 301, 318, 353, 412, 445, 543, 572, 642, 669, 750, 862, 918],
  [282, 326, 340, 368, 420, 463, 566, 596, 671, 723, 811, 898, 988],
  [289, 335, 349, 385, 439, 486, 592, 625, 707, 763, 864, 966, 1067],
  [338, 387, 412, 449, 490, 573, 611, 650, 730, 805, 923, 1043, 1161],
  [345, 401, 423, 468, 508, 596, 635, 676, 766, 845, 965, 1081, 1198],
  [353, 412, 439, 484, 525, 618, 661, 707, 797, 888, 1002, 1120, 1235],
  [365, 423, 451, 499, 544, 640, 688, 737, 829, 927, 1043, 1157, 1274],
  [401, 471, 508, 565, 618, 730, 791, 843, 956, 1011, 1122, 1233, 1347],
  [439, 520, 565, 625, 692, 823, 887, 952, 1083, 1173, 1281, 1388, 1494],
  [519, 622, 674, 748, 838, 1007, 1080, 1173, 1264, 1389, 1500, 1694, 1790],
];

export const CELLULAR_COLOR_DATA = [
  { code: "C7015K", name: "Brilliant White", hex: "#FAFAFA" },
  { code: "C7016K", name: "Cotton Cloud", hex: "#F5F5F0" },
  { code: "C7017K", name: "Gardenia", hex: "#F5F0E0" },
  { code: "C7135K", name: "French Silver", hex: "#C8C8C0" },
  { code: "C7138K", name: "Iron Mountain", hex: "#6B6B6B" },
  { code: "C7142K", name: "Dew", hex: "#D8DDD0" },
  { code: "C7143K", name: "Silver Dusk", hex: "#C0BDB5" },
  { code: "C7208K", name: "Space Gray", hex: "#808080" },
  { code: "C7423K", name: "Natural Tan", hex: "#E8DCC8" },
  { code: "C7424K", name: "Pale Oak", hex: "#DDD0B8" },
  { code: "C7425K", name: "Whipped Mocha", hex: "#B89880" },
  { code: "C7427K", name: "Wheat", hex: "#D4BC8C" },
  { code: "C7516K", name: "New Camel", hex: "#C8A870" },
  { code: "C7617K", name: "Florida Keys", hex: "#A8C0A0" },
  { code: "C7715K", name: "Bella Blue", hex: "#A0B0C8" },
] as const;

export type CellularColorCode = (typeof CELLULAR_COLOR_DATA)[number]["code"];
export type CellularColorName = (typeof CELLULAR_COLOR_DATA)[number]["name"];

/** Color name list — kept for server validation against legacy cart items. */
export const CELLULAR_COLORS: readonly string[] = CELLULAR_COLOR_DATA.map(
  (c) => c.name
);

export type CellularColor = CellularColorName;

/** TDBU (top-down/bottom-up) option surcharge in MSRP dollars; apply calculatePrice() to convert. */
export const CELLULAR_TDBU_MSRP_SURCHARGE = 89.0;

/** Cord Loop operating-system surcharge in MSRP dollars; apply calculatePrice() to convert. */
export const CELLULAR_CORD_LOOP_MSRP_SURCHARGE = 73.0;

/**
 * Operational constraints. The MSRP table includes widths up to 120" (carried over
 * from the Norman price sheet for reference), but cordless operation is capped at 96".
 * Heights above 96" are only available on widths ≤ 96".
 */
export const CELLULAR_MAX_WIDTH = 96;
export const CELLULAR_MAX_WIDTH_FOR_HEIGHTS_OVER_96 = 96;
