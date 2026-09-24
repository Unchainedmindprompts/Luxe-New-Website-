import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { BUSINESS, SERVICE_AREAS } from "@/lib/constants";
import { THE_WINDOW_OUTFITTERS } from "@/lib/brands";

import { cityRef } from "@/lib/cities";
import { CUSTOM_WINDOW_TREATMENTS } from "@/lib/schema";
import { TWO_RANGES as ranges, TWO_URL as url, twoProductRef, twoImage, COLOURVUE_IMAGE } from "@/lib/two";
export const metadata: Metadata = {
  title: "TWO Shutters & Shades in North Idaho | Luxe Window Works",
  description: "Explore the TWO collection with Luxe Window Works: interior shutters, roller shades, Weatherwell aluminum shutters, outdoor shades and automation. Free in-home consultation.",
  alternates: { canonical: url },
  openGraph: { title: "The TWO Collection | Luxe Window Works", description: "Beautiful indoors. More possibilities outside. Custom shutters and shades, measured and installed in North Idaho.", url, images: ["/images/weatherwell-elite/IMG_1086.jpeg"] },
};
export default function TwoCollection() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@graph": [
      {
        "@type": "CollectionPage", "@id": `${url}#webpage`, url,
        name: "The TWO Collection at Luxe Window Works", description: metadata.description,
        isPartOf: { "@id": `${BUSINESS.url}/#website` },
        about: [{ "@id": THE_WINDOW_OUTFITTERS["@id"] }, { "@id": `${url}#service` }],
        breadcrumb: { "@id": `${url}#breadcrumb` }, inLanguage: "en-US",
        mainEntity: {
          "@type": "ItemList", name: "TWO shutters, shades and automation", numberOfItems: ranges.length,
          itemListElement: ranges.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.name, url: `${url}#${r.id}`, item: twoProductRef(r.id) })),
        },
      },
      {
        "@type": "Service", "@id": `${url}#service`, url,
        name: "TWO Shutters, Shades and Automation Consultation and Installation",
        serviceType: CUSTOM_WINDOW_TREATMENTS,
        provider: { "@id": `${BUSINESS.url}/#business` },
        areaServed: SERVICE_AREAS.map(a => cityRef(a.name)),
        description: "Personal product guidance, custom measurements and professional installation of TWO interior shutters, roller shades, outdoor aluminum shutters, exterior shades and compatible shade automation in North Idaho.",
        hasOfferCatalog: { "@id": `${url}#catalog` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
      },
      {
        "@type": "OfferCatalog", "@id": `${url}#catalog`, name: "The TWO Collection", url,
        itemListElement: ranges.map(r => ({
          "@type": "Offer", url: `${url}#${r.id}`,
          seller: { "@id": `${BUSINESS.url}/#business` },
          itemOffered: twoProductRef(r.id),
        })),
      },
      ...ranges.map(r => ({
        "@type": "ProductModel", ...twoProductRef(r.id), name: r.name, category: r.category,
        description: r.text + ("programs" in r ? " " + r.programs.map(p => `${p.name}: ${p.text}`).join(" ") : ""), url: `${url}#${r.id}`, image: new URL(twoImage(r.id), BUSINESS.url).href,
        manufacturer: { "@id": THE_WINDOW_OUTFITTERS["@id"] },
        sameAs: [`https://two-usa.com/${r.source}/`],
        isRelatedTo: { "@id": `${url}#service` },
      })),
      {
        "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url },
          { "@type": "ListItem", position: 2, name: "Products", item: `${BUSINESS.url}/products` },
          { "@type": "ListItem", position: 3, name: "TWO Collection", item: url },
        ],
      },
    ] }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "TWO Collection" }]} />
    <section className="bg-cream">
      <div className="grid lg:grid-cols-2 max-w-8xl mx-auto">
        <div className="px-6 sm:px-10 lg:px-16 py-12 lg:py-20 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-warm-gray-700">Luxe Window Works · The TWO Collection</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.12] text-charcoal mt-5">Beautiful indoors.<br /><span className="italic">More possibilities outside.</span></h1>
          <p className="text-lg leading-relaxed text-warm-gray-700 mt-7 max-w-xl">A little more privacy on the patio. Softer light in the living room. Shutters that feel like they belong to the architecture. Discover the TWO collection, with personal guidance from Luxe Window Works.</p>
          <div className="flex flex-wrap gap-3 mt-8"><Link href="/book" className="rounded-full bg-charcoal text-white px-6 py-4 font-medium">Book a Free Consultation</Link><a href="#collection" className="rounded-full border border-charcoal/30 px-6 py-4 text-charcoal">Explore the Collection ↓</a></div>
          <p className="mt-6 text-sm text-warm-gray-700">Custom measured · Professionally installed · North Idaho</p>
        </div>
        <div className="relative min-h-[340px] lg:min-h-[640px]"><Image src="/images/weatherwell-elite/IMG_1086.jpeg" alt="Dark aluminum shutters with sliding and folding panels on a modern home" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      </div>
    </section>
    <section className="container-luxe pt-12 grid md:grid-cols-3 gap-5">{[{src:"highprofile",label:"Interior shutters"},{src:"colourvue",label:"Roller shades"},{src:"shadesol",label:"Outdoor shades"}].map(x => <div key={x.src}><div className="relative aspect-[4/3] rounded-xl overflow-hidden"><Image src={x.src === "colourvue" ? COLOURVUE_IMAGE : `/images/two/${x.src}.jpg`} alt={`TWO ${x.label.toLowerCase()} manufacturer inspiration`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><p className="font-serif text-xl mt-3 text-charcoal">{x.label}</p></div>)}</section>
    <section className="container-luxe py-16 md:py-24" id="collection">
      <div className="max-w-2xl mb-10"><p className="uppercase tracking-[.2em] text-xs text-warm-gray-700">One collection. More ways to make it yours.</p><h2 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4">Which TWO product fits your space?</h2><p className="mt-5 text-warm-gray-700 leading-relaxed">Luxe Window Works offers these six TWO product families in Post Falls, Coeur d’Alene, Hayden, Rathdrum and Sandpoint. Start with the room or outdoor space you want to improve—we’ll help narrow the choices.</p></div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">{ranges.map((r, i) => <article key={r.id} id={r.id} className="scroll-mt-28 border border-warm-gray-200 rounded-2xl bg-warm-white overflow-hidden flex flex-col"><div className="relative aspect-[4/3] shrink-0"><Image src={twoImage(r.id)} alt={`TWO ${r.name} ${r.category.toLowerCase()}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" /></div><div className="p-6 flex flex-col flex-1"><p className="text-sm text-warm-gray-700">0{i + 1} / {r.category}</p><h3 className="font-serif text-2xl mt-4 text-charcoal">{r.name}</h3><p className="mt-4 text-warm-gray-700 leading-relaxed flex-1">{r.text}</p>{"programs" in r && <div className="mt-5 space-y-4">{r.programs.map(p => <div key={p.name}><h4 className="font-semibold text-charcoal">{p.name}</h4><p className="mt-1 text-sm text-warm-gray-700 leading-relaxed">{p.text}</p></div>)}</div>}{r.id === "weatherwell-elite" ? <Link href="/products/aluminum-shutters" className="mt-6 font-semibold text-charcoal underline underline-offset-4">Explore Weatherwell Elite →</Link> : <a href={`https://two-usa.com/${r.source}/`} target="_blank" rel="noopener noreferrer" className="mt-6 text-sm text-charcoal underline underline-offset-4">View manufacturer details ↗</a>}</div></article>)}</div>
    </section>
    <section className="bg-linen py-16 md:py-24"><div className="container-luxe grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/images/weatherwell-elite/IMG_1189.jpeg" alt="Louvered shutters surrounding an outdoor seating area with a fireplace" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div><p className="uppercase tracking-[.2em] text-xs text-warm-gray-700">Featured · Weatherwell Elite</p><h2 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal">Make the patio part of the plan.</h2><p className="mt-6 text-lg text-warm-gray-700 leading-relaxed">You put thought into the furniture, the fireplace and the view. Adjustable aluminum shutters give you another layer of control over the space—without losing the architectural feel.</p><Link href="/products/aluminum-shutters" className="inline-block mt-7 rounded-full bg-charcoal px-7 py-4 text-white">Explore Weatherwell Elite →</Link></div></div></section>
    <section className="py-16 md:py-24 container-luxe max-w-3xl text-center"><h2 className="font-serif text-3xl sm:text-4xl text-charcoal">The collection is TWO.<br />The personal service is Luxe.</h2><p className="mt-6 text-lg leading-relaxed text-warm-gray-700">We bring the showroom to you, help you compare the options, take the measurements and handle installation. You get one local point of contact and our lifetime installation guarantee.</p><Link href="/book" className="inline-block mt-8 rounded-full bg-charcoal text-white px-8 py-4">Let’s Talk About Your Project</Link><p className="mt-5"><a className="underline text-charcoal" href={BUSINESS.phoneHref}>Call {BUSINESS.phone}</a></p></section>
  </>;
}
