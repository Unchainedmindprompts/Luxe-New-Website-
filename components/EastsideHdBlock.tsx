import Link from "next/link";
import { EASTSIDE_CITIES, type EastsideHdCategory } from "@/lib/eastside-hd";

/**
 * The Eastside Hunter Douglas block on the general category pages.
 *
 * Per Mark's routing rule, this block is the ONLY Eastside connection a
 * category page carries, and every link in it lands on a Hunter Douglas
 * page: the line's anchor on /products/hunter-douglas, the /eastside
 * overview, and the six Hunter Douglas city pages. Copy credits measuring
 * and installation to Hunter Douglas Installation Services and never uses
 * the lifetime installation guarantee wording, which belongs to
 * Luxe-installed work in North Idaho.
 */
export default function EastsideHdBlock({ data }: { data: EastsideHdCategory }) {
  return (
    <section aria-label={data.heading} className="py-16 md:py-20 bg-warm-white">
      <div className="container-luxe max-w-3xl">
        <div className="bg-linen/60 border border-warm-gray-200/60 rounded-2xl p-8 md:p-12">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-3">
            Hunter Douglas · Seattle’s Eastside
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">
            {data.heading}
          </h2>
          <p className="text-warm-gray-600 leading-relaxed text-lg">{data.intro}</p>
          <p className="mt-4 text-warm-gray-600 leading-relaxed">{data.warranty}</p>
          <div className="mt-7 flex flex-col items-start gap-4">
            <Link
              href={`/products/hunter-douglas#${data.anchor}`}
              className="font-semibold text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Explore {data.line} <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/eastside"
              className="font-semibold text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              How Hunter Douglas service works on the Eastside <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="mt-7 text-warm-gray-600 leading-relaxed">
            Hunter Douglas consultations in your Eastside city:{" "}
            {EASTSIDE_CITIES.map((city, i) => (
              <span key={city.href}>
                {i > 0 && " · "}
                <Link
                  href={city.href}
                  className="font-medium text-charcoal underline underline-offset-4 decoration-gold"
                >
                  {city.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
