import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Consultation | Free In-Home Window Treatment Consultation",
  description:
    "Schedule your free in-home consultation with Mark Abplanalp. 23 years of expertise. Serving Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/book",
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
