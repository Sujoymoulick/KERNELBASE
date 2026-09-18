import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DocCallout } from '../../types/docs';

export const Callout: React.FC<DocCallout> = ({ type, title, text }) => {
  type StyleEntry = {
    leftBorder: string;
    iconColor: string;
    icon: React.ElementType;
  };

  const styleMap: Record<string, StyleEntry> = {
    note:      { leftBorder: 'var(--kb-accent-bright)', iconColor: 'var(--kb-accent-bright)', icon: Info },
    info:      { leftBorder: 'var(--kb-accent-bright)', iconColor: 'var(--kb-accent-bright)', icon: Info },
    important: { leftBorder: 'var(--kb-brand-secondary)', iconColor: '#FF6B35', icon: AlertCircle },
    warning:   { leftBorder: '#D97706', iconColor: '#F59E0B', icon: AlertTriangle },
    tip:       { leftBorder: 'var(--kb-accent-bright)', iconColor: 'var(--kb-accent-bright)', icon: CheckCircle2 },
  };

  const styles = styleMap[type] || styleMap.note;
  const IconComponent = styles.icon;

  return (
    <div
      id={`callout-${type}-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'box'}`}
      className="my-6 rounded-lg border-l-4 p-4 border"
      style={{
        borderLeftColor: styles.leftBorder,
        borderColor: 'var(--kb-border)',
        backgroundColor: 'var(--kb-surface-elevated)',
      }}
    >
      <div className="flex items-start space-x-3">
        <IconComponent className="h-5 w-5 shrink-0 mt-0.5" style={{ color: styles.iconColor }} />
        <div className="flex-1 text-sm leading-relaxed">
          {title && (
            <p className="font-semibold mb-1" style={{ color: 'var(--kb-text)' }}>
              {title}
            </p>
          )}
          <p style={{ color: 'var(--kb-text-muted)' }}>{text}</p>
        </div>
      </div>
    </div>
  );
};
