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
  { question: "Does Luxe offer more than Vignette, Silhouette and Duette?", answer: "Yes. Explore Hunter Douglas roller, solar, banded and woven shades, vertical treatments, blinds, shutters, custom drapery and PowerView automation with Luxe. During your consultation, we help narrow the collections and confirm the fabrics, sizes and operating options for your project." },
  { question: "Where can I shop for Hunter Douglas shades in North Idaho?", answer: "Luxe Window Works is a local Hunter Douglas dealer offering free in-home consultations in Post Falls, Coeur d’Alene, Hayden, Rathdrum and Sandpoint. We bring samples to your home, help you compare options, and handle professional measurements and installation." },
  { question: "How do I choose between Vignette, Silhouette and Duette?", answer: "Start with the room. Vignette offers the tailored folds of a Roman shade, Silhouette combines sheer fabric and adjustable vanes for diffused daylight, and Duette uses a cellular construction for added insulation. We help you compare fabrics, privacy and light control in your own space." },
  { question: "How much do Hunter Douglas shades cost?", answer: "Your quote depends on the collection, window dimensions, fabric, operating system and selected features. During your free consultation, we measure your windows and prepare a quote for your chosen products, with professional installation included." },
  { question: "Can I see samples before deciding?", answer: "Yes. We bring samples to your home so you can compare colors and textures alongside your furniture, flooring and natural light. You do not need to choose a collection before booking." },
] as const;

