'use client';
import { useState } from 'react';
import Image from 'next/image';
import RomanIllustration from './RomanIllustration';
import type { Product } from '@/lib/estimate';
import EstimateBuilder from './EstimateBuilder';
export default function EstimateExperience({ bandedImage, rollerImage }: { bandedImage: string; rollerImage: string }) {
  const [product, setProduct] = useState<Product>('cellular');
  return <>
    <section className="bg-cream pt-28 pb-12 md:pt-32 md:pb-16">
      <div className="container-luxe grid md:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div>
          <p className="text-sm uppercase tracking-[.18em] text-warm-gray-700 mb-4">Instant Blinds &amp; Shades Estimator</p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1]">New to window treatments?<br /><span className="text-warm-gray-600">Start here.</span></h1>
          <div className="mt-6 space-y-4 text-base md:text-lg text-warm-gray-700 max-w-xl leading-relaxed">
            <p>Your first home? Your first time choosing custom blinds and shades? We get it. With so many options—and little idea of what they cost—it can be hard to know where to begin.</p>
            <p>That’s why we created our instant estimator. Explore a selection of our best-value blinds and shades, backed by a limited lifetime warranty, and see how different choices fit your budget.</p>
            <p>Use it to plan your project, explore options, or help make sense of a quote you already have. When you’re ready, we’ll bring samples and a wider range of possibilities to your home.</p>
          </div>
          <p className="mt-5 text-sm font-semibold leading-relaxed">No pressure. No email required. Professional measuring and installation included in your estimate.</p>
          <a href="#shade-cost-heading" className="inline-block mt-5 py-2 text-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Just exploring? See example prices for a typical window.</a>
        </div>
        <div className={`relative ${product === 'roman' ? 'min-h-[300px]' : product === 'cellular' ? 'aspect-[1032/965]' : 'aspect-[4/3]'} rounded-t-[5rem] rounded-b-2xl overflow-hidden`}>{product === 'roman' ? <div className="bg-white h-full flex flex-col justify-center px-6 pt-10 pb-6"><p className="font-serif text-2xl text-center mb-4">Two looks. One beautiful starting point.</p><div className="grid grid-cols-2 gap-4">{(['flat','classic'] as const).map(style => <div key={style} className="text-center"><RomanIllustration style={style} className="w-full h-40 md:h-52" /><p className="font-serif text-xl mt-2">{style === 'flat' ? 'Flat' : 'Classic'}</p></div>)}</div></div> : <Image key={product} src={product === 'faux' ? '/images/gallery/white-blinds-kitchen.webp' : product === 'roller' ? rollerImage : product === 'zebra' ? bandedImage : "/images/gallery/cellular-shades-arched-windows.png"} alt={product === 'faux' ? 'White horizontal blinds in a kitchen' : product === 'roller' ? 'Roller shades with smooth fabric and clean lines' : product === 'zebra' ? "Banded (Zebra) shades with alternating sheer and fabric bands" : "Soft green cellular shades beneath arched windows in a bright living room"} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />}</div>
      </div>
    </section>
    <EstimateBuilder onProductSelect={setProduct} />
  </>;
}
