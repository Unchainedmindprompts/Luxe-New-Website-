# Claude Code Prompt: Schema Strategy for Luxe Window Works
## SEO + AEO + GEO Optimization via Structured Data

---

## CONTEXT & MISSION

You are implementing a comprehensive JSON-LD structured data (schema markup) strategy for **Luxe Window Works** (luxewindowworks.com), a custom window treatment business serving Northern Idaho — Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint. The site is built on Next.js/React and hosted on Vercel.

The goal is maximum visibility across three discovery channels simultaneously:
- **SEO** — Google rich results, knowledge panels, local pack
- **AEO** (Answer Engine Optimization) — featured snippets, voice search, People Also Ask
- **GEO** (Generative Engine Optimization) — AI citation by Claude, ChatGPT, Perplexity, Gemini

This is not a "add some schema and call it done" task. This is a structured data architecture — every page type gets a purpose-built schema stack, every entity is defined, every relationship is connected.

---

## PHASE 1: GLOBAL SITE-WIDE SCHEMA

### 1A. Organization Schema (sitewide — add to layout/root)

Create a persistent `Organization` schema that appears on every page. This anchors Luxe Window Works as a known, trusted entity for AI systems.

```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": "https://luxewindowworks.com/#organization",
  "name": "Luxe Window Works",
  "alternateName": "Luxe Window Works Northern Idaho",
  "url": "https://luxewindowworks.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://luxewindowworks.com/images/logo.png",
    "width": 300,
    "height": 100
  },
  "image": "https://luxewindowworks.com/images/og-image.jpg",
  "description": "Custom window treatment dealer serving Northern Idaho. Specializing in plantation shutters, motorized shades, cellular shades, and Hunter Douglas products for Coeur d'Alene, Post Falls, Hayden, Rathdrum, and Sandpoint homes.",
  "founder": {
    "@type": "Person",
    "@id": "https://luxewindowworks.com/#mark-abplanalp",
    "name": "Mark Abplanalp",
    "jobTitle": "Owner",
    "knowsAbout": [
      "plantation shutters",
      "custom window treatments",
      "motorized shades",
      "Hunter Douglas products",
      "window covering installation",
      "Northern Idaho home interiors"
    ]
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "2972 N Pavo Ln",
    "addressLocality": "Post Falls",
    "addressRegion": "ID",
    "postalCode": "83854",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 47.7190,
    "longitude": -116.9516
  },
  "telephone": "+12086608643",
  "email": "mark@luxewindowworks.com",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "10:00",
      "closes": "14:00"
    }
  ],
  "areaServed": [
    {"@type": "City", "name": "Coeur d'Alene", "sameAs": "https://www.wikidata.org/wiki/Q982827"},
    {"@type": "City", "name": "Post Falls", "sameAs": "https://www.wikidata.org/wiki/Q1016696"},
    {"@type": "City", "name": "Hayden", "sameAs": "https://www.wikidata.org/wiki/Q2337571"},
    {"@type": "City", "name": "Rathdrum", "sameAs": "https://www.wikidata.org/wiki/Q2149207"},
    {"@type": "City", "name": "Sandpoint", "sameAs": "https://www.wikidata.org/wiki/Q986038"}
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Custom Window Treatments",
    "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Plantation Shutters"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Motorized Shades"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Cellular Shades"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Solar Shades"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Roller Shades"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Roman Shades"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "In-Home Consultation"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Professional Installation"}}
    ]
  },
  "brand": [
    {"@type": "Brand", "name": "Hunter Douglas"},
    {"@type": "Brand", "name": "Norman"},
    {"@type": "Brand", "name": "Alta"},
    {"@type": "Brand", "name": "Lafayette"},
    {"@type": "Brand", "name": "Graber"}
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "14",
    "bestRating": "5"
  },
  "sameAs": [
    "https://www.google.com/maps/place/Luxe+Window+Works",
    "https://www.yelp.com/biz/luxe-window-works"
  ]
}
```

**Implementation:** Create a `SchemaOrganization` component. Import and render it in the root layout so it appears on every page inside a `<script type="application/ld+json">` tag.

---

### 1B. WebSite Schema (homepage only)

Enables Google Sitelinks Search Box and establishes the site as a known web entity.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://luxewindowworks.com/#website",
  "url": "https://luxewindowworks.com",
  "name": "Luxe Window Works",
  "publisher": {"@id": "https://luxewindowworks.com/#organization"},
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://luxewindowworks.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

---

## PHASE 2: BLOG POST / ARTICLE SCHEMA

Every blog post needs a full `Article` stack. Build a reusable `SchemaBlogPost` component that accepts post metadata as props.

### Required schema types for every blog post:
1. `Article` (primary)
2. `BreadcrumbList`
3. `FAQPage` (if post contains FAQ section)
4. `HowTo` (if post contains step-by-step instructions)

