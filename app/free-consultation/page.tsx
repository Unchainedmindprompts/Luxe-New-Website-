import Image from "next/image";
import Link from "next/link";
import { BUSINESS, REVIEWS } from "@/lib/constants";
import { TrackedCta } from "@/components/TrackedCta";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { ConsultationForm } from "./ConsultationForm";

const BOOK_HREF = "/book";
const primary = "inline-flex min-h-12 items-center justify-center rounded-lg bg-gold px-6 py-3 font-semibold text-charcoal transition-colors hover:bg-[#dbc08f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";
const FAQS = [
  { q: "Is the consultation really free?", a: "Yes. Your in-home consultation is free, with no obligation to buy. We look at your windows, discuss what you want to improve, and help you compare suitable options." },
  { q: "Do I need to measure or choose a product first?", a: "No measurements or product decisions needed. We bring samples and help you compare styles, fabrics, light control, and motorization in your home. We handle the measuring." },
  { q: "Can you help with just one window?", a: "Yes. Single-window projects are welcome, along with room-by-room updates and whole-home installations." },
  { q: "What will my window treatments cost?", a: "Pricing depends on your window sizes, product, fabric, and operating system. Tell us the budget you have in mind so we can show you appropriate options. You can review the price before deciding to order." },
  { q: "Where do you work?", a: "We serve Post Falls, Coeur d’Alene, Hayden, Rathdrum, Sandpoint, and surrounding North Idaho communities." },
];

