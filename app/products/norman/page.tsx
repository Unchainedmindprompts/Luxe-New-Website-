import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RelatedDecisionArticles } from "@/components/RelatedDecisionArticles";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { BUSINESS, SERVICE_AREAS } from "@/lib/constants";
import { cityRef } from "@/lib/cities";
import { NORMAN_BRAND, NORMAN_CATEGORIES, NORMAN_FAQS, NORMAN_URL } from "@/lib/norman";

const NORMAN_PAGE = `${BUSINESS.url}/products/norman`;

export const metadata: Metadata = {
  title: "Norman Shutters & Blinds | Luxe Window Works",
  description: "Explore Norman shutters and SmartPrivacy blinds with Luxe Window Works, a Norman dealer since 2009. Normandy hardwood, Woodlore and Woodlore Plus composite, InvisibleTilt, and door shutters, with free in-home consultations, custom measurements, and installation in North Idaho, including Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.",
  alternates: { canonical: NORMAN_URL },
  openGraph: { title: "Discover Norman | Luxe Window Works", description: "Premium craftsmanship. Personal service. Explore Norman shutters and blinds with your Norman dealer since 2009.", url: NORMAN_URL, images: ["/images/norman-shutters-living-room.jpeg"] },
};

export default function NormanPage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "CollectionPage", "@id": `${NORMAN_PAGE}#webpage`, url: NORMAN_URL, name: "Norman Shutters and Blinds", description: metadata.description, isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: [{ "@id": NORMAN_BRAND["@id"] }, { "@id": `${NORMAN_PAGE}#service` }], breadcrumb: { "@id": `${NORMAN_PAGE}#breadcrumb` }, mainEntity: { "@type": "ItemList", name: "Norman Product Lines", numberOfItems: NORMAN_CATEGORIES.length, itemListElement: NORMAN_CATEGORIES.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `${NORMAN_PAGE}#${p.id}` })) } },
      { "@type": "Service", "@id": `${NORMAN_PAGE}#service`, url: NORMAN_URL, name: "Norman Consultation and Installation", serviceType: "Custom Window Treatments", brand: { "@id": NORMAN_BRAND["@id"] }, provider: { "@id": `${BUSINESS.url}/#business` }, areaServed: SERVICE_AREAS.map(a => cityRef(a.name)), description: "In-home Norman product guidance, professional measurements and installation, led in North Idaho in Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.", mainEntityOfPage: { "@id": `${NORMAN_PAGE}#webpage` } },
      { "@type": "FAQPage", "@id": `${NORMAN_PAGE}#faq`, isPartOf: { "@id": `${NORMAN_PAGE}#webpage` }, mainEntity: NORMAN_FAQS.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      { "@type": "BreadcrumbList", "@id": `${NORMAN_PAGE}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url }, { "@type": "ListItem", position: 2, name: "Products", item: `${BUSINESS.url}/products` }, { "@type": "ListItem", position: 3, name: "Norman", item: NORMAN_URL }] },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Norman" }]} />
    <section className="bg-cream grid lg:grid-cols-2">
      <div className="px-6 sm:px-10 lg:px-14 xl:px-20 py-12 sm:py-16 lg:py-20 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Your Norman dealer since 2009</p>
        <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl leading-[1.08] text-charcoal mt-5">Norman.<br /><span className="text-warm-gray-700">The personal<br className="hidden xl:block" /> touch of Luxe.</span></h1>
        <p className="mt-7 text-lg text-warm-gray-700 leading-relaxed max-w-xl">Shutters built to last decades, measured to fit your exact opening, and finished with the kind of care North Idaho homes deserve. Let us find the Norman line that fits each room.</p>
        <div className="mt-8 flex flex-wrap gap-4"><Link href="/book" className="rounded-full bg-charcoal text-white px-7 py-4 font-semibold">Book Your Free Consultation</Link><a href="#collections" className="px-2 py-4 font-semibold text-charcoal underline underline-offset-4">Explore the lines ↓</a></div>
      </div>
      <figure className="relative min-h-[340px] sm:min-h-[460px] lg:min-h-[640px]">
        <Image src="/images/norman-shutters-living-room.jpeg" alt="Norman shutters installed in a bright North Idaho living room by Luxe Window Works" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        <figcaption className="absolute left-5 right-5 bottom-5 w-fit max-w-[calc(100%-2.5rem)] bg-charcoal/85 text-white rounded-md p-4"><p className="text-sm font-semibold">Norman shutters</p><p className="mt-1 text-xs">An actual Luxe installation in North Idaho</p></figcaption>
      </figure>
    </section>
    <section className="container-luxe py-14 md:py-20 text-center max-w-3xl"><p className="uppercase tracking-[.18em] text-xs text-warm-gray-700">A Norman partner since 2009</p><h2 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4">Start with the room.<br />We will help with the line.</h2><p className="mt-6 text-lg leading-relaxed text-warm-gray-700">Real hardwood for the rooms where grain matters. Composite for the baths, kitchens, and lake homes where moisture is part of life. We bring the samples, talk through your priorities, and help you compare the Norman lines in your own light, room by room. You can also compare Norman alongside our other options on our <Link href="/products/shutters" className="text-charcoal underline underline-offset-4 font-semibold">plantation shutters page</Link>.</p></section>
    <section id="collections" aria-labelledby="collection-heading" className="scroll-mt-24 bg-cream py-12 md:py-16">
      <div className="container-luxe">
        <div className="max-w-3xl mb-8">
          <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Find your fit</p>
          <h2 id="collection-heading" className="font-serif text-3xl sm:text-4xl text-charcoal mt-3">The Norman lines we install.</h2>
          <p className="mt-5 text-lg text-warm-gray-700 leading-relaxed">From premium hardwood to moisture ready composite, explore the Norman lines below. We bring samples to homes across Coeur d’Alene, Post Falls, Hayden, Rathdrum, and Sandpoint and help compare finishes, louver sizes, and panel layouts.</p>
        </div>
        <nav aria-label="Norman product lines" className="flex flex-wrap gap-2 mb-10">
          {NORMAN_CATEGORIES.map(p => <a key={p.id} href={`#${p.id}`} className="rounded-full border border-warm-gray-300 bg-white px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{p.title}</a>)}
        </nav>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {NORMAN_CATEGORIES.map(p => <article id={p.id} key={p.id} className="scroll-mt-28 bg-white overflow-hidden flex flex-col border border-warm-gray-200 rounded-sm">
            <div className="relative aspect-[2/1]"><Image src={p.image} alt={p.alt} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /></div>
            <div className="p-6 lg:p-7 flex flex-col flex-1">
              <h3 className="font-serif text-2xl text-charcoal">{p.title}</h3>
              <p className="mt-3 text-sm font-semibold text-warm-gray-700 leading-relaxed">{p.collections}</p>
              <p className="mt-4 text-warm-gray-700 leading-relaxed">{p.description}</p>
              <Link href={p.href} className="mt-auto pt-6 text-sm font-semibold text-charcoal underline underline-offset-4" aria-label={`Explore ${p.title} with Luxe`}>Explore with Luxe →</Link>
            </div>
          </article>)}
        </div>
      </div>
    </section>
    <section className="bg-charcoal text-white py-14 md:py-20"><div className="container-luxe"><div className="max-w-2xl"><p className="text-gold text-xs uppercase tracking-[.18em]">Norman craftsmanship. Luxe care.</p><h2 className="font-serif text-3xl sm:text-4xl mt-4">Every detail, handled with care.</h2></div><div className="grid md:grid-cols-3 gap-8 lg:gap-14 mt-10">{[{ title: "Samples in your space", text: "Compare finishes, louver sizes and light control where you will live with them. We bring the showroom to you." }, { title: "Measured to fit", text: "Shutters need tighter tolerances than any other window treatment. We take precise laser measurements at multiple points and account for frames that North Idaho freeze thaw cycles have shifted out of square." }, { title: "Installed with care", text: "One local point of contact, professional installation and Luxe’s lifetime installation guarantee, with Norman’s limited lifetime warranty behind the product." }].map((x, i) => <div key={x.title}><p className="text-gold text-sm">0{i + 1}</p><h3 className="font-serif text-2xl mt-3">{x.title}</h3><p className="mt-4 text-warm-gray-300 leading-relaxed">{x.text}</p></div>)}</div></div></section>
    <section className="container-luxe py-14 md:py-20 max-w-3xl">
      <h2 className="font-serif text-3xl text-charcoal">Norman pricing, measured for your home.</h2>
      <p className="mt-5 text-lg text-warm-gray-700 leading-relaxed">Plantation shutters are made for the opening, so a useful quote starts with the window dimensions, the line and material, the frame, and the panel layout. Specialty shapes, door applications, and the way the panels need to open can change the price. We compare those details in your home before preparing your quote.</p>
      <p className="mt-4 text-warm-gray-700 leading-relaxed">Professional measurements and installation are included in your written quote after a free in-home consultation. If SmartPrivacy blinds are part of the project, we confirm the slat size, finish, and controls for those windows in the same visit, whether you are considering one room or the whole home.</p>
      <div className="mt-6 flex flex-col items-start gap-4"><Link href="/book" className="font-semibold underline underline-offset-4">Request your Norman consultation →</Link><Link href="/products/shutters" className="underline underline-offset-4">Explore plantation shutters →</Link></div>
    </section>
    <section aria-labelledby="norman-google-review" className="bg-cream/50 py-14 md:py-20">
      <div className="container-luxe max-w-4xl">
        <p className="text-xs uppercase tracking-[.18em] text-gold-dark">Google Reviews</p>
        <h2 id="norman-google-review" className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">A Coeur d’Alene Norman shutter project, in the client’s own words.</h2>
        <p className="mt-5 text-lg leading-relaxed text-warm-gray-700">For this Coeur d’Alene Norman shutter project, C P described a detailed consultation and our coordination of early measurements with the builder so the shutters could be ready before move-in.</p>
        <article id="cda-norman-shutters-review" className="mt-9 scroll-mt-28 bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8">
          <p className="text-gold mb-3" aria-label="5 out of 5 stars"><span aria-hidden="true">★★★★★</span></p>
          <h3 className="font-serif text-xl text-charcoal mb-4">Norman shutters</h3>
          <blockquote className="space-y-4 text-warm-gray-700 leading-relaxed">
            <p>Mark did an above and beyond job from beginning to end. Great customer service and installation, and we are very happy we decided to go with him. Highly recommended.</p>
            <p>We wanted Norman shutters installed and had a multitude of questions. He very patiently spent around two hours with us answering all our questions and making recommendations. He did all the legwork of making arrangements with the builders to get inside the house early to take measurements so that the shutters would be ready in time for before we moved in. He made excellent recommendations in reference to aesthetics, practical daily use of the shutters and from an installer’s perspective as he does his own installs.</p>
            <p>In short, you can’t go wrong with Mark.</p>
          </blockquote>
          <p className="mt-5 font-semibold text-charcoal">C P</p>
          <p className="text-sm text-warm-gray-600">Coeur d’Alene client · Google review</p>
          <Link href="/products/shutters" className="inline-block mt-5 text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">Explore Norman shutters</Link>
        </article>
        <p className="mt-8"><a href={BUSINESS.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">View Luxe Window Works on Google</a></p>
      </div>
    </section>
    <RelatedDecisionArticles articles={[{ title: "Norman Shutters in North Idaho: Premium Craftsmanship from Luxe Window Works", slug: "norman-shutters-in-north-idaho-premium-craftsmanship-from-luxe-window-works" }, { title: "The Ultimate Shutter Guide for Northern Idaho Homes: Choosing the Right Frame, Material & Configuration", slug: "the-ultimate-shutter-guide-for-northern-idaho-homes-choosing-the-right-frame-material-configuration" }, { title: "Woodlore Plus Shutters in North Idaho: Why Composite Beats Wood for Coeur d'Alene Homes", slug: "woodlore-plus-shutters-north-idaho" }, { title: "Why the Norman® Shutter BiFold 180 Is the Perfect Solution for Bi-Folding Doors", slug: "norman-bifold-180-shutters-for-bi-folding-doors-in-north-idaho" }, { title: "Why Norman PerfectSheer Shades Are the Ultimate Window Treatment for Luxury Living", slug: "norman-perfectsheer-shades-for-luxury-homes-in-north-idaho" }, { title: "The Hidden Value of Plantation Shutters: Why They’re the Smartest Upgrade for Luxury Homes in Northern Idaho", slug: "the-hidden-value-of-plantation-shutters-in-northern-idaho-homes" }]} />
    <section className="container-luxe py-14 md:py-20 max-w-4xl"><h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-8">A few questions, answered.</h2>{NORMAN_FAQS.map(f => <details key={f.question} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer text-charcoal font-semibold text-lg pr-4">{f.question}</summary><p className="mt-4 text-warm-gray-700 leading-relaxed">{f.answer}</p></details>)}</section>
    <section className="bg-cream py-14 md:py-20 text-center"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl sm:text-4xl text-charcoal">Let’s find the right Norman line for your home.</h2><p className="mt-6 text-lg text-warm-gray-700 leading-relaxed">See the finishes. Compare the louver sizes. In your own home.<br />Serving Coeur d’Alene, Post Falls, Hayden, Rathdrum and Sandpoint.</p><Link href="/book" className="inline-block mt-8 rounded-full bg-charcoal text-white font-semibold px-8 py-4">Schedule a Free In-Home Consultation</Link><p className="mt-5"><a href={BUSINESS.phoneHref} className="text-charcoal underline underline-offset-4">Call {BUSINESS.phone}</a></p></div></section>
  </>;
}