### Article Schema Template (props-driven component):

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "{{POST_URL}}#article",
  "headline": "{{POST_TITLE}}",
  "description": "{{POST_META_DESCRIPTION}}",
  "image": {
    "@type": "ImageObject",
    "url": "{{POST_FEATURED_IMAGE_URL}}",
    "width": 1200,
    "height": 630
  },
  "datePublished": "{{PUBLISH_DATE_ISO}}",
  "dateModified": "{{MODIFIED_DATE_ISO}}",
  "author": {
    "@type": "Person",
    "@id": "https://luxewindowworks.com/#mark-abplanalp",
    "name": "Mark Abplanalp",
    "url": "https://luxewindowworks.com/about",
    "jobTitle": "Owner, Luxe Window Works",
    "knowsAbout": ["plantation shutters", "window treatments", "Northern Idaho homes", "Hunter Douglas", "motorized shades"]
  },
  "publisher": {
    "@id": "https://luxewindowworks.com/#organization"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{POST_URL}}"
  },
  "articleSection": "{{CATEGORY}}",
  "wordCount": {{WORD_COUNT}},
  "about": [
    {{TOPIC_ENTITIES_ARRAY}}
  ],
  "mentions": [
    {{MENTIONED_ENTITIES_ARRAY}}
  ],
  "inLanguage": "en-US",
  "isPartOf": {
    "@type": "Blog",
    "@id": "https://luxewindowworks.com/blog#blog",
    "name": "Luxe Window Works Blog",
    "publisher": {"@id": "https://luxewindowworks.com/#organization"}
  }
}
```

### BreadcrumbList Template:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://luxewindowworks.com"},
    {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://luxewindowworks.com/blog"},
    {"@type": "ListItem", "position": 3, "name": "{{POST_TITLE}}", "item": "{{POST_URL}}"}
  ]
}
```

---

## PHASE 3: FAQ SCHEMA (AEO POWERHOUSE)

This is the highest-impact schema for AEO and GEO. Every FAQ section in any post or page gets its own `FAQPage` schema. This is what gets pulled into Google's People Also Ask, voice search answers, and AI-generated responses.

### Rules for FAQ schema:
- Questions must exactly match the H3 heading text in the article
- Answers must be complete standalone sentences (not "See above")
- Each answer should be 40–120 words — enough to be cited, short enough to be quoted
- Include the city/region when relevant ("in Northern Idaho", "for Coeur d'Alene homes")

### FAQPage Template:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{QUESTION_TEXT}}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{{ANSWER_TEXT}}"
      }
    }
  ]
}
```

### For the Shutter Guide post specifically, generate FAQPage schema using these Q&A pairs:
- "Can I still open my window for airflow in summer if I have shutters?"
- "Will plantation shutters block my view of the lake?"
- "What shutter material is best for high-humidity areas in Northern Idaho?"
- "How much window depth do I need for plantation shutters?"
- "What is the difference between a Z-frame and an L-frame shutter?"
- "Do I need a divider rail on tall shutter panels?"
- "Are aluminum shutters more expensive than composite shutters?"

---

## PHASE 4: SERVICE AREA PAGE SCHEMA

Each city landing page gets a `LocalBusiness` + `Service` + `BreadcrumbList` stack. This drives local pack rankings and tells AI systems exactly where Luxe Window Works operates.

### Service Area Page Schema Template:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://luxewindowworks.com/window-coverings-{{CITY_SLUG}}/#service",
  "name": "Custom Window Coverings {{CITY_NAME}}, ID",
  "description": "Professional custom window treatment installation in {{CITY_NAME}}, Idaho. Plantation shutters, motorized shades, cellular shades, and more from Luxe Window Works.",
  "provider": {
    "@id": "https://luxewindowworks.com/#organization"
  },
  "areaServed": {
    "@type": "City",
    "name": "{{CITY_NAME}}",
    "addressRegion": "ID",
    "addressCountry": "US"
  },
  "serviceType": "Custom Window Treatment Installation",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Window Treatments for {{CITY_NAME}} Homes",
    "itemListElement": [
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Plantation Shutters {{CITY_NAME}}"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Motorized Shades {{CITY_NAME}}"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "Cellular Shades {{CITY_NAME}}"}},
      {"@type": "Offer", "itemOffered": {"@type": "Service", "name": "In-Home Consultation {{CITY_NAME}}"}}
    ]
  }
}
```

---

## PHASE 5: PRODUCT PAGE SCHEMA

