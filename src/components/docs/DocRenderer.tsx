import React, { useState } from 'react';
import { DocPage } from '../../types/docs';
import { Breadcrumbs } from './Breadcrumbs';
import { Callout } from './Callout';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';
import { Pagination } from './Pagination';
import { ResourceCard } from './ResourceCard';
import { DagVisualizer } from '../widgets/DagVisualizer';
import { CreditCalculator } from '../widgets/CreditCalculator';
import { TechMatrixTable } from '../widgets/TechMatrixTable';
import { MvpTracker } from '../widgets/MvpTracker';
import { DesktopComparison } from '../widgets/DesktopComparison';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { CloudflarePrimitivesCard } from '../widgets/CloudflarePrimitivesCard';
import { MobileTableOfContents } from './OnThisPage';
import { Calendar, Tag, ArrowRight, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { getAdjacentPages } from '../../data/pages';
import { copyToClipboard } from '../../utils/clipboard';

interface DocRendererProps {
  page: DocPage;
  onNavigate: (slug: string) => void;
  isDark?: boolean;
}

export const DocRenderer: React.FC<DocRendererProps> = ({ page, onNavigate, isDark = true }) => {
  const { prev, next } = getAdjacentPages(page.slug);
  const [feedbackGiven, setFeedbackGiven] = React.useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const isOverview = page.slug === 'get-started/overview';

  const handleCopyPrompt = async () => {
    const promptText = `Build an AI-Native Multi-Agent IDE with local control plane, LiteLLM gateway, and containerized Docker sandboxing.`;
    const success = await copyToClipboard(promptText);
    if (success) {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

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
      case 'cloudflare-primitives':
        return <CloudflarePrimitivesCard />;
      default:
        return isOverview ? <CloudflarePrimitivesCard /> : null;
    }
  };

  return (
    <article className="min-w-0 max-w-4xl flex-1 pb-16" style={{ color: 'var(--kb-text)' }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs
        section={page.section}
        category={page.category}
        title={page.title}
        onNavigateHome={() => onNavigate('get-started/overview')}
      />

      {/* Hero Header for Overview Page */}
      {isOverview ? (
        <header className="mb-10 pb-8 border-b" style={{ borderColor: 'var(--kb-border)' }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3 font-sans" style={{ color: 'var(--kb-text)' }}>
            Kernel Base Developer Docs
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mb-6" style={{ color: 'var(--kb-text-muted)' }}>
            Explore guides, specifications, and architecture to build on the Kernel Base platform
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Button */}
            <button
              onClick={() => onNavigate('architecture/system-architecture')}
              className="px-6 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all flex items-center space-x-2 border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--kb-accent-bright)',
                color: '#fff',
                borderColor: 'var(--kb-brand-secondary)',
              }}
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {/* Secondary Button */}
            <button
              onClick={handleCopyPrompt}
              className="px-4 py-2.5 rounded-full border font-medium text-xs sm:text-sm transition-all flex items-center space-x-2"
              style={{
                backgroundColor: 'var(--kb-surface-elevated)',
                color: 'var(--kb-text-muted)',
                borderColor: 'var(--kb-border)',
              }}
            >
              <span className="font-mono" style={{ color: 'var(--kb-accent-bright)' }}>⎇ ⬡</span>
              <span>{copiedPrompt ? 'Copied prompt!' : 'Copy prompt'}</span>
              {copiedPrompt && <Check className="h-3.5 w-3.5" style={{ color: 'var(--kb-accent-bright)' }} />}
            </button>
          </div>
        </header>
      ) : (
        /* Standard Page Title & Meta */
        <header className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--kb-border)' }}>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--kb-surface-elevated)',
                color: 'var(--kb-accent-bright)',
                borderColor: 'var(--kb-border)',
              }}
            >
              {page.section}
            </span>
            {page.category && (
              <span className="text-[11px]" style={{ color: 'var(--kb-text-subtle)' }}>
                • {page.category}
              </span>
            )}
            {page.checkedDate && (
              <span className="ml-auto inline-flex items-center space-x-1 text-[11px]" style={{ color: 'var(--kb-text-faint)' }}>
                <Calendar className="h-3 w-3" />
                <span>Verified {page.checkedDate}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3" style={{ color: 'var(--kb-text)' }}>
            {page.title}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-3xl" style={{ color: 'var(--kb-text-muted)' }}>
            {page.description}
          </p>

          {page.tags && page.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-4">
              <Tag className="h-3 w-3" style={{ color: 'var(--kb-text-faint)' }} />
              {page.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--kb-surface-elevated)',
                    color: 'var(--kb-text-muted)',
                    borderColor: 'var(--kb-border)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>
      )}

      {/* Mobile and Tablet Table of Contents Accordion */}
      <MobileTableOfContents sections={page.content.sections} />

      {/* Main Body */}
      <div className="max-w-none text-sm leading-relaxed" style={{ color: 'var(--kb-text-muted)' }}>
        {/* Lead Paragraph */}
        {page.content.lead && (
          <p className="text-base font-medium leading-relaxed mb-6" style={{ color: 'var(--kb-text)' }}>
            {page.content.lead}
          </p>
        )}

        {/* Mounted Interactive Widget if assigned to page */}
        {renderInteractiveComponent(page.content.interactiveComponent)}

        {/* Dynamic Sections */}
        {page.content.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-10 mb-8 scroll-mt-24">
            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight pb-2 border-b mb-4 flex items-center group"
              style={{ color: 'var(--kb-text)', borderColor: 'var(--kb-border)' }}
            >
              <a
                href={`#${section.id}`}
                className="hover:opacity-80 transition-opacity"
              >
                {section.title}
              </a>
            </h2>

            {section.body && (
              <p className="mb-4 leading-relaxed" style={{ color: 'var(--kb-text-muted)' }}>
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
                    className="p-4 rounded-lg border"
                    style={{
                      borderColor: 'var(--kb-border)',
                      backgroundColor: 'color-mix(in srgb, var(--kb-surface-elevated) 50%, transparent)',
                    }}
                  >
                    <div className="font-semibold text-sm mb-1" style={{ color: 'var(--kb-text)' }}>
                      {step.title}
                    </div>
                    <p className="text-xs mb-2 leading-relaxed" style={{ color: 'var(--kb-text-muted)' }}>
                      {step.description}
                    </p>
                    {step.code && (
                      <CodeBlock
                        code={step.code}
                        language={step.language || 'bash'}
                        filename={step.title}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Structured Table */}
            {section.table && (
              <div
                className="my-6 overflow-x-auto rounded-lg border shadow-2xs"
                style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface)' }}
              >
                <table className="w-full text-left border-collapse text-xs min-w-[520px]">
                  <thead>
                    <tr
                      className="border-b font-semibold"
                      style={{ borderColor: 'var(--kb-border)', backgroundColor: 'var(--kb-surface-elevated)', color: 'var(--kb-text)' }}
                    >
                      {section.table.headers.map((h, i) => (
                        <th key={i} className="py-2.5 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--kb-border)' }}>
                    {section.table.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="transition-colors"
                        style={{ borderColor: 'var(--kb-border)' }}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className="py-2.5 px-3"
                            style={{ color: 'var(--kb-text-muted)' }}
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
                  highlightLines={cb.highlightLines}
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
                    code={card.code}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Related Pages */}
        {page.content.relatedPages && page.content.relatedPages.length > 0 && (
          <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--kb-border)' }}>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: 'var(--kb-text-faint)' }}
            >
              Related Documentation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {page.content.relatedPages.map((rel) => (
                <button
                  key={rel.slug}
                  onClick={() => onNavigate(rel.slug)}
                  className="p-3.5 rounded-lg border transition-all text-left flex items-center justify-between group"
                  style={{
                    borderColor: 'var(--kb-border)',
                    backgroundColor: 'color-mix(in srgb, var(--kb-surface-elevated) 60%, transparent)',
                  }}
                >
                  <span
                    className="text-xs font-medium transition-colors"
                    style={{ color: 'var(--kb-text)' }}
                  >
                    {rel.title}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--kb-text-faint)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Was this page helpful? */}
      <div
        className="mt-10 p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--kb-surface-elevated) 60%, transparent)',
          borderColor: 'var(--kb-border)',
        }}
      >
        <span className="text-xs" style={{ color: 'var(--kb-text-muted)' }}>
          Was this documentation page helpful?
        </span>
        {feedbackGiven ? (
          <span className="text-xs font-medium" style={{ color: 'var(--kb-accent-bright)' }}>
            Thank you for your feedback!
          </span>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFeedbackGiven(true)}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--kb-text-faint)' }}
              title="Yes, this was helpful"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setFeedbackGiven(true)}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: 'var(--kb-text-faint)' }}
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
