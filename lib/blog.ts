import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import {
  getPayloadPost,
  getAllPayloadPosts,
  getAllPayloadSlugs,
} from "./payload-blog";

export interface FAQ {
  question: string;
  answer: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  dateModified: string;
  author: string;
  excerpt: string;
  metaDescription: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  wordCount: number;
  content: string;
  faqs: FAQ[];
}

const BLOG_DIR = join(process.cwd(), "content", "blog");

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: normalized };

  const frontmatter = match[1];
  const content = match[2].trim();
  const data: Record<string, string> = {};

  for (const line of frontmatter.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.substring(0, colonIdx).trim();
    let value = line.substring(colonIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, content };
}

function parseTags(raw: string): string[] {
  if (!raw) return [];
  const inner = raw.replace(/^\[/, "").replace(/\]$/, "");
  if (!inner.trim()) return [];
  return inner
    .split(",")
    .map((t) => {
      let tag = t.trim();
      if (
        (tag.startsWith('"') && tag.endsWith('"')) ||
        (tag.startsWith("'") && tag.endsWith("'"))
      ) {
        tag = tag.slice(1, -1);
      }
      return tag;
    })
    .filter(Boolean);
}

// ── Markdown-only helpers (not exported) ─────────────────────────────────────

function getMarkdownPost(slug: string): BlogPost | null {
  try {
    const filePath = join(BLOG_DIR, `${slug}.md`);
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter(raw);

    let faqs: FAQ[] = [];
    try {
      const faqPath = join(BLOG_DIR, `${slug}.faqs.json`);
      if (existsSync(faqPath)) {
        faqs = JSON.parse(readFileSync(faqPath, "utf-8"));
      }
    } catch {
      // no-op
    }

    return {
      slug: data.slug || slug,
      title: data.title || "",
      date: data.date || "",
      dateModified: data.dateModified || data.date || "",
      author: data.author || "",
      excerpt: data.excerpt || "",
      metaDescription: data.metaDescription || data.excerpt || "",
      featuredImage: data.featuredImage || "",
      featuredImageAlt: data.featuredImageAlt || data.title || "",
      category: data.category || "Custom Window Coverings",
      tags: parseTags(data.tags),
      wordCount: parseInt(data.wordCount, 10) || 0,
      content,
      faqs,
    };
  } catch {
    return null;
  }
}

function getAllMarkdownPosts(): BlogPost[] {
  try {
    return readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => getMarkdownPost(f.replace(/\.md$/, "")))
      .filter((p): p is BlogPost => p !== null && p.title !== "")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

function getAllMarkdownSlugs(): string[] {
  try {
    return readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

// ── Public async API — Payload first, markdown fallback ───────────────────────

/** Returns the post from Payload if published there, otherwise falls back to markdown. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const payloadPost = await getPayloadPost(slug);
  if (payloadPost) return payloadPost;
  return getMarkdownPost(slug);
}

/**
 * Returns all published posts from both Payload and markdown, merged and
 * sorted newest-first. Payload takes precedence when a slug exists in both.
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  const [payloadPosts, markdownPosts] = await Promise.all([
    getAllPayloadPosts(),
    Promise.resolve(getAllMarkdownPosts()),
  ]);

  const payloadSlugs = new Set(payloadPosts.map((p) => p.slug));
  const markdownOnly = markdownPosts.filter((p) => !payloadSlugs.has(p.slug));

  return [...payloadPosts, ...markdownOnly].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Returns all slugs from both Payload and markdown (deduplicated). */
export async function getAllSlugs(): Promise<string[]> {
  const [payloadSlugs, markdownSlugs] = await Promise.all([
    getAllPayloadSlugs(),
    Promise.resolve(getAllMarkdownSlugs()),
  ]);
  return [...new Set([...payloadSlugs, ...markdownSlugs])];
}

/** Returns all unique tags across both sources. */
export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

export function getReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / 250));
  return `${minutes} min read`;
}
