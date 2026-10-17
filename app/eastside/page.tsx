import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TrackedCta } from "@/components/TrackedCta";
import { BUSINESS } from "@/lib/constants";
import { cityRef } from "@/lib/cities";
import { HUNTER_DOUGLAS } from "@/lib/hunter-douglas";

const PAGE = `${BUSINESS.url}/eastside`;
const HERO = "/images/luxe-completed-installation.webp";
const description = "Hunter Douglas window treatments for Seattle’s Eastside: Bellevue, Kirkland, Sammamish, Issaquah, Renton and Maple Valley. In-home consultations with a 20-year Hunter Douglas dealer; measuring and installation through Hunter Douglas Installation Services.";
const CITIES = ["Bellevue", "Kirkland", "Sammamish", "Issaquah", "Renton", "Maple Valley"];
const faqs = [
  { question: "Where do you serve on the Eastside?", answer: "Luxe Window Works serves Bellevue, Kirkland, Sammamish, Issaquah, Renton and Maple Valley with Hunter Douglas in-home consultations by appointment. Each city page linked above covers what we see most often in that community’s homes." },
  { question: "Do you have a showroom on the Eastside?", answer: "No. Luxe Window Works is based in Post Falls, Idaho and serves the Eastside by appointment. There is no showroom trip: we bring samples to your home so you can compare them in your own light, and measuring and installation are performed locally through Hunter Douglas Installation Services by certified installers." },
  { question: "Who handles measurement and installation?", answer: "Measuring and installation are performed through Hunter Douglas Installation Services, Hunter Douglas’s own certified installation service. Measurements are guaranteed for fit. Installation carries a one-year installation guarantee from the service, your shades carry the Hunter Douglas lifetime warranty, and PowerView carries a five-year warranty." },
  { question: "How much do Hunter Douglas blinds and shades cost?", answer: "Pricing depends on the collection, fabric, window sizes and operating system. Your free consultation includes help comparing products and controls for your rooms and a tailored quote for your selected products, with measuring and installation arranged as part of your order. We can compare options room by room to help you prioritize your budget." },
  { question: "Why buy through Luxe instead of a showroom?", answer: "Mark, Luxe’s owner, has been a Hunter Douglas dealer for 20 years and sold Hunter Douglas on the Eastside for years, so the guidance comes from deep familiarity with the product line and with Eastside homes. Luxe runs without a showroom, so your price carries the product and manufacturer-backed installation rather than retail overhead. You get the same Hunter Douglas products and warranties, with installation by Hunter Douglas’s own certified service." },
];
const cities = [
  { name: "Bellevue", href: "/hunter-douglas-bellevue", text: "West-facing glass on Lake Washington in Medina, Clyde Hill and Bridle Trails, and whole-home projects from West Bellevue to Crossroads." },
  { name: "Kirkland", href: "/hunter-douglas-kirkland", text: "Waterfront light and privacy in Juanita, Houghton and Rose Hill, where the view is the point of the room." },
  { name: "Sammamish", href: "/hunter-douglas-sammamish", text: "Large newer homes in Klahanie and around Pine Lake, where two-story windows call for motorization." },
  { name: "Issaquah", href: "/hunter-douglas-issaquah", text: "Newer construction in Issaquah Highlands, Talus and on Squak Mountain, where smart shades belong in the plan from the start." },
  { name: "Renton", href: "/hunter-douglas-renton", text: "Lake Washington’s south end, from Kennydale view homes to family rooms in Fairwood and the Renton Highlands." },
  { name: "Maple Valley", href: "/hunter-douglas-maple-valley", text: "Family homes around Lake Wilderness and Cherokee Bay, with privacy and light control for close neighbors." },
];
const collections = [
  { name: "Soft light & a view", collection: "Silhouette® sheer shades", anchor: "silhouette", text: "Compare sheer fabrics and adjustable vanes for west-facing rooms where the lake view matters and the afternoon sun is strong." },
  { name: "Texture & tailored folds", collection: "Vignette® Roman shades", anchor: "vignette", text: "Explore the warmth of fabric, from quiet neutrals to a more expressive finish for traditional Eastside interiors." },
  { name: "Comfort & privacy", collection: "Duette® cellular shades", anchor: "duette", text: "Consider cellular construction for insulation and heat control on large glass, alongside your privacy and light-control priorities." },
];

