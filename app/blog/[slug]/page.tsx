import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import rehypeRaw from "rehype-raw";
import { ArticlePathway } from "@/components/ArticlePathway";
import Breadcrumbs from "@/components/Breadcrumbs";
import { TrackedCta, consultEvent, phoneEvent } from "@/components/TrackedCta";
import { ARTICLE_PATHWAYS } from "@/lib/article-pathways";
import { BUSINESS } from "@/lib/constants";
import { NORMAN_BRAND, ALTA_BRAND } from "@/lib/brands";
import { cityRef, northIdahoRef } from "@/lib/cities";
import { BUSINESS_STUB, OWNER_STUB } from "@/lib/schema";
import { getPost, getAllSlugs, getReadingTime } from "@/lib/blog";
import { addInternalLinks } from "@/lib/internal-links";
import type { BlogPost } from "@/lib/blog";

// Every article is a markdown file read at build time, so the full set of
// slugs is known and nothing can appear between deploys. Both of these existed
// to let posts written in the CMS show up without a rebuild; with the CMS gone,
// revalidation regenerates pages that cannot have changed, and dynamicParams
// lets an unknown slug render a request before deciding it is a 404.
export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

/** Per-slug keyword overrides for articles that need exact keyword targeting */
const SLUG_KEYWORDS: Record<string, string> = {
  "what-is-an-entity-graph":
    "entity graph, schema markup, local SEO, structured data, knowledge graph, local business SEO, JSON-LD, schema.org",
  // Carried over verbatim from the hand-written designer route, which set its
  // own keywords rather than using the derived set.
  "designer-window-treatments-coeur-dalene-post-falls":
    "designer window treatments, interior designer window treatments, Coeur d'Alene window treatments, Post Falls window treatments, custom window treatments, North Idaho, Luxe Window Works, Mark Abplanalp",
  "custom-window-coverings-near-post-falls-coeur-dalene-local-expertise":
    "custom window coverings near me, window coverings near me, custom blinds near me, blind near me, window blinds near me, window treatments near me, Post Falls Idaho, Coeur d'Alene, Northern Idaho, buying guide, local expertise, Luxe Window Works, Mark Abplanalp",
};

export async function generateStaticParams() {
  return (await getAllSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }

  const description = post.metaDescription || post.excerpt;
  const keywords = SLUG_KEYWORDS[slug];
  // Use seoTitle for the <title> tag when present; the long display title remains
  // the H1 on-page. Decouples SERP truncation from reader-facing copy.
  const titleForTag = post.seoTitle || post.title;
  return {
    title: titleForTag,
    description,
    ...(keywords && { keywords }),
    alternates: {
      canonical: `${BUSINESS.url}/blog/${slug}`,
    },
    openGraph: {
      title: titleForTag,
      description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: titleForTag,
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

/**
 * Article link sanitiser.
 *
 * react-markdown's built-in sanitiser allows only https, http, irc, ircs,
 * mailto, and xmpp. Everything else is rewritten to an empty string. Four
 * articles wrote `<a href="tel:+12086608643">` and rendered `<a href="">`, so
 * seven click-to-call links were silently dead — the markdown was correct and
 * the page was broken, which is exactly the class of defect no source-level
 * check can see.
 *
 * This adds `tel:` and nothing else. Anything that is not a well-formed
 * telephone URI falls through to `defaultUrlTransform`, so javascript:, data:,
 * vbscript:, and every unknown scheme are still stripped by the library's own
 * logic rather than by a rule written here. The pattern requires a leading
 * digit or +, then only characters valid in a dialable number — a payload like
 * `tel:javascript:alert(1)` does not match and is handed to the default.
 */
function articleUrlTransform(url: string): string {
  if (/^tel:\+?[0-9][0-9\s().-]*$/i.test(url)) return url;
  return defaultUrlTransform(url);
}

/** HowTo schema — 5-step installation process */
const installationHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id":
    `${BUSINESS.url}/blog/your-complete-guide-to-custom-blinds-installation-in-northern-idaho-with-luxe-window-works#howto`,
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
      text: "We visit your home to assess your windows, discuss your functional requirements, and explore design possibilities. This is a collaborative planning session — no pressure, no sales pitch.",
      url: `${BUSINESS.url}/book`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Expert Product Selection",
      text: "With 24 years of hands-on experience, our team guides you through product selection based on your specific needs — whether energy-efficient cellular shades, blackout solutions, or motorized blinds for hard-to-reach windows.",
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

const highPressureHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": `${BUSINESS.url}/blog/stop-selling-shades-like-youre-at-a-car-dealership-why-high-pressure-sales-hurt-homeowners-and-the-industry#howto`,
  name: "5 Tips for Navigating Window Treatment Sales Without Getting Pressured",
  description: "How to protect yourself from high-pressure window treatment sales tactics and make a confident, informed decision.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Never Sign on the First Visit",
      text: "Take time to review the quote, compare options, and sleep on it. A trustworthy company will respect that. If they push back, that's your signal to walk away.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Ask About the Installer, Not Just the Product",
      text: "Ask who performs the installation, whether they're employees or subcontractors, and what their experience level is. Poor installation ruins even the best product.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Beware of Today-Only Pricing",
      text: "If a discount evaporates the moment the rep leaves your house, it was a closing tactic. Legitimate offers have reasonable timelines and don't punish you for taking time to decide.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Get Everything in Writing",
      text: "Make sure your quote includes product specifications, fabric details, motorization options, installation timeline, and warranty terms. If it was discussed in the consultation, it should be in the contract.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Trust Your Gut",
      text: "If the conversation feels evasive, manipulative, or rushed — don't ignore that. There are professionals in this industry who will treat you with respect and transparency.",
    },
  ],
};

