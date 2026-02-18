import { Metadata } from "next";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | Free In-Home Consultation",
  description: `Contact ${BUSINESS.name} for a free in-home consultation. Call ${BUSINESS.phone} or fill out our form. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.`,
  openGraph: {
    title: "Contact Luxe Window Works",
    description: "Schedule your free in-home window treatment consultation in Northern Idaho.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 overflow-hidden min-h-[350px] md:min-h-[400px] flex items-center">
        <Image
          src="/images/top-down-bottom-up-shades.jpeg"
          alt="Living room with top-down bottom-up shades overlooking a lake"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="container-luxe relative max-w-4xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
            Let&apos;s Talk About Your Windows
          </h1>
          <p className="mt-4 text-lg text-warm-gray-200 leading-relaxed">
            Whether you know exactly what you need or just know something needs to change —
            Mark is here to help. Every project starts with a free, no-pressure in-home consultation.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-warm-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-charcoal mb-8">Get in Touch</h2>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Phone</p>
                    <a href={BUSINESS.phoneHref} className="text-warm-gray-600 hover:text-gold transition-colors text-lg">
                      {BUSINESS.phone}
                    </a>
                    <p className="text-sm text-warm-gray-500 mt-1">Call or text anytime</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Email</p>
                    <a href={`mailto:${BUSINESS.email}`} className="text-warm-gray-600 hover:text-gold transition-colors">
                      {BUSINESS.email}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal">Location</p>
                    <p className="text-warm-gray-600">{BUSINESS.address.full}</p>
                    <p className="text-sm text-warm-gray-500 mt-1">
                      Serving Coeur d&apos;Alene, Post Falls, Hayden, Rathdrum & Sandpoint
                    </p>
                  </div>
                </div>
              </div>

              {/* Free consultation callout */}
              <div className="mt-10 bg-cream rounded-2xl p-6 border border-warm-gray-200/60">
                <h3 className="font-serif text-lg text-charcoal mb-2">
                  Free In-Home Consultation
                </h3>
                <p className="text-sm text-warm-gray-600 leading-relaxed">
                  Mark comes to you — no showroom visit required. He&apos;ll measure your windows,
                  discuss your needs, show you samples in your actual space and light, and provide
                  a complete quote. No obligation, no pressure.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 sm:p-8 md:p-10 shadow-sm">
                <h2 className="font-serif text-2xl text-charcoal mb-2">
                  Request Your Free Consultation
                </h2>
                <p className="text-warm-gray-500 text-sm mb-8">
                  Fill out the form below and Mark will get back to you promptly.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
