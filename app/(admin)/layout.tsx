import type { Metadata } from "next";

/**
 * Explicit noindex on all /admin routes.
 * Overrides the root layout metadata for this route group so nothing
 * in the Payload admin leaks into the Luxe SEO footprint.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