export const metadata: Metadata = {
  title: "Hunter Douglas Dealer for Seattle’s Eastside | Luxe Window Works",
  description,
  alternates: { canonical: PAGE },
  openGraph: { title: "Hunter Douglas Dealer for Seattle’s Eastside | Luxe Window Works", description, url: PAGE, images: [{ url: HERO, width: 2048, height: 1152, alt: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works" }] },
  twitter: { card: "summary_large_image", title: "Hunter Douglas Dealer for Seattle’s Eastside | Luxe Window Works", description, images: [HERO] },
};

function BookButton({ children = "Book Your Free Consultation" }: { children?: React.ReactNode }) {
  return <TrackedCta href="/book" event="ConsultCtaClick" className="inline-block rounded-full bg-charcoal px-7 py-4 text-center font-semibold text-white">{children}</TrackedCta>;
}

export default function EastsidePage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", "@id": `${PAGE}#webpage`, url: PAGE, name: "Hunter Douglas Window Treatments for Seattle’s Eastside", description, isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: [{ "@id": `${BUSINESS.url}/products/hunter-douglas#service` }, { "@id": HUNTER_DOUGLAS["@id"] }, ...CITIES.map(c => cityRef(c))], spatialCoverage: CITIES.map(c => cityRef(c)), breadcrumb: { "@id": `${PAGE}#breadcrumb` }, primaryImageOfPage: { "@id": `${PAGE}#primaryimage` } },
      { "@type": "ImageObject", "@id": `${PAGE}#primaryimage`, contentUrl: `${BUSINESS.url}${HERO}`, width: 2048, height: 1152, caption: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works", creator: { "@type": "Organization", name: "Luxe Window Works", url: BUSINESS.url }, creditText: "Luxe Window Works" },
      { "@type": "FAQPage", "@id": `${PAGE}#faq`, isPartOf: { "@id": `${PAGE}#webpage` }, mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      { "@type": "BreadcrumbList", "@id": `${PAGE}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url }, { "@type": "ListItem", position: 2, name: "Eastside", item: PAGE }] },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Eastside" }]} />
    <section aria-label="Hunter Douglas window treatments for Seattle’s Eastside" className="bg-charcoal">
      <div className="relative isolate w-full overflow-hidden">
        <Image src={HERO} alt="Hunter Douglas Vignette Roman Shades installed by Luxe Window Works in a living room with timber beams and a stone fireplace" fill priority sizes="100vw" quality={90} className="object-cover object-[35%_center] md:object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-black/35 md:bg-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-center px-6 pt-16 pb-40 sm:px-10 md:min-h-[640px] md:pt-24 md:pb-36">
          <div className="max-w-2xl text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">Hunter Douglas · Seattle’s Eastside</p>
            <h1 className="font-serif text-4xl leading-[1.1] text-white text-balance sm:text-5xl lg:text-6xl">Hunter Douglas Window Treatments for Seattle’s Eastside</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white sm:text-lg">Compare Hunter Douglas blinds, shades, and shutters in your own Eastside home. Your consultation is with a dealer who has sold Hunter Douglas for 20 years, including years here on the Eastside, and measuring and installation are handled by Hunter Douglas’s own certified installation service.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedCta href="/book" event="ConsultCtaClick" className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-4 font-semibold text-charcoal hover:bg-gold-dark">Request a Free Consultation</TrackedCta>
              <a href="#cities" className="px-2 py-4 font-semibold text-white underline underline-offset-4">Find your city ↓</a>
            </div>
            <p className="mt-6 text-sm text-white/85">20 years as a Hunter Douglas dealer · Measured and installed by Hunter Douglas Installation Services</p>
          </div>
        </div>
        <div className="absolute bottom-5 left-6 right-6 z-10 w-fit max-w-[calc(100%-3rem)] rounded-md bg-charcoal/80 px-4 py-3 text-white sm:left-10 sm:right-auto">
          <Image src="/images/brands/hunter-douglas-white-horizontal.png" alt="Hunter Douglas" width={2048} height={295} className="h-auto w-[180px] sm:w-[220px]" sizes="(min-width: 640px) 220px, 180px" />
          <p className="mt-2 text-[11px] leading-relaxed sm:text-xs">Vignette® Roman Shades by Hunter Douglas</p>
          <p className="mt-1 text-[10px] text-white/80 sm:text-[11px]">An actual Luxe Window Works installation</p>
        </div>
      </div>
    </section>

    <section id="cities" className="container-luxe scroll-mt-24 py-14 md:py-20">
      <div className="mb-8 max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Six Eastside communities</p><h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Hunter Douglas, city by city</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">One service model across the Eastside, tuned to each community’s homes. Choose your city for local details, starting points and pricing guidance.</p></div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cities.map(c => <article key={c.href} className="border border-warm-gray-200 bg-cream p-7"><h3 className="font-serif text-2xl text-charcoal">{c.name}</h3><p className="mt-4 leading-relaxed text-warm-gray-700">{c.text}</p><Link href={c.href} className="mt-6 inline-block font-semibold underline underline-offset-4">Hunter Douglas in {c.name} →</Link></article>)}</div>
    </section>

    <section className="bg-charcoal py-14 text-white md:py-20"><div className="container-luxe"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-gold">How Eastside service works</p><h2 className="mt-4 font-serif text-3xl sm:text-4xl">No showroom. No guesswork.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-300">Luxe Window Works is based in Post Falls, Idaho and serves the Eastside by appointment. You work directly with the dealer on selection and pricing, and Hunter Douglas’s own certified installation service handles the measuring and installation locally, backed by the manufacturer.</p></div><div className="mt-10 grid gap-8 md:grid-cols-3">{[
      ["Consultation in your home", "We visit your home with samples, look at the windows and furnishings, and talk through glare, privacy and daily use. You compare fabrics and operating options in the room where they will be installed, and get a tailored quote for your selected products."],
      ["Professional measuring, guaranteed", "A certified installer from Hunter Douglas Installation Services takes precise measurements for your selected products, guaranteed for fit, before your order is placed."],
      ["Certified installation, manufacturer-backed", "Your treatments are installed through Hunter Douglas Installation Services by certified installers, backed by a one-year installation guarantee from the service, the Hunter Douglas lifetime warranty on the shades, and a five-year warranty on PowerView."],
    ].map(([title, text], i) => <div key={title}><p className="text-sm text-gold">0{i + 1}</p><h3 className="mt-3 font-serif text-2xl">{title}</h3><p className="mt-4 leading-relaxed text-warm-gray-300">{text}</p></div>)}</div></div></section>

    <section className="container-luxe py-14 md:py-20">
      <div className="max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Why Hunter Douglas here</p><h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Built for Eastside homes.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Eastside homes ask a lot of their windows: two-story glass in Sammamish, west-facing lake walls in Bellevue and Kirkland, smart homes everywhere. PowerView automation puts compatible Hunter Douglas shades on schedules, scenes and voice control, and connects with popular smart-home systems. Cellular construction reins in the heat that builds on big glass, and sheer shades keep the view while cutting the glare.</p><p className="mt-4 leading-relaxed text-warm-gray-700">We’ll help you decide which windows earn motorization and where a manual shade is the smarter spend. <Link href="/blog/why-we-love-hunter-douglas-powerview-motorized-shades" className="font-semibold underline underline-offset-4">Explore PowerView with Luxe →</Link></p></div>
      <div className="mt-9 grid gap-6 md:grid-cols-3">{collections.map(c => <article key={c.anchor} className="border border-warm-gray-200 bg-cream p-7"><p className="text-sm text-warm-gray-700">{c.collection}</p><h3 className="mt-3 font-serif text-2xl text-charcoal">{c.name}</h3><p className="mt-4 leading-relaxed text-warm-gray-700">{c.text}</p><Link href={`/products/hunter-douglas#${c.anchor}`} className="mt-6 inline-block font-semibold underline underline-offset-4">Explore {c.collection} →</Link></article>)}</div>
      <p className="mt-8 text-warm-gray-700">Prefer roller shades, wood blinds or shutters? <Link href="/products/hunter-douglas#collections" className="font-semibold underline underline-offset-4">Explore the full Hunter Douglas collection.</Link></p>
    </section>

    <section className="container-luxe max-w-4xl py-14 md:py-20"><h2 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your Eastside Hunter Douglas questions, answered.</h2>{faqs.map(f => <details key={f.question} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer pr-4 text-lg font-semibold text-charcoal">{f.question}</summary><p className="mt-4 leading-relaxed text-warm-gray-700">{f.answer}</p></details>)}</section>

    <section className="bg-cream py-14 text-center md:py-20"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Let’s find the right light for your Eastside home.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Book your free Hunter Douglas consultation on the Eastside. We’ll bring the samples and help you take the next step.</p><div className="mt-8"><BookButton /></div><p className="mt-5"><TrackedCta href={BUSINESS.phoneHref} event="PhoneClick" className="underline underline-offset-4">Call {BUSINESS.phone}</TrackedCta></p><p className="mt-8 text-sm text-warm-gray-700"><Link href="/areas" className="underline underline-offset-4">See all the areas we serve</Link> · Start with our flagship city: <Link href="/hunter-douglas-bellevue" className="underline underline-offset-4">Hunter Douglas in Bellevue</Link></p></div></section>
  </>;
}
