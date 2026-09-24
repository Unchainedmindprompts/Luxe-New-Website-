import { BUSINESS } from "@/lib/constants";

// Shared visible collection copy and product identities; full schema is published on /products/two.
export const TWO_URL = `${BUSINESS.url}/products/two`;
export const TWO_RANGES = [
  { id: "highprofile-classic", name: "Highprofile Classic", category: "Real wood shutters", text: "The warmth of real wood, with painted or stained finishes and a choice of panel styles. A natural place to start when the shutters are part of the room’s character.", source: "highprofile-classic-wood-shutters" },
  { id: "highprofile-poly", name: "Highprofile Poly", category: "PVC shutters", text: "An easy-care shutter option for kitchens, bathrooms and everyday living. PVC construction brings the plantation-shutter look to spaces where moisture matters.", source: "highprofile-poly" },
  { id: "highprofile-avenir", name: "Highprofile Avenir", category: "Interior aluminum shutters", text: "A clean, modern profile with the strength of aluminum. For interiors where you want a substantial shutter with a slim, understated finish.", source: "highprofile-avenir" },
  { id: "colourvue-control", name: "Colourvue Control", category: "Interior roller shades", text: "A simple silhouette that lets the room do the talking. We help you choose fabric, privacy and light control around how you actually use each space.", source: "colourvue-control-roller-shades" },
  { id: "weatherwell-elite", name: "Weatherwell Elite", category: "Architectural aluminum shutters", text: "Adjustable louvers and flexible panel configurations for patios, covered decks and distinctive interiors. Our featured TWO collection for bringing more comfort and privacy outdoors.", source: "weatherwell-elite" },
  { id: "weatherwell-standard", name: "Weatherwell Standard", category: "Aluminum shutters", text: "Another option in the Weatherwell family. We compare Standard and Elite against your opening, preferred operation and budget so you get the right system for the project.", source: "weatherwell-standard" },
  { id: "shadesol-alfresco", name: "Shadesol Alfresco", category: "Outdoor shades", text: "For the patio you love until the afternoon sun arrives. Outdoor fabric shading gives you another way to manage glare and privacy around a covered outdoor space.", source: "shadesol-alfresco-outdoor-shades" },
  { id: "whispertech", name: "Whispertech", category: "Shade automation", text: "Quiet motorized control for compatible shades. We confirm the motor, power supply and any smart-home hub your project needs, then handle setup and programming.", source: "whispertech" },
] as const;

export type TwoRangeId = (typeof TWO_RANGES)[number]["id"];
export function twoProductRef(id: TwoRangeId) {
  return { "@id": `${TWO_URL}#${id}-product` };
}
