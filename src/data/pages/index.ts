import { DocPage } from '../../types/docs';
import { getStartedPages } from './getStarted';
import { architecturePages } from './architecture';
import { agentsPages } from './agents';
import { autonomyPages } from './autonomy';
import { modelsPages } from './models';
import { toolsPages } from './tools';
import { desktopPages } from './desktop';
import { freeTechStackPages } from './freeTechStack';
import { buildPages } from './build';
import { mvp10DayPages } from './mvp10Day';
import { researchPages } from './research';
import { resourcesPages } from './resources';
import { roadmapPages } from './roadmap';
import { referencePages } from './reference';

export const ALL_DOC_PAGES: DocPage[] = [
  ...getStartedPages,
  ...architecturePages,
  ...agentsPages,
  ...autonomyPages,
  ...modelsPages,
  ...toolsPages,
  ...desktopPages,
  ...freeTechStackPages,
  ...buildPages,
  ...mvp10DayPages,
  ...researchPages,
  ...resourcesPages,
  ...roadmapPages,
  ...referencePages,
];

export const DOCS_BY_SLUG = new Map<string, DocPage>(
  ALL_DOC_PAGES.map((page) => [page.slug, page])
);

export function getDocPageBySlug(slug: string): DocPage | undefined {
  return DOCS_BY_SLUG.get(slug);
}

export function getAdjacentPages(currentSlug: string): {
  prev: { title: string; slug: string } | null;
  next: { title: string; slug: string } | null;
} {
  const index = ALL_DOC_PAGES.findIndex((p) => p.slug === currentSlug);
  if (index === -1) return { prev: null, next: null };

  const prev = index > 0 ? { title: ALL_DOC_PAGES[index - 1].title, slug: ALL_DOC_PAGES[index - 1].slug } : null;
  const next = index < ALL_DOC_PAGES.length - 1 ? { title: ALL_DOC_PAGES[index + 1].title, slug: ALL_DOC_PAGES[index + 1].slug } : null;

  return { prev, next };
}
