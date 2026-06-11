import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

const BASE_URL = "https://www.luxewindowworks.com";

type FAQ = { question: string; answer: string };
type ReviewGroup = {
  reviewerName?: string;
  reviewerJobTitle?: string;
  reviewBody?: string;
  reviewRating?: number;
  reviewDate?: string;
  reviewUrl?: string;
};

type PostDoc = {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string;
  excerpt?: string;
  metaDescription?: string;
  category?: string;
  tags?: { tag: string }[];
  faqs?: FAQ[];
  review?: ReviewGroup;
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

  const review = doc.review;
  const reviewSchema =
    review?.reviewerName
      ? {
          "@context": "https://schema.org",
          "@type": "Review",
          "@id": `${BASE_URL}/#review-${doc.slug}`,
          ...(review.reviewUrl && { url: review.reviewUrl }),
          ...(review.reviewDate && { datePublished: review.reviewDate }),
          reviewBody: review.reviewBody,
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(review.reviewRating ?? 5),
            bestRating: "5",
            worstRating: "1",
          },
          author: {
            "@type": "Person",
            name: review.reviewerName,
            ...(review.reviewerJobTitle && { jobTitle: review.reviewerJobTitle }),
          },
          itemReviewed: {
            "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
            "@id": `${BASE_URL}/#business`,
            name: "Luxe Window Works",
          },
          subjectOf: { "@id": `${BASE_URL}/blog/${doc.slug}` },
        }
      : null;

  const schemas = [articleSchema, ...(faqSchema ? [faqSchema] : []), ...(reviewSchema ? [reviewSchema] : [])];

  await req.payload.update({
    collection: "posts",
    id: doc.id,
    data: { generatedSchema: JSON.stringify(schemas, null, 2) },
    context: { generatedByHook: true },
  });
};

const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    // Logged-in users see everything; public only sees published posts
    read: ({ req: { user } }) => {
      if (user) return true;
      return { published: { equals: true } };
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: "title",
    description: "Blog posts for Luxe Window Works. FAQs drive AEO — add at least 3 per post.",
    group: "Content",
    defaultColumns: ["title", "published", "publishedDate", "updatedAt"],
    listSearchableFields: ["title", "slug"],
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          data.slug = (data.title as string)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }
        return data;
      },
    ],
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
        description: "Leave blank — auto-generated from title when you click Save.",
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
      type: "textarea",
      label: "Body Content (Markdown supported)",
      admin: {
        description: "Write in plain text or Markdown. Headings: ## H2, ### H3. Bold: **text**. Lists: - item.",
      },
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

    // ── Customer review (optional — only for review-focused articles) ────────
    {
      name: "review",
      type: "group",
      label: "Customer Review Schema (optional)",
      admin: {
        description: "Only fill this in when the article features a specific customer review. Leave blank for all other posts.",
      },
      fields: [
        { name: "reviewerName", type: "text", label: "Reviewer Full Name" },
        { name: "reviewerJobTitle", type: "text", label: "Job Title (optional, e.g. Interior Designer)" },
        { name: "reviewBody", type: "textarea", label: "Review Text (paste the full review)" },
        { name: "reviewRating", type: "number", label: "Rating (1–5)", defaultValue: 5, min: 1, max: 5 },
        {
          name: "reviewDate",
          type: "date",
          label: "Review Date",
          admin: { date: { pickerAppearance: "dayOnly", displayFormat: "MMM d, yyyy" } },
        },
        { name: "reviewUrl", type: "text", label: "Review URL (Google Maps link — optional)" },
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
      name: "seoTitle",
      type: "text",
      label: "SEO Title (for <title> tag)",
      admin: {
        position: "sidebar",
        description:
          "Optional short title for Google SERP. Keep under 60 chars. If blank, the long display title is used (and will likely be truncated in search results).",
      },
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
