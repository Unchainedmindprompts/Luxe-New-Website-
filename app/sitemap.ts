import { MetadataRoute } from "next";
import { PRODUCTS, SERVICE_AREAS } from "@/lib/constants";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

const BASE_URL = "https://luxewindowworks.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: today, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/contact`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: today, changeFrequency: "weekly", priority: 0.7 },
  ];

  const productPages: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const areaPages: MetadataRoute.Sitemap = SERVICE_AREAS.map((area) => ({
    url: `${BASE_URL}/areas/${area.slug}`,
    lastModified: today,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    blogPages = getAllPosts().map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : today,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // If blog posts fail to load, continue with other pages
  }

  return [...staticPages, ...productPages, ...areaPages, ...blogPages];
}
