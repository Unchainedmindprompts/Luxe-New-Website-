/**
 * Luxe Window Advisor — approved answers to non-product questions. (Ask Luxe)
 *
 * WHAT A VISITOR ASKS IS USUALLY NOT "WHICH SHADE". It is what happens during
 * the visit, whether there is a minimum, how long it takes, what happens if
 * something breaks, roughly what it costs. Before this existed the advisor had
 * no approved source for any of that, and a model with no source does not say
 * "I don't know" — it produces something plausible. Live testing returned a
 * reply about bathroom moisture to someone asking how cellular and roller
 * shades differ, and one about glare to someone asking the opening hours.
 *
 * TWO KINDS OF ANSWER LIVE HERE.
 *
 *   1. BUSINESS ANSWERS, written for this purpose and approved as wording.
 *      Policy, timing, warranty, pricing, the consultation itself.
 *
 *   2. PAGE ANSWERS, adapted from the 74 question-and-answer pairs already
 *      published on the site. Those are `answerTopicsFromFaqs`, which is a
 *      pure function precisely so the text stays in one place — the pages own
 *      it, this reads it, and neither can drift from the other.
 *
 * Business answers outrank page answers on a tie. A page FAQ that happens to
 * share a word should never displace the policy a visitor actually asked for.
 *
 * Nothing here is a guarantee. Timing is "approximately" and "typically"
 * because it depends on a manufacturer, and the guardrail layer still runs
 * over everything the model writes from it.
 */
import type { AnswerTopic, BusinessHours, ServiceArea } from "../types";

/** Shape of the site's published FAQ pairs, so no page module is imported here. */
export interface PublishedFaq {
  readonly question: string;
  readonly answer: string;
}

// ───────────────────────── approved business answers ────────────────────────

/**
 * Written for the advisor and approved as wording. Everything a visitor needs
 * in order to feel comfortable booking, and nothing beyond what Luxe has
 * actually committed to.
 */
