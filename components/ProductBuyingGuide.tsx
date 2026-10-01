import Link from "next/link";
import type { ProductPageData } from "@/lib/product-data";

export function ProductBuyingGuide({ guide }: { guide: ProductPageData["buyingGuide"] }) {
  if (!guide) return null;

  return (
    <section id="pricing-guide" aria-labelledby="pricing-guide-heading" className="scroll-mt-28 py-14 md:py-20 bg-cream/50">
      <div className="container-luxe max-w-3xl">
        <p className="text-gold font-medium text-sm uppercase tracking-widest mb-3">Planning your project</p>
        <h2 id="pricing-guide-heading" className="font-serif text-2xl sm:text-3xl text-charcoal mb-6">{guide.heading}</h2>
        <div className="space-y-4 text-lg text-warm-gray-600 leading-relaxed">
          {guide.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="mt-7 flex flex-col items-start gap-4">
          {guide.links.map(link => (
            <Link key={link.href} href={link.href} className="font-semibold text-charcoal underline underline-offset-4 hover:text-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              {link.label} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
