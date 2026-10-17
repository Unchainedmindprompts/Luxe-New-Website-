"use client";

import { usePathname } from "next/navigation";

/**
 * The footer's one-paragraph blurb, route-aware for exactly one reason: the
 * standard text promises Luxe's lifetime installation guarantee, which applies
 * only to Luxe-installed North Idaho work. The Seattle Eastside pages (the
 * /eastside hub, the Hunter Douglas city pages and their area pages) are
 * fulfilled through Hunter
 * Douglas Installation Services, which carries its own one-year installation
 * guarantee, so those routes get the Eastside wording instead. Every other
 * route renders the original text unchanged.
 */
const EASTSIDE_ROUTES = new Set([
  "/eastside",
  "/hunter-douglas-bellevue",
  "/hunter-douglas-kirkland",
  "/hunter-douglas-sammamish",
  "/hunter-douglas-issaquah",
  "/hunter-douglas-renton",
  "/hunter-douglas-maple-valley",
  "/areas/bellevue",
  "/areas/kirkland",
  "/areas/sammamish",
  "/areas/issaquah",
  "/areas/renton",
  "/areas/maple-valley",
]);

export default function FooterBlurb() {
  const pathname = usePathname();
  const eastside = EASTSIDE_ROUTES.has(pathname ?? "");
  return (
    <p className="mt-4 text-sm text-warm-gray-400 leading-relaxed">
      {eastside
        ? "24 years of hands-on expertise in custom window treatments. Serving North Idaho and the Seattle Eastside with premium Hunter Douglas products, measured and installed through Hunter Douglas Installation Services."
        : "24 years of hands-on expertise in custom window treatments. Serving North Idaho with premium products and a lifetime installation guarantee."}
    </p>
  );
}
