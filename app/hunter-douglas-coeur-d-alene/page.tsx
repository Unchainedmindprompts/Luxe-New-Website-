import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TrackedCta } from "@/components/TrackedCta";
import { BUSINESS } from "@/lib/constants";
import { cityRef } from "@/lib/cities";
import { HUNTER_DOUGLAS } from "@/lib/hunter-douglas";

const PAGE = `${BUSINESS.url}/hunter-douglas-coeur-d-alene`;
const MEDIA = "/images/hunter-douglas/installations";
const description = "Hunter Douglas blinds, shades and PowerView automation in Coeur d’Alene. Explore samples at home with Luxe Window Works, with expert measuring and installation.";
const faqs = [
  { question: "Do you offer Hunter Douglas consultations in Coeur d’Alene?", answer: "Yes. Luxe Window Works is an authorized Hunter Douglas dealer serving Coeur d’Alene with free in-home consultations. We bring samples to you, measure your windows and help you compare products, fabrics and controls." },
  { question: "Can I compare Hunter Douglas samples in my home?", answer: "Yes. We help you compare fabrics, colors and textures in your own light, alongside your flooring and furnishings. Tell us which rooms you are considering and any collections that interest you when you book." },
  { question: "How much do Hunter Douglas blinds and shades cost?", answer: "Pricing depends on the collection, fabric, window sizes and operating system. Your consultation includes professional measurements and a quote for your selected products and installation. We can compare options room by room to help you prioritize your budget." },
  { question: "Can you help me choose PowerView motorized shades?", answer: "Yes. We discuss how you want to control your shades, which windows you want to automate and the power options for your selected products. We confirm product compatibility and any accessories as part of your quote." },
  { question: "Who handles measurement and installation?", answer: "Luxe Window Works handles professional measurements and installation. Mark brings 24 years of window-treatment experience, and your installation is backed by Luxe’s lifetime installation guarantee." },
];
const gallery = [
  { file: "living-room-privacy.webp", alt: "Hunter Douglas shades balancing privacy and daylight in a bright living room", width: 1800, height: 1350 },
  { file: "sheer-shades-sitting-room.webp", alt: "Hunter Douglas sheer shades filtering daylight beside a sitting area and stone fireplace", width: 1800, height: 1350 },
  { file: "bathroom-roman-shades.webp", alt: "Hunter Douglas fabric shades above a freestanding bathtub", width: 1050, height: 1400 },
];
const collections = [
  { name: "Soft light & a view", collection: "Silhouette® sheer shades", anchor: "silhouette", text: "Compare sheer fabrics and adjustable light control for the rooms where you spend your day." },
  { name: "Texture & tailored folds", collection: "Vignette® Roman shades", anchor: "vignette", text: "Explore the warmth of fabric, from quiet neutrals to a more expressive finish." },
  { name: "Comfort & privacy", collection: "Duette® cellular shades", anchor: "duette", text: "Consider cellular construction alongside your room’s insulation, privacy and light-control priorities." },
];

export const metadata: Metadata = {
  title: "Hunter Douglas in Coeur d’Alene | Luxe Window Works",
  description,
  alternates: { canonical: PAGE },
  openGraph: { title: "Hunter Douglas in Coeur d’Alene | Luxe Window Works", description, url: PAGE, images: [{ url: `${MEDIA}/light-filtering-window-wall.webp`, width: 1800, height: 1013, alt: "Hunter Douglas installation by Luxe Window Works" }] },
  twitter: { card: "summary_large_image", title: "Hunter Douglas in Coeur d’Alene | Luxe Window Works", description, images: [`${MEDIA}/light-filtering-window-wall.webp`] },
};

function BookButton({ children = "Book Your Free Consultation" }: { children?: React.ReactNode }) {
  return <TrackedCta href="/book" event="ConsultCtaClick" className="inline-block rounded-full bg-charcoal px-7 py-4 text-center font-semibold text-white">{children}</TrackedCta>;
}

