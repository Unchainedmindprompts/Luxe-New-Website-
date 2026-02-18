/**
 * Convert local image paths back to WordPress.com CDN (Photon) URLs.
 *
 * Since we can't download the images into the repo right now, this script
 * updates all blog posts to use the i0.wp.com CDN which likely still has
 * the images cached from when the WordPress site was live.
 *
 * Usage: node scripts/use-wp-cdn.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");

function localToCdnUrl(localPath) {
  // /images/blog/YYYY-MM/filename → https://i0.wp.com/luxewindowworks.com/wp-content/uploads/YYYY/MM/filename
  let match = localPath.match(/^\/images\/blog\/(\d{4})-(\d{2})\/(.+)$/);
  if (match) {
    const [, year, month, filename] = match;
    return `https://i0.wp.com/luxewindowworks.com/wp-content/uploads/${year}/${month}/${filename}`;
  }

  // /images/blog/misc/filename → https://i0.wp.com/luxewindowworks.com/wp-content/uploads/filename
  match = localPath.match(/^\/images\/blog\/misc\/(.+)$/);
  if (match) {
    return `https://i0.wp.com/luxewindowworks.com/wp-content/uploads/${match[1]}`;
  }

  return null;
}

function main() {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Processing ${files.length} blog posts...\n`);

  let totalReplacements = 0;
  let filesModified = 0;

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    let content = fs.readFileSync(filePath, "utf-8");

    const localPathRegex = /\/images\/blog\/(?:\d{4}-\d{2}|misc)\/[^"'\s<>)]+/g;
    let match;
    const replacements = new Map();

    while ((match = localPathRegex.exec(content)) !== null) {
      const localPath = match[0];
      const cdnUrl = localToCdnUrl(localPath);
      if (cdnUrl) {
        replacements.set(localPath, cdnUrl);
      }
    }

    if (replacements.size > 0) {
      for (const [local, cdn] of replacements) {
        content = content.split(local).join(cdn);
      }
      fs.writeFileSync(filePath, content);
      filesModified++;
      totalReplacements += replacements.size;
      console.log(`  ${file} — ${replacements.size} refs updated`);
    }
  }

  console.log(`\nDone: ${filesModified} files, ${totalReplacements} URLs switched to i0.wp.com CDN`);
}

main();
