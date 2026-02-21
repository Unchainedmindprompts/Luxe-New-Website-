import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const geistSerif = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-playfair",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luxewindowworks.com"),
  title: {
    default: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    template: "%s | Luxe Window Works",
  },
  description:
    "Premium custom window treatments in Northern Idaho. Nearly 20 years of installer expertise serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint. Free in-home consultation.",
  keywords: [
    "window treatments",
    "custom blinds",
    "shutters",
    "shades",
    "Northern Idaho",
    "Coeur d'Alene",
    "Post Falls",
    "Hayden",
    "window coverings",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://luxewindowworks.com",
    siteName: "Luxe Window Works",
    title: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    description:
      "Premium custom window treatments with two decades of hands-on expertise. Free in-home consultation. Serving Northern Idaho.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    description:
      "Premium custom window treatments with two decades of hands-on expertise. Free in-home consultation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://luxewindowworks.com/#business",
  name: "Luxe Window Works",
  description:
    "Premium custom window treatments in Northern Idaho with extensive hands-on expertise. Specializing in cellular shades, plantation shutters, solar shades, roller shades, and motorized window treatments. Serving Coeur d'Alene, Post Falls, Hayden, Sandpoint, and Rathdrum, Idaho.",
  url: "https://luxewindowworks.com",
  telephone: "208-660-8643",
  email: "mark@luxewindowworks.com",
  priceRange: "$$",
  foundingDate: "2005",
  founder: {
    "@type": "Person",
    name: "Mark Abplanalp",
    jobTitle: "Owner & Window Treatment Specialist",
    description:
      "Mark Abplanalp founded Luxe Window Works with over 20 years of hands-on window treatment installation experience. He personally handles every consultation, measurement, and installation — serving homeowners across Northern Idaho with a lifetime installation guarantee.",
    url: "https://luxewindowworks.com",
    worksFor: { "@type": "LocalBusiness", name: "Luxe Window Works" },
    knowsAbout: [
      "custom window treatments",
      "plantation shutters",
      "cellular shades",
      "motorized window treatments",
      "solar shades",
      "roller shades",
      "window treatment installation",
      "energy efficient window coverings",
    ],
    areaServed: [
      "Coeur d'Alene, Idaho",
      "Post Falls, Idaho",
      "Hayden, Idaho",
      "Sandpoint, Idaho",
      "Northern Idaho",
    ],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "2972 N Pavo Ln",
    addressLocality: "Post Falls",
    addressRegion: "ID",
    postalCode: "83854",
    addressCountry: "US",
  },
  areaServed: [
    {
      "@type": "City",
      name: "Coeur d'Alene",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    {
      "@type": "City",
      name: "Post Falls",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    {
      "@type": "City",
      name: "Hayden",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    {
      "@type": "City",
      name: "Sandpoint",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
    {
      "@type": "City",
      name: "Rathdrum",
      containedInPlace: { "@type": "State", name: "Idaho" },
    },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Custom Window Treatments",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Cellular Shades Installation",
          description: "Energy-efficient honeycomb cellular shades custom-fitted for Northern Idaho homes.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Plantation Shutter Installation",
          description: "Custom-measured plantation shutters for lasting value and light control.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Motorized Window Shade Installation",
          description: "Smart motorized shades controllable by phone, voice, or wall switch.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Solar Shade Installation",
          description: "UV-blocking solar shades that preserve views while reducing glare.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Roller Shade Installation",
          description: "Sleek, minimal roller shades for modern Northern Idaho interiors.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Free In-Home Consultation",
          description:
            "Mark personally visits your home, measures your windows, and recommends the right solution. No pressure, no upsell.",
        },
      },
    ],
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "17:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "14:00",
    },
  ],
  sameAs: [
    "https://www.yelp.com/biz/luxe-window-works-post-falls",
    "https://www.bbb.org/us/id/post-falls/profile/blinds/luxe-window-works-llc-1296-1000188314",
    "https://share.google/pRM5IoXZgRTksImvp",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "14",
    bestRating: "5",
    worstRating: "1",
  },
  knowsAbout: [
    "window treatments",
    "custom blinds",
    "plantation shutters",
    "motorized shades",
    "cellular shades",
    "solar shades",
    "roller shades",
    "energy efficient window coverings",
    "Northern Idaho home design",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistSerif.variable}`}>
      <body className="font-sans antialiased bg-warm-white text-charcoal">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
