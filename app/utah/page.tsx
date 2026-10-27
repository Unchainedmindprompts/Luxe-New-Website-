import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TrackedCta } from "@/components/TrackedCta";
import { BUSINESS } from "@/lib/constants";
import { cityRef } from "@/lib/cities";
import { HUNTER_DOUGLAS } from "@/lib/hunter-douglas";

const PAGE = `${BUSINESS.url}/utah`;
const HERO = "/images/luxe-completed-installation.webp";
const description = "Hunter Douglas and Alta Window Fashions window treatments for the Salt Lake area: Salt Lake City, Millcreek, Holladay, Draper, South Jordan, Park City, Heber City and Midway. In-home consultations by appointment; measuring and installation through Hunter Douglas Installation Services for both brands.";
const CITIES = ["Salt Lake City", "Millcreek", "Holladay", "Draper", "South Jordan", "Park City", "Heber City", "Midway"];
const faqs = [
  { question: "Where do you serve in Utah?", answer: "Luxe Window Works serves Salt Lake City, Millcreek, Holladay, Draper, South Jordan, Park City, Heber City and Midway with in-home consultations by appointment. Each city page linked above covers what we see most often in that community's homes." },
  { question: "Do you have a showroom in Utah?", answer: "No. Luxe Window Works serves Utah by appointment. There is no showroom trip: we bring samples to your home so you can compare them in your own light, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers." },
  { question: "What is the difference between Hunter Douglas and Alta Window Fashions?", answer: "Alta Window Fashions is a Hunter Douglas company. Hunter Douglas is the premium line, with collections like Silhouette, Duette and Vignette and PowerView automation. Alta covers many of the same shade styles, including cellular, roller, solar and sheer shades, at a lower price point. Both are measured and installed through Hunter Douglas Installation Services, so the service behind them is the same; the choice is about the product and the budget, and we compare both in your home." },
  { question: "Who handles measurement and installation?", answer: "Measuring and installation are performed through Hunter Douglas Installation Services, Hunter Douglas's own certified installation service, for both Hunter Douglas and Alta Window Fashions products. Measurements are guaranteed for fit. Installation carries a one-year installation guarantee from the service, Hunter Douglas shades carry the Hunter Douglas lifetime warranty, and PowerView carries a five-year warranty." },
  { question: "How much do Hunter Douglas and Alta shades cost?", answer: "Pricing depends on the brand, collection, fabric, window sizes and operating system. Hunter Douglas sits at the premium end; Alta covers many of the same styles for less. Your free consultation includes help comparing products and controls for your rooms and a tailored quote for your selected products, with measuring and installation arranged as part of your order. Our guide to Hunter Douglas pricing explains how the numbers are built." },
  { question: "Why buy through Luxe instead of a showroom?", answer: "Luxe has been a Hunter Douglas dealer for 20 years, so the guidance comes from deep familiarity with both product lines. Luxe runs without a showroom, so your price carries the product and manufacturer-backed installation rather than retail overhead. You get the same products and warranties, with installation by Hunter Douglas's own certified service." },
];
const cities = [
  { name: "Salt Lake City", href: "/areas/salt-lake-city", text: "Historic Avenues and Capitol Hill homes, Sugar House bungalows, and west-facing East Bench glass over the valley." },
  { name: "Millcreek", href: "/areas/millcreek", text: "Mid-century ramblers under mature trees in East Mill Creek and Canyon Rim, and view homes toward Mount Olympus." },
  { name: "Holladay", href: "/areas/holladay", text: "Large-lot homes and Olympus Cove custom builds at the mouth of Big Cottonwood Canyon, where the view is the point." },
  { name: "Draper", href: "/areas/draper", text: "Corner Canyon and South Mountain custom homes and Suncrest ridge views, with two-story glass that calls for motorization." },
  { name: "South Jordan", href: "/areas/south-jordan", text: "Daybreak villages and southwest valley family homes, where rear glass faces the Oquirrhs and the afternoon sun." },
  { name: "Park City", href: "/areas/park-city", text: "Old Town, Deer Valley and Promontory mountain homes and second homes, where UV and tall glass shape the plan." },
  { name: "Heber City", href: "/areas/heber-city", text: "A fast-growing Wasatch Back town: Main Street homes, new subdivisions, and Red Ledges luxury builds." },
  { name: "Midway", href: "/areas/midway", text: "Swiss-inspired streets, resort homes and second homes in the Heber Valley, framed by mountain views." },
];
const collections = [
  { name: "Soft light & a view", collection: "Silhouette® sheer shades", anchor: "silhouette", text: "Compare sheer fabrics and adjustable vanes for west-facing rooms where the view matters and the high-elevation sun is strong." },
  { name: "Comfort & privacy", collection: "Duette® cellular shades", anchor: "duette", text: "Consider cellular construction for insulation at the glass, through valley inversions and Wasatch Back winters alike." },
  { name: "The same styles, a lower price", collection: "Alta Window Fashions", anchor: null, text: "Alta covers cellular, roller, solar and sheer shades at a friendlier price point, measured and installed through the same Hunter Douglas Installation Services." },
];

