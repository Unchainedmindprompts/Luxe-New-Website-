import type { Metadata } from 'next';
import Image from 'next/image';
import EstimateBuilder from './EstimateBuilder';
export const metadata: Metadata = {
  title: 'Instant Cellular Shade Estimate | Luxe Window Works',
  description: 'Explore custom cellular shade pricing for your North Idaho home. Enter your window sizes and compare light control and motorization.',
  robots: { index: false, follow: false },
};
export default function EstimatePage() {
  return <>
    <section className="bg-cream pt-28 pb-12 md:pt-32 md:pb-16">
      <div className="container-luxe grid md:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div><p className="text-sm uppercase tracking-[.18em] text-warm-gray-700 mb-4">A little planning. A clearer picture.</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.1]">Beautiful shades.<br /><span className="text-warm-gray-600">A budget you can see.</span></h1>
          <p className="mt-6 text-lg text-warm-gray-700 max-w-lg leading-relaxed">Wondering what custom shades might cost? Start with your windows. Explore a few options. See your estimate right here.</p>
          <p className="mt-5 text-sm font-medium">No email required · No pressure · Made for your home</p>
        </div>
        <div className="relative aspect-[4/3] rounded-t-[5rem] rounded-b-2xl overflow-hidden"><Image src="/images/gallery/cellular-shades-window-wall.webp" alt="Cellular shades fitted to a wall of windows" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" /></div>
      </div>
    </section>
    <EstimateBuilder />
    <section className="container-luxe py-16 max-w-4xl"><h2 className="font-serif text-3xl mb-7">A few things worth knowing</h2>
      {[
        ['How should I measure?', 'For a starting estimate, measure the width and height of the window opening in inches. Decimals are welcome—36.5 means 36½ inches. We will take the final measurements before anything is ordered.'],
        ['What does this estimate include?', 'Your selected ¾-inch smooth cellular shades and operating options, plus professional in-home consultation, measurements, and installation. Motorized estimates include a rechargeable battery and one compatible remote per shade. Sales tax is not included.'],
        ['Can I choose other fabrics?', 'Absolutely. Prints, linen looks, and other textured fabrics are available at an additional charge. We bring samples so you can compare them in your own light.'],
        ['What if my window needs something different?', 'Large windows, specialty shapes, and other products deserve a closer look. Schedule a free consultation and we will help you find the right fit.'],
      ].map(([q,a]) => <details key={q} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 text-warm-gray-700 leading-relaxed">{a}</p></details>)}
    </section>
  </>;
}
