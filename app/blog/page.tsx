import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import { getAllPosts, getReadingTime } from "@/lib/blog";

function CategoryBadge({ category }: { category: string }) {
  const filled = ["Custom Window Coverings"];
  const isFilled = filled.includes(category);
  return (
    <span
      className={
        isFilled
          ? "inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gold text-white"
          : "inline-block text-xs font-semibold px-3 py-1 rounded-full border border-gold text-gold"
      }
    >
      {category}
    </span>
  );
}

export const metadata: Metadata = {
  title: "Blog | Window Treatment Tips & Guides",
  description: `Expert window treatment advice from ${BUSINESS.name}. Tips on choosing the right blinds, shades, and shutters for Northern Idaho homes.`,
  openGraph: {
    title: "Blog | Luxe Window Works",
    description: "Expert window treatment advice for Northern Idaho homeowners.",
    type: "website",
  },
};

function BlogListSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BUSINESS.url}/blog`,
    name: "Luxe Window Works Blog",
    description:
      "Expert window treatment advice, buying guides, and design inspiration from over 20 years of hands-on experience in Northern Idaho homes — by Mark Abplanalp, owner of Luxe Window Works.",
    url: `${BUSINESS.url}/blog`,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": "https://luxewindowworks.com/#mark-abplanalp",
      name: "Mark Abplanalp",
      jobTitle: "Owner & Window Treatment Specialist",
      description:
        "Founder of Luxe Window Works with over 20 years of hands-on window treatment installation experience, serving Coeur d'Alene, Post Falls, Hayden, and Sandpoint, Idaho.",
      worksFor: {
        "@type": "LocalBusiness",
        "@id": "https://luxewindowworks.com/#business",
        name: BUSINESS.name,
      },
    },
    publisher: {
      "@type": "LocalBusiness",
      "@id": "https://luxewindowworks.com/#business",
      name: BUSINESS.name,
      url: BUSINESS.url,
      telephone: BUSINESS.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.address.street,
        addressLocality: BUSINESS.address.city,
        addressRegion: BUSINESS.address.state,
        postalCode: BUSINESS.address.zip,
        addressCountry: "US",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <BlogListSchema />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />

      {/* Hero */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden min-h-[350px] md:min-h-[400px] flex items-center">
        <Image
          src="/images/top-down-bottom-up-shades.jpeg"
          alt="Living room with top-down bottom-up shades overlooking a lake"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-charcoal/55" />
        <div className="container-luxe relative max-w-4xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white leading-tight">
            Window Treatment Insights
          </h1>
          <p className="mt-4 text-lg text-warm-gray-200 leading-relaxed">
            Expert advice, buying guides, and design inspiration from two decades
            of hands-on experience in Northern Idaho homes.
          </p>
        </div>
      </section>

      {/* Post Grid */}
      <section className="py-16 md:py-24 bg-warm-white">
        <div className="container-luxe">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white rounded-lg border border-warm-gray-200 hover:border-gold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 p-7"
              >
                {/* Top row: category badge + read time */}
                <div className="flex items-center justify-between mb-4">
                  <CategoryBadge category={post.category} />
                  <span className="text-warm-gray-400 text-xs">
                    {getReadingTime(post.wordCount)}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-serif text-lg text-charcoal leading-snug group-hover:text-gold transition-colors line-clamp-3 mb-3">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-warm-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                  {post.excerpt}
                </p>

                {/* Bottom row: date + read more */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-warm-gray-100">
                  <time className="text-warm-gray-400 text-xs" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span className="text-gold text-sm font-medium group-hover:underline">
                    Read more →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="container-luxe text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal mb-4">
            Have Questions About Your Windows?
          </h2>
          <p className="text-warm-gray-500 mb-8">
            Mark offers free in-home consultations throughout Northern Idaho.
            Get personalized advice for your specific situation.
          </p>
          <Link
            href="/#concierge"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-all hover:shadow-lg"
          >
            Get Personalized Advice Now
          </Link>
        </div>
      </section>
    </>
  );
}
