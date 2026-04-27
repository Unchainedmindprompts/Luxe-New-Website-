import { MetadataRoute } from 'next'

const DISALLOW = ['/admin', '/api']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      // OpenAI
      { userAgent: 'GPTBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: DISALLOW },
      { userAgent: 'OAI-SearchBot', allow: '/', disallow: DISALLOW },
      // Anthropic / Claude
      { userAgent: 'anthropic-ai', allow: '/', disallow: DISALLOW },
      { userAgent: 'ClaudeBot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Claude-Web', allow: '/', disallow: DISALLOW },
      // Google
      { userAgent: 'Google-Extended', allow: '/', disallow: DISALLOW },
      { userAgent: 'Googlebot', allow: '/', disallow: DISALLOW },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/', disallow: DISALLOW },
      // Meta
      { userAgent: 'meta-externalagent', allow: '/', disallow: DISALLOW },
      { userAgent: 'FacebookBot', allow: '/', disallow: DISALLOW },
      // Apple
      { userAgent: 'Applebot', allow: '/', disallow: DISALLOW },
      { userAgent: 'Applebot-Extended', allow: '/', disallow: DISALLOW },
      // Amazon
      { userAgent: 'Amazonbot', allow: '/', disallow: DISALLOW },
      // Cohere
      { userAgent: 'cohere-ai', allow: '/', disallow: DISALLOW },
      // You.com
      { userAgent: 'YouBot', allow: '/', disallow: DISALLOW },
      // Common Crawl (used by many LLM training pipelines)
      { userAgent: 'CCBot', allow: '/', disallow: DISALLOW },
    ],
    sitemap: 'https://www.luxewindowworks.com/sitemap.xml',
  }
}