export const BUSINESS_ANSWERS: readonly AnswerTopic[] = [
  {
    id: "consultation-what-happens",
    source: "Approved — mirrors the process published on /book",
    question: "What happens during an in-home consultation?",
    answer:
      "We come to your home, look at the windows and how you actually use the space, and talk through what you are trying to accomplish. We show you the products and fabrics that suit the room, measure professionally, and give you pricing for the project. There is no pressure and no obligation, and you do not need to know what you want before we arrive.",
    terms: ["consultation", "in-home", "appointment", "visit", "come out", "expect", "happens", "process", "obligation", "what happens", "your consultation", "the consultation"],
    requires: ["consultation", "appointment", "visit", "come out", "come to my house", "in home", "in-home"],
    priority: "business",
    invitesConsultation: true,
  },
  {
    id: "consultation-no-pressure",
    source: "Approved — mirrors the no-upsell positioning published on /book",
    question: "Will I be pressured to buy?",
    answer:
      "No. We walk you through what we would recommend and why, and that is it — no upsell, no pressure. The consultation is free and there is no obligation to order anything.",
    terms: ["pressure", "pressured", "pushy", "salesy", "hard sell", "upsell", "obligation", "obligated", "be pressured", "any pressure", "high pressure"],
    requires: ["pressure", "pressured", "pushy", "hard sell", "upsell", "obligation", "obligated", "salesman", "sales pitch"],
    priority: "business",
  },
  {
    id: "installation-guarantee",
    source: "Approved — published verbatim in the homepage FAQ",
    question: "What's included in the lifetime installation guarantee?",
    answer:
      "Every window treatment we professionally install is backed by a lifetime installation guarantee. If a treatment we installed develops any installation-related issue — a loose bracket, a misaligned headrail, anything tied to how it was put up — we come back and make it right for as long as you own the home.",
    terms: ["guarantee", "lifetime", "installation", "workmanship", "bracket", "headrail", "lifetime guarantee", "installation guarantee"],
    requires: ["guarantee", "lifetime", "workmanship"],
    priority: "business",
  },
  {
    id: "product-service-and-warranty",
    source: "Approved — new canonical Luxe knowledge",
    answer:
      "If a product you purchased from Luxe has an issue, just call or email us and we'll come out and take care of it. Most of the products we sell include a limited lifetime warranty for the original purchaser, and the manufacturer will determine whether the product is repaired or replaced. If the product can't be repaired in the home and the issue occurs after the first year, the customer is responsible for shipping costs, but the covered repair itself is free.",
    question: "What happens if something I bought from Luxe breaks?",
    terms: ["warranty", "broken", "breaks", "broke", "repair", "replaced", "fix", "stopped working", "defect", "damaged", "bought from you", "purchased from you", "if it breaks", "if something breaks"],
    requires: ["warranty", "break", "breaks", "broke", "broken", "repair", "replace", "fix", "defect", "stopped working", "damaged", "service"],
    priority: "business",
  },
  {
    id: "no-service-of-outside-products",
    source: "Approved — existing Luxe business policy",
    question: "Do you service window treatments you didn't sell?",
    answer:
      "We only service what we sold and installed. If another company supplied the product, they are the right people to sort it out — but we are always happy to talk about replacing it.",
    terms: ["service", "repair", "fix", "didn't install", "did not install", "somebody else", "another company", "someone else", "existing", "you didn't"],
    requires: ["didn't sell", "did not sell", "didn't install", "did not install", "someone else", "somebody else", "another company", "not from you", "elsewhere"],
    priority: "business",
  },
  {
    id: "project-minimum",
    source: "Approved — new canonical Luxe knowledge",
    question: "Is there a minimum project size?",
    answer:
      "There is no project minimum. Luxe is happy to help with anything from a single window to a whole home or commercial project.",
    terms: ["minimum", "too small", "one window", "single window", "just one", "small job", "small project", "only need", "project minimum", "a single window"],
    requires: ["minimum", "too small", "one window", "single window", "just one", "small job", "small project", "a couple of windows"],
    priority: "business",
    invitesConsultation: true,
  },
  {
    id: "order-and-install-timing",
    source: "Approved — new canonical Luxe knowledge",
    question: "How long does it take after ordering?",
    answer:
      "Most projects are installed approximately four weeks after the order is placed. Shutters typically take about six to eight weeks, depending on the manufacturer.",
    terms: ["how long", "lead time", "turnaround", "weeks", "timeline", "wait", "after ordering", "shutters", "take to get", "how long does"],
    requires: ["how long", "lead time", "turnaround", "weeks", "timeline", "take to", "after i order", "after ordering", "when will"],
    priority: "business",
  },
  {
    id: "appointment-availability",
    source: "Approved — existing Luxe business policy",
    question: "How soon can you come out?",
    answer:
      "Appointments can usually be scheduled within about 48 to 72 hours. We cannot promise a specific time until we check the calendar, but it is rarely a long wait.",
    terms: ["how soon", "availability", "available", "schedule", "come out", "get someone", "how quickly", "how soon can"],
    requires: ["how soon", "how quickly", "when can you", "available", "availability", "come out", "get someone out", "book"],
    priority: "business",
    invitesConsultation: true,
  },
  {
    id: "pricing",
    source: "Approved — new canonical Luxe knowledge",
    question: "How much do custom window treatments cost?",
    answer:
      "Every project is custom, so pricing depends on the product, window size, fabric, operating system and installation requirements. During your free in-home consultation, Luxe measures the actual windows, reviews the appropriate options with you, and provides project-specific pricing. We don't publish generic price ranges because they can be misleading without knowing the actual application.",
    terms: ["cost", "costs", "price", "prices", "pricing", "expensive", "quote", "estimate", "afford", "ballpark", "how much do", "how much does", "price range"],
    requires: ["cost", "costs", "price", "prices", "pricing", "expensive", "quote", "estimate", "ballpark", "afford"],
    priority: "business",
    invitesConsultation: true,
  },
  {
    id: "financing",
    source: "Approved — existing Luxe business policy",
    question: "Do you offer financing?",
    answer: "We don't offer financing.",
    terms: ["financing", "finance", "payment plan", "installments", "pay monthly", "offer financing", "do you finance"],
    requires: ["financing", "finance", "payment plan", "installment", "pay over time", "monthly payments"],
    priority: "business",
  },
  {
    id: "residential-and-commercial",
    source: "Approved — existing Luxe business policy",
    question: "Do you do commercial work?",
    answer: "Yes — Luxe works on both residential and commercial projects.",
    terms: ["commercial", "office", "residential", "restaurant", "clinic", "commercial work", "commercial projects", "our office"],
    requires: ["commercial", "office building", "my business", "our office", "restaurant", "residential"],
    priority: "business",
  },
  {
    id: "measuring-and-installation",
    source: "Approved — existing Luxe business policy",
    question: "Do you measure and install?",
    answer:
      "Yes. Luxe measures professionally and installs everything we sell — you do not need to measure anything yourself, and getting it exactly right is our job, not yours.",
    terms: ["measure", "measuring", "install", "installation", "myself", "do you measure", "do the measuring", "professionally installed"],
    requires: ["measure", "measuring", "install", "installation", "do it myself", "diy"],
    priority: "business",
    invitesConsultation: true,
  },
];

