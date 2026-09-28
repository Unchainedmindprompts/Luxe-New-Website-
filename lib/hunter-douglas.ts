import { BUSINESS } from "@/lib/constants";

export const HD_URL = `${BUSINESS.url}/products/hunter-douglas`;
export const HUNTER_DOUGLAS = {
  "@type": "Brand",
  "@id": "https://www.hunterdouglas.com/#brand",
  name: "Hunter Douglas",
  url: "https://www.hunterdouglas.com",
} as const;

// Product descriptions and photography verified against these official pages.
export const HD_COLLECTIONS = [
  {
    id: "vignette", name: "Vignette®", category: "Roman Shades",
    headline: "A softer way to finish a room.",
    description: "Sculpted fabric folds bring depth and softness to the window. Choose a flat or full-fold look, with fabric options for gently filtered light or a darker room.",
    detail: "A natural starting point when you love the warmth of fabric and want a tailored, uncluttered finish.",
    image: "/images/luxe-completed-installation.webp",
    alt: "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works in a timber-beamed living room",
    source: "https://www.hunterdouglas.com/window-treatments/shades/roman-shades/vignette",
  },
  {
    id: "silhouette", name: "Silhouette®", category: "Sheer Shades",
    headline: "Let the light become part of the room.",
    description: "Soft fabric vanes sit between sheer layers, diffusing daylight while preserving a daytime view. Tilt the vanes to change the balance of light and privacy.",
    detail: "Explore this collection for living spaces where the view and the quality of natural light matter just as much as the shade itself.",
    image: "/images/hunter-douglas/silhouette.webp",
    alt: "Hunter Douglas Silhouette Sheer Shades filtering light beside an indoor plant",
    source: "https://www.hunterdouglas.com/window-treatments/shades/sheer-shades/silhouette",
  },
  {
    id: "duette", name: "Duette®", category: "Cellular Shades",
    headline: "Comfort, beautifully considered.",
    description: "A honeycomb construction traps air at the window, adding a layer of insulation. A wide choice of fabrics and light-control options makes it easy to begin with what each room needs.",
    detail: "A thoughtful option for North Idaho homes where seasonal comfort, privacy and everyday practicality are priorities.",
    image: "/images/hunter-douglas/duette.webp",
    alt: "Hunter Douglas Duette Cellular Shades in Classic London Sky",
    source: "https://www.hunterdouglas.com/window-treatments/shades/cellular-shades/duette",
  },
] as const;

export const HD_FAQS = [
  { question: "Where can I shop for Hunter Douglas shades in North Idaho?", answer: "Luxe Window Works is a local Hunter Douglas dealer offering free in-home consultations in Post Falls, Coeur d’Alene, Hayden, Rathdrum and Sandpoint. We bring samples to your home, help you compare options, and handle professional measurements and installation." },
  { question: "How do I choose between Vignette, Silhouette and Duette?", answer: "Start with the room. Vignette offers the tailored folds of a Roman shade, Silhouette combines sheer fabric and adjustable vanes for diffused daylight, and Duette uses a cellular construction for added insulation. We help you compare fabrics, privacy and light control in your own space." },
  { question: "How much do Hunter Douglas shades cost?", answer: "Your quote depends on the collection, window dimensions, fabric, operating system and selected features. During your free consultation, we measure your windows and prepare a quote for your chosen products, with professional installation included." },
  { question: "Can I see samples before deciding?", answer: "Yes. We bring samples to your home so you can compare colors and textures alongside your furniture, flooring and natural light. You do not need to choose a collection before booking." },
] as const;
