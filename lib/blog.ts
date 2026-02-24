import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  metaDescription: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  wordCount: number;
  content: string;
}

const BLOG_DIR = join(process.cwd(), "content", "blog");

/** Parse YAML frontmatter from a markdown file's raw text */
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
    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, content };
}

/** Parse tags from frontmatter value like [tag1, tag2, "tag three"] */
function parseTags(raw: string): string[] {
  if (!raw) return [];
  const inner = raw.replace(/^\[/, "").replace(/\]$/, "");
  if (!inner.trim()) return [];
  return inner.split(",").map((t) => {
    let tag = t.trim();
    if ((tag.startsWith('"') && tag.endsWith('"')) || (tag.startsWith("'") && tag.endsWith("'"))) {
      tag = tag.slice(1, -1);
    }
    return tag;
  }).filter(Boolean);
}

/** Get a single blog post by slug */
export function getPost(slug: string): BlogPost | null {
  try {
    const filePath = join(BLOG_DIR, `${slug}.md`);
    const raw = readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter(raw);

    return {
      slug: data.slug || slug,
      title: data.title || "",
      date: data.date || "",
      author: data.author || "",
      excerpt: data.excerpt || "",
      metaDescription: data.metaDescription || data.excerpt || "",
      featuredImage: data.featuredImage || "",
      featuredImageAlt: data.featuredImageAlt || data.title || "",
      category: data.category || "Custom Window Coverings",
      tags: parseTags(data.tags),
      wordCount: parseInt(data.wordCount, 10) || 0,
      content,
    };
  } catch {
    return null;
  }
}

/** Get all blog posts, sorted by date (newest first) */
export function getAllPosts(): BlogPost[] {
  try {
    const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

    const posts = files
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        return getPost(slug);
      })
      .filter((p): p is BlogPost => p !== null && p.title !== "");

    // Sort by date descending (newest first)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch {
    return [];
  }
}

/** Get all unique tags across all posts */
export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Get all slugs for static generation */
export function getAllSlugs(): string[] {
  try {
    return readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

/** Estimate reading time from word count */
export function getReadingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / 250));
  return `${minutes} min read`;
}
