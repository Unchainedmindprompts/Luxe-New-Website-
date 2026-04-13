export const BUSINESS = {
  name: "Luxe Window Works",
  owner: "Mark",
  phone: "208-660-8643",
  phoneHref: "tel:+12086608643",
  email: "mark@luxewindowworks.com",
  address: {
    street: "2972 N Pavo Ln",
    city: "Post Falls",
    state: "ID",
    zip: "83854",
    full: "2972 N Pavo Ln, Post Falls, ID 83854",
  },
  google: {
    rating: 5.0,
    reviewCount: 14,
    mapsUrl: "https://share.google/pRM5IoXZgRTksImvp",
  },
  yelp: {
    url: "https://www.yelp.com/biz/luxe-window-works-post-falls",
  },
  bbb: {
    url: "https://www.bbb.org/us/id/post-falls/profile/blinds/luxe-window-works-llc-1296-1000188314",
  },
  hours: [
    { day: "Monday",    open: "9:00 AM", close: "5:00 PM" },
    { day: "Tuesday",   open: "9:00 AM", close: "5:00 PM" },
    { day: "Wednesday", open: "9:00 AM", close: "5:00 PM" },
    { day: "Thursday",  open: "9:00 AM", close: "5:00 PM" },
    { day: "Friday",    open: "9:00 AM", close: "5:00 PM" },
    { day: "Saturday",  open: "9:00 AM", close: "2:00 PM" },
    { day: "Sunday",    open: null,      close: null },
  ],
  experience: "23 Years of Experience",
  guarantee: "Lifetime Installation Guarantee",
  brands: ["Alta", "Norman", "Lafayette"],
  url: "https://www.luxewindowworks.com",
} as const;

export const SERVICE_AREAS = [
  {
    name: "Coeur d'Alene",
    slug: "coeur-d-alene",
    description: "Premium window treatments for lakeside living and mountain views.",
  },
  {
    name: "Post Falls",
    slug: "post-falls",
    description: "Custom window coverings for Post Falls' growing communities.",
  },
  {
    name: "Hayden",
    slug: "hayden",
    description: "Expert window solutions for Hayden homes and lake properties.",
  },
  {
    name: "Rathdrum",
    slug: "rathdrum",
    description: "Quality window treatments for Rathdrum's expanding neighborhoods.",
  },
  {
    name: "Sandpoint",
    slug: "sandpoint",
    description: "Luxury window coverings for Sandpoint's scenic lakeside homes.",
  },
] as const;

export const PRODUCTS = [
  {
    name: "Cellular Shades",
    slug: "cellular-shades",
    tagline: "Stop losing heat in winter and cool air in summer.",
    shortDescription: "Honeycomb cells trap air to fight Northern Idaho's brutal winters and summer heat — the most energy-efficient window covering available.",
    icon: "cellular",
  },
  {
    name: "Solar Shades",
    slug: "solar-shades",
    tagline: "Enjoy the view without the glare or UV damage.",
    shortDescription: "Preserve your lake and mountain views while blocking intense glare and the UV rays that fade furniture and floors.",
    icon: "solar",
  },
  {
    name: "Roller Shades",
    slug: "roller-shades",
    tagline: "Clean lines, simple function, modern style.",
    shortDescription: "Sleek, minimal window coverings that complement modern construction — popular in Post Falls and Rathdrum's new developments.",
    icon: "roller",
  },
  {
    name: "Banded Shades",
    slug: "banded-shades",
    tagline: "Control light without sacrificing style.",
    shortDescription: "Alternate between full privacy and filtered light throughout the day — ideal for open-plan homes with large windows.",
    icon: "banded",
  },
  {
    name: "Roman Shades",
    slug: "roman-shades",
    tagline: "Timeless elegance that softens any room.",
    shortDescription: "Fabric folds add warmth and texture to living spaces — a refined counterpoint to the rugged natural landscape outside.",
    icon: "roman",
  },
  {
    name: "Shutters",
    slug: "shutters",
    tagline: "The permanent upgrade your home deserves.",
    shortDescription: "A permanent upgrade that adds real estate value, superior light control, and architectural character — built to last decades.",
    icon: "shutters",
  },
  {
    name: "Motorization",
    slug: "motorization",
    tagline: "One tap. Every shade. Perfect position.",
    shortDescription: "Control hard-to-reach windows by phone, voice, or wall switch. Works with Alexa, Google Home, and Apple HomeKit.",
    icon: "motorization",
  },
] as const;

export const REVIEWS = [
  {
    text: "Mark at Luxe Window Works did an incredible job on the shutters in my office and the shades on my stair landing. The quality and attention to detail are amazing.",
    author: "Justine K.",
    rating: 5,
  },
  {
    text: "We were pretty disappointed in what we were getting for pricing and limited selections. Then Mark stopped by from Luxe. We ended up ordering everything from Mark.",
    author: "islandmaser",
    rating: 5,
  },
  {
    text: "I had a small job and was worried it wouldn't capture much interest or attention to detail. I was wrong.",
    author: "Jeff T.",
    rating: 5,
  },
  {
    text: "His design recommendation proved to be perfect.",
    author: "Brad G.",
    rating: 5,
  },
  {
    text: "Mark really helped us think outside the box for a perfect solution.",
    author: "Eric K.",
    rating: 5,
  },
] as const;

interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Products",
    href: "/products/cellular-shades",
    children: PRODUCTS.map((p) => ({ label: p.name, href: `/products/${p.slug}` })),
  },
  {
    label: "Service Areas",
    href: "/areas/coeur-d-alene",
    children: SERVICE_AREAS.map((a) => ({ label: a.name, href: `/areas/${a.slug}` })),
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
