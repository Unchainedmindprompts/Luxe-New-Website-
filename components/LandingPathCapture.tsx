"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { rememberOriginatingPath } from "@/lib/originating-path";

/**
 * Stores the first page of the session so later form events can report
 * where the visitor started, without cookies or PII.
 */
export function LandingPathCapture() {
  const pathname = usePathname();

  useEffect(() => {
    rememberOriginatingPath(pathname);
  }, [pathname]);

  return null;
}
