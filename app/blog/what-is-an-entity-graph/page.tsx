import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";

const SLUG = "what-is-an-entity-graph";
const TITLE = "What Is an Entity Graph? How Local Businesses Get Found by Name, Not Just Keywords";
const DESCRIPTION = "An entity graph tells search engines who you are, not just what you sell. Here is what that means for a local service business — and how Luxe Window Works is built on one.";
const HERO = "/images/hero-modern-living.webp";
const BASE = "https://www.luxewindowworks.com";
const CANONICAL = `${BASE}/blog/${SLUG}`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: "entity graph, schema markup, local SEO, structured data, knowledge graph, local business SEO, JSON-LD, schema.org",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    publishedTime: "2026-04-17T00:00:00.000Z",
    authors: ["Mark Abplanalp"],
    images: [{ url: `${BASE}${HERO}` }],
    tags: ["entity graph", "schema markup", "local SEO", "structured data"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${BASE}${HERO}`],
  },
};

function ArticleSchema() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE}/blog/${SLUG}#article`,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: "2026-04-17T00:00:00Z",
    dateModified: "2026-04-17T00:00:00Z",
    author: { "@id": `${BASE}/#owner` },
    publisher: { "@id": `${BASE}/#business` },
    image: {
      "@type": "ImageObject",
      url: `${BASE}${HERO}`,
      contentUrl: `${BASE}${HERO}`,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/blog/${SLUG}` },
    isPartOf: {
      "@type": "Blog",
      "@id": `${BASE}/blog`,
      name: "Window Treatment Insights",
      publisher: { "@id": `${BASE}/#business` },
    },
    mentions: [
      { "@type": "City", name: "Post Falls", containedInPlace: { "@type": "State", name: "Idaho" } },
      { "@type": "City", name: "Coeur d'Alene", containedInPlace: { "@type": "State", name: "Idaho" } },
    ],
    about: [
      { "@type": "Thing", name: "Entity Graph", sameAs: "https://en.wikipedia.org/wiki/Knowledge_graph" },
      { "@type": "Thing", name: "Structured Data", sameAs: "https://schema.org" },
      { "@type": "Thing", name: "Local SEO" },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: TITLE, item: CANONICAL },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an entity graph?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An entity graph is a structured set of facts about a person, place, or business that search engines use to understand who you are — not just what keywords appear on your site. For a local business, it connects your name, location, services, and people into a machine-readable identity that Google can trust and surface in relevant searches.",
        },
      },
      {
        "@type": "Question",
        name: "How is an entity graph different from regular SEO?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Traditional SEO targets keywords — words that match what searchers type. Entity-based SEO targets identity — making sure Google understands who you are well enough to associate you with a topic automatically. A strong entity graph means you can be recommended even when your exact name or phrase wasn't searched.",
        },
      },
      {
        "@type": "Question",
        name: "Does a small local business need an entity graph?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — arguably more than a national brand. Google's local search results are heavily influenced by entity signals: consistent business name, address, and phone across citations; a verified Google Business Profile; and structured data on your website that ties everything together. A local business with a well-defined entity graph outperforms competitors who rely on keywords alone.",
        },
      },
      {
        "@type": "Question",
        name: "What is JSON-LD and how does it relate to entity graphs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JSON-LD is the format Google recommends for adding structured data to web pages. It lets you embed machine-readable facts directly in your HTML — describing your business, the people behind it, the services you offer, and how those things relate to each other. A well-written JSON-LD implementation is the technical foundation of an entity graph on your own website.",
        },
      },
      {
        "@type": "Question",
        name: "How does Luxe Window Works use an entity graph?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every page on this site carries structured data that describes the business, its owner, the services offered, and the cities served. Blog articles reference the same owner and business entities, creating a consistent, interconnected identity across the site. This helps Google understand that Luxe Window Works is the authoritative local source for custom window treatments in Northern Idaho — not just a site that mentions those words.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}

export default function Page() {
  const tags = ["entity graph", "schema markup", "local SEO", "structured data", "knowledge graph", "JSON-LD"];

  return (
    <>
      <ArticleSchema />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: TITLE },
        ]}
      />

      <article className="pb-20 md:pb-28">
        {/* Header */}
        <section className="bg-cream pb-12 md:pb-16">
          <div className="container-luxe max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-gold font-medium text-sm uppercase tracking-widest">SEO &amp; SCHEMA</span>
              <span className="text-warm-gray-400">·</span>
              <time className="text-warm-gray-500 text-sm" dateTime="2026-04-17">April 17, 2026</time>
              <span className="text-warm-gray-400">·</span>
              <span className="text-warm-gray-500 text-sm">8 min read</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-charcoal leading-tight">
              What Is an Entity Graph? How Local Businesses Get Found by Name, Not Just Keywords
            </h1>
            <p className="post-excerpt mt-4 text-lg text-warm-gray-500 leading-relaxed">
              {DESCRIPTION}
            </p>
            <p className="mt-3 text-sm text-warm-gray-400">By Mark Abplanalp</p>
          </div>
        </section>

        {/* Hero image */}
        <section className="container-luxe max-w-3xl -mt-2 mb-8">
          <Image
            src={HERO}
            alt="Luxe Window Works — custom window treatments in Northern Idaho"
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 768px"
            className="w-full h-auto rounded-2xl"
            priority
          />
        </section>

        {/* Article body */}
        <section className="py-12 md:py-16 bg-warm-white">
          <div className="container-luxe max-w-3xl">
            <div className="prose prose-lg prose-warm-gray max-w-none prose-headings:font-serif prose-headings:text-charcoal prose-p:text-warm-gray-600 prose-p:leading-relaxed prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-strong:text-charcoal prose-img:rounded-xl prose-img:mx-auto prose-figure:my-8 prose-li:text-warm-gray-600">

              {/* ARTICLE_BODY */}

            </div>
          </div>
        </section>

        {/* Tags */}
        <section className="py-8 bg-warm-white border-t border-warm-gray-200/60">
          <div className="container-luxe max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-warm-gray-400 text-sm font-medium mr-1">Tags:</span>
              {tags.map((tag) => (
                <span key={tag} className="inline-block bg-cream text-warm-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-cream">
          <div className="container-luxe text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl text-charcoal mb-4">Have Questions About Your Windows?</h2>
            <p className="text-warm-gray-500 mb-8">
              Our team offers free in-home consultations throughout Northern Idaho. Get personalized advice for your specific situation.
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
