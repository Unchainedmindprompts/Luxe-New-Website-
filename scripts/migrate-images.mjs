/**
 * Blog Image Migration Script
 *
 * This script does two things:
 * 1. Updates all blog post markdown files to reference local image paths
 *    instead of WordPress URLs
 * 2. Generates a download manifest (image-download-list.json) that can be
 *    used to download images from the old WordPress server
 *
 * Usage:
 *   node scripts/migrate-images.mjs                    # Update references only
 *   node scripts/migrate-images.mjs --download          # Update refs + download images
 *   node scripts/migrate-images.mjs --download-only     # Download images only (no file changes)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const PUBLIC_BLOG_IMAGES = path.join(ROOT, "public", "images", "blog");

// Regex patterns to match WordPress image URLs
const WP_URL_PATTERNS = [
  // i0.wp.com CDN URLs
  /https?:\/\/i0\.wp\.com\/luxewindowworks\.com\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^"'\s<>?]+)(?:\?[^"'\s<>]*)*/g,
  // Direct luxewindowworks.com URLs
  /https?:\/\/luxewindowworks\.com\/wp-content\/uploads\/(\d{4})\/(\d{2})\/([^"'\s<>?]+)(?:\?[^"'\s<>]*)*/g,
  // Root-level uploads (no date folder)
  /https?:\/\/luxewindowworks\.com\/wp-content\/uploads\/([^/\d][^"'\s<>?]+)(?:\?[^"'\s<>]*)*/g,
];

function urlToLocalPath(url) {
  // Strip query params for matching
  const cleanUrl = url.split("?")[0];

  // Match i0.wp.com or direct URLs with date folders
  let match = cleanUrl.match(
    /(?:i0\.wp\.com\/)?luxewindowworks\.com\/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)$/
  );
  if (match) {
    const [, year, month, filename] = match;
    return `/images/blog/${year}-${month}/${filename}`;
  }

  // Match root-level uploads (no date folder)
  match = cleanUrl.match(
    /luxewindowworks\.com\/wp-content\/uploads\/([^/].+)$/
  );
  if (match) {
    return `/images/blog/misc/${match[1]}`;
  }

  return null;
}

function findAndReplaceUrls(content) {
  const replacements = new Map();

  // Find all WordPress image URLs in the content
  const urlRegex = /https?:\/\/(?:i0\.wp\.com\/)?luxewindowworks\.com\/wp-content\/uploads\/[^"'\s<>)]+/g;
  let match;

  while ((match = urlRegex.exec(content)) !== null) {
    const originalUrl = match[0];
    // Clean trailing punctuation that might have been captured
    const cleanedUrl = originalUrl.replace(/[,;]$/, "");
    const localPath = urlToLocalPath(cleanedUrl);
    if (localPath) {
      replacements.set(cleanedUrl, localPath);
    }
  }

  let updatedContent = content;
  // Sort by length (longest first) to avoid partial replacements
  const sortedEntries = [...replacements.entries()].sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [url, localPath] of sortedEntries) {
    updatedContent = updatedContent.split(url).join(localPath);
  }

  return { updatedContent, replacements };
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const protocol = url.startsWith("https") ? https : http;
    const request = protocol.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 30000
    }, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(destPath);
      });
      file.on("error", reject);
    });

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const shouldDownload = args.includes("--download");
  const downloadOnly = args.includes("--download-only");

  console.log("Blog Image Migration Script");
  console.log("===========================\n");

  // Read all blog posts
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Found ${files.length} blog posts\n`);

  const allReplacements = new Map();
  let filesModified = 0;

  if (!downloadOnly) {
    for (const file of files) {
      const filePath = path.join(BLOG_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const { updatedContent, replacements } = findAndReplaceUrls(content);

      if (replacements.size > 0) {
        fs.writeFileSync(filePath, updatedContent);
        filesModified++;
        console.log(`Updated ${file} (${replacements.size} image refs)`);
        for (const [url, localPath] of replacements) {
          allReplacements.set(url, localPath);
        }
      }
    }

    console.log(`\nModified ${filesModified} files`);
    console.log(`Total unique image URLs replaced: ${allReplacements.size}`);
  } else {
    // Just build the replacement map without modifying files
    for (const file of files) {
      const filePath = path.join(BLOG_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const urlRegex = /https?:\/\/(?:i0\.wp\.com\/)?luxewindowworks\.com\/wp-content\/uploads\/[^"'\s<>)]+/g;
      let match;
      while ((match = urlRegex.exec(content)) !== null) {
        const cleanedUrl = match[0].replace(/[,;]$/, "");
        const localPath = urlToLocalPath(cleanedUrl);
        if (localPath) {
          allReplacements.set(cleanedUrl, localPath);
        }
      }
    }
  }

  // Generate download manifest
  const manifest = {};
  for (const [url, localPath] of allReplacements) {
    manifest[url] = {
      localPath,
      absolutePath: path.join(ROOT, "public", localPath),
    };
  }

  const manifestPath = path.join(ROOT, "scripts", "image-download-list.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nDownload manifest saved to: scripts/image-download-list.json`);

  // Create directory structure
  const dirs = new Set();
  for (const { localPath } of Object.values(manifest)) {
    dirs.add(path.join(PUBLIC_BLOG_IMAGES, path.dirname(localPath).replace("/images/blog/", "")));
  }
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir.replace(ROOT, ".")}`);
    }
  }

  if (shouldDownload || downloadOnly) {
    console.log("\nDownloading images...\n");
    let downloaded = 0;
    let failed = 0;
    const failures = [];

    for (const [url, { absolutePath }] of Object.entries(manifest)) {
      if (fs.existsSync(absolutePath)) {
        console.log(`  SKIP (exists): ${path.basename(absolutePath)}`);
        downloaded++;
        continue;
      }

      try {
        await downloadFile(url, absolutePath);
        downloaded++;
        console.log(`  OK: ${path.basename(absolutePath)}`);
      } catch (err) {
        // Try i0.wp.com CDN as fallback
        const cdnUrl = url.replace(
          "https://luxewindowworks.com/",
          "https://i0.wp.com/luxewindowworks.com/"
        );
        try {
          await downloadFile(cdnUrl, absolutePath);
          downloaded++;
          console.log(`  OK (via CDN): ${path.basename(absolutePath)}`);
        } catch (err2) {
          failed++;
          failures.push({ url, error: err2.message });
          console.log(`  FAIL: ${path.basename(absolutePath)} - ${err2.message}`);
        }
      }
    }

    console.log(`\nDownload complete: ${downloaded} succeeded, ${failed} failed`);
    if (failures.length > 0) {
      const failurePath = path.join(ROOT, "scripts", "download-failures.json");
      fs.writeFileSync(failurePath, JSON.stringify(failures, null, 2));
      console.log(`Failed downloads saved to: scripts/download-failures.json`);
    }
  } else {
    console.log("\n--- NEXT STEPS ---");
    console.log("Run this script with --download to download the images:");
    console.log("  node scripts/migrate-images.mjs --download");
    console.log("\nOr manually place images in the paths listed in:");
    console.log("  scripts/image-download-list.json");
  }
}

main().catch(console.error);
