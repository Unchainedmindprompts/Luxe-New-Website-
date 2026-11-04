/**
 * Utah Hunter Douglas blocks for the general category pages.
 *
 * Built Nov 4, 2026 by twinning the Eastside layer (lib/eastside-hd.ts)
 * after Mark found the Eastside pages easily outranking the Utah pages:
 * Utah had no Hunter Douglas city layer at all. The routing logic is the
 * same as the Eastside rule: a category page connects to Utah only
 * through Hunter Douglas pages, the /utah overview and the eight
 * /hunter-douglas-<city> pages, and the category Service schema keeps its
 * Idaho-only areaServed; these blocks are visible links and copy only.
 *
 * Copy rules for these blocks, which differ from the Eastside in one
 * deliberate way: Utah is a two-brand market. Luxe leads with Hunter
 * Douglas and also offers Alta Window Fashions, and Hunter Douglas
 * Installation Services measures and installs BOTH brands in Utah. Never
 * write "Hunter Douglas only" for Utah. Measuring and installation are
 * credited to Hunter Douglas Installation Services; the one-year
 * installation guarantee belongs to the service. The phrase "lifetime
 * installation guarantee" must never appear here: that promise covers
 * Luxe-installed work in North Idaho only.
 */

export const UTAH_CITIES = [
  { name: "Salt Lake City", href: "/hunter-douglas-salt-lake-city" },
  { name: "Millcreek", href: "/hunter-douglas-millcreek" },
  { name: "Holladay", href: "/hunter-douglas-holladay" },
  { name: "Draper", href: "/hunter-douglas-draper" },
  { name: "South Jordan", href: "/hunter-douglas-south-jordan" },
  { name: "Park City", href: "/hunter-douglas-park-city" },
  { name: "Heber City", href: "/hunter-douglas-heber-city" },
  { name: "Midway", href: "/hunter-douglas-midway" },
] as const;

export interface UtahHdCategory {
  /** Serif heading for the block. */
  heading: string;
  /** The Hunter Douglas line this category maps to, as named on /products/hunter-douglas. */
  line: string;
  /** Anchor id of that line's card on /products/hunter-douglas. */
  anchor: string;
  /**
   * Same placements as the Eastside blocks, so the two market blocks sit
   * together on the page: "after-guide" beside the buying guide's Hunter
   * Douglas mention, "before-cta" ahead of the final call to action.
   */
  placement: "after-guide" | "before-cta";
  intro: string;
  warranty: string;
}

const FULFILLMENT =
  "Measuring and installation are performed by Hunter Douglas Installation Services, Hunter Douglas’s own certified installation service, with measurements guaranteed for fit.";

const ALTA =
  " Alta Window Fashions is also available in Utah, measured and installed through the same service.";

export const UTAH_HD: Record<string, UtahHdCategory> = {
  "blinds": {
    heading: "Hunter Douglas Blinds in Utah",
    line: "Hunter Douglas blinds",
    anchor: "wood-blinds",
    placement: "after-guide",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, and blinds are a strong part of the line: Parkland® wood blinds, EverWood® faux wood blinds and Modern Precious Metals® aluminum blinds. We visit your home by appointment with samples, so you can compare slat sizes, finishes and controls in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your blinds carry the Hunter Douglas lifetime warranty.",
  },
  "cellular-shades": {
    heading: "Hunter Douglas Cellular Shades in Utah",
    line: "Duette® cellular shades",
    anchor: "duette",
    placement: "after-guide",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, including Duette® cellular shades, the honeycomb line that insulates right at the glass, a real consideration through valley inversions and Wasatch Back winters. We visit your home by appointment with samples, so you can compare fabrics, cell sizes and light control in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "roller-shades": {
    heading: "Hunter Douglas Roller Shades in Utah",
    line: "Designer Roller Shades",
    anchor: "roller-shades",
    placement: "after-guide",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, including Designer Roller Shades, Sonnette® cellular roller shades and Alustra® designs. We visit your home by appointment with samples, so you can compare fabrics and openness in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "solar-shades": {
    heading: "Hunter Douglas Solar Shades in Utah",
    line: "Designer Solar Shades",
    anchor: "solar-shades",
    placement: "before-cta",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, including Designer Solar Shades, woven to cut glare and UV while keeping your view of the valley or the Wasatch. At Utah elevations the sun is stronger than the temperature suggests, which makes this line a starting point in many Utah homes. We visit your home by appointment with samples, so you can compare openness levels in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "shutters": {
    heading: "Hunter Douglas Shutters in Utah",
    line: "Hunter Douglas shutters",
    anchor: "shutters",
    placement: "after-guide",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, including Heritance® hardwood shutters, Palm Beach™ Polysatin™ shutters and NewStyle® hybrid shutters. We visit your home by appointment with samples, so you can compare materials, louver sizes and finishes in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your shutters carry the Hunter Douglas lifetime warranty.",
  },
  "roman-shades": {
    heading: "Hunter Douglas Roman Shades in Utah",
    line: "Vignette® Roman shades",
    anchor: "vignette",
    placement: "before-cta",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, including Vignette® Roman shades, with flat and full folds in fabrics from quiet neutrals to a more expressive finish. We visit your home by appointment with samples, so you can compare fabrics in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "banded-shades": {
    heading: "Hunter Douglas Banded Shades in Utah",
    line: "Designer Banded Shades",
    anchor: "banded-shades",
    placement: "before-cta",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, including Designer Banded Shades, with alternating sheer and solid bands that shift for filtered light or full privacy. We visit your home by appointment with samples, so you can see the bands work in your own light. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "motorization": {
    heading: "Hunter Douglas PowerView in Utah",
    line: "PowerView® Automation",
    anchor: "powerview",
    placement: "after-guide",
    intro:
      "In Utah, Luxe Window Works leads with Hunter Douglas, and most collections can be motorized with PowerView® Automation, a practical answer for two-story glass and for second homes that sit empty between visits. We visit your home by appointment, talk through how you want to control your shades, by remote, app, schedule or voice, and confirm the power options for your windows. " +
      FULFILLMENT +
      ALTA,
    warranty:
      "Utah installations carry a one-year installation guarantee from the service, your shades carry the Hunter Douglas lifetime warranty, and PowerView carries a five-year warranty.",
  },
};
