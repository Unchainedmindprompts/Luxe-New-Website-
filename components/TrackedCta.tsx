"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  trackConversionEvent,
  type ConversionEventName,
} from "@/lib/conversion-events";
import { readOriginatingPath } from "@/lib/originating-path";

type TrackedCtaProps = {
  href: string;
  event: ConversionEventName;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
};

function fire(event: ConversionEventName, pagePath: string) {
  trackConversionEvent(event, {
    page_path: pagePath,
    originating_path: readOriginatingPath(pagePath),
  });
}

export function TrackedCta({
  href,
  event,
  className,
  children,
  ariaLabel,
  onClick,
}: TrackedCtaProps) {
  const pathname = usePathname() ?? "/";
  const isExternal =
    href.startsWith("tel:") ||
    href.startsWith("mailto:") ||
    href.startsWith("http");

  const handleClick = () => {
    fire(event, pathname);
    onClick?.();
  };

  const focusClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";
  const mergedClass = className ? `${className} ${focusClass}` : focusClass;

  if (isExternal) {
    return (
      <a
        href={href}
        className={mergedClass}
        aria-label={ariaLabel}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={mergedClass}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
