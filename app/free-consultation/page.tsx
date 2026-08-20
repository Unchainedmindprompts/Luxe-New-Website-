import Image from "next/image";
import Link from "next/link";

const BOOK_HREF = "/book";

const TRUST = [
  { title: "23+ Years Experience", body: "Window-covering expertise" },
  { title: "Free In-Home Consultation", body: "We bring the showroom to you" },
  { title: "Professional Measuring", body: "Fit handled from the start" },
  { title: "Lifetime Install Guarantee", body: "On installation-related issues" },
] as const;

const STEPS = [
  {
    num: "1",
    title: "We meet in your home",
    body: "We look at the windows, light, privacy needs, style, and how you actually use the room.",
  },
  {
    num: "2",
    title: "We help you choose",
    body: "Compare fabrics, colors, operating systems, motorization, and products in the space where they will live.",
  },
  {
    num: "3",
    title: "We measure & install",
    body: "We take care of the details from accurate measuring through professional installation.",
  },
] as const;

const CHECKLIST = [
  "Blinds, shades, shutters and draperies",
  "Motorized window treatments",
  "Independent product selection",
  "Professional installation",
  "Single-window projects welcome",
] as const;

const FIT = [
  "You just moved into a home with bare windows.",
  "You want better privacy or light control.",
  "You are comparing blinds, shades or shutters.",
  "You are interested in motorization.",
  "You want the room to feel more finished.",
  "You want it measured and installed correctly.",
] as const;

const FAQS = [
  {
    q: "Is the in-home consultation really free?",
    a: "Yes. The consultation is free and gives us a chance to see the space, talk through what you want, and show you appropriate options.",
  },
  {
    q: "Do I need to know which product I want?",
    a: "No. You can start with the problem you are trying to solve. We’ll help you compare the options that make sense for the room.",
  },
  {
    q: "Will you do a single window?",
    a: "Yes. Luxe Window Works does not require a whole-home project or minimum number of windows.",
  },
  {
    q: "How long does the process usually take?",
    a: "Many custom orders are ready for installation in about four weeks. Shutters commonly take longer, often around six to eight weeks.",
  },
  {
    q: "Where do you work?",
    a: "We serve Post Falls, Coeur d’Alene, Hayden, Rathdrum, Sandpoint, and surrounding North Idaho communities.",
  },
] as const;

function BookCta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={BOOK_HREF}
      className={
        className ??
        "inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white font-semibold px-7 py-3.5 rounded-full text-sm sm:text-base transition-colors"
      }
    >
      {children}
    </Link>
  );
}

