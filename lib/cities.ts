/**
 * Canonical geography for Luxe's service-area cities and regions.
 *
 * ONE REAL-WORLD PLACE, ONE @id. Each of the nineteen cities Luxe serves is a
 * single entity defined once — on its own `/areas/{slug}` page — and referenced
 * by `@id` everywhere else, with both Wikipedia and Wikidata `sameAs` URIs and
 * full county → state containment.
 */
import { BUSINESS } from "@/lib/constants";

const STATE_SAME_AS: Record<string, readonly string[]> = {
  Idaho: [
    "https://en.wikipedia.org/wiki/Idaho",
    "https://www.wikidata.org/wiki/Q1221",
  ],
  Washington: [
    "https://en.wikipedia.org/wiki/Washington_(state)",
    "https://www.wikidata.org/wiki/Q1223",
  ],
  Utah: [
    "https://en.wikipedia.org/wiki/Utah",
    "https://www.wikidata.org/wiki/Q829",
  ],
};

const KOOTENAI_COUNTY = {
  name: "Kootenai County",
  sameAs: [
    "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
    "https://www.wikidata.org/wiki/Q494613",
  ],
} as const;

const BONNER_COUNTY = {
  name: "Bonner County",
  sameAs: [
    "https://en.wikipedia.org/wiki/Bonner_County,_Idaho",
    "https://www.wikidata.org/wiki/Q485549",
  ],
} as const;

const KING_COUNTY = {
  name: "King County",
  sameAs: [
    "https://en.wikipedia.org/wiki/King_County,_Washington",
    "https://www.wikidata.org/wiki/Q108861",
  ],
} as const;

const SALT_LAKE_COUNTY = {
  name: "Salt Lake County",
  sameAs: [
    "https://en.wikipedia.org/wiki/Salt_Lake_County,_Utah",
    "https://www.wikidata.org/wiki/Q484599",
  ],
} as const;

const SUMMIT_COUNTY = {
  name: "Summit County",
  sameAs: [
    "https://en.wikipedia.org/wiki/Summit_County,_Utah",
    "https://www.wikidata.org/wiki/Q484647",
  ],
} as const;

const WASATCH_COUNTY = {
  name: "Wasatch County",
  sameAs: [
    "https://en.wikipedia.org/wiki/Wasatch_County,_Utah",
    "https://www.wikidata.org/wiki/Q26646",
  ],
} as const;

interface CityEntry {
  /** Matches the `/areas/{slug}` route, which is what makes the @id derivable. */
  readonly slug: string;
  readonly sameAs: readonly string[];
  readonly state: string;
  /** The county the city actually sits in. Not every city shares one. */
  readonly county: { readonly name: string; readonly sameAs: readonly string[] };
}

export const CITIES: Record<string, CityEntry> = {
  "Coeur d'Alene": {
    slug: "coeur-d-alene",
    sameAs: [
      "https://en.wikipedia.org/wiki/Coeur_d%27Alene,_Idaho",
      "https://www.wikidata.org/wiki/Q982827",
    ],
    state: "Idaho",
    county: KOOTENAI_COUNTY,
  },
  "Post Falls": {
    slug: "post-falls",
    sameAs: [
      "https://en.wikipedia.org/wiki/Post_Falls,_Idaho",
      "https://www.wikidata.org/wiki/Q1016696",
    ],
    state: "Idaho",
    county: KOOTENAI_COUNTY,
  },
  Hayden: {
    slug: "hayden",
    sameAs: [
      "https://en.wikipedia.org/wiki/Hayden,_Idaho",
      "https://www.wikidata.org/wiki/Q2337571",
    ],
    state: "Idaho",
    county: KOOTENAI_COUNTY,
  },
  Rathdrum: {
    slug: "rathdrum",
    sameAs: [
      "https://en.wikipedia.org/wiki/Rathdrum,_Idaho",
      "https://www.wikidata.org/wiki/Q2149207",
    ],
    state: "Idaho",
    county: KOOTENAI_COUNTY,
  },
  Sandpoint: {
    slug: "sandpoint",
    sameAs: [
      "https://en.wikipedia.org/wiki/Sandpoint,_Idaho",
      "https://www.wikidata.org/wiki/Q986038",
    ],
    state: "Idaho",
    county: BONNER_COUNTY,
  },
  Bellevue: {
    slug: "bellevue",
    sameAs: [
      "https://en.wikipedia.org/wiki/Bellevue,_Washington",
      "https://www.wikidata.org/wiki/Q199023",
    ],
    state: "Washington",
    county: KING_COUNTY,
  },
  Kirkland: {
    slug: "kirkland",
    sameAs: [
      "https://en.wikipedia.org/wiki/Kirkland,_Washington",
      "https://www.wikidata.org/wiki/Q369514",
    ],
    state: "Washington",
    county: KING_COUNTY,
  },
  Sammamish: {
    slug: "sammamish",
    sameAs: [
      "https://en.wikipedia.org/wiki/Sammamish,_Washington",
      "https://www.wikidata.org/wiki/Q209331",
    ],
    state: "Washington",
    county: KING_COUNTY,
  },
  Issaquah: {
    slug: "issaquah",
    sameAs: [
      "https://en.wikipedia.org/wiki/Issaquah,_Washington",
      "https://www.wikidata.org/wiki/Q272462",
    ],
    state: "Washington",
    county: KING_COUNTY,
  },
  Renton: {
    slug: "renton",
    sameAs: [
      "https://en.wikipedia.org/wiki/Renton,_Washington",
      "https://www.wikidata.org/wiki/Q272476",
    ],
    state: "Washington",
    county: KING_COUNTY,
  },
  "Maple Valley": {
    slug: "maple-valley",
    sameAs: [
      "https://en.wikipedia.org/wiki/Maple_Valley,_Washington",
      "https://www.wikidata.org/wiki/Q1423180",
    ],
    state: "Washington",
    county: KING_COUNTY,
  },
  "Salt Lake City": {
    slug: "salt-lake-city",
    sameAs: [
      "https://en.wikipedia.org/wiki/Salt_Lake_City",
      "https://www.wikidata.org/wiki/Q23337",
    ],
    state: "Utah",
    county: SALT_LAKE_COUNTY,
  },
  Millcreek: {
    slug: "millcreek",
    sameAs: [
      "https://en.wikipedia.org/wiki/Millcreek,_Utah",
      "https://www.wikidata.org/wiki/Q6858632",
    ],
    state: "Utah",
    county: SALT_LAKE_COUNTY,
  },
  Holladay: {
    slug: "holladay",
    sameAs: [
      "https://en.wikipedia.org/wiki/Holladay,_Utah",
      "https://www.wikidata.org/wiki/Q483079",
    ],
    state: "Utah",
    county: SALT_LAKE_COUNTY,
  },
  Draper: {
    slug: "draper",
    sameAs: [
      "https://en.wikipedia.org/wiki/Draper,_Utah",
      "https://www.wikidata.org/wiki/Q483051",
    ],
    state: "Utah",
    county: SALT_LAKE_COUNTY,
  },
  "South Jordan": {
    slug: "south-jordan",
    sameAs: [
      "https://en.wikipedia.org/wiki/South_Jordan,_Utah",
      "https://www.wikidata.org/wiki/Q483037",
    ],
    state: "Utah",
    county: SALT_LAKE_COUNTY,
  },
  "Park City": {
    slug: "park-city",
    sameAs: [
      "https://en.wikipedia.org/wiki/Park_City,_Utah",
      "https://www.wikidata.org/wiki/Q482993",
    ],
    state: "Utah",
    county: SUMMIT_COUNTY,
  },
  "Heber City": {
    slug: "heber-city",
    sameAs: [
      "https://en.wikipedia.org/wiki/Heber_City,_Utah",
      "https://www.wikidata.org/wiki/Q130002",
    ],
    state: "Utah",
    county: WASATCH_COUNTY,
  },
  Midway: {
    slug: "midway",
    sameAs: [
      "https://en.wikipedia.org/wiki/Midway,_Utah",
      "https://www.wikidata.org/wiki/Q130040",
    ],
    state: "Utah",
    county: WASATCH_COUNTY,
  },
};

