import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { BUSINESS } from "@/lib/constants";

const PAGE_URL = `${BUSINESS.url}/book`;
const DESCRIPTION =
  "Schedule your free in-home window treatment consultation with us. 24 years consulting, designing, and installing. Serving North Idaho, Seattle's Eastside, and the Salt Lake area — no pressure.";

export const metadata: Metadata = {
  title: "Book a Free Consultation | Luxe Window Works",
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Book a Free Consultation | Luxe Window Works",
    description:
      "Schedule your free in-home window treatment consultation with us. Serving North Idaho, Seattle's Eastside, and the Salt Lake area, with 24 years of hands-on expertise.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: `${BUSINESS.url}/images/hero-modern-living.webp`,
        width: 900,
        height: 780,
        alt: "Luxe Window Works — Book a Free In-Home Consultation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Free Consultation | Luxe Window Works",
    description:
      "Schedule your free in-home window treatment consultation with us. Serving North Idaho, Seattle's Eastside, and the Salt Lake area.",
    images: [`${BUSINESS.url}/images/hero-modern-living.webp`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const bookGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: "Book a Free Consultation | Luxe Window Works",
      description: DESCRIPTION,
      isPartOf: { "@id": `${BUSINESS.url}/#website` },
      about: { "@id": `${BUSINESS.url}/#business` },
      mainEntity: { "@id": `${BUSINESS.url}/#free-consultation-offer` },
      breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${BUSINESS.url}/images/hero-modern-living.webp`,
        width: 900,
        height: 780,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url },
        { "@type": "ListItem", position: 2, name: "Book", item: PAGE_URL },
      ],
    },
  ],
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={bookGraph} />
      {children}
    </>
  );
}
