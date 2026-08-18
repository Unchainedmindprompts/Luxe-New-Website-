"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * App Router uses next/link, so client navigations do not reload the document
 * and do not re-run fbq('init'). The base snippet already sends PageView on
 * first load; this only sends PageView after the pathname actually changes.
 */
export function MetaPixelRouteListener() {
  const pathname = usePathname();
  const isFirstPath = useRef(true);

  useEffect(() => {
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}
