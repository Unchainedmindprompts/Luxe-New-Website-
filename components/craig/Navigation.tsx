"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/philosophy", label: "Philosophy" },
  { href: "/expertise", label: "Expertise" },
  { href: "/work", label: "The Work" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome || mobileOpen
            ? "bg-obsidian/95 backdrop-blur-md border-b border-slate"
            : "bg-transparent"
        }`}
      >
        <div className="craig-container">
          <nav className="flex items-center justify-between h-18 md:h-20">
            {/* Logo */}
            <Link href="/" className="group flex flex-col leading-none">
              <span
                className="font-serif text-gold tracking-wide transition-opacity duration-300 group-hover:opacity-80"
                style={{ fontSize: "1.25rem", fontWeight: 400 }}
              >
                Craig Abplanalp
              </span>
              <span
                className="text-mist tracking-widest uppercase mt-0.5"
                style={{ fontSize: "0.55rem", letterSpacing: "0.22em" }}
              >
                Reference Audio Specialist
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="btn-gold ml-4"
                style={{ padding: "0.5rem 1.5rem", fontSize: "0.7rem" }}
              >
                Start a Conversation
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
              aria-label="Toggle navigation"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="block w-6 h-px bg-pearl"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="block w-6 h-px bg-pearl"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="block w-6 h-px bg-pearl"
              />
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-obsidian/98 backdrop-blur-lg flex flex-col"
          >
            {/* Spacer for nav height */}
            <div className="h-18 md:h-20" />

            <div className="flex-1 flex flex-col justify-center items-center gap-10 pb-20">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className={`font-serif text-5xl font-light transition-colors duration-300 ${
                      pathname === link.href ? "text-gold" : "text-pearl hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-6"
              >
                <Link href="/contact" className="btn-gold">
                  Start a Conversation
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-4 text-center"
              >
                <a
                  href="tel:2066509017"
                  className="text-mist text-sm tracking-wider font-sans"
                >
                  206.650.9017
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
