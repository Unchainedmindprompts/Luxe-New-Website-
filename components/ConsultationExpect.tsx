import { BUSINESS } from "@/lib/constants";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { TrackedCta } from "./TrackedCta";

/**
 * Shared "what happens next" block for commercial pages. A request is not
 * a booked appointment — the copy says so.
 */
export function ConsultationExpect({
  city,
}: {
  city?: string;
}) {
  const where = city
    ? ` in ${city}`
    : " across Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint";

  return (
    <section className="py-16 md:py-20 bg-cream/50">
      <div className="container-luxe max-w-3xl">
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-5">
          What happens during the free in-home consultation
        </h2>
        <p className="text-warm-gray-600 leading-relaxed text-lg">
          Mark comes to your home{where}. He looks at the windows, brings
          samples, and explains what will actually work in each room — light,
          privacy, heat, and how you use the space. There is no showroom
          visit. The consultation is free, and requesting one is not a booked
          appointment. You pick a time after we talk, or you can choose a
          time on the booking page.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <TrackedCta
            href="/book"
            event={CONVERSION_EVENTS.ConsultCtaClick}
            className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-base transition-all hover:shadow-lg"
          >
            Request a free in-home consultation
          </TrackedCta>
          <TrackedCta
            href={BUSINESS.phoneHref}
            event={CONVERSION_EVENTS.PhoneClick}
            className="inline-flex items-center justify-center border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-semibold px-8 py-4 rounded-full text-base transition-all"
          >
            Call {BUSINESS.phone}
          </TrackedCta>
        </div>
      </div>
    </section>
  );
}
