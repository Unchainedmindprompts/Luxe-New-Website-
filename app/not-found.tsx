import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center bg-warm-white pt-20">
      <div className="container-luxe text-center max-w-lg">
        <p className="text-6xl font-serif text-warm-gray-300 mb-4">404</p>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
          Page Not Found
        </h1>
        <p className="text-warm-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full transition-all"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