Each product category page (Shutters, Cellular Shades, Solar Shades, etc.) gets a `Product` + `Service` schema.

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": "https://luxewindowworks.com/products/{{PRODUCT_SLUG}}/#product",
  "name": "{{PRODUCT_NAME}}",
  "description": "{{PRODUCT_DESCRIPTION}}",
  "image": "{{PRODUCT_IMAGE_URL}}",
  "brand": {"@type": "Brand", "name": "{{BRAND_NAME}}"},
  "manufacturer": {"@type": "Organization", "name": "{{MANUFACTURER}}"},
  "offers": {
    "@type": "Offer",
    "seller": {"@id": "https://luxewindowworks.com/#organization"},
    "availability": "https://schema.org/InStock",
    "priceSpecification": {
      "@type": "PriceSpecification",
      "description": "Custom pricing based on window measurements. Free in-home consultation available."
    }
  },
  "additionalProperty": [
    {"@type": "PropertyValue", "name": "Installation", "value": "Professional installation included"},
    {"@type": "PropertyValue", "name": "Consultation", "value": "Free in-home measurement and consultation"},
    {"@type": "PropertyValue", "name": "Service Area", "value": "Northern Idaho — Coeur d'Alene, Post Falls, Hayden, Rathdrum, Sandpoint"}
  ]
}
```

---

## PHASE 6: HOW-TO SCHEMA (for instructional content)

Any post that walks through a process — "How to Choose Shutters," "How to Measure Windows," etc. — should include `HowTo` schema. This is highly cited by AI assistants when answering procedural questions.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "{{HOW_TO_TITLE}}",
  "description": "{{HOW_TO_DESCRIPTION}}",
  "totalTime": "PT{{MINUTES}}M",
  "tool": [
    {"@type": "HowToTool", "name": "Tape measure"},
    {"@type": "HowToTool", "name": "Notepad"}
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "{{STEP_NAME}}",
      "text": "{{STEP_DESCRIPTION}}",
      "image": "{{STEP_IMAGE_URL}}"
    }
  ]
}
```

---

## PHASE 7: REVIEW SCHEMA

Add individual `Review` schema for any testimonials displayed on the site. This supplements the `aggregateRating` in the Organization schema.

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {"@id": "https://luxewindowworks.com/#organization"},
  "author": {"@type": "Person", "name": "{{REVIEWER_NAME}}"},
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "reviewBody": "{{REVIEW_TEXT}}",
  "datePublished": "{{REVIEW_DATE}}"
}
```

---

## IMPLEMENTATION INSTRUCTIONS

### File Structure
Create a `/components/schema/` directory with individual components:
- `SchemaOrganization.tsx` — sitewide, loaded in root layout
- `SchemaWebSite.tsx` — homepage only
- `SchemaBlogPost.tsx` — all blog posts, accepts post metadata as props
- `SchemaFAQ.tsx` — accepts array of Q&A pairs as props
- `SchemaServiceArea.tsx` — city landing pages, accepts city data as props
- `SchemaProduct.tsx` — product pages
- `SchemaHowTo.tsx` — instructional posts
- `SchemaReview.tsx` — testimonial sections

### Helper Function
Create a `generateSchemaMarkup(schemaObject)` utility that serializes schema objects and renders them safely as `<script type="application/ld+json">` tags using Next.js's `<Script>` component or direct injection into `<Head>`.

### Critical Rules
1. **Never duplicate schema types on the same page.** If a parent layout injects `Organization` schema, child pages must not also inject it.
2. **Always use `@id` anchors** (`#organization`, `#article`, `#mark-abplanalp`) so schema entities reference each other — this builds a connected entity graph that AI systems trust.
3. **Validate every schema** at https://search.google.com/test/rich-results and https://validator.schema.org before deploying.
4. **Use ISO 8601 dates** (e.g., `2025-10-30T00:00:00-07:00`) for all date fields.
5. **Do not keyword stuff schema** — descriptions should read naturally and match on-page content.
6. **The `about` array** should contain topical entities (what the page is fundamentally about). The `mentions` array should contain referenced entities (brands, places, people mentioned in passing).

### Validation Checklist (run after implementation)
- [ ] Organization schema visible on every page (view source, search for `application/ld+json`)
- [ ] No duplicate schema types on any single page
- [ ] Rich Results Test passes for homepage, at least one blog post, and at least one service area page
- [ ] FAQ schema renders correctly and questions match exact H3 heading text
- [ ] `@id` references are consistent across all schema (same URL format, same anchor strings)
- [ ] All dates are in ISO 8601 format
- [ ] `aggregateRating` reviewCount matches actual number of reviews
- [ ] Breadcrumb schema matches visible breadcrumb navigation on the page

---

## PRIORITY ORDER

Implement in this sequence for fastest SEO/AEO/GEO impact:

1. **Organization schema** (sitewide) — establishes entity trust immediately
2. **FAQ schema** on the Shutter Guide post — highest AEO/GEO impact, fastest to index
3. **Article schema** on all existing blog posts — establishes authorship and topical authority
4. **BreadcrumbList** on all pages — quick win for rich results
5. **Service area page schema** — drives local pack and geo-specific AI answers
6. **Product page schema** — supports commercial intent queries
7. **HowTo schema** — add to any instructional content as it's created
8. **Review schema** — add as testimonial content is published

---

*Built for Luxe Window Works by Zero Click Strategies — optimized for Google, voice search, and AI discovery.*
