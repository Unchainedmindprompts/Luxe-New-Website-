import { BUSINESS } from "@/lib/constants";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { TrackedCta } from "./TrackedCta";

/**
 * Shared "what happens next" block for commercial pages. City and product
 * names come from the page already being rendered. A request is not a
 * booked appointment — the copy says so.
 */
export function ConsultationExpect({
  city,
  productName,
  showCtas = true,
  outdoor = false,
}: {
  city?: string;
  productName?: string;
  showCtas?: boolean;
  outdoor?: boolean;
}) {
  const where = city
    ? ` in ${city}`
    : " across Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint";
  const samples = productName
    ? `bring samples for ${productName.toLowerCase()}`
    : "bring samples";

  return (
    <section className="py-16 md:py-20 bg-warm-white">
      <div className="container-luxe max-w-3xl">
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-5">
          What happens during the free in-home consultation
        </h2>
        <p className="text-warm-gray-600 leading-relaxed text-lg">
          We come to your home{where}. {outdoor ? (
            <>We bring exterior shade samples and assess the patio, covered deck, or window opening. We review sun exposure, mounting surfaces, privacy and views, power, and compatible controls, then explain the selected system’s operating limits. We take the measurements and prepare a project-specific quote. </>
          ) : (
            <>We look at the windows, {samples}, and explain what will actually work in each room — light, privacy, heat, and how you use the space. </>
          )}There is no showroom visit. The
          consultation is free, and requesting one is not a booked
          appointment. You pick a time after we talk, or you can choose a
          time on the booking page.
        </p>
        {showCtas ? (
          <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4">
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
            <TrackedCta href={`sms:${BUSINESS.phoneE164}`} event={CONVERSION_EVENTS.TextClick}
              className="inline-flex items-center justify-center border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white font-semibold px-8 py-4 rounded-full text-base transition-all">
              Text Us
            </TrackedCta>
          </div>
        ) : null}
      </div>
    </section>
  );
}
