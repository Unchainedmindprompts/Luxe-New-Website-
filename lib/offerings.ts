/**
 * Which manufacturers supply which Luxe offering.
 *
 * INTERNAL BUSINESS TRUTH. This module emits nothing. It is not JSON-LD, it is
 * not rendered, and as of this commit it has no runtime consumer at all — that
 * is intended, not an oversight. Schema.org has no property that states "we
 * carry X for Y" without distorting it: `brand` means the brand an organization
 * *maintains*, which would make Luxe a franchise of five manufacturers at once,
 * and `manufacturer` is Product-only. The relationship is real regardless, so
 * it is recorded here and left unpublished until something can consume it
 * honestly — a capability adapter, an agent interface, an API. Schema.org is
 * one adapter over this truth, not the definition of it.
 *
 * A JOIN, NOT A CATALOGUE. Every value here points at an identity that already
 * exists: Services through `productServiceRef`, manufacturers by the `@id`
 * `lib/brands.ts` defines. Nothing about a manufacturer or a product is
 * restated — no names, no URLs, no specs, no prices, no copy. If this file
 * starts describing things rather than relating them, it has become the
 * catalogue it was written to avoid.
 *
 * THE EVIDENCE BAR. A manufacturer appears here only where Luxe's own body
 * copy says, in substance, that it carries or installs that manufacturer for
 * that offering. Meta descriptions and trailing link lists did not qualify —
 * see `roller-shades` below, where they disagree with each other. An empty
 * `manufacturersEvidenced` means the repository does not establish the
 * relationship, never that the offering has no manufacturer. Missing truth is
 * preferable to overstated truth, and the gap is visible rather than papered
 * over.
 */
import type { ProductSlug } from "@/lib/schema";
import { productServiceRef } from "@/lib/schema";
import {
  CARRIED_BRANDS,
  NORMAN_BRAND,
  ALTA_BRAND,
  LAFAYETTE_BRAND,
  CORRADI_USA,
  THE_WINDOW_OUTFITTERS,
} from "@/lib/brands";

/**
 * The ten offerings with a product page, plus the one without.
 *
 * Aluminum shutters is a real offering — Luxe's shutters page lists it and four
 * articles cover it — that has no `/products` route and therefore no canonical
 * Service. Its absence from the Service layer is a fact about the business, so
 * it is recorded here rather than fixed by inventing a page.
 *
 * Custom drapery is the opposite case: it now has `/products/custom-drapery`
 * and one Service `@id`. Manufacturers for that offering are unestablished.
 */
export type OfferingId = ProductSlug | "aluminum-shutters";

/**
 * The `@id` of a manufacturer `lib/brands.ts` defines, and nothing else.
 * Derived from `CARRIED_BRANDS`, so a manufacturer this site has not given a
 * canonical identity cannot be referenced here — it fails `tsc` rather than
 * silently entering the graph as a string.
 */
export type ManufacturerId = (typeof CARRIED_BRANDS)[number]["@id"];

export interface Offering {
  /**
   * Manufacturers the repository's own copy establishes for this offering.
   * Empty means unestablished, not absent — see the module comment.
   */
  readonly manufacturersEvidenced: readonly ManufacturerId[];
  /**
   * Present ONLY where Luxe states it uses one manufacturer to the exclusion of
   * others. Deliberately has no `false`: knowing that several manufacturers
   * supply a category is not the same as having established that no exclusive
   * arrangement exists, and a `false` here would claim the second while only
   * the first is true. Absence means unestablished.
   */
  readonly exclusive?: true;
}

/**
 * Keyed by `OfferingId` rather than a list of objects carrying their own `id`:
 * duplicate keys are then impossible, and leaving an offering out fails `tsc`
 * instead of quietly under-reporting what Luxe sells.
 */
