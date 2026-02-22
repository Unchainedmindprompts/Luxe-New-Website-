import type { Metadata } from "next";
import PageHero from "@/components/craig/PageHero";
import ContactClient from "@/components/craig/ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation with Craig Abplanalp. Reference-level immersive audio begins with an honest discussion. No sales pitch — just clarity on what's possible.",
  openGraph: {
    title: "Contact | Craig Abplanalp",
    description:
      "Reference-level immersive audio begins with a conversation. No sales pitch — just an honest discussion about what's possible.",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk."
        subtitle="If you've read this far, you already know what you're looking for. So do I."
      />
      <ContactClient />
    </>
  );
}
