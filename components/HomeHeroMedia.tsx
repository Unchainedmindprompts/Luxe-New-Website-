"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const still = "/images/luxe-completed-installation.webp";
const description = "Hunter Douglas Vignette Roman Shades installed by Luxe Window Works in a living room with timber beams and a stone fireplace";
const crop = "object-cover object-[35%_center] md:object-center";

/** Motion stays disabled until the approved clip and its opening poster are supplied. */
export default function HomeHeroMedia({ src, poster }: { src?: string; poster?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(true);
  const [ended, setEnded] = useState(false);
  const showMotion = Boolean(src && poster) && !failed;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!showMotion || !motionAllowed || !video.current) return;
    const player = video.current;
    player.muted = true;
    void player.play().catch((error: DOMException) => {
      if (error.name !== "AbortError") setFailed(true);
    });
  }, [showMotion, motionAllowed]);

  function togglePlayback() {
    const player = video.current;
    if (!player) return;
    if (!player.paused && !player.ended) {
      player.pause();
      return;
    }
    if (player.ended) {
      player.currentTime = 0;
      setEnded(false);
    }
    void player.play().catch(() => setFailed(true));
  }

  return (
    <>
      <Image src={still} alt={description} fill
        className={`${crop}${showMotion ? " motion-safe:hidden" : ""}`}
        priority sizes="100vw" quality={90} />
      {showMotion && (
        <>
          {/* The open frame appears before hydration; reduced motion keeps the original still. */}
          <Image src={poster!} alt={description} fill
            className={`${crop} motion-reduce:hidden`}
            priority sizes="100vw" quality={90} />
          {motionAllowed && (
            <>
              <video ref={video} id="home-hero-motion" src={src} poster={poster}
                autoPlay muted playsInline preload="auto" aria-hidden="true"
                className={`absolute inset-0 h-full w-full ${crop} motion-reduce:hidden`}
                onPlay={() => { setPaused(false); setEnded(false); }}
                onPause={() => setPaused(true)}
                onEnded={() => { setEnded(true); setPaused(true); }}
                onError={() => setFailed(true)} />
              <button type="button" aria-controls="home-hero-motion" onClick={togglePlayback}
                className="absolute right-6 top-4 z-20 rounded-full bg-charcoal/90 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:hidden sm:right-10">
                {ended ? "Replay animation" : paused ? "Play animation" : "Pause animation"}
              </button>
            </>
          )}
        </>
      )}
    </>
  );
}
