/**
 * Luxe Window Advisor — hard guardrails. (Phase A)
 *
 * These are prohibitions, not preferences. Everything else in this domain layer
 * shapes what the advisor should lean toward; this file states what it may
 * never say regardless of how the reasoning went.
 *
 * Two scopes:
 *
 *   always       in force on every assessment
 *   conditional  surfaced when the project makes the prohibition live, so a
 *                later phase can put the relevant ones in front of a model
 *                rather than the whole list every time
 *
 * `permittedInstead` is deliberately part of the record. A prohibition with no
 * sanctioned alternative tends to get worked around; giving the allowed
 * formulation alongside the ban is what makes the rule usable.
 *
 * `source` names the section of the approved brief each rule came from, so a
 * future reviewer can check the encoding against the business decision rather
 * than against this file's own wording.
 */
import type { Condition, Guardrail } from "../types";

const EXTERIOR_IN_PLAY: Condition = {
  any: [
    { requestedProduct: "exterior-solar" },
    { requestedFeature: "free-hanging-exterior-shade" },
    { requestedFeature: "battery-powered-exterior" },
    { has: "high-wind-exposure" },
    { has: "unknown-mounting-substrate" },
    { has: "no-hardwired-power" },
    {
      all: [
        { fact: "solarHeat", is: ["severe"] },
        {
          any: [
            { priority: "view-preservation", withinTop: 3 },
            { fact: "viewImportance", is: ["high", "critical"] },
          ],
        },
      ],
    },
  ],
};