/** Slug-specific HowTo schema — FAQPage is now generated dynamically from [slug].faqs.json */
const SLUG_SCHEMA: Record<string, object[]> = {
  /**
   * Caroline Di Diego's review, carried over verbatim from the hand-written
   * designer route. The @id is preserved exactly — #review-caroline-didiego,
   * not the slug-derived ID the generic review path would mint — because it is
   * already a stable published identifier for this review. Reviewer name, job
   * title, rating, body, date, source URL and itemReviewed are unchanged.
   */
  "designer-window-treatments-coeur-dalene-post-falls": [
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "@id": `${BUSINESS.url}/#review-caroline-didiego`,
      url: "https://maps.app.goo.gl/LK59b24y9xTy7Jcw8",
      datePublished: "2025-11-09",
      reviewBody:
        "Outstanding experience with Mark at Luxe Window Works! As designers we love to work with professionals to implement our designs. We always have very 'custom' requirements, and that was certainly the case with Mark and Luxe Window Works. Mark paid super close attention during the ordering process, and it really paid off! Our design criteria was realized meticulously, and Mark's installation was thorough (and fast!), with the end result exceeding our expectations. Window treatments can make or break an interior design, so it's mandatory to have a resource that offers a curated selection of the best made, proven quality products, as Luxe does. In the end it saves time and money, and results in very happy clients. And we all want happy clients!",
      reviewRating: {
        "@type": "Rating",
        ratingValue: "5",
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: "Caroline Di Diego",
        jobTitle: "Interior Designer",
      },
      itemReviewed: { "@id": `${BUSINESS.url}/#business` },
    },
  ],
  "your-complete-guide-to-custom-blinds-installation-in-northern-idaho-with-luxe-window-works": [
    installationHowToSchema,
  ],
  "stop-selling-shades-like-youre-at-a-car-dealership-why-high-pressure-sales-hurt-homeowners-and-the-industry": [
    highPressureHowToSchema,
  ],
};

