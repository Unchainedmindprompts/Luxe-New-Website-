import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RelatedVideos } from "@/components/RelatedVideos";
import { TrackedCta } from "@/components/TrackedCta";
import { BUSINESS } from "@/lib/constants";
import { CONVERSION_EVENTS } from "@/lib/conversion-events";
import { BUSINESS_STUB } from "@/lib/schema";
import { LUXE_VIDEOS, videoEmbedUrl, videoThumbnail, videoUrl } from "@/lib/videos";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LUXE_VIDEOS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = LUXE_VIDEOS.find((item) => item.slug === slug);
  if (!video) return {};
  const title = `${video.shortTitle} Video | ${BUSINESS.name}`;
  return {
    title,
    description: video.description,
    alternates: { canonical: videoUrl(video) },
    openGraph: { title, description: video.description, url: videoUrl(video), type: "video.other", images: [{ url: videoThumbnail(video), alt: video.shortTitle }], videos: [{ url: videoEmbedUrl(video), width: 1280, height: 720 }] },
    twitter: { card: "summary_large_image", title, description: video.description, images: [videoThumbnail(video)] },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = LUXE_VIDEOS.find((item) => item.slug === slug);
  if (!video) notFound();
  const pageUrl = videoUrl(video);
  const relatedVideos = LUXE_VIDEOS.filter((item) => item.slug !== slug);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        BUSINESS_STUB,
        {
          "@type": "WebPage",
          "@id": `${BUSINESS.url}/videos/${slug}#webpage`,
          url: pageUrl,
          name: video.title,
          description: video.description,
          isPartOf: { "@id": `${BUSINESS.url}/#website` },
          mainEntity: { "@id": `${BUSINESS.url}/videos/${slug}#video` },
          breadcrumb: { "@id": `${BUSINESS.url}/videos/${slug}#breadcrumb` },
          inLanguage: "en-US",
        },
        {
          "@type": "VideoObject",
          "@id": `${BUSINESS.url}/videos/${slug}#video`,
          url: pageUrl,
          name: video.title,
          description: video.description,
          thumbnailUrl: videoThumbnail(video),
          uploadDate: video.uploadDate,
          duration: video.duration,
          embedUrl: videoEmbedUrl(video),
          publisher: { "@id": `${BUSINESS.url}/#business` },
          about: video.serviceSlugs.map((serviceSlug) => ({ "@id": `${BUSINESS.url}/products/${serviceSlug}#service` })),
          mainEntityOfPage: pageUrl,
          inLanguage: "en-US",
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${BUSINESS.url}/videos/${slug}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.url },
            { "@type": "ListItem", position: 2, name: "Hunter Douglas", item: `${BUSINESS.url}/products/hunter-douglas` },
            { "@type": "ListItem", position: 3, name: video.shortTitle, item: pageUrl },
          ],
        },
      ] }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Hunter Douglas", href: "/products/hunter-douglas" }, { label: "Video" }]} />

      <section className="bg-cream pb-10 md:pb-14">
        <div className="container-luxe max-w-5xl">
          <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">Watch with Luxe · {video.durationLabel}</p>
          <h1 className="mt-3 max-w-4xl font-serif text-3xl sm:text-4xl md:text-5xl leading-tight text-charcoal">{video.title}</h1>
          {/* Keep the real player in server-rendered HTML. Watch pages must not
              require a click to create an iframe, unlike supplementary embeds. */}
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-charcoal shadow-sm">
            <iframe
              src={`${videoEmbedUrl(video)}?rel=0&playsinline=1`}
              title={video.title}
              className="absolute inset-0 h-full w-full"
              width="1280"
              height="720"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-warm-gray-700">
            <p>Published by {BUSINESS.name} · <time dateTime={video.uploadDate}>October 3, 2026</time></p>
            <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-charcoal underline underline-offset-4">Watch on YouTube <span className="sr-only">(new tab)</span><span aria-hidden="true">↗</span></a>
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-warm-gray-700">{video.description}</p>
        </div>
      </section>

      <section className="container-luxe max-w-5xl py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-serif text-3xl text-charcoal">What you’re seeing</h2>
            {video.paragraphs.map((paragraph) => <p key={paragraph} className="mt-5 leading-relaxed text-warm-gray-700">{paragraph}</p>)}
          </div>
          <div className="rounded-xl border border-warm-gray-200 bg-cream/50 p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-charcoal">Details in this video</h2>
            <dl className="mt-5 divide-y divide-warm-gray-200">
              {video.details.map((detail) => <div key={detail.label} className="py-3"><dt className="text-xs font-semibold uppercase tracking-wider text-warm-gray-600">{detail.label}</dt><dd className="mt-1 text-charcoal">{detail.value}</dd></div>)}
            </dl>
            <nav aria-label="Related window treatment options" className="mt-6 flex flex-col gap-4">
              {video.relatedLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm font-semibold text-charcoal underline underline-offset-4">{link.label} <span aria-hidden="true">→</span></Link>)}
            </nav>
          </div>
        </div>
      </section>

      <RelatedVideos videos={relatedVideos} />
      <section className="container-luxe max-w-3xl py-14 md:py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">See the options in your own light.</h2>
        <p className="mt-5 text-lg leading-relaxed text-warm-gray-700">We bring samples, help you compare the choices and take care of measuring and installation. Your Hunter Douglas quote is tailored to your windows, fabrics and controls.</p>
        <TrackedCta href="/book" event={CONVERSION_EVENTS.ProductCtaClick} className="mt-7 inline-flex rounded-full bg-charcoal px-7 py-4 font-semibold text-white">Book Your Free Consultation</TrackedCta>
      </section>
    </>
  );
}
