import { ALL_DOC_PAGES } from '../src/data/pages';
import { writeSitemapAndRobots, normalizeBaseUrl } from '../src/utils/sitemapGenerator';

function main() {
  const baseUrl = normalizeBaseUrl();
  console.log(`[sitemap] Generating sitemap.xml and robots.txt for ${ALL_DOC_PAGES.length} pages...`);
  console.log(`[sitemap] Base URL: ${baseUrl}`);

  const result = writeSitemapAndRobots(ALL_DOC_PAGES, { baseUrl });

  console.log(`[sitemap] Successfully generated files:`);
  for (const file of result.writtenFiles) {
    console.log(`  ✓ ${file}`);
  }
}

main();
