/**
 * Contextual article-to-commercial pathways.
 *
 * These sit on already-ranking articles and point at existing product and
 * area pages. Slugs are the live markdown filenames. Nothing here invents a
 * new URL.
 *
 * Costco article: the original slug
 * `are-costco-window-treatments-worth-it-a-local-dealer-tells-you-the-truth`
 * is not in `content/blog`. Production permanently redirects that URL to the
 * surviving first-time buyer's cost guide. The pathway is attached to that
 * surviving article so the clicks still reach a commercial page.
 *
 * SmartDrape destination: `/products/motorization`. The offering registry in
 * `lib/offerings.ts` has no SmartDrape, patio-door, or vertical-sheer page.
 * Custom drapery now has `/products/custom-drapery`. SmartDrape stays on
 * motorization — that page's copy already covers motorized shades, blinds,
 * and drapery, and SmartDrape is a patio-door shade, not this drapery page.
 */

export interface ArticlePathway {
  heading: string;
  body: string;
  productHref: "/products/blinds" | "/products/motorization" | "/products/roller-shades" | "/products/custom-drapery";
  productLabel: string;
  bookHref: "/book";
  bookLabel: string;
  areaHref?: "/areas/coeur-d-alene" | "/areas/post-falls";
  areaLabel?: string;
  placement: "after-content" | "bottom-only";
}

export const ARTICLE_PATHWAYS: Record<string, ArticlePathway> = {
  "faux-wood-vs-composite-blinds-which-holds-up-better-in-northern-idaho": {
    heading: "Not sure which blinds will hold up on your windows?",
    body: "Mark brings faux wood and composite samples to your home, checks the sun and moisture on each window, and explains what will actually last. The consultation is free.",
    productHref: "/products/blinds",
    productLabel: "See custom blinds",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    areaHref: "/areas/coeur-d-alene",
    areaLabel: "Custom window treatments in Coeur d'Alene",
    placement: "after-content",
  },
  "why-motorized-shades-fail-in-northern-idaho-and-how-to-fix-them": {
    heading: "Want a motorized system that actually responds?",
    body: "Mark looks at the windows, the layout, and how you want the shades to run before anyone orders a motor. He explains what will work in your house. The consultation is free.",
    productHref: "/products/motorization",
    productLabel: "See motorization",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    areaHref: "/areas/post-falls",
    areaLabel: "Custom window treatments in Post Falls",
    placement: "after-content",
  },
  "why-big-roller-shades-pucker-and-what-actually-solves-it": {
    heading: "Planning wide roller shades for a North Idaho window?",
    body: "Mark measures the opening and tells you honestly whether a single shade will stay flat or whether a split system is the better call. The consultation is free.",
    productHref: "/products/roller-shades",
    productLabel: "See custom roller shades",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    areaHref: "/areas/coeur-d-alene",
    areaLabel: "Custom window treatments in Coeur d'Alene",
    placement: "after-content",
  },
  "why-are-window-treatments-so-expensive-a-first-time-buyers-guide-to-smart-stylish-and-budget-friendly-choices": {
    heading: "Comparing big-box blinds with a custom fit?",
    body: "Mark brings samples to your home, looks at the windows, and explains what will actually hold up — without a showroom visit or a sales script. The consultation is free.",
    productHref: "/products/blinds",
    productLabel: "See custom blinds",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    areaHref: "/areas/post-falls",
    areaLabel: "Custom blinds in Post Falls",
    placement: "after-content",
  },
  "smartdrape-patio-door-shades-in-coeur-dalene-post-falls": {
    heading: "Looking at patio-door shades you can walk through?",
    body: "Mark looks at the door, the stack, and whether motorization is worth it in that room. He brings samples and explains what will actually work. The consultation is free.",
    productHref: "/products/motorization",
    productLabel: "See motorization and patio-door options",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    areaHref: "/areas/coeur-d-alene",
    areaLabel: "Custom window treatments in Coeur d'Alene",
    placement: "after-content",
  },
  "how-drapes-make-ceilings-taller-in-coeur-dalene-homes": {
    heading: "Planning custom drapes for a North Idaho home?",
    body: "Mark brings materials to your windows, looks at the light in the room, and measures the openings. The consultation is free, and requesting one is not a booked appointment.",
    productHref: "/products/custom-drapery",
    productLabel: "See custom drapes and drapery",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    areaHref: "/areas/coeur-d-alene",
    areaLabel: "Custom window treatments in Coeur d'Alene",
    placement: "after-content",
  },
  "how-to-restring-blinds-like-a-pro-step-by-step-guide": {
    heading: "When replacement makes more sense",
    body: "Restringing can save a good set of blinds. If the slats are warped, the lift is failing, or the material was wrong for the room, Mark can look at the windows and tell you honestly whether repair or replacement is the better spend. The consultation is free.",
    productHref: "/products/blinds",
    productLabel: "See custom blinds",
    bookHref: "/book",
    bookLabel: "Request a free in-home consultation",
    placement: "bottom-only",
  },
};

export const PRODUCT_DECISION_ARTICLES: Record<
  string,
  readonly { title: string; slug: string }[]
> = {
  blinds: [
    {
      title: "Faux Wood vs. Composite Blinds: Which Holds Up Better in Northern Idaho?",
      slug: "faux-wood-vs-composite-blinds-which-holds-up-better-in-northern-idaho",
    },
    {
      title: "Why Are Window Treatments So Expensive?",
      slug: "why-are-window-treatments-so-expensive-a-first-time-buyers-guide-to-smart-stylish-and-budget-friendly-choices",
    },
  ],
  motorization: [
    {
      title: "Why Your Motorized Shades Don't Respond Half the Time",
      slug: "why-motorized-shades-fail-in-northern-idaho-and-how-to-fix-them",
    },
    {
      title: "SmartDrape Patio-Door Shades in Coeur d'Alene and Post Falls",
      slug: "smartdrape-patio-door-shades-in-coeur-dalene-post-falls",
    },
  ],
  "roller-shades": [
    {
      title: "Why Big Roller Shades Pucker — and What Actually Solves It",
      slug: "why-big-roller-shades-pucker-and-what-actually-solves-it",
    },
  ],
  shutters: [
    {
      title: "The Hidden Value of Plantation Shutters in Northern Idaho Homes",
      slug: "the-hidden-value-of-plantation-shutters-in-northern-idaho-homes",
    },
  ],
  "cellular-shades": [
    {
      title: "Why Your Craftsman Home Feels Cold — and How Cellular Shades Fix It",
      slug: "why-craftsman-homes-feel-cold-in-coeur-dalene-fixed",
    },
    {
      title: "Cellular Shades for Energy Savings in Coeur d'Alene and Post Falls",
      slug: "cellular-shades-for-energy-savings-in-coeur-dalene-post-falls",
    },
  ],
  "custom-drapery": [
    {
      title: "How CDA Homeowners Use Drapes to Get Taller Ceilings, Wider Rooms, and Lower Energy Bills",
      slug: "how-drapes-make-ceilings-taller-in-coeur-dalene-homes",
    },
  ],
};
