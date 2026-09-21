import { DocPage } from '../../types/docs';
import { getStartedPages } from './getStarted';
import { architecturePages } from './architecture';
import { agentsPages } from './agents';
import { agentTeamsPages } from './agentTeams';
import { autonomyPages } from './autonomy';
import { modelsPages } from './models';
import { localAiPages } from './localAi';
import { toolsPages } from './tools';
import { desktopPages } from './desktop';
import { workspacePages } from './workspace';
import { freeTechStackPages } from './freeTechStack';
import { buildPages } from './build';
import { mvp10DayPages } from './mvp10Day';
import { researchPages } from './research';
import { resourcesPages } from './resources';
import { roadmapPages } from './roadmap';
import { organizationPages } from './organization';
import { adrPages } from './adr';
import { referencePages } from './reference';

export const ALL_DOC_PAGES: DocPage[] = [
  ...getStartedPages,
  ...architecturePages,
  ...agentsPages,
  ...agentTeamsPages,
  ...autonomyPages,
  ...modelsPages,
  ...localAiPages,
  ...toolsPages,
  ...desktopPages,
  ...workspacePages,
  ...freeTechStackPages,
  ...buildPages,
  ...mvp10DayPages,
  ...researchPages,
  ...resourcesPages,
  ...roadmapPages,
  ...organizationPages,
  ...adrPages,
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
