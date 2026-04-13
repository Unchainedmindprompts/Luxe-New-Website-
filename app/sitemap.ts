import { MetadataRoute } from 'next'
import { getAllSlugs, getPost } from '@/lib/blog'
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.luxewindowworks.com'
  const currentDate = new Date().toISOString()
  // Dynamically generate all blog post URLs from content/blog
  const blogPosts: MetadataRoute.Sitemap = getAllSlugs().map((slug) => {
    const post = getPost(slug)
    return {
      url: `${baseUrl}/blog/${slug}`,
      lastModified: post?.dateModified
        ? new Date(post.dateModified).toISOString()
        : post?.date
        ? new Date(post.date).toISOString()
        : currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    }
  })
  return [
    // Core pages
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Product pages
    {
      url: `${baseUrl}/products/cellular-shades`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/solar-shades`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/roller-shades`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/roman-shades`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products/banded-shades`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/products/motorization`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products/shutters`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Service area pages
    {
      url: `${baseUrl}/areas/coeur-d-alene`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/areas/post-falls`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/areas/hayden`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/areas/rathdrum`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/areas/sandpoint`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // All blog posts — dynamically generated from content/blog
    ...blogPosts,
  ]
}
