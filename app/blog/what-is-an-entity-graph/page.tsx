import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { BUSINESS } from "@/lib/constants";

const SLUG = "what-is-an-entity-graph";
const TITLE = "What Is an Entity Graph — And Why the Technology Behind It Has Been Hiding in Plain Sight for Over a Decade";
const DESCRIPTION = "Schema.org launched in 2011. Most of the web still gets structured data wrong. What an entity graph actually is, why it matters more now than ever, and how a properly built implementation compounds over time.";
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
              What Is an Entity Graph — And Why the Technology Behind It Has Been Hiding in Plain Sight for Over a Decade
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

              <p>Schema.org launched in June 2011.</p>

              <p>Google, Microsoft, and Yahoo — three companies that competed fiercely on almost everything — agreed on something together. They created a shared vocabulary for the web. A universal language that would allow any website to communicate its meaning directly to machines, not just humans.</p>

              <p>The idea was elegant. Instead of forcing search engines to guess what a page was about by analyzing words and links, website owners could simply label their content. This is a business. This is the owner. This is what we do. This is where we operate. This is how you reach us.</p>

              <p>No inference required. No guessing. Just clear, structured, machine-readable identity.</p>

              <p>That was 2011.</p>

              <p>It is now 2026. And the overwhelming majority of websites on the internet either have no schema at all, have schema that is technically broken, or have schema that is so generic and disconnected it communicates almost nothing useful to the systems now making the most important decisions about who gets found and who stays invisible.</p>

              <p>The technology that was designed to be the standard language of the internet is still, after more than a decade, one of the most misunderstood and misused tools in digital marketing.</p>

              <p>That gap is not an accident. And closing it is now more important than it has ever been.</p>

              <h2>What Schema Actually Is — Stripped Down to Plain Language</h2>

              <p>Before we talk about entity graphs, you need to understand what schema markup actually is. Because most explanations make it sound more complicated than it needs to be.</p>

              <p>Schema is a label.</p>

              <p>That is it. At its core, schema markup is a standardized system of labels that tells machines what your content means — not just what it says.</p>

              <p>Here is the difference. Your website might say: &ldquo;Mark Abplanalp has been installing window treatments since 2002.&rdquo; A human reads that and understands immediately — experienced professional, long track record, trustworthy.</p>

              <p>A machine reads that and sees words. It can infer meaning, but inference is imperfect. It might associate &ldquo;Mark Abplanalp&rdquo; with window treatments. It might not. It depends on context, links, and a hundred other signals the algorithm is weighing simultaneously.</p>

              <p>Schema removes the inference. With proper markup, that same information becomes a structured statement the machine reads with complete clarity: this is a Person, their name is Mark Abplanalp, their job title is Owner and Window Treatment Specialist, they have been working in this industry since 2002, they work for this specific business, and that business is located at this address and serves these cities.</p>

              <p>No guessing. No inference. Direct communication between your website and the machine reading it.</p>

              <p>Schema.org provides the vocabulary — a shared dictionary of types and properties that every major search engine and AI platform has agreed to recognize. Person. Organization. LocalBusiness. BlogPosting. FAQPage. Product. Service. Each type has defined properties. Each property has an accepted format. When you use them correctly, you are speaking the native language of the machines that determine whether your business gets found.</p>

              <h2>Why Most Schema Implementations Are Wrong</h2>

              <p>Here is the uncomfortable truth about schema in 2026: most websites that have it are doing it wrong. And most digital marketing practitioners selling schema services either don&apos;t understand the depth of what&apos;s possible or don&apos;t have the technical ability to implement it correctly.</p>

              <h3>The Template Schema Problem</h3>

              <p>The most common failure is template schema — the same generic block copy-pasted across every page of a site with a few variables swapped in. A business name here. A phone number there. Maybe an address. The result is schema that technically validates but communicates almost nothing useful. It tells machines you exist. It doesn&apos;t tell them who you are.</p>

              <h3>The Disconnected Schema Problem</h3>

              <p>The second most common failure is disconnected schema — multiple blocks on the same site that don&apos;t reference each other. A LocalBusiness block that doesn&apos;t connect to the Person who owns it. Blog articles with author fields that point to a flat name string rather than a verified identity. An Organization block that has no relationship to the services it offers or the expert behind them.</p>

              <p>Disconnected schema is the digital equivalent of a business card with no name on it. The information is present. The identity isn&apos;t.</p>

              <h3>The Conflicting Schema Problem</h3>

              <p>The third failure — and this one is especially common among WordPress sites using plugins like Yoast or RankMath — is conflicting schema. Multiple plugins attempting to mark up the same page simultaneously, producing contradictory structured data that confuses rather than clarifies. Google&apos;s Rich Results Test flags errors and warnings on the majority of plugin-generated schema implementations. The practitioners selling these implementations rarely check.</p>

              <h2>What an Entity Graph Actually Is</h2>

              <p>This is where it gets important.</p>

              <p>An entity graph is what happens when schema stops being a collection of isolated labels and becomes a connected system of identity.</p>

              <p>Think of it this way. A label tells a machine: this thing exists. An entity graph tells a machine: this thing exists, it is connected to these other things, those things are verified by these external sources, and all of it is consistent across every page of this website and every platform where this business has a presence.</p>

              <p>The difference between a label and an entity graph is the difference between a name tag and a verified identity.</p>

              <p>Here is what a properly built entity graph looks like in practice. Every page of your website references the same named entities through stable, unique identifiers called <code>@id</code> anchors. Your business has an <code>@id</code>. The person who owns the business has an <code>@id</code>. Every article published on the site lists its author as a reference to that person&apos;s <code>@id</code> — not a name string, not a flat object, but a direct connection to the verified identity that owns the expertise behind the content.</p>

              <p>When an AI engine crawls your site, it doesn&apos;t just see pages. It sees a network. The business connects to the owner. The owner connects to their expertise, their credentials, their external profiles. Every article connects back to the same expert. Every service page connects back to the same business. The <code>sameAs</code> arrays on your Organization and Person blocks point to your Google Business Profile, your Yelp listing, your LinkedIn profile, your BBB page — external sources that corroborate the identity you&apos;re claiming.</p>

              <p>The machine builds a picture. And the picture is clear, consistent, and verifiable from multiple independent sources.</p>

              <p>That is an entity graph.</p>

              <h2>Why It Matters More Right Now Than It Ever Has</h2>

              <p>Schema.org has existed for over a decade. So why does this matter so much more in 2026 than it did in 2015?</p>

              <p>Because the systems processing your structured data changed fundamentally.</p>

              <h3>When Google Was the Only Consumer</h3>

              <p>For most of schema&apos;s history, the primary consumer was Google&apos;s ranking algorithm. Schema helped you qualify for rich results — the star ratings, FAQ dropdowns, and breadcrumb trails that made your listing stand out in search results. Valuable, but ultimately incremental.</p>

              <h3>When AI Engines Entered the Picture</h3>

              <p>Then large language models entered the picture.</p>

              <p>ChatGPT, Perplexity, Google AI Overviews, and the growing ecosystem of AI-powered search tools don&apos;t rank pages. They identify trusted sources. They synthesize information from across the web and cite the businesses, experts, and organizations they have enough structured evidence to recommend with confidence.</p>

              <p>Entity clarity is not a nice-to-have for these systems. It is a prerequisite.</p>

              <p>An AI engine encountering a business with a complete, connected entity graph — verified identity, linked expertise, corroborated by external sources, consistent across every page — has everything it needs to make a confident recommendation. An AI engine encountering a website with no schema, template schema, or disconnected schema has to guess. And when AI engines guess, they default to the sources they can verify.</p>

              <p>Your competitor with better entity infrastructure gets recommended. You don&apos;t. Not because their content is better. Not because their business is better. Because the machine knows who they are and isn&apos;t sure about you.</p>

              <h2>Building an Entity Graph: What It Actually Takes</h2>

              <p>A complete entity graph for a local service business has a small number of core components, but every one of them has to be built correctly and connected to the others.</p>

              <h3>The Foundation: Your Business Entity</h3>

              <p>The foundation is a LocalBusiness or Organization block at the layout level — meaning it appears on every page of the site — with a stable <code>@id</code> anchor that every other block on the site can reference. This block includes the business name, contact information, service area, hours, offer catalog, and a <code>sameAs</code> array pointing to every verified external profile where the business has a presence.</p>

              <h3>The Owner Entity</h3>

              <p>Nested inside that block — or connected to it through a separate Person block — is the owner entity. A real named person with their own <code>@id</code>, their job title, a description of their expertise, a <code>knowsAbout</code> array covering every topic they have genuine authority on, and their own <code>sameAs</code> array pointing to their LinkedIn profile, their professional social presence, and any other verifiable external identity.</p>

              <h3>The Article Layer</h3>

              <p>Every blog article published on the site connects to both of these entities. The author field doesn&apos;t say &ldquo;Mark Abplanalp.&rdquo; It references the <code>@id</code> of the Person block. The publisher field doesn&apos;t say &ldquo;Luxe Window Works.&rdquo; It references the <code>@id</code> of the business block. The <code>isPartOf</code> field connects the article to the site&apos;s blog entity, which in turn connects back to the business.</p>

              <p>Every connection compounds. Every article published strengthens the same entity. Every external citation corroborates the same identity. Over time the machine&apos;s picture of who you are becomes sharper, more confident, and harder for a competitor to displace.</p>

              <p>That compounding effect is the moat.</p>

              <h2>The Window That Is Still Open</h2>

              <p>Most businesses don&apos;t have this. Most digital marketing agencies don&apos;t build it. Most web developers don&apos;t know it exists.</p>

              <p>Schema.org has been the standard language of the internet for over a decade. The vocabulary has been there the whole time. The practitioners who should have been teaching it and implementing it correctly largely haven&apos;t.</p>

              <p>That gap is closing — but it hasn&apos;t closed yet.</p>

              <p>The businesses building complete, connected entity graphs right now are establishing AI visibility before their competitors understand what is happening. AI systems build trust in sources over time. The entity that gets verified and cited first holds that position through future model updates and algorithm changes.</p>

              <p>The technology isn&apos;t new. The urgency is.</p>

              <p><strong>Ready to find out what your entity graph looks like right now?</strong> We offer a free AI Scaffolding Audit — a no-obligation review of your current AI search visibility across ChatGPT, Perplexity, and Google AI Overviews. No pitch. Just clarity. <Link href="/book">Schedule your free audit.</Link></p>

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
