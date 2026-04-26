"use client";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Header />}
      <main className={!isAdmin ? "min-h-screen" : undefined}>{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
