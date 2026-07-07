/**
 * City / place registry with Wikipedia sameAs for entity resolution.
 *
 * Used by any schema emission that mentions a specific city — Article.mentions,
 * areaServed on Service/Business, containedInPlace nesting on Places. Extending
 * the wikipediaSameAs discipline from area pages to every place mention on the
 * site gives GPTBot/Perplexity a stronger local-relevance signal.
 */

export const CITIES: Record<string, { sameAs?: string; state: string }> = {
  "Coeur d'Alene": {
    sameAs: "https://en.wikipedia.org/wiki/Coeur_d%27Alene,_Idaho",
    state: "Idaho",
  },
  "Post Falls": {
    sameAs: "https://en.wikipedia.org/wiki/Post_Falls,_Idaho",
    state: "Idaho",
  },
  "Hayden": {
    sameAs: "https://en.wikipedia.org/wiki/Hayden,_Idaho",
    state: "Idaho",
  },
  "Rathdrum": {
    sameAs: "https://en.wikipedia.org/wiki/Rathdrum,_Idaho",
    state: "Idaho",
  },
  "Sandpoint": {
    sameAs: "https://en.wikipedia.org/wiki/Sandpoint,_Idaho",
    state: "Idaho",
  },
};

/**
 * Build a schema.org City node with Wikipedia sameAs when available.
 * Falls back to a minimal City if the city isn't in the registry.
 */
export function cityNode(name: string) {
  const entry = CITIES[name];
  const state = entry?.state ?? "Idaho";
  return {
    "@type": "City",
    name,
    ...(entry?.sameAs ? { sameAs: entry.sameAs } : {}),
    containedInPlace: { "@type": "State", name: state },
  };
}
