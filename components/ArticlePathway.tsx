import Link from "next/link";
import type { ArticlePathway as ArticlePathwayData } from "@/lib/article-pathways";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { TrackedCta } from "./TrackedCta";

export function ArticlePathway({
  pathway,
}: {
  pathway: ArticlePathwayData;
}) {
  return (
    <aside
      className="not-prose my-10 rounded-2xl border border-warm-gray-200/70 bg-cream px-6 py-7 sm:px-8 sm:py-8"
      aria-labelledby="article-pathway-heading"
    >
      <h2
        id="article-pathway-heading"
        className="font-serif text-2xl text-charcoal leading-snug"
      >
        {pathway.heading}
      </h2>
      <p className="mt-3 text-base text-warm-gray-600 leading-relaxed">
        {pathway.body}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <TrackedCta
          href={pathway.productHref}
          event={CONVERSION_EVENTS.ProductCtaClick}
          className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
        >
          {pathway.productLabel}
        </TrackedCta>
        <TrackedCta
          href={pathway.bookHref}
          event={CONVERSION_EVENTS.ConsultCtaClick}
          className="inline-flex items-center justify-center border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
        >
          {pathway.bookLabel}
        </TrackedCta>
      </div>
      {pathway.areaHref && pathway.areaLabel ? (
        <p className="mt-4 text-sm text-warm-gray-500">
          Also see{" "}
          <Link
            href={pathway.areaHref}
            className="text-gold hover:underline font-medium"
          >
            {pathway.areaLabel}
          </Link>
          .
        </p>
      ) : null}
    </aside>
  );
}
