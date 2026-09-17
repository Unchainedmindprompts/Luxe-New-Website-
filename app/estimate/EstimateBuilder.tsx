'use client';
import { useState } from 'react';
import Link from 'next/link';
import { estimateShade, money, type Shade, type Operation } from '@/lib/estimate';
import { BUSINESS } from '@/lib/constants';
const fresh = (id: number): Shade => ({ id, product: 'cellular', room: '', width: '', height: '', quantity: '1', light: 'light', operation: 'cordless' });
const operations: { value: Operation; title: string; detail: string }[] = [
  { value: 'cordless', title: 'Cordless', detail: 'A gentle lift by hand.' },
  { value: 'tdbu', title: 'Top-down / bottom-up', detail: 'Daylight above. Privacy below.' },
  { value: 'motor', title: 'Motorized', detail: 'Rechargeable battery + remote.' },
  { value: 'motor-tdbu', title: 'Motorized top-down / bottom-up', detail: 'Flexible privacy, with a remote.' },
];
const field = 'mt-2 w-full rounded-xl border border-warm-gray-300 bg-white px-4 py-3 text-base text-charcoal focus:outline-none focus:ring-2 focus:ring-gold';
export default function EstimateBuilder({ onProductSelect }: { onProductSelect: (product: 'cellular' | 'zebra') => void }) {
  const [shades, setShades] = useState<Shade[]>([fresh(1)]);
  const [nextId, setNextId] = useState(2);
  const update = (id: number, patch: Partial<Shade>) => setShades(items => items.map(s => s.id === id ? { ...s, ...patch } : s));
  const results = shades.map(estimateShade);
  const complete = results.every(r => !r.error);
  const total = results.reduce((sum,r) => sum + (r.cents ?? 0), 0);
  const count = shades.reduce((sum,s) => sum + (Number(s.quantity) || 0), 0);
  return <section className="container-luxe py-12 md:py-16" aria-label="Custom shade estimate builder">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[.14em] text-warm-gray-600 mb-2">Your instant estimate</p><h2 className="font-serif text-3xl">Let’s start with your windows.</h2></div><span className="rounded-full bg-linen px-4 py-2 text-sm">Cellular &amp; Banded shades</span></div>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
      <div className="space-y-6">
        {shades.map((shade,index) => <article key={shade.id} onFocusCapture={() => onProductSelect(shade.product ?? 'cellular')} className="bg-white rounded-2xl border border-warm-gray-200 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6"><h3 className="font-serif text-2xl"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linen text-base mr-3">{index+1}</span>{shade.room || `Window ${index+1}`}</h3>{shades.length > 1 && <button type="button" aria-label={`Remove window ${index+1}`} onClick={() => setShades(s => s.filter(x => x.id !== shade.id))} className="text-sm underline underline-offset-4 p-2">Remove</button>}</div>
          <fieldset className="mb-6"><legend className="font-semibold text-sm mb-3">Choose your shade style.</legend><div className="grid sm:grid-cols-2 gap-3">
            {([['cellular','Cellular shades','Soft honeycomb fabric.'],['zebra','Banded (Zebra) shades','Alternating sheer and fabric bands.']] as const).map(([value,title,detail]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 flex gap-3 ${(shade.product ?? 'cellular')===value ? 'border-gold bg-cream ring-1 ring-gold' : 'border-warm-gray-200'}`}><input type="radio" name={`product-${shade.id}`} checked={(shade.product ?? 'cellular')===value} onChange={() => { update(shade.id,{product:value,operation:shade.operation.startsWith('motor')?'motor':'cordless'}); onProductSelect(value); }} className="accent-charcoal mt-1" /><span><span className="block font-medium text-sm">{title}</span><span className="text-xs text-warm-gray-700 mt-1 block">{detail}</span></span></label>)}
          </div><p className="text-xs text-warm-gray-600 mt-3">{shade.product==='zebra' ? 'Starting fabric collection: Aspen light filtering or Grandby / Leysin room darkening. Round cassette included. Additional fabrics are available at higher prices.' : 'Based on ¾-inch smooth cellular fabrics. Prints and textured fabrics are available at an additional charge.'}</p></fieldset>
          <label className="block text-sm font-medium" htmlFor={`room-${shade.id}`}>Room or window name <span className="font-normal text-warm-gray-600">(optional)</span></label>
          <input id={`room-${shade.id}`} value={shade.room} maxLength={60} onChange={e => update(shade.id,{room:e.target.value})} className={field+' mb-5'} placeholder="e.g. Living room" />
          <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_100px] gap-4">
            <label className="text-sm font-medium">Width (inches)<input aria-describedby={`size-help-${shade.id}`} inputMode="decimal" type="number" min="0" step="0.125" placeholder="36" value={shade.width} onChange={e => update(shade.id,{width:e.target.value})} className={field} /></label>
            <label className="text-sm font-medium">Height (inches)<input aria-describedby={`size-help-${shade.id}`} inputMode="decimal" type="number" min="0" step="0.125" placeholder="60" value={shade.height} onChange={e => update(shade.id,{height:e.target.value})} className={field} /></label>
            <label className="text-sm font-medium col-span-2 sm:col-span-1">Quantity<input type="number" min="1" max="50" step="1" value={shade.quantity} onChange={e => update(shade.id,{quantity:e.target.value})} className={field} /></label>
          </div>
          <p id={`size-help-${shade.id}`} className="mt-3 text-xs text-warm-gray-600">Approximate sizes are fine. We’ll confirm the measurements in your home.</p>
          <fieldset className="mt-7"><legend className="font-semibold text-sm mb-3">How would you like the light to feel?</legend><div className="grid sm:grid-cols-2 gap-3">
            {([['light','Light filtering','Soft daylight with everyday privacy.'],['dark','Room darkening','Fabric for a darker room.']] as const).map(([value,title,detail]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 flex gap-3 ${shade.light===value ? 'border-gold bg-cream ring-1 ring-gold' : 'border-warm-gray-200'}`}><input type="radio" name={`light-${shade.id}`} value={value} checked={shade.light===value} onChange={() => update(shade.id,{light:value})} className="accent-charcoal mt-1" /><span><span className="block font-medium text-sm">{title}</span><span className="text-xs text-warm-gray-700 mt-1 block">{detail}</span></span></label>)}
          </div><p className="text-xs text-warm-gray-600 mt-2">{shade.product==='zebra' ? 'Room darkening when the fabric bands are closed. Zebra shades do not provide complete blackout.' : 'Light can still enter around the edges of room-darkening shades.'}</p></fieldset>
          <fieldset className="mt-7"><legend className="font-semibold text-sm mb-3">Choose your everyday convenience.</legend><div className="grid sm:grid-cols-2 gap-3">
            {operations.filter(o => shade.product !== 'zebra' || o.value === 'cordless' || o.value === 'motor').map(o => <label key={o.value} className={`cursor-pointer rounded-xl border p-4 flex gap-3 ${shade.operation===o.value ? 'border-gold bg-cream ring-1 ring-gold' : 'border-warm-gray-200'}`}><input type="radio" name={`operation-${shade.id}`} checked={shade.operation===o.value} onChange={() => update(shade.id,{operation:o.value})} className="accent-charcoal mt-1" /><span><span className="block font-medium text-sm">{o.title}</span><span className="text-xs text-warm-gray-700 mt-1 block">{o.detail}</span></span></label>)}
          </div></fieldset>
          {shade.width && shade.height && results[index].error && <p role="status" className="mt-5 bg-cream rounded-lg p-4 text-sm text-warm-gray-800">{results[index].error} <Link href="/book" className="underline">Ask us about your window.</Link></p>}
          {results[index].cents !== undefined && <p className="border-t border-warm-gray-200 mt-6 pt-4 flex justify-between text-sm"><span>Shade estimate · {shade.quantity} {Number(shade.quantity)===1?'shade':'shades'}</span><strong>{money(results[index].cents!)}</strong></p>}
        </article>)}
        <button type="button" disabled={shades.length>=25} onClick={() => { setShades(s => [...s,fresh(nextId)]); setNextId(n=>n+1); }} className="w-full rounded-xl border border-dashed border-warm-gray-400 py-4 font-semibold hover:bg-cream disabled:opacity-50">+ Add another window</button>
      </div>
      <aside className="lg:sticky lg:top-28 rounded-2xl overflow-hidden border border-warm-gray-200">
        <div className="bg-charcoal text-white p-7"><p className="text-gold uppercase tracking-[.15em] text-xs mb-3">Your home, your way</p><h2 className="font-serif text-2xl">Your shade estimate</h2><div aria-live="polite" aria-atomic="true" className="mt-6">{complete ? <><p className="text-5xl font-serif">{money(total)}</p><p className="mt-2 text-sm text-white/80">For {count} custom {count===1?'shade':'shades'}</p></> : <><p className="text-3xl font-serif">Let’s put a number to it.</p><p className="text-sm text-white/80 mt-3">Enter each window’s measurements to see your total.</p></>}</div></div>
        <div className="bg-cream p-7"><p className="text-sm leading-relaxed text-warm-gray-700">Includes your custom shades, professional in-home consultation, measurements, and installation. Sales tax is not included. Your final quote follows a measurement and fabric check.</p>
          {shades.some(s=>s.operation.startsWith('motor')) && <p className="text-sm mt-4 text-warm-gray-700">Includes one remote per motorized shade. Motorized Zebra shades also include a USB charger. We can discuss sharing remotes during your consultation.</p>}
          <div className="border-t border-warm-gray-300 my-6" /><h3 className="font-serif text-xl">Like what you see?</h3><p className="mt-2 mb-5 text-sm text-warm-gray-700 leading-relaxed">We’ll bring the samples, check the fit, and help you make it yours.</p>
          <Link href="/book" className="block text-center bg-gold hover:bg-gold-dark text-charcoal font-semibold px-4 py-4 rounded-full">Book a Free Consultation</Link>
          <a href={BUSINESS.phoneHref} className="block text-center underline underline-offset-4 mt-4 text-sm">Questions? Call {BUSINESS.phone}</a>
          <p className="mt-5 text-xs text-warm-gray-600 text-center">No order or appointment is created by this estimate.</p>
        </div>
      </aside>
    </div>
  </section>;
}
