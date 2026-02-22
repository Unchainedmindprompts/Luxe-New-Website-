import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/craig/Navigation";
import Footer from "@/components/craig/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://craigabplanalp.com"),
  title: {
    default: "Craig Abplanalp | Reference-Level Home Theater & Immersive Audio",
    template: "%s | Craig Abplanalp",
  },
  description:
    "Four decades at the absolute frontier of reference-level home theater and immersive audio. THX certified. Trinnov trained. CEDIA board member. Custom Sales Manager, Definitive Audio, Bellevue WA.",
  keywords: [
    "home theater",
    "immersive audio",
    "Ascendo",
    "reference audio",
    "Craig Abplanalp",
    "Definitive Audio",
    "THX certified",
    "Trinnov",
    "CEDIA",
    "luxury home theater",
    "Dolby Atmos",
    "DTS:X",
    "custom installation",
    "Pacific Northwest",
    "Seattle",
    "Bellevue",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://craigabplanalp.com",
    siteName: "Craig Abplanalp",
    title: "Craig Abplanalp | Reference-Level Home Theater & Immersive Audio",
    description:
      "Four decades at the absolute frontier of reference-level home theater and immersive audio. THX certified. Trinnov trained. CEDIA board member.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Craig Abplanalp — Reference-Level Home Theater",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Craig Abplanalp | Reference-Level Home Theater & Immersive Audio",
    description:
      "Four decades at the absolute frontier of reference-level home theater and immersive audio. THX certified. Trinnov trained. CEDIA board member.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://craigabplanalp.com/#person",
  name: "Craig Abplanalp",
  jobTitle: "Custom Sales Manager",
  worksFor: {
    "@type": "Organization",
    name: "Definitive Audio",
    url: "https://definitive.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bellevue",
      addressRegion: "WA",
      addressCountry: "US",
    },
  },
  description:
    "Craig Abplanalp has spent four decades at the absolute frontier of reference-level home theater and immersive audio. THX Level 1 & 2 certified, Trinnov certified, CEDIA board member, and Ascendo Immersive Audio specialist.",
  url: "https://craigabplanalp.com",
  telephone: "206.650.9017",
  knowsAbout: [
    "home theater design",
    "immersive audio",
    "Ascendo Immersive Audio",
    "THX certification",
    "Trinnov Optimizer",
    "CEDIA RP22",
    "Dolby Atmos",
    "DTS:X",
    "reference audio",
    "Wilson Audio",
    "Mark Levinson",
    "Kaleidescape",
  ],
  hasCredential: [
    { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", name: "THX Level 1 Certification" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", name: "THX Level 2 Certification" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", name: "Trinnov Optimizer Certified" },
    { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", name: "CEDIA RP22 Immersive Audio Design" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className="antialiased bg-void text-pearl">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
