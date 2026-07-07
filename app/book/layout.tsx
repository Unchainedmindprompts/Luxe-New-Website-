import type { Metadata } from "next";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Book a Free Consultation | Luxe Window Works",
  description:
    "Schedule your free in-home window treatment consultation with Mark Abplanalp. 24 years of installer expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint — no pressure.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/book",
  },
  openGraph: {
    title: "Book a Free Consultation | Luxe Window Works",
    description:
      "Schedule your free in-home window treatment consultation with Mark Abplanalp. Serving Northern Idaho with 24 years of hands-on expertise.",
    url: "https://www.luxewindowworks.com/book",
    type: "website",
    images: [
      {
        url: "https://www.luxewindowworks.com/images/hero-modern-living.webp",
        width: 1200,
        height: 630,
        alt: "Luxe Window Works — Book a Free In-Home Consultation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Free Consultation | Luxe Window Works",
    description:
      "Schedule your free in-home window treatment consultation with Mark Abplanalp. Serving Northern Idaho.",
    images: ["https://www.luxewindowworks.com/images/hero-modern-living.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const PAGE_URL = `${BUSINESS.url}/book`;

const webpageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: "Book a Free Consultation | Luxe Window Works",
  description:
    "Schedule your free in-home window treatment consultation with Mark Abplanalp. 24 years of installer expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint — no pressure.",
  isPartOf: { "@id": `${BUSINESS.url}/#website` },
  about: { "@id": `${BUSINESS.url}/#business` },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  inLanguage: "en-US",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BUSINESS.url}/` },
    { "@type": "ListItem", position: 2, name: "Book", item: PAGE_URL },
  ],
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
