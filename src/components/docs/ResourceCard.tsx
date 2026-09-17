import React from 'react';
import { ExternalLink, BookOpen, Layers } from 'lucide-react';
import { DocCard } from '../../types/docs';

export const ResourceCard: React.FC<DocCard> = ({ title, description, href, badge }) => {
  const cardId = `resource-card-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      id={cardId}
      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/60 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              {title}
            </h4>
          </div>
          {badge && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
          {description}
        </p>
      </div>

      {href && (
        <a
          id={`link-${cardId}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline pt-2 border-t border-slate-100 dark:border-slate-800"
        >
          <span>Explore resource</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
