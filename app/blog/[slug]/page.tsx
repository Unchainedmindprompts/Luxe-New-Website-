import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";
import { getPost, getAllSlugs, getReadingTime } from "@/lib/blog";
import type { BlogPost } from "@/lib/blog";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  const description = post.metaDescription || post.excerpt;
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

/** Derive article-specific keywords from title + tags */
function deriveKeywords(post: BlogPost): string {
  const kw = new Set<string>();

  // Existing tags (normalise hyphens)
  post.tags.forEach((t) => kw.add(t.replace(/-/g, " ")));

  // Always-present base terms
  kw.add("window treatments");
  kw.add("Northern Idaho");
  kw.add("Luxe Window Works");
  kw.add("Mark Abplanalp");
  kw.add("custom window coverings");

  const t = post.title.toLowerCase();

  // Location signals
  const locations: [string, string][] = [
    ["coeur d'alene", "Coeur d'Alene Idaho"],
    ["coeur dalene", "Coeur d'Alene Idaho"],
    [" cda ", "Coeur d'Alene"],
    ["post falls", "Post Falls Idaho"],
    ["hayden", "Hayden Idaho"],
    ["sandpoint", "Sandpoint Idaho"],
    ["rathdrum", "Rathdrum Idaho"],
    ["north idaho", "North Idaho"],
    ["northern idaho", "Northern Idaho"],
  ];
  for (const [key, label] of locations) {
    if (t.includes(key)) kw.add(label);
  }

  // Product signals
  const products: [string, string][] = [
    ["cellular shade", "cellular shades"],
    ["honeycomb shade", "honeycomb shades"],
    ["roller shade", "roller shades"],
    ["solar shade", "solar shades"],
    ["solar screen", "solar screens"],
    ["plantation shutter", "plantation shutters"],
    ["shutter", "shutters"],
    ["motorized shade", "motorized shades"],
    ["motorized", "motorized window treatments"],
    ["roman shade", "roman shades"],
    ["woven wood", "woven wood shades"],
    ["wood blind", "wood blinds"],
    ["faux wood", "faux wood blinds"],
    ["aluminum shutter", "aluminum shutters"],
    ["drape", "window drapes"],
    ["banded shade", "banded shades"],
    ["cordless blind", "cordless blinds"],
    ["blackout shade", "blackout shades"],
    ["smart shade", "smart home shades"],
  ];
  for (const [key, label] of products) {
    if (t.includes(key)) kw.add(label);
  }

  // Topic signals
  const topics: [string, string][] = [
    ["energy efficient", "energy efficient window treatments"],
    ["energy saving", "energy saving window coverings"],
    ["install", "window treatment installation"],
    ["measur", "window measuring guide"],
    ["clean", "window treatment care"],
    ["cost", "window treatment cost"],
    ["price", "window treatment pricing"],
    ["luxury", "luxury window treatments"],
    ["custom", "custom window coverings"],
    ["privacy", "privacy window coverings"],
    ["blackout", "blackout window treatments"],
    ["smart home", "smart home automation"],
    ["motoriz", "home automation"],
    ["battery", "battery operated shades"],
    ["patio door", "patio door window treatments"],
    ["made in usa", "made in USA window treatments"],
  ];
  for (const [key, label] of topics) {
    if (t.includes(key)) kw.add(label);
  }

  return Array.from(kw).join(", ");
}

/** Full Person schema for Mark — reused in every post */
const markAuthorSchema = {
  "@type": "Person",
  "@id": "https://luxewindowworks.com/about#mark-abplanalp",
  name: "Mark Abplanalp",
  jobTitle: "Owner & Window Treatment Specialist",
  description:
    "Mark Abplanalp has worked in the window treatment industry since 2002 — 23 years of hands-on sales, design, and installation experience. He launched Luxe Window Works in Post Falls, Idaho in March 2025, focused on family-owned manufacturers and locally owned service.",
  url: "https://luxewindowworks.com/about",
  worksFor: {
    "@type": "LocalBusiness",
    "@id": "https://luxewindowworks.com/#business",
    name: "Luxe Window Works",
    url: "https://luxewindowworks.com",
  },
  knowsAbout: [
    "custom window treatments",
    "plantation shutters",
    "cellular shades",
    "motorized window treatments",
    "solar shades",
    "roller shades",
    "window treatment installation",
    "energy efficient window coverings",
    "Northern Idaho home design",
    "fenestration design",
    "commercial window treatments",
  ],
  areaServed: [
    "Coeur d'Alene, Idaho",
    "Post Falls, Idaho",
    "Hayden, Idaho",
    "Sandpoint, Idaho",
    "Northern Idaho",
  ],
};

/** FAQPage schema — installation timeline post */
const installationFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id":
    "https://luxewindowworks.com/blog/your-complete-guide-to-custom-blinds-installation-in-northern-idaho-with-luxe-window-works#faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does window treatment installation take in Coeur d'Alene and Northern Idaho?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most custom window treatment orders take 3 to 4 weeks from the time of ordering to installation in Northern Idaho. That includes order processing, manufacturing, and scheduling your installation appointment. Some products take longer — custom drapes and plantation shutters typically run 6 to 8 weeks depending on the manufacturer. Contact Luxe Window Works at 208-660-8643 for current lead times on your specific product.",
      },
    },
    {
      "@type": "Question",
      name: "How long do custom window treatments last compared to big box store blinds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Custom window treatments from quality manufacturers typically last 15 to 20 years or more with proper care. Mass-produced blinds from big box stores typically last 3 to 7 years. The difference comes down to material quality, precision fit, and professional installation.",
      },
    },
    {
      "@type": "Question",
      name: "Does Luxe Window Works offer free consultations in Northern Idaho?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Luxe Window Works offers free in-home consultations throughout Northern Idaho including Coeur d'Alene, Post Falls, Hayden, Sandpoint, and Rathdrum. During the consultation we assess your windows, show product samples, and provide honest recommendations with no pressure and no hidden costs.",
      },
    },
  ],
};

