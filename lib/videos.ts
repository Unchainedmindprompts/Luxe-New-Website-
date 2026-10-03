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
  details: readonly { label: string; value: string }[];
  paragraphs: readonly string[];
  relatedLinks: readonly { label: string; href: string }[];
}

// One record owns the visible copy, watch-page metadata and graph identity.
// Publication times and durations were read from these public YouTube pages.
// Publisher is known; the original creator and filming location are not.
export const LUXE_VIDEOS: readonly LuxeVideo[] = [
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
