/**
 * Shared schema-graph stubs used across pages.
 *
 * OWNER_STUB — minimal Person representation of the business owner referenced
 * by @id from the homepage `businessNode.founder`. The canonical Person node
 * lives on the About page and is built by SPREADING this stub
 * (`{ ...OWNER_STUB, jobTitle, image, ... }`) so the literal @type/@id/name
 * appears exactly ONCE in source (right here).
 *
 * The homepage emits this stub as a node in its @graph so single-page AI
 * consumers (GPTBot, ClaudeBot, PerplexityBot) that don't resolve
 * cross-document @id references still see the founder's identity when they
 * fetch just /.
 *
 * See .claude/skills/schema-audit/SKILL.md → "Accepted exceptions" for the
 * rationale and why this doesn't violate the define-once entity rule.
 */
import { BUSINESS, PRODUCTS } from "@/lib/constants";

export const OWNER_STUB = {
  "@type": "Person",
  "@id": `${BUSINESS.url}/#owner`,
  name: BUSINESS.ownerFullName,
} as const;

/**
 * BUSINESS_STUB — minimal Organization identity for pages that are not the
 * homepage. Google reads one URL at a time and will not merge the homepage
 * graph, so article `publisher` (and any similar single-page consumer) needs
 * @type + name on the page itself. The canonical HomeAndConstructionBusiness
 * node still lives on the homepage and is built by SPREADING this stub, so
 * the literal @type/@id/name appears exactly ONCE in source (right here).
 *
 * Do not add NAP, offers, hours, or ratings here — that would re-declare the
 * homepage business blob on every article.
 */
export const BUSINESS_STUB = {
  "@type": ["HomeAndConstructionBusiness", "LocalBusiness", "Organization"],
  "@id": `${BUSINESS.url}/#business`,
  name: BUSINESS.name,
} as const;

/**
 * The nine products that own a `/products/{slug}` route. Derived from the
 * `PRODUCTS` const rather than restated, so a slug that isn't a real product
 * fails `tsc` instead of minting a dangling `@id` nobody notices until the
 * post-build sweep.
 */
export type ProductSlug = (typeof PRODUCTS)[number]["slug"];

/**
 * The `serviceType` every Luxe service shares.
 *
 * The area pages have used this exact phrase since they were written; the
 * product pages did not classify themselves at all. Both read it from here now
 * so one taxonomy term has one owner — the same reason the glossary reads
 * Norman's founding year off the brand rather than restating it.
 *
 * It says what the nine product Services and the five area Services have in
 * common. The `name` on each is what distinguishes them: a category on the
 * product pages, a city on the area pages.
 */
export const CUSTOM_WINDOW_TREATMENTS = "Custom Window Treatments";

/**
 * A REFERENCE to the canonical product Service — `{ "@id": ... }` and nothing
 * else. The full definition lives on `app/products/[slug]/page.tsx` and stays
 * there; this only lets other pages point at it.
 *
 * Same discipline as `cityRef` in `lib/cities.ts`, and for the same reason: the
 * schema sweep classifies any object carrying `@type` beside `@id` as a
 * *definition*, so a helper that emitted `@type`, `name` or `url` alongside the
 * canonical id would turn every call site into a duplicate-definition bug.
 *
 * The `@id` is deliberately spelled out here as a template literal rather than
 * assembled from a returned string, so the source sweep still recognises this
 * line as a reference to the `<HOST>/products/${slug}#service` pattern def.
 */
export function productServiceRef(
  slug: ProductSlug | "aluminum-shutters" | "hunter-douglas" | "norman"
) {
  return { "@id": `${BUSINESS.url}/products/${slug}#service` };
}

/**
 * Normalizes any YYYY-MM-DD or ISO 8601 timestamp into an explicit
 * America/Los_Angeles ISO 8601 string (automatically applying -08:00 PST vs
 * -07:00 PDT for the specific date).
 */
export function toPacificIso(raw: string): string {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const instant = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T12:00:00Z`)
    : new Date(trimmed);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "longOffset",
    })
      .formatToParts(instant)
      .map((p) => [p.type, p.value])
  );
  const offset = (parts.timeZoneName || "GMT-08:00").replace("GMT", "") || "-08:00";
  const hh = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hh}:${parts.minute}:${parts.second}${offset}`;
}
