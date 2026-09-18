import React from 'react';
import { ExternalLink, Layers } from 'lucide-react';
import { DocCard } from '../../types/docs';
import { CodeBlock } from './CodeBlock';

export const ResourceCard: React.FC<DocCard> = ({ title, description, href, badge, code }) => {
  const cardId = `resource-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      id={cardId}
      className="rounded-xl border p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
      style={{
        borderColor: 'var(--kb-border)',
        backgroundColor: 'var(--kb-surface)',
      }}
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4" style={{ color: 'var(--kb-accent-bright)' }} />
            <h4 className="font-bold text-sm" style={{ color: 'var(--kb-text)' }}>
              {title}
            </h4>
          </div>
          {badge && (
            <span
              className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold"
              style={{
                backgroundColor: 'var(--kb-surface-elevated)',
                color: 'var(--kb-accent-bright)',
                borderColor: 'var(--kb-border)',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs leading-relaxed mb-3 font-normal" style={{ color: 'var(--kb-text-muted)' }}>
          {description}
        </p>
        {code && (
          <div className="my-2">
            <CodeBlock code={code} language="bash" filename={title} />
          </div>
        )}
      </div>

      {href && (
        <a
          id={`link-${cardId}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-xs hover:underline pt-2 border-t font-medium"
          style={{
            color: 'var(--kb-accent-bright)',
            borderColor: 'var(--kb-border)',
          }}
        >
          <span>Explore resource</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
