import Link from "next/link";
import { NORTH_IDAHO_CITIES, type NorthIdahoHdCategory } from "@/lib/north-idaho-hd";

/**
 * The North Idaho Hunter Douglas block on the general category pages,
 * twinned from UtahHdBlock on Nov 4, 2026. Every link in it lands on a
 * Hunter Douglas page: the line's anchor on /products/hunter-douglas
 * and the five Hunter Douglas city pages. There is no North Idaho
 * overview route, so this block carries no hub link; Coeur d'Alene
 * heads the city list. Copy credits measuring and installation to Luxe
 * Window Works itself and uses the lifetime installation guarantee
 * wording, which belongs to Luxe-installed work in North Idaho.
 */
export default function NorthIdahoHdBlock({ data }: { data: NorthIdahoHdCategory }) {
  return (
    <section aria-label={data.heading} className="py-16 md:py-20 bg-warm-white">
      <div className="container-luxe max-w-3xl">
        <div className="bg-linen/60 border border-warm-gray-200/60 rounded-2xl p-8 md:p-12">
          <p className="text-gold font-medium text-sm uppercase tracking-widest mb-3">
            Hunter Douglas · North Idaho
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
          </div>
          <p className="mt-7 text-warm-gray-600 leading-relaxed">
            Hunter Douglas consultations in your North Idaho city:{" "}
            {NORTH_IDAHO_CITIES.map((city, i) => (
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
