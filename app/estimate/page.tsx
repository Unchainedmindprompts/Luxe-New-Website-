import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { BUSINESS } from '@/lib/constants';
import { productServiceRef } from '@/lib/schema';
import { estimateShade, type Product } from '@/lib/estimate';
import type { Metadata } from 'next';
import EstimateExperience from './EstimateExperience';
import { productPages } from '@/lib/product-data';
export const metadata: Metadata = {
  title: 'Blinds & Shades Cost | Instant Estimate | Luxe Window Works',
  description: 'How much do cellular, Roman, roller and banded shades cost? Get an instant North Idaho estimate with consultation, measuring and installation included. No email required.',
  alternates: { canonical: 'https://www.luxewindowworks.com/estimate' },
};
const pageUrl = `${BUSINESS.url}/estimate`;
const dollars = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const examples = [
  { product: 'cellular', slug: 'cellular-shades', name: 'Cellular shades', fabric: '¾-inch smooth, light filtering' },
  { product: 'zebra', slug: 'banded-shades', name: 'Banded (Zebra) shades', fabric: 'Aspen light filtering, round cassette' },
  { product: 'roman', slug: 'roman-shades', name: 'Roman shades', fabric: 'Carolina, Flat or Classic, light-filtering lining' },
  { product: 'roller', slug: 'roller-shades', name: 'Roller shades', fabric: 'Stirling light filtering, round cassette' },
  { product: 'faux', slug: 'blinds', name: 'Faux wood blinds', fabric: '2-inch standard Snow White, matching valance' },
] as const;
const examplePrice = (product: Product) => {
  const result = estimateShade({ id: 1, product, room: '', width: '36', height: '60', quantity: '1', light: 'light', operation: 'cordless' });
  if (result.cents === undefined) throw new Error(`Invalid cost example: ${product}`);
  return dollars(result.cents);
};
const faqs: [string, string][] = [
  ...examples.map(example => [`How much do ${example.name.toLowerCase()} cost?`, `For one 36-inch-wide by 60-inch-high window, the current estimate is ${examplePrice(example.product)} with cordless operation and ${example.fabric}. This example includes professional in-home consultation, measurements, and installation; sales tax is not included. Different sizes, fabrics, and operating options change the price. Enter your own window details above for a tailored estimate.`] as [string, string]),
  ['Can I get an instant window shade estimate without an appointment?', 'Yes. Enter your approximate window sizes, choose your products and options, and review your estimate without providing an email address or booking an appointment. Luxe Window Works serves North Idaho, including Post Falls, Coeur d’Alene, Hayden, Rathdrum, and Sandpoint.'],
  ['Is the online estimate a final quote?', 'The online estimate helps you plan your budget. Your final quote follows a professional measurement and fabric check during your in-home consultation. The calculator does not place an order or book an appointment.'],
  ['How should I measure?', 'For a starting estimate, measure the width and height of the window opening in inches. Decimals are welcome—36.5 means 36½ inches. We will take the final measurements before anything is ordered.'],
  ['What does this estimate include?', 'Your selected blinds or shades and operating options, plus professional in-home consultation, measurements, and installation. Motorized estimates include a rechargeable battery and shared remote controls as shown in your estimate. Single-shade groups use a single-channel remote where available; multiple-shade groups use 15-channel remotes. Cellular systems use dedicated 15-channel remotes. Additional remotes are optional and priced separately. Zebra and roller estimates include a round cassette, sized for the window, and motorized Zebra, Roman, and roller shades also include a USB charger. Roman shades include fabric lining to help protect the decorative fabric from UV exposure and give the shade added structure. Faux wood estimates include 2-inch standard Snow White blinds with cordless lift, wand tilt, and a matching valance. Sales tax is not included.'],
  ['Can I choose other fabrics or finishes?', 'Absolutely. Cellular estimates use ¾-inch smooth fabrics. Zebra estimates use Aspen light filtering or Grandby / Leysin room darkening. Roman estimates use the Carolina starting collection (price group 103), in Flat or Classic style, with light-filtering or blackout lining. Roller estimates use Stirling light filtering or Belfort room darkening, with a round cassette. Additional colors, textures, and fabric styles are available at higher prices. Faux wood estimates cover standard white only; we can discuss other finishes during your consultation. We bring samples so you can compare them in your own light.'],
  ['What if my window needs something different?', 'Large windows, specialty shapes, and other products deserve a closer look. Schedule a free consultation and we will help you find the right fit.'],
];
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl,
      name: 'Blinds and Shades Cost — Instant Estimate', description: metadata.description,
      isPartOf: { '@id': `${BUSINESS.url}/#website` },
      publisher: { '@id': `${BUSINESS.url}/#business` },
      about: examples.map(example => productServiceRef(example.slug)),
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      hasPart: { '@id': `${pageUrl}#faq` }, inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BUSINESS.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Instant Estimate', item: pageUrl },
      ],
    },
    {
      '@type': 'FAQPage', '@id': `${pageUrl}#faq`,
      isPartOf: { '@id': `${pageUrl}#webpage` },
      mainEntity: faqs.map(([name,text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
    },
  ],
};

export default function EstimatePage() {
  return <>
    <JsonLd data={schema} />
    <EstimateExperience bandedImage={productPages["banded-shades"].image!} rollerImage={productPages["roller-shades"].image!} />
    <section className="container-luxe pt-12 max-w-4xl" aria-labelledby="shade-cost-heading">
      <nav aria-label="Breadcrumb" className="text-sm text-warm-gray-600 mb-6"><Link href="/" className="underline">Home</Link><span aria-hidden="true"> / </span><span>Instant Estimate</span></nav>
      <h2 id="shade-cost-heading" className="font-serif text-3xl mb-4">How much do custom blinds and shades cost?</h2>
      <p className="text-warm-gray-700 mb-4">Your window size, fabric, and operating options determine the price. Here are examples for one <strong>36″ × 60″ window with cordless operation</strong>, using our starting fabric collections. Each includes professional in-home consultation, measurements, and installation. Sales tax is not included.</p>
      <div className="overflow-x-auto rounded-xl border border-warm-gray-200"><table className="w-full text-left text-sm"><caption className="sr-only">Example installed window treatment estimates for one 36 by 60 inch window</caption><thead className="bg-cream"><tr><th scope="col" className="p-4">Window treatment</th><th scope="col" className="p-4">Included selection</th><th scope="col" className="p-4">Example estimate</th></tr></thead><tbody>{examples.map(example => <tr key={example.product} className="border-t border-warm-gray-200"><th scope="row" className="p-4 font-medium"><Link href={`/products/${example.slug}`} className="underline underline-offset-4">{example.name}</Link></th><td className="p-4">{example.fabric}</td><td className="p-4 whitespace-nowrap font-semibold">{examplePrice(example.product)}</td></tr>)}</tbody></table></div>
      <p className="mt-4 text-sm text-warm-gray-700">These are size-specific examples, not minimum prices or final quotes. Motorization, different fabrics, and other sizes change the estimate. Use the calculator above to compare options for your home.</p>
    </section>
    <section className="container-luxe py-16 max-w-4xl"><h2 className="font-serif text-3xl mb-7">Blinds and shades pricing questions</h2>
      {faqs.map(([q,a]) => <details key={q} className="border-b border-warm-gray-200 py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 text-warm-gray-700 leading-relaxed">{a}</p></details>)}
    </section>
  </>;
}
