import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

// Transcribed from customer review screenshots supplied by Mark on 2026-09-25.
// Mark confirmed both jobs were in Coeur d'Alene. Mercedes's product is
// identified in his owner response; C P identifies Norman shutters directly.
// Relative screenshot timestamps are deliberately not converted into dates.
const reviews = [
  {
    name: "Mercedes Bull",
    product: "Roller shades",
    href: "/products/roller-shades",
    paragraphs: [
      "Mark made the whole experience seamless. He was very knowledgeable and professional. We could not be happier with the look and quality of product!",
    ],
  },
  {
    name: "C P",
    product: "Norman shutters",
    href: "/products/shutters",
    paragraphs: [
      "Mark did an above and beyond job from beginning to end. Great customer service and installation, and we are very happy we decided to go with him. Highly recommended.",
      "We wanted Norman shutters installed and had a multitude of questions. He very patiently spent around two hours with us answering all our questions and making recommendations. He did all the legwork of making arrangements with the builders to get inside the house early to take measurements so that the shutters would be ready in time for before we moved in. He made excellent recommendations in reference to aesthetics, practical daily use of the shutters and from an installer's perspective as he does his own installs.",
      "In short, you can't go wrong with Mark.",
    ],
  },
];

export default function CdaClientReviews() {
  return (
    <section aria-labelledby="cda-client-reviews" className="py-16 md:py-20 bg-cream/50">
      <div className="container-luxe max-w-4xl">
        <h2 id="cda-client-reviews" className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
          What Our Coeur d&apos;Alene Clients Say
        </h2>
        <p className="text-warm-gray-600 leading-relaxed mb-8">
          From roller shades to Norman shutters, hear from Coeur d&apos;Alene homeowners who chose Luxe for their window treatments.
        </p>
        <div className="space-y-6">
          {reviews.map((review) => (
            <article key={review.name} className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8">
              <p className="text-gold mb-3" aria-label="5 out of 5 stars">
                <span aria-hidden="true">★★★★★</span>
              </p>
              <h3 className="font-serif text-xl text-charcoal mb-4">{review.product}</h3>
              <blockquote className="space-y-4 text-warm-gray-600 leading-relaxed">
                {review.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </blockquote>
              <p className="mt-5 font-semibold text-charcoal">{review.name}</p>
              <p className="text-sm text-warm-gray-600">Coeur d&apos;Alene client · Google review</p>
              <Link href={review.href} className="inline-block mt-5 text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">
                Explore {review.product.toLowerCase()}
              </Link>
            </article>
          ))}
        </div>
        <a href={BUSINESS.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">
          View Luxe Window Works on Google
        </a>
      </div>
    </section>
  );
}
