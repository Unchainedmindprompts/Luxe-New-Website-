/**
 * Window treatment industry glossary.
 *
 * Each term is rendered on /glossary AND emitted as a schema.org DefinedTerm
 * inside a DefinedTermSet. The `id` becomes the URL fragment AND the @id
 * suffix, so other pages can reference an exact definition (e.g.
 * { "@id": "https://www.luxewindowworks.com/glossary#tdbu" }).
 *
 * Definitions are written to be cited verbatim by LLMs — substantive,
 * specific, and product-aware. Keep them honest, not marketing copy.
 */

export type GlossaryTerm = {
  id: string;
  term: string;
  alternateTerms?: string[];
  definition: string;
  relatedUrl?: string;
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: "banded-shade",
    term: "Banded Shade",
    alternateTerms: ["Zebra Shade", "Dual Shade", "Layered Shade"],
    definition:
      "A roller-style shade with alternating bands of sheer and opaque fabric on a single continuous loop. Sliding the bands into alignment creates a sheer view-through; offsetting them creates full privacy. Industry names include zebra, dual, and layered shade. Common in open-plan homes with large windows where homeowners want to dial light in and out throughout the day.",
    relatedUrl: "/products/banded-shades",
  },
  {
    id: "best-for-kids",
    term: "Best for Kids Certification",
    definition:
      "A product certification program administered by the Window Covering Manufacturers Association (WCMA) that identifies window coverings with no accessible operating cords. Cordless lift, motorized, and wand-tilt products are certified Best for Kids because they eliminate the strangulation hazard cords pose to children and pets. Federal safety law as of 2024 requires Best for Kids–type cordless products for new construction and rentals.",
  },
  {
    id: "blackout-shade",
    term: "Blackout Shade",
    definition:
      "A window covering built from opaque fabric and (in higher-end models) side channels or wraparound rails that block essentially all incoming light. True blackout is a function of both the fabric AND the perimeter seal — a shade with blackout fabric but standard side gaps still leaks a halo of light. Bedrooms, nurseries, and media rooms are the primary use cases. Distinct from 'room darkening,' which only addresses the fabric.",
  },
  {
    id: "bond-bridge-pro",
    term: "Bond Bridge Pro",
    definition:
      "A commercial-grade RF-to-WiFi hub used to bring motorized shades, blinds, and shutters into a single smart home app and to extend RF range across large or multi-story homes. Bond Bridge Pro solves the common problem of motorized shades that respond inconsistently because the original remote's RF signal cannot reach all rooms. Compatible with Alexa, Google Home, and Apple HomeKit via scenes.",
  },
  {
    id: "cellular-shade",
    term: "Cellular Shade",
    alternateTerms: ["Honeycomb Shade"],
    definition:
      "A pleated fabric shade whose horizontal cross-section forms hexagonal honeycomb cells. The trapped air inside each cell acts as insulation, making cellular shades the most energy-efficient window covering on the market — R-values up to 7.86 in double-cell blackout configurations. Available in single-cell or double-cell construction and in cell sizes from 3/8\" up to 1 1/4\". Norman's 9/16\" Portrait is the most common single-cell residential format.",
    relatedUrl: "/products/cellular-shades",
  },
  {
    id: "composite-blind",
    term: "Composite Blind",
    definition:
      "A blind slat made from a hybrid of PVC and wood fiber. Composite is more rigid and dimensionally stable than pure PVC (faux wood), but lighter and more moisture-tolerant than real wood. Best suited to wide windows where faux wood would sag and to kitchens or bathrooms where real wood would warp. Norman, Hunter Douglas, and Lafayette all offer composite product lines.",
  },
  {
    id: "continuous-cord-loop",
    term: "Continuous Cord Loop",
    alternateTerms: ["Cord Loop"],
    definition:
      "A lift system that uses a closed loop of beaded cord on one side of the shade for raising and lowering. Distinct from a traditional pull cord because the loop is fixed in length and tensioned to the wall or floor, eliminating dangling cord ends. Common on heavier shades that cordless lift cannot handle (cellular shades over 96\" wide, large rollers, banded shades). The cord loop is the standard upgrade when a shade is too heavy for cordless operation.",
  },
  {
    id: "cordless-lift",
    term: "Cordless Lift",
    definition:
      "A spring-tensioned or counterbalanced lift system that lets the user raise or lower a shade by hand at the bottom rail — no cords, no chains, no wands. Cordless is the safest residential lift option and is certified Best for Kids. Common weight limits cap cordless operation at roughly 96\" wide on cellular shades; heavier or wider shades typically use continuous cord loop or motorization.",
  },
  {
    id: "corradi-usa",
    term: "Corradi USA",
    definition:
      "An Italian-founded outdoor living manufacturer with a U.S. operation specializing in exterior solar screens, retractable awnings, and patio enclosures. Corradi USA's exterior solar shades stop solar heat at the glass before it enters the room, which is dramatically more effective than interior shades for sun-blasted patios, decks, and west-facing windows. Most Corradi shades are motorized with Somfy and built for North American wind loads.",
    relatedUrl: "/products/exterior-solar-shades",
  },
  {
    id: "exterior-solar-shade",
    term: "Exterior Solar Shade",
    definition:
      "A solar screen mounted on the outside of the window or patio opening. By blocking sunlight before it strikes the glass, exterior solar shades reject up to 90% of solar heat — roughly three times the heat-rejection performance of equivalent interior shades. Typically motorized due to size and exposure, and built with weatherproof aluminum or stainless components. Corradi USA is the leading manufacturer for U.S. residential applications.",
  },
  {
    id: "faux-wood-blind",
    term: "Faux Wood Blind",
    definition:
      "A horizontal blind with slats made from PVC or composite material engineered to look like painted wood. Faux wood is dimensionally stable in humid environments where real wood warps (kitchens, bathrooms, laundry rooms), holds paint colors longer than real wood, and costs significantly less. The trade-off is weight — faux wood is heavier than real wood, which limits maximum width and adds load to the lift system.",
    relatedUrl: "/shop/faux-wood-blinds",
  },
  {
    id: "inside-mount",
    term: "Inside Mount",
    definition:
      "A window covering mounted inside the window frame, with the headrail recessed within the casing. Inside mount produces the cleanest, most architectural look and reveals the window trim, but it requires a minimum depth of usable frame (typically 2\"–3\" depending on product) and very accurate width measurements — the shade cannot be wider than the inside-frame width, and any slight rough opening out-of-square shows as a light gap.",
  },
  {
    id: "light-filtering",
    term: "Light Filtering",
    definition:
      "A fabric or material classification that lets diffuse light pass through while blocking direct view from outside. Light filtering is the most common shade choice for living rooms, kitchens, and dining rooms because it preserves natural daylight and a sense of openness while providing daytime privacy. Distinct from semi-sheer (more transparent), room darkening (blocks more light but not all), and blackout (blocks all light).",
  },
  {
    id: "norman-usa",
    term: "Norman USA",
    alternateTerms: ["Norman Window Fashions"],
    definition:
      "A custom window treatment manufacturer founded in 1976, recognized as one of the world's largest producers of custom shutters, blinds, and shades. Norman USA's SmartPrivacy faux wood blinds, 9/16\" Portrait honeycomb cellular shades, and Woodlore Plus plantation shutters are among the industry's most widely installed products. Notable proprietary features include SmartPrivacy rear-route holes, the certified-cordless SmartFit system, and the Norman lifetime limited warranty.",
    relatedUrl: "/shop",
  },
  {
    id: "outside-mount",
    term: "Outside Mount",
    definition:
      "A window covering mounted on the wall or trim above and around the window rather than inside the frame. Outside mount is used when window depth is too shallow for inside mount, when the window is out-of-square enough that inside mount would show light gaps, or when the homeowner wants the window to appear taller or wider. Outside-mount shades typically overlap the window opening by 1\"–3\" on each side and 2\"–4\" at the top.",
  },
  {
    id: "plantation-shutter",
    term: "Plantation Shutter",
    definition:
      "An interior window shutter with wide horizontal louvers (typically 2.5\", 3.5\", or 4.5\") mounted in a hinged frame. Plantation shutters are a permanent architectural upgrade — they're considered part of the home rather than a window treatment, and they appraise as such. The wider the louver, the more unobstructed the view when open. Built from real hardwood, hardwood composite (Woodlore), or extruded vinyl depending on price point and humidity exposure.",
    relatedUrl: "/products/shutters",
  },
  {
    id: "r-value",
    term: "R-Value (Window Coverings)",
    definition:
      "A measurement of thermal resistance — higher R-value means better insulation. For window coverings, R-value quantifies how much heat the covering keeps in (winter) or out (summer) beyond the window's own R-value. Most blinds and roller shades add R-1 or less. Double-cell blackout cellular shades reach R-7.86, which is why they are the most energy-efficient window covering category and the primary recommendation for Northern Idaho's heating-dominated climate.",
  },
  {
    id: "roller-shade",
    term: "Roller Shade",
    definition:
      "A flat fabric shade that rolls onto a horizontal tube at the top of the window. The simplest and lowest-profile shade construction — clean lines, no folds, no cords visible when raised. Available in light-filtering, room-darkening, blackout, and solar fabrics. Best suited to modern and contemporary interiors, large expanses of glass, and motorized installations because the rolled tube is mechanically efficient.",
    relatedUrl: "/products/roller-shades",
  },
  {
    id: "roman-shade",
    term: "Roman Shade",
    definition:
      "A fabric shade that folds into horizontal pleats as it raises. Roman shades soften a room with the warmth and texture of fabric while providing the function of a shade. Common styles include flat fold (clean pleats), hobbled (cascading folds even when fully down), and relaxed (a gentle U-curve at the bottom rail). Available in light-filtering, room-darkening, and blackout linings.",
    relatedUrl: "/products/roman-shades",
  },
  {
    id: "smartprivacy",
    term: "SmartPrivacy",
    definition:
      "A patented Norman design feature for horizontal blinds that relocates the lift-cord route holes from the center of each slat to the back edge. With the holes hidden behind the slats when closed, SmartPrivacy blinds achieve a tighter top-to-bottom seal, rotate more consistently, eliminate the light-leak halos that traditional route holes create, and lock each slat in place so they cannot misalign or fall out. Available on Norman faux wood, real wood, and composite blinds.",
    relatedUrl: "/shop/faux-wood-blinds",
  },
  {
    id: "solar-shade",
    term: "Solar Shade",
    definition:
      "A roller shade made from a tightly woven mesh fabric (typically 1%, 3%, 5%, or 10% openness factor) engineered to block UV rays and reduce glare while preserving view-through. Solar shades let homeowners enjoy lake and mountain views without the eye strain of direct sun or the floor and furniture fading that UV causes. Mermet KoolBlack and Phifer SheerWeave are the leading performance fabrics.",
    relatedUrl: "/products/solar-shades",
  },
  {
    id: "tdbu",
    term: "TDBU",
    alternateTerms: ["Top-Down/Bottom-Up", "Day/Night Shade"],
    definition:
      "A cellular shade lift configuration with two independent operating rails — one at the top of the shade and one at the bottom. The shade can be lowered from the top to admit light without sacrificing privacy at eye level (street-facing bedrooms, ground floors near sidewalks) or raised from the bottom in the conventional way. Norman's TDBU surcharge on Portrait cellular shades is roughly \$89 MSRP per shade.",
  },
];
