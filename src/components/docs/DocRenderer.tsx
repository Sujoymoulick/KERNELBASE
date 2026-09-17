import React from 'react';
import { DocPage } from '../../types/docs';
import { Breadcrumbs } from './Breadcrumbs';
import { Callout } from './Callout';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';
import { Pagination } from './Pagination';
import { ResourceCard } from './ResourceCard';
import { AgentCard } from './AgentCard';
import { DagVisualizer } from '../widgets/DagVisualizer';
import { CreditCalculator } from '../widgets/CreditCalculator';
import { TechMatrixTable } from '../widgets/TechMatrixTable';
import { MvpTracker } from '../widgets/MvpTracker';
import { DesktopComparison } from '../widgets/DesktopComparison';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { MobileTableOfContents } from './OnThisPage';
import { Calendar, Tag, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getAdjacentPages } from '../../data/pages';

interface DocRendererProps {
  page: DocPage;
  onNavigate: (slug: string) => void;
  isDark?: boolean;
}

export const DocRenderer: React.FC<DocRendererProps> = ({ page, onNavigate, isDark }) => {
  const { prev, next } = getAdjacentPages(page.slug);
  const [feedbackGiven, setFeedbackGiven] = React.useState<boolean>(false);

  const renderInteractiveComponent = (type?: string) => {
    switch (type) {
      case 'dag-visualizer':
        return <DagVisualizer />;
      case 'credit-calculator':
        return <CreditCalculator />;
      case 'tech-matrix':
        return <TechMatrixTable />;
      case 'mvp-tracker':
        return <MvpTracker />;
      case 'desktop-comparison':
        return <DesktopComparison />;
      case 'architecture-diagram':
        return <ArchitectureDiagram isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <article className="min-w-0 max-w-4xl flex-1 pb-16">
      {/* Breadcrumbs navigation */}
      <Breadcrumbs
        section={page.section}
        category={page.category}
        title={page.title}
        onNavigateHome={() => onNavigate('get-started/overview')}
      />

      {/* Page Title & Meta */}
      <header className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
            {page.section}
          </span>
          {page.category && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              • {page.category}
            </span>
          )}
          {page.checkedDate && (
            <span className="ml-auto inline-flex items-center space-x-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>Verified {page.checkedDate}</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          {page.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          {page.description}
        </p>

        {page.tags && page.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            <Tag className="h-3 w-3 text-slate-400" />
            {page.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Mobile and Tablet Table of Contents Accordion */}
      <MobileTableOfContents sections={page.content.sections} />

      {/* Main Body */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
        {/* Lead Paragraph */}
        {page.content.lead && (
          <p className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
            {page.content.lead}
          </p>
        )}

        {/* Mounted Interactive Widget if assigned to page */}
        {renderInteractiveComponent(page.content.interactiveComponent)}

        {/* Dynamic Sections */}
        {page.content.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-10 mb-8 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-4 flex items-center group">
              <a href={`#${section.id}`} className="hover:underline">
                {section.title}
              </a>
            </h2>

            {section.body && (
              <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                {section.body}
              </p>
            )}

            {/* Callout */}
            {section.callout && (
              <Callout
                type={section.callout.type}
                title={section.callout.title}
                text={section.callout.text}
              />
            )}

            {/* Mermaid Architecture Diagram */}
            {section.mermaid && (
              <MermaidDiagram
                chart={section.mermaid}
                title={section.diagramTitle || section.title}
                isDark={isDark}
              />
            )}

            {/* Structured Steps */}
            {section.steps && section.steps.length > 0 && (
              <div className="space-y-4 my-6">
                {section.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                  >
                    <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                      {step.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                      {step.description}
                    </p>
                    {step.code && (
                      <CodeBlock
                        code={step.code}
                        language={step.language || 'bash'}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Structured Table */}
            {section.table && (
              <div className="my-6 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs min-w-[520px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200">
                      {section.table.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {section.table.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="py-2.5 px-3 text-slate-600 dark:text-slate-300"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Code Blocks */}
            {section.codeBlocks &&
              section.codeBlocks.map((cb, idx) => (
                <CodeBlock
                  key={idx}
                  code={cb.code}
                  language={cb.language}
                  filename={cb.filename}
                />
              ))}

            {/* Cards Grid */}
            {section.cards && section.cards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {section.cards.map((card, idx) => (
                  <ResourceCard
                    key={idx}
                    title={card.title}
                    description={card.description}
                    badge={card.badge}
                    href={card.href || card.link}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Related Pages */}
        {page.content.relatedPages && page.content.relatedPages.length > 0 && (
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Related Documentation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {page.content.relatedPages.map((rel) => (
                <button
                  key={rel.slug}
                  onClick={() => onNavigate(rel.slug)}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900/60 transition-all text-left flex items-center justify-between group"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {rel.title}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Was this page helpful? */}
      <div className="mt-10 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Was this documentation page helpful?
        </span>
        {feedbackGiven ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Thank you for your feedback!
          </span>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFeedbackGiven(true)}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Yes, this was helpful"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFeedbackGiven(true)}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="No, needs improvement"
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Pagination (Prev & Next) */}
      <Pagination prev={prev} next={next} onNavigate={onNavigate} />
    </article>
  );
};
