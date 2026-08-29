import Link from "next/link";

export function RelatedDecisionArticles({
  articles,
}: {
  articles: readonly { title: string; slug: string }[];
}) {
  if (articles.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-warm-white">
      <div className="container-luxe max-w-3xl">
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-8">
          Helpful reading before you decide
        </h2>
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="flex items-center gap-3 bg-white rounded-xl p-5 border border-warm-gray-200/60 hover:border-gold/30 hover:shadow-md transition-all group"
            >
              <span className="text-charcoal font-medium group-hover:text-gold transition-colors">
                {article.title}
              </span>
              <svg
                className="w-4 h-4 text-warm-gray-400 group-hover:text-gold group-hover:translate-x-1 transition-all ml-auto shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
