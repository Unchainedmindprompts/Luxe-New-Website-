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
      "Premium custom window treatments with nearly 20 years of hands-on expertise. Free in-home consultation. Serving Northern Idaho.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxe Window Works | Custom Window Treatments in Northern Idaho",
    description:
      "Premium custom window treatments with nearly 20 years of hands-on expertise. Free in-home consultation.",
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
    <html lang="en" className={`${geistSans.variable} ${geistSerif.variable}`}>
      <body className="font-sans antialiased bg-warm-white text-charcoal">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
