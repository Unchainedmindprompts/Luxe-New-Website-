export const BUSINESS = {
  name: "Luxe Window Works",
  owner: "Mark",
  ownerFullName: "Mark Abplanalp",
  phone: "208-660-8643",
  phoneE164: "+12086608643",
  phoneHref: "tel:+12086608643",
  email: "mark@luxewindowworks.com",
  address: {
    street: "2972 N Pavo Ln",
    city: "Post Falls",
    state: "ID",
    zip: "83854",
    full: "2972 N Pavo Ln, Post Falls, ID 83854",
  },
  geo: {
    lat: "47.736435",
    lng: "-116.879122",
  },
  google: {
    rating: 5.0,
    reviewCount: 20,
    mapsUrl: "https://share.google/pRM5IoXZgRTksImvp",
  },
  /**
   * Calendly event embedded on /book. Deliberately the only place this URL
   * appears — every public reference (Google Business Profile, email
   * signature, cards, ads, blog CTAs) should point at
   * luxewindowworks.com/book, never at calendly.com directly. Changing
   * scheduling platforms then means editing this line and nothing else, with
   * no external links to chase down.
   */
  calendlyUrl: "https://calendly.com/mark-luxewindowworks/2hr",
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
    { day: "Saturday",  open: "10:00 AM", close: "2:00 PM" },
    { day: "Sunday",    open: null,      close: null },
  ],
  // "Installer Experience" read as a subcontractor who only hangs what someone
  // else sold. Luxe sells, designs and installs — the phrasing has to carry all
  // three or it undersells the business.
  experience: "24 Years Consulting, Designing & Installing",
  guarantee: "Lifetime Installation Guarantee",
  brands: ["Hunter Douglas", "Alta", "Norman", "Lafayette", "Corradi USA", "The Window Outfitters"],
  url: "https://www.luxewindowworks.com",
} as const;

export const SERVICE_AREAS = [
  {
    name: "Coeur d'Alene",
    slug: "coeur-d-alene",
    state: "ID",
    description: "Premium window treatments for lakeside living and mountain views.",
  },
  {
    name: "Post Falls",
    slug: "post-falls",
    state: "ID",
    description: "Custom window coverings for Post Falls' growing communities.",
  },
  {
    name: "Hayden",
    slug: "hayden",
    state: "ID",
    description: "Expert window solutions for Hayden homes and lake properties.",
  },
  {
    name: "Rathdrum",
    slug: "rathdrum",
    state: "ID",
    description: "Quality window treatments for Rathdrum's expanding neighborhoods.",
  },
  {
    name: "Sandpoint",
    slug: "sandpoint",
    state: "ID",
    description: "Luxury window coverings for Sandpoint's scenic lakeside homes.",
  },
  {
    name: "Bellevue",
    slug: "bellevue",
    state: "WA",
    description: "Premium Hunter Douglas window treatments for Bellevue's lakeside and in-town homes.",
  },
  {
    name: "Kirkland",
    slug: "kirkland",
    state: "WA",
    description: "Custom Hunter Douglas window coverings for Kirkland's waterfront homes.",
  },
  {
    name: "Sammamish",
    slug: "sammamish",
    state: "WA",
    description: "Hunter Douglas window treatments for Sammamish's lake and plateau homes.",
  },
  {
    name: "Issaquah",
    slug: "issaquah",
    state: "WA",
    description: "Quality Hunter Douglas shades for Issaquah's foothill neighborhoods.",
  },
  {
    name: "Renton",
    slug: "renton",
    state: "WA",
    description: "Hunter Douglas window treatments for Renton's lakeside and hillside homes.",
  },
  {
    name: "Maple Valley",
    slug: "maple-valley",
    state: "WA",
    description: "Custom Hunter Douglas window coverings for Maple Valley's growing communities.",
  },
  {
    name: "Salt Lake City",
    slug: "salt-lake-city",
    state: "UT",
    description: "Hunter Douglas and Alta window treatments for Salt Lake City's historic and bench homes.",
  },
  {
    name: "Millcreek",
    slug: "millcreek",
    state: "UT",
    description: "Hunter Douglas and Alta window coverings for Millcreek's east bench neighborhoods.",
  },
  {
    name: "Holladay",
    slug: "holladay",
    state: "UT",
    description: "Hunter Douglas and Alta window treatments for Holladay and Olympus Cove homes.",
  },
  {
    name: "Draper",
    slug: "draper",
    state: "UT",
    description: "Hunter Douglas and Alta window treatments for Draper's Corner Canyon and Suncrest homes.",
  },
  {
    name: "South Jordan",
    slug: "south-jordan",
    state: "UT",
    description: "Hunter Douglas and Alta window coverings for South Jordan and Daybreak homes.",
  },
  {
    name: "Park City",
    slug: "park-city",
    state: "UT",
    description: "Hunter Douglas and Alta window treatments for Park City's mountain and second homes.",
  },
  {
    name: "Heber City",
    slug: "heber-city",
    state: "UT",
    description: "Hunter Douglas and Alta window treatments for Heber City's growing valley homes.",
  },
  {
    name: "Midway",
    slug: "midway",
    state: "UT",
    description: "Hunter Douglas and Alta window coverings for Midway's Heber Valley homes.",
  },
] as const;

export const PRODUCTS = [
  {
    name: "Blinds",
    slug: "blinds",
    tagline: "Wood, faux wood, and composite — matched to the room.",
    shortDescription: "Real wood, faux wood, and composite blinds in 2-inch and 2.5-inch slats — matched to each window so they stay straight through brutal sun and moisture.",
    icon: "blinds",
  },
  {
    name: "Cellular Shades",
    slug: "cellular-shades",
    tagline: "Stop losing heat in winter and cool air in summer.",
    shortDescription: "Honeycomb cells trap air to fight brutal winters and summer heat — the most energy-efficient window covering available.",
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
    name: "Exterior Solar Shades",
    slug: "exterior-solar-shades",
    tagline: "Stop the heat before it reaches your glass.",
    shortDescription: "Corradi USA exterior screens block solar heat at the source — far more effective than interior shades. Motorized with Somfy for patios, decks, and sun-blasted windows.",
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
  children?: { label: string; href?: string; heading?: boolean }[];
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Products",
    href: "/products",
    children: [
      { label: "Our Work", href: "/gallery" },
      { label: "Hunter Douglas", href: "/products/hunter-douglas" },
      ...PRODUCTS.map((p) => ({ label: p.name, href: `/products/${p.slug}` })),
    ],
  },
  {
    label: "Service Areas",
    href: "/areas",
    // Idaho markets first, then the Seattle Eastside and Utah under their
    // own headings — a heading entry renders as a label row in the menu,
    // not a link.
    children: [
      ...SERVICE_AREAS.filter((a) => a.state === "ID").map((a) => ({
        label: a.name,
        href: `/areas/${a.slug}`,
      })),
      { label: "Seattle Eastside", heading: true },
      ...SERVICE_AREAS.filter((a) => a.state === "WA").map((a) => ({
        label: a.name,
        href: `/areas/${a.slug}`,
      })),
      { label: "Utah", heading: true },
      ...SERVICE_AREAS.filter((a) => a.state === "UT").map((a) => ({
        label: a.name,
        href: `/areas/${a.slug}`,
      })),
    ],
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
