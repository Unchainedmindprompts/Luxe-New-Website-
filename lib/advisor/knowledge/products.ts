/**
 * Luxe Window Advisor — product direction knowledge. (Phase A)
 *
 * Nine single directions, two layered directions, and the cross-cutting options
 * that are not directions at all.
 *
 * SOURCING RULE: every statement below traces to the approved Luxe brief. No
 * manufacturer specification is stated as fact, no general window-treatment
 * knowledge has been imported from outside the brief, and the brief's own
 * hedges are preserved rather than hardened — "approximately 3/4 inch,
 * sometimes more" stays approximate, because the brief explicitly says not to
 * hard-code those as guaranteed dimensions.
 *
 * `siteProductSlugs` is declared, not inferred. Matching an advisor direction
 * to a site product page by display name would be guesswork — "Blinds" is one
 * page covering two directions here, "Solar Shades" and "Exterior Solar Shades"
 * are near-identical names for materially different products, and drapery has
 * no page at all. The drift cross-check reads these declarations so a renamed
 * or added category is caught as a real change rather than a string mismatch.
 */
import type {
  Condition,
  Contraindication,
  CrossCuttingOption,
  ProductDirection,
  UnrepresentedSiteProduct,
} from "../types";

/** Fabric and wood products the brief says to move away from in splash zones. */
const DIRECT_SPLASH = { fact: "moistureExposure", is: ["direct-splash"] } as const;

/**
 * Keeping the outside view **while the treatment is deployed** is a leading
 * priority.
 *
 * This is deliberately not the same thing as wanting clear glass when the
 * covering is raised — that is `clear-glass-when-open`, and a roller shade
 * serves it well. Confusing the two is the mistake this shared definition
 * exists to prevent, so every direction that cannot show a view while it is
 * down references this one condition rather than restating it.
 *
 * Interior solar is the direction that survives it, because the mesh keeps
 * continuous outward visibility. Everything opaque or semi-opaque is
 * deprioritized against solar — never excluded, because privacy, darkening,
 * aesthetics, cost or how the window is actually used can outweigh daytime
 * view.
 */
const VIEW_WHILE_DEPLOYED_IS_LEADING: Condition = {
  any: [
    { priority: "view-preservation", withinTop: 2 },
    { fact: "viewImportance", is: ["high", "critical"] },
  ],
};

/**
 * Behaviour shared by the roller family — interior roller shades and banded
 * shades.
 *
 * The approved knowledge is explicit that banded shades follow roller logic on
 * strengths, limitations, mounting, operation, room darkening, access and
 * motorization, and diverge only on appearance and view behaviour. Sharing the
 * record rather than restating it means the two cannot drift apart on a
 * dimension where Luxe considers them the same product, and it keeps the
 * divergences visible: whatever a family member overrides is, by construction,
 * exactly where it differs.
 */
const ROLLER_FAMILY = {
  privacyBehavior: "Full privacy when down with an opaque fabric.",
  roomDarkeningBehavior:
    "Inside-mount roller shades are generally not Luxe's preferred solution when maximum room darkening is the primary goal. Typical side gaps run roughly 3/4 inch on the drive side, sometimes more, and roughly 5/8 inch on the idle side. Manufacturer and window conditions vary; these are not guaranteed dimensions.",
  energyBehavior: "Not the energy-efficiency direction in the Luxe range.",
  moistureConsiderations: "Depends on fabric selection, which Luxe confirms at the consultation.",
  accessConsiderations: "Motorization is a strong option on high or hard-to-reach windows.",
  motorizationConsiderations:
    "Motorize for a real access or operation reason. The drive side is also the wider gap side, which matters when darkening is a goal.",
  scaleConsiderations:
    "Suits large glass and multi-window banks. Extremely tall/narrow and very wide openings need product-size confirmation.",
  knownTradeoffs: ["inside-mount-vs-room-darkening", "minimal-stack-vs-fabric-design"],
  verificationTriggers: ["verify-dimensions"],
} as const;

/**
 * The roller family's shared room-darkening contraindication. Id-namespaced per
 * member so each direction's finding is traceable to the direction it came from.
 */
function rollerFamilyDarkening(prefix: string): Contraindication {
  return {
    id: `${prefix}-max-darkening`,
    effect: "deprioritize",
    when: {
      any: [
        { fact: "roomDarkening", is: ["maximum", "total-blackout-requested"] },
        { priority: "room-darkening", withinTop: 1 },
      ],
    },
    reason:
      "Not Luxe's preferred direction when maximum room darkening is the goal — the perimeter gaps at the sides remain, and an inside mount does not close them.",
  };
}