// Additional categories and source references; customer calls to action stay on Luxe.
export const HD_ADDITIONAL_CATEGORIES = [
  {
    "id": "roller-shades",
    "title": "Roller Shades",
    "collections": "Designer Roller · Sonnette® · Alustra®",
    "description": "A streamlined finish for everyday spaces, with choices ranging from simple fabric rollers to cellular construction and textured architectural designs.",
    "image": "/images/hunter-douglas/roller-shades.webp",
    "alt": "Designer Roller Shades in Ginseng Sisal",
    "source": "https://www.hunterdouglas.com/window-treatments/shades"
  },
  {
    "id": "solar-shades",
    "title": "Solar Shades",
    "collections": "Designer Solar Shades",
    "description": "Filter strong sunlight and reduce glare while retaining a view through the fabric. Compare openness levels in your own light.",
    "image": "/images/hunter-douglas/solar-shades.webp",
    "alt": "Hunter Douglas Designer Solar Shades filtering daylight in a living room",
    "source": "https://www.hunterdouglas.com/window-treatments/shades"
  },
  {
    "id": "banded-shades",
    "title": "Banded Shades",
    "collections": "Designer Banded Shades",
    "description": "Alternating sheer and solid bands shift past one another, letting you adjust the balance between daylight and privacy.",
    "image": "/images/hunter-douglas/banded-shades.webp",
    "alt": "Hunter Douglas Designer Banded Shades with alternating sheer and solid fabric bands",
    "source": "https://www.hunterdouglas.com/window-treatments/shades"
  },
  {
    "id": "woven-shades",
    "title": "Woven Shades",
    "collections": "Provenance® · Alustra® Woven Textures®",
    "description": "Bring texture to the room with natural woven materials or refined woven fabrics. Explore Roman and roller styles to suit your space.",
    "image": "/images/hunter-douglas/woven-shades.webp",
    "alt": "Provenance in Calliope Santorini",
    "source": "https://www.hunterdouglas.com/window-treatments/shades"
  },
  {
    "id": "vertical-treatments",
    "title": "Vertical & Sliding-Door Treatments",
    "collections": "Luminette® · Skyline® · Somner® · Vertical Solutions®",
    "description": "Explore soft sheers, gliding panels and vertical blinds for wide windows and doors. We help match the treatment to how you use the opening.",
    "image": "/images/hunter-douglas/vertical-treatments.webp",
    "alt": "Hunter Douglas Luminette vertical sheer panels in a dining room",
    "source": "https://www.hunterdouglas.com/window-treatments/shades"
  },
  {
    "id": "wood-blinds",
    "title": "Wood Blinds",
    "collections": "Parkland®",
    "description": "Natural wood slats add warmth, with adjustable light and privacy. Compare finishes alongside your floors, cabinetry and trim.",
    "image": "/images/hunter-douglas/wood-blinds.webp",
    "alt": "Parkland Wood Blinds",
    "source": "https://www.hunterdouglas.com/window-treatments/blinds"
  },
  {
    "id": "faux-wood-blinds",
    "title": "Faux Wood Blinds",
    "collections": "EverWood®",
    "description": "A wood-inspired look with a practical alternative material. A versatile starting point for busy rooms and a coordinated finish throughout the home.",
    "image": "/images/hunter-douglas/faux-wood-blinds.webp",
    "alt": "EverWood in Alternative Wood Chateau",
    "source": "https://www.hunterdouglas.com/window-treatments/blinds"
  },
  {
    "id": "metal-blinds",
    "title": "Metal Blinds",
    "collections": "Modern Precious Metals®",
    "description": "Slim aluminum slats bring crisp lines and adjustable light control. Explore finishes that feel subtle or add a modern accent.",
    "image": "/images/hunter-douglas/metal-blinds.webp",
    "alt": "Modern Precious Metals in Stone",
    "source": "https://www.hunterdouglas.com/window-treatments/blinds"
  },
  {
    "id": "soft-blinds",
    "title": "Soft Blinds",
    "collections": "Aria™",
    "description": "A softer take on horizontal blinds, combining fabric slats with adjustable light control for a relaxed, tailored window.",
    "image": "/images/hunter-douglas/soft-blinds.webp",
    "alt": "Aria Elan",
    "source": "https://www.hunterdouglas.com/window-treatments/blinds"
  },
  {
    "id": "shutters",
    "title": "Interior Shutters",
    "collections": "Heritance® · Palm Beach™ · NewStyle®",
    "description": "Choose hardwood, Polysatin™ vinyl or composite shutters. We help compare materials, louver sizes and mounting details for your windows and doors.",
    "image": "/images/hunter-douglas/shutters.webp",
    "alt": "NewStyle in Zenith Zephyr",
    "source": "https://www.hunterdouglas.com/window-treatments/shutters"
  },
  {
    "id": "drapery",
    "title": "Custom Drapery",
    "collections": "Carole Fabrics",
    "description": "Frame your windows with stationary side panels or functioning drapery. Layer fabrics with shades for added softness and a more finished room.",
    "image": "/images/hunter-douglas/drapery.webp",
    "alt": "Tuxedo Pleat Drapery in Aiden Dusty Blue",
    "source": "https://www.hunterdouglas.com/window-treatments/drapery"
  },
  {
    "id": "powerview",
    "title": "Motorization & Smart Control",
    "collections": "PowerView® Automation",
    "description": "Adjust compatible treatments by remote or app, and create schedules around your routine. We help plan power options and compatible smart-home connections.",
    "image": "/images/hunter-douglas/powerview.webp",
    "alt": "Hunter Douglas PowerView app on a phone",
    "source": "https://www.hunterdouglas.com/smart-automation"
  }
] as const;

export const HD_CATEGORIES = [
  ...HD_COLLECTIONS.map(p => ({ id: p.id, title: p.category, collections: p.id === "silhouette" ? "Silhouette® · Pirouette®" : p.id === "duette" ? "Duette® · Applause®" : "Vignette® · Alustra® Woven Textures® · Carole Fabrics", description: p.id === "vignette" ? "Fabric folds bring softness and dimension to the window. Compare tailored Roman styles, woven textures and decorative fabrics for your room." : p.id === "silhouette" ? "Sheer fabric and adjustable vanes soften incoming daylight. Explore different vane designs to find your preferred balance of light, view and privacy." : p.description, image: p.image, alt: p.alt })),
  ...HD_ADDITIONAL_CATEGORIES,
];
