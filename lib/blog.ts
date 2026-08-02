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

export interface ReviewData {
  reviewerName: string;
  reviewerJobTitle?: string;
  reviewBody: string;
  reviewRating: number;
  reviewDate: string;
  reviewUrl?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  seoTitle?: string;
  date: string;
  dateModified: string;
  author: string;
  excerpt: string;
  metaDescription: string;
  featuredImage: string;
  featuredImageAlt: string;
  /** Read off the file at build time so schema never asserts wrong dimensions. */
  featuredImageWidth?: number;
  featuredImageHeight?: number;
  category: string;
  tags: string[];
  wordCount: number;
  content: string;
  faqs: FAQ[];
  review?: ReviewData;
}

const BLOG_DIR = join(process.cwd(), "content", "blog");

/**
 * Reads real pixel dimensions from the image in /public. The schema previously
 * asserted a flat 1200x630 for every post, which was simply untrue — this
 * article's hero is 1672x941. Parses the webp/png/jpeg headers directly rather
 * than pulling in an image library for two integers.
 */
function readImageSize(publicPath: string): {
  featuredImageWidth?: number;
  featuredImageHeight?: number;
} {
  if (!publicPath.startsWith("/")) return {};
  try {
    const buf = readFileSync(join(process.cwd(), "public", publicPath.slice(1)));
    // WEBP (VP8X / VP8 / VP8L)
    if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
      const fmt = buf.toString("ascii", 12, 16);
      if (fmt === "VP8X") {
        return {
          featuredImageWidth: 1 + buf.readUIntLE(24, 3),
          featuredImageHeight: 1 + buf.readUIntLE(27, 3),
        };
      }
      if (fmt === "VP8 ") {
        return {
          featuredImageWidth: buf.readUInt16LE(26) & 0x3fff,
          featuredImageHeight: buf.readUInt16LE(28) & 0x3fff,
        };
      }
      if (fmt === "VP8L") {
        const b = buf.readUInt32LE(21);
        return {
          featuredImageWidth: (b & 0x3fff) + 1,
          featuredImageHeight: ((b >> 14) & 0x3fff) + 1,
        };
      }
    }
    // PNG
    if (buf.toString("ascii", 1, 4) === "PNG") {
      return {
        featuredImageWidth: buf.readUInt32BE(16),
        featuredImageHeight: buf.readUInt32BE(20),
      };
    }
    // JPEG — walk the segment markers to the frame header.
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return {
            featuredImageHeight: buf.readUInt16BE(i + 5),
            featuredImageWidth: buf.readUInt16BE(i + 7),
          };
        }
        i += 2 + len;
      }
    }
  } catch {
    // Image missing or unreadable — omit dimensions rather than guess.
  }
  return {};
}

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

/**
 * Word count derived from the article body rather than trusted from
 * frontmatter. Hand-maintained counts go stale the moment a post is edited —
 * this article declared 780 while the body had grown to 982 — and a wrong
 * wordCount in schema is a factual claim about the page that anyone can check.
 *
 * Counts visible prose only: markdown link text without the URL, headings
 * without their hashes, no emphasis markers, no raw HTML tags or attributes.
 */
export function countBodyWords(markdown: string): number {
  const text = markdown
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_`>|]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
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
      ...(data.seoTitle ? { seoTitle: data.seoTitle } : {}),
      date: data.date || "",
      dateModified: data.dateModified || data.date || "",
      author: data.author || "",
      excerpt: data.excerpt || "",
      metaDescription: data.metaDescription || data.excerpt || "",
      featuredImage: data.featuredImage || "",
      featuredImageAlt: data.featuredImageAlt || data.title || "",
      ...readImageSize(data.featuredImage || ""),
      category: data.category || "Custom Window Coverings",
      tags: parseTags(data.tags),
      // Derived, not read from frontmatter — see countBodyWords above.
      wordCount: countBodyWords(content),
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
