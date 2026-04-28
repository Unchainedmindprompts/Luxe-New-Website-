"use client";

import { useState } from "react";
import Image from "next/image";

interface YoutubeEmbedProps {
  videoId: string;
  title: string;
}

export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
  const [playing, setPlaying] = useState(false);

  // Render the player only after click. The iframe is created synchronously
  // inside the click handler, which satisfies iOS Safari's "direct user
  // gesture" requirement for autoplay with sound — no always-present iframe
  // needed. This eliminates ~514 KiB of YouTube JS from the initial load.
  if (playing) {
    return (
      <div className="relative w-full aspect-video bg-charcoal">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-charcoal">
      <Image
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-charcoal/30" />
      <button
        onClick={() => setPlaying(true)}
        className="group absolute inset-0 w-full h-full flex items-center justify-center"
        aria-label={`Play video: ${title}`}
      >
        <span className="w-20 h-20 md:w-24 md:h-24 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
          <svg
            className="w-8 h-8 md:w-10 md:h-10 text-charcoal translate-x-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
    </div>
  );
}
