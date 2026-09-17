import React from 'react';
import { ExternalLink, Layers } from 'lucide-react';
import { DocCard } from '../../types/docs';
import { CodeBlock } from './CodeBlock';

export const ResourceCard: React.FC<DocCard> = ({ title, description, href, badge, code }) => {
  const cardId = `resource-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      id={cardId}
      className="rounded-lg border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] p-4 shadow-xs hover:border-indigo-400 dark:hover:border-[#3b82f6]/60 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-500 dark:text-[#70a5ff]" />
            <h4 className="font-semibold text-slate-900 dark:text-[#F5F7FA] text-sm">
              {title}
            </h4>
          </div>
          {badge && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-[#70a5ff] border border-transparent dark:border-[#233558]">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-[#A7AFBD] leading-relaxed mb-3">
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
          className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-[#70a5ff] hover:underline pt-2 border-t border-slate-100 dark:border-[#1D2430]"
        >
          <span>Explore resource</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
