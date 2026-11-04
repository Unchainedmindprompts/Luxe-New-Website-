import { BUSINESS } from "@/lib/constants";

// Twinned from UtahReviewsStrip on Nov 4, 2026 for the North Idaho Hunter
// Douglas city pages. Same Google review excerpts (transcribed from
// customer review screenshots supplied by Mark on 2026-09-25, the same
// source as PostFallsClientReviews): reviews belong to the business, not
// to a single service area, so the North Idaho pages carry the same Google
// rating and review link as the Utah and Eastside pages. Only the section
// id differs, so it does not name another market as the standard for
// this one.
const reviews = [
  {
    name: "Kris Toop",
    text: "He responded right away, communicated exceptionally well throughout the entire process, and quickly came out to measure our windows. He brought plenty of samples, patiently answered our questions, and helped us determine the best options for our home.",
  },
  {
    name: "Paul Weaver",
    text: "Mark has installed window coverings in four of our homes over the years. He is very good at providing tailored recommendations based on your needs and budget.",
  },
];

export default function NorthIdahoReviewsStrip() {
  return (
    <section aria-labelledby="north-idaho-hd-google-reviews" className="bg-cream/50 py-14 md:py-20">
      <div className="container-luxe max-w-4xl">
        <p className="text-xs uppercase tracking-[.18em] text-gold-dark">Google Reviews</p>
        <h2 id="north-idaho-hd-google-reviews" className="mt-4 font-serif text-3xl text-charcoal sm:text-4xl">
          Rated {BUSINESS.google.rating.toFixed(1)} on Google.
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-warm-gray-700">
          Luxe Window Works holds a {BUSINESS.google.rating.toFixed(1)} rating across{" "}
          {BUSINESS.google.reviewCount} Google reviews. A review belongs to the business, not
          to one service area: the same dealer and the same standard, in every market
          Luxe serves.
        </p>
        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.name} className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8">
              <p className="text-gold" aria-hidden="true">★★★★★</p>
              <p className="mt-4 leading-relaxed text-warm-gray-700">{review.text}</p>
              <p className="mt-5 font-semibold text-charcoal">{review.name}</p>
              <p className="text-sm text-warm-gray-600">Google review</p>
            </article>
          ))}
        </div>
        <p className="mt-8">
          <a
            href={BUSINESS.google.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark"
          >
            Read all {BUSINESS.google.reviewCount} reviews on Google
          </a>
        </p>
      </div>
    </section>
  );
}
