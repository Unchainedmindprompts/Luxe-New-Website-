import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ConditionalLayout } from "./ConditionalLayout";

const inter = localFont({
  src: [
    { path: "../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const playfairDisplay = localFont({
  src: [
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.luxewindowworks.com"),
  title: {
    default: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    template: "%s | Luxe Window Works",
  },
  description:
    "Premium custom window treatments in Northern Idaho. 23 years of installer expertise serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint. Free in-home consultation.",
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
    url: "https://www.luxewindowworks.com",
    siteName: "Luxe Window Works",
    title: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    description:
      "Premium custom window treatments with two decades of hands-on expertise. Free in-home consultation. Serving Northern Idaho.",
    images: [
      {
        url: "https://www.luxewindowworks.com/images/hero-modern-living.webp",
        width: 1200,
        height: 630,
        alt: "Luxe Window Works — Custom Window Treatments in Northern Idaho",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    description:
      "Premium custom window treatments with two decades of hands-on expertise. Free in-home consultation.",
    images: ["https://www.luxewindowworks.com/images/hero-modern-living.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": "https://www.luxewindowworks.com/#business",
  name: "Luxe Window Works",
  description:
    "Luxe Window Works brings 23 years of professional window treatment expertise to Northern Idaho. Founded by Mark Abplanalp — who has designed and installed window treatments since 2002 across Washington, Oregon, and Idaho, including high-profile commercial projects for Apple — Luxe delivers premium products from family-owned manufacturers like Lafayette and Norman. Specializing in cellular shades, plantation shutters, solar shades, roller shades, and motorized window treatments. Serving Coeur d'Alene, Post Falls, Hayden, Sandpoint, and Rathdrum, Idaho.",
  url: "https://www.luxewindowworks.com",
  telephone: "208-660-8643",
  email: "mark@luxewindowworks.com",
  priceRange: "$$",
  foundingDate: "2025",
  founder: {
    "@type": "Person",
    "@id": "https://www.luxewindowworks.com/#owner",
    name: "Mark Abplanalp",
    jobTitle: "Owner & Window Treatment Specialist",
    description:
      "Mark Abplanalp has worked in the window treatment industry since 2002 — 23 years of hands-on sales, design, and installation experience. He opened his first window treatment business in Issaquah, Washington in April 2002, expanded into Bend, Oregon in 2015, and in 2023 traveled the country installing high-end window treatments for Apple retail locations including the Apple Visitor Center in Cupertino and Apple Union Square in San Francisco. He launched Luxe Window Works in Post Falls, Idaho in March 2025, focused on family-owned manufacturers and locally owned service. Mark personally handles every consultation, measurement, and installation.",
    url: "https://www.luxewindowworks.com/about",
    image: "https://www.luxewindowworks.com/_next/image?url=%2Fimages%2Fmark-photo.webp&w=3840&q=80",
    worksFor: { "@id": "https://www.luxewindowworks.com/#business" },
    knowsAbout: [
      "custom window treatments",
      "plantation shutters",
      "cellular shades",
      "motorized window treatments",
      "solar shades",
      "roller shades",
      "window treatment installation",
      "energy efficient window coverings",
      "fenestration design",
      "commercial window treatments",
      "UV mitigation",
      "heat reduction window coverings",
      "exterior solar shades",
      "Alta Window Fashions",
      "Norman Window Fashions",
      "Lafayette Interior Fashions",
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
  image: "https://www.luxewindowworks.com/images/hero-modern-living.webp",
  geo: {
    "@type": "GeoCoordinates",
    latitude: "47.736435",
    longitude: "-116.879122",
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
      opens: "09:00",
      closes: "14:00",
    },
  ],
  sameAs: [
    "https://share.google/9kubt3XEi6TrNzGKe",
    "https://www.bing.com/maps/search?toWww=1&redig=2BC026B2E32B45528048B81FC45876EE&style=r&q=Luxe+Window+Works+LLC%2C+2972+N+Pavo+Ln%2C+Post+Falls%2C+ID+83854%2C+United+States&ss=id.local_ypid%3A%22YN6F9E5AD2DAFE5C39%22&st=Luxe+Window+Works+LLC&sfa=2972+N+Pavo+Ln%2C+Post+Falls%2C+ID+83854%2C+United+States&cp=47.736435%7E-116.879120&lvl=16",
    "https://maps.apple.com/place?place-id=I907802082955E66F&address=2972+N+Pavo+Ln%2C+Post+Falls%2C+ID++83854%2C+United+States&coordinate=47.736435%2C-116.879122&name=Luxe+Window+Works&_provider=9902",
    "https://www.yelp.com/biz/luxe-window-works-post-falls",
    "https://www.bbb.org/us/id/post-falls/profile/blinds/luxe-window-works-llc-1296-1000188314",
    "https://www.yellowpages.com/post-falls-id/mip/luxe-window-works-llc-579719675",
    "https://www.instagram.com/luxewindowworks",
    "https://www.facebook.com/profile.php?id=61573190815920",
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
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* Preload hero image so the browser fetches it immediately, before JS runs */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-modern-living.webp"
          fetchPriority="high"
        />
        <Script id="facebook-pixel" strategy="lazyOnload">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','1655897412521361');
fbq('track','PageView');`}
        </Script>
      </head>
      <body className="font-sans antialiased bg-warm-white text-charcoal">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1655897412521361&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
