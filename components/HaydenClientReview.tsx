import { BUSINESS } from "@/lib/constants";

// Verbatim review supplied by Mark on 2026-09-25; he confirmed the homeowner
// lives in Hayden. Product type and exact review date were not supplied.
const paragraphs = [
  "Outstanding experience with Mark at Luxe Window Works!",
  "As designers we love to work with professionals to implement our designs. We always have very “custom” requirements, and that was certainly the case with Mark and Luxe Window Works. Mark paid super close attention during the ordering process, and it really paid off! Our design criteria was realized meticulously, and Marks installation was thorough (and fast!), with the end result exceeding our expectations.",
  "Window treatments can make or break an interior design, so it’s mandatory to have a resource that offers a curated selection of the best made, proven quality products, as Luxe does. In the end it saves time and money, and results in very happy clients. And we all want happy clients!",
];

export default function HaydenClientReview() {
  return (
    <section aria-labelledby="hayden-client-review" className="py-16 md:py-20 bg-cream/50">
      <div className="container-luxe max-w-4xl">
        <h2 id="hayden-client-review" className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">
          A Hayden Client&apos;s Experience
        </h2>
        <article className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8">
          <p className="text-gold mb-3" aria-label="5 out of 5 stars"><span aria-hidden="true">★★★★★</span></p>
          <h3 className="font-serif text-xl text-charcoal mb-4">Attention to design details, from ordering to installation</h3>
          <blockquote className="text-warm-gray-600 leading-relaxed">
            <p>Mark paid super close attention during the ordering process, and it really paid off! Our design criteria was realized meticulously, and Marks installation was thorough (and fast!), with the end result exceeding our expectations.</p>
          </blockquote>
          <p className="mt-5 font-semibold text-charcoal">CASUDI Caroline Di Diego</p>
          <p className="text-sm text-warm-gray-600">Hayden client · Google review excerpt</p>
          <details className="mt-5">
            <summary className="cursor-pointer text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">
              Read full review<span className="sr-only"> from CASUDI Caroline Di Diego</span>
            </summary>
            <blockquote className="mt-4 space-y-4 text-warm-gray-600 leading-relaxed">
              {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </blockquote>
          </details>
        </article>
        <a href={BUSINESS.google.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">
          View Luxe Window Works on Google
        </a>
      </div>
    </section>
  );
}
