import Image from "next/image";
import Link from "next/link";
import { type LuxeVideo, videoPath, videoThumbnail } from "@/lib/videos";

export function RelatedVideos({ videos }: { videos: readonly LuxeVideo[] }) {
  if (!videos.length) return null;

  return (
    <section aria-labelledby="related-videos-heading" className="bg-cream/50 py-12 md:py-16">
      <div className="container-luxe max-w-5xl">
        <p className="text-xs uppercase tracking-[.18em] text-warm-gray-700">From our video library</p>
        <h2 id="related-videos-heading" className="mt-3 font-serif text-3xl text-charcoal">See the shades in motion.</h2>
        <div className={`mt-7 grid gap-6 ${videos.length > 1 ? "md:grid-cols-2" : "max-w-xl"}`}>
          {videos.map((video) => (
            <Link key={video.slug} href={videoPath(video)} className="group overflow-hidden rounded-xl border border-warm-gray-200 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
              <div className="relative aspect-video bg-charcoal">
                <Image src={videoThumbnail(video)} alt={video.shortTitle} fill sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
                <span className="absolute bottom-3 right-3 rounded bg-charcoal/90 px-3 py-1 text-xs text-white">{video.durationLabel}</span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl text-charcoal">{video.shortTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-warm-gray-700">{video.description}</p>
                <p className="mt-4 font-semibold text-charcoal underline underline-offset-4">Watch video <span aria-hidden="true">→</span></p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