/** HowTo schema — 5-step installation process */
const installationHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id":
    "https://luxewindowworks.com/blog/your-complete-guide-to-custom-blinds-installation-in-northern-idaho-with-luxe-window-works#howto",
  name: "How to Get Custom Window Treatments Installed in Northern Idaho",
  description:
    "The Luxe Window Works 5-step process for getting custom window treatments measured, ordered, and professionally installed in Northern Idaho.",
  totalTime: "P4W",
  supply: [
    {
      "@type": "HowToSupply",
      name: "Custom window treatments from family-owned manufacturers",
    },
  ],
  tool: [
    {
      "@type": "HowToTool",
      name: "Professional measuring tools",
    },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Free In-Home Consultation",
      text: "Mark visits your home to assess your windows, discuss your functional requirements, and explore design possibilities. This is a collaborative planning session — no pressure, no sales pitch.",
      url: "https://luxewindowworks.com/book",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Expert Product Selection",
      text: "With 23 years of hands-on experience, our team guides you through product selection based on your specific needs — whether energy-efficient cellular shades, blackout solutions, or motorized blinds for hard-to-reach windows.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Precision Measuring",
      text: "Our team uses professional-grade tools and follows manufacturer specifications to ensure every measurement is precise. We account for window depth, mounting preferences, and any architectural irregularities.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Professional Installation",
      text: "We handle every aspect of installation, from mounting hardware to final adjustments. We protect your walls, floors, and furnishings throughout and clean up completely before we leave. Every installation comes with a workmanship warranty.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Ongoing Support and Service",
      text: "Our relationship with you doesn't end at installation. We provide ongoing support for warranty claims, maintenance questions, and future window treatment needs. Direct manufacturer relationships mean faster service when you need assistance.",
    },
  ],
};

/** Slug-specific additional schema — add new entries here as needed */
const SLUG_SCHEMA: Record<string, object[]> = {
  "your-complete-guide-to-custom-blinds-installation-in-northern-idaho-with-luxe-window-works": [
    installationFAQSchema,
    installationHowToSchema,
  ],
};

function ArticleSchema({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BUSINESS.url}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    wordCount: post.wordCount,
    articleSection: post.category,
    keywords: deriveKeywords(post),
    inLanguage: "en-US",
    author: markAuthorSchema,
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BUSINESS.url}/blog/${post.slug}`,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${BUSINESS.url}/blog`,
      name: "Luxe Window Works Blog",
      publisher: {
        "@type": "LocalBusiness",
        "@id": "https://luxewindowworks.com/#business",
        name: BUSINESS.name,
      },
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".post-excerpt"],
    },
    ...(post.featuredImage && {
      image: {
        "@type": "ImageObject",
        url: post.featuredImage,
        contentUrl: post.featuredImage,
      },
    }),
  };

  const additionalSchemas = SLUG_SCHEMA[post.slug] || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {additionalSchemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <ArticleSchema post={post} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <article className="pb-20 md:pb-28">
        {/* Header */}
        <section className="bg-cream pb-12 md:pb-16">
          <div className="container-luxe max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gold font-medium text-sm uppercase tracking-widest">
                {post.category}
              </span>
              <span className="text-warm-gray-400">·</span>
              <time className="text-warm-gray-500 text-sm" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-warm-gray-400">·</span>
              <span className="text-warm-gray-500 text-sm">
                {getReadingTime(post.wordCount)}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="post-excerpt mt-4 text-lg text-warm-gray-500 leading-relaxed">
                {post.excerpt}
              </p>
            )}
            <p className="mt-3 text-sm text-warm-gray-400">
              By {post.author}
            </p>
          </div>
        </section>

        {/* Featured Image */}
        {post.featuredImage && (
          <section className="container-luxe max-w-3xl -mt-2 mb-8">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.featuredImageAlt || post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          </section>
        )}

        {/* Content */}
        <section className="py-12 md:py-16 bg-warm-white">
          <div className="container-luxe max-w-3xl">
            <div
              className="prose prose-lg prose-warm-gray max-w-none
                prose-headings:font-serif prose-headings:text-charcoal
                prose-p:text-warm-gray-600 prose-p:leading-relaxed
                prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                prose-strong:text-charcoal
                prose-img:rounded-xl prose-img:mx-auto
                prose-figure:my-8
                prose-li:text-warm-gray-600"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </section>

        {/* Tags */}
        {post.tags.length > 0 && (
          <section className="py-8 bg-warm-white border-t border-warm-gray-200/60">
            <div className="container-luxe max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-warm-gray-400 text-sm font-medium mr-1">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-cream text-warm-gray-600 text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 bg-cream">
          <div className="container-luxe text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl text-charcoal mb-4">
              Have Questions About Your Windows?
            </h2>
            <p className="text-warm-gray-500 mb-8">
              Our team offers free in-home consultations throughout Northern Idaho.
              Get personalized advice for your specific situation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#concierge"
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full transition-all"
              >
                Start a Consultation
              </Link>
              <a
                href={BUSINESS.phoneHref}
                className="text-charcoal font-semibold hover:text-gold transition-colors"
              >
                Call {BUSINESS.phone}
              </a>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
