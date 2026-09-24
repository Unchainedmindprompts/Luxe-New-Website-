import { BUSINESS } from "@/lib/constants";

// Shared visible collection copy and product identities; full schema is published on /products/two.
export const TWO_URL = `${BUSINESS.url}/products/two`;
export const TWO_RANGES = [
  { id: "highprofile-classic", name: "Highprofile Classic", category: "Real wood shutters", text: "The warmth of real wood, with painted or stained finishes and a choice of panel styles. A natural place to start when the shutters are part of the room’s character.", source: "highprofile-classic-wood-shutters" },
  { id: "highprofile-poly", name: "Highprofile Poly", category: "PVC shutters", text: "An easy-care shutter option for kitchens, bathrooms and everyday living. PVC construction brings the plantation-shutter look to spaces where moisture matters.", source: "highprofile-poly" },
  { id: "colourvue-control", name: "Colourvue", category: "Interior roller shades", text: "A simple silhouette that lets the room do the talking. We help you choose fabric, privacy and light control around how you actually use each space.", programs: [{ name: "Colourvue Essential", text: "Our primary program, with pricing based on size ranges and a thoughtfully selected range of options." }, { name: "Colourvue Basic", text: "A practical choice for commercial spaces and manual operation." }], source: "colourvue-control-roller-shades" },
  { id: "weatherwell-elite", name: "Weatherwell Elite", category: "Architectural aluminum shutters", text: "Adjustable louvers and flexible panel configurations for patios, covered decks and distinctive interiors. Our featured TWO collection for bringing more comfort and privacy outdoors.", source: "weatherwell-elite" },
  { id: "shadesol-alfresco", name: "Shadesol", category: "Outdoor shades", text: "For the patio you love until the afternoon sun arrives. Outdoor fabric shading gives you another way to manage glare and privacy around a covered outdoor space.", programs: [{ name: "Shadesol Complete", text: "One of TWO’s current outdoor shade programs." }, { name: "Shadesol Essential", text: "Another option within the Shadesol family. We’ll help you compare the programs for your space." }], source: "shadesol-alfresco-outdoor-shades" },
  { id: "whispertech", name: "Whispertech", category: "Shade automation", text: "Quiet motorized control for compatible shades. We confirm the motor, power supply and any smart-home hub your project needs, then handle setup and programming.", source: "whispertech" },
] as const;

export type TwoRangeId = (typeof TWO_RANGES)[number]["id"];
export function twoProductRef(id: TwoRangeId) {
  return { "@id": `${TWO_URL}#${id}-product` };
}

export const COLOURVUE_IMAGE = "/images/two/colourvue-living-natural.jpg";
export function twoImage(id: TwoRangeId) {
  return id === "colourvue-control" ? COLOURVUE_IMAGE : `/images/two/${id}.webp`;
}
