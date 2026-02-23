import { NextResponse } from "next/server";
import { PRODUCTS, SERVICE_AREAS } from "@/lib/constants";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://luxewindowworks.com";

function escapeXml(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDateString(date: Date | string): string {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function GET() {
  const today = toDateString(new Date());

  const staticPages = [
    { url: BASE_URL, lastmod: today, changefreq: "weekly", priority: "1.0" },
    { url: `${BASE_URL}/contact`, lastmod: today, changefreq: "monthly", priority: "0.8" },
    { url: `${BASE_URL}/blog`, lastmod: today, changefreq: "weekly", priority: "0.7" },
  ];

  const productPages = PRODUCTS.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastmod: today,
    changefreq: "monthly",
    priority: "0.8",
  }));

  const areaPages = SERVICE_AREAS.map((area) => ({
    url: `${BASE_URL}/areas/${area.slug}`,
    lastmod: today,
    changefreq: "monthly",
    priority: "0.8",
  }));

  let blogPages: { url: string; lastmod: string; changefreq: string; priority: string }[] = [];
  try {
    blogPages = getAllPosts().map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastmod: post.date ? toDateString(post.date) : today,
      changefreq: "monthly",
      priority: "0.6",
    }));
  } catch {
    // If blog posts fail to load, continue with other pages
  }

  const allPages = [...staticPages, ...productPages, ...areaPages, ...blogPages];

  const urlEntries = allPages
    .map(
      (page) => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
