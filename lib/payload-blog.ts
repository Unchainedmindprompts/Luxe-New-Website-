import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTMLAsync } from "@payloadcms/richtext-lexical/html-async";
import type { BlogPost, FAQ } from "./blog";

const AUTHOR = "Mark Abplanalp";

function estimateWordCount(html: string): number {
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

async function lexicalToHtml(data: unknown): Promise<string> {
  if (!data) return "";
  try {
    return await convertLexicalToHTMLAsync({ data: data as Parameters<typeof convertLexicalToHTMLAsync>[0]["data"] });
  } catch {
    return "";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function toPost(doc: any): Promise<BlogPost> {
  const html = await lexicalToHtml(doc.content);
  const media =
    doc.featuredImage && typeof doc.featuredImage === "object"
      ? doc.featuredImage
      : null;
  const date = doc.publishedDate ?? doc.createdAt ?? "";
  return {
    slug: doc.slug ?? "",
    title: doc.title ?? "",
    date,
    dateModified: doc.dateModified ?? doc.updatedAt ?? date,
    author: AUTHOR,
    excerpt: doc.excerpt ?? "",
    metaDescription: doc.metaDescription ?? doc.excerpt ?? "",
    featuredImage: media?.url ?? "",
    featuredImageAlt: media?.alt ?? doc.title ?? "",
    category: doc.category ?? "Custom Window Coverings",
    tags: ((doc.tags ?? []) as { tag: string }[]).map((t) => t.tag).filter(Boolean),
    wordCount: estimateWordCount(html),
    content: html,
    faqs: (doc.faqs ?? []) as FAQ[],
  };
}

export async function getPayloadPost(slug: string): Promise<BlogPost | null> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      depth: 1,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ slug: { equals: slug } }, { published: { equals: true } }],
      },
    });
    return docs[0] ? toPost(docs[0]) : null;
  } catch {
    return null;
  }
}

export async function getAllPayloadPosts(): Promise<BlogPost[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      depth: 1,
      limit: 500,
      overrideAccess: true,
      sort: "-publishedDate",
      where: { published: { equals: true } },
    });
    return Promise.all(docs.map(toPost));
  } catch {
    return [];
  }
}

export async function getAllPayloadSlugs(): Promise<string[]> {
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      depth: 0,
      limit: 500,
      overrideAccess: true,
      where: { published: { equals: true } },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (docs as any[]).map((d) => d.slug as string).filter(Boolean);
  } catch {
    return [];
  }
}
