/**
 * Namespace helpers for Payload-managed JSON-LD entities.
 *
 * Rule: Payload-driven schema always uses the #cms-* fragment prefix.
 * This prevents any @id clash with hand-authored schema in layout.tsx,
 * page.tsx files, and static blog articles, which use #business, #owner,
 * #article, #faq, etc.
 *
 * Hand-authored IDs (never touch these in Payload-generated schema):
 *   https://www.luxewindowworks.com/#business
 *   https://www.luxewindowworks.com/#owner
 *   https://www.luxewindowworks.com/blog/[slug]#article
 *   https://www.luxewindowworks.com/blog/[slug]#faq
 *   https://www.luxewindowworks.com/blog
 *
 * Payload-managed IDs always use the helpers below.
 */

const BASE = "https://www.luxewindowworks.com";

/** Generate a namespaced @id for any Payload-managed entity */
export function cmsId(fragment: string): string {
  return `${BASE}/#cms-${fragment}`;
}

/** Generate a namespaced @id for a Payload-managed page or post */
export function cmsPageId(path: string, fragment = "page"): string {
  return `${BASE}${path}#cms-${fragment}`;
}

/**
 * Pre-built entity references for common Payload-managed schema types.
 * Import and spread these into your JSON-LD data objects.
 */
export const CMS_ENTITY = {
  /** Reference back to the hand-authored business entity — read-only, never redefine */
  businessRef: { "@id": `${BASE}/#business` },
  /** Reference back to the hand-authored owner entity — read-only, never redefine */
  ownerRef: { "@id": `${BASE}/#owner` },
} as const;