/** Per-slug additions merged into the BlogPosting node itself */
const SLUG_ARTICLE_EXTENSIONS: Record<string, {
  citation?: object[];
  mentions?: object[];
  relatedLink?: string[];
  /**
   * Overrides deriveArticleAbout when an article's real subject is not what
   * its slug implies. Added for the designer article, whose hand-written route
   * pointed `about` at the Coeur d'Alene area service — a deliberate choice the
   * slug patterns would not have reproduced.
   */
  about?: object;
}> = {
  // Move-in article and the new-construction guide serve the same reader at
  // two different depths — this one is the "what nobody told you" primer, that
  // one is the phase-and-budget plan. Linked both ways so the pair reads as a
  // cluster rather than two unrelated posts.
  "moving-into-a-new-home-window-coverings-north-idaho": {
    mentions: [
      { "@id": `${BUSINESS.url}/blog/window-coverings-for-new-construction-in-coeur-dalene-rathdrum#article` },
      // One node per outbound link in the body, so mentions and links stay 1:1.
      // The external URLs live in sameAs as corroboration; @id is what makes
      // the entity the same node everywhere it appears on the site.
      //
      // normanusa.com is folded into NORMAN_BRAND's sameAs rather than given a
      // second @id, so one manufacturer stays one node.
      //
      // References now, not full nodes. This post used to publish both brands,
      // because nothing else did — which left an article about moving house
      // load-bearing for two manufacturer identities it is not about. /about
      // publishes all five now, so this can say what it actually means: the
      // article mentions them.
      { "@id": NORMAN_BRAND["@id"] },
      { "@id": ALTA_BRAND["@id"] },
      // Avista and the DOE were dropped from mentions. Avista appears once, about
      // utility hookups, and does not define what the article is about; the body
      // link stays. The DOE stays in the graph where it belongs — as publisher of
      // the cited fact sheet — rather than also claiming to be a subject of the
      // article. Mentions that overreach get discounted, so the honest set is
      // the smaller one.
      {
        "@type": "AdministrativeArea",
        "@id": "https://www.kcgov.us/#administrativearea",
        name: "Kootenai County",
        url: "https://www.kcgov.us",
        containedInPlace: { "@type": "State", name: "Idaho" },
        sameAs: [
          "https://www.kcgov.us/1054/Population",
          "https://en.wikipedia.org/wiki/Kootenai_County,_Idaho",
        ],
      },
    ],
    citation: [
      {
        "@type": "WebPage",
        "@id": "https://www.energy.gov/sites/default/files/2021-12/bto-cellular-shades-factsheet-112221.pdf",
        url: "https://www.energy.gov/sites/default/files/2021-12/bto-cellular-shades-factsheet-112221.pdf",
        name: "Cellular Shades — Building Technologies Office fact sheet",
        publisher: {
          "@type": "GovernmentOrganization",
          "@id": "https://www.energy.gov/#organization",
          name: "United States Department of Energy",
          alternateName: "DOE",
          url: "https://www.energy.gov",
          sameAs: ["https://en.wikipedia.org/wiki/United_States_Department_of_Energy"],
        },
      },
    ],
    relatedLink: [
      `${BUSINESS.url}/blog/window-coverings-for-new-construction-in-coeur-dalene-rathdrum`,
    ],
  },
  "window-coverings-for-new-construction-in-coeur-dalene-rathdrum": {
    mentions: [
      { "@id": `${BUSINESS.url}/blog/moving-into-a-new-home-window-coverings-north-idaho#article` },
    ],
    relatedLink: [
      `${BUSINESS.url}/blog/moving-into-a-new-home-window-coverings-north-idaho`,
    ],
  },
  // Preserves the subject the hand-written route declared before migration.
  "designer-window-treatments-coeur-dalene-post-falls": {
    about: { "@id": `${BUSINESS.url}/areas/coeur-d-alene#service` },
  },
  // Also carried over from a hand-written route. This one is about structured
  // data itself rather than window coverings, so the generic catalog subject
  // would have been actively wrong. Three concept nodes, two corroborated by
  // external references, exactly as the route declared them.
  "what-is-an-entity-graph": {
    about: [
      {
        "@type": "Thing",
        name: "Entity Graph",
        sameAs: "https://en.wikipedia.org/wiki/Knowledge_graph",
      },
      { "@type": "Thing", name: "Structured Data", sameAs: "https://schema.org" },
      { "@type": "Thing", name: "Local SEO" },
    ],
  },
  "are-costco-window-treatments-worth-it-a-local-dealer-tells-you-the-truth": {
    citation: [
      {
        "@type": "DiscussionForumPosting",
        "@id": "https://www.reddit.com/r/Costco/comments/1lk91hv/costco_window_treatments_whats_your_option/",
        url: "https://www.reddit.com/r/Costco/comments/1lk91hv/costco_window_treatments_whats_your_option/",
        headline: "Costco window treatments — what's your option?",
        datePublished: "2025-05-01T00:00:00Z",
        author: {
          "@type": "Person",
          name: "Neutrinos25",
          url: "https://www.reddit.com/user/Neutrinos25/",
        },
        isPartOf: { "@type": "WebSite", name: "Reddit", url: "https://www.reddit.com" },
      },
    ],
    mentions: [
      { "@id": `${BUSINESS.url}/blog/why-custom-window-treatments-in-coeur-d-alene-and-post-falls-don-t-have-to-cost-twice-what-they-should#article` },
    ],
    relatedLink: [
      `${BUSINESS.url}/blog/why-custom-window-treatments-in-coeur-d-alene-and-post-falls-don-t-have-to-cost-twice-what-they-should`,
    ],
  },
  "woodlore-plus-shutters-north-idaho": {
    citation: [
      {
        "@type": "WebPage",
        "@id": "https://normanusa.com/product/woodlore-plus-shutters/",
        url: "https://normanusa.com/product/woodlore-plus-shutters/",
        name: "Woodlore® Plus Shutters — Official Product Page",
        isPartOf: { "@type": "WebSite", name: "Norman Window Fashions", url: "https://normanusa.com" },
      },
      {
        "@type": "WebPage",
        "@id": "https://normanusa.com/blog/norman-50th-anniversary/",
        url: "https://normanusa.com/blog/norman-50th-anniversary/",
        name: "Norman Celebrates 50 Years of Innovation",
        isPartOf: { "@type": "WebSite", name: "Norman Window Fashions", url: "https://normanusa.com" },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.energy.gov/energysaver/energy-efficient-window-coverings",
        url: "https://www.energy.gov/energysaver/energy-efficient-window-coverings",
        name: "Energy Efficient Window Coverings",
        isPartOf: { "@type": "WebSite", name: "U.S. Department of Energy — Energy Saver", url: "https://www.energy.gov/energysaver" },
      },
      {
        "@type": "WebPage",
        "@id": "https://ww2.arb.ca.gov/sites/default/files/classic/toxics/compwood/consumer_faq.pdf",
        url: "https://ww2.arb.ca.gov/sites/default/files/classic/toxics/compwood/consumer_faq.pdf",
        name: "Composite Wood Products — Consumer FAQ (CARB Phase 2)",
        isPartOf: { "@type": "WebSite", name: "California Air Resources Board", url: "https://ww2.arb.ca.gov" },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.wevolver.com/article/understanding-abs-heat-resistance-a-comprehensive-guide",
        url: "https://www.wevolver.com/article/understanding-abs-heat-resistance-a-comprehensive-guide",
        name: "Understanding ABS Heat Resistance — A Comprehensive Guide",
        isPartOf: { "@type": "WebSite", name: "Wevolver", url: "https://www.wevolver.com" },
      },
      {
        "@type": "WebPage",
        "@id": "https://normanusa.com/blog/norman-wins-wcma-awards/",
        url: "https://normanusa.com/blog/norman-wins-wcma-awards/",
        name: "Norman Wins 5 Prestigious WCMA Product Awards",
        isPartOf: { "@type": "WebSite", name: "Norman Window Fashions", url: "https://normanusa.com" },
      },
      {
        "@type": "WebPage",
        "@id": "https://www.wf-vision.com/industry-news/award-winning-window-covering-products-announced-2/",
        url: "https://www.wf-vision.com/industry-news/award-winning-window-covering-products-announced-2/",
        name: "Award-Winning Window Covering Products Announced — WCMA 35th Annual Product Awards",
        isPartOf: { "@type": "WebSite", name: "Window Fashion VISION", url: "https://www.wf-vision.com" },
      },
    ],
    mentions: [
      // Reference, not a second description. This was an anonymous
      // Organization named "Norman Window Fashions" carrying its own sameAs
      // and foundingDate — the same manufacturer NORMAN_BRAND already
      // identifies, whose alternateName is that exact string and whose sameAs
      // already contains normanusa.com. Two nodes for one company, and they
      // had drifted: the founding year here disagreed with the glossary's.
      // The foundingDate moved onto NORMAN_BRAND, which is typed Organization
      // as well as Brand so it can legally hold it.
      //
      // The node itself is published on
      // moving-into-a-new-home-window-coverings-north-idaho, so this @id
      // resolves site-wide; the post-build sweep is what guarantees that.
      { "@id": NORMAN_BRAND["@id"] },
      { "@type": "Organization", name: "Window Covering Manufacturers Association", sameAs: "https://wcmanet.com" },
      { "@type": "Organization", name: "California Air Resources Board", sameAs: "https://ww2.arb.ca.gov" },
      { "@type": "Organization", name: "U.S. Department of Energy", sameAs: "https://www.energy.gov" },
      {
        "@type": "DefinedTerm",
        name: "Woodlore Plus",
        description: "Wood-composite hybrid plantation shutter by Norman Window Fashions, featuring ABS louvers with internal aircraft-inspired reinforcement and multi-layer engineered stiles.",
        url: "https://normanusa.com/product/woodlore-plus-shutters/",
      },
      {
        "@type": "DefinedTerm",
        name: "PerfectTilt G4 Motorization",
        description: "Norman's award-winning hidden-motor system for plantation shutters, compatible with Woodlore Plus and operable via remote, iPhone, iPad, and scheduled automation.",
      },
      {
        "@type": "DefinedTerm",
        name: "InvisibleTilt",
        description: "Norman's hidden gear-and-pinion tilt mechanism that eliminates the visible center tilt rod on plantation shutters.",
      },
      {
        "@type": "DefinedTerm",
        name: "CARB Phase 2",
        description: "California Air Resources Board emissions standard capping formaldehyde release from composite wood products. Woodlore Plus is CARB Phase 2 compliant per Norman product specifications.",
        url: "https://ww2.arb.ca.gov/our-work/programs/composite-wood-products-program",
      },
      {
        "@type": "DefinedTerm",
        name: "ABS (Acrylonitrile Butadiene Styrene)",
        description: "Impact-resistant thermoplastic polymer used for Woodlore Plus louvers. Low moisture absorption, low thermal conductivity (~0.14–0.21 W/m·K), service temperature range approximately -20°C to 80°C.",
      },
    ],
    relatedLink: [
      `${BUSINESS.url}/products/shutters`,
      `${BUSINESS.url}/products/motorization`,
      `${BUSINESS.url}/areas/coeur-d-alene`,
      `${BUSINESS.url}/areas/post-falls`,
      `${BUSINESS.url}/areas/sandpoint`,
      `${BUSINESS.url}/areas/hayden`,
      `${BUSINESS.url}/areas/rathdrum`,
    ],
  },
};

