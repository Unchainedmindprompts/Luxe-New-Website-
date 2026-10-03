import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RelatedDecisionArticles } from "@/components/RelatedDecisionArticles";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { BUSINESS, SERVICE_AREAS } from "@/lib/constants";
import { cityRef } from "@/lib/cities";
import { HD_CATEGORIES, HD_FAQS, HD_URL, HUNTER_DOUGLAS } from "@/lib/hunter-douglas";
import { RelatedVideos } from "@/components/RelatedVideos";
import { LUXE_VIDEOS, videoRef } from "@/lib/videos";

const HD_PAGE = `${BUSINESS.url}/products/hunter-douglas`;

export const metadata: Metadata = {
  title: "Hunter Douglas Collections in North Idaho | Luxe Window Works",
  description: "Explore Hunter Douglas shades, blinds, shutters, drapery and PowerView automation with Luxe Window Works. Free in-home consultations, custom measurements and installation in North Idaho.",
  alternates: { canonical: HD_URL },
  openGraph: { title: "Discover Hunter Douglas | Luxe Window Works", description: "Beautiful light. Personal service. Explore Hunter Douglas with your local North Idaho dealer.", url: HD_URL, images: ["/images/luxe-completed-installation.webp"] },
};

export default function HunterDouglasPage() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      { "@type": "CollectionPage", "@id": `${HD_PAGE}#webpage`, url: HD_URL, name: "Hunter Douglas Collections in North Idaho", description: metadata.description, isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: [{ "@id": HUNTER_DOUGLAS["@id"] }, { "@id": `${HD_PAGE}#service` }], breadcrumb: { "@id": `${HD_PAGE}#breadcrumb` }, mainEntity: { "@type": "ItemList", name: "Hunter Douglas Product Categories", numberOfItems: HD_CATEGORIES.length, itemListElement: HD_CATEGORIES.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, url: `${HD_PAGE}#${p.id}` })) } },
      { "@type": "Service", "@id": `${HD_PAGE}#service`, url: HD_URL, name: "Hunter Douglas Consultation and Installation", serviceType: "Custom Window Treatments", brand: { "@id": HUNTER_DOUGLAS["@id"] }, provider: { "@id": `${BUSINESS.url}/#business` }, areaServed: SERVICE_AREAS.map(a => cityRef(a.name)), description: "In-home Hunter Douglas product guidance, professional measurements and installation in North Idaho.", mainEntityOfPage: { "@id": `${HD_PAGE}#webpage` }, subjectOf: LUXE_VIDEOS.map(videoRef) },
      { "@type": "FAQPage", "@id": `${HD_PAGE}#faq`, isPartOf: { "@id": `${HD_PAGE}#webpage` }, mainEntity: HD_FAQS.map(f => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
      { "@type": "BreadcrumbList", "@id": `${HD_PAGE}#breadcrumb`, itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url }, { "@type": "ListItem", position: 2, name: "Products", item: `${BUSINESS.url}/products` }, { "@type": "ListItem", position: 3, name: "Hunter Douglas", item: HD_URL }] },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "Hunter Douglas" }]} />
    <section className="bg-cream grid lg:grid-cols-2">
      <div className="px-6 sm:px-10 lg:px-14 xl:px-20 py-12 sm:py-16 lg:py-20 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Your North Idaho Hunter Douglas dealer</p>
        <h1 className="font-serif text-4xl sm:text-5xl xl:text-6xl leading-[1.08] text-charcoal mt-5">Hunter Douglas.<br /><span className="text-warm-gray-700">The personal<br className="hidden xl:block" /> touch of Luxe.</span></h1>
        <p className="mt-7 text-lg text-warm-gray-700 leading-relaxed max-w-xl">The morning light. The view you love. The privacy you need at the end of the day. Let’s find the Hunter Douglas window treatments that make your home feel right.</p>
        <div className="mt-8 flex flex-wrap gap-4"><Link href="/book" className="rounded-full bg-charcoal text-white px-7 py-4 font-semibold">Book Your Free Consultation</Link><a href="#collections" className="px-2 py-4 font-semibold text-charcoal underline underline-offset-4">Explore the collection ↓</a></div>
      </div>
      <figure className="relative min-h-[340px] sm:min-h-[460px] lg:min-h-[640px]">
        <Image src="/images/luxe-completed-installation.webp" alt="Luxe Window Works installation of Hunter Douglas Vignette Roman Shades in a timber-beamed living room" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[65%_center]" />
        <figcaption className="absolute left-5 right-5 bottom-5 w-fit max-w-[calc(100%-2.5rem)] bg-charcoal/85 text-white rounded-md p-4"><Image src="/images/brands/hunter-douglas-white-horizontal.png" alt="Hunter Douglas" width={2048} height={295} className="w-[190px] h-auto" sizes="190px" /><p className="mt-2 text-xs">Vignette® · An actual Luxe installation</p></figcaption>
      </figure>
    </section>
    <section className="container-luxe py-14 md:py-20 text-center max-w-3xl"><p className="uppercase tracking-[.18em] text-xs text-warm-gray-700">Beautiful windows begin with a conversation</p><h2 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4">See the possibilities.<br />Then see them in your home.</h2><p className="mt-6 text-lg leading-relaxed text-warm-gray-700">A photo can catch your eye. Seeing the fabric in your own light is what makes the choice feel easy. We bring the samples, talk through your priorities and help you find the right fit, room by room.</p></section>
    <RelatedVideos videos={LUXE_VIDEOS} />
    <section id="collections" aria-labelledby="collection-heading" className="scroll-mt-24 bg-cream py-12 md:py-16">
      <div className="container-luxe">
        <div className="max-w-3xl mb-8">
          <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Find your style</p>
          <h2 id="collection-heading" className="font-serif text-3xl sm:text-4xl text-charcoal mt-3">So many ways to make it yours.</h2>
          <p className="mt-5 text-lg text-warm-gray-700 leading-relaxed">From soft sheers to tailored shutters, explore the Hunter Douglas collections below. We bring samples to homes across Post Falls, Coeur d’Alene, Hayden, Rathdrum, and Sandpoint and help compare fabrics, controls, and installation details.</p>
        </div>
        <nav aria-label="Hunter Douglas product categories" className="flex flex-wrap gap-2 mb-10">
          {HD_CATEGORIES.map(p => <a key={p.id} href={`#${p.id}`} className="rounded-full border border-warm-gray-300 bg-white px-4 py-2 text-sm text-charcoal hover:bg-charcoal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{p.title}</a>)}
        </nav>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {HD_CATEGORIES.map(p => <article id={p.id} key={p.id} className="scroll-mt-28 bg-white overflow-hidden flex flex-col border border-warm-gray-200 rounded-sm">
            <div className="relative aspect-[2/1]"><Image src={p.image} alt={p.alt} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" /></div>
            <div className="p-6 lg:p-7 flex flex-col flex-1">
              <h3 className="font-serif text-2xl text-charcoal">{p.title}</h3>
              <p className="mt-3 text-sm font-semibold text-warm-gray-700 leading-relaxed">{p.collections}</p>
              <p className="mt-4 text-warm-gray-700 leading-relaxed">{p.description}</p>
              <Link href="/book" className="mt-auto pt-6 text-sm font-semibold text-charcoal underline underline-offset-4" aria-label={`Explore ${p.title} with Luxe`}>Explore with Luxe →</Link>
            </div>
          </article>)}
        </div>
      </div>
    </section>
    <section className="bg-charcoal text-white py-14 md:py-20"><div className="container-luxe"><div className="max-w-2xl"><p className="text-gold text-xs uppercase tracking-[.18em]">Hunter Douglas design. Luxe care.</p><h2 className="font-serif text-3xl sm:text-4xl mt-4">Every detail, handled.</h2></div><div className="grid md:grid-cols-3 gap-8 lg:gap-14 mt-10">{[{ title: "Samples in your space", text: "Compare colors, textures and light control where you’ll live with them. We bring the showroom to you." }, { title: "Measured to fit", text: "We check the dimensions, mounting depth and practical details before your custom order is placed." }, { title: "Installed with care", text: "One local point of contact, professional installation and Luxe’s lifetime installation guarantee." }].map((x, i) => <div key={x.title}><p className="text-gold text-sm">0{i + 1}</p><h3 className="font-serif text-2xl mt-3">{x.title}</h3><p className="mt-4 text-warm-gray-300 leading-relaxed">{x.text}</p></div>)}</div></div></section>
    <section className="container-luxe py-14 md:py-20 max-w-3xl">
      <h2 className="font-serif text-3xl text-charcoal">Hunter Douglas pricing, measured for your home.</h2>
      <p className="mt-5 text-lg text-warm-gray-700 leading-relaxed">Your collection, fabric, window sizes, and controls shape the quote. We bring samples to homes in Coeur d’Alene, Post Falls, Hayden, Rathdrum, and Sandpoint, then confirm the details before you order. Professional measurements and installation are included.</p>
      <p className="mt-4 text-warm-gray-700 leading-relaxed">Hunter Douglas is quoted separately from our instant estimator. If PowerView is on your wish list, we’ll also discuss power options and any accessories needed for your preferred controls.</p>
      <div className="mt-6 flex flex-col items-start gap-4"><Link href="/book" className="font-semibold underline underline-offset-4">Request your Hunter Douglas consultation →</Link><Link href="/products/motorization" className="underline underline-offset-4">Explore motorized shade installation →</Link></div>
    </section>
    <div className="container-luxe pb-10 max-w-3xl"><Link href="/hunter-douglas-coeur-d-alene" className="font-semibold underline underline-offset-4">Arrange a Hunter Douglas in-home consultation in Coeur d’Alene →</Link></div>
    <RelatedDecisionArticles articles={[{ title: "Why We Love Hunter Douglas PowerView Motorized Shades", slug: "why-we-love-hunter-douglas-powerview-motorized-shades" }]} />
    <section className="container-luxe py-14 md:py-20 max-w-4xl"><h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-8">A few questions, answered.</h2>{HD_FAQS.map(f => <details key={f.question} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer text-charcoal font-semibold text-lg pr-4">{f.question}</summary><p className="mt-4 text-warm-gray-700 leading-relaxed">{f.answer}</p></details>)}</section>
    <section className="bg-cream py-14 md:py-20 text-center"><div className="container-luxe max-w-3xl"><h2 className="font-serif text-3xl sm:text-4xl text-charcoal">Let’s find your kind of beautiful.</h2><p className="mt-6 text-lg text-warm-gray-700 leading-relaxed">See the fabrics. Compare the options. In your own home.<br />Serving Post Falls, Coeur d’Alene, Hayden, Rathdrum and Sandpoint.</p><Link href="/book" className="inline-block mt-8 rounded-full bg-charcoal text-white font-semibold px-8 py-4">Schedule a Free In-Home Consultation</Link><p className="mt-5"><a href={BUSINESS.phoneHref} className="text-charcoal underline underline-offset-4">Call {BUSINESS.phone}</a></p><p className="text-xs text-warm-gray-700 mt-10">Collection photography courtesy of Hunter Douglas. Featured Luxe installation identified separately.</p></div></section>
  </>;
}
