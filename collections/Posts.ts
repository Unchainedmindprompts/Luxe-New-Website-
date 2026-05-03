import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

const BASE_URL = "https://www.luxewindowworks.com";

type FAQ = { question: string; answer: string };
type MentionedEntity = {
  entityType: "Place" | "GovernmentOrganization" | "Organization" | "LocalBusiness";
  name: string;
  url?: string;
  description?: string;
};
type CitedSource = { name: string; url: string; publisher?: string };
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
  geographicFocus?: string;
  mentionedEntities?: MentionedEntity[];
  citedSources?: CitedSource[];
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

  if (doc.geographicFocus) {
    const place = {
      "@type": "Place",
      name: doc.geographicFocus,
      address: {
        "@type": "PostalAddress",
        addressLocality: doc.geographicFocus,
        addressRegion: "ID",
        addressCountry: "US",
      },
    };
    articleSchema.spatialCoverage = place;
    articleSchema.contentLocation = place;
  }

  if (doc.mentionedEntities && doc.mentionedEntities.length > 0) {
    articleSchema.mentions = doc.mentionedEntities.map((e) => ({
      "@type": e.entityType,
      name: e.name,
      ...(e.url && { url: e.url }),
      ...(e.description && { description: e.description }),
    }));
  }

  if (doc.citedSources && doc.citedSources.length > 0) {
    articleSchema.citation = doc.citedSources.map((s) => ({
      "@type": "CreativeWork",
      name: s.name,
      url: s.url,
      ...(s.publisher && { publisher: { "@type": "Organization", name: s.publisher } }),
    }));
  }

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

    // ── Geographic & entity references (optional) ──────────────────────────
    {
      type: "collapsible",
      label: "Geographic & Entity References — optional, for geographically-focused articles",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "geographicFocus",
          type: "select",
          label: "Geographic Focus",
          admin: {
            description:
              "Primary city or region this article is about. Adds spatialCoverage and contentLocation to the article schema.",
          },
          options: [
            { label: "Coeur d'Alene", value: "Coeur d'Alene" },
            { label: "Post Falls", value: "Post Falls" },
            { label: "Hayden", value: "Hayden" },
            { label: "Rathdrum", value: "Rathdrum" },
            { label: "Spirit Lake", value: "Spirit Lake" },
            { label: "Sandpoint", value: "Sandpoint" },
            { label: "Kootenai County", value: "Kootenai County" },
            { label: "North Idaho", value: "North Idaho" },
          ],
        },
        {
          name: "mentionedEntities",
          type: "array",
          label: "Mentioned Entities",
          admin: {
            description:
              "Civic, government, or business entities referenced in this article. Each becomes a schema.org mention.",
            initCollapsed: true,
          },
          fields: [
            {
              name: "entityType",
              type: "select",
              required: true,
              label: "Entity Type",
              options: [
                { label: "Place", value: "Place" },
                { label: "Government Organization", value: "GovernmentOrganization" },
                { label: "Organization", value: "Organization" },
                { label: "Local Business", value: "LocalBusiness" },
              ],
            },
            { name: "name", type: "text", required: true, label: "Name" },
            {
              name: "url",
              type: "text",
              label: "URL",
              admin: { description: "Official website or authoritative reference URL." },
            },
            {
              name: "description",
              type: "textarea",
              label: "Description (optional)",
            },
          ],
        },
        {
          name: "citedSources",
          type: "array",
          label: "Cited Sources",
          admin: {
            description:
              "External sources cited in this article. Each becomes a schema.org citation.",
            initCollapsed: true,
          },
          fields: [
            { name: "name", type: "text", required: true, label: "Source Name" },
            { name: "url", type: "text", required: true, label: "URL" },
            { name: "publisher", type: "text", label: "Publisher (optional)" },
            {
              name: "dateAccessed",
              type: "date",
              label: "Date Accessed (optional)",
              admin: { date: { pickerAppearance: "dayOnly", displayFormat: "MMM d, yyyy" } },
            },
          ],
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
