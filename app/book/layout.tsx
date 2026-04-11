import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Consultation | Luxe Window Works",
  description:
    "Schedule your free in-home window treatment consultation with Mark Abplanalp. 23 years of expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint — no pressure, no obligation.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/book",
  },
  openGraph: {
    title: "Book a Free Consultation | Luxe Window Works",
    description:
      "Schedule your free in-home window treatment consultation with Mark Abplanalp. Serving Northern Idaho with 23 years of hands-on expertise.",
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

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