/** The canonical `@id` for a service-area city, or null if it is not one. */
export function cityPlaceId(name: string): string | null {
  const entry = CITIES[name];
  return entry ? `${BUSINESS.url}/areas/${entry.slug}#place` : null;
}

/**
 * The FULL canonical definition. Emitted exactly once per city, on that city's
 * own `/areas/{slug}` page.
 */
export function cityPlaceNode(name: string) {
  const entry = CITIES[name];
  if (!entry) return null;
  const containedInPlace =
    entry.county.name === "Kootenai County"
      ? kootenaiCountyRef()
      : {
          "@type": "AdministrativeArea",
          name: entry.county.name,
          sameAs: entry.county.sameAs,
          containedInPlace: {
            "@type": "State",
            name: entry.state,
            sameAs: STATE_SAME_AS[entry.state],
          },
        };
  return {
    "@type": "City",
    "@id": `${BUSINESS.url}/areas/${entry.slug}#place`,
    name,
    sameAs: entry.sameAs,
    url: `${BUSINESS.url}/areas/${entry.slug}`,
    containedInPlace,
  };
}

/**
 * A REFERENCE ONLY — `{ "@id": ... }` and nothing else.
 */
export function cityRef(name: string) {
  const id = cityPlaceId(name);
  return id ? { "@id": id } : { "@type": "City", name };
}

export const NORTH_IDAHO_ID = `${BUSINESS.url}/areas#north-idaho`;

/**
 * The FULL canonical definition for North Idaho. Emitted once, on `/areas`.
 */
export function northIdahoNode() {
  return {
    "@type": "AdministrativeArea",
    "@id": `${BUSINESS.url}/areas#north-idaho`,
    name: "North Idaho",
    alternateName: "Northern Idaho",
    sameAs: [
      "https://en.wikipedia.org/wiki/Idaho_Panhandle",
      "https://www.wikidata.org/wiki/Q1656586",
    ],
  };
}

/** A REFERENCE ONLY — `{ "@id": ... }` and nothing else. */
export function northIdahoRef() {
  return { "@id": `${BUSINESS.url}/areas#north-idaho` };
}

export const KOOTENAI_COUNTY_ID = `${BUSINESS.url}/areas#kootenai-county`;

/**
 * The FULL canonical definition for Kootenai County. Emitted once, on `/areas`.
 */
export function kootenaiCountyNode() {
  return {
    "@type": "AdministrativeArea",
    "@id": `${BUSINESS.url}/areas#kootenai-county`,
    name: "Kootenai County",
    url: "https://www.kcgov.us",
    sameAs: [
      "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
      "https://www.wikidata.org/wiki/Q494613",
      "https://www.kcgov.us",
    ],
    containedInPlace: {
      "@type": "State",
      name: "Idaho",
      sameAs: STATE_SAME_AS.Idaho,
    },
  };
}

/** A REFERENCE ONLY — `{ "@id": ... }` and nothing else. */
export function kootenaiCountyRef() {
  return { "@id": `${BUSINESS.url}/areas#kootenai-county` };
}
