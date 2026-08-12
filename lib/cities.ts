/**
 * Canonical geography for Luxe's service-area cities.
 *
 * ONE REAL-WORLD PLACE, ONE @id. Each of the five cities Luxe serves is a
 * single entity defined once — on its own `/areas/{slug}` page — and referenced
 * by `@id` everywhere else. Before this, the same five cities were rebuilt as
 * anonymous `City` objects on every page that mentioned them: ~62 copies each,
 * ~318 nested `State` nodes, and nothing tying any of them to the `#place`
 * entities the area pages already published. A consumer had no way to know the
 * "Hayden" in an article's `mentions` was the "Hayden" the area page describes.
 *
 * The `@id`s are unchanged — `/areas/{slug}#place` already existed and was
 * already correct. What changed is that they are now referenced rather than
 * shadowed.
 *
 * COUNTY CONTAINMENT CAME FROM THE HOMEPAGE. It was real data living in exactly
 * one place (`#business.areaServed`), and collapsing those nodes into references
 * would have deleted it. It moves here instead, so every emission of a city now
 * carries the county it actually sits in — including Sandpoint, which is in
 * Bonner County, not Kootenai.
 */
import { BUSINESS } from "@/lib/constants";

interface CityEntry {
  /** Matches the `/areas/{slug}` route, which is what makes the @id derivable. */
  readonly slug: string;
  readonly sameAs: string;
  readonly state: string;
  /** The county the city actually sits in. Not every city shares one. */
  readonly county: { readonly name: string; readonly sameAs?: string };
}

export const CITIES: Record<string, CityEntry> = {
  "Coeur d'Alene": {
    slug: "coeur-d-alene",
    sameAs: "https://en.wikipedia.org/wiki/Coeur_d%27Alene,_Idaho",
    state: "Idaho",
    county: {
      name: "Kootenai County",
      sameAs: "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
    },
  },
  "Post Falls": {
    slug: "post-falls",
    sameAs: "https://en.wikipedia.org/wiki/Post_Falls,_Idaho",
    state: "Idaho",
    county: {
      name: "Kootenai County",
      sameAs: "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
    },
  },
  Hayden: {
    slug: "hayden",
    sameAs: "https://en.wikipedia.org/wiki/Hayden,_Idaho",
    state: "Idaho",
    county: {
      name: "Kootenai County",
      sameAs: "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
    },
  },
  Rathdrum: {
    slug: "rathdrum",
    sameAs: "https://en.wikipedia.org/wiki/Rathdrum,_Idaho",
    state: "Idaho",
    county: {
      name: "Kootenai County",
      sameAs: "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
    },
  },
  Sandpoint: {
    slug: "sandpoint",
    sameAs: "https://en.wikipedia.org/wiki/Sandpoint,_Idaho",
    state: "Idaho",
    // Sandpoint is in Bonner County. The homepage already had this right; the
    // registry has to keep it right, because a single shared county default
    // would quietly relocate a whole town.
    county: {
      name: "Bonner County",
      sameAs: "https://en.wikipedia.org/wiki/Bonner_County,_Idaho",
    },
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
 *
 * Typed `City` rather than the `Place` the hub used to emit: `City` is a
 * subtype, it is what every consumer of this entity actually meant, and nothing
 * else defines this `@id` for the type to conflict with.
 */
export function cityPlaceNode(name: string) {
  const entry = CITIES[name];
  if (!entry) return null;
  return {
    "@type": "City",
    "@id": `${BUSINESS.url}/areas/${entry.slug}#place`,
    name,
    sameAs: entry.sameAs,
    url: `${BUSINESS.url}/areas/${entry.slug}`,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: entry.county.name,
      ...(entry.county.sameAs ? { sameAs: entry.county.sameAs } : {}),
      containedInPlace: { "@type": "State", name: entry.state },
    },
  };
}

/**
 * A REFERENCE ONLY — `{ "@id": ... }` and nothing else.
 *
 * Deliberately separate from `cityPlaceNode` rather than one helper with a
 * flag: the schema sweep classifies any object carrying `@type` alongside
 * `@id` as a definition, so a helper that sometimes emits `@type` would make
 * every call site a potential duplicate-definition bug. Two functions, two
 * obvious meanings, and the sweep can tell them apart on sight.
 *
 * Falls back to a plain named `City` for anywhere that mentions a city Luxe
 * does not have an area page for — those have no canonical identity to point
 * at, and inventing one would claim a page that does not exist.
 */
export function cityRef(name: string) {
  const id = cityPlaceId(name);
  return id ? { "@id": id } : { "@type": "City", name };
}

/**
 * The region the five cities sit in.
 *
 * It was rebuilt as an anonymous `AdministrativeArea` on every page that
 * claimed it — 52 copies, identical every time, connected to nothing. Unlike
 * the cities it has no `/areas/{slug}` route to name it, so its `@id` hangs off
 * the hub that does represent it: `/areas` carries "North Idaho" as its
 * eyebrow, says Luxe works "across North Idaho", and devotes a section to the
 * broader region. The entity is real on that page before any schema says so.
 *
 * Two functions rather than one with a flag, exactly as with the cities above —
 * a helper that sometimes emits `@type` would make every call site a possible
 * duplicate-definition bug.
 */
export const NORTH_IDAHO_ID = `${BUSINESS.url}/areas#north-idaho`;

/**
 * The FULL canonical definition. Emitted exactly once, on `/areas`.
 *
 * Carries only what the anonymous copies already carried. No containment, no
 * counties, no coordinates: North Idaho is a colloquial region rather than an
 * administrative one with a boundary this repository knows, and inventing
 * structure for it would be asserting geography nobody here has established.
 */
export function northIdahoNode() {
  return {
    "@type": "AdministrativeArea",
    "@id": `${BUSINESS.url}/areas#north-idaho`,
    name: "North Idaho",
    alternateName: "Northern Idaho",
    sameAs: "https://en.wikipedia.org/wiki/Idaho_Panhandle",
  };
}

/** A REFERENCE ONLY — `{ "@id": ... }` and nothing else. */
export function northIdahoRef() {
  return { "@id": `${BUSINESS.url}/areas#north-idaho` };
}
