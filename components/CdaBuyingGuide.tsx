import Link from "next/link";

const needs = [
  { title: "A lake view with less glare", text: "Compare solar fabrics for daytime glare and view control. If you also need privacy after dark, we’ll discuss a separate privacy layer.", href: "/products/solar-shades", label: "Compare solar shades" },
  { title: "Bedrooms and everyday privacy", text: "Explore cellular shades for light control and comfort, or roller shades for a clean fabric finish. We check the fabric and edge coverage against the room’s needs.", href: "/products/cellular-shades", label: "Explore cellular shades", secondHref: "/products/roller-shades", secondLabel: "Compare roller shades" },
  { title: "Adjustable light and an architectural finish", text: "Compare wood, faux wood, and composite blinds with custom plantation shutters. The window opening, material, and how you want to use the room guide the choice.", href: "/products/blinds", label: "Compare custom blinds", secondHref: "/products/shutters", secondLabel: "Explore plantation shutters" },
  { title: "High windows or a new-build plan", text: "Start with how you’ll reach, power, and control each shade. We help you compare compatible motorized systems and coordinate hardwired power planning with your electrician when needed.", href: "/products/motorization", label: "Plan motorized shades" },
];

export default function CdaBuyingGuide() {
  return (
    <section id="cda-buying-guide" aria-labelledby="cda-buying-guide-heading" className="scroll-mt-28 py-16 md:py-20 bg-warm-white">
      <div className="container-luxe max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-gold text-sm font-medium uppercase tracking-widest">Start with your windows</p>
          <h2 id="cda-buying-guide-heading" className="mt-4 font-serif text-2xl sm:text-3xl text-charcoal">Which window treatments fit your Coeur d&apos;Alene home?</h2>
          <p className="mt-5 text-lg text-warm-gray-600 leading-relaxed">Luxe is based in Post Falls and serves Coeur d&apos;Alene with free in-home consultations. Mark brings samples to your home, checks the openings, and helps you choose room by room. You can start with a problem to solve or a brand you already like.</p>
        </div>
        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {needs.map((need) => (
            <article key={need.title} className="rounded-2xl border border-warm-gray-200 bg-cream/50 p-6 sm:p-8">
              <h3 className="font-serif text-xl text-charcoal">{need.title}</h3>
              <p className="mt-4 text-warm-gray-600 leading-relaxed">{need.text}</p>
              <div className="mt-5 flex flex-col items-start gap-3">
                <Link href={need.href} className="font-medium text-charcoal underline underline-offset-4 decoration-gold">{need.label} →</Link>
                {need.secondHref && <Link href={need.secondHref} className="font-medium text-charcoal underline underline-offset-4 decoration-gold">{need.secondLabel} →</Link>}
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12 border-t border-warm-gray-200 pt-9">
          <h3 className="font-serif text-2xl text-charcoal">Compare the brands in your own light</h3>
          <div className="mt-6 grid gap-7 md:grid-cols-3">
            <div><Link href="/hunter-douglas-coeur-d-alene" className="font-semibold text-charcoal underline underline-offset-4 decoration-gold">Hunter Douglas in Coeur d&apos;Alene</Link><p className="mt-3 text-warm-gray-600 leading-relaxed">Explore collections, samples, and compatible PowerView controls with an authorized dealer who handles measuring and installation.</p></div>
            <div><Link href="/products/shutters" className="font-semibold text-charcoal underline underline-offset-4 decoration-gold">Norman plantation shutters</Link><p className="mt-3 text-warm-gray-600 leading-relaxed">Compare materials, frames, and panel layouts with a Norman dealer since 2009. Read C P&apos;s local shutter experience below.</p></div>
            <div><Link href="/products/two" className="font-semibold text-charcoal underline underline-offset-4 decoration-gold">TWO shutters and shades</Link><p className="mt-3 text-warm-gray-600 leading-relaxed">Explore Highprofile interior shutters, Colourvue roller shades, and outdoor options for patios and covered spaces.</p></div>
          </div>
          <p className="mt-7 text-sm text-warm-gray-600 leading-relaxed">Hunter Douglas, Norman, and TWO receive a project-specific quote. The instant estimator covers select products supplied through Premier Blinds &amp; Shades.</p>
        </div>
      </div>
    </section>
  );
}