export const GUARDRAILS: readonly Guardrail[] = [
  // ── always in force ───────────────────────────────────────────────────────
  {
    id: "no-fabricated-manufacturer-specification",
    prohibition: "Never invent or state a manufacturer specification.",
    scope: "always",
    permittedInstead:
      "Describe behaviour in the terms the approved Luxe knowledge uses, and say that Luxe will confirm the manufacturer's specification for the selected product.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-invented-products",
    prohibition: "Never invent a product Luxe carries.",
    scope: "always",
    permittedInstead:
      "Stay inside the product directions declared in this domain layer. If a category is not represented, say Luxe will cover it at the consultation.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-fabricated-pricing",
    prohibition: "Never fabricate pricing or give a price figure.",
    scope: "always",
    permittedInstead:
      "Explain what drives cost in the direction being discussed, and that project pricing comes from the in-home consultation.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-binding-quote",
    prohibition: "Never generate a binding quote.",
    scope: "always",
    permittedInstead: "Offer the free in-home consultation, where Luxe provides project pricing.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-guaranteed-fit",
    prohibition: "Never guarantee that a product will fit an opening.",
    scope: "always",
    permittedInstead: "State that Luxe measures professionally and confirms fit at the opening.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-pretended-measurement",
    prohibition: "Never imply that a window has been measured, or that any physical inspection has happened.",
    scope: "always",
    permittedInstead: "Be explicit that this is direction based on what the homeowner has described.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-substitute-for-professional-measurement",
    prohibition: "Never present advisor output as a substitute for professional measurement.",
    scope: "always",
    permittedInstead:
      "Frame the output as the start of a consultation, with measurement and final product selection happening in the home.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-guaranteed-manufacturer-availability",
    prohibition: "Never guarantee that a manufacturer, fabric, colour or option is available.",
    scope: "always",
    permittedInstead: "Say Luxe will confirm current availability.",
    source: "HARD GUARDRAILS",
  },
  {
    id: "no-financing",
    prohibition: "Never promise or imply financing. Luxe does not offer financing.",
    scope: "always",
    permittedInstead: "Say nothing about financing.",
    source: "KNOWN LUXE BUSINESS RULES / HARD GUARDRAILS",
  },
  {
    id: "no-service-of-products-luxe-did-not-sell",
    prohibition: "Never claim or imply that Luxe will service a product it did not sell.",
    scope: "always",
    permittedInstead:
      "Say that Luxe services what it sells, and offer the consultation for a replacement or new project.",
    source: "KNOWN LUXE BUSINESS RULES / HARD GUARDRAILS",
  },
  {
    id: "no-guaranteed-appointment-availability",
    prohibition:
      "Never guarantee appointment availability or a specific appointment time.",
    scope: "always",
    permittedInstead:
      "Consultations can usually be scheduled within approximately 48-72 hours — offer to schedule, do not promise a slot.",
    source: "KNOWN LUXE BUSINESS RULES / HARD GUARDRAILS",
  },
  {
    id: "no-recommendation-from-product-name-alone",
    prohibition:
      "Never recommend a product solely because the homeowner named it. Consumer terminology is imprecise.",
    scope: "always",
    permittedInstead:
      "Clarify what the homeowner wants the treatment to do, then recommend against that — acknowledging their request rather than ignoring it.",
    source: "CRITICAL GLOBAL RULE / HARD GUARDRAILS",
  },
  {
    id: "no-owner-personal-name",
    prohibition:
      "Never use the owner's personal name in the advisor experience, and never use the phrasing 'Prefer to talk with Mark?'.",
    scope: "always",
    permittedInstead:
      "Luxe Window Works, Luxe, our team, our consultation, we'll evaluate, we'll confirm. Avoid language that makes Luxe look like a one-person operation.",
    source: "IMPORTANT BRAND RULE",
  },
  {
    id: "no-unconfirmed-service-area-promise",
    prohibition: "Never promise service to a distant location without confirmation.",
    scope: "always",
    permittedInstead:
      "Luxe serves its normal North Idaho market; anything beyond that is confirmed before it is promised.",
    source: "KNOWN LUXE BUSINESS RULES",
  },

  // ── conditional ───────────────────────────────────────────────────────────
  {
    id: "no-total-blackout-guarantee",
    prohibition:
      "Never promise total blackout. No product in the Luxe range delivers it — perimeter light gaps remain, shutters pass light at the louver and stile interfaces, and light trim can make gaps look brighter through a halo effect.",
    scope: "conditional",
    when: {
      any: [
        { fact: "roomDarkening", is: ["maximum", "total-blackout-requested"] },
        { requestedFeature: "total-blackout" },
        { priority: "room-darkening", withinTop: 2 },
      ],
    },
    permittedInstead:
      "Room-darkening cellular is Luxe's strongest direction for a very dark room. Describe it as room darkening, name the perimeter gaps honestly, and let the consultation address them.",
    source: "PRODUCT KNOWLEDGE — CELLULAR / HARD GUARDRAILS",
  },
  {
    id: "no-guaranteed-temperature-reduction",
    prohibition: "Never state an exact or guaranteed temperature reduction.",
    scope: "conditional",
    when: {
      any: [
        { fact: "solarHeat", is: ["moderate", "severe"] },
        { priority: "energy-efficiency", withinTop: 3 },
      ],
    },
    permittedInstead:
      "Luxe experience suggests exterior shading creates a very substantial comfort difference compared with interior-only shading. Say that; do not attach a number.",
    source: "PRODUCT KNOWLEDGE — EXTERIOR SOLAR / HARD GUARDRAILS",
  },
  {
    id: "no-guaranteed-wind-performance",
    prohibition: "Never guarantee wind performance for an exterior system.",
    scope: "conditional",
    when: EXTERIOR_IN_PLAY,
    permittedInstead:
      "Wind is a major design consideration; most systems should be retracted in substantial wind unless that specific product is engineered and rated for those conditions, which Luxe confirms.",
    source: "PRODUCT KNOWLEDGE — EXTERIOR SOLAR / HARD GUARDRAILS",
  },
  {
    id: "no-mounting-safety-claim-without-inspection",
    prohibition:
      "Never claim an exterior mounting condition is structurally safe without inspection.",
    scope: "conditional",
    when: EXTERIOR_IN_PLAY,
    permittedInstead:
      "Name the substrates that matter — stone, fascia, soffit, siding, structural framing — and say Luxe evaluates the mounting on site.",
    source: "PRODUCT KNOWLEDGE — EXTERIOR SOLAR / HARD GUARDRAILS",
  },
  {
    id: "no-guaranteed-maximum-size",
    prohibition:
      "Never promise a maximum product size without manufacturer-specific verification.",
    scope: "conditional",
    when: {
      any: [
        { has: "very-wide" },
        { has: "extremely-tall-narrow" },
        { has: "large-architectural-glass" },
      ],
    },
    permittedInstead:
      "Name the real constraints — tube deflection, fabric waves, structural loads, lift-system stress — and confirm sizes against the manufacturer at the consultation.",
    source: "PRODUCT KNOWLEDGE — EXTERIOR SOLAR / WOOD BLINDS",
  },
  {
    id: "no-guaranteed-nighttime-privacy-from-solar",
    prohibition:
      "Never represent a solar shade as providing guaranteed nighttime privacy. Privacy reverses once the interior is brighter than outside.",
    scope: "conditional",
    when: {
      any: [
        { requestedProduct: "interior-solar" },
        { requestedProduct: "exterior-solar" },
        { fact: "privacyNeed", is: ["nighttime", "both"] },
      ],
    },
    permittedInstead:
      "Explain the reversal plainly and pair the solar shade with an interior privacy layer.",
    source: "PRODUCT KNOWLEDGE — INTERIOR ROLLER / SOLAR",
  },
  {
    id: "no-unsecured-exterior-shade",
    prohibition:
      "Never offer, price or describe an unsecured or free-hanging exterior shade. Luxe does not sell them.",
    scope: "conditional",
    when: EXTERIOR_IN_PLAY,
    permittedInstead:
      "Luxe exterior products use secured systems — cable guides, track systems, zipper track.",
    source: "PRODUCT KNOWLEDGE — EXTERIOR SOLAR",
  },
  {
    id: "no-assumed-cordless-or-motorized-availability",
    prohibition:
      "Never claim that every product, size or application is available cordless or motorized, and never state manufacturer-specific availability for either.",
    scope: "conditional",
    when: {
      any: [
        { priority: "child-safety" },
        { fact: "room", is: ["nursery"] },
        { fact: "motorizationInterest", is: ["requested"] },
      ],
    },
    permittedInstead:
      "State the preference plainly — where child safety matters, favour an operating system with no accessible cord — and say Luxe will confirm which options the selected product, size and application actually support.",
    source: "PHASE A.1 — CHILD SAFETY",
  },
  {
    id: "no-hardcoded-gap-dimensions",
    prohibition:
      "Never state roller side-gap dimensions as guaranteed. Manufacturer and window conditions vary.",
    scope: "conditional",
    when: {
      any: [
        { requestedProduct: "interior-roller" },
        { fact: "roomDarkening", is: ["maximum", "total-blackout-requested"] },
      ],
    },
    permittedInstead:
      "Typical gaps run roughly 3/4 inch on the drive side, sometimes more, and roughly 5/8 inch on the idle side — described as typical, never as a specification.",
    source: "PRODUCT KNOWLEDGE — INTERIOR ROLLER / SOLAR",
  },
];
