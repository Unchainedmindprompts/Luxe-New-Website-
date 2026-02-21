import Link from "next/link";
import { BUSINESS, SERVICE_AREAS, PRODUCTS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-warm-gray-300">
      <div className="container-luxe py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold text-white">
                Luxe Window Works
              </span>
              <span className="block text-xs text-warm-gray-500 tracking-widest uppercase mt-0.5">
                Northern Idaho
              </span>
            </Link>
            <p className="mt-4 text-sm text-warm-gray-400 leading-relaxed">
              Two decades of hands-on expertise in custom window treatments.
              Serving Northern Idaho with premium products and a lifetime installation guarantee.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a href={BUSINESS.phoneHref} className="flex items-center gap-2 text-warm-gray-300 hover:text-gold transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {BUSINESS.phone}
              </a>
              <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2 text-warm-gray-300 hover:text-gold transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {BUSINESS.email}
              </a>
              <p className="flex items-start gap-2 text-warm-gray-400">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {BUSINESS.address.full}
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Products
            </h3>
            <ul className="space-y-2.5">
              {PRODUCTS.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-sm text-warm-gray-400 hover:text-gold transition-colors"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Service Areas
            </h3>
            <ul className="space-y-2.5">
              {SERVICE_AREAS.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/areas/${area.slug}`}
                    className="text-sm text-warm-gray-400 hover:text-gold transition-colors"
                  >
                    {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Reviews */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Hours
            </h3>
            <ul className="space-y-1.5 text-sm text-warm-gray-400">
              {BUSINESS.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day.slice(0, 3)}</span>
                  <span>{h.open ? `${h.open} – ${h.close}` : "Closed"}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-warm-gray-800">
              <p className="text-xs text-warm-gray-500 mb-3 uppercase tracking-wider">Reviews</p>
              <div className="flex flex-col gap-2">
                <a
                  href={BUSINESS.google.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-warm-gray-400 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Google · 5.0 ★ ({BUSINESS.google.reviewCount})
                </a>
                <a
                  href={BUSINESS.yelp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-warm-gray-400 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  Yelp Reviews
                </a>
                <a
                  href={BUSINESS.bbb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-warm-gray-400 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm5 8h-3v-6h3c1.66 0 3 1.34 3 3s-1.34 3-3 3zm0-4h-1v2h1c.55 0 1-.45 1-1s-.45-1-1-1z"/>
                  </svg>
                  BBB Profile
                </a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-warm-gray-800">
              <p className="text-xs text-warm-gray-500 mb-2">Brands We Carry</p>
              <div className="flex gap-4 text-sm text-warm-gray-400">
                {BUSINESS.brands.map((brand) => (
                  <span key={brand}>{brand}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-warm-gray-800">
        <div className="container-luxe py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-warm-gray-500">
          <p>&copy; {new Date().getFullYear()} Luxe Window Works. All rights reserved.</p>
          <p>Custom window treatments for Northern Idaho homes.</p>
        </div>
      </div>
    </footer>
  );
}