// ─────────────────────── answers built from site data ───────────────────────

const STOPWORDS = new Set([
  "what", "whats", "which", "when", "where", "does", "doesn", "with", "from",
  "that", "this", "they", "them", "your", "you", "for", "the", "and", "are",
  "can", "how", "why", "will", "should", "would", "have", "has", "into", "out",
  "about", "than", "then", "there", "their", "its", "it", "in", "on", "of", "to",
  "a", "an", "is", "do", "did", "be", "or", "my", "our", "we", "us", "if", "not",
  "get", "got", "make", "much", "many", "more", "most", "best", "better", "good",
]);

const keywords = (text: string): readonly string[] => [
  ...new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9']+/)
      .filter((word) => word.length >= 4 && !STOPWORDS.has(word))
  ),
];

/**
 * Adapts already-published question-and-answer pairs into answer topics.
 *
 * A PURE FUNCTION ON PURPOSE. The pages own this text and this reads it, so
 * there is exactly one copy of every sentence and no possibility of the advisor
 * telling a visitor something the site contradicts. It also keeps this module
 * free of runtime imports, which is what lets the test harnesses load the whole
 * knowledge layer with no build step.
 */
export function answerTopicsFromFaqs(
  faqs: readonly PublishedFaq[],
  sourceLabel: string,
  idPrefix: string
): readonly AnswerTopic[] {
  return faqs.map((faq, index) => {
    const terms = keywords(faq.question);
    return {
      id: `${idPrefix}-${index + 1}`,
      source: sourceLabel,
      question: faq.question,
      answer: faq.answer,
      terms,
      // A published FAQ has no hand-written gate, so its own distinctive words
      // are the gate. Short, generic questions simply match less often, which
      // is the right failure: a weak match must not beat "we don't have that".
      requires: terms,
      priority: "page",
    };
  });
}

// ───────────────────── answers built from site constants ────────────────────

/**
 * Hours and service area come from the same structured constants the footer
 * and the schema render, so the advisor cannot state a stale Saturday closing
 * time after someone edits the business record.
 */
export function answerTopicsFromBusiness(input: {
  readonly hours: readonly BusinessHours[];
  readonly phone: string;
  readonly email: string;
  readonly serviceAreas: readonly ServiceArea[];
}): readonly AnswerTopic[] {
  const open = input.hours.filter((day) => day.open && day.close);
  const closed = input.hours.filter((day) => !day.open || !day.close);
  const sameHours = open.filter((day) => day.open === open[0]?.open && day.close === open[0]?.close);

  // Collapse identical weekdays rather than reciting seven lines at someone who
  // asked a one-line question.
  const weekday = sameHours.length >= 5 ? sameHours.slice(0, 5) : [];
  const rest = open.filter((day) => !weekday.includes(day));
  const parts = [
    weekday.length
      ? `${weekday[0].day} to ${weekday[weekday.length - 1].day}, ${weekday[0].open} to ${weekday[0].close}`
      : "",
    ...rest.map((day) => `${day.day}, ${day.open} to ${day.close}`),
    closed.length ? `closed ${closed.map((day) => day.day).join(" and ")}` : "",
  ].filter(Boolean);

  const areas = input.serviceAreas.map((area) => area.name);

  return [
    {
      id: "business-hours",
      source: "Generated from BUSINESS.hours in lib/constants.ts",
      question: "What are your hours?",
      answer: `We're open ${parts.join(", ")}. You can reach us at ${input.phone} or ${input.email}.`,
      terms: ["hours", "open", "closed", "weekend", "saturday", "sunday", "phone", "email", "contact", "your hours", "what time", "phone number", "reach you", "open on"],
      requires: ["hours", "open", "closed", "what time", "phone number", "call you", "email", "contact", "reach you", "get hold"],
      priority: "business",
    },
    {
      id: "service-areas",
      source: "Generated from SERVICE_AREAS in lib/constants.ts",
      question: "What areas do you serve?",
      answer: `We serve ${areas.slice(0, -1).join(", ")} and ${areas[areas.length - 1]}, plus the surrounding Kootenai County area. If you're a little outside that, ask — we'll let you know rather than guess.`,
      terms: ["area", "areas", "serve", "service area", "location", "cover", "travel", "county", "do you serve", "areas do you", ...areas.map((a) => a.toLowerCase())],
      requires: ["area", "areas", "serve", "service", "cover", "travel", "come to", "located", "county", ...areas.map((a) => a.toLowerCase())],
      priority: "business",
    },
  ];
}
