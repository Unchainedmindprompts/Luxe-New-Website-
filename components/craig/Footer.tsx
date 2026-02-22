import Link from "next/link";

const currentYear = new Date().getFullYear();

const footerLinks = [
  { href: "/philosophy", label: "The Philosophy" },
  { href: "/expertise", label: "The Expertise" },
  { href: "/work", label: "The Work" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-slate">
      {/* Main footer content */}
      <div className="craig-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="group inline-block mb-6">
              <span className="font-serif text-gold text-2xl font-light block">
                Craig Abplanalp
              </span>
              <span
                className="text-mist uppercase tracking-widest block mt-1"
                style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
              >
                Reference Audio Specialist
              </span>
            </Link>
            <p className="text-mist text-sm leading-relaxed font-sans" style={{ maxWidth: "280px" }}>
              Four decades at the absolute frontier of reference-level home theater and immersive audio.
            </p>
            <div className="gold-divider-left mt-8" />
          </div>

          {/* Navigation */}
          <div>
            <p
              className="text-mist uppercase tracking-widest mb-6 font-sans"
              style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
            >
              Navigate
            </p>
            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-pearl/70 hover:text-gold transition-colors duration-300 text-sm font-sans tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-mist uppercase tracking-widest mb-6 font-sans"
              style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
            >
              Get in Touch
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="tel:2066509017"
                className="text-pearl/70 hover:text-gold transition-colors duration-300 text-sm font-sans tracking-wide"
              >
                206.650.9017
              </a>
              <a
                href="mailto:craig@craigabplanalp.com"
                className="text-pearl/70 hover:text-gold transition-colors duration-300 text-sm font-sans tracking-wide"
              >
                craig@craigabplanalp.com
              </a>
              <div className="mt-2">
                <a
                  href="https://definitive.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist hover:text-gold transition-colors duration-300 text-sm font-sans tracking-wide"
                >
                  Custom Sales Manager
                </a>
                <p className="text-mist/60 text-xs font-sans tracking-wide mt-0.5">
                  Definitive Audio — Bellevue, WA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate/50">
        <div className="craig-container py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-mist/50 text-xs font-sans tracking-wide">
              &copy; {currentYear} Craig Abplanalp. All rights reserved.
            </p>
            <p className="text-mist/40 text-xs font-sans">
              Zero Compromise. Since 1979.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
