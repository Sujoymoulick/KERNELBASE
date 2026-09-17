import { useEffect } from 'react';
import { DocPage } from '../types/docs';
import { updateDocPageMetadata, generatePageJsonLd, injectDocJsonLd } from '../utils/seoStructuredData';

/**
 * Custom hook to dynamically generate and inject Schema.org JSON-LD structured data
 * and document meta tags whenever the active documentation page changes.
 */
export function useDocJsonLd(page: DocPage | undefined, customBaseUrl?: string): void {
  useEffect(() => {
    if (!page) return;

    updateDocPageMetadata(page, customBaseUrl);
  }, [page, customBaseUrl]);
}

export { updateDocPageMetadata, generatePageJsonLd, injectDocJsonLd };
