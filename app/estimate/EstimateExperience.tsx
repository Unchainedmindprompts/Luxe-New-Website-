'use client';
import { useState } from 'react';
import Image from 'next/image';
import EstimateBuilder from './EstimateBuilder';
export default function EstimateExperience({ bandedImage }: { bandedImage: string }) {
  const [product, setProduct] = useState<'cellular' | 'zebra'>('cellular');
  return <>
    <section className="bg-cream pt-28 pb-12 md:pt-32 md:pb-16">
      <div className="container-luxe grid md:grid-cols-[1.15fr_1fr] gap-10 items-center">
        <div><p className="text-sm uppercase tracking-[.18em] text-warm-gray-700 mb-4">A little planning. A clearer picture.</p>
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.1]">Beautiful shades.<br /><span className="text-warm-gray-600">A budget you can see.</span></h1>
          <p className="mt-6 text-lg text-warm-gray-700 max-w-lg leading-relaxed">Wondering what custom shades might cost? Start with your windows. Explore a few options. See your estimate right here.</p>
          <p className="mt-5 text-sm font-medium">No email required · No pressure · Made for your home</p>
        </div>
        <div className="relative aspect-[4/3] rounded-t-[5rem] rounded-b-2xl overflow-hidden"><Image key={product} src={product === 'zebra' ? bandedImage : "/images/gallery/cellular-shades-window-wall.webp"} alt={product === 'zebra' ? "Banded (Zebra) shades with alternating sheer and fabric bands" : "Cellular shades fitted to a wall of windows"} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" /></div>
      </div>
    </section>
    <EstimateBuilder onProductSelect={setProduct} />
  </>;
}
