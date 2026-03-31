"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface YoutubeEmbedProps {
  videoId: string;
  title: string;
}

export default function YoutubeEmbed({ videoId, title }: YoutubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePlay = () => {
    setPlaying(true);
    // Send play command directly in response to user gesture —
    // this is required for iOS Safari to allow playback with sound.
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "playVideo", args: [] }),
      "https://www.youtube-nocookie.com"
    );
  };

  return (
    <div className="relative w-full aspect-video bg-charcoal">
      {/* iframe always present so iOS considers play a direct user gesture response */}
      <iframe
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
      {/* Thumbnail overlay — sits on top until user taps play */}
      {!playing && (
        <button
          onClick={handlePlay}
          className="group absolute inset-0 w-full h-full"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark overlay */}
          <span className="absolute inset-0 bg-charcoal/30 group-hover:bg-charcoal/20 transition-colors" />
          {/* Play button */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-20 h-20 md:w-24 md:h-24 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-charcoal translate-x-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
