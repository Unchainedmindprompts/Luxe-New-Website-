/**
 * Canonical Brand schema nodes for JSON-LD.
 *
 * One definition per brand, referenced by @id from every product page that
 * mentions the brand. Prevents field drift (name, alternateName, url, sameAs)
 * across pages that all point to the same real-world brand entity.
 */

export const NORMAN_BRAND = {
  "@type": "Brand",
  "@id": "https://www.normanwindowfashions.com/#brand",
  name: "Norman",
  alternateName: "Norman Window Fashions",
  url: "https://www.normanwindowfashions.com",
  sameAs: [
    "https://www.normanwindowfashions.com",
    "https://normanusa.com",
    "https://en.wikipedia.org/wiki/Norman_(window_treatment_brand)",
  ],
} as const;

export const ALTA_BRAND = {
  "@type": "Brand",
  "@id": "https://www.altawindowfashions.com/#brand",
  name: "Alta",
  alternateName: "Alta Window Fashions",
  url: "https://www.altawindowfashions.com",
  sameAs: ["https://www.altawindowfashions.com"],
} as const;
