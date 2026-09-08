import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Work | Custom Window Treatment Projects",
  description:
    "Explore real blinds, shades, shutters, and outdoor screen projects completed by Mark Abplanalp during 24 years in the window treatment business.",
  alternates: { canonical: `${BUSINESS.url}/gallery` },
  openGraph: {
    title: "Our Work | Luxe Window Works",
    description:
      "Real window treatment projects spanning North Idaho and Central Oregon.",
    url: `${BUSINESS.url}/gallery`,
    images: [
      {
        url: "/images/luxe-completed-installation.webp",
        width: 2048,
        height: 1152,
        alt: "Custom flat panel Roman shades in a timber great room",
      },
    ],
  },
};

type ProjectImage = {
  src: string;
  alt: string;
  caption: string;
  productHref: string;
};

const featured: ProjectImage[] = [
  {
    src: "/images/gallery/flat-panel-roman-shades-timber-great-room.webp",
    alt: "Flat panel Roman shades installed throughout a timber great room",
    caption: "Flat panel Roman shades · Whole-room light control",
    productHref: "/products/roman-shades",
  },
  {
    src: "/images/gallery/layered-shades-open-living-room.webp",
    alt: "Coordinated layered shades across a large open living room and kitchen",
    caption: "Layered shades · Coordinated open-plan design",
    productHref: "/products/banded-shades",
  },
  {
    src: "/images/gallery/motorized-outdoor-screen-hot-tub.webp",
    alt: "Motorized outdoor solar screen enclosing a covered hot tub patio",
    caption: "Outdoor screen · Privacy and weather protection",
    productHref: "/products/exterior-solar-shades",
  },
];

const shades: ProjectImage[] = [
  {
    src: "/images/gallery/top-down-bottom-up-bedroom-shades.webp",
    alt: "Top-down bottom-up cellular shades providing privacy while preserving the view",
    caption: "Top-down bottom-up cellular shades",
    productHref: "/products/cellular-shades",
  },
  {
    src: "/images/gallery/cellular-shades-stone-fireplace.webp",
    alt: "Cellular shades installed around a stone fireplace in a vaulted great room",
    caption: "Cellular shades for a vaulted great room",
    productHref: "/products/cellular-shades",
  },
  {
    src: "/images/gallery/cellular-shades-window-wall.webp",
    alt: "Matching cellular shades across a wall of windows",
    caption: "Matching shades across connected windows",
    productHref: "/products/cellular-shades",
  },
  {
    src: "/images/gallery/cellular-shades-bathroom.webp",
    alt: "Light-filtering cellular shades installed in a modern bathroom",
    caption: "Bathroom privacy with filtered daylight",
    productHref: "/products/cellular-shades",
  },
  {
    src: "/images/gallery/solar-shades-dining-room.webp",
    alt: "Dark solar shades controlling glare in a bright dining area",
    caption: "Solar shades for glare and view control",
    productHref: "/products/solar-shades",
  },
  {
    src: "/images/gallery/cellular-shades-sunset-room.webp",
    alt: "Top-down bottom-up shades filtering evening light in a living room",
    caption: "Privacy below, natural light above",
    productHref: "/products/cellular-shades",
  },
  {
    src: "/images/gallery/top-down-bottom-up-trio.webp",
    alt: "Three coordinated top-down bottom-up shades in a bedroom",
    caption: "Coordinated top-down bottom-up shades",
    productHref: "/products/cellular-shades",
  },
  {
    src: "/images/gallery/solar-screen-scenic-living-room.webp",
    alt: "Large solar screen reducing glare across a scenic living-room window",
    caption: "Large-window solar screen",
    productHref: "/products/solar-shades",
  },
];

