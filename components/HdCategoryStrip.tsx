import Link from "next/link";
import { HD_CATEGORY_STRIP } from "@/lib/eastside-hd";

/**
 * "Shop Hunter Douglas by category" strip for the Hunter Douglas location
 * pages (the six Eastside cities and Coeur d'Alene).
 *
 * Mark's routing rule: a location page routes visitors to every individual
 * Hunter Douglas category, and only to Hunter Douglas categories. Every
 * link here is an anchor on /products/hunter-douglas; a location page
 * never links out to the general /products/<category> pages. The copy is
 * deliberately free of fulfillment and warranty claims so the same strip
 * reads correctly in Idaho, where Luxe installs, and on the Eastside,
 * where Hunter Douglas Installation Services does.
 */
export default function HdCategoryStrip() {
  return (
    <section aria-label="Shop Hunter Douglas by category" className="container-luxe pb-14 md:pb-20">
      <div className="border border-warm-gray-200 bg-white p-7 md:p-9">
        <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Shop Hunter Douglas by category</p>
        <h2 className="mt-3 font-serif text-2xl text-charcoal sm:text-3xl">Every Hunter Douglas category, through one dealer.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-warm-gray-700">
          The collections above are starting points. Hunter Douglas also makes blinds, solar shades, shutters and motorization, and each category is available through Luxe. Pick a category to compare its collections on our Hunter Douglas page.
        </p>
        <nav aria-label="Hunter Douglas product categories" className="mt-7 flex flex-wrap gap-2">
          {HD_CATEGORY_STRIP.map((c) => (
            <Link
              key={c.anchor}
              href={`/products/hunter-douglas#${c.anchor}`}
              className="rounded-full border border-warm-gray-300 bg-cream px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {c.label} · {c.detail}
            </Link>
          ))}
        </nav>
        <p className="mt-6 leading-relaxed text-warm-gray-700">
          Planning a budget first? See{" "}
          <Link href="/blog/how-much-do-hunter-douglas-window-treatments-cost" className="font-semibold underline underline-offset-4">
            how much Hunter Douglas window treatments cost
          </Link>
          , with the published per-window ranges for each collection.
        </p>
      </div>
    </section>
  );
}
