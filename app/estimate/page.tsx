import type { Metadata } from 'next';
import EstimateExperience from './EstimateExperience';
import { productPages } from '@/lib/product-data';
export const metadata: Metadata = {
  title: 'Instant Blinds & Shades Estimate | Luxe Window Works',
  description: 'Explore custom cellular, banded (Zebra), Roman, roller shade, and white faux wood blind pricing for your North Idaho home. Enter your window sizes and compare light control and motorization.',
  alternates: { canonical: 'https://www.luxewindowworks.com/estimate' },
};
export default function EstimatePage() {
  return <>
    <EstimateExperience bandedImage={productPages["banded-shades"].image!} rollerImage={productPages["roller-shades"].image!} />
    <section className="container-luxe py-16 max-w-4xl"><h2 className="font-serif text-3xl mb-7">A few things worth knowing</h2>
      {[
        ['How should I measure?', 'For a starting estimate, measure the width and height of the window opening in inches. Decimals are welcome—36.5 means 36½ inches. We will take the final measurements before anything is ordered.'],
        ['What does this estimate include?', 'Your selected blinds or shades and operating options, plus professional in-home consultation, measurements, and installation. Motorized estimates include a rechargeable battery and one compatible remote per shade. Zebra and roller estimates include a round cassette, sized for the window, and motorized Zebra, Roman, and roller shades also include a USB charger. Roman shades include fabric lining to help protect the decorative fabric from UV exposure and give the shade added structure. Faux wood estimates include 2-inch standard Snow White blinds with cordless lift, wand tilt, and a matching valance. Sales tax is not included.'],
        ['Can I choose other fabrics or finishes?', 'Absolutely. Cellular estimates use ¾-inch smooth fabrics. Zebra estimates use Aspen light filtering or Grandby / Leysin room darkening. Roman estimates use the Carolina starting collection (price group 103), in Flat or Classic style, with light-filtering or blackout lining. Roller estimates use Stirling light filtering or Belfort room darkening, with a round cassette. Additional colors, textures, and fabric styles are available at higher prices. Faux wood estimates cover standard white only; we can discuss other finishes during your consultation. We bring samples so you can compare them in your own light.'],
        ['What if my window needs something different?', 'Large windows, specialty shapes, and other products deserve a closer look. Schedule a free consultation and we will help you find the right fit.'],
      ].map(([q,a]) => <details key={q} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 text-warm-gray-700 leading-relaxed">{a}</p></details>)}
    </section>
  </>;
}
