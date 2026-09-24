import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { BUSINESS } from "@/lib/constants";
import { THE_WINDOW_OUTFITTERS } from "@/lib/brands";

const url = `${BUSINESS.url}/products/two`;
export const metadata: Metadata = {
  title: "TWO Shutters & Shades in North Idaho | Luxe Window Works",
  description: "Explore the full TWO collection with Luxe Window Works: interior shutters, roller shades, Weatherwell aluminum shutters, outdoor shades and automation. Free in-home consultation.",
  alternates: { canonical: url },
  openGraph: { title: "The TWO Collection | Luxe Window Works", description: "Beautiful indoors. More possibilities outside. Custom shutters and shades, measured and installed in North Idaho.", url, images: ["/images/weatherwell-elite/IMG_5252.jpeg"] },
};
const ranges = [
  { id: "highprofile-classic", name: "Highprofile Classic", category: "Real wood shutters", text: "The warmth of real wood, with painted or stained finishes and a choice of panel styles. A natural place to start when the shutters are part of the room’s character.", source: "highprofile-classic-wood-shutters" },
  { id: "highprofile-poly", name: "Highprofile Poly", category: "PVC shutters", text: "An easy-care shutter option for kitchens, bathrooms and everyday living. PVC construction brings the plantation-shutter look to spaces where moisture matters.", source: "highprofile-poly" },
  { id: "highprofile-avenir", name: "Highprofile Avenir", category: "Interior aluminum shutters", text: "A clean, modern profile with the strength of aluminum. For interiors where you want a substantial shutter with a slim, understated finish.", source: "highprofile-avenir" },
  { id: "colourvue-control", name: "Colourvue Control", category: "Interior roller shades", text: "A simple silhouette that lets the room do the talking. We help you choose fabric, privacy and light control around how you actually use each space.", source: "colourvue-control-roller-shades" },
  { id: "weatherwell-elite", name: "Weatherwell Elite", category: "Architectural aluminum shutters", text: "Adjustable louvers and flexible panel configurations for patios, covered decks and distinctive interiors. Our featured TWO collection for bringing more comfort and privacy outdoors.", source: "weatherwell-elite" },
  { id: "weatherwell-standard", name: "Weatherwell Standard", category: "Aluminum shutters", text: "Another option in the Weatherwell family. We compare Standard and Elite against your opening, preferred operation and budget so you get the right system for the project.", source: "weatherwell-standard" },
  { id: "shadesol-alfresco", name: "Shadesol Alfresco", category: "Outdoor shades", text: "For the patio you love until the afternoon sun arrives. Outdoor fabric shading gives you another way to manage glare and privacy around a covered outdoor space.", source: "shadesol-alfresco-outdoor-shades" },
  { id: "whispertech", name: "Whispertech", category: "Shade automation", text: "Quiet motorized control for compatible shades. We confirm the motor, power supply and any smart-home hub your project needs, then handle setup and programming.", source: "whispertech" },
];
export default function TwoCollection() {
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": `${url}#webpage`, url, name: "The TWO Collection at Luxe Window Works", isPartOf: { "@id": `${BUSINESS.url}/#website` }, about: { "@id": THE_WINDOW_OUTFITTERS["@id"] }, mainEntity: { "@type": "ItemList", itemListElement: ranges.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.name, url: `${url}#${r.id}` })) } }} />
    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: "TWO Collection" }]} />
    <section className="bg-cream">
      <div className="grid lg:grid-cols-2 max-w-8xl mx-auto">
        <div className="px-6 sm:px-10 lg:px-16 py-12 lg:py-20 flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-warm-gray-700">Luxe Window Works · The TWO Collection</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.12] text-charcoal mt-5">Beautiful indoors.<br /><span className="italic">More possibilities outside.</span></h1>
          <p className="text-lg leading-relaxed text-warm-gray-700 mt-7 max-w-xl">A little more privacy on the patio. Softer light in the living room. Shutters that feel like they belong to the architecture. Discover the full TWO range, with personal guidance from Luxe Window Works.</p>
          <div className="flex flex-wrap gap-3 mt-8"><Link href="/book" className="rounded-full bg-charcoal text-white px-6 py-4 font-medium">Book a Free Consultation</Link><a href="#collection" className="rounded-full border border-charcoal/30 px-6 py-4 text-charcoal">Explore All Eight Ranges ↓</a></div>
          <p className="mt-6 text-sm text-warm-gray-700">Custom measured · Professionally installed · North Idaho</p>
        </div>
        <div className="relative min-h-[340px] lg:min-h-[640px]"><Image src="/images/weatherwell-elite/IMG_5252.jpeg" alt="Adjustable aluminum shutters around a timber-framed covered outdoor living area" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
      </div>
    </section>
    <section className="container-luxe pt-12 grid md:grid-cols-3 gap-5">{[{src:"highprofile",label:"Interior shutters"},{src:"colourvue",label:"Roller shades"},{src:"shadesol",label:"Outdoor shades"}].map(x => <div key={x.src}><div className="relative aspect-[4/3] rounded-xl overflow-hidden"><Image src={`/images/two/${x.src}.jpg`} alt={`TWO ${x.label.toLowerCase()} manufacturer inspiration`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div><p className="font-serif text-xl mt-3 text-charcoal">{x.label}</p></div>)}</section>
    <section className="container-luxe py-16 md:py-24" id="collection">
      <div className="max-w-2xl mb-10"><p className="uppercase tracking-[.2em] text-xs text-warm-gray-700">One collection. Eight ways to make it yours.</p><h2 className="font-serif text-3xl sm:text-4xl text-charcoal mt-4">Which TWO product fits your space?</h2><p className="mt-5 text-warm-gray-700 leading-relaxed">Luxe Window Works offers the complete TWO lineup in Post Falls, Coeur d’Alene, Hayden, Rathdrum and Sandpoint. Start with the room or outdoor space you want to improve—we’ll help narrow the choices.</p></div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">{ranges.map((r, i) => <article key={r.id} id={r.id} className="scroll-mt-28 border border-warm-gray-200 rounded-2xl bg-warm-white p-7 flex flex-col"><p className="text-sm text-warm-gray-700">0{i + 1} / {r.category}</p><h3 className="font-serif text-2xl mt-4 text-charcoal">{r.name}</h3><p className="mt-4 text-warm-gray-700 leading-relaxed flex-1">{r.text}</p>{r.id === "weatherwell-elite" ? <Link href="/products/aluminum-shutters" className="mt-6 font-semibold text-charcoal underline underline-offset-4">Explore Weatherwell Elite →</Link> : <a href={`https://two-usa.com/${r.source}/`} target="_blank" rel="noopener noreferrer" className="mt-6 text-sm text-charcoal underline underline-offset-4">View manufacturer details ↗</a>}</article>)}</div>
    </section>
    <section className="bg-linen py-16 md:py-24"><div className="container-luxe grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src="/images/weatherwell-elite/IMG_1189.jpeg" alt="Louvered shutters surrounding an outdoor seating area with a fireplace" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div><div><p className="uppercase tracking-[.2em] text-xs text-warm-gray-700">Featured · Weatherwell Elite</p><h2 className="font-serif text-3xl sm:text-4xl mt-4 text-charcoal">Make the patio part of the plan.</h2><p className="mt-6 text-lg text-warm-gray-700 leading-relaxed">You put thought into the furniture, the fireplace and the view. Adjustable aluminum shutters give you another layer of control over the space—without losing the architectural feel.</p><Link href="/products/aluminum-shutters" className="inline-block mt-7 rounded-full bg-charcoal px-7 py-4 text-white">Explore Weatherwell Elite →</Link></div></div></section>
    <section className="py-16 md:py-24 container-luxe max-w-3xl text-center"><h2 className="font-serif text-3xl sm:text-4xl text-charcoal">The collection is TWO.<br />The personal service is Luxe.</h2><p className="mt-6 text-lg leading-relaxed text-warm-gray-700">We bring the showroom to you, help you compare the options, take the measurements and handle installation. You get one local point of contact and our lifetime installation guarantee.</p><Link href="/book" className="inline-block mt-8 rounded-full bg-charcoal text-white px-8 py-4">Let’s Talk About Your Project</Link><p className="mt-5"><a className="underline text-charcoal" href={BUSINESS.phoneHref}>Call {BUSINESS.phone}</a></p></section>
  </>;
}