const shuttersAndBlinds: ProjectImage[] = [
  {
    src: "/images/gallery/white-shutters-vaulted-room.webp",
    alt: "White shutters installed beneath transom windows in a vaulted room",
    caption: "Shutters beneath architectural transoms",
    productHref: "/products/shutters",
  },
  {
    src: "/images/gallery/white-shutters-primary-bedroom.webp",
    alt: "White plantation shutters across a primary bedroom window wall",
    caption: "Plantation shutters for a primary bedroom",
    productHref: "/products/shutters",
  },
  {
    src: "/images/gallery/shutters-furnished-bedroom.webp",
    alt: "White shutters fitted to two windows in a furnished bedroom",
    caption: "Custom shutters fitted window by window",
    productHref: "/products/shutters",
  },
  {
    src: "/images/gallery/dark-blinds-tall-windows.webp",
    alt: "Dark horizontal blinds installed on tall windows",
    caption: "Blinds for tall, sun-exposed windows",
    productHref: "/products/blinds",
  },
  {
    src: "/images/gallery/white-blinds-kitchen.webp",
    alt: "White horizontal blind installed above a kitchen sink",
    caption: "Practical kitchen light control",
    productHref: "/products/blinds",
  },
  {
    src: "/images/gallery/wood-blinds-bedroom.webp",
    alt: "Rich wood blinds installed in a bedroom",
    caption: "Wood blinds coordinated with interior trim",
    productHref: "/products/blinds",
  },
];

const outdoor: ProjectImage[] = [
  {
    src: "/images/gallery/exterior-shutters-enclosed-porch.webp",
    alt: "Exterior shutters enclosing a covered porch",
    caption: "Exterior shutters for a covered porch",
    productHref: "/products/shutters",
  },
  {
    src: "/images/gallery/outdoor-louvered-patio-shades.webp",
    alt: "Dark outdoor shades enclosing a timber patio structure",
    caption: "Outdoor shades integrated with timber architecture",
    productHref: "/products/exterior-solar-shades",
  },
  {
    src: "/images/gallery/patio-solar-screen.webp",
    alt: "Solar screen lowered across a covered patio opening",
    caption: "A more comfortable covered patio",
    productHref: "/products/exterior-solar-shades",
  },
  {
    src: "/images/gallery/exterior-patio-screens-winter.webp",
    alt: "Exterior screens installed around a patio during winter",
    caption: "Exterior screens fitted around existing structure",
    productHref: "/products/exterior-solar-shades",
  },
  {
    src: "/images/gallery/exterior-solar-screen-patio.webp",
    alt: "Large exterior solar screen lowered over a patio opening",
    caption: "Motorized coverage for a wide patio opening",
    productHref: "/products/exterior-solar-shades",
  },
];

