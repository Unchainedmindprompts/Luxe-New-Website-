/**
 * Luxe Window Advisor — knowledge assembly. (Phase B)
 *
 * The one place the four Phase A knowledge modules are wired into a single
 * `AdvisorKnowledge` value.
 *
 * Phase A's engine takes its knowledge as an argument rather than importing it,
 * which keeps every reasoning module a pure function and lets the `.mjs`
 * harnesses load them with no build step. That property is preserved here: this
 * file is the *only* module in `lib/advisor/` that imports knowledge at
 * runtime, and nothing in the reasoning path imports this file. It exists for
 * the API route, which needs one concrete value.
 */
import type { AdvisorKnowledge } from "../types";
import { PRODUCT_DIRECTIONS, CROSS_CUTTING_OPTIONS, UNREPRESENTED_SITE_PRODUCTS } from "./products";
import { PRIORITIES } from "./priorities";
import {
  RECOGNITION_RULES,
  PROMOTION_RULES,
  TRADEOFF_RULES,
  QUESTION_RULES,
  VERIFICATION_RULES,
  ESCALATION_RULES,
  CONFLICT_RULES,
  BUSINESS_POLICIES,
} from "./rules";
import { GUARDRAILS } from "./guardrails";
import { BRAND_RESPONSES } from "./brand-responses";
import {
  BUSINESS_ANSWERS,
  answerTopicsFromBusiness,
  answerTopicsFromFaqs,
} from "./answers";
import { BUSINESS, SERVICE_AREAS } from "../../constants";
import { productPages } from "../../product-data";
import { areaPages } from "../../area-data";
import { HOMEPAGE_FAQS } from "../../homepage-faqs";

/**
 * The advisor's answer knowledge, assembled rather than authored twice.
 *
 * The 74 question-and-answer pairs already published on this site — 51 across
 * the product pages, 20 across the area pages, 3 on the homepage — are read
 * here rather than copied. That is the point: a visitor asking the advisor
 * about the lifetime guarantee and a visitor reading the homepage get the same
 * sentence, and editing one edits both. Only the answers with no published home
 * (`BUSINESS_ANSWERS`) are authored in the knowledge layer itself.
 */
const PAGE_FAQS = [
  ...answerTopicsFromFaqs(HOMEPAGE_FAQS, "Published homepage FAQ", "faq-home"),
  ...Object.values(productPages).flatMap((page) =>
    answerTopicsFromFaqs(page.faqs, `Published FAQ on /products/${page.slug}`, `faq-product-${page.slug}`)
  ),
  ...Object.values(areaPages).flatMap((page) =>
    answerTopicsFromFaqs(page.faqs ?? [], `Published FAQ on /areas/${page.slug}`, `faq-area-${page.slug}`)
  ),
];

export const ANSWER_TOPICS = [
  ...BUSINESS_ANSWERS,
  ...answerTopicsFromBusiness({
    hours: BUSINESS.hours,
    phone: BUSINESS.phone,
    email: BUSINESS.email,
    serviceAreas: SERVICE_AREAS,
  }),
  ...PAGE_FAQS,
];

export const LUXE_KNOWLEDGE: AdvisorKnowledge = {
  directions: PRODUCT_DIRECTIONS,
  crossCuttingOptions: CROSS_CUTTING_OPTIONS,
  unrepresentedSiteProducts: UNREPRESENTED_SITE_PRODUCTS,
  priorities: PRIORITIES,
  recognition: RECOGNITION_RULES,
  promotions: PROMOTION_RULES,
  tradeoffs: TRADEOFF_RULES,
  questions: QUESTION_RULES,
  verifications: VERIFICATION_RULES,
  escalations: ESCALATION_RULES,
  conflicts: CONFLICT_RULES,
  guardrails: GUARDRAILS,
  businessPolicies: BUSINESS_POLICIES,
  brandResponses: BRAND_RESPONSES,
  answers: ANSWER_TOPICS,
};
