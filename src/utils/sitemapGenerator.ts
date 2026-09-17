import fs from 'fs';
import path from 'path';
import { DocPage } from '../types/docs';

export interface SitemapOptions {
  baseUrl?: string;
  defaultPriority?: number;
  defaultChangefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

/**
 * Normalizes a base URL by removing any trailing slash.
 */
export function normalizeBaseUrl(url?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return (
      (typeof process !== 'undefined' &&
        (process.env?.APP_URL ||
          process.env?.VITE_APP_URL ||
          process.env?.VERCEL_URL && `https://${process.env.VERCEL_URL}`)) ||
      'https://ai-native-ide-docs.dev'
    ).replace(/\/+$/, '');
  }
  return url.trim().replace(/\/+$/, '');
}

/**
 * Calculates SEO priority dynamically based on section and page importance.
 */
export function calculatePriority(page: DocPage): number {
  const slug = page.slug.toLowerCase();

  // Root or introductory pages
  if (slug === 'get-started/overview' || slug === 'get-started/quickstart') {
    return 1.0;
  }
  if (slug.startsWith('get-started/')) {
    return 0.9;
  }
  if (slug.startsWith('architecture/')) {
    return 0.9;
  }
  if (slug.startsWith('agents/') || slug.startsWith('autonomy/') || slug.startsWith('models/')) {
    return 0.85;
  }
  if (slug.startsWith('desktop/') || slug.startsWith('build/') || slug.startsWith('mvp-10-day/')) {
    return 0.8;
  }
  if (slug.startsWith('free-tech-stack/') || slug.startsWith('tools/')) {
    return 0.75;
  }
  if (slug.startsWith('research/') || slug.startsWith('roadmap/')) {
    return 0.7;
  }
  // Reference and resources
  return 0.65;
}

/**
 * Formats a Date or date string to YYYY-MM-DD for sitemap lastmod tags.
 */
export function formatLastMod(dateStr?: string): string {
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const date = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Generates valid XML conforming to the Sitemaps.org XML schema 0.9.
 */
export function generateSitemapXml(pages: DocPage[], options: SitemapOptions = {}): string {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const today = new Date().toISOString().split('T')[0];

  // Root entry
  const rootEntry = `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Page entries
  const pageEntries = pages.map((page) => {
    const priority = calculatePriority(page).toFixed(2);
    const lastmod = formatLastMod(page.lastUpdated || today);
    // Include both hash route (for SPA client direct navigation) and clean canonical
    const pageUrl = `${baseUrl}/#${page.slug}`;

    return `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${rootEntry}
${pageEntries.join('\n')}
</urlset>
`.trim() + '\n';
}

/**
 * Generates standard robots.txt content referencing the generated sitemap.
 */
export function generateRobotsTxt(options: SitemapOptions = {}): string {
  const baseUrl = normalizeBaseUrl(options.baseUrl);

  return `# robots.txt for AI-Native Multi-Agent IDE Documentation
# Reference: https://www.robotstxt.org/

User-agent: *
Allow: /

# Direct crawlers to the authoritative XML sitemap
Sitemap: ${baseUrl}/sitemap.xml
`.trim() + '\n';
}

/**
 * Writes sitemap.xml and robots.txt to target output directories (e.g. public/, dist/).
 */
export function writeSitemapAndRobots(
  pages: DocPage[],
  options: SitemapOptions & { outDirs?: string[] } = {}
): {
  sitemapContent: string;
  robotsContent: string;
  writtenFiles: string[];
} {
  const sitemapContent = generateSitemapXml(pages, options);
  const robotsContent = generateRobotsTxt(options);
  const writtenFiles: string[] = [];

  const defaultOutDirs = [
    path.resolve(process.cwd(), 'public'),
  ];

  const targetDirs = options.outDirs
    ? options.outDirs.map((d) => path.resolve(process.cwd(), d))
    : defaultOutDirs;

  // Also include dist if it exists
  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir) && !targetDirs.includes(distDir)) {
    targetDirs.push(distDir);
  }

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.warn(`[sitemap] Could not create directory ${dir}:`, err);
        continue;
      }
    }

    const sitemapPath = path.join(dir, 'sitemap.xml');
    const robotsPath = path.join(dir, 'robots.txt');

    try {
      fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8');
      writtenFiles.push(sitemapPath);
    } catch (err) {
      console.error(`[sitemap] Failed to write ${sitemapPath}:`, err);
    }

    try {
      fs.writeFileSync(robotsPath, robotsContent, 'utf-8');
      writtenFiles.push(robotsPath);
    } catch (err) {
      console.error(`[sitemap] Failed to write ${robotsPath}:`, err);
    }
  }

  return {
    sitemapContent,
    robotsContent,
    writtenFiles,
  };
}
