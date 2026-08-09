/**
 * The homepage's published questions and answers.
 *
 * Lifted out of `app/page.tsx` so the advisor can answer from the same words
 * the page shows, rather than a second copy that quietly drifts. The homepage
 * renders these and builds its FAQ schema from them; the advisor's knowledge
 * layer reads the same array.
 */
export interface HomepageFaq {
  readonly question: string;
  readonly answer: string;
}

export const HOMEPAGE_FAQS: readonly HomepageFaq[] = [
  {
    question: "What areas does Luxe Window Works serve?",
    answer:
      "We serve Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint, and the surrounding Kootenai County area. Free in-home consultations are available throughout Northern Idaho.",
  },
  {
    question: "What's included in the lifetime installation guarantee?",
    answer:
      "Every window treatment we professionally install is backed by a lifetime installation guarantee. If a treatment we installed develops any installation-related issue — a loose bracket, a misaligned headrail, anything tied to how it was put up — we come back and make it right for as long as you own the home.",
  },
  {
    question: "Why do you recommend cellular shades for Northern Idaho homes?",
    answer:
      "Cellular (honeycomb) shades trap air inside their hexagonal cells, making them the most energy-efficient window covering available — R-values up to 7.86 on double-cell blackout configurations. In Northern Idaho's heating-dominated climate, that translates to meaningfully lower winter heat loss and reduced summer heat gain.",
  },
] as const;
