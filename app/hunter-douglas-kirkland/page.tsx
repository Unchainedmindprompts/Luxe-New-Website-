import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TrackedCta } from "@/components/TrackedCta";
import { BUSINESS } from "@/lib/constants";
import { cityRef } from "@/lib/cities";
import { HUNTER_DOUGLAS } from "@/lib/hunter-douglas";

const PAGE = `${BUSINESS.url}/hunter-douglas-kirkland`;
const MEDIA = "/images/hunter-douglas/installations";
const HERO = "/images/luxe-completed-installation.webp";
const description = "Hunter Douglas in-home consultations in Kirkland, WA with Luxe Window Works. Sheer shades for lake light, samples in your home, and certified measuring and installation through Hunter Douglas Installation Services.";
const faqs = [
  { question: "Do you have a Hunter Douglas showroom in Kirkland?", answer: "Luxe Window Works is based in Post Falls, Idaho and serves Kirkland by appointment. We do not have a Kirkland showroom. We bring samples to your home so you can compare them in your own light, and measuring and installation are performed through Hunter Douglas Installation Services by certified installers." },
  { question: "Do you offer Hunter Douglas consultations in Kirkland?", answer: "Yes. Luxe Window Works is an authorized Hunter Douglas dealer serving Kirkland with free in-home consultations by appointment. Mark, Luxe’s owner, sold Hunter Douglas on the Eastside for years and has been a Hunter Douglas dealer for 20 years." },
  { question: "Can I keep my Lake Washington view and still control glare?", answer: "Yes. Silhouette sheer shades diffuse incoming light while preserving a daytime view, and solar shades filter glare and UV at an openness level you choose. We compare both in your west-facing rooms during the consultation so you can see the trade-off in your own light." },
  { question: "How much do Hunter Douglas blinds and shades cost?", answer: "Pricing depends on the collection, fabric, window sizes and operating system. Your consultation includes a quote for your selected products, and measuring and installation through Hunter Douglas Installation Services are arranged as part of your order. We can compare options room by room to help you prioritize your budget." },
  { question: "Can you help me choose PowerView motorized shades?", answer: "Yes. We discuss how you want to control your shades, which windows you want to automate and the power options for your selected products. PowerView also connects with popular smart-home systems and voice assistants, and we confirm compatibility as part of your quote." },
  { question: "Who handles measurement and installation?", answer: "Measuring and installation are performed through Hunter Douglas Installation Services, Hunter Douglas’s own certified installation service. Measurements are guaranteed for fit. Installation carries a one-year installation guarantee from the service, your shades carry the Hunter Douglas lifetime warranty, and PowerView carries a five-year warranty." },
];
const gallery = [
  { file: "living-room-privacy.webp", alt: "Hunter Douglas shades balancing privacy and daylight in a bright living room", width: 1800, height: 1350 },
  { file: "sheer-shades-sitting-room.webp", alt: "Hunter Douglas sheer shades filtering daylight beside a sitting area and stone fireplace", width: 1800, height: 1350 },
  { file: "bathroom-roman-shades.webp", alt: "Hunter Douglas fabric shades above a freestanding bathtub", width: 1050, height: 1400 },
];
const collections = [
  { name: "Soft light & a view", collection: "Silhouette® sheer shades", anchor: "silhouette", text: "Compare sheer fabrics and adjustable vanes for lake-facing rooms in Juanita and Houghton, where the view is the point of the window." },
  { name: "Texture & tailored folds", collection: "Vignette® Roman shades", anchor: "vignette", text: "Explore the warmth of fabric for Kirkland’s established neighborhoods, from quiet neutrals to a more expressive finish." },
  { name: "Comfort & privacy", collection: "Duette® cellular shades", anchor: "duette", text: "Consider cellular construction alongside your insulation, street privacy and light-control priorities in Rose Hill and Finn Hill." },
];
const siblings = [
  { label: "Bellevue", href: "/hunter-douglas-bellevue" },
  { label: "Sammamish", href: "/hunter-douglas-sammamish" },
  { label: "Issaquah", href: "/hunter-douglas-issaquah" },
  { label: "Renton", href: "/hunter-douglas-renton" },
  { label: "Maple Valley", href: "/hunter-douglas-maple-valley" },
  { label: "Coeur d’Alene", href: "/hunter-douglas-coeur-d-alene" },
];

