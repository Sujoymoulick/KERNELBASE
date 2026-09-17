import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DocCallout } from '../../types/docs';

export const Callout: React.FC<DocCallout> = ({ type, title, text }) => {
  const styleMap: Record<
    string,
    {
      border: string;
      bg: string;
      text: string;
      iconColor: string;
      icon: React.ElementType;
    }
  > = {
    note: {
      border: 'border-blue-500/30 dark:border-blue-400/30',
      bg: 'bg-blue-50/60 dark:bg-blue-950/20',
      text: 'text-blue-900 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: Info,
    },
    info: {
      border: 'border-blue-500/30 dark:border-blue-400/30',
      bg: 'bg-blue-50/60 dark:bg-blue-950/20',
      text: 'text-blue-900 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: Info,
    },
    important: {
      border: 'border-purple-500/30 dark:border-purple-400/30',
      bg: 'bg-purple-50/60 dark:bg-purple-950/20',
      text: 'text-purple-900 dark:text-purple-200',
      iconColor: 'text-purple-600 dark:text-purple-400',
      icon: AlertCircle,
    },
    warning: {
      border: 'border-amber-500/30 dark:border-amber-400/30',
      bg: 'bg-amber-50/60 dark:bg-amber-950/20',
      text: 'text-amber-900 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400',
      icon: AlertTriangle,
    },
    tip: {
      border: 'border-emerald-500/30 dark:border-emerald-400/30',
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      text: 'text-emerald-900 dark:text-emerald-200',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
    },
  };

  const styles = styleMap[type] || styleMap.note;

  const IconComponent = styles.icon;

  return (
    <div
      id={`callout-${type}-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'box'}`}
      className={`my-6 rounded-lg border-l-4 p-4 ${styles.border} ${styles.bg}`}
    >
      <div className="flex items-start space-x-3">
        <IconComponent className={`h-5 w-5 shrink-0 mt-0.5 ${styles.iconColor}`} />
        <div className="flex-1 text-sm leading-relaxed">
          {title && (
            <p className={`font-semibold mb-1 ${styles.text}`}>
              {title}
            </p>
          )}
          <p className={`${styles.text} opacity-95`}>{text}</p>
        </div>
      </div>
    </div>
  );
};
