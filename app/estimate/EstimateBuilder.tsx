'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import RomanIllustration from './RomanIllustration';
import { estimateShade, type Shade, type Operation, type Product } from '@/lib/estimate';
import { estimateRemotes, remoteSystem, type AdditionalRemotes } from '@/lib/estimate-remotes';
import { BUSINESS } from '@/lib/constants';
const fresh = (id: number): Shade => ({ id, product: 'cellular', room: '', width: '', height: '', quantity: '1', light: 'light', operation: 'cordless' });
const operations: { value: Operation; title: string; detail: string }[] = [
  { value: 'cordless', title: 'Cordless', detail: 'A gentle lift by hand.' },
  { value: 'tdbu', title: 'Top-down / bottom-up', detail: 'Daylight above. Privacy below.' },
  { value: 'motor', title: 'Motorized', detail: 'Rechargeable battery + remote.' },
  { value: 'motor-tdbu', title: 'Motorized top-down / bottom-up', detail: 'Flexible privacy, with a remote.' },
];
const remoteMoney = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const productNames: Record<Product, string> = { cellular: 'Cellular shades', zebra: 'Banded (Zebra) shades', roman: 'Roman shades', roller: 'Roller shades', faux: 'Faux wood blinds' };
const details = (shade: Shade) => {
  const light = shade.light === 'dark' ? 'Room darkening' : 'Light filtering';
  const fabric = shade.product === 'faux' ? '2-inch standard · Snow White' : shade.product === 'roman' ? `Carolina · ${(shade.romanStyle ?? 'flat') === 'flat' ? 'Flat' : 'Classic'} · ${light} lining included` : shade.product === 'roller' ? `${shade.light === 'dark' ? 'Belfort' : 'Stirling'} · ${light} · Round cassette` : shade.product === 'zebra' ? `${shade.light === 'dark' ? 'Grandby / Leysin' : 'Aspen'} · ${light} · Round cassette` : `¾-inch smooth fabric · ${light}`;
  const operation = shade.product === 'faux' ? 'Cordless lift · Wand tilt · Matching valance' : operations.find(o => o.value === shade.operation)?.title;
  return { fabric, operation };
};
const field = 'mt-2 w-full rounded-xl border border-warm-gray-300 bg-white px-4 py-3 text-base text-charcoal focus:outline-none focus:ring-2 focus:ring-gold';
export default function EstimateBuilder({ onProductSelect }: { onProductSelect: (product: Product) => void }) {
  const [shades, setShades] = useState<Shade[]>([fresh(1)]);
  const [activeId, setActiveId] = useState<number | null>(1);
  const [review, setReview] = useState(false);
  const [focusTarget, setFocusTarget] = useState<{ id: string } | null>(null);
  useEffect(() => {
    if (!focusTarget) return;
    const element = document.getElementById(focusTarget.id);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [focusTarget]);
  const editWindow = (id: number) => { setReview(false); setActiveId(id); setFocusTarget({id: `window-heading-${id}`}); };
  const openReview = () => { setReview(true); setFocusTarget({id: 'estimate-review-heading'}); };
  const [nextId, setNextId] = useState(2);
  const [additionalRemotes, setAdditionalRemotes] = useState<AdditionalRemotes>({});
  const changeShades = (items: Shade[]) => {
    setShades(items);
    const active = new Set(items.map(remoteSystem));
    setAdditionalRemotes(previous => Object.fromEntries(Object.entries(previous).filter(([key]) => active.has(key as keyof AdditionalRemotes))));
  };
  const update = (id: number, patch: Partial<Shade>) => changeShades(shades.map(s => s.id === id ? { ...s, ...patch } : s));
  const remotes = estimateRemotes(shades, additionalRemotes);
  const results = shades.map(estimateShade);
  const complete = results.every(r => !r.error) && remotes.every(r => !r.error);
  const total = results.reduce((sum,r) => sum + (r.cents ?? 0), 0) + remotes.reduce((sum,r) => sum + r.cents, 0);
  const count = shades.reduce((sum,s) => sum + (Number(s.quantity) || 0), 0);
  if (review) return <section className="container-luxe py-12 md:py-16 max-w-4xl" aria-label="Estimate summary">
    <button type="button" onClick={() => { setReview(false); setFocusTarget({id:'estimate-builder-heading'}); }} className="underline underline-offset-4 mb-6 py-2">← Back to my windows</button>
    <h2 id="estimate-review-heading" tabIndex={-1} className="font-serif text-3xl md:text-4xl scroll-mt-28">Your estimate, at a glance.</h2>
    <p className="mt-3 mb-8 text-warm-gray-700">Review your windows and options. You can edit any window without starting over.</p>
    {!complete && <p role="status" className="rounded-xl bg-cream border border-gold p-4 mb-6">A few window details still need attention. Edit the marked windows to finish your total.</p>}
    <div className="space-y-4">
      {shades.map((shade,index) => <article key={shade.id} className="rounded-2xl border border-warm-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap justify-between items-start gap-3"><h3 className="font-serif text-2xl break-words min-w-0">{shade.room || `Window ${index+1}`}</h3><button type="button" onClick={() => editWindow(shade.id)} className="underline underline-offset-4 py-2" aria-label={`Edit ${shade.room || `window ${index+1}`}`}>Edit</button></div>
        <p className="font-semibold mt-2">{productNames[shade.product ?? 'cellular']}</p>
        <p className="text-sm mt-2">{shade.width || '—'}″ wide × {shade.height || '—'}″ high · Quantity {shade.quantity || '—'}</p>
        <p className="text-sm text-warm-gray-700 mt-2">{details(shade).fabric}</p>
        <p className="text-sm text-warm-gray-700 mt-2">{details(shade).operation}{shade.operation.startsWith('motor') && ' · Rechargeable battery'}</p>
        {shade.operation === 'motor' && ['zebra','roman','roller'].includes(shade.product ?? '') && <p className="text-sm text-warm-gray-700 mt-2">USB charger included per shade.</p>}
        <div className="mt-4 border-t border-warm-gray-200 pt-3">{results[index].error ? <p className="text-sm font-medium">Needs attention: {results[index].error}</p> : <p className="flex flex-wrap justify-between gap-2"><span>Window subtotal{shade.operation.startsWith('motor') && ' · remotes below'}</span><strong>{remoteMoney(results[index].cents!)}</strong></p>}</div>
      </article>)}
    </div>
    {remotes.length > 0 && <section className="rounded-2xl bg-cream border border-warm-gray-200 p-5 sm:p-6 mt-6" aria-label="Remote control summary">
      <div className="flex flex-wrap justify-between gap-3 items-center"><h3 className="font-serif text-2xl">Remote controls</h3><button type="button" className="underline py-2" onClick={() => { setReview(false); setFocusTarget({id:'estimate-remotes-heading'}); }}>Edit remotes</button></div>
      {remotes.map(remote => <div key={remote.system} className="border-t border-warm-gray-300 pt-4 mt-4 text-sm">
        <p className="font-semibold mb-2">{remote.label} · {remote.type}</p>
        <p className="flex justify-between gap-4"><span>{remote.included} included in estimate × {remoteMoney(remote.unitCents)}</span><span>{remoteMoney(remote.included * remote.unitCents)}</span></p>
        {remote.extra > 0 && <p className="flex justify-between gap-4 mt-2"><span>{remote.extra} additional × {remoteMoney(remote.unitCents)}</span><span>{remoteMoney(remote.extra * remote.unitCents)}</span></p>}
      </div>)}
      {remotes.length > 1 && <p className="text-xs mt-4">Separate remotes are estimated for these groups. We’ll confirm cross-category compatibility during your consultation.</p>}
    </section>}
    <section className="bg-charcoal text-white rounded-2xl p-6 sm:p-8 mt-6" aria-label="Estimate total">
      <h3 className="font-serif text-2xl">Your estimated total</h3>
      <p className="font-serif text-4xl sm:text-5xl mt-3 break-words">{complete ? remoteMoney(total) : 'Complete your window details'}</p>
      <p className="mt-4 text-sm text-white/85">Includes professional in-home consultation, measurements, and installation. Sales tax is not included.</p>
      <p className="mt-3 text-sm text-white/85">This is an estimate. Your final quote follows a measurement and fabric check.</p>
      <Link href="/book" className="block text-center bg-gold hover:bg-gold-dark text-charcoal font-semibold px-5 py-4 rounded-full mt-6">Book Your Free In-Home Consultation</Link>
      <p className="text-xs text-white/80 mt-4 text-center">No order or appointment is created by this estimate.</p>
    </section>
  </section>;
  return <section className="container-luxe pt-12 pb-36 md:pt-16 lg:pb-16" aria-label="Custom window treatment estimate builder">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm uppercase tracking-[.14em] text-warm-gray-600 mb-2">Your instant estimate</p><h2 id="estimate-builder-heading" tabIndex={-1} className="font-serif text-3xl scroll-mt-28">Let’s start with your windows.</h2></div><span className="rounded-full bg-linen px-4 py-2 text-sm">Blinds &amp; shades</span></div>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
      <div className="space-y-6">
        {shades.map((shade,index) => <article key={shade.id} onFocusCapture={() => onProductSelect(shade.product ?? 'cellular')} className="bg-white rounded-2xl border border-warm-gray-200 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6"><h3 id={`window-heading-${shade.id}`} tabIndex={-1} className="font-serif text-2xl scroll-mt-28 min-w-0 break-words"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-linen text-base mr-3">{index+1}</span>{shade.room || `Window ${index+1}`}</h3>{shades.length > 1 && <button type="button" aria-label={`Remove window ${index+1}`} onClick={() => { changeShades(shades.filter(x => x.id !== shade.id)); if(activeId === shade.id) setActiveId(null); setFocusTarget({id:"estimate-builder-heading"}); }} className="text-sm underline underline-offset-4 p-2">Remove</button>}</div>
          {activeId !== shade.id ? <div>
            <p className="font-semibold">{productNames[shade.product ?? 'cellular']}</p>
            <p className="text-sm mt-2">{shade.width || '—'}″ × {shade.height || '—'}″ · {details(shade).operation} · Qty {shade.quantity || '—'}</p>
            <p className="text-sm mt-2 text-warm-gray-700">{details(shade).fabric}</p>
            <div className="mt-4 flex items-center justify-between gap-4"><strong>{results[index].error ? 'Needs attention' : remoteMoney(results[index].cents!)}</strong><button type="button" aria-label={`Edit ${shade.room || `window ${index+1}`}`} onClick={() => editWindow(shade.id)} className="rounded-full border border-charcoal px-6 py-2 font-semibold">Edit</button></div>
            {results[index].error && <p className="text-sm mt-3">{results[index].error}</p>}
          </div> : <div>
          <fieldset className="mb-6"><legend className="font-semibold text-lg mb-4">Choose your window treatment.</legend><div className="grid sm:grid-cols-2 gap-3">
            {([['cellular','Cellular shades','Soft honeycomb fabric.'],['zebra','Banded (Zebra) shades','Alternating sheer and fabric bands.'],['roman','Roman shades','Soft fabric. Tailored folds.'],['roller','Roller shades','Clean lines. Smooth, simple fabric.'],['faux','Faux wood blinds','2-inch standard. White only.']] as const).map(([value,title,detail]) => <label key={value} className={`cursor-pointer rounded-xl border-2 p-5 flex gap-3 transition-colors focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 ${(shade.product ?? 'cellular')===value ? 'border-gold bg-charcoal text-white shadow-md' : 'border-gold/60 bg-[#F3EADB] text-charcoal hover:border-gold hover:bg-[#EDE0C9]'}`}><input type="radio" name={`product-${shade.id}`} checked={(shade.product ?? 'cellular')===value} onChange={() => { update(shade.id,{product:value,light:value==='faux'?'light':shade.light,operation:value==='faux'?'cordless':shade.operation.startsWith('motor')?'motor':'cordless'}); onProductSelect(value); }} className="accent-gold mt-1.5 h-4 w-4 shrink-0" /><span><span className="block font-semibold text-lg leading-snug">{title}</span><span className={`text-sm mt-2 block ${(shade.product ?? 'cellular')===value ? 'text-white/85' : 'text-warm-gray-700'}`}>{detail}</span></span></label>)}
          </div><p className="text-xs text-warm-gray-600 mt-3">{shade.product==='faux' ? '2-inch standard faux wood in Snow White. Includes cordless lift, wand tilt, and a matching valance.' : shade.product==='roller' ? 'Starting fabric collection: Stirling light filtering or Belfort room darkening. Round cassette included for a finished look. Additional fabrics are available at higher prices.' : shade.product==='roman' ? 'Starting fabric collection: Carolina (price group 103). Fabric lining included; choose light filtering or room darkening. Additional fabrics are available at higher prices.' : shade.product==='zebra' ? 'Starting fabric collection: Aspen light filtering or Grandby / Leysin room darkening. Round cassette included. Additional fabrics are available at higher prices.' : 'Based on ¾-inch smooth cellular fabrics. Prints and textured fabrics are available at an additional charge.'}</p></fieldset>
          {shade.product === 'roman' && <fieldset className="mb-7"><legend className="font-semibold text-sm mb-3">Choose your Roman style. Same price for either.</legend><div className="grid grid-cols-2 gap-3">
            {(['flat','classic'] as const).map(style => <label key={style} className={`cursor-pointer rounded-xl border p-3 sm:p-4 ${(shade.romanStyle ?? 'flat') === style ? 'border-gold bg-cream ring-1 ring-gold' : 'border-warm-gray-200'}`}>
              <RomanIllustration style={style} className="h-40 w-full mb-3" />
              <span className="flex items-center gap-2"><input type="radio" name={`roman-style-${shade.id}`} checked={(shade.romanStyle ?? 'flat') === style} onChange={() => update(shade.id,{romanStyle:style})} className="accent-charcoal" /><span className="font-medium">{style === 'flat' ? 'Flat' : 'Classic'}</span></span>
              <span className="block text-xs text-warm-gray-700 mt-2">{style === 'flat' ? 'A smooth face with no horizontal seams.' : 'Sewn horizontal bars create defined panels.'}</span>
            </label>)}
          </div></fieldset>}
          <label className="block text-sm font-medium" htmlFor={`room-${shade.id}`}>Room or window name <span className="font-normal text-warm-gray-600">(optional)</span></label>
          <input id={`room-${shade.id}`} value={shade.room} maxLength={60} onChange={e => update(shade.id,{room:e.target.value})} className={field+' mb-5'} placeholder="e.g. Living room" />
          <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_100px] gap-4">
            <label className="text-sm font-medium">Width (inches)<input aria-describedby={`size-help-${shade.id}`} inputMode="decimal" type="number" min="0" step="0.125" placeholder="36" value={shade.width} onChange={e => update(shade.id,{width:e.target.value})} className={field} /></label>
            <label className="text-sm font-medium">Height (inches)<input aria-describedby={`size-help-${shade.id}`} inputMode="decimal" type="number" min="0" step="0.125" placeholder="60" value={shade.height} onChange={e => update(shade.id,{height:e.target.value})} className={field} /></label>
            <label className="text-sm font-medium col-span-2 sm:col-span-1">Quantity<input type="number" min="1" max="50" step="1" value={shade.quantity} onChange={e => update(shade.id,{quantity:e.target.value})} className={field} /></label>
          </div>
          <p id={`size-help-${shade.id}`} className="mt-3 text-xs text-warm-gray-600">Approximate sizes are fine. We’ll confirm the measurements in your home.</p>
          {shade.product !== 'faux' && <><fieldset className="mt-7"><legend className="font-semibold text-sm mb-3">How would you like the light to feel?</legend><div className="grid sm:grid-cols-2 gap-3">
            {([['light','Light filtering','Soft daylight with everyday privacy.'],['dark','Room darkening','Fabric for a darker room.']] as const).map(([value,title,detail]) => <label key={value} className={`cursor-pointer rounded-xl border p-4 flex gap-3 ${shade.light===value ? 'border-gold bg-cream ring-1 ring-gold' : 'border-warm-gray-200'}`}><input type="radio" name={`light-${shade.id}`} value={value} checked={shade.light===value} onChange={() => update(shade.id,{light:value})} className="accent-charcoal mt-1" /><span><span className="block font-medium text-sm">{title}</span><span className="text-xs text-warm-gray-700 mt-1 block">{detail}</span></span></label>)}
          </div><p className="text-xs text-warm-gray-600 mt-2">{shade.product==='roman' ? 'Price includes fabric lining to help protect the decorative fabric from UV exposure and give the shade added structure. Choose light filtering for soft daylight or room darkening for blackout lining. Light can still enter around the edges.' : shade.product==='zebra' ? 'Room darkening when the fabric bands are closed. Zebra shades do not provide complete blackout.' : 'Light can still enter around the edges of room-darkening shades.'}</p></fieldset>
          <fieldset className="mt-7"><legend className="font-semibold text-sm mb-3">Choose your everyday convenience.</legend><div className="grid sm:grid-cols-2 gap-3">
            {operations.filter(o => shade.product === 'roman' ? o.value !== 'motor-tdbu' : (shade.product !== 'zebra' && shade.product !== 'roller') || o.value === 'cordless' || o.value === 'motor').map(o => <label key={o.value} className={`cursor-pointer rounded-xl border p-4 flex gap-3 ${shade.operation===o.value ? 'border-gold bg-cream ring-1 ring-gold' : 'border-warm-gray-200'}`}><input type="radio" name={`operation-${shade.id}`} checked={shade.operation===o.value} onChange={() => update(shade.id,{operation:o.value})} className="accent-charcoal mt-1" /><span><span className="block font-medium text-sm">{o.title}</span><span className="text-xs text-warm-gray-700 mt-1 block">{o.detail}</span></span></label>)}
          </div></fieldset></>}
          {shade.width && shade.height && results[index].error && <p role="status" className="mt-5 bg-cream rounded-lg p-4 text-sm text-warm-gray-800">{results[index].error} <Link href="/book" className="underline">Ask us about your window.</Link></p>}
          {results[index].cents !== undefined && <p className="border-t border-warm-gray-200 mt-6 pt-4 flex justify-between text-sm"><span>{shade.product === 'faux' ? 'Blind' : 'Shade'} estimate · {shade.quantity} {shade.product === 'faux' ? (Number(shade.quantity)===1?'blind':'blinds') : (Number(shade.quantity)===1?'shade':'shades')}{shade.operation.startsWith('motor') && ' · remotes below'}</span><strong>{remoteMoney(results[index].cents!)}</strong></p>}
          <button type="button" onClick={() => { setActiveId(null); setFocusTarget({id:`window-heading-${shade.id}`}); }} className="mt-6 rounded-full bg-charcoal text-white px-6 py-3 font-semibold">Done with this window</button>
          </div>}
        </article>)}
        <button type="button" disabled={shades.length>=25} onClick={() => { changeShades([...shades,fresh(nextId)]); setNextId(n=>n+1); editWindow(nextId); }} className="w-full rounded-xl border border-dashed border-warm-gray-400 py-4 font-semibold hover:bg-cream disabled:opacity-50">+ Add another window</button>
        {remotes.length > 0 && <section aria-label="Remote controls" className="rounded-2xl border border-gold/60 bg-cream p-5 sm:p-8">
          <h3 id="estimate-remotes-heading" tabIndex={-1} className="font-serif text-2xl scroll-mt-28">Your remote controls</h3>
          <p className="mt-2 text-sm text-warm-gray-700">Your estimate includes a shared remote for each shade group below. Additional remotes are optional.</p>
          {remotes.length > 1 && <p className="mt-2 text-sm text-warm-gray-700">These groups are estimated with separate remotes. We’ll confirm whether any can share a remote during your consultation.</p>}
          {remotes.map(remote => <div key={remote.system} className="mt-5 border-t border-warm-gray-300 pt-5">
            <h4 className="font-semibold">{remote.label}</h4>
            <p className="mt-1 text-sm">{remote.included} {remote.type}{remote.included > 1 ? 's' : ''} included in your total · {remoteMoney(remote.included * remote.unitCents)}</p>
            <p className="mt-1 text-xs text-warm-gray-600">{remote.system.startsWith('cellular') ? 'This cellular system uses a dedicated 15-channel remote, even for one shade.' : remote.count > 1 ? 'Control shades individually or together.' : 'One shade, one simple remote.'}{remote.count > 15 ? ' One remote is included for every 15 shades to allow individual control.' : ''}</p>
            <label htmlFor={`remotes-${remote.system}`} className="mt-4 block text-sm font-medium">Need additional remotes?</label>
            <p id={`remote-price-${remote.system}`} className="mt-1 text-sm text-warm-gray-700">Additional {remote.type}s · {remoteMoney(remote.unitCents)} each</p>
            <select id={`remotes-${remote.system}`} aria-describedby={`remote-price-${remote.system}`} value={additionalRemotes[remote.system] ?? '0'} onChange={e => setAdditionalRemotes(previous => ({...previous, [remote.system]: e.target.value}))} className={field}>
              {Array.from({length:51},(_,i) => <option key={i} value={i}>{i === 0 ? '0 — No additional remotes' : `${i} additional ${i === 1 ? 'remote' : 'remotes'}`}</option>)}
            </select>
            {remote.extra > 0 && <p className="mt-3 text-sm">Additional remotes: {remoteMoney(remote.extra * remote.unitCents)}</p>}
          </div>)}
        </section>}
      </div>
      <aside className="lg:sticky lg:top-28 rounded-2xl overflow-hidden border border-warm-gray-200">
        <div className="bg-charcoal text-white p-7"><p className="text-gold uppercase tracking-[.15em] text-xs mb-3">Your home, your way</p><h2 className="font-serif text-2xl">Your window treatment estimate</h2><div aria-live="polite" aria-atomic="true" className="mt-6">{complete ? <><p className="text-5xl font-serif">{remoteMoney(total)}</p><p className="mt-2 text-sm text-white/80">For {count} custom window {count===1?'treatment':'treatments'}</p></> : <><p className="text-3xl font-serif">Let’s put a number to it.</p><p className="text-sm text-white/80 mt-3">Enter each window’s measurements to see your total.</p></>}</div><button type="button" onClick={openReview} className="mt-6 w-full rounded-full bg-gold text-charcoal font-semibold px-4 py-3">Review My Estimate</button></div>
        <div className="bg-cream p-7"><p className="text-sm leading-relaxed text-warm-gray-700">Includes your custom blinds and shades, professional in-home consultation, measurements, and installation. Sales tax is not included. Your final quote follows a measurement and fabric check.</p>
          {remotes.length > 0 && <p className="text-sm mt-4 text-warm-gray-700">Remote controls are counted once in the total, in the Remote controls section. Motorized Banded, Roman, and Roller shades also include a USB charger per shade.</p>}
          <div className="border-t border-warm-gray-300 my-6" /><h3 className="font-serif text-xl">Like what you see?</h3><p className="mt-2 mb-5 text-sm text-warm-gray-700 leading-relaxed">We’ll bring the samples, check the fit, and help you make it yours.</p>
          <Link href="/book" className="block text-center bg-gold hover:bg-gold-dark text-charcoal font-semibold px-4 py-4 rounded-full">Book a Free Consultation</Link>
          <a href={BUSINESS.phoneHref} className="block text-center underline underline-offset-4 mt-4 text-sm">Questions? Call {BUSINESS.phone}</a>
          <p className="mt-5 text-xs text-warm-gray-600 text-center">No order or appointment is created by this estimate.</p>
        </div>
      </aside>
    </div>
    <style>{`@media (max-width: 1023px) { body:has(#estimate-mobile-bar) { padding-bottom: 100px; } html:has(#estimate-mobile-bar) { scroll-padding-bottom: 110px; } }`}</style>
    <div id="estimate-mobile-bar" className="fixed inset-x-0 bottom-0 z-40 border-t border-warm-gray-300 bg-white shadow-lg px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden" aria-label="Quick estimate review">
      <div className="mx-auto max-w-2xl flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-xs text-warm-gray-600">{complete ? 'Estimated total · before tax' : 'Your estimate'}</p><p className="font-semibold text-lg break-words">{complete ? remoteMoney(total) : 'Details needed'}</p></div><button type="button" onClick={openReview} className="shrink-0 rounded-full bg-charcoal text-white px-4 py-3 text-sm font-semibold">Review My Estimate</button></div>
    </div>
  </section>;
}