export const metadata: Metadata = {
  title: "Hunter Douglas & Alta Dealer for the Salt Lake Area | Luxe Window Works",
  description,
  alternates: { canonical: PAGE },
  openGraph: { title: "Hunter Douglas & Alta Dealer for the Salt Lake Area | Luxe Window Works", description, url: PAGE, images: [{ url: HERO, width: 2048, height: 1152, alt: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works" }] },
  twitter: { card: "summary_large_image", title: "Hunter Douglas & Alta Dealer for the Salt Lake Area | Luxe Window Works", description, images: [HERO] },
};

function BookButton({ children = "Book Your Free Consultation" }: { children?: React.ReactNode }) {
  return <TrackedCta href="/book" event="ConsultCtaClick" className="inline-block rounded-full bg-charcoal px-7 py-4 text-center font-semibold text-white">{children}</TrackedCta>;
}

export default function UtahPage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", "@id": `${PAGE}#webpage`, url: PAGE, name: "Hunter Douglas and Alta Window Treatments for the Salt Lake Area", description, isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: [{ "@id": `${BUSINESS.url}/products/hunter-douglas#service` }, { "@id": HUNTER_DOUGLAS["@id"] }, ...CITIES.map(c => cityRef(c))], spatialCoverage: CITIES.map(c => cityRef(c)), breadcrumb: { "@id": `${PAGE}#breadcrumb` }, primaryImageOfPage: { "@id": `${PAGE}#primaryimage` } },
      { "@type": "ImageObject", "@id": `${PAGE}#primaryimage`, contentUrl: `${BUSINESS.url}${HERO}`, width: 2048, height: 1152, caption: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works", creator: { "@type": "Organization", name: "Luxe Window Works", url: BUSINESS.url }, creditText: "Luxe Window Works" },
      { "@type": "FAQPage", "@id": `${PAGE}#faq`, isPartOf: { "@id": `${PAGE}#webpage` }, mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      { "@type": "BreadcrumbList", "@id": `${PAGE}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url }, { "@type": "ListItem", position: 2, name: "Utah", item: PAGE }] },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Utah" }]} />
    <section aria-label="Hunter Douglas and Alta window treatments for the Salt Lake area" className="bg-charcoal">
      <div className="relative isolate w-full overflow-hidden">
        <Image src={HERO} alt="Hunter Douglas Vignette Roman Shades installed by Luxe Window Works in a living room with timber beams and a stone fireplace" fill priority sizes="100vw" quality={90} className="object-cover object-[35%_center] md:object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-black/35 md:bg-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-center px-6 pt-16 pb-40 sm:px-10 md:min-h-[640px] md:pt-24 md:pb-36">
          <div className="max-w-2xl text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">Hunter Douglas · Alta Window Fashions · Utah</p>
            <h1 className="font-serif text-4xl leading-[1.1] text-white text-balance sm:text-5xl lg:text-6xl">Hunter Douglas and Alta Window Treatments for the Salt Lake Area</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white sm:text-lg">Compare Hunter Douglas and Alta Window Fashions blinds and shades in your own Utah home. Your consultation is with a dealer who has sold Hunter Douglas for 20 years, and measuring and installation are handled by Hunter Douglas's own certified installation service for both brands.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedCta href="/book" event="ConsultCtaClick" className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-4 font-semibold text-charcoal hover:bg-gold-dark">Request a Free Consultation</TrackedCta>
              <a href="#cities" className="px-2 py-4 font-semibold text-white underline underline-offset-4">Find your city ↓</a>
            </div>
            <p className="mt-6 text-sm text-white/85">20 years as a Hunter Douglas dealer · Measured and installed by Hunter Douglas Installation Services</p>
          </div>
        </div>
      </div>
    </section>

    <section id="cities" className="container-luxe scroll-mt-24 py-14 md:py-20">
      <div className="mb-8 max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Eight Utah communities</p><h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Two brands, city by city</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">One service model across Utah, tuned to each community's homes. Choose your city for local details and starting points.</p></div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cities.map(c => <article key={c.href} className="border border-warm-gray-200 bg-cream p-7"><h3 className="font-serif text-2xl text-charcoal">{c.name}</h3><p className="mt-4 leading-relaxed text-warm-gray-700">{c.text}</p><Link href={c.href} className="mt-6 inline-block font-semibold underline underline-offset-4">Window treatments in {c.name} →</Link></article>)}</div>
    </section>

    <section className="bg-charcoal py-14 text-white md:py-20"><div className="container-luxe"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-gold">How Utah service works</p><h2 className="mt-4 font-serif text-3xl sm:text-4xl">No showroom. No guesswork.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-300">Luxe Window Works serves Utah by appointment, the same way it serves every market. Luxe handles selection and pricing with you, and Hunter Douglas's own certified installation service handles the measuring and installation locally, for Hunter Douglas and Alta products alike, backed by the manufacturer.</p></div><div className="mt-10 grid gap-8 md:grid-cols-3">{[
      ["Consultation in your home", "We visit your home with samples from both brands, look at the windows and furnishings, and talk through glare, privacy and daily use. You compare fabrics and operating options in the room where they will be installed, and get a tailored quote for your selected products."],
      ["Professional measuring, guaranteed", "A certified installer from Hunter Douglas Installation Services takes precise measurements for your selected products, guaranteed for fit, before your order is placed."],
      ["Certified installation, manufacturer-backed", "Your treatments are installed through Hunter Douglas Installation Services by certified installers, backed by a one-year installation guarantee from the service, the Hunter Douglas lifetime warranty on Hunter Douglas shades, and a five-year warranty on PowerView."],
    ].map(([title, text], i) => <div key={title}><p className="text-sm text-gold">0{i + 1}</p><h3 className="mt-3 font-serif text-2xl">{title}</h3><p className="mt-4 leading-relaxed text-warm-gray-300">{text}</p></div>)}</div></div></section>

    <section className="container-luxe py-14 md:py-20">
      <div className="max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Why these two brands here</p><h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Built for Utah homes.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Utah homes ask a lot of their windows: high-elevation sun that fades floors in every season, west-facing glass across the Salt Lake Valley, and cold winters on the Wasatch Back. PowerView automation puts compatible Hunter Douglas shades on schedules, scenes and voice control. Cellular construction reins in heat and cold at the glass, and solar fabrics keep the view while cutting glare and UV. Where a Hunter Douglas collection is more than a room needs, Alta covers the same styles at a lower price, with the same certified measuring and installation behind it.</p><p className="mt-4 leading-relaxed text-warm-gray-700">We will help you decide which windows earn motorization and where a manual shade is the smarter spend. <Link href="/blog/how-much-do-hunter-douglas-window-treatments-cost" className="font-semibold underline underline-offset-4">See how Hunter Douglas pricing works →</Link></p></div>
      <div className="mt-9 grid gap-6 md:grid-cols-3">{collections.map(c => <article key={c.collection} className="border border-warm-gray-200 bg-cream p-7"><p className="text-sm text-warm-gray-700">{c.collection}</p><h3 className="mt-3 font-serif text-2xl text-charcoal">{c.name}</h3><p className="mt-4 leading-relaxed text-warm-gray-700">{c.text}</p>{c.anchor
        ? <Link href={`/products/hunter-douglas#${c.anchor}`} className="mt-6 inline-block font-semibold underline underline-offset-4">Explore {c.collection} →</Link>
        : <Link href="/book" className="mt-6 inline-block font-semibold underline underline-offset-4">Compare Alta during your consultation →</Link>}</article>)}</div>
      <p className="mt-8 text-warm-gray-700">Prefer roller shades, wood blinds or shutters? <Link href="/products/hunter-douglas#collections" className="font-semibold underline underline-offset-4">Explore the full Hunter Douglas collection.</Link></p>
    </section>

    <section aria-labelledby="utah-google-reviews" className="bg-cream/50 py-14 md:py-20">
      <div className="container-luxe max-w-4xl">
        <p className="text-xs uppercase tracking-[.18em] text-gold-dark">Google Reviews</p>
        <h2 id="utah-google-reviews" className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">Rated {BUSINESS.google.rating.toFixed(1)} on Google.</h2>
        <p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Luxe Window Works holds a {BUSINESS.google.rating.toFixed(1)} rating across {BUSINESS.google.reviewCount} Google reviews. A review belongs to the business, not to one service area: the same dealer and the same standard, in every market we serve.</p>
        <p className="mt-8"><a href={BUSINESS.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">Read all {BUSINESS.google.reviewCount} reviews on Google</a></p>
      </div>
    </section>

    <section className="container-luxe max-w-4xl py-14 md:py-20"><h2 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your Utah Hunter Douglas and Alta questions, answered.</h2>{faqs.map(f => <details key={f.question} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer pr-4 text-lg font-semibold text-charcoal">{f.question}</summary><p className="mt-4 leading-relaxed text-warm-gray-700">{f.answer}</p></details>)}</section>

    <section className="bg-cream py-14 text-center md:py-20"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Let's find the right light for your Utah home.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Book your free consultation in the Salt Lake area. We will bring the samples and help you take the next step.</p><div className="mt-8"><BookButton /></div><p className="mt-5"><TrackedCta href={BUSINESS.phoneHref} event="PhoneClick" className="underline underline-offset-4">Call {BUSINESS.phone}</TrackedCta></p><p className="mt-8 text-sm text-warm-gray-700"><Link href="/areas" className="underline underline-offset-4">See all the areas we serve</Link> · Start with our largest Utah city: <Link href="/areas/salt-lake-city" className="underline underline-offset-4">Window treatments in Salt Lake City</Link></p></div></section>
  </>;
}
