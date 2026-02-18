#!/usr/bin/env node
/**
 * WordPress WXR XML → Markdown blog post converter
 *
 * Usage: node scripts/convert-wp-posts.mjs
 *
 * Reads: luxewindowworks.WordPress.2026-02-17.xml
 * Writes: content/blog/<slug>.md  (one file per published post)
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const XML_PATH = join(ROOT, "luxewindowworks.WordPress.2026-02-17.xml");
const OUT_DIR = join(ROOT, "content", "blog");

mkdirSync(OUT_DIR, { recursive: true });

const xml = readFileSync(XML_PATH, "utf-8");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract text inside CDATA or plain text from a tag */
function extractTag(source, tag) {
  // Handle namespaced tags like content:encoded, dc:creator, wp:post_name
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<${escaped}>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))\\s*</${escaped}>`, "s");
  const m = source.match(re);
  if (!m) return "";
  return (m[1] ?? m[2] ?? "").trim();
}

/** Extract all values for a repeated tag */
function extractAllTags(source, tag) {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`<${escaped}>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([^<]*))\\s*</${escaped}>`, "gs");
  const results = [];
  let m;
  while ((m = re.exec(source)) !== null) {
    const val = (m[1] ?? m[2] ?? "").trim();
    if (val) results.push(val);
  }
  return results;
}

/** Extract categories and tags from <category domain="..."> elements */
function extractTaxonomies(source) {
  const categories = [];
  const tags = [];
  const re = /<category\s+domain="([^"]+)"\s+nicename="[^"]*">\s*(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))\s*<\/category>/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const domain = m[1];
    const value = (m[2] ?? m[3] ?? "").trim();
    if (!value) continue;
    if (domain === "category") categories.push(value);
    else if (domain === "post_tag") tags.push(value);
  }
  return { categories, tags };
}

/** Clean WordPress block HTML → readable HTML */
function cleanWordPressHtml(html) {
  if (!html) return "";

  let cleaned = html
    // Remove WP block comments
    .replace(/<!--\s*\/?wp:[^>]*-->\s*/g, "")
    // Remove empty headings
    .replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/g, "")
    // Remove WP-specific class attributes but keep the tags
    .replace(/\s+class="wp-[^"]*"/g, "")
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

/** Extract the first image URL from post content (for featured image) */
function extractFirstImage(html) {
  const m = html.match(/<img[^>]+src="([^"]+)"/);
  return m ? m[1] : "";
}

/** Generate a clean excerpt from HTML content */
function generateExcerpt(html, maxLength = 160) {
  // Strip all HTML tags
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  // Cut at last word boundary before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + "...";
}

/** Count words in HTML content */
function countWords(html) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}

/** Escape YAML string (wrap in quotes if needed) */
function yamlString(s) {
  if (!s) return '""';
  // Escape if contains special characters
  if (/[:#\[\]{}|>!@`"'\n,&*?]/.test(s) || s.startsWith(" ") || s.endsWith(" ")) {
    return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return s;
}

// ---------------------------------------------------------------------------
// Parse posts from XML
// ---------------------------------------------------------------------------

// Split into <item> blocks
const items = xml.split(/<item>/).slice(1).map((chunk) => {
  const end = chunk.indexOf("</item>");
  return end >= 0 ? chunk.substring(0, end) : chunk;
});

let postCount = 0;
let skippedCount = 0;
const redirectMap = []; // { from: oldPath, to: newPath }

for (const item of items) {
  const postType = extractTag(item, "wp:post_type");
  const status = extractTag(item, "wp:status");

  // Only process published blog posts
  if (postType !== "post" || status !== "publish") {
    skippedCount++;
    continue;
  }

  const title = extractTag(item, "title");
  const link = extractTag(item, "link");
  const pubDate = extractTag(item, "pubDate");
  const creator = extractTag(item, "dc:creator");
  const slug = extractTag(item, "wp:post_name");
  const rawContent = extractTag(item, "content:encoded");

  if (!title || !slug || !rawContent) {
    console.warn(`⚠ Skipping post with missing data: "${title || "(no title)"}"`);
    skippedCount++;
    continue;
  }

  const { categories, tags } = extractTaxonomies(item);
  const featuredImage = extractFirstImage(rawContent);
  const cleanedContent = cleanWordPressHtml(rawContent);
  const excerpt = generateExcerpt(rawContent);
  const wordCount = countWords(rawContent);

  // Parse date
  const date = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();

  // Map creator to author name
  const authorMap = {
    JustineK: "Mark Abplanalp",
    Mark: "Mark",
  };
  const author = authorMap[creator] || creator;

  // Build frontmatter
  const frontmatter = [
    "---",
    `title: ${yamlString(title)}`,
    `slug: ${yamlString(slug)}`,
    `date: "${date}"`,
    `author: ${yamlString(author)}`,
    `excerpt: ${yamlString(excerpt)}`,
    `featuredImage: ${yamlString(featuredImage)}`,
    `category: ${yamlString(categories[0] || "Custom Window Coverings")}`,
    `tags: [${tags.map((t) => yamlString(t)).join(", ")}]`,
    `wordCount: ${wordCount}`,
    "---",
  ].join("\n");

  const fileContent = `${frontmatter}\n${cleanedContent}\n`;

  // Write file
  const filePath = join(OUT_DIR, `${slug}.md`);
  writeFileSync(filePath, fileContent, "utf-8");
  postCount++;

  // Build redirect entry
  const oldUrl = new URL(link);
  const oldPath = oldUrl.pathname.replace(/\/$/, ""); // remove trailing slash
  const newPath = `/blog/${slug}`;
  if (oldPath && oldPath !== newPath) {
    redirectMap.push({ source: oldPath, destination: newPath });
  }

  console.log(`✓ ${slug} (${wordCount} words, ${tags.length} tags)`);
}

console.log(`\n✅ Converted ${postCount} posts → content/blog/`);
console.log(`⏭ Skipped ${skippedCount} non-post items`);

// Write redirect map for next.config.mjs
const redirectsPath = join(ROOT, "scripts", "redirects.json");
writeFileSync(redirectsPath, JSON.stringify(redirectMap, null, 2), "utf-8");
console.log(`📝 Redirect map → scripts/redirects.json (${redirectMap.length} entries)`);