export const OFFERINGS: Record<OfferingId, Offering> = {
  // "We carry premium lines from Norman, Alta, and Lafayette" — solution,
  // restated in features as "Premium brands: Norman, Alta, and Lafayette".
  blinds: {
    manufacturersEvidenced: [
      NORMAN_BRAND["@id"],
      ALTA_BRAND["@id"],
      LAFAYETTE_BRAND["@id"],
    ],
  },

  // "All of the cellular shade brands we carry — Alta, Norman, and Lafayette".
  "cellular-shades": {
    manufacturersEvidenced: [
      NORMAN_BRAND["@id"],
      ALTA_BRAND["@id"],
      LAFAYETTE_BRAND["@id"],
    ],
  },

  // "The Lafayette and Norman brands carried by Luxe Window Works". Alta is
  // absent on purpose — this is the one multi-supplier category whose copy
  // names two of the three, and filling in the third would be inventing it.
  "banded-shades": {
    manufacturersEvidenced: [NORMAN_BRAND["@id"], LAFAYETTE_BRAND["@id"]],
  },

  // "Battery-powered motors from Alta, Norman, and Lafayette require no
  // hardwiring — We install them in a single visit". Named at this category
  // level, not inferred from the shades they drive.
  motorization: {
    manufacturersEvidenced: [
      NORMAN_BRAND["@id"],
      ALTA_BRAND["@id"],
      LAFAYETTE_BRAND["@id"],
    ],
  },

  // "We install Norman exclusively for interior shutters", said twice. The only
  // offering whose copy states exclusivity, and the only one that gets the flag.
  shutters: {
    manufacturersEvidenced: [NORMAN_BRAND["@id"]],
    exclusive: true,
  },

  // "We install Corradi USA exterior screens on North Idaho patios, decks, and
  // sun-blasted windows." The only manufacturer named for this offering — which
  // is not the same as Luxe having said it uses no other, so no exclusive flag.
  "exterior-solar-shades": {
    manufacturersEvidenced: [CORRADI_USA["@id"]],
  },

  // "we also carry aluminum shutters by The Window Outfitters". Same reasoning
  // as Corradi: sole manufacturer named, no exclusivity claimed.
  "aluminum-shutters": {
    manufacturersEvidenced: [THE_WINDOW_OUTFITTERS["@id"]],
  },

  // UNESTABLISHED BELOW. Real offerings, no manufacturer relationship the
  // repository actually states.

  // Not one manufacturer is named anywhere in the solar-shades entry — not in
  // the copy, the features, the FAQs or the metadata.
  "solar-shades": { manufacturersEvidenced: [] },

  // Same: the roman-shades entry names no manufacturer at all.
  "roman-shades": { manufacturersEvidenced: [] },

  // Deliberately empty despite mentions existing, because the mentions
  // disagree. The only manufacturer names in the product entry are in its
  // metaDescription ("premium fabrics — Norman, Alta, Lafayette") — no body
  // copy, no feature, no FAQ. An article's "Brands We Love!" link list names a
  // different set for roller shades: The Window Outfitters, Lafayette and
  // Norman, with Alta absent. Two thin sources that contradict each other are
  // not evidence for either, and picking one would be a guess wearing a
  // citation. Left unestablished until the copy says it plainly.
  "roller-shades": { manufacturersEvidenced: [] },

  // A blog post names Lafayette Interior Fashions Masterpieces for drapery.
  // That is one article, not product-page body copy, and it is not enough to
  // publish a manufacturer relationship here. Left unestablished until Mark
  // states which lines Luxe actually specifies for custom drapes.
  "custom-drapery": { manufacturersEvidenced: [] },
};

/**
 * The canonical Service for an offering, or null where none exists.
 *
 * Derived rather than stored, so it cannot drift from the offering it belongs
 * to: a stored `@id` could be pasted under the wrong key and nothing would
 * catch it. Aluminum shutters returns null because there is no
 * `/products/aluminum-shutters#service` and this layer must not conjure one.
 */
export function offeringServiceRef(id: OfferingId) {
  return id === "aluminum-shutters" ? null : productServiceRef(id);
}
