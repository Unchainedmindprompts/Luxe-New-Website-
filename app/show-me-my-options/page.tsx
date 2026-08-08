import type { Metadata } from "next";
import AdvisorExperience from "./AdvisorExperience";

/**
 * The Luxe Window Advisor. (Phase C)
 *
 * Replaces the fixed-choice questionnaire that lived here with a natural-
 * language conversation over the Phase B reasoning layer. The route is
 * unchanged on purpose: both inbound CTAs (the homepage and the products hub)
 * already point here, and the sitemap exclusion's stated reason — a funnel step
 * that depends on context the page itself does not provide — describes the
 * advisor at least as well as it described the questionnaire.
 *
 * Still `noindex, follow`, still excluded from the sitemap, still canonical to
 * itself. Nothing about the site's route surface moves.
 */
export const metadata: Metadata = {
  title: "Find the Right Window Treatments for Your Home — Luxe Window Works",
  description:
    "Tell us what's going on with your windows and get personalized recommendations based on your home, your priorities, and how you actually use them.",
  alternates: {
    canonical: "https://www.luxewindowworks.com/show-me-my-options",
  },
  robots: { index: false, follow: true },
};

export default function ShowMeMyOptionsPage() {
  return <AdvisorExperience />;
}
