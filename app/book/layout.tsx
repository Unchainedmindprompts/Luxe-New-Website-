import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Consultation — Luxe Window Works",
  description:
    "Book a free in-home window treatment consultation in Coeur d'Alene, Post Falls & Hayden. Mark personally visits, measures, and recommends — no pressure, no obligation.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