/** Match the article to a product Service @id when the slug names a product,
 * otherwise emit a topical Thing. Keeps Article.about pointing at the actual
 * subject, not reflexively at #business. */
function deriveArticleAbout(post: BlogPost): object {
  const slug = post.slug.toLowerCase();
  const productMap: Array<[RegExp, string]> = [
    [/exterior-solar|corradi/, "exterior-solar-shades"],
    [/cellular|honeycomb|smartprivacy-cell/, "cellular-shades"],
    [/solar-shade|solar-screen|mermet|koolblack/, "solar-shades"],
    [/roller-shade|roller-fit|roller-fabric|pucker/, "roller-shades"],
    [/banded-shade|zebra/, "banded-shades"],
    [/roman-shade/, "roman-shades"],
    [/motoriz|smart-shade|automation|battery-operated|somfy|bond-bridge/, "motorization"],
    [/shutter|woodlore|bifold-180|plantation|aluminum-interior/, "shutters"],
    [/blind/, "blinds"],
  ];
  for (const [pattern, productSlug] of productMap) {
    if (pattern.test(slug)) {
      return { "@id": `${BUSINESS.url}/products/${productSlug}#service` };
    }
  }
  // Fall back to the business's own window treatment catalog rather than an
  // anonymous Thing. An anonymous node connects to nothing and reinforces
  // nothing; the catalog is a real entity defined once on the homepage, so a
  // topical article now points at something the rest of the graph knows about.
  return { "@id": `${BUSINESS.url}/#window-treatments` };
}