export default function FreeConsultationPage() {
  return (
    <div className="bg-warm-white text-charcoal pb-20 md:pb-0">
      <header className="border-b border-white/15 bg-charcoal text-white">
        <div className="container-luxe flex h-[76px] items-center justify-between gap-4">
          <Link href="/" aria-label="Luxe Window Works — home">
            <Image src="/images/luxe-logo-white.webp" alt="Luxe Window Works" width={925} height={388} priority className="h-10 w-auto sm:h-12" />
          </Link>
          <TrackedCta href={BUSINESS.phoneHref} event={CONVERSION_EVENTS.PhoneClick} className="text-sm sm:text-base font-semibold underline-offset-4 hover:underline">Call {BUSINESS.phone}</TrackedCta>
        </div>
      </header>

      <section className="bg-charcoal text-white">
        <div className="container-luxe grid gap-x-12 gap-y-7 py-8 sm:py-12 lg:grid-cols-[1.12fr_1fr] lg:py-14 xl:gap-x-20">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="text-sm font-semibold text-gold tracking-wide">POST FALLS · COEUR D’ALENE · HAYDEN</p>
            <h1 className="mt-4 max-w-xl font-serif text-[2.35rem] leading-[1.12] sm:text-5xl xl:text-[3.5rem] text-balance">Custom blinds &amp; shades.<br />Chosen at home.<br />Installed for you.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-warm-gray-200">Custom blinds, shades &amp; shutters, brought to your home. Compare samples in your own light. We help you choose, then professionally measure and install.</p>
            <p className="mt-5 text-base font-medium text-white">Free in-home consultation. No obligation to buy.</p>
            <a href="#request" className={`${primary} mt-6 lg:hidden`}>Request a Call or Text <span aria-hidden="true" className="ml-3">→</span></a>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-warm-gray-200">
              <span>24 years of experience</span><span>Single-window projects welcome</span>
            </div>
          </div>

          <div id="request" className="scroll-mt-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
            <ConsultationForm />
            <p className="mt-4 text-center text-sm text-warm-gray-200">Ready to pick a time? <Link href={BOOK_HREF} className="font-semibold underline underline-offset-4 hover:text-gold">Book your free in-home visit</Link></p>
          </div>

          <figure className="lg:col-start-1 lg:row-start-2">
            <div className="relative aspect-[2.1/1] overflow-hidden rounded-xl">
              <Image src="/images/free-consultation-hero.webp" alt="Soft daylight filtered through cellular shades in a furnished living room" fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm text-warm-gray-300">Privacy, light control, and a look that feels right at home.</figcaption>
          </figure>
        </div>
      </section>

      <section aria-label="Customer review" className="border-b border-warm-gray-200 bg-cream py-8 sm:py-10">
        <div className="container-luxe grid gap-5 lg:grid-cols-[240px_1fr] lg:gap-12 items-center">
          <a href={BUSINESS.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="block underline-offset-4 hover:underline">
            <span aria-hidden="true" className="block text-xl tracking-[0.2em] text-[#876623]">★★★★★</span>
            <span className="mt-2 block font-semibold">{BUSINESS.google.rating.toFixed(1)} on Google · {BUSINESS.google.reviewCount} reviews</span>
            <span className="mt-1 block text-sm text-warm-gray-700">Read our customer reviews ↗</span>
          </a>
          <blockquote>
            <p className="font-serif text-xl leading-relaxed sm:text-2xl">“{REVIEWS[0].text}”</p>
            <footer className="mt-3 text-sm text-warm-gray-700">— {REVIEWS[0].author}, Google review</footer>
          </blockquote>
        </div>
      </section>

      <section className="container-luxe py-12 sm:py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#876623] uppercase tracking-widest">From the first question to the final fit</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-tight">You don’t have to figure it out alone.</h2>
        </div>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            ["01", "Start with a conversation", "Leave your name and number. We’ll call or text within 24 hours to discuss your windows and arrange a free visit."],
            ["02", "See the options in your home", "Compare samples where they’ll actually live. We help you balance privacy, light, style, and budget—and measure for the right fit."],
            ["03", "Let us handle installation", "When you’re ready to order, we take care of professional installation, backed by our lifetime installation guarantee."],
          ].map(([num, title, body]) => <li key={num} className="border-t border-warm-gray-300 pt-5"><span className="text-sm font-semibold text-[#876623]">{num}</span><h3 className="mt-3 font-serif text-2xl">{title}</h3><p className="mt-3 text-base leading-relaxed text-warm-gray-700">{body}</p></li>)}
        </ol>
      </section>

      <section className="bg-linen py-12 sm:py-16">
        <div className="container-luxe grid gap-8 lg:grid-cols-2 lg:gap-14 items-center">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src="/images/free-consultation-install.jpg" alt="Luxe Window Works installation of cream shades beside a stone fireplace, before the home was furnished" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm text-warm-gray-700">Actual Luxe Window Works installation · before home completion</figcaption>
          </figure>
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-tight">Your windows. Your priorities.<br />A solution that fits.</h2>
            <p className="mt-5 text-base leading-relaxed text-warm-gray-700">Bare windows in a new home? Too much glare in the afternoon? A room that needs more privacy? Tell us what you want to improve. We’ll help you narrow down the options.</p>
            <ul className="mt-5 space-y-3 text-base">
              {["Blinds, shades, shutters & draperies", "Motorized options for easy everyday control", "One window, one room, or your whole home"].map(text => <li key={text} className="flex gap-3"><span aria-hidden="true" className="text-[#876623]">✓</span>{text}</li>)}
            </ul>
            <div className="mt-7 flex items-center gap-4 border-t border-warm-gray-300 pt-6">
              <Image src="/images/mark-photo.webp" alt="Mark Abplanalp, owner of Luxe Window Works" width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-full object-cover" />
              <p className="text-sm leading-relaxed"><strong className="block text-base">Mark Abplanalp · Owner</strong>Based in Post Falls. 24 years of experience helping people choose and install window treatments.</p>
            </div>
            <a href="#request" className={`${primary} mt-7`}>Request a Call or Text <span aria-hidden="true" className="ml-3">→</span></a>
          </div>
        </div>
      </section>

      <section className="container-luxe max-w-3xl py-12 sm:py-16">
        <h2 className="font-serif text-3xl sm:text-4xl">A few things you might be wondering.</h2>
        <div className="mt-7 divide-y divide-warm-gray-200 border-y border-warm-gray-200">
          {FAQS.map(({q,a}) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">{q}<span aria-hidden="true" className="text-xl group-open:rotate-45">+</span></summary><p className="mt-3 pr-7 text-base leading-relaxed text-warm-gray-700">{a}</p></details>)}
        </div>
      </section>

      <section className="bg-charcoal px-5 py-12 text-center text-white sm:py-16">
        <h2 className="font-serif text-3xl sm:text-4xl">Let’s make your windows work for you.</h2>
        <p className="mt-4 text-base text-warm-gray-200">Start with a call or text. We’ll help with the next step.</p>
        <a href="#request" className={`${primary} mt-6`}>Request a Call or Text <span aria-hidden="true" className="ml-3">→</span></a>
        <p className="mt-5 text-sm text-warm-gray-200">Free consultation · Professional measuring · Lifetime installation guarantee</p>
      </section>
      <footer className="bg-charcoal border-t border-white/15 py-6 text-warm-gray-200">
        <div className="container-luxe flex flex-col gap-3 text-sm sm:flex-row sm:justify-between"><p>Luxe Window Works · Post Falls, Idaho · Serving North Idaho</p><Link href="/privacy" className="underline underline-offset-4">Privacy policy</Link></div>
      </footer>
      <nav aria-label="Contact Luxe Window Works" className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-warm-gray-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg md:hidden">
        <TrackedCta href={BUSINESS.phoneHref} event={CONVERSION_EVENTS.PhoneClick} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-charcoal px-5 font-semibold">Call</TrackedCta>
        <a href="#request" className={`${primary} flex-1 px-3`}>Request a Call or Text</a>
      </nav>
    </div>
  );
}
