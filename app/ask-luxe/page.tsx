import type { Metadata } from "next";
import AdvisorExperience from "./AdvisorExperience";

/**
 * Ask Luxe — the Luxe Window Works help desk.
 *
 * Moved here from `/show-me-my-options`, which promised a catalogue and
 * delivered a conversation. A visitor arriving at "Show Me My Options" expects
 * to browse products; what this page actually does is answer whatever they came
 * to ask — what happens during the visit, whether there is a minimum, what it
 * costs — with product reasoning as one capability rather than the premise.
 * The old path 301s here.
 *
 * Still `noindex, follow`, still excluded from the sitemap, still canonical to
 * itself. Whether a genuinely useful Q&A page should be indexed is a real
 * decision and is deliberately not being made as a side effect of a rename.
 */
export const metadata: Metadata = {
  title: "Ask Luxe — Luxe Window Works",
  description:
    "Ask us anything about window treatments, your home, our products, how our consultations work, or Luxe Window Works.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/ask-luxe",
  },
  robots: { index: false, follow: true },
};

export default function AskLuxePage() {
  return <AdvisorExperience />;
}
