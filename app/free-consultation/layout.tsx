import type { Metadata } from "next";

const PAGE_URL = "https://www.luxewindowworks.com/free-consultation";

export const metadata: Metadata = {
  title: "Free In-Home Consultation | Luxe Window Works",
  description:
    "We help you choose the right blinds, shades, shutters, draperies, or motorized options for your space — then professionally measure and install everything. Serving North Idaho.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Free In-Home Consultation | Luxe Window Works",
    description:
      "Custom window treatments, brought to your home. No showroom trip. No guesswork.",
    url: PAGE_URL,
    type: "website",
    images: [
      {
        url: "https://www.luxewindowworks.com/images/free-consultation-hero.jpg",
        width: 1536,
        height: 1024,
        alt: "Living room with layered honeycomb shades",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free In-Home Consultation | Luxe Window Works",
    description:
      "Custom window treatments, brought to your home. No showroom trip. No guesswork.",
    images: ["https://www.luxewindowworks.com/images/free-consultation-hero.jpg"],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function FreeConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
