/**
 * North Idaho Hunter Douglas blocks for the general category pages.
 *
 * Built Nov 4, 2026 by twinning the Utah layer (lib/utah-hd.ts), which
 * itself twins the Eastside layer (lib/eastside-hd.ts). The routing
 * logic is the same as the other markets' rule: a category page connects
 * to North Idaho only through Hunter Douglas pages, the five
 * /hunter-douglas-<city> pages, and the category Service schema keeps
 * its Idaho-only areaServed; these blocks are visible links and copy
 * only. There is no North Idaho overview route, so unlike the Eastside
 * and Utah blocks this one carries no hub link: the Coeur d'Alene page
 * heads the city list instead.
 *
 * Copy rules for these blocks, which differ from Eastside and Utah in
 * one deliberate way: North Idaho is Luxe-installed work. Luxe Window
 * Works handles the consultation, professional measuring and
 * installation itself, and the lifetime installation guarantee DOES
 * apply here. Never credit measuring or installation to Hunter Douglas
 * Installation Services in this file: that is the Eastside and Utah
 * fulfillment model, not North Idaho's.
 */

export const NORTH_IDAHO_CITIES = [
  { name: "Coeur d'Alene", href: "/hunter-douglas-coeur-d-alene" },
  { name: "Post Falls", href: "/hunter-douglas-post-falls" },
  { name: "Hayden", href: "/hunter-douglas-hayden" },
  { name: "Rathdrum", href: "/hunter-douglas-rathdrum" },
  { name: "Sandpoint", href: "/hunter-douglas-sandpoint" },
] as const;

export interface NorthIdahoHdCategory {
  /** Serif heading for the block. */
  heading: string;
  /** The Hunter Douglas line this category maps to, as named on /products/hunter-douglas. */
  line: string;
  /** Anchor id of that line's card on /products/hunter-douglas. */
  anchor: string;
  /**
   * Same placements as the Eastside and Utah blocks, so the three market
   * blocks sit together on the page: "after-guide" beside the buying
   * guide's Hunter Douglas mention, "before-cta" ahead of the final
   * call to action.
   */
  placement: "after-guide" | "before-cta";
  intro: string;
  warranty: string;
}

const FULFILLMENT =
  "We visit your home by appointment with samples, so you can compare options in your own light, and Luxe Window Works handles professional measuring and installation, backed by our lifetime installation guarantee.";

export const NORTH_IDAHO_HD: Record<string, NorthIdahoHdCategory> = {
  "blinds": {
    heading: "Hunter Douglas Blinds in North Idaho",
    line: "Hunter Douglas blinds",
    anchor: "wood-blinds",
    placement: "after-guide",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, and blinds are a strong part of the line: Parkland® wood blinds, EverWood® faux wood blinds and Modern Precious Metals® aluminum blinds. " +
      FULFILLMENT,
    warranty:
      "Your blinds carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "cellular-shades": {
    heading: "Hunter Douglas Cellular Shades in North Idaho",
    line: "Duette® cellular shades",
    anchor: "duette",
    placement: "after-guide",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, including Duette® cellular shades, the honeycomb line that insulates right at the glass, a real consideration in Post Falls and Rathdrum, where there is no lake to moderate the temperature swings. " +
      FULFILLMENT,
    warranty:
      "Your shades carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "roller-shades": {
    heading: "Hunter Douglas Roller Shades in North Idaho",
    line: "Designer Roller Shades",
    anchor: "roller-shades",
    placement: "after-guide",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, including Designer Roller Shades, Sonnette® cellular roller shades and Alustra® designs, a clean fit for the open floor plans and large windows in North Idaho's newer construction. " +
      FULFILLMENT,
    warranty:
      "Your shades carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "solar-shades": {
    heading: "Hunter Douglas Solar Shades in North Idaho",
    line: "Designer Solar Shades",
    anchor: "solar-shades",
    placement: "before-cta",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, including Designer Solar Shades, woven to cut glare and UV while keeping your view, the starting point on Hayden Lake and Lake Pend Oreille waterfront glass. " +
      FULFILLMENT,
    warranty:
      "Your shades carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "shutters": {
    heading: "Hunter Douglas Shutters in North Idaho",
    line: "Hunter Douglas shutters",
    anchor: "shutters",
    placement: "after-guide",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, including Heritance® hardwood shutters, Palm Beach™ Polysatin™ shutters and NewStyle® hybrid shutters, a strong match for the older homes near downtown Coeur d'Alene and Sandpoint. " +
      FULFILLMENT,
    warranty:
      "Your shutters carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "roman-shades": {
    heading: "Hunter Douglas Roman Shades in North Idaho",
    line: "Vignette® Roman shades",
    anchor: "vignette",
    placement: "before-cta",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, including Vignette® Roman shades, with flat and full folds in fabrics from quiet neutrals to a more expressive finish. " +
      FULFILLMENT,
    warranty:
      "Your shades carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "banded-shades": {
    heading: "Hunter Douglas Banded Shades in North Idaho",
    line: "Designer Banded Shades",
    anchor: "banded-shades",
    placement: "before-cta",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, including Designer Banded Shades, with alternating sheer and solid bands that shift for filtered light or full privacy, a contemporary fit for North Idaho's new subdivisions. " +
      FULFILLMENT,
    warranty:
      "Your shades carry the Hunter Douglas lifetime warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
  "motorization": {
    heading: "Hunter Douglas PowerView in North Idaho",
    line: "PowerView® Automation",
    anchor: "powerview",
    placement: "after-guide",
    intro:
      "In North Idaho, Luxe Window Works leads with Hunter Douglas, and most collections can be motorized with PowerView® Automation, the practical answer for tall lodge windows near Schweitzer, clerestory glass in new construction, and Hayden Lake vacation homes that sit empty between visits. " +
      FULFILLMENT,
    warranty:
      "Your shades carry the Hunter Douglas lifetime warranty, PowerView carries a five-year warranty, and Luxe's installation is covered by our lifetime installation guarantee.",
  },
};
