"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CONVERSION_EVENTS,
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

  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
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
      className={className}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}

export function consultEvent(): ConversionEventName {
  return CONVERSION_EVENTS.ConsultCtaClick;
}

export function phoneEvent(): ConversionEventName {
  return CONVERSION_EVENTS.PhoneClick;
}

export function contactEvent(): ConversionEventName {
  return CONVERSION_EVENTS.ContactCtaClick;
}

export function productEvent(): ConversionEventName {
  return CONVERSION_EVENTS.ProductCtaClick;
}