const allImages = [...featured, ...shades, ...shuttersAndBlinds, ...outdoor];

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${BUSINESS.url}/gallery#webpage`,
      url: `${BUSINESS.url}/gallery`,
      name: "Our Work | Custom Window Treatment Projects",
      description:
        "A selection of real window treatment projects completed during Mark Abplanalp's 24 years in the industry.",
      isPartOf: { "@id": `${BUSINESS.url}/#website` },
      about: { "@id": `${BUSINESS.url}/#business` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${BUSINESS.url}/images/luxe-completed-installation.webp`,
        width: 2048,
        height: 1152,
      },
      image: allImages.map((image) => `${BUSINESS.url}${image.src}`),
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${BUSINESS.url}/gallery#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Our Work",
          item: `${BUSINESS.url}/gallery`,
        },
      ],
    },
  ],
};

function ProjectCard({ project }: { project: ProjectImage }) {
  return (
    <figure className="group">
      <div className="relative aspect-[4/3] overflow-hidden bg-warm-gray-100">
        <Image
          src={project.src}
          alt={project.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <figcaption className="flex items-start justify-between gap-4 pt-3 text-sm">
        <span className="text-charcoal">{project.caption}</span>
        <Link
          href={project.productHref}
          className="shrink-0 text-warm-gray-600 underline underline-offset-4 hover:text-charcoal"
        >
          Explore
        </Link>
      </figcaption>
    </figure>
  );
}

function GallerySection({
  id,
  eyebrow,
  title,
  intro,
  projects,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  projects: ProjectImage[];
}) {
  return (
    <section id={id} className="scroll-mt-24 py-14 md:py-20 border-t border-warm-gray-200">
      <div className="container-luxe">
        <div className="max-w-3xl mb-9 md:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">{eyebrow}</p>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mt-2">{title}</h2>
          <p className="mt-3 text-base leading-relaxed text-warm-gray-600">{intro}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {projects.map((project) => (
            <ProjectCard key={project.src} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={schema} />
      <div className="bg-warm-white">
        <section className="pt-28 md:pt-36 pb-12 md:pb-16">
          <div className="container-luxe">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark">Real Projects · Real Experience</p>
            <div className="grid lg:grid-cols-[1fr_0.72fr] gap-8 lg:gap-16 items-end mt-3">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-charcoal">Our work,<br />in real homes.</h1>
              <div>
                <p className="text-lg leading-relaxed text-charcoal">
                  These are actual projects completed by Mark Abplanalp during 24 years in the window treatment business.
                </p>
                <p className="mt-3 text-base leading-relaxed text-warm-gray-600">
                  The portfolio spans Central Oregon and North Idaho. Every project reflects the same approach: thoughtful recommendations, precise measuring, and professional installation.
                </p>
              </div>
            </div>
            <nav aria-label="Gallery sections" className="flex flex-wrap gap-3 mt-8">
              <a href="#featured" className="rounded-full border border-charcoal px-5 py-2 text-sm hover:bg-charcoal hover:text-white">Featured</a>
              <a href="#shades" className="rounded-full border border-charcoal px-5 py-2 text-sm hover:bg-charcoal hover:text-white">Shades</a>
              <a href="#shutters-blinds" className="rounded-full border border-charcoal px-5 py-2 text-sm hover:bg-charcoal hover:text-white">Shutters &amp; Blinds</a>
              <a href="#outdoor" className="rounded-full border border-charcoal px-5 py-2 text-sm hover:bg-charcoal hover:text-white">Outdoor</a>
            </nav>
          </div>
        </section>

        <section id="featured" className="scroll-mt-24 container-luxe pb-16 md:pb-24">
          <div className="grid lg:grid-cols-[1.55fr_1fr] gap-4">
            <figure className="group">
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[360px] overflow-hidden">
                <Image src={featured[0].src} alt={featured[0].alt} fill priority className="object-cover" sizes="(min-width: 1024px) 62vw, 100vw" />
              </div>
              <figcaption className="pt-3 text-sm text-charcoal">{featured[0].caption}</figcaption>
            </figure>
            <div className="grid gap-4">
              {featured.slice(1).map((project) => <ProjectCard key={project.src} project={project} />)}
            </div>
          </div>
        </section>

        <section className="bg-charcoal text-white py-12">
          <div className="container-luxe flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-gold text-sm font-semibold uppercase tracking-[0.14em]">Your home is different</p>
              <h2 className="font-serif text-3xl mt-2">See what works in your own space.</h2>
            </div>
            <Link href="/book" className="inline-flex justify-center rounded-full bg-gold px-7 py-3.5 font-semibold text-charcoal hover:bg-gold-light">
              Book My Free Consultation
            </Link>
          </div>
        </section>

        <GallerySection id="shades" eyebrow="Light · Privacy · Comfort" title="Custom Shades" intro="From top-down bottom-up cellular shades to glare-controlling solar shades, each solution is selected around the room, the view, and how the customer lives." projects={shades} />
        <GallerySection id="shutters-blinds" eyebrow="Structure · Character · Control" title="Shutters & Blinds" intro="Precisely fitted shutters and blinds add lasting structure to a room while giving the homeowner simple, dependable control over privacy and daylight." projects={shuttersAndBlinds} />
        <GallerySection id="outdoor" eyebrow="Patios · Porches · Pergolas" title="Outdoor Shade Solutions" intro="Exterior screens and shutters make exposed outdoor spaces more comfortable by adding shade, privacy, weather protection, and architectural character." projects={outdoor} />

        <section className="bg-charcoal text-white py-16 md:py-20">
          <div className="container-luxe max-w-4xl text-center">
            <p className="text-gold text-sm font-semibold uppercase tracking-[0.14em]">We bring the showroom to you</p>
            <h2 className="font-serif text-4xl md:text-5xl mt-3">Let&apos;s find the right solution for your home.</h2>
            <p className="mt-5 text-warm-gray-300 text-lg">Explore samples, compare options, and get expert recommendations during a free in-home consultation.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/book" className="rounded-full bg-gold px-8 py-3.5 font-semibold text-charcoal hover:bg-gold-light">Book a Consultation</Link>
              <a href={BUSINESS.phoneHref} className="rounded-full border border-white/60 px-8 py-3.5 font-semibold hover:bg-white hover:text-charcoal">Call {BUSINESS.phone}</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