export default function FreeConsultationPage() {
  return (
    <div className="bg-warm-white text-charcoal">
      <header className="sticky top-0 z-50 bg-charcoal border-b border-white/10">
        <div className="container-luxe flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="flex items-center shrink-0"
            aria-label="Luxe Window Works — home"
          >
            <Image
              src="/images/luxe-logo-white.webp"
              alt="Luxe Window Works"
              width={925}
              height={388}
              priority
              className="h-9 md:h-12 w-auto"
            />
          </Link>
          <BookCta className="inline-flex items-center justify-center bg-gold hover:bg-gold-dark text-white font-semibold px-4 py-2.5 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm transition-colors">
            Schedule Free Consultation
          </BookCta>
        </div>
      </header>

      <section className="bg-cream">
        <div className="flex flex-col lg:flex-row lg:min-h-[calc(100svh-5rem)]">
          <div className="relative order-1 lg:order-2 w-full lg:w-[56%] h-[42vh] sm:h-[48vh] lg:h-auto lg:min-h-[calc(100svh-5rem)]">
            <Image
              src="/images/free-consultation-hero.jpg"
              alt="Living room with layered honeycomb shades"
              fill
              priority
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="order-2 lg:order-1 w-full lg:w-[44%] flex items-center">
            <div className="container-luxe lg:pl-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))] lg:pr-10 xl:pr-14 py-10 sm:py-12 lg:py-16 max-w-xl lg:max-w-none">
              <p className="text-gold text-xs font-semibold uppercase tracking-[0.22em] mb-4">
                Free In-Home Consultation
              </p>
              <h1 className="font-serif text-[1.85rem] sm:text-4xl xl:text-[2.75rem] text-charcoal leading-tight text-balance">
                Custom Window Treatments, Brought to Your Home.
              </h1>
              <p className="mt-5 text-[15px] sm:text-lg text-warm-gray-700 leading-relaxed">
                We help you choose the right blinds, shades, shutters, draperies,
                or motorized options for your space — then professionally measure
                and install everything.
              </p>
              <div className="mt-7">
                <BookCta>Schedule My Free Consultation</BookCta>
              </div>
              <p className="mt-4 text-sm text-warm-gray-500">
                No showroom trip. No guesswork.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-white py-8 md:py-10">
        <div className="container-luxe">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {TRUST.map((item) => (
              <li key={item.title} className="sm:pr-4 lg:border-l lg:border-white/10 lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
                <p className="font-serif text-lg text-white leading-snug">{item.title}</p>
                <p className="mt-1.5 text-sm text-warm-gray-400 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-charcoal text-white py-16 md:py-24 border-t border-gold/40">
        <div className="container-luxe max-w-4xl">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[2.75rem] leading-tight text-balance">
            You don’t need to know what you want before we arrive.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-warm-gray-300 leading-relaxed max-w-3xl">
            Tell us what you want the room to do better — more privacy, better
            light control, less glare, easier operation, a cleaner finished look
            — and we’ll help narrow down the right solution in your own home.
          </p>
        </div>
      </section>

      <section className="bg-warm-white py-16 md:py-24">
        <div className="container-luxe">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight max-w-3xl text-balance">
            From “we need something on these windows” to done.
          </h2>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="bg-white border border-warm-gray-200 rounded-2xl p-7 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/10 text-gold font-semibold text-sm">
                  {step.num}
                </span>
                <h3 className="mt-5 font-serif text-xl text-charcoal">{step.title}</h3>
                <p className="mt-3 text-[15px] text-warm-gray-600 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-linen py-16 md:py-24">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-warm-gray-200">
                <Image
                  src="/images/free-consultation-install.jpg"
                  alt="Empty living room with cream soft-fold shades and a stacked-stone fireplace, photographed before furniture arrived"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-sm text-warm-gray-600">
                Actual Luxe Window Works installation · photographed before home completion
              </figcaption>
            </figure>
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal leading-tight text-balance">
                A window treatment should look like it belongs in the home.
              </h2>
              <p className="mt-5 text-[15px] sm:text-base text-warm-gray-700 leading-relaxed">
                We work with homeowners throughout Post Falls, Coeur d’Alene,
                Hayden, Rathdrum and surrounding North Idaho.
              </p>
              <ul className="mt-8 space-y-3">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] text-charcoal">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold" aria-hidden="true">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-warm-white py-16 md:py-24">
        <div className="container-luxe">
          <h2 className="font-serif text-3xl sm:text-4xl text-charcoal leading-tight max-w-3xl text-balance">
            You want help making the right choice — not just buying a blind.
          </h2>
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIT.map((item) => (
              <li
                key={item}
                className="bg-cream border border-warm-gray-200 rounded-2xl px-5 py-5 text-[15px] text-charcoal leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-luxe max-w-3xl">
          <h2 className="sr-only">Frequently asked questions</h2>
          <div className="divide-y divide-warm-gray-200 border-y border-warm-gray-200">
            {FAQS.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-start justify-between gap-4 font-medium text-charcoal">
                  <span>{item.q}</span>
                  <span className="mt-0.5 text-gold transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] text-warm-gray-600 leading-relaxed pr-8">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-charcoal text-white py-16 md:py-24">
        <div className="container-luxe max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight text-balance">
            Let’s take a look at your windows.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-warm-gray-300 leading-relaxed">
            Pick a time that works for you. We’ll meet at your home, talk through
            what you want to accomplish, and help you figure out the best next
            step.
          </p>
          <div className="mt-8">
            <BookCta>Schedule My Free In-Home Consultation</BookCta>
          </div>
          <p className="mt-5 text-sm text-warm-gray-400">
            No showroom trip · No pressure to know exactly what you want
          </p>
        </div>
      </section>

      <footer className="bg-charcoal border-t border-white/10 py-6">
        <p className="container-luxe text-center text-xs text-warm-gray-500">
          Luxe Window Works · Post Falls, Idaho · Serving North Idaho
        </p>
      </footer>
    </div>
  );
}