export const metadata: Metadata = {
  title: "Hunter Douglas Dealer in Kirkland | Luxe Window Works",
  description,
  alternates: { canonical: PAGE },
  openGraph: { title: "Hunter Douglas Dealer in Kirkland | Luxe Window Works", description, url: PAGE, images: [{ url: HERO, width: 2048, height: 1152, alt: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works" }] },
  twitter: { card: "summary_large_image", title: "Hunter Douglas Dealer in Kirkland | Luxe Window Works", description, images: [HERO] },
};

function BookButton({ children = "Book Your Free Consultation" }: { children?: React.ReactNode }) {
  return <TrackedCta href="/book" event="ConsultCtaClick" className="inline-block rounded-full bg-charcoal px-7 py-4 text-center font-semibold text-white">{children}</TrackedCta>;
}

export default function HunterDouglasKirklandPage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "WebPage", "@id": `${PAGE}#webpage`, url: PAGE, name: "Hunter Douglas Window Treatments in Kirkland", description, isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: [{ "@id": `${BUSINESS.url}/products/hunter-douglas#service` }, { "@id": HUNTER_DOUGLAS["@id"] }, cityRef("Kirkland")], spatialCoverage: cityRef("Kirkland"), breadcrumb: { "@id": `${PAGE}#breadcrumb` }, primaryImageOfPage: { "@id": `${PAGE}#primaryimage` } },
      { "@type": "ImageObject", "@id": `${PAGE}#primaryimage`, contentUrl: `${BUSINESS.url}${HERO}`, width: 2048, height: 1152, caption: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works", creator: { "@type": "Organization", name: "Luxe Window Works", url: BUSINESS.url }, creditText: "Luxe Window Works" },
      { "@type": "FAQPage", "@id": `${PAGE}#faq`, isPartOf: { "@id": `${PAGE}#webpage` }, mainEntity: faqs.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      { "@type": "BreadcrumbList", "@id": `${PAGE}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url }, { "@type": "ListItem", position: 2, name: "Kirkland", item: `${BUSINESS.url}/areas/kirkland` }, { "@type": "ListItem", position: 3, name: "Hunter Douglas", item: PAGE }] },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Kirkland", href: "/areas/kirkland" }, { label: "Hunter Douglas" }]} />
    <section aria-label="Hunter Douglas window treatments in Kirkland" className="bg-charcoal">
      <div className="relative isolate w-full overflow-hidden">
        <Image src={HERO} alt="Hunter Douglas Vignette Roman Shades installed by Luxe Window Works in a living room with timber beams and a stone fireplace" fill priority sizes="100vw" quality={90} className="object-cover object-[35%_center] md:object-center" />
        <div aria-hidden="true" className="absolute inset-0 bg-black/35 md:bg-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/20 md:to-transparent" />
        <div className="relative z-10 mx-auto flex min-h-[560px] max-w-[1440px] flex-col justify-center px-6 pt-16 pb-40 sm:px-10 md:min-h-[640px] md:pt-24 md:pb-36">
          <div className="max-w-2xl text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">Hunter Douglas · Kirkland, Washington</p>
            <h1 className="font-serif text-4xl leading-[1.1] text-white text-balance sm:text-5xl lg:text-6xl">Hunter Douglas Window Treatments in Kirkland</h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white sm:text-lg">Compare Hunter Douglas blinds, shades, and shutters in your own Kirkland home, with sheer and solar options chosen for Lake Washington light. Luxe is based in Post Falls and serves Kirkland by appointment, with measuring and installation through Hunter Douglas Installation Services.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <TrackedCta href="/book" event="ConsultCtaClick" className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-4 font-semibold text-charcoal hover:bg-gold-dark">Request a Free Consultation</TrackedCta>
              <a href="#installations" className="px-2 py-4 font-semibold text-white underline underline-offset-4">See our installations ↓</a>
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

    <section id="installations" className="container-luxe scroll-mt-24 py-14 md:py-20">
      <div className="mb-8 max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Our work, in real homes</p><h2 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">Hunter Douglas Installations</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Explore the light, textures and finishing details of our Hunter Douglas installations, from sheers that keep a water view open to shades that close a room down for the night.</p></div>
      <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Image src={`${MEDIA}/motorized-bedroom-shades.webp`} alt="Hunter Douglas shades on bedroom windows and French doors" width={1800} height={1350} sizes="(min-width: 1024px) 60vw, 100vw" className="w-full rounded-sm" />
        <div className="lg:pt-4"><h3 className="font-serif text-2xl text-charcoal sm:text-3xl">Light and privacy, at your fingertips.</h3><p className="mt-5 leading-relaxed text-warm-gray-700">From morning light to evening privacy, motorized shades make changing the feel of a room simple. We’ll help you explore PowerView® automation for compatible Hunter Douglas treatments and choose controls that suit your routine.</p><Link href="/blog/why-we-love-hunter-douglas-powerview-motorized-shades" className="mt-6 inline-block font-semibold underline underline-offset-4">Explore PowerView with Luxe →</Link></div>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-3">{gallery.map(p => <Image key={p.file} src={`${MEDIA}/${p.file}`} alt={p.alt} width={p.width} height={p.height} sizes="(min-width: 640px) 33vw, 100vw" className="aspect-[4/5] w-full rounded-sm object-cover" />)}</div>
    </section>

    <section className="bg-charcoal py-14 text-white md:py-20"><div className="container-luxe"><div className="max-w-2xl"><p className="text-xs uppercase tracking-[.18em] text-gold">Kirkland, we bring the samples to you</p><h2 className="mt-4 font-serif text-3xl sm:text-4xl">Choose in the light you live in.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-300">There is no showroom trip. We visit your Kirkland home with samples, look at the windows and furnishings, and talk through waterfront light, view, and privacy. You can compare fabrics and operating options in the room where they will be installed.</p></div><div className="mt-10 grid gap-8 md:grid-cols-3">{[
      ["Compare samples", "See colors and textures alongside your floors, walls and furniture. Talk through view, glare and how much privacy you want in each room."],
      ["Get a tailored quote", "We confirm your selected products, fabrics and controls and prepare your quote. A certified Hunter Douglas installer then takes precise measurements, guaranteed for fit, before your order is placed."],
      ["Enjoy certified installation", "Your treatments are installed through Hunter Douglas Installation Services by certified installers, backed by a one-year installation guarantee from the service and the Hunter Douglas lifetime warranty on the shades."],
    ].map(([title, text], i) => <div key={title}><p className="text-sm text-gold">0{i + 1}</p><h3 className="mt-3 font-serif text-2xl">{title}</h3><p className="mt-4 leading-relaxed text-warm-gray-300">{text}</p></div>)}</div></div></section>

    <section className="container-luxe py-14 md:py-20"><div className="max-w-2xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Start with what your room needs.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">You don’t need to choose a collection before we meet. These are a few starting points for your consultation.</p></div><div className="mt-9 grid gap-6 md:grid-cols-3">{collections.map(c => <article key={c.anchor} className="border border-warm-gray-200 bg-cream p-7"><p className="text-sm text-warm-gray-700">{c.collection}</p><h3 className="mt-3 font-serif text-2xl text-charcoal">{c.name}</h3><p className="mt-4 leading-relaxed text-warm-gray-700">{c.text}</p><Link href={`/products/hunter-douglas#${c.anchor}`} className="mt-6 inline-block font-semibold underline underline-offset-4">Explore {c.collection} →</Link></article>)}</div><p className="mt-8 text-warm-gray-700">Prefer roller shades, wood blinds or shutters? <Link href="/products/hunter-douglas#collections" className="font-semibold underline underline-offset-4">Explore the full Hunter Douglas collection.</Link></p></section>

    <section className="bg-cream py-14 md:py-20"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Hunter Douglas pricing for your Kirkland home</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Your window sizes, fabric, collection and controls determine the price. We’ll talk through your priorities at home and prepare a quote for your selected products, with measuring and installation arranged through Hunter Douglas Installation Services.</p><p className="mt-4 leading-relaxed text-warm-gray-700">Starting with the lake-facing rooms in Houghton, or privacy for a Rose Hill family home? We can help you decide where to start and where added features will make the most difference.</p><div className="mt-7"><BookButton>Compare Options at Home</BookButton></div></div></section>

    <section className="container-luxe max-w-4xl py-14 md:py-20"><h2 className="mb-8 font-serif text-3xl text-charcoal sm:text-4xl">Your Hunter Douglas questions, answered.</h2>{faqs.map(f => <details key={f.question} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer pr-4 text-lg font-semibold text-charcoal">{f.question}</summary><p className="mt-4 leading-relaxed text-warm-gray-700">{f.answer}</p></details>)}</section>
    <section className="bg-cream py-14 text-center md:py-20"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl text-charcoal sm:text-4xl">Let’s find the right light for your home.</h2><p className="mt-5 text-lg leading-relaxed text-warm-gray-700">Book your free Hunter Douglas consultation in Kirkland. We’ll bring the samples and help you take the next step.</p><div className="mt-8"><BookButton /></div><p className="mt-5"><TrackedCta href={BUSINESS.phoneHref} event="PhoneClick" className="underline underline-offset-4">Call {BUSINESS.phone}</TrackedCta></p><p className="mt-8 text-sm text-warm-gray-700"><Link href="/areas/kirkland" className="underline underline-offset-4">More window treatment options in Kirkland</Link></p><p className="mt-4 text-sm text-warm-gray-700">New here? Start with the <Link href="/eastside" className="underline underline-offset-4">Eastside overview</Link> to see how Hunter Douglas service works across all six cities.</p><p className="mt-4 text-sm text-warm-gray-700">Hunter Douglas in other cities we serve: {siblings.map((s, i) => <span key={s.href}>{i > 0 && " · "}<Link href={s.href} className="underline underline-offset-4">{s.label}</Link></span>)}</p></div></section>
  </>;
}
