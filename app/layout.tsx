import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ConditionalLayout } from "./ConditionalLayout";
import { Analytics } from "@vercel/analytics/next";

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
    default: "Luxe Window Works | Custom Window Treatments, North Idaho",
    template: "%s",
  },
  description:
    "Premium custom window treatments in North Idaho — 24 years of installer expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint.",
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
    title: "Luxe Window Works | Custom Window Treatments, North Idaho",
    description:
      "Premium custom window treatments — 24 years of installer expertise. Free in-home consultation. Serving North Idaho.",
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
    title: "Luxe Window Works | Custom Window Treatments, North Idaho",
    description:
      "Premium custom window treatments — 24 years of installer expertise. Free in-home consultation.",
    images: ["https://www.luxewindowworks.com/images/hero-modern-living.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
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
        <ConditionalLayout>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  );
}
