import Link from "next/link";
import { TWO_RANGES } from "@/lib/two";

const shadesol = TWO_RANGES.find((range) => range.id === "shadesol-alfresco")!;

export function ExteriorShadeOptions() {
  return (
    <section id="exterior-options" aria-labelledby="exterior-options-heading" className="scroll-mt-28 py-16 md:py-20 bg-cream/50">
      <div className="container-luxe max-w-5xl">
        <p className="text-gold font-medium text-sm uppercase tracking-widest">Compare your options</p>
        <h2 id="exterior-options-heading" className="mt-4 font-serif text-2xl sm:text-3xl text-charcoal">Exterior shade options for your space</h2>
        <p className="mt-5 max-w-3xl text-lg text-warm-gray-600 leading-relaxed">We help you choose the fabric and system around the opening, the sun, and how you want to use the space. Each project receives its own quote.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-warm-gray-200 bg-warm-white p-6 sm:p-8">
            <h3 className="font-serif text-2xl text-charcoal">Corradi USA exterior screens</h3>
            <p className="mt-4 text-warm-gray-600 leading-relaxed">Retractable screens with cassette or open-roll configurations and system-specific side guides. Compatible models offer manual operation or Somfy motorization. We confirm the fabric, mounting, power, controls, and any sensor options for your opening.</p>
            <a href="https://www.corradiusa.com/products/exterior-screens" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 font-medium text-charcoal underline underline-offset-4 decoration-gold">Corradi manufacturer details ↗</a>
          </article>
          <article className="rounded-2xl border border-warm-gray-200 bg-warm-white p-6 sm:p-8">
            <h3 className="font-serif text-2xl text-charcoal">TWO Shadesol outdoor shades</h3>
            <p className="mt-4 text-warm-gray-600 leading-relaxed">Outdoor fabric shading for glare and daytime privacy around covered spaces. Our TWO collection includes {shadesol.programs.map((program) => program.name).join(" and ")}. We help compare the programs and confirm compatible Rollease Acmeda or Whispertech controls for the selected system.</p>
            <div className="mt-6 flex flex-col items-start gap-4">
              <Link href="/products/two#shadesol-alfresco" className="font-medium text-charcoal underline underline-offset-4 decoration-gold">Explore TWO Shadesol →</Link>
              <a href="https://two-usa.com/shadesol-alfresco-outdoor-shades/" target="_blank" rel="noopener noreferrer" className="text-sm text-charcoal underline underline-offset-4">TWO manufacturer details ↗</a>
            </div>
          </article>
        </div>
        <p className="mt-7 text-sm text-warm-gray-600 leading-relaxed">For glare control inside your home, <Link href="/products/solar-shades" className="underline underline-offset-4 decoration-gold">compare interior solar shades</Link>. For powered operation, <Link href="/products/motorization" className="underline underline-offset-4 decoration-gold">explore compatible motorized shade controls</Link>. We confirm the final configuration and manufacturer guidance before ordering.</p>
      </div>
    </section>
  );
}
