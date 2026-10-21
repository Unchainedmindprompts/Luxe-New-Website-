/**
 * Eastside Hunter Douglas blocks for the general category pages.
 *
 * Mark's routing rule (Oct 17, 2026): the Eastside is a Hunter Douglas only
 * market, fulfilled through Hunter Douglas Installation Services, so the
 * general category pages may connect to the Eastside ONLY through Hunter
 * Douglas pages: the /eastside overview and the six /hunter-douglas-<city>
 * pages. No Eastside claim ever lands on a general category, and the
 * category Service schema keeps its Idaho-only areaServed for the same
 * reason; these blocks are visible links and copy only.
 *
 * Copy rules for these blocks: Hunter Douglas only; measuring and
 * installation credited to Hunter Douglas Installation Services; the
 * one-year installation guarantee belongs to the service. The phrase
 * "lifetime installation guarantee" must never appear here: that promise
 * covers Luxe-installed work in North Idaho only.
 *
 * Update (Mark, Oct 21, 2026): Hunter Douglas Installation Services also
 * installs Alta Window Fashions products, and Alta is offered on the
 * Eastside by appointment alongside Hunter Douglas. That fact is stated
 * on the /eastside hub, the six Eastside area pages, and the installation
 * answers on the six Hunter Douglas city pages. These category blocks
 * stay Hunter Douglas specific because each one maps to a Hunter Douglas
 * line; they are not the place the Alta offer is made.
 */

export const EASTSIDE_CITIES = [
  { name: "Bellevue", href: "/hunter-douglas-bellevue" },
  { name: "Kirkland", href: "/hunter-douglas-kirkland" },
  { name: "Sammamish", href: "/hunter-douglas-sammamish" },
  { name: "Issaquah", href: "/hunter-douglas-issaquah" },
  { name: "Renton", href: "/hunter-douglas-renton" },
  { name: "Maple Valley", href: "/hunter-douglas-maple-valley" },
] as const;

export interface EastsideHdCategory {
  /** Serif heading for the block. */
  heading: string;
  /** The Hunter Douglas line this category maps to, as named on /products/hunter-douglas. */
  line: string;
  /** Anchor id of that line's card on /products/hunter-douglas. */
  anchor: string;
  /**
   * "after-guide": pages whose buying guide already mentions Hunter Douglas
   * get the block beside that mention. "before-cta": pages with no buying
   * guide get it ahead of the final call to action.
   */
  placement: "after-guide" | "before-cta";
  intro: string;
  warranty: string;
}

const FULFILLMENT =
  "Measuring and installation are performed by Hunter Douglas Installation Services, Hunter Douglas’s own certified installation service, with measurements guaranteed for fit.";

export const EASTSIDE_HD: Record<string, EastsideHdCategory> = {
  "blinds": {
    heading: "Hunter Douglas Blinds on the Eastside",
    line: "Hunter Douglas blinds",
    anchor: "wood-blinds",
    placement: "after-guide",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, and blinds are a strong part of the line: Parkland® wood blinds, EverWood® faux wood blinds and Modern Precious Metals® aluminum blinds. We visit your home by appointment with samples, so you can compare slat sizes, finishes and controls in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your blinds carry the Hunter Douglas lifetime warranty.",
  },
  "cellular-shades": {
    heading: "Hunter Douglas Cellular Shades on the Eastside",
    line: "Duette® cellular shades",
    anchor: "duette",
    placement: "after-guide",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, including Duette® cellular shades, the honeycomb line that insulates right at the glass. We visit your home by appointment with samples, so you can compare fabrics, cell sizes and light control in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "roller-shades": {
    heading: "Hunter Douglas Roller Shades on the Eastside",
    line: "Designer Roller Shades",
    anchor: "roller-shades",
    placement: "after-guide",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, including Designer Roller Shades, Sonnette® cellular roller shades and Alustra® designs. We visit your home by appointment with samples, so you can compare fabrics and openness in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "solar-shades": {
    heading: "Hunter Douglas Solar Shades on the Eastside",
    line: "Designer Solar Shades",
    anchor: "solar-shades",
    placement: "before-cta",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, including Designer Solar Shades, woven to cut glare and UV while keeping your view of the lake or the Cascades. We visit your home by appointment with samples, so you can compare openness levels in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "shutters": {
    heading: "Hunter Douglas Shutters on the Eastside",
    line: "Hunter Douglas shutters",
    anchor: "shutters",
    placement: "after-guide",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, including Heritance® hardwood shutters, Palm Beach™ Polysatin™ shutters and NewStyle® hybrid shutters. We visit your home by appointment with samples, so you can compare materials, louver sizes and finishes in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your shutters carry the Hunter Douglas lifetime warranty.",
  },
  "roman-shades": {
    heading: "Hunter Douglas Roman Shades on the Eastside",
    line: "Vignette® Roman shades",
    anchor: "vignette",
    placement: "before-cta",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, including Vignette® Roman shades, with flat and full folds in fabrics from quiet neutrals to a more expressive finish. We visit your home by appointment with samples, so you can compare fabrics in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "banded-shades": {
    heading: "Hunter Douglas Banded Shades on the Eastside",
    line: "Designer Banded Shades",
    anchor: "banded-shades",
    placement: "before-cta",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, including Designer Banded Shades, with alternating sheer and solid bands that shift for filtered light or full privacy. We visit your home by appointment with samples, so you can see the bands work in your own light. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, and your shades carry the Hunter Douglas lifetime warranty.",
  },
  "motorization": {
    heading: "Hunter Douglas PowerView on the Eastside",
    line: "PowerView® Automation",
    anchor: "powerview",
    placement: "after-guide",
    intro:
      "On Seattle’s Eastside, Luxe Window Works sells Hunter Douglas only, and most collections can be motorized with PowerView® Automation. We visit your home by appointment, talk through how you want to control your shades, by remote, app, schedule or voice, and confirm the power options for your windows. " +
      FULFILLMENT,
    warranty:
      "Eastside installations carry a one-year installation guarantee from the service, your shades carry the Hunter Douglas lifetime warranty, and PowerView carries a five-year warranty.",
  },
};

/**
 * Category anchors on /products/hunter-douglas, for the strip on the
 * Hunter Douglas location pages. Every id below is a card rendered from
 * HD_CATEGORIES in lib/hunter-douglas.ts; the labels use that page's own
 * category and collection names. Location pages link here and nowhere
 * else: never out to the general /products/<category> pages.
 */
export const HD_CATEGORY_STRIP = [
  { label: "Blinds", detail: "Parkland® · EverWood®", anchor: "wood-blinds" },
  { label: "Cellular Shades", detail: "Duette®", anchor: "duette" },
  { label: "Roller Shades", detail: "Designer Roller", anchor: "roller-shades" },
  { label: "Solar Shades", detail: "Designer Solar Shades", anchor: "solar-shades" },
  { label: "Shutters", detail: "Heritance® · NewStyle®", anchor: "shutters" },
  { label: "Roman Shades", detail: "Vignette®", anchor: "vignette" },
  { label: "Banded Shades", detail: "Designer Banded", anchor: "banded-shades" },
  { label: "Motorization", detail: "PowerView®", anchor: "powerview" },
] as const;