export default function HunterDouglasCoeurDAlenePage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", "@id": `${PAGE}#webpage`, url: PAGE, name: "Hunter Douglas Window Treatments in Coeur d’Alene", description, isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: [{ "@id": `${BUSINESS.url}/products/hunter-douglas#service` }, { "@id": HUNTER_DOUGLAS["@id"] }, cityRef("Coeur d'Alene")], spatialCoverage: cityRef("Coeur d'Alene"), breadcrumb: { "@id": `${PAGE}#breadcrumb` }, primaryImageOfPage: { "@id": `${PAGE}#primaryimage` } },
      { "@type": "ImageObject", "@id": `${PAGE}#primaryimage`, contentUrl: `${BUSINESS.url}${MEDIA}/light-filtering-window-wall.webp`, width: 1800, height: 1013, caption: "Hunter Douglas Installations", creator: { "@id": `${BUSINESS.url}/#business` } },
      { "@type": "FAQPage", "@id": `${PAGE}#faq`, isPartOf: { "@id": `${PAGE}#webpage` }, mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      { "@type": "BreadcrumbList", "@id": `${PAGE}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url }, { "@type": "ListItem", position: 2, name: "Coeur d’Alene", item: `${BUSINESS.url}/areas/coeur-d-alene` }, { "@type": "ListItem", position: 3, name: "Hunter Douglas", item: PAGE }] },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Coeur d’Alene", href: "/areas/coeur-d-alene" }, { label: "Hunter Douglas" }]} />
    <section className="grid bg-cream lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 xl:px-16 xl:py-20">
        <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Your authorized Hunter Douglas dealer</p>
        <h1 className="mt-5 font-serif text-4xl leading-[1.1] text-charcoal sm:text-5xl xl:text-6xl">Hunter Douglas Window Treatments in Coeur d’Alene</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-warm-gray-700">Beautiful light. Privacy when you want it. A finish that feels like home. Explore Hunter Douglas blinds, shades and shutters with a personal, in-home consultation from Luxe.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5"><BookButton /><a href="#installations" className="font-semibold underline underline-offset-4">See our installations ↓</a></div>
        <p className="mt-6 text-sm text-warm-gray-700">24 years of experience · Lifetime installation guarantee</p>
      </div>
      <div className="relative min-h-[300px] sm:min-h-[420px] lg:min-h-[640px]"><Image src={`${MEDIA}/light-filtering-window-wall.webp`} alt="Hunter Douglas fabric shades along a window wall beside a stone fireplace" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-center" /></div>
    </section>

    <section id="installations" className="container-luxe scroll-mt-24 py-14 md:py-20">
      <div className="mb-8 max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Our work, in real homes</p><h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Hunter Douglas Installations</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">A closer look at the light, textures and finishing details. These are Hunter Douglas installations completed by Mark.</p></div>
      <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Image src={`${MEDIA}/motorized-bedroom-shades.webp`} alt="Hunter Douglas shades on bedroom windows and French doors" width={1800} height={1350} sizes="(min-width: 1024px) 60vw, 100vw" className="w-full rounded-sm" />
        <div className="lg:pt-4"><h3 className="font-serif text-2xl text-charcoal sm:text-3xl">Light and privacy, at your fingertips.</h3><p className="mt-5 leading-relaxed text-warm-gray-700">From morning light to evening privacy, motorized shades make changing the feel of a room simple. We’ll help you explore PowerView® automation for compatible Hunter Douglas treatments and choose controls that suit your routine.</p><Link href="/blog/why-we-love-hunter-douglas-powerview-motorized-shades" className="mt-6 inline-block font-semibold underline underline-offset-4">Explore PowerView with Luxe →</Link></div>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">{gallery.map(p => <Image key={p.file} src={`${MEDIA}/${p.file}`} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 640px) 33vw, 100vw" className="aspect-[4/5] w-full rounded-sm object-cover" />)}</div>
    </section>

    <section className="bg-charcoal py-14 text-white md:py-20"><div className="container-luxe"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-gold">Coeur d’Alene, we bring the samples to you</p><h2 className="mt-4 font-serif text-3xl sm:text-4xl">Choose in the light you live in.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-300">Your windows, furnishings and daily routines guide the choice. Mark brings 24 years of experience to help you work through the details in your own home.</p></div><div className="mt-10 grid gap-8 md:grid-cols-3">{[
      ["Compare samples", "See colors and textures alongside your floors, walls and furniture. Talk through privacy, glare and how much light you want in each room."],
      ["Get a tailored quote", "We measure your windows, check mounting details and compare your selected products and controls. You’ll know what is included before ordering."],
      ["Enjoy careful installation", "Luxe handles the fit, finishing details and operation of your new treatments, backed by our lifetime installation guarantee."],
    ].map(([title, text], i) => <div key={title}><p className="text-sm text-gold">0{i + 1}</p><h3 className="mt-3 font-serif text-2xl">{title}</h3><p className="mt-4 leading-relaxed text-warm-gray-300">{text}</p></div>)}</div></div></section>

    <section className="container-luxe py-14 md:py-20"><div className="max-w-2xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Start with what your room needs.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">You don’t need to choose a collection before we meet. These are a few starting points for your consultation.</p></div><div className="mt-9 grid gap-6 md:grid-cols-3">{collections.map(c => <article key={c.anchor} className="border border-warm-gray-200 bg-cream p-7"><p className="text-sm text-warm-gray-700">{c.collection}</p><h3 className="mt-3 font-serif text-2xl text-charcoal">{c.name}</h3><p className="mt-4 leading-relaxed text-warm-gray-700">{c.text}</p><Link href={`/products/hunter-douglas#${c.anchor}`} className="mt-6 inline-block font-semibold underline underline-offset-4">Explore {c.collection} →</Link></article>)}</div><p className="mt-8 text-warm-gray-700">Prefer roller shades, wood blinds or shutters? <Link href="/products/hunter-douglas#collections" className="font-semibold underline underline-offset-4">Explore the full Hunter Douglas collection.</Link></p></section>

    <section className="bg-cream py-14 md:py-20"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Hunter Douglas pricing for your CDA home</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Your window sizes, fabric, collection and controls determine the price. We’ll talk through your priorities, measure professionally and prepare a quote that includes installation.</p><p className="mt-4 leading-relaxed text-warm-gray-700">Focusing on one room first? Comparing manual and motorized options? We can help you decide where to start and where added features will make the most difference to your day.</p><div className="mt-7"><BookButton>Compare Options at Home</BookButton></div></div></section>

    <section className="container-luxe max-w-4xl py-14 md:py-20"><h2 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your Hunter Douglas questions, answered.</h2>{faqs.map(f => <details key={f.question} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer pr-4 text-lg font-semibold text-charcoal">{f.question}</summary><p className="mt-4 leading-relaxed text-warm-gray-700">{f.answer}</p></details>)}</section>
    <section className="bg-cream py-14 text-center md:py-20"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Let’s find the right light for your home.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Book your free Hunter Douglas consultation in Coeur d’Alene. We’ll bring the samples and help you take the next step.</p><div className="mt-8"><BookButton /></div><p className="mt-5"><TrackedCta href={BUSINESS.phoneHref} event="PhoneClick" className="underline underline-offset-4">Call {BUSINESS.phone}</TrackedCta></p><p className="mt-8 text-sm text-warm-gray-700"><Link href="/areas/coeur-d-alene" className="underline underline-offset-4">More window treatment options in Coeur d’Alene</Link></p></div></section>
  </>;
}
