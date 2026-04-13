import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      // OpenAI
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      // Anthropic / Claude
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      // Google
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/' },
      // Meta
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      // Apple
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      // Amazon
      { userAgent: 'Amazonbot', allow: '/' },
      // Cohere
      { userAgent: 'cohere-ai', allow: '/' },
      // You.com
      { userAgent: 'YouBot', allow: '/' },
      // Common Crawl (used by many LLM training pipelines)
      { userAgent: 'CCBot', allow: '/' },
    ],
    sitemap: 'https://www.luxewindowworks.com/sitemap.xml',
  }
}
