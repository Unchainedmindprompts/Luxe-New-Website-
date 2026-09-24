import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import { ConditionalLayout } from "./ConditionalLayout";
import { MetaPixel } from "@/components/MetaPixel";
import { LandingPathCapture } from "@/components/LandingPathCapture";
import { Analytics } from "@vercel/analytics/next";
import { BUSINESS } from "@/lib/constants";

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
    "Premium custom window treatments in North Idaho — 24 years consulting, designing, and installing. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint.",
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
    url: BUSINESS.url,
    siteName: BUSINESS.name,
    title: "Luxe Window Works | Custom Window Treatments, North Idaho",
    description:
      "Premium custom window treatments — 24 years consulting, designing, and installing. Free in-home consultation. Serving North Idaho.",
    images: [
      {
        url: `${BUSINESS.url}/share-image?v=20260924`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Luxe Window Works — Beautiful options. Personal service. That’s Luxe.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Window Works | Custom Window Treatments, North Idaho",
    description:
      "Premium custom window treatments — 24 years consulting, designing, and installing. Free in-home consultation.",
    images: [`${BUSINESS.url}/share-image?v=20260924`],
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
        {/* Microsoft Clarity — production only, non-blocking */}
        {process.env.NODE_ENV === "production" && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xf9si2ousa");`}
          </Script>
        )}
      </head>
      <body className="font-sans antialiased bg-warm-white text-charcoal">
        <MetaPixel />
        <Suspense fallback={null}>
          <LandingPathCapture />
        </Suspense>
        <ConditionalLayout>{children}</ConditionalLayout>
        <Analytics />
      </body>
    </html>
  );
}
