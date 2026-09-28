import Image from "next/image";
import Link from "next/link";
import { HD_COLLECTIONS } from "@/lib/hunter-douglas";

export default function HunterDouglasFeature() {
  return (
    <section id="hunter-douglas-collection" aria-labelledby="hunter-douglas-title" className="bg-warm-white pt-10 md:pt-16 scroll-mt-24">
      <div className="max-w-[1600px] mx-auto overflow-hidden bg-cream">
        <div className="grid grid-cols-3 gap-1">
          {HD_COLLECTIONS.map((item) => (
            <Link key={item.id} href={`/products/hunter-douglas#${item.id}`} className="group min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-charcoal">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] overflow-hidden">
                <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1600px) 533px, 33vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" />
              </div>
              <div className="px-1 py-3 sm:px-5 sm:py-4 text-center text-charcoal">
                <p className="font-serif text-base sm:text-2xl">{item.name}</p>
                <p className="mt-1 text-[10px] sm:text-sm text-warm-gray-700">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="border-t border-charcoal/10 p-6 sm:p-10 lg:px-14 lg:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-warm-gray-700">Hunter Douglas · Personal service by Luxe</p>
            <h2 id="hunter-douglas-title" className="font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal mt-3">Discover Hunter <span className="whitespace-nowrap">Douglas.<span aria-hidden="true" className="inline-block w-[0.9em] h-[0.9em] ml-[0.3em] align-[-0.08em] bg-no-repeat bg-right" style={{ backgroundImage: "url('/images/brands/hunter-douglas-white-horizontal.png')", backgroundSize: "auto 100%" }} /></span></h2>
            <p className="mt-5 text-base sm:text-lg text-warm-gray-700 leading-relaxed">Beautiful fabrics. Thoughtful light control. Explore Hunter Douglas window treatments with Luxe’s personal guidance, professional measuring and installation.</p>
          </div>
          <Link href="/products/hunter-douglas" className="inline-flex justify-center items-center gap-3 rounded-full bg-charcoal text-white px-7 py-4 font-semibold shrink-0 hover:bg-charcoal/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-charcoal">Explore the Collection <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