export const PRODUCT_DIRECTIONS: readonly ProductDirection[] = [
  // ── cellular ──────────────────────────────────────────────────────────────
  {
    id: "cellular",
    kind: "single",
    label: "Cellular shades",
    siteProductSlugs: ["cellular-shades"],
    siteCoverageNote: "One-to-one with the public Cellular Shades product page.",
    prioritiesServed: [
      "energy-efficiency",
      "room-darkening",
      "privacy",
      "budget",
      "aesthetics",
      "clear-glass-when-open",
      "lifestyle-requirement",
    ],
    strengths: [
      "Strong all-around option for energy efficiency, room darkening, clean contemporary styling and value.",
      "Air is trapped between the shade and the glass and within the honeycomb construction; double-cell and cell-in-cell designs add further insulating air pockets.",
      "Customer feedback to Luxe reports rooms feeling more temperature-stable.",
      "Well suited to bedrooms, nurseries, night workers, and early-sunrise sleep problems.",
      "Top-down/bottom-up gives lower-window privacy while keeping upper-window visibility.",
      "Available for specialty shapes.",
    ],
    weakFits: [
      "Preserving the outside view while the shade is deployed.",
      "Direct splash zones such as immediately over an active sink or tub.",
      "Large architectural glass, which may be better served by roller or commercial systems.",
    ],
    viewBehavior:
      "No outward view while deployed. Top-down/bottom-up recovers upper-window visibility without giving up lower-window privacy.",
    privacyBehavior:
      "Full privacy when down. Top-down/bottom-up separates lower-window privacy from upper-window visibility.",
    roomDarkeningBehavior:
      "Room-darkening cellular is among Luxe's preferred directions when a customer wants a very dark room. Perimeter light gaps still exist; light or white trim can make those gaps look brighter because reflected light creates a visible halo effect.",
    energyBehavior:
      "The strongest energy direction in the Luxe range, from trapped air between shade and glass and inside the honeycomb.",
    moistureConsiderations:
      "A fabric product. Poor choice in a direct splash zone.",
    accessConsiderations:
      "Motorization is especially useful on hard-to-reach and high windows, above tubs, for elderly clients, for accessibility situations and where furniture blocks access.",
    motorizationConsiderations:
      "Motorize for a real access or operation reason, not because it is a premium upgrade. Cordless spring systems that are almost never operated can lose performance over time; periodic operation is beneficial.",
    scaleConsiderations:
      "Handles specialty shapes well. Large architectural glass may suit a roller or commercial system better.",
    designCharacteristics: "Clean and contemporary; the shade reads as a plain field rather than a design feature.",
    knownTradeoffs: ["view-vs-privacy", "inside-mount-vs-room-darkening", "price-vs-automation"],
    verificationTriggers: ["verify-dimensions"],
    contraindications: [
      {
        id: "cellular-splash-zone",
        effect: "exclude",
        when: DIRECT_SPLASH,
        reason:
          "Fabric shades are a poor choice in a direct splash zone such as directly over an active sink or tub.",
      },
      {
        id: "cellular-view-while-deployed",
        effect: "deprioritize",
        when: VIEW_WHILE_DEPLOYED_IS_LEADING,
        reason:
          "Cellular is not ideal when seeing out while the shade is deployed is a leading priority. It insulates well, but that is not a reason to make it the primary daytime answer for a view window.",
      },
      {
        id: "cellular-large-architectural-glass",
        effect: "deprioritize",
        when: { has: "large-architectural-glass" },
        reason: "Large architectural glass may be better suited to roller or commercial systems.",
      },
    ],
  },

  // ── interior roller ───────────────────────────────────────────────────────
  {
    id: "interior-roller",
    kind: "single",
    label: "Interior roller shades",
    siteProductSlugs: ["roller-shades"],
    siteCoverageNote: "One-to-one with the public Roller Shades product page.",
    prioritiesServed: [
      "aesthetics",
      "clear-glass-when-open",
      "functionality",
      "budget",
      "privacy",
    ],
    strengths: [
      "Clean, minimal design that lets the treatment visually disappear.",
      "Works well on large glass and modern architecture.",
      "Leaves clear glass when raised.",
    ],
    weakFits: [
      "Preserving the outside view while the shade is deployed — an opaque fabric covers it. That is a solar shade.",
      "Maximum room darkening, particularly inside-mounted.",
      "Situations where the fabric is meant to contribute to the room's design.",
    ],
    ...ROLLER_FAMILY,
    viewBehavior:
      "Clear glass when raised — which is a different thing from seeing out while it is down. A normal opaque roller fabric covers the view when deployed.",
    designCharacteristics: "Minimal, architectural, intended to recede.",
    contraindications: [
      rollerFamilyDarkening("roller"),
      {
        id: "roller-view-while-deployed",
        effect: "deprioritize",
        when: VIEW_WHILE_DEPLOYED_IS_LEADING,
        reason:
          "A normal opaque roller fabric covers the view when it is down. When keeping the view while the shade is deployed is a leading priority, solar is the stronger direction. Still eligible: privacy, darkening, styling or cost can outweigh daytime view, and a roller still leaves clear glass when raised.",
      },
    ],
  },

  // ── banded shades ─────────────────────────────────────────────────────────
  // A roller variant. Everything inherited from ROLLER_FAMILY is a dimension on
  // which Luxe treats the two as the same product; everything overridden below
  // is a dimension on which it does not.
  {
    id: "banded-shades",
    kind: "single",
    variantOf: "interior-roller",
    label: "Banded shades",
    siteProductSlugs: ["banded-shades"],
    siteCoverageNote: "One-to-one with the public Banded Shades product page.",
    prioritiesServed: [
      "aesthetics",
      "clear-glass-when-open",
      "functionality",
      "budget",
      "privacy",
    ],
    strengths: [
      "Functionally very similar to a roller shade; the difference is how it looks.",
      "The horizontal banded appearance creates a clean, modern, contemporary look.",
      "Aligning the alternating bands gives a partial 'peek-a-boo' view to the outside.",
      "Leaves clear glass when raised.",
    ],
    weakFits: [
      "Preserving a broad, continuous outward view while deployed — that is a solar shade, not a banded shade.",
      "Maximum room darkening, particularly inside-mounted.",
      "Interiors where the horizontal banding fights the design direction.",
    ],
    ...ROLLER_FAMILY,
    viewBehavior:
      "Clear glass when raised. While deployed, aligning the bands gives a partial 'peek-a-boo' view — real, but not the broad continuous view-through of a solar shade. Do not present the two as equivalent for keeping a view.",
    designCharacteristics:
      "Horizontal banded appearance. Fabric and style options generally skew modern and contemporary.",
    contraindications: [
      rollerFamilyDarkening("banded"),
      {
        id: "banded-view-not-continuous",
        effect: "deprioritize",
        when: VIEW_WHILE_DEPLOYED_IS_LEADING,
        reason:
          "Aligning the bands gives a partial, peek-a-boo view — not the broad continuous view-through of a solar shade. When keeping the view while the shade is down is a leading priority, solar is the stronger direction. Still eligible: privacy, darkening, styling or cost can outweigh daytime view.",
      },
    ],
  },

  // ── interior solar ────────────────────────────────────────────────────────
  {
    id: "interior-solar",
    kind: "single",
    label: "Interior solar shades",
    siteProductSlugs: ["solar-shades"],
    siteCoverageNote: "One-to-one with the public Solar Shades product page.",
    prioritiesServed: [
      "view-preservation",
      "glare-control",
      "aesthetics",
      "budget",
      "functionality",
    ],
    strengths: [
      "Preserves an outward view while deployed, which no opaque product does.",
      "Reduces glare on screens and surfaces.",
      "Clean, minimal, well suited to large glass.",
      "A strong lower-cost alternative when a view matters but exterior shading is out of reach.",
    ],
    weakFits: [
      "Nighttime privacy.",
      "Maximum room darkening.",
      "Controlling severe solar heat as effectively as shading the glass from outside.",
    ],
    viewBehavior:
      "Openness governs outward visibility. Luxe generally starts around 3% openness west-facing and around 5% east-facing — a starting direction, not a fixed specification. 10% is generally too open: weaker privacy, weaker glare control, more solar penetration. 1% gives very limited true outward visibility. Dark fabrics generally preserve the view better; light fabrics reflect more energy and generally reduce outward visibility. Fabric quality matters — a good tightly woven 3% can read clearer than a poor 5%. On-axis view can stay clear while off-axis view becomes dramatically darker.",
    privacyBehavior:
      "Daytime privacy only, and partial. Privacy reverses at night once the interior is brighter than outside. Never represent a solar shade as guaranteed nighttime privacy.",
    roomDarkeningBehavior:
      "Not a room-darkening product. Openness is what makes the outward view possible, and the same openness transmits light.",
    energyBehavior:
      "Reduces glare and solar penetration, but the energy has already passed the glass. Shading from outside is the stronger heat strategy.",
    moistureConsiderations: "Depends on fabric selection, which Luxe confirms at the consultation.",
    accessConsiderations: "Motorization is a strong option on high or hard-to-reach windows.",
    motorizationConsiderations: "Motorize for a real access or operation reason.",
    scaleConsiderations: "Suits large glass and window banks.",
    designCharacteristics: "Minimal and architectural; the view, not the fabric, is the feature.",
    knownTradeoffs: [
      "heat-reflection-vs-outward-visibility",
      "solar-openness-vs-daytime-privacy",
      "view-vs-privacy",
    ],
    verificationTriggers: ["verify-dimensions"],
    contraindications: [
      {
        id: "solar-nighttime-privacy",
        effect: "deprioritize",
        when: { fact: "privacyNeed", is: ["nighttime", "both"] },
        reason:
          "Privacy reverses at night when the interior is brighter than outside. A solar shade alone does not answer a nighttime privacy requirement; pair it with an interior privacy layer.",
      },
      {
        id: "solar-room-darkening",
        effect: "deprioritize",
        when: { fact: "roomDarkening", is: ["maximum", "total-blackout-requested"] },
        reason:
          "The openness that preserves the outward view is the same openness that transmits light, so a solar fabric cannot also be the maximum-darkening answer.",
      },
    ],
  },

  // ── shutters ──────────────────────────────────────────────────────────────
  {
    id: "shutters",
    kind: "single",
    label: "Shutters",
    siteProductSlugs: ["shutters"],
    siteCoverageNote:
      "One-to-one with the public Shutters product page, which covers all materials. Material choice — real wood, composite/hybrid, poly, aluminium — is a decision within this direction, not a separate direction.",
    prioritiesServed: [
      "aesthetics",
      "privacy",
      "directional-light-control",
      "durability",
      "energy-efficiency",
      "moisture-resistance",
    ],
    strengths: [
      "Architectural appearance, and a traditional or structured design direction.",
      "Privacy with directional light control from the louvers.",
      "Durability and strong insulating performance.",
      "Specialty shapes.",
      "Divider rails give independent upper and lower louver control and can align with window mullions.",
      "Hidden tilt systems give a clean appearance.",
    ],
    weakFits: [
      "True blackout — small amounts of light remain through the louver and stile interfaces.",
      "Openings where a swinging panel has nowhere to go.",
    ],
    viewBehavior:
      "Louvers open for a view through the window. Larger louvers generally give better view-through but must stay proportionate to the window.",
    privacyBehavior: "Strong privacy with the louvers closed, and adjustable privacy through the day.",
    roomDarkeningBehavior:
      "Shutters are not true blackout products. Small amounts of light remain through the louver and stile interfaces.",
    energyBehavior: "Strong insulating performance.",
    moistureConsiderations:
      "Poly is a strong moisture-area application. Composite/hybrid has good moisture resistance and strong dimensional stability. Aluminium is a durable option for some exterior, wet and seasonal applications. Real wood should not take repeated direct water exposure and can still warp or twist despite proper drying.",
    accessConsiderations:
      "Panels swing like doors, so faucets, furniture, window handles, trim, light switches, tilt-in windows, wall space, sliders and room depth all have to be evaluated.",
    motorizationConsiderations:
      "Not a motorized product in the Luxe range; operation is manual at the louvers.",
    scaleConsiderations:
      "Real wood is generally lighter than composite and may allow wider panels. Bi-fold and bypass configurations solve some spatial problems and create others: bypass shutters on sliders can block substantial glass, and open-bypass systems can need substantial room depth.",
    designCharacteristics:
      "Architectural, structured, permanent-feeling. Composite in white can look very similar to painted wood; real wood carries authentic stain and natural grain variation.",
    knownTradeoffs: [
      "bypass-shutter-vs-glass-coverage",
      "louver-size-vs-window-proportion",
      "wood-appearance-vs-moisture-tolerance",
    ],
    verificationTriggers: ["verify-dimensions", "verify-shutter-clearance"],
    contraindications: [
      {
        id: "shutters-not-blackout",
        effect: "deprioritize",
        when: { fact: "roomDarkening", is: ["maximum", "total-blackout-requested"] },
        reason:
          "Shutters are not true blackout products — light remains at the louver and stile interfaces.",
      },
      {
        id: "shutters-swing-obstruction",
        effect: "deprioritize",
        when: {
          any: [
            { has: "obstruction-faucet" },
            { has: "obstruction-furniture" },
            { has: "obstruction-window-handle" },
            { has: "obstruction-trim-or-switch" },
          ],
        },
        reason:
          "Panels swing like doors. An obstruction at the opening has to be resolved before shutters are the answer.",
      },
      {
        id: "shutters-tilt-in-conflict",
        effect: "deprioritize",
        when: { has: "tilt-in-window" },
        reason:
          "A tilt-in sash and an inside-mounted shutter frame compete for the same space; clearance has to be evaluated at the opening.",
      },
      {
        id: "shutters-slider-glass-loss",
        effect: "deprioritize",
        when: { has: "sliding-door" },
        reason:
          "Bypass shutters on a slider can block substantial glass, and open-bypass systems can require substantial room depth.",
      },
      {
        id: "shutters-shallow-depth",
        effect: "deprioritize",
        when: { has: "shallow-room-depth" },
        reason: "Swinging or open-bypass panels need room depth that is not available here.",
      },
    ],
  },

  // ── real wood blinds ──────────────────────────────────────────────────────
  {
    id: "wood-blinds",
    kind: "single",
    label: "Real wood blinds",
    siteProductSlugs: ["blinds"],
    siteCoverageNote:
      "Shares the public Blinds product page with faux/composite blinds. The page covers wood, faux wood and composite together; the advisor separates them because the material decision changes the moisture and scale answers.",
    prioritiesServed: ["directional-light-control", "aesthetics", "budget", "functionality"],
    strengths: [
      "Useful directional light control from the louvers without raising the covering.",
      "Authentic stained appearance with natural grain and colour variation.",
      "Significantly lighter than many customers assume, and stronger lateral rigidity than flexible faux.",
      "2.5-inch slats create fewer horizontal lines and a smaller stack than 2-inch slats.",
    ],
    weakFits: [
      "Energy efficiency.",
      "Repeated direct moisture exposure.",
      "Windows the homeowner raises fully to expose clear glass.",
      "Very wide openings.",
    ],
    viewBehavior: "Louvers tilt for directional light; the window clears when the blind is raised.",
    privacyBehavior: "Adjustable through the day by tilting the louvers.",
    roomDarkeningBehavior: "Light passes between the slats and at the routing holes; not a darkening direction.",
    energyBehavior:
      "Not Luxe's preferred energy-efficiency solution. Cellular and shutters generally rank above Venetian blinds for energy.",
    moistureConsiderations: "Avoid real wood where there is repeated direct moisture exposure.",
    accessConsiderations: "Operation is at the tilt and lift; reach matters on high windows.",
    motorizationConsiderations: "Motorize only for a real access or operation reason.",
    scaleConsiderations:
      "Large widths create weight, bowing, warping, lift-system stress and a large stack.",
    designCharacteristics: "Natural stained wood with genuine grain variation.",
    knownTradeoffs: ["wood-appearance-vs-moisture-tolerance", "minimal-stack-vs-fabric-design"],
    verificationTriggers: ["verify-dimensions", "verify-lift-system-load"],
    contraindications: [
      {
        id: "wood-blinds-direct-moisture",
        effect: "exclude",
        when: DIRECT_SPLASH,
        reason: "Real wood should not take repeated direct moisture exposure.",
      },
      {
        id: "wood-blinds-energy-priority",
        effect: "deprioritize",
        when: { priority: "energy-efficiency", withinTop: 2 },
        reason:
          "Cellular and shutters generally rank above Venetian blinds when energy efficiency is a leading priority.",
      },
      {
        id: "wood-blinds-clear-glass-use",
        effect: "deprioritize",
        when: {
          any: [
            { fact: "windowUse", is: ["raised-to-clear-glass"] },
            { priority: "clear-glass-when-open", withinTop: 2 },
          ],
        },
        reason:
          "A homeowner who raises the covering fully to expose clear glass is generally better served by a shade than by a Venetian blind.",
      },
      {
        id: "wood-blinds-very-wide",
        effect: "deprioritize",
        when: { has: "very-wide" },
        reason:
          "Large widths bring weight, bowing, warping, lift-system stress and a large stack.",
      },
      {
        id: "wood-blinds-budget-not-a-factor",
        effect: "deprioritize",
        when: {
          all: [
            { fact: "budgetSensitivity", is: ["low"] },
            {
              not: {
                any: [
                  { priority: "directional-light-control" },
                  { fact: "windowUse", is: ["left-down-louvers-adjusted"] },
                ],
              },
            },
          ],
        },
        reason:
          "With budget not a constraint and no specific need for horizontal Venetian functionality, Luxe would generally favour other categories.",
      },
    ],
  },

  // ── faux / composite blinds ───────────────────────────────────────────────
  {
    id: "faux-composite-blinds",
    kind: "single",
    label: "Faux wood and composite blinds",
    siteProductSlugs: ["blinds"],
    siteCoverageNote:
      "Shares the public Blinds product page with real wood blinds. See the note on that direction.",
    prioritiesServed: [
      "directional-light-control",
      "budget",
      "moisture-resistance",
      "durability",
      "functionality",
    ],
    strengths: [
      "Useful directional light control from the louvers.",
      "Tolerates moisture better than real wood.",
      "Value direction within the blind category.",
      "2.5-inch slats create fewer horizontal lines and a smaller stack than 2-inch slats.",
    ],
    weakFits: [
      "Energy efficiency.",
      "Reproducing the appearance of real stained wood.",
      "Very wide openings, where flexible faux is weaker than composite or wood.",
      "Windows the homeowner raises fully to expose clear glass.",
    ],
    viewBehavior: "Louvers tilt for directional light; the window clears when the blind is raised.",
    privacyBehavior: "Adjustable through the day by tilting the louvers.",
    roomDarkeningBehavior: "Light passes between the slats and at the routing holes; not a darkening direction.",
    energyBehavior:
      "Not Luxe's preferred energy-efficiency solution. Cellular and shutters generally rank above Venetian blinds for energy.",
    moistureConsiderations: "Better moisture tolerance than real wood.",
    accessConsiderations: "Operation is at the tilt and lift; reach matters on high windows.",
    motorizationConsiderations: "Motorize only for a real access or operation reason.",
    scaleConsiderations:
      "Composite and wood generally have stronger lateral rigidity than flexible faux. Flexible faux products may need more ladder strings and can look busier. Large widths bring weight, bowing and lift-system stress.",
    designCharacteristics:
      "Wood-tone synthetic products usually do not reproduce the appearance of real stained wood as successfully as actual wood. White finishes read cleanly.",
    knownTradeoffs: ["wood-appearance-vs-moisture-tolerance"],
    verificationTriggers: ["verify-dimensions", "verify-lift-system-load"],
    contraindications: [
      {
        id: "faux-blinds-energy-priority",
        effect: "deprioritize",
        when: { priority: "energy-efficiency", withinTop: 2 },
        reason:
          "Cellular and shutters generally rank above Venetian blinds when energy efficiency is a leading priority.",
      },
      {
        id: "faux-blinds-clear-glass-use",
        effect: "deprioritize",
        when: {
          any: [
            { fact: "windowUse", is: ["raised-to-clear-glass"] },
            { priority: "clear-glass-when-open", withinTop: 2 },
          ],
        },
        reason:
          "A homeowner who raises the covering fully to expose clear glass is generally better served by a shade than by a Venetian blind.",
      },
      {
        id: "faux-blinds-very-wide",
        effect: "deprioritize",
        when: { has: "very-wide" },
        reason:
          "Flexible faux has weaker lateral rigidity than composite or wood, and large widths bring weight, bowing and lift-system stress.",
      },
      {
        id: "faux-blinds-budget-not-a-factor",
        effect: "deprioritize",
        when: {
          all: [
            { fact: "budgetSensitivity", is: ["low"] },
            {
              not: {
                any: [
                  { priority: "directional-light-control" },
                  { fact: "windowUse", is: ["left-down-louvers-adjusted"] },
                ],
              },
            },
          ],
        },
        reason:
          "With budget not a constraint and no specific need for horizontal Venetian functionality, Luxe would generally favour other categories.",
      },
    ],
  },

  // ── Roman shades ──────────────────────────────────────────────────────────
  {
    id: "roman-shades",
    kind: "single",
    label: "Roman shades",
    siteProductSlugs: ["roman-shades"],
    siteCoverageNote: "One-to-one with the public Roman Shades product page.",
    prioritiesServed: [
      "aesthetics",
      "privacy",
      "room-darkening",
      "clear-glass-when-open",
      "lifestyle-requirement",
    ],
    strengths: [
      "The right direction when the fabric should contribute to the room — pattern, softness and design individuality.",
      "Flat styles suit modern interiors; hobbled, soft-fold and tailored styles read more traditional or formal.",
      "Lining can add privacy, room-darkening performance, structure, UV protection for the face fabric, longevity and potentially better thermal performance.",
    ],
    weakFits: [
      "Direct splash areas and wet environments.",
      "Dirty-hand and heavy-abuse locations.",
      "Situations where the treatment should look minimal or disappear — that is a roller.",
    ],
    viewBehavior: "Clear glass when raised, subject to the top stack.",
    privacyBehavior: "Full privacy when down; lining strengthens it.",
    roomDarkeningBehavior: "A room-darkening lining is available. Not a blackout product.",
    energyBehavior: "Lining can potentially improve thermal performance.",
    moistureConsiderations:
      "Not suitable in direct splash areas or wet environments. Humidity can cause fabric movement.",
    accessConsiderations: "Operation is at the lift; reach matters on high windows.",
    motorizationConsiderations: "Motorize only for a real access or operation reason.",
    scaleConsiderations:
      "Fabric width limitations, seams, pattern-repeat interruption and a large top stack all become live issues as the opening grows.",
    designCharacteristics:
      "Fabric-forward. Styles include flat, hobbled/soft fold, tailored and relaxed. Some sheers and light fabrics have weak structure.",
    knownTradeoffs: ["minimal-stack-vs-fabric-design", "view-vs-privacy"],
    verificationTriggers: ["verify-dimensions", "verify-fabric-width-and-pattern-repeat"],
    contraindications: [
      {
        id: "roman-splash-zone",
        effect: "exclude",
        when: DIRECT_SPLASH,
        reason: "Roman shades are not suitable in a direct splash area.",
      },
      {
        id: "roman-wet-environment",
        effect: "deprioritize",
        when: { fact: "moistureExposure", is: ["humid"] },
        reason:
          "Roman shades are not ideal in wet environments, and humidity can cause fabric movement.",
      },
      {
        id: "roman-very-wide",
        effect: "deprioritize",
        when: { has: "very-wide" },
        reason:
          "Fabric width limitations, seams and pattern-repeat interruption become significant on a very wide opening, along with a large top stack.",
      },
      {
        id: "roman-minimal-design-goal",
        effect: "deprioritize",
        when: { has: "modern-minimal" },
        reason:
          "When the homeowner wants the treatment to appear minimal or disappear, a roller is the better direction; choose a Roman when the fabric materially contributes to the design.",
      },
    ],
  },

  // ── drapery ───────────────────────────────────────────────────────────────
  {
    id: "drapery",
    kind: "single",
    label: "Full functional drapery",
    siteProductSlugs: [],
    siteCoverageNote:
      "DECLARED GAP — the public site has no drapery product page today, although the approved brief contains substantial drapery knowledge and names drapery as a real Luxe offering. Recorded here so the cross-check reports an intentional gap rather than silent drift.",
    prioritiesServed: ["aesthetics", "lifestyle-requirement", "privacy", "room-darkening"],
    strengths: [
      "Softness, architectural scale, layered design, warmth, formality and luxury.",
      "Functional drapery can make sense on extremely wide openings.",
      "Mounting high where the architecture permits creates strong vertical lines and moves most fabric off the glass when open.",
    ],
    weakFits: [
      "Openings without adequate stack-back — weaker there, but not ruled out.",
      "Direct water exposure, heat-source conflicts and vent conflicts.",
      "Architecture that strongly conflicts with horizontal treatment lines.",
      "Budget-sensitive projects, where pattern repeat and seam matching drive fabric cost up.",
    ],
    viewBehavior: "Clears the glass when open, provided stack-back is adequate.",
    privacyBehavior: "Full privacy when drawn; lining is usually recommended except for intentional sheers.",
    roomDarkeningBehavior: "Lining is usually recommended and contributes to darkening. Not a blackout product.",
    energyBehavior: "Lining adds a layer; the brief makes no specific energy claim for drapery.",
    moistureConsiderations: "Avoid where direct water exposure exists.",
    accessConsiderations:
      "Traverse operation at the opening; heat sources and vents behind the fabric are a conflict to check.",
    motorizationConsiderations: "The brief makes no drapery-specific motorization claim.",
    scaleConsiderations:
      "Stack-back is critical. Without adequate stack-back, full drapery covers substantial glass, reduces natural light, visually shrinks the window and can make a smaller room feel more confined.",
    designCharacteristics:
      "Soft, formal, high-scale. 'Luxury' does not automatically mean drapery.",
    knownTradeoffs: ["drapery-fabric-vs-glass-coverage", "minimal-stack-vs-fabric-design"],
    verificationTriggers: ["verify-dimensions", "verify-stack-back", "verify-fabric-width-and-pattern-repeat"],
    contraindications: [
      {
        id: "drapery-inadequate-stack-back",
        effect: "deprioritize",
        when: { has: "inadequate-stack-back" },
        reason:
          "Limited stack-back does not make functional drapery impossible, it makes it a weaker solution — the fabric covers substantial glass, reduces natural light, visually shrinks the opening and can make the room feel smaller. Consider a functional shade with stationary decorative side panels before recommending full drapery here.",
      },
      {
        id: "drapery-direct-water",
        effect: "exclude",
        when: DIRECT_SPLASH,
        reason: "Avoid drapery where direct water exposure exists.",
      },
      {
        id: "drapery-budget-sensitivity",
        effect: "deprioritize",
        when: { fact: "budgetSensitivity", is: ["high"] },
        reason:
          "Pattern repeat and seam matching significantly increase fabric requirements and cost; a functional shade with stationary side panels delivers the drapery look for less fabric.",
      },
    ],
  },

  // ── exterior solar ────────────────────────────────────────────────────────
  {
    id: "exterior-solar",
    kind: "single",
    label: "Exterior solar shades",
    siteProductSlugs: ["exterior-solar-shades"],
    siteCoverageNote: "One-to-one with the public Exterior Solar Shades product page.",
    prioritiesServed: [
      "view-preservation",
      "glare-control",
      "energy-efficiency",
      "functionality",
      "motorization",
    ],
    strengths: [
      "Especially strong when severe solar heat reduction and preserving a valuable view both matter.",
      "Stops solar energy before it reaches the glass.",
      "Luxe experience suggests exterior shading creates a very substantial comfort difference compared with interior-only shading.",
      "Layers well with an interior treatment: exterior handles heat, glare and daytime view; interior handles nighttime privacy and decoration.",
    ],
    weakFits: [
      "Openings where the shade would obstruct entry and exit, such as a frequently used patio door.",
      "Locations with no hardwired power, for anything beyond a smaller manual-crank shade.",
    ],
    viewBehavior:
      "Openness governs outward visibility, with roughly 3% a common Luxe starting direction west-facing and roughly 5% possibly appropriate east-facing. Dark fabrics preserve the view better and generally give stronger glare reduction while absorbing more energy; light fabrics reflect more and weaken the outward view.",
    privacyBehavior:
      "Daytime only, and partial. An interior privacy treatment is the answer for nighttime.",
    roomDarkeningBehavior: "Not a room-darkening product.",
    energyBehavior:
      "The strongest heat strategy in the Luxe range, because the energy is intercepted before it reaches the glass. Never state a guaranteed temperature reduction.",
    moistureConsiderations:
      "Water and rain alone are generally not the main concern. Wind and ice loading matter more. Keep tracks and channels clear of dirt, insects and debris, avoid oily lubricants that can contaminate fabric, and avoid operating with problematic ice accumulation.",
    accessConsiderations:
      "Over a sliding or patio door the shade can obstruct entry and exit, which has to be considered before the application is recommended.",
    motorizationConsiderations:
      "For meaningful exterior sizes motorization is generally the preferred Luxe direction. Luxe does not use rechargeable battery systems on exterior shades; these systems generally require hardwired power. Manual crank may be reasonable on smaller shades. Manual override is valuable in case power fails while the shade needs retracting.",
    scaleConsiderations:
      "Large exterior shades introduce tube deflection, fabric waves, structural loads and engineering considerations. Never promise a maximum size without manufacturer-specific verification.",
    designCharacteristics:
      "A secured exterior system — cable guides, track systems or zipper track. Luxe does not sell unsecured or free-hanging exterior shades.",
    knownTradeoffs: [
      "heat-reflection-vs-outward-visibility",
      "exterior-shade-vs-door-access",
      "price-vs-automation",
    ],
    verificationTriggers: [
      "verify-dimensions",
      "verify-exterior-mounting",
      "verify-wind-exposure",
      "verify-power",
      "verify-door-access",
      "verify-product-size-limits",
    ],
    contraindications: [
      {
        id: "exterior-solar-patio-door-access",
        effect: "deprioritize",
        when: { has: "patio-door-frequent-use" },
        reason:
          "An exterior shade over a frequently used patio door can obstruct entry and exit. The access conflict has to be resolved before this application is recommended.",
      },
    ],
  },

  // ── layered: exterior solar + interior privacy ────────────────────────────
  {
    id: "exterior-solar-plus-interior-privacy",
    kind: "layered",
    label: "Exterior solar shade with an interior privacy treatment",
    components: ["exterior-solar", "cellular"],
    siteProductSlugs: [],
    siteCoverageNote:
      "A layered direction, not a product page. Its components map to the Exterior Solar Shades page and whichever interior treatment is selected.",
    prioritiesServed: [
      "view-preservation",
      "glare-control",
      "energy-efficiency",
      "privacy",
      "aesthetics",
    ],
    strengths: [
      "Often an excellent combination: exterior handles heat reduction, glare and daytime view preservation; interior handles nighttime privacy, decoration and additional comfort.",
      "Answers a view-plus-heat-plus-nighttime-privacy brief that no single product answers.",
    ],
    weakFits: ["Projects where a single treatment is a hard requirement."],
    viewBehavior: "Daytime view preserved through the exterior solar fabric; interior layer raised during the day.",
    privacyBehavior: "The interior layer supplies the nighttime privacy the exterior shade cannot.",
    roomDarkeningBehavior: "Governed by the interior layer chosen.",
    energyBehavior: "The exterior layer intercepts solar energy before the glass; the interior layer adds comfort.",
    moistureConsiderations: "Governed by each layer's own considerations.",
    accessConsiderations: "Both layers' access considerations apply, including door obstruction for the exterior shade.",
    motorizationConsiderations:
      "Exterior motorization is generally preferred at meaningful sizes and requires hardwired power.",
    scaleConsiderations: "Both layers' scale considerations apply.",
    designCharacteristics: "The interior layer carries the room's design; the exterior layer is a performance system.",
    knownTradeoffs: ["view-vs-privacy", "price-vs-automation", "exterior-shade-vs-door-access"],
    verificationTriggers: [
      "verify-dimensions",
      "verify-exterior-mounting",
      "verify-wind-exposure",
      "verify-power",
      "verify-door-access",
    ],
    contraindications: [],
  },

  // ── layered: functional shade + stationary panels ─────────────────────────
  {
    id: "functional-shade-plus-stationary-panels",
    kind: "layered",
    label: "Functional shade with decorative stationary side panels",
    components: ["cellular", "drapery"],
    siteProductSlugs: [],
    siteCoverageNote:
      "A layered direction, not a product page. The functional shade component maps to whichever shade is selected; the stationary panels have no product page, matching the drapery gap.",
    prioritiesServed: ["aesthetics", "budget", "privacy", "room-darkening", "functionality"],
    strengths: [
      "A core Luxe recommendation. Delivers the drapery look, softness, visual height and visual width with significantly less fabric.",
      "Potentially fewer seams, less pattern-repeat waste and lower custom fabric cost.",
      "Privacy and light control are handled by the shade, so the fabric does not have to work.",
      "Better overall value than full functional drapery in most cases.",
    ],
    weakFits: ["Projects that genuinely need the fabric itself to traverse the full opening."],
    viewBehavior: "Governed by the functional shade; the panels stay off the glass.",
    privacyBehavior: "Handled by the shade.",
    roomDarkeningBehavior: "Handled by the shade.",
    energyBehavior: "Governed by the shade chosen.",
    moistureConsiderations: "Fabric panels should still be kept out of direct water exposure.",
    accessConsiderations: "Panels are stationary, so nothing traverses across the opening in daily use.",
    motorizationConsiderations: "Applies to the shade component only.",
    scaleConsiderations:
      "Because the panels are stationary, stack-back pressure is far lower than full functional drapery.",
    designCharacteristics:
      "Reads as drapery — softness, vertical line, visual width — with the working part hidden in the shade.",
    knownTradeoffs: ["drapery-fabric-vs-glass-coverage", "minimal-stack-vs-fabric-design"],
    verificationTriggers: ["verify-dimensions", "verify-fabric-width-and-pattern-repeat"],
    contraindications: [
      {
        id: "stationary-panels-direct-water",
        effect: "exclude",
        when: DIRECT_SPLASH,
        reason: "Fabric panels should not be placed where direct water exposure exists.",
      },
    ],
  },
];

