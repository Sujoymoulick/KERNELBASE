import React from 'react';

/** Outline icon set (24px grid, stroke = currentColor). */
const P: Record<string, string> = {
  files: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  git: 'M6 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM18 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 8v8M18 10c0 4-6 3-10 6',
  runDebug: 'M8 5v14l11-7zM3 3l2 2M3 21l2-2',
  extensions: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  agents: 'M6 6h12v12H6zM10 10h4v4h-4zM9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4',
  account: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 6 6 6-6 6',
  chevronLeft: 'm15 6-6 6 6 6',
  chevronUp: 'm6 15 6-6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  split: 'M3 4h18v16H3zM12 4v16',
  sidebarLeft: 'M3 4h18v16H3zM9 4v16',
  sidebarRight: 'M3 4h18v16H3zM15 4v16',
  panelBottom: 'M3 4h18v16H3zM3 14h18',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  newFile: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 11v6M9 14h6',
  newFolder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 10v6M9 13h6',
  refresh: 'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
  collapse: 'M7 9h10M7 15h10M4 4h16v16H4z',
  terminal: 'm5 8 4 4-4 4M12 17h7',
  play: 'M8 5v14l11-7z',
  stop: 'M6 6h12v12H6z',
  build: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  beaker: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3',
  check: 'M5 12l5 5 9-10',
  error: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6',
  warning: 'M12 3 2 20h20zM12 10v4M12 17v.5',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8v.5',
  upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  code: 'm8 8-4 4 4 4M16 8l4 4-4 4',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4zM10 21h4',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  sync: 'M4 12a8 8 0 0 1 14-5.3M20 4v4h-4M20 12a8 8 0 0 1-14 5.3M4 20v-4h4',
  minus: 'M5 12h14',
  undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17l10 5 10-5',
  pipeline: 'M5 6h4v4H5zM15 14h4v4h-4zM9 8h3a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  send: 'M4 12 20 4l-6 16-3-7zM11 13l9-9',
  logo: 'M5 2.5h14a2.5 2.5 0 0 1 2.5 2.5v14a2.5 2.5 0 0 1-2.5 2.5H5A2.5 2.5 0 0 1 2.5 19V5A2.5 2.5 0 0 1 5 2.5zM8.5 7v10M8.5 12.5 15 7M11 10.5 15.5 17',
};

export type IconName = keyof typeof P;

export const Icon: React.FC<{ name: IconName | string; size?: number; className?: string; stroke?: number; style?: React.CSSProperties; fill?: boolean }> = ({
  name,
  size = 16,
  className,
  stroke = 1.6,
  style,
  fill,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill ? 'currentColor' : 'none'}
    stroke={fill ? 'none' : 'currentColor'}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ flexShrink: 0, ...style }}
    aria-hidden="true"
  >
    <path d={P[name] || P.doc} />
  </svg>
);

/** Small coloured file-type tag used in Explorer, tabs and quick open. */
const TAGS: Record<string, [string, string, string]> = {
  // ext: [label, dark colour, light colour]
  ts: ['TS', '#4daafc', '#005fb8'],
  tsx: ['TSX', '#4daafc', '#005fb8'],
  js: ['JS', '#cbcb41', '#8a6d00'],
  jsx: ['JSX', '#cbcb41', '#8a6d00'],
  mjs: ['JS', '#cbcb41', '#8a6d00'],
  cjs: ['JS', '#cbcb41', '#8a6d00'],
  json: ['{ }', '#cbcb41', '#8a6d00'],
  md: ['MD', '#519aba', '#2b6a8a'],
  py: ['PY', '#3fa4d6', '#2b6a8a'],
  c: ['C', '#7aa2e3', '#3355aa'],
  h: ['H', '#a074c4', '#6f42c1'],
  cpp: ['C++', '#7aa2e3', '#3355aa'],
  cc: ['C++', '#7aa2e3', '#3355aa'],
  hpp: ['H++', '#a074c4', '#6f42c1'],
  java: ['JV', '#e37933', '#b45309'],
  go: ['GO', '#519aba', '#2b6a8a'],
  rs: ['RS', '#e37933', '#b45309'],
  html: ['<>', '#e37933', '#b45309'],
  css: ['#', '#519aba', '#2b6a8a'],
  scss: ['#', '#f55385', '#b42a5c'],
  sh: ['$', '#89d185', '#388a34'],
  yml: ['YML', '#a074c4', '#6f42c1'],
  yaml: ['YML', '#a074c4', '#6f42c1'],
  swift: ['SW', '#e37933', '#b45309'],
  kt: ['KT', '#a074c4', '#6f42c1'],
  sql: ['SQL', '#f55385', '#b42a5c'],
  txt: ['TXT', '#9d9d9d', '#616161'],
  pdf: ['PDF', '#f85149', '#cf222e'],
  png: ['IMG', '#a074c4', '#6f42c1'],
  jpg: ['IMG', '#a074c4', '#6f42c1'],
  svg: ['SVG', '#cbcb41', '#8a6d00'],
};

export function fileTag(name: string, theme: 'dark' | 'light') {
  const lower = name.toLowerCase();
  if (lower === 'dockerfile') return { label: 'DK', color: theme === 'dark' ? '#4daafc' : '#005fb8' };
  if (lower.startsWith('.git')) return { label: 'GIT', color: theme === 'dark' ? '#e37933' : '#b45309' };
  const ext = lower.includes('.') ? lower.split('.').pop()! : '';
  const t = TAGS[ext];
  if (!t) return { label: '', color: 'var(--muted)' };
  return { label: t[0], color: theme === 'dark' ? t[1] : t[2] };
}

export const FileTag: React.FC<{ name: string; theme: 'dark' | 'light' }> = ({ name, theme }) => {
  const t = fileTag(name, theme);
  return (
    <span className="kb-file-tag" style={{ color: t.color }}>
      {t.label || <Icon name="doc" size={13} stroke={1.5} style={{ color: 'var(--muted)' }} />}
    </span>
  );
};

/** The Kernel Base logo (samurai and sun). Small, pre-scaled copies of public/logo.png keep it crisp and light. */
export const BrandLogo: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 16, className, style }) => (
  <img
    src={size > 48 ? './logo-256.png' : './logo-64.png'}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    draggable={false}
    className={`kb-logo ${className || ''}`}
    style={{ width: size, height: size, objectFit: 'contain', flex: 'none', ...style }}
  />
);
