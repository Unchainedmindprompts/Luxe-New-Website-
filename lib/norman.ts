import { BUSINESS } from "@/lib/constants";

export const NORMAN_URL = `${BUSINESS.url}/products/norman`;
export { NORMAN_BRAND } from "@/lib/brands";

// Lines and facts are drawn from the shutters entry in lib/product-data.ts,
// the Norman article in content/blog, and the glossary entry for
// SmartPrivacy, which names it as a Norman design for horizontal blinds.
export const NORMAN_CATEGORIES = [
  {
    id: "normandy",
    title: "Normandy Hardwood Shutters",
    collections: "Normandy · Painted or stained Paulownia",
    description: "Norman's premium hardwood line, built from Paulownia, a hardwood with an exceptional strength to weight ratio that resists warping through January cold and August heat. Painted or stained finishes show off real wood grain, which makes Normandy a natural fit for living rooms, bedrooms, and rooms where the shutters are part of the character.",
    image: "/images/norman-shutters-living-room.jpeg",
    alt: "Norman shutters installed in a bright North Idaho living room by Luxe Window Works",
    href: "/products/shutters",
  },
  {
    id: "woodlore",
    title: "Woodlore Composite Shutters",
    collections: "Woodlore · Painted finishes",
    description: "An engineered composite line in painted finishes, visually indistinguishable from painted wood and dimensionally stable across humidity and temperature changes. A steady, practical choice for everyday rooms across the home.",
    image: "/images/plantation-shutters-bright-room.jpeg",
    alt: "Plantation shutters in a bright North Idaho room installed by Luxe Window Works",
    href: "/products/shutters",
  },
  {
    id: "woodlore-plus",
    title: "Woodlore Plus Composite Shutters",
    collections: "Woodlore Plus · Polymer reinforced core",
    description: "Woodlore Plus adds a polymer reinforced core that resists steam and humidity. It is the line we specify most often for bathrooms, kitchens, and lake homes, and for most painted shutters in North Idaho's climate.",
    image: "/images/plantation-shutters-bathtub.jpeg",
    alt: "Plantation shutters above a bathtub in a North Idaho home",
    href: "/products/shutters",
  },
  {
    id: "invisibletilt",
    title: "InvisibleTilt",
    collections: "Available on select Normandy and Woodlore Plus configurations",
    description: "A hidden gear inside the stile tilts the louvers with no center tilt bar splitting the view. Closure stays consistent because the internal gear keeps even tension across every louver. It is typically the first upgrade we discuss.",
    image: "/images/shutters.jpeg",
    alt: "Norman plantation shutters installed by Luxe Window Works in North Idaho",
    href: "/products/shutters",
  },
  {
    id: "door-shutters",
    title: "Shutters for Doors",
    collections: "Bi-Fold 180 · Bypass shutters",
    description: "Bi-Fold 180 folds completely flat against the wall for French doors and entry doors, so a panel never blocks the doorway. Bypass shutters slide horizontally for patio doors. Both need especially precise measurement because doors flex and move differently than fixed windows.",
    image: "/images/gallery/white-shutters-primary-bedroom.webp",
    alt: "Plantation shutters in a North Idaho primary bedroom",
    href: "/products/shutters",
  },
  {
    id: "smartprivacy-blinds",
    title: "SmartPrivacy Blinds",
    collections: "SmartPrivacy · Faux wood, real wood, and composite blinds",
    description: "A patented Norman design for horizontal blinds that moves the lift cord route holes from the center of each slat to the back edge. With the holes hidden when the blinds are closed, SmartPrivacy blinds seal more tightly, rotate more consistently, and reduce the light leaks that traditional route holes create.",
    image: "/images/gallery/white-blinds-kitchen.webp",
    alt: "White blinds in a North Idaho kitchen",
    href: "/products/blinds",
  },
] as const;

export const NORMAN_COLLECTIONS = NORMAN_CATEGORIES;