/**
 * Options that cut across directions. Motorization is a real Luxe product page
 * and a real decision, but it is not a window covering, so modelling it as a
 * tenth "direction" would make it compete with products it is meant to
 * accompany.
 */
export const CROSS_CUTTING_OPTIONS: readonly CrossCuttingOption[] = [
  {
    id: "motorization",
    label: "Motorization",
    siteProductSlugs: ["motorization"],
    siteCoverageNote: "One-to-one with the public Motorization product page.",
    indicatedWhen: {
      any: [
        { has: "hard-to-reach" },
        { has: "high-window" },
        { has: "above-tub" },
        { has: "furniture-blocked" },
        { has: "mobility-or-age-limited" },
        { priority: "accessibility" },
        { priority: "child-safety" },
        { fact: "motorizationInterest", is: ["requested"] },
      ],
    },
    cautions: [
      "Do not recommend motorization simply because it is a premium upgrade — there has to be a real access or operation reason.",
      "For meaningful exterior sizes motorization is generally the preferred Luxe direction, and those systems generally require hardwired power. Luxe does not use rechargeable battery systems on exterior shades.",
      "Manual override is valuable in case power fails while an exterior shade needs retracting.",
      "Motorized operation removes the accessible operating cord, which is why it is a child-safety direction as well as a convenience one. Never claim every product or size can be motorized — Luxe confirms that for the selected product.",
    ],
  },
  {
    id: "cordless-operation",
    label: "Cordless operating system",
    siteProductSlugs: [],
    siteCoverageNote:
      "An operating system rather than a product, so it has no product page of its own. It applies across directions and is selected per product at the consultation.",
    indicatedWhen: {
      any: [
        { priority: "child-safety" },
        { fact: "room", is: ["nursery"] },
      ],
    },
    cautions: [
      "Never claim every product, size or application is available cordless. Luxe confirms availability for the selected product.",
      "A large or heavy covering, or an unusual size, can limit cordless options — that is something Luxe verifies at the opening.",
      "Cordless spring systems that are almost never operated can lose performance over time; periodic operation is beneficial.",
    ],
  },
  {
    id: "corded-operation",
    label: "Corded or chain operating system",
    siteProductSlugs: [],
    siteCoverageNote:
      "An operating system rather than a product, so it has no product page of its own.",
    indicatedWhen: { requestedFeature: "corded-operation" },
    deprioritizedWhen: {
      any: [{ priority: "child-safety" }, { fact: "room", is: ["nursery"] }],
    },
    cautions: [
      "Where child safety matters, favour an operating system that eliminates the accessible cord or chain.",
    ],
  },
];

/**
 * Site product categories the approved brief supplies no knowledge for.
 * Declared, not ignored: the cross-check treats an undeclared site product as
 * drift, so this list is the only way a category can legitimately go
 * unrepresented, and adding to it is a visible decision in review.
 */
export const UNREPRESENTED_SITE_PRODUCTS: readonly UnrepresentedSiteProduct[] = [
  // Empty as of Phase A.1. `banded-shades` was the only entry; Luxe supplied
  // the knowledge, so it is now a represented direction above rather than a
  // declared gap. Every product category on the public site is reasoned about.
];
