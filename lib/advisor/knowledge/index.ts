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
};
