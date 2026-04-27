import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

const BASE_URL = "https://www.luxewindowworks.com";

type FAQ = { question: string; answer: string };
type PostDoc = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  metaDescription?: string;
  category?: string;
  tags?: { tag: string }[];
  faqs?: FAQ[];
  publishedDate?: string;
  dateModified?: string;
  updatedAt?: string;
  createdAt?: string;
  published?: boolean;
  generatedSchema?: string;
};

const schemaHook: CollectionAfterChangeHook<PostDoc> = async ({ doc, req, context }) => {
  if (context?.generatedByHook) return;

  const datePublished = doc.publishedDate || doc.createdAt;
  const dateModified = doc.dateModified || doc.updatedAt;
  const description = doc.excerpt || doc.metaDescription || "";

  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE_URL}/blog/${doc.slug}#article`,
    headline: doc.title,
    description,
    datePublished,
    dateModified,
    inLanguage: "en-US",
    articleSection: doc.category || "Window Treatments",
    keywords: [
      ...(doc.tags ?? []).map((t) => t.tag),
      "window treatments",
      "Northern Idaho",
      "Luxe Window Works",
    ]
      .filter(Boolean)
      .join(", "),
    author: { "@id": `${BASE_URL}/#owner` },
    publisher: { "@id": `${BASE_URL}/#business` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${doc.slug}`,
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${BASE_URL}/blog`,
      name: "Window Treatment Insights",
      publisher: { "@id": `${BASE_URL}/#business` },
    },
    // speakable tells AI assistants which page sections to read aloud
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".post-excerpt"],
    },
  };

  // FAQPage schema is the primary AEO signal — AI engines surface these as direct answers
  const faqs = doc.faqs ?? [];
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${BASE_URL}/blog/${doc.slug}#faq`,
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  const schemas = [articleSchema, ...(faqSchema ? [faqSchema] : [])];

  await req.payload.update({
    collection: "posts",
    id: doc.id,
    data: { generatedSchema: JSON.stringify(schemas, null, 2) },
    context: { generatedByHook: true },
  });
};

const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    description: "Blog posts for Luxe Window Works. FAQs drive AEO — add at least 3 per post.",
    group: "Content",
    defaultColumns: ["title", "published", "publishedDate", "updatedAt"],
    listSearchableFields: ["title", "slug"],
  },
  hooks: {
    afterChange: [schemaHook],
  },
  fields: [
    // ── Core content ────────────────────────────────────────────────────────
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-safe, lowercase, hyphens only. e.g. best-blinds-for-coeur-dalene",
      },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "Excerpt / Summary",
      admin: {
        description:
          "1–2 sentences. Used as meta description and as the primary AEO signal for AI answer engines.",
      },
    },
    {
      name: "content",
      type: "richText",
      label: "Body Content",
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
    },

    // ── FAQs — primary AEO signal ───────────────────────────────────────────
    {
      name: "faqs",
      type: "array",
      label: "FAQs (AEO — answer engine optimization)",
      admin: {
        description:
          "Each Q&A becomes a FAQPage schema entity. AI engines like Perplexity and ChatGPT pull from these for direct answers.",
        initCollapsed: true,
      },
      fields: [
        {
          name: "question",
          type: "text",
          required: true,
          label: "Question",
        },
        {
          name: "answer",
          type: "textarea",
          required: true,
          label: "Answer",
          admin: {
            description: "Write a complete, self-contained answer (2–5 sentences).",
          },
        },
      ],
    },

    // ── Sidebar: publishing ─────────────────────────────────────────────────
    {
      name: "published",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Uncheck to save as a draft without it appearing on the site.",
      },
    },
    {
      name: "publishedDate",
      type: "date",
      label: "Published Date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "MMM d, yyyy" },
      },
    },
    {
      name: "dateModified",
      type: "date",
      label: "Last Modified",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayOnly", displayFormat: "MMM d, yyyy" },
        description: "Update this when making substantial content changes.",
      },
    },

    // ── Sidebar: taxonomy & SEO ─────────────────────────────────────────────
    {
      name: "category",
      type: "select",
      admin: { position: "sidebar" },
      options: [
        { label: "Buying Guide", value: "Buying Guide" },
        { label: "Product Focus", value: "Product Focus" },
        { label: "Installation", value: "Installation" },
        { label: "Design Tips", value: "Design Tips" },
        { label: "Energy Efficiency", value: "Energy Efficiency" },
        { label: "Motorization", value: "Motorization" },
        { label: "Local Insights", value: "Local Insights" },
        { label: "Industry", value: "Industry" },
      ],
    },
    {
      name: "tags",
      type: "array",
      admin: { position: "sidebar", initCollapsed: true },
      fields: [{ name: "tag", type: "text", required: true }],
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Meta Description",
      admin: {
        position: "sidebar",
        description: "Overrides excerpt for the <meta description> tag if set. 150–160 chars.",
      },
    },

    // ── Sidebar: generated schema (read-only) ───────────────────────────────
    {
      name: "generatedSchema",
      type: "textarea",
      label: "Generated JSON-LD (read-only)",
      admin: {
        readOnly: true,
        position: "sidebar",
        description: "Auto-generated on save. Paste into Google Rich Results Test to verify.",
      },
    },
  ],
};

export default Posts;
