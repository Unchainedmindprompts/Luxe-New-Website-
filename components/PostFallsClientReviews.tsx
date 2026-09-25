import { BUSINESS } from "@/lib/constants";

// Review text transcribed from screenshots supplied by Mark on 2026-09-25.
// Mark confirmed these are Post Falls clients, not that every home mentioned
// in a customer's history is in Post Falls. No dates or product models inferred.
const reviews = [
  {
    name: "Chris Ampongan",
    heading: "Shade recommendations for each room",
    excerpt: "Mark analyzed what we wanted and needed. Then, Mark recommended best options, models, configurations, controls, and functions.",
    paragraphs: [
      "Our home's living room and bedrooms, are beautiful based what we needed. Thanks to Mark Abplanalp's expertise! 😀👍🏻",
      "Mark analyzed what we wanted and needed. Then, Mark recommended best options, models, configurations, controls, and functions. Thus, in the living room, we have good privacy, good views (with the shades closed), as it protects against ultra bright sunlight. The shades in the bedrooms were different, simpler and they all turned out nicely.",
      "We couldn't have done this without Mark's expertise! He gave us so much more options that were so much better. Thank you very much, Mark! 👏🏻😀",
    ],
  },
  {
    name: "Kris Toop",
    heading: "Window coverings for a new home",
    excerpt: "He responded right away, communicated exceptionally well throughout the entire process, and quickly came out to measure our windows.",
    paragraphs: [
      "We recently had Mark at Luxe Window Works provide the window coverings for our entire new home, and we couldn’t be happier with the experience!",
      "After initially trying another local company and being disappointed with their communication and scheduling, a friend recommended Mark. The difference was immediate. He responded right away, communicated exceptionally well throughout the entire process, and quickly came out to measure our windows. He brought plenty of samples, patiently answered our questions, and helped us determine the best options for our home.",
      "Mark is extremely knowledgeable, professional, and easy to work with. Having worked with other window covering companies in the past, we can confidently say he is top-notch.",
      "We’ve already recommended Luxe Window Works to friends and will happily continue to do so.",
      "Highly recommend!",
    ],
  },
  {
    name: "Paul Weaver",
    heading: "Recommendations that respect your budget",
    excerpt: "He is very good at providing tailored recommendations based on your needs and budget.",
    paragraphs: [
      "Mark has installed window coverings in four of our homes over the years. He is very good at providing tailored recommendations based on your needs and budget. Mark has extensive knowledge and experience, and he really takes the time to make sure you will be 100% satisfied with your choices.",
    ],
  },
];

export default function PostFallsClientReviews() {
  return (
    <section aria-labelledby="post-falls-client-reviews" className="py-16 md:py-20 bg-cream/50">
      <div className="container-luxe max-w-4xl">
        <h2 id="post-falls-client-reviews" className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
          What Our Post Falls Clients Say
        </h2>
        <p className="text-warm-gray-600 leading-relaxed mb-8">
          Personal recommendations, clear communication, and thoughtful installation — in our clients&apos; own words.
        </p>
        <div className="space-y-6">
          {reviews.map((review) => (
            <article key={review.name} className="bg-white rounded-2xl border border-warm-gray-200/60 p-6 md:p-8">
              <p className="text-gold mb-3" aria-label="5 out of 5 stars"><span aria-hidden="true">★★★★★</span></p>
              <h3 className="font-serif text-xl text-charcoal mb-4">{review.heading}</h3>
              <blockquote className="text-warm-gray-600 leading-relaxed"><p>{review.excerpt}</p></blockquote>
              <p className="mt-5 font-semibold text-charcoal">{review.name}</p>
              <p className="text-sm text-warm-gray-600">Post Falls client · Google review excerpt</p>
              <details className="mt-5">
                <summary className="cursor-pointer text-charcoal underline underline-offset-4 decoration-gold hover:text-gold-dark">
                  Read full review<span className="sr-only"> from {review.name}</span>
                </summary>
                <blockquote className="mt-4 space-y-4 text-warm-gray-600 leading-relaxed">
                  {review.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </blockquote>
              </details>
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