function ArticleSchema({ post }: { post: BlogPost }) {
  const extensions = SLUG_ARTICLE_EXTENSIONS[post.slug];
  const baseMentions: object[] = [
    // Was a full anonymous AdministrativeArea rebuilt on all 51 articles that
    // reach this line. It is one region, defined on /areas, so every article
    // now points at the same entity instead of describing its own.
    northIdahoRef(),
    cityRef("Coeur d'Alene"),
    cityRef("Post Falls"),
    cityRef("Hayden"),
    cityRef("Rathdrum"),
    cityRef("Sandpoint"),
  ];

  const pageUrl = `${BUSINESS.url}/blog/${post.slug}`;
  const articleSubject = extensions?.about ?? deriveArticleAbout(post);
  const imageUrl = post.featuredImage?.startsWith("http")
    ? post.featuredImage
    : `${BUSINESS.url}${post.featuredImage ?? ""}`;

  /**
   * The page as an entity, distinct from the article as a work. Without this
   * the article was a rich but free-floating object: mainEntityOfPage was a
   * bare URL string pointing at nothing declared, so nothing tied the article
   * to the website, the breadcrumb or the image. This is the hinge that joins
   * them.
   */
  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    isPartOf: { "@id": `${BUSINESS.url}/#website` },
    about: articleSubject,
    mainEntity: { "@id": `${pageUrl}#article` },
    breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
    ...(post.featuredImage && {
      primaryImageOfPage: { "@id": `${pageUrl}#primaryimage` },
    }),
    inLanguage: "en-US",
  };

  /**
   * Dimensions come from the file rather than the previous hard-coded
   * 1200x630, which was wrong for every post — this one's hero is 1672x941.
   */
  const primaryImageSchema = post.featuredImage
    ? {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        "@id": `${pageUrl}#primaryimage`,
        url: imageUrl,
        contentUrl: imageUrl,
        ...(post.featuredImageWidth && post.featuredImageHeight
          ? { width: post.featuredImageWidth, height: post.featuredImageHeight }
          : {}),
        caption: post.featuredImageAlt || post.title,
      }
    : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: (() => { const d = post.dateModified || post.date; return d.includes("T") ? d : `${d}T00:00:00-07:00`; })(),
    wordCount: post.wordCount,
    articleSection: post.category,
    keywords: deriveKeywords(post),
    inLanguage: "en-US",
    // @type + name inline so Google does not have to merge the homepage graph.
    // Canonical Person / business nodes stay on /about and /; the @ids still join.
    author: OWNER_STUB,
    publisher: BUSINESS_STUB,
    // Resolves to the WebPage node above rather than a bare URL string.
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    // ${BUSINESS.url}/blog is the Blog entity the /blog route already defines
    // and the ID the whole site already uses. Minting a competing
    // /blog#collection would have split one collection into two.
    isPartOf: { "@id": `${BUSINESS.url}/blog` },
    about: articleSubject,
    mentions: [...baseMentions, ...(extensions?.mentions ?? [])],
    ...(extensions?.citation && { citation: extensions.citation }),
    ...(extensions?.relatedLink && { relatedLink: extensions.relatedLink }),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".post-excerpt"],
    },
    // References the ImageObject defined above instead of restating an
    // anonymous copy of it inline.
    ...(post.featuredImage && { image: { "@id": `${pageUrl}#primaryimage` } }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${BUSINESS.url}/blog/${post.slug}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BUSINESS.url}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BUSINESS.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BUSINESS.url}/blog/${post.slug}` },
    ],
  };

  const faqSchema = post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    isPartOf: { "@id": `${pageUrl}#webpage` },
    mainEntity: post.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  const additionalSchemas = SLUG_SCHEMA[post.slug] || [];

  const reviewSchema = post.review?.reviewerName
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        "@id": `${BUSINESS.url}/#review-${post.slug}`,
        ...(post.review.reviewUrl && { url: post.review.reviewUrl }),
        ...(post.review.reviewDate && { datePublished: post.review.reviewDate }),
        reviewBody: post.review.reviewBody,
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(post.review.reviewRating ?? 5),
          bestRating: "5",
          worstRating: "1",
        },
        author: {
          "@type": "Person",
          name: post.review.reviewerName,
          ...(post.review.reviewerJobTitle && { jobTitle: post.review.reviewerJobTitle }),
        },
        itemReviewed: { "@id": `${BUSINESS.url}/#business` },
        subjectOf: { "@id": `${BUSINESS.url}/blog/${post.slug}` },
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {primaryImageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(primaryImageSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      )}
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const pathway = ARTICLE_PATHWAYS[slug];
  const showGenericConsultCta = pathway?.placement !== "bottom-only";

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
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 768px"
              className="w-full h-auto rounded-2xl"
              priority
            />
          </section>
        )}

        {/* Content */}
        <section className="py-12 md:py-16 bg-warm-white">
          <div className="container-luxe max-w-3xl">
            <div className="prose prose-lg prose-warm-gray max-w-none
                prose-headings:font-serif prose-headings:text-charcoal
                prose-h1:font-bold
                prose-h2:font-bold
                prose-h3:font-bold
                prose-p:text-warm-gray-600 prose-p:leading-relaxed
                prose-a:text-gold prose-a:no-underline hover:prose-a:underline
                prose-strong:text-charcoal
                prose-img:rounded-xl prose-img:mx-auto
                prose-figure:my-8
                prose-li:text-warm-gray-600">
              {/* Product and area links are woven in here rather than in the
                  source markdown, so the articles themselves stay plain prose
                  and every future article is covered without author effort.
                  See lib/internal-links.ts for why this exists. */}
              <ReactMarkdown rehypePlugins={[rehypeRaw]} urlTransform={articleUrlTransform}>
                {addInternalLinks(post.content, { title: post.title })}
              </ReactMarkdown>
              {pathway?.placement === "after-content" ? (
                <ArticlePathway pathway={pathway} />
              ) : null}
            </div>
          </div>
        </section>

        {/* FAQs — visible, because the FAQPage schema was being emitted for
            content no reader could actually see. Google's structured data
            policy requires FAQ markup to reflect content visible on the page,
            and beyond the policy it was simply a claim the page didn't back up.
            Rendered as a plain definition list in the article's own voice, not
            an accordion, so nothing is hidden behind an interaction. */}
        {post.faqs.length > 0 && (
          <section className="py-12 md:py-16 bg-warm-white border-t border-warm-gray-200/60">
            <div className="container-luxe max-w-3xl">
              <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-8">
                Common questions
              </h2>
              <dl className="space-y-8">
                {post.faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="font-serif text-lg md:text-xl text-charcoal leading-snug">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-base md:text-lg text-warm-gray-600 leading-relaxed">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

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

        {pathway?.placement === "bottom-only" ? (
          <section className="py-16 bg-cream">
            <div className="container-luxe max-w-3xl">
              <ArticlePathway pathway={pathway} />
            </div>
          </section>
        ) : null}

        {showGenericConsultCta ? (
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
              <TrackedCta
                href="/book"
                event={consultEvent()}
                className="inline-flex items-center gap-2 bg-gold hover:bg-gold-dark text-white font-semibold px-6 py-3 rounded-full transition-all"
              >
                Start a Consultation
              </TrackedCta>
              <TrackedCta
                href={BUSINESS.phoneHref}
                event={phoneEvent()}
                className="text-charcoal font-semibold hover:text-gold transition-colors"
              >
                Call {BUSINESS.phone}
              </TrackedCta>
            </div>
          </div>
        </section>
        ) : null}
      </article>
    </>
  );
}
