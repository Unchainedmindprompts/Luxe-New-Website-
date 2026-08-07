/**
 * Luxe Window Advisor — customer priority catalogue. (Phase A)
 *
 * Every priority the approved brief names, with the clarifying question that
 * distinguishes it from the ones next to it. The `clarifies` text exists
 * because the brief's critical global rule is that consumer terminology is
 * imprecise: "I want privacy" and "I want the room dark" are different
 * requirements that a homeowner will often use interchangeably, and the advisor
 * has to be able to tell them apart before it recommends anything.
 *
 * Order in this array carries no meaning. Priority *rank* lives on
 * `ProjectFacts.priorities`, supplied per project.
 */
import type { PriorityDefinition } from "../types";

export const PRIORITIES: readonly PriorityDefinition[] = [
  {
    id: "budget",
    label: "Budget",
    clarifies: "How much cost sensitivity constrains the direction, not a dollar figure.",
  },
  {
    id: "functionality",
    label: "Functionality",
    clarifies: "The covering has to do a job reliably, ahead of how it looks.",
  },
  {
    id: "aesthetics",
    label: "Aesthetics / interior design",
    clarifies: "How the treatment contributes to the room's design, independent of performance.",
  },
  {
    id: "energy-efficiency",
    label: "Energy efficiency",
    clarifies: "Reducing heat loss and heat gain through the glass.",
  },
  {
    id: "room-darkening",
    label: "Room darkening",
    clarifies:
      "How dark the room must get. Distinct from privacy — a room can be fully private and still bright.",
  },
  {
    id: "privacy",
    label: "Privacy",
    clarifies:
      "Whether people can see in, and when. Daytime and nighttime privacy are different problems.",
  },
  {
    id: "view-preservation",
    label: "Preserving the view",
    clarifies: "Seeing out while the treatment is deployed, not only when it is raised.",
  },
  {
    id: "glare-control",
    label: "Glare control",
    clarifies: "Comfort on screens and surfaces. Achievable without full darkening.",
  },
  {
    id: "child-safety",
    label: "Child safety",
    clarifies: "Cord and operating-system safety in rooms children use.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    clarifies: "Whether the person operating the covering can physically reach and work it.",
  },
  {
    id: "convenience",
    label: "Convenience",
    clarifies: "Effort of daily operation, which may or may not mean motorization.",
  },
  {
    id: "motorization",
    label: "Motorization",
    clarifies:
      "Interest in powered operation as an outcome in itself, separate from whether a window needs it.",
  },
  {
    id: "durability",
    label: "Durability",
    clarifies: "Expected service life under the room's actual conditions.",
  },
  {
    id: "moisture-resistance",
    label: "Moisture resistance",
    clarifies: "Tolerance of humidity, and separately of direct water contact.",
  },
  {
    id: "clear-glass-when-open",
    label: "Clear glass when open",
    clarifies:
      "Whether the window must be fully unobstructed when the covering is open — the question that separates a shade from a blind.",
  },
  {
    id: "directional-light-control",
    label: "Directional light control",
    clarifies:
      "Aiming light up or down through the day without raising the covering — what louvers do.",
  },
  {
    id: "lifestyle-requirement",
    label: "Special lifestyle requirement",
    clarifies:
      "Shift work, sleep sensitivity, media use, pets, or another constraint specific to the household.",
  },
];
