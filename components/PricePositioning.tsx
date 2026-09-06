import { PRICE_POSITIONING } from "@/lib/constants";

/**
 * Compact value block sourced from the live About page. Homepage uses the
 * full verified paragraph; /book uses a short echo so the two booking paths
 * stay the focus.
 */
export function PricePositioning({
  variant = "homepage",
}: {
  variant?: "homepage" | "book";
}) {
  if (variant === "book") {
    return (
      <div className="rounded-2xl border border-gold/25 bg-gold/5 px-5 py-5 sm:px-6 sm:py-6 text-center">
        <p className="text-gold text-xs font-semibold uppercase tracking-widest">
          {PRICE_POSITIONING.brandLine}
        </p>
        <p className="mt-2 font-serif text-lg text-charcoal">
          {PRICE_POSITIONING.headline}
        </p>
        <p className="mt-2 text-sm text-warm-gray-600 leading-relaxed">
          We don&apos;t inflate a list price so we can advertise 40% off it
          later. We&apos;ll look at a competing bid if you have one.
        </p>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-cream">
      <div className="container-luxe max-w-3xl text-center">
        <p className="text-gold font-medium text-sm uppercase tracking-widest mb-3">
          {PRICE_POSITIONING.brandLine}
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal leading-tight">
          {PRICE_POSITIONING.headline}
        </h2>
        <p className="mt-4 text-base md:text-lg text-warm-gray-600 leading-relaxed">
          {PRICE_POSITIONING.body}
        </p>
      </div>
    </section>
  );
}
