import Link from "next/link";
import { TrackedCta } from "@/components/TrackedCta";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";

interface TemporaryShadeOfferProps {
  requestHref: string;
  location?: string;
}

export function TemporaryShadeOffer({
  requestHref,
  location = "North Idaho",
}: TemporaryShadeOfferProps) {
  return (
    <section aria-labelledby="temporary-shades-heading" className="border-y border-warm-gray-200 bg-cream py-10 sm:py-12">
      <div className="container-luxe grid items-center gap-6 lg:grid-cols-[1fr_280px] lg:gap-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#876623]">Moving or building in {location}?</p>
          <h2 id="temporary-shades-heading" className="mt-3 font-serif text-3xl leading-tight text-charcoal sm:text-4xl">Privacy while your custom shades are made.</h2>
          <p className="mt-4 text-base leading-relaxed text-warm-gray-700">
            When you order custom window treatments with Luxe, we provide and install <strong className="text-charcoal">free temporary shades in priority rooms</strong> while you wait.
          </p>
          <p className="mt-3 text-base leading-relaxed text-warm-gray-700">
            Tell us your move-in date. We’ll coordinate temporary-shade installation with you and discuss current lead times before you order.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-stretch">
          <TrackedCta
            href={requestHref}
            event={CONVERSION_EVENTS.ConsultCtaClick}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 py-3 text-center font-semibold text-charcoal transition-colors hover:bg-[#dbc08f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Request a Call or Text
          </TrackedCta>
          <Link href="/blog/moving-into-a-new-home-window-coverings-north-idaho" className="text-sm font-medium text-charcoal underline underline-offset-4 lg:text-center">
            How temporary shades work
          </Link>
        </div>
      </div>
    </section>
  );
}