export const NORMAN_FAQS = [
  { question: "Why does Luxe Window Works install Norman shutters?", answer: "We have been a Norman partner since 2009. That experience helps us guide material, frame, and panel choices, place custom orders, and help with manufacturer warranty questions. Norman is one of our shutter options, alongside Hunter Douglas and the TWO interior shutter collection. We compare the options around your windows and the way you use each room." },
  { question: "What is the difference between Norman's Normandy and Woodlore Plus shutters?", answer: "Normandy is Norman's premium hardwood line, built from Paulownia, a strong, light, and naturally stable hardwood, available in painted and stained finishes that show off real wood grain. Woodlore and Woodlore Plus are engineered composite lines in painted finishes only, visually indistinguishable from painted wood. Woodlore Plus adds a polymer reinforced core that resists steam and humidity, making it the right choice for bathrooms, kitchens, and lakefront homes. For most painted shutters in North Idaho's climate, we specify Woodlore Plus. For the premium real wood look in dry rooms, Normandy." },
  { question: "What is Norman's InvisibleTilt system?", answer: "Traditional shutters use a center tilt bar, a vertical rod down the face of the panel that splits the window visually. Norman's InvisibleTilt hides the tilt mechanism inside the stile, so there is no center bar and you get a cleaner, more modern look with an unobstructed view. Because the internal gear maintains even tension across all louvers, closure is more consistent too. It is available on select Normandy and Woodlore Plus configurations, and it is typically the first upgrade we discuss." },
  { question: "Why does professional measurement matter so much for plantation shutters?", answer: "Shutters require tighter tolerances than any other window treatment. A shutter frame that is off by just 1/8 inch will not close properly. North Idaho's freeze thaw cycles cause window frames to shift out of square over time, more common than most homeowners realize. We take precise laser measurements at multiple points on every opening and account for out of square frames in the specifications we send to Norman, so your shutters close cleanly and operate smoothly for years." },
  { question: "What louver size should I choose for plantation shutters?", answer: "Smaller 3.5 inch louvers create a more traditional look with more horizontal lines, a good fit for smaller windows or classic interiors. Larger 4.5 inch louvers open up the view, let in significantly more light when tilted, and create a cleaner, contemporary feel. Norman's use of lightweight Paulownia in the Normandy line makes 4.5 inch louvers practical without the sagging that heavy basswood panels can develop over time. For the larger windows common in North Idaho lake homes and newer construction, 4.5 inch is usually the right specification." },
  { question: "Can Norman shutters be installed on doors?", answer: "Yes. Norman's Bi-Fold 180 folds completely flat against the wall so a panel never blocks the doorway, which matters for French doors and entry doors. For sliding patio doors, Norman offers bypass shutters that slide horizontally. These applications require especially precise measurement because doors flex and move differently than fixed windows, which is why professional installation matters here." },
  { question: "Are Norman shutters backed by a warranty?", answer: "Yes. Norman backs both the hardwood Normandy line and the Woodlore and Woodlore Plus composite lines with a limited lifetime warranty covering defects in materials and workmanship. As a long term Norman partner, we are your local point of contact for any warranty question or service need. You call us, not a manufacturer call center." },
  { question: "How is Norman shutter pricing quoted?", answer: "Norman shutters are quoted after we confirm your windows, line and material, frame, panel layout, and any specialty shapes or door applications during a free in-home consultation. Your written quote includes professional measurements and installation." },
  { question: "How much do Norman shutters cost?", answer: "Your price depends on the window dimensions, line and material, frame, panel layout, and any specialty shapes or door requirements. We measure your openings and prepare a project specific quote with professional installation included. The in-home consultation is free." },
  { question: "Where can I shop for Norman shutters in North Idaho?", answer: "Luxe Window Works is a Norman dealer offering free in-home consultations in North Idaho, including Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint. We bring samples to your home, help you compare the Norman lines room by room, and handle professional measurements and installation." },
  { question: "What are Norman SmartPrivacy blinds?", answer: "SmartPrivacy is a patented Norman design feature for horizontal blinds that relocates the lift cord route holes from the center of each slat to the back edge. With the holes hidden behind the slats when closed, SmartPrivacy blinds achieve a tighter seal, rotate more consistently, and eliminate the light leak halos that traditional route holes create. It is available on Norman faux wood, real wood, and composite blinds, and we help you confirm the slat size and finish for your windows during your consultation." },
  { question: "Can I see samples before deciding?", answer: "Yes. We bring samples to your home so you can compare finishes and louver sizes alongside your furniture, flooring, and natural light. You do not need to choose a line before booking." },
] as const;
