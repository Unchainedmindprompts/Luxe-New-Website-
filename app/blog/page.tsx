import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import { getAllPosts, getReadingTime } from "@/lib/blog";

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
            Expert advice, buying guides, and design inspiration from nearly 20 years
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
                className="group bg-white rounded-2xl overflow-hidden border border-warm-gray-200/60 hover:border-gold/40 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                {post.featuredImage ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-cream flex items-center justify-center">
                    <svg className="w-12 h-12 text-warm-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <time
                      className="text-warm-gray-400 text-sm"
                      dateTime={post.date}
                    >
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span className="text-warm-gray-300">·</span>
                    <span className="text-warm-gray-400 text-sm">
                      {getReadingTime(post.wordCount)}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg text-charcoal leading-snug group-hover:text-gold transition-colors line-clamp-3">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-warm-gray-500 text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
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
