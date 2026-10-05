import { BUSINESS } from "@/lib/constants";
import type { ProductSlug } from "@/lib/schema";

type VideoServiceSlug = ProductSlug | "hunter-douglas";

export interface LuxeVideo {
  slug: string;
  youtubeId: string;
  title: string;
  shortTitle: string;
  description: string;
  uploadDate: string;
  duration: string;
  durationLabel: string;
  serviceSlugs: readonly VideoServiceSlug[];
  subject?: string;
  breadcrumb?: { label: string; href: string };
  ctaDescription?: string;
  details: readonly { label: string; value: string }[];
  paragraphs: readonly string[];
  relatedLinks: readonly { label: string; href: string }[];
}

// One record owns the visible copy, watch-page metadata and graph identity.
// Publication times and durations were read from these public YouTube pages.
// Publisher is known; the original creator and filming location are not.
export const LUXE_VIDEOS: readonly LuxeVideo[] = [
  {
    slug: "corradi-louvered-patio-roof-exterior-shade",
    youtubeId: "GX1DkG5Ku3E",
    title: "Corradi Louvered Patio Roof & Exterior Shade | Outdoor Living",
    shortTitle: "Corradi Patio Roof & Exterior Shade",
    description: "More control over sun, shade and your time outside. See a Corradi louvered patio roof and exterior shade in action, with adjustable roof louvers overhead and a shade along the side of the patio.",
    uploadDate: "2026-10-05T09:06:49-07:00",
    duration: "PT0M49S",
    durationLabel: "49 seconds",
    serviceSlugs: ["exterior-solar-shades"],
    subject: "Corradi louvered patio roof and exterior side shade",
    breadcrumb: { label: "Exterior Solar Shades", href: "/products/exterior-solar-shades" },
    ctaDescription: "We help homeowners throughout Coeur d’Alene, Post Falls and North Idaho explore outdoor shade solutions. We can help you compare options for your own space and how you enjoy being outside.",
    details: [
      { label: "Brand", value: "Corradi" },
      { label: "Overhead", value: "Adjustable patio roof louvers" },
      { label: "Side coverage", value: "Exterior patio shade" },
    ],
    paragraphs: [
      "Adjustable louvers overhead and an exterior side shade offer two ways to manage sunlight around this patio. The video shows both the roof louvers and side shade moving, giving a closer look at how they work together around an outdoor living space.",
    ],
    relatedLinks: [
      { label: "Explore exterior solar shades", href: "/products/exterior-solar-shades" },
      { label: "Browse outdoor shade projects", href: "/gallery#outdoor" },
    ],
  },
  {
    slug: "large-scale-commercial-window-shades",
    youtubeId: "Jh-f3d5x7vM",
    title: "Large-Scale Commercial Window Shades | Portfolio Highlight",
    shortTitle: "Large-Scale Commercial Window Shades",
    description: "A full wall of glass. A clean, coordinated shade installation. This commercial project highlights how window shades can complement the architecture of a large space.",
    uploadDate: "2026-10-05T08:34:17-07:00",
    // YouTube's public microformat reports 37 seconds (raw media is ~36.1s).
    duration: "PT0M37S",
    durationLabel: "37 seconds",
    serviceSlugs: [],
    subject: "Commercial window shades in a large glass-walled space",
    breadcrumb: { label: "Our Work", href: "/gallery" },
    ctaDescription: "Explore custom window treatments for your North Idaho home or business. Luxe Window Works can help you compare options for your own space.",
    details: [
      { label: "Setting", value: "Large commercial interior" },
      { label: "Windows", value: "A full wall of glass" },
      { label: "Focus", value: "Coordinated window shades and architecture" },
    ],
    paragraphs: [
      "The broad window wall and repeated shade panels create a coordinated line across the space. Watch the short clip for a closer look at the scale and how the shades sit within the architecture.",
    ],
    relatedLinks: [
      { label: "Browse the project gallery", href: "/gallery" },
      { label: "Explore window treatment options", href: "/products" },
    ],
  },
  {
    slug: "powerview-roller-shades-west-facing-bedroom",
    youtubeId: "KTcXw-7BbYM",
    title: "Hunter Douglas PowerView Roller Shades for West-Facing Bedroom Windows",
    shortTitle: "PowerView Roller Shades",
    description: "Watch Hunter Douglas PowerView motorized roller shades with 1% openness solar screen fabric in west-facing primary bedroom windows, finished with white fabric-covered cassette headrails.",
    uploadDate: "2026-10-03T09:50:27-07:00",
    duration: "PT0M48S",
    durationLabel: "48 seconds",
    serviceSlugs: ["roller-shades", "solar-shades", "motorization", "hunter-douglas"],
    details: [
      { label: "Shades", value: "Hunter Douglas roller shades" },
      { label: "Controls", value: "PowerView motorization" },
      { label: "Fabric", value: "1% openness solar screen" },
      { label: "Setting", value: "West-facing primary bedroom windows" },
      { label: "Finish", value: "White fabric-covered cassette headrails" },
    ],
    paragraphs: [
      "These shades were selected to soften afternoon glare while keeping a filtered view outside. The 1% openness solar screen fabric provides a closely woven screen, and PowerView motorization makes it easy to raise or lower the shades.",
      "White fabric-covered cassette headrails blend with the window trim and give the top of each shade a clean, finished appearance. Watch the video to see the shades move and how the fabric changes the view through the windows.",
      "We help you compare fabrics, light control and motorized options in your own space. During your in-home consultation, we bring samples and talk through how you use the room before we measure and place your custom order.",
    ],
    relatedLinks: [
      { label: "Explore roller shades", href: "/products/roller-shades" },
      { label: "Compare solar shade fabrics", href: "/products/solar-shades" },
      { label: "Learn about motorized shades", href: "/products/motorization" },
      { label: "Explore Hunter Douglas", href: "/products/hunter-douglas" },
    ],
  },
  {
    slug: "vignette-duolite-light-filtering-room-darkening",
    youtubeId: "bo8RyllgYCI",
    title: "Hunter Douglas Vignette Duolite Shades | Light Filtering and Room Darkening",
    shortTitle: "Vignette Duolite Shades",
    description: "Watch Hunter Douglas Vignette Duolite shades combine a light-filtering front shade with a room-darkening rear layer in a coordinated fabric-covered cassette headrail.",
    uploadDate: "2026-10-03T09:58:23-07:00",
    duration: "PT0M58S",
    durationLabel: "58 seconds",
    serviceSlugs: ["roman-shades", "hunter-douglas"],
    details: [
      { label: "Collection", value: "Hunter Douglas Vignette Duolite" },
      { label: "Front shade", value: "Light-filtering fabric" },
      { label: "Rear layer", value: "Room-darkening shade" },
      { label: "Finish", value: "Coordinated fabric-covered cassette headrail" },
    ],
    paragraphs: [
      "This Vignette Duolite shade combines a light-filtering front shade with a room-darkening layer that lowers behind it. Keep the front shade down for softly filtered daylight, then lower the rear layer when you want a darker room.",
      "Both layers tuck into a coordinated fabric-covered cassette headrail for a clean, finished look. The video shows how the two layers work together so you can compare the light-filtering and room-darkening settings.",
      "We help you choose window treatments around how you use each room. We bring samples to your home, take custom measurements and handle professional installation throughout North Idaho.",
    ],
    relatedLinks: [
      { label: "Explore Roman shades", href: "/products/roman-shades" },
      { label: "Explore Hunter Douglas Vignette", href: "/products/hunter-douglas#vignette" },
    ],
  },
];

export function videoPath(video: LuxeVideo) {
  return `/videos/${video.slug}`;
}

export function videoUrl(video: LuxeVideo) {
  return `${BUSINESS.url}${videoPath(video)}`;
}

export function videoRef(video: LuxeVideo) {
  return { "@id": `${BUSINESS.url}/videos/${video.slug}#video` };
}

export function videoThumbnail(video: LuxeVideo) {
  return `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
}

export function videoEmbedUrl(video: LuxeVideo) {
  return `https://www.youtube.com/embed/${video.youtubeId}`;
}

export function videosForService(slug: string) {
  return LUXE_VIDEOS.filter((video) => video.serviceSlugs.some((service) => service === slug));
}
