import { DocPage } from '../types/docs';

export interface StructuredDataGraph {
  '@context': string;
  '@graph': Array<Record<string, unknown>>;
}

/**
 * Normalizes a base URL, prioritizing browser window.location.origin in client contexts,
 * then environment variables, falling back to canonical project domain.
 */
export function getBaseUrl(customUrl?: string): string {
  if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  if (typeof process !== 'undefined' && process.env) {
    const envUrl = process.env.APP_URL || process.env.VITE_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
    if (envUrl) {
      return envUrl.replace(/\/+$/, '');
    }
  }

  return 'https://ai-native-ide-docs.dev';
}

/**
 * Generates Schema.org JSON-LD structured data for a documentation page.
 * Creates an interconnected @graph combining TechArticle, BreadcrumbList,
 * and optional HowTo schemas for technical documentation articles.
 */
export function generatePageJsonLd(page: DocPage, customBaseUrl?: string): StructuredDataGraph {
  const baseUrl = getBaseUrl(customBaseUrl);
  const pageUrl = `${baseUrl}/#${page.slug}`;
  const sectionSlug = page.slug.includes('/') ? page.slug.split('/')[0] : page.slug;
  const sectionUrl = `${baseUrl}/#${sectionSlug}`;
  const todayIso = new Date().toISOString().split('T')[0];
  const dateModified = page.lastUpdated || todayIso;

  // Extract key technical topics from content sections
  const topics = page.content.sections
    .map((s) => s.title)
    .filter(Boolean)
    .slice(0, 8);

  // 1. TechArticle Schema
  const techArticleSchema: Record<string, unknown> = {
    '@type': 'TechArticle',
    '@id': `${pageUrl}#article`,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: 'AI-Native Multi-Agent IDE Documentation',
      url: `${baseUrl}/`,
    },
    headline: page.title,
    name: `${page.title} — AI-Native Multi-Agent IDE Specification`,
    description: page.description || page.content.lead || 'Technical documentation and system architecture specification for AI-Native Multi-Agent IDE.',
    inLanguage: 'en-US',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    url: pageUrl,
    articleSection: page.section,
    keywords: page.tags && page.tags.length > 0 ? page.tags.join(', ') : `${page.section}, AI IDE, Multi-Agent`,
    proficiencyLevel: 'Expert',
    dependencies: 'TypeScript, Docker, MCP, LiteLLM, Ollama',
    datePublished: page.lastUpdated || '2026-09-01',
    dateModified: dateModified,
    author: {
      '@type': 'Organization',
      name: 'AI-Native IDE Research & Architecture Group',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI-Native IDE Documentation',
      url: baseUrl,
    },
  };

  if (topics.length > 0) {
    techArticleSchema.about = topics.map((topic) => ({
      '@type': 'Thing',
      name: topic,
    }));
  }

  // 2. BreadcrumbList Schema
  const breadcrumbSchema: Record<string, unknown> = {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumbs`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Documentation',
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.section,
        item: sectionUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.title,
        item: pageUrl,
      },
    ],
  };

  const graph: Array<Record<string, unknown>> = [techArticleSchema, breadcrumbSchema];

  // 3. HowTo Schema (if any section contains numbered/sequential steps)
  const stepSections = page.content.sections.filter(
    (s) => s.steps && Array.isArray(s.steps) && s.steps.length > 0
  );

  if (stepSections.length > 0) {
    const allSteps = stepSections.flatMap((s) => s.steps || []);
    if (allSteps.length > 0) {
      const howToSchema: Record<string, unknown> = {
        '@type': 'HowTo',
        '@id': `${pageUrl}#howto`,
        name: `How to: ${page.title}`,
        description: page.description,
        step: allSteps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: step.title,
          text: step.description,
          itemListElement: step.code
            ? [
                {
                  '@type': 'HowToDirection',
                  text: `Run or apply the following snippet: ${step.code.slice(0, 120)}...`,
                },
              ]
            : undefined,
        })),
      };
      graph.push(howToSchema);
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

/**
 * Injects or updates JSON-LD structured data in the document <head>.
 * Locates an existing <script id={scriptId} type="application/ld+json"> tag
 * or creates a new one, ensuring idempotency and preventing script duplication.
 */
export function injectDocJsonLd(
  data: StructuredDataGraph | object,
  scriptId = 'dynamic-doc-jsonld'
): HTMLScriptElement | null {
  if (typeof document === 'undefined') return null;

  try {
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      // Check if default pre-existing index.html script can be adopted
      const staticScript = document.querySelector('script[type="application/ld+json"]:not([id])');
      if (staticScript) {
        script = staticScript as HTMLScriptElement;
        script.id = scriptId;
      } else {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
    }

    script.textContent = JSON.stringify(data, null, 2);
    return script;
  } catch (err) {
    console.warn('[seoStructuredData] Failed to inject dynamic JSON-LD:', err);
    return null;
  }
}

/**
 * Dynamically updates document metadata (title, meta description, canonical,
 * OpenGraph, Twitter tags) AND injects the matching JSON-LD structured data.
 */
export function updateDocPageMetadata(page: DocPage, customBaseUrl?: string): void {
  if (typeof document === 'undefined' || !page) return;

  const baseUrl = getBaseUrl(customBaseUrl);
  const pageUrl = `${baseUrl}/#${page.slug}`;

  // 1. Page Title
  document.title = `${page.title} – ${page.section} | AI-Native IDE Docs`;

  // 2. Meta Description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && page.description) {
    metaDescription.setAttribute('content', page.description);
  }

  // 3. OpenGraph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${page.title} – ${page.section} | AI-Native IDE`);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription && page.description) {
    ogDescription.setAttribute('content', page.description);
  }

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', pageUrl);

  // 4. Twitter tags
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) {
    twTitle.setAttribute('content', `${page.title} – ${page.section}`);
  }

  const twDescription = document.querySelector('meta[name="twitter:description"]');
  if (twDescription && page.description) {
    twDescription.setAttribute('content', page.description);
  }

  // 5. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', pageUrl);

  // 6. Dynamic JSON-LD injection
  const jsonLd = generatePageJsonLd(page, baseUrl);
  injectDocJsonLd(jsonLd);
}
