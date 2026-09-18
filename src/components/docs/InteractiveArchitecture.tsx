import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react';
import {
  Monitor,
  Globe,
  Terminal,
  Puzzle,
  Network,
  Code2,
  Search,
  Play,
  Zap,
  Wrench,
  Shield,
  Gauge,
  Activity,
  BookOpen,
  GitBranch,
  Database,
  Layers,
  Brain,
  BookMarked,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Expand,
  X,
  ChevronRight,
  Info,
  ArrowRight,
  ArrowLeftRight,
  Minus,
} from 'lucide-react';
import {
  ARCH_LAYERS,
  ARCH_NODES,
  ARCH_CONNECTIONS,
  PRESET_VIEWS,
  type ArchNode,
  type ArchLayer,
  type LayerColorTokens,
  type LayerId,
} from '../../data/architectureData';
import { useTheme } from '../../context/ThemeContext';

// ── Icon Registry ─────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, Globe, Terminal, Puzzle, Network, Code2, Search, Play, Zap,
  Wrench, Shield, Gauge, Activity, BookOpen, GitBranch, Database, Layers,
  Brain, BookMarked, Settings,
};

const NodeIcon = ({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const Icon = ICON_MAP[name] || Layers;
  if (style) return <span style={style}><Icon className={className} /></span>;
  return <Icon className={className} />;
};

// ── Theme surface tokens ──────────────────────────────────────
// All hardcoded dark hex values are replaced by a single object
// derived from isDark, used throughout every component.
interface SurfaceTokens {
  canvasBg: string;
  headerBg: string;
  headerBorder: string;
  panelBg: string;
  panelBorder: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  arrowColor: string;
  arrowLabelBg: string;
  legendBg: string;
  legendBorder: string;
  dimmedLayerBg: string;
  btnHoverBg: string;
  btnText: string;
  btnHoverText: string;
  nodeTitle: string;
  nodeActiveTitle: string;
  nodeSubtitle: string;
}

function buildSurfaceTokens(isDark: boolean): SurfaceTokens {
  if (isDark) {
    return {
      canvasBg: '#120704',
      headerBg: '#1A0B07',
      headerBorder: '#5A210F',
      panelBg: '#24100A',
      panelBorder: '#5A210F',
      divider: '#5A210F',
      textPrimary: '#F8F5F2',
      textSecondary: '#C4B7B0',
      textMuted: '#8E7D75',
      arrowColor: '#A64011',
      arrowLabelBg: '#1A0B07',
      legendBg: '#1A0B07',
      legendBorder: '#5A210F',
      dimmedLayerBg: 'rgba(26,11,7,0.55)',
      btnHoverBg: 'rgba(166,64,17,0.2)',
      btnText: '#A89B95',
      btnHoverText: '#F8F5F2',
      nodeTitle: '#F8F5F2',
      nodeActiveTitle: '#FFFFFF',
      nodeSubtitle: '#C4B7B0',
    };
  }
  return {
    canvasBg: '#FFFDFB',
    headerBg: '#FAF5F0',
    headerBorder: '#E6D3C8',
    panelBg: '#FFFFFF',
    panelBorder: '#E6D3C8',
    divider: '#E6D3C8',
    textPrimary: '#2E120A',
    textSecondary: '#6E4E42',
    textMuted: '#997B6F',
    arrowColor: '#A64011',
    arrowLabelBg: '#FAF5F0',
    legendBg: '#FAF5F0',
    legendBorder: '#E6D3C8',
    dimmedLayerBg: 'rgba(250,245,240,0.65)',
    btnHoverBg: 'rgba(166,64,17,0.08)',
    btnText: '#6E4E42',
    btnHoverText: '#2E120A',
    nodeTitle: '#2E120A',
    nodeActiveTitle: '#120704',
    nodeSubtitle: '#6E4E42',
  };
}

// ── Resolved layer colors (picks dark or light tokens) ────────
function resolveLayerColor(layer: ArchLayer, isDark: boolean): LayerColorTokens {
  return isDark ? layer.color : layer.lightColor;
}

// ── Helper ────────────────────────────────────────────────────
const getLayer = (id: LayerId): ArchLayer =>
  ARCH_LAYERS.find((l) => l.id === id)!;

// ─────────────────────────────────────────────────────────────
// Node Detail Panel
// ─────────────────────────────────────────────────────────────
interface NodeDetailPanelProps {
  node: ArchNode;
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
  isMobile: boolean;
  isDark: boolean;
  surface: SurfaceTokens;
}

const NodeDetailPanel = memo(({
  node,
  onClose,
  onNavigate,
  isMobile,
  isDark,
  surface,
}: NodeDetailPanelProps) => {
  const layer = getLayer(node.layerId);
  const c = resolveLayerColor(layer, isDark);
  const relatedNodes = ARCH_NODES.filter((n) => node.related.includes(n.id));

  const panelClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[65vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl animate-slide-up'
    : 'absolute top-4 right-4 z-40 w-72 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl border shadow-2xl animate-fade-in';

  return (
    <div
      className={`${panelClass}`}
      style={{
        background: surface.panelBg,
        borderColor: surface.panelBorder,
        boxShadow: `0 0 40px ${c.glow}, 0 25px 50px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)'}`,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${node.title} details`}
    >
      {/* Header */}
      <div
        className="sticky top-0 p-4 border-b flex items-start justify-between gap-2"
        style={{ background: c.nodeBg, borderColor: surface.panelBorder }}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="p-1.5 rounded-lg shrink-0 mt-0.5"
            style={{ background: `${c.accent}18`, border: `1px solid ${c.accent}30` }}
          >
            <NodeIcon name={node.icon} className="h-4 w-4" style={{ color: c.accent }} />
          </div>
          <div className="min-w-0">
            <h3
              className="text-sm font-semibold leading-tight"
              style={{ color: surface.textPrimary }}
            >
              {node.title}
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: c.accent }}>{node.subtitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md transition-colors shrink-0"
          style={{ color: surface.textMuted }}
          aria-label="Close detail panel"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Description */}
        <p className="text-[12px] leading-relaxed" style={{ color: surface.textSecondary }}>
          {node.description}
        </p>

        {/* Responsibilities */}
        <div>
          <h4
            className="text-[10px] font-semibold uppercase tracking-wider mb-2"
            style={{ color: surface.textMuted }}
          >
            Responsibilities
          </h4>
          <ul className="space-y-1">
            {node.responsibilities.map((r) => (
              <li key={r} className="flex items-start gap-1.5 text-[11px]" style={{ color: surface.textSecondary }}>
                <ChevronRight className="h-3 w-3 shrink-0 mt-0.5" style={{ color: c.accent }} />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Inputs & Outputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: surface.textMuted }}>Inputs</h4>
            {node.inputs.map((inp) => (
              <div key={inp} className="text-[11px] py-0.5" style={{ color: surface.textSecondary }}>{inp}</div>
            ))}
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: surface.textMuted }}>Outputs</h4>
            {node.outputs.map((out) => (
              <div key={out} className="text-[11px] py-0.5" style={{ color: surface.textSecondary }}>{out}</div>
            ))}
          </div>
        </div>

        {/* Related */}
        {relatedNodes.length > 0 && (
          <div>
            <h4
              className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: surface.textMuted }}
            >
              Related Components
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {relatedNodes.map((rel) => {
                const relC = resolveLayerColor(getLayer(rel.layerId), isDark);
                return (
                  <button
                    key={rel.id}
                    onClick={() => onNavigate(rel.id)}
                    className="px-2 py-0.5 rounded text-[11px] font-medium transition-all hover:opacity-80"
                    style={{
                      background: `${relC.accent}15`,
                      border: `1px solid ${relC.accent}30`,
                      color: relC.accent,
                    }}
                  >
                    {rel.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
NodeDetailPanel.displayName = 'NodeDetailPanel';

// ─────────────────────────────────────────────────────────────
// Architecture Node Card
// ─────────────────────────────────────────────────────────────
interface ArchNodeCardProps {
  node: ArchNode;
  c: LayerColorTokens;           // resolved (dark or light) color tokens
  surface: SurfaceTokens;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
  colSpan?: number;
}

const ArchNodeCard = memo(({
  node,
  c,
  surface,
  isSelected,
  isHighlighted,
  isDimmed,
  isHovered,
  onClick,
  onHover,
  colSpan,
}: ArchNodeCardProps) => {
  const isActive = isSelected || isHovered;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.title}: ${node.description}`}
      aria-pressed={isSelected}
      data-node-id={node.id}
      className="relative rounded-lg cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-2"
      style={{
        background: isActive ? `${c.accent}12` : c.nodeBg,
        borderTop: `1px solid ${isSelected ? c.accent : isHighlighted ? `${c.accent}60` : `${c.accent}28`}`,
        borderRight: `1px solid ${isSelected ? c.accent : isHighlighted ? `${c.accent}60` : `${c.accent}28`}`,
        borderBottom: `1px solid ${isSelected ? c.accent : isHighlighted ? `${c.accent}60` : `${c.accent}28`}`,
        borderLeft: `3px solid ${isActive ? c.accent : isHighlighted ? `${c.accent}80` : `${c.accent}45`}`,
        opacity: isDimmed ? 0.3 : 1,
        boxShadow: isSelected
          ? `0 0 16px ${c.glow}, 0 0 4px ${c.accent}20`
          : isHovered
          ? `0 0 10px ${c.glow}`
          : 'none',
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        ['--tw-ring-color' as string]: c.accent,
        transform: isHovered && !isSelected ? 'translateY(-1px)' : 'none',
      }}
      onClick={() => onClick(node.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="p-3">
        <div className="flex items-start gap-2 mb-1.5">
          <div
            className="p-1 rounded-md shrink-0 mt-0.5"
            style={{
              background: isActive ? `${c.accent}25` : `${c.accent}12`,
              border: `1px solid ${c.accent}25`,
            }}
          >
            <NodeIcon
              name={node.icon}
              className="h-3.5 w-3.5 transition-colors"
              style={{ color: isActive ? c.accent : `${c.accent}cc` }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[12px] font-semibold leading-tight transition-colors"
              style={{ color: isActive ? surface.nodeActiveTitle : surface.nodeTitle }}
            >
              {node.title}
            </div>
            <div
              className="text-[10px] mt-0.5 leading-tight truncate"
              style={{ color: surface.nodeSubtitle }}
            >
              {node.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Selected dot */}
      {isSelected && (
        <div
          className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
          style={{ background: c.accent }}
        />
      )}
    </div>
  );
});
ArchNodeCard.displayName = 'ArchNodeCard';

// ─────────────────────────────────────────────────────────────
// Flow Arrow between layers
// ─────────────────────────────────────────────────────────────
const FlowArrow = ({
  label,
  surface,
  dashed = false,
  bidirectional = false,
}: {
  label?: string;
  surface: SurfaceTokens;
  dashed?: boolean;
  bidirectional?: boolean;
}) => (
  <div className="flex items-center justify-center py-1">
    <div className="flex flex-col items-center gap-1">
      {bidirectional && (
        <svg width="16" height="10" className="opacity-70">
          <line x1="8" y1="1" x2="8" y2="9" stroke={surface.arrowColor} strokeWidth="1.5"
            strokeDasharray={dashed ? '3,2' : undefined} />
          <polyline points="4,4 8,1 12,4" fill="none" stroke={surface.arrowColor} strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )}
      <svg width="16" height="24" className="opacity-70">
        <line x1="8" y1="0" x2="8" y2="18" stroke={surface.arrowColor} strokeWidth="1.5"
          strokeDasharray={dashed ? '3,2' : undefined} />
        <polyline points="4,14 8,20 12,14" fill="none" stroke={surface.arrowColor} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      {label && (
        <span
          className="text-[9px] font-mono px-1 rounded"
          style={{ color: surface.textMuted, background: surface.arrowLabelBg }}
        >
          {label}
        </span>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Layer Container (used for Runtime + mobile UI/Data/Integrations)
// ─────────────────────────────────────────────────────────────
interface LayerContainerProps {
  layer: ArchLayer;
  nodes: ArchNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedNodes: Set<string>;
  hasSelection: boolean;
  onNodeClick: (id: string) => void;
  onNodeHover: (id: string | null) => void;
  isDark: boolean;
  surface: SurfaceTokens;
}

const LayerContainer = memo(({
  layer,
  nodes,
  selectedNodeId,
  hoveredNodeId,
  highlightedNodes,
  hasSelection,
  onNodeClick,
  onNodeHover,
  isDark,
  surface,
}: LayerContainerProps) => {
  const c = resolveLayerColor(layer, isDark);
  const isLayerDimmed = hasSelection && !nodes.some(
    (n) => n.id === selectedNodeId || highlightedNodes.has(n.id)
  );

  return (
    <div
      className="rounded-xl transition-all duration-300"
      style={{
        background: isLayerDimmed ? surface.dimmedLayerBg : c.bg,
        border: `1px solid ${isLayerDimmed ? surface.divider : `${c.accent}35`}`,
        boxShadow: isLayerDimmed ? 'none' : `0 0 28px ${c.glow}`,
        opacity: isLayerDimmed ? 0.5 : 1,
      }}
    >
      <div
        className="px-4 pt-3 pb-2 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.badgeText }}>
            {layer.title}
          </span>
          <span className="text-[10px] hidden sm:inline" style={{ color: surface.textMuted }}>
            — {layer.subtitle}
          </span>
        </div>
      </div>
      <div className="p-3 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isHovered = node.id === hoveredNodeId;
          const isHighlighted = highlightedNodes.has(node.id);
          const isDimmed = hasSelection && !isSelected && !isHighlighted;
          return (
            <ArchNodeCard
              key={node.id}
              node={node}
              c={c}
              surface={surface}
              isSelected={isSelected}
              isHighlighted={isHighlighted}
              isDimmed={isDimmed}
              isHovered={isHovered}
              onClick={onNodeClick}
              onHover={onNodeHover}
              colSpan={node.colSpan}
            />
          );
        })}
      </div>
    </div>
  );
});
LayerContainer.displayName = 'LayerContainer';

// ─────────────────────────────────────────────────────────────
// Sidebar Layer (compact vertical strip for UI/Data/Integrations)
// ─────────────────────────────────────────────────────────────
interface SideLayerProps {
  layerId: LayerId;
  label: string;
  sublabel: string;
  nodes: ArchNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedNodes: Set<string>;
  hasSelection: boolean;
  onNodeClick: (id: string) => void;
  onNodeHover: (id: string | null) => void;
  isDark: boolean;
  surface: SurfaceTokens;
}

const SideLayer = memo(({
  layerId,
  label,
  sublabel,
  nodes,
  selectedNodeId,
  hoveredNodeId,
  highlightedNodes,
  hasSelection,
  onNodeClick,
  onNodeHover,
  isDark,
  surface,
}: SideLayerProps) => {
  const layer = getLayer(layerId);
  const c = resolveLayerColor(layer, isDark);
  const isLayerDimmed = hasSelection && !nodes.some(
    (n) => n.id === selectedNodeId || highlightedNodes.has(n.id)
  );

  return (
    <div
      className="rounded-xl transition-all duration-300"
      style={{
        background: isLayerDimmed ? surface.dimmedLayerBg : c.bg,
        border: `1px solid ${isLayerDimmed ? surface.divider : `${c.accent}35`}`,
        boxShadow: isLayerDimmed ? 'none' : `0 0 28px ${c.glow}`,
        opacity: isLayerDimmed ? 0.5 : 1,
      }}
    >
      <div
        className="px-3 pt-2.5 pb-2 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: c.badgeText }}>
            {label}
          </span>
        </div>
        <p className="text-[9px] mt-0.5" style={{ color: surface.textMuted }}>{sublabel}</p>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {nodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isHovered = node.id === hoveredNodeId;
          const isHighlighted = highlightedNodes.has(node.id);
          const isDimmed = hasSelection && !isSelected && !isHighlighted;
          return (
            <ArchNodeCard
              key={node.id}
              node={node}
              c={c}
              surface={surface}
              isSelected={isSelected}
              isHighlighted={isHighlighted}
              isDimmed={isDimmed}
              isHovered={isHovered}
              onClick={onNodeClick}
              onHover={onNodeHover}
            />
          );
        })}
      </div>
    </div>
  );
});
SideLayer.displayName = 'SideLayer';

// ─────────────────────────────────────────────────────────────
// Legend
// ─────────────────────────────────────────────────────────────
const Legend = ({ isDark, surface }: { isDark: boolean; surface: SurfaceTokens }) => (
  <div
    className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 rounded-lg text-[10px]"
    style={{ background: surface.legendBg, border: `1px solid ${surface.legendBorder}` }}
  >
    <span className="font-semibold uppercase tracking-wide shrink-0" style={{ color: surface.textMuted }}>Legend</span>
    {ARCH_LAYERS.map((l) => {
      const c = resolveLayerColor(l, isDark);
      return (
        <span key={l.id} className="flex items-center gap-1.5 shrink-0">
          <span className="h-2 w-2 rounded-sm" style={{ background: c.accent }} />
          <span style={{ color: surface.textSecondary }}>{l.title.split(' ')[0]}</span>
        </span>
      );
    })}
    <span className="w-px h-3 mx-0.5" style={{ background: surface.divider }} />
    <span className="flex items-center gap-1" style={{ color: surface.textSecondary }}>
      <ArrowRight className="h-2.5 w-2.5" style={{ color: surface.textMuted }} />
      Primary flow
    </span>
    <span className="flex items-center gap-1" style={{ color: surface.textSecondary }}>
      <ArrowLeftRight className="h-2.5 w-2.5" style={{ color: surface.textMuted }} />
      Bidirectional
    </span>
    <span className="flex items-center gap-1" style={{ color: surface.textSecondary }}>
      <Minus className="h-2.5 w-2.5" style={{ color: surface.textMuted }} />
      Secondary
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Orchestration Layer (special layout: Planner → 3 agents → Bus)
// ─────────────────────────────────────────────────────────────
interface OrchLayerProps {
  nodes: ArchNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  highlightedNodes: Set<string>;
  hasSelection: boolean;
  onNodeClick: (id: string) => void;
  onNodeHover: (id: string | null) => void;
  isDark: boolean;
  surface: SurfaceTokens;
}

const OrchLayer = memo(({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  highlightedNodes,
  hasSelection,
  onNodeClick,
  onNodeHover,
  isDark,
  surface,
}: OrchLayerProps) => {
  const layer = getLayer('orchestration');
  const c = resolveLayerColor(layer, isDark);
  const isLayerDimmed = hasSelection && !nodes.some(
    (n) => n.id === selectedNodeId || highlightedNodes.has(n.id)
  );

  const mkCard = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;
    const isSelected = node.id === selectedNodeId;
    const isHovered = node.id === hoveredNodeId;
    const isHighlighted = highlightedNodes.has(node.id);
    const isDimmed = hasSelection && !isSelected && !isHighlighted;
    return (
      <ArchNodeCard
        key={node.id}
        node={node}
        c={c}
        surface={surface}
        isSelected={isSelected}
        isHighlighted={isHighlighted}
        isDimmed={isDimmed}
        isHovered={isHovered}
        onClick={onNodeClick}
        onHover={onNodeHover}
        colSpan={node.colSpan}
      />
    );
  };

  return (
    <div
      className="rounded-xl transition-all duration-300"
      style={{
        background: isLayerDimmed ? surface.dimmedLayerBg : c.bg,
        border: `1px solid ${isLayerDimmed ? surface.divider : `${c.accent}35`}`,
        boxShadow: isLayerDimmed ? 'none' : `0 0 28px ${c.glow}`,
        opacity: isLayerDimmed ? 0.5 : 1,
      }}
    >
      <div
        className="px-4 pt-3 pb-2 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.badgeText }}>
            Agent Orchestration Layer
          </span>
          <span className="text-[10px] hidden sm:inline" style={{ color: surface.textMuted }}>
            — coordinates agents, tasks &amp; lifecycle
          </span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {/* Planner (full-width) */}
        {mkCard('planner')}
        {/* 3 agents */}
        <div className="grid grid-cols-3 gap-2">
          {mkCard('code-agent')}
          {mkCard('research-agent')}
          {mkCard('executor-agent')}
        </div>
        {/* Comm bus (full-width) */}
        {mkCard('comm-bus')}
      </div>
    </div>
  );
});
OrchLayer.displayName = 'OrchLayer';

// ─────────────────────────────────────────────────────────────
// Toolbar Button helper
// ─────────────────────────────────────────────────────────────
const ToolbarBtn = ({
  onClick,
  title,
  label,
  surface,
  children,
  active = false,
}: {
  onClick: () => void;
  title: string;
  label: string;
  surface: SurfaceTokens;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    aria-label={label}
    className="p-1.5 rounded-md transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center text-[11px]"
    style={{
      color: active ? surface.textPrimary : surface.btnText,
      background: active ? surface.btnHoverBg : 'transparent',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = surface.btnHoverBg;
      (e.currentTarget as HTMLButtonElement).style.color = surface.btnHoverText;
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = active ? surface.btnHoverBg : 'transparent';
      (e.currentTarget as HTMLButtonElement).style.color = active ? surface.textPrimary : surface.btnText;
    }}
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────────────────────
// Main Interactive Architecture Explorer
// ─────────────────────────────────────────────────────────────
interface InteractiveArchitectureProps {
  isDark?: boolean;
}

export const InteractiveArchitecture: React.FC<InteractiveArchitectureProps> = ({ isDark: propIsDark }) => {
  // Resolve theme: prop > context
  const themeCtx = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeCtx.isDark;

  // Surface tokens (re-computed when theme changes)
  const surface = useMemo(() => buildSurfaceTokens(isDark), [isDark]);

  // ── State ─────────────────────────────────────────────────
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // ── Responsive ────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Preset ────────────────────────────────────────────────
  const currentPreset = useMemo(
    () => PRESET_VIEWS.find((p) => p.id === activePreset) || PRESET_VIEWS[0],
    [activePreset]
  );

  const highlightedNodes = useMemo<Set<string>>(() => {
    if (!selectedNode) {
      if (currentPreset.id === 'overview') return new Set<string>();
      return new Set(currentPreset.highlightNodes);
    }
    const connected = new Set<string>([selectedNode]);
    ARCH_CONNECTIONS.forEach((c) => {
      if (c.source === selectedNode) connected.add(c.target);
      if (c.target === selectedNode) connected.add(c.source);
    });
    return connected;
  }, [selectedNode, currentPreset]);

  const hasSelection = selectedNode !== null
    || (currentPreset.id !== 'overview' && currentPreset.highlightNodes.length > 0);

  // ── Node interaction ──────────────────────────────────────
  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode((prev) => (prev === id ? null : id));
  }, []);
  const handleNodeHover = useCallback((id: string | null) => setHoveredNode(id), []);
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    setSelectedNode(null);
  }, []);
  const handleClosePanel = useCallback(() => setSelectedNode(null), []);
  const handlePanelNavigate = useCallback((nodeId: string) => setSelectedNode(nodeId), []);

  // ── Pan/Zoom ──────────────────────────────────────────────
  const clampZoom = (z: number) => Math.min(2, Math.max(0.25, z));

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      setZoom((z) => clampZoom(z - e.deltaY * 0.01));
    } else {
      setPanY((p) => p - e.deltaY * 0.6);
      setPanX((p) => p - e.deltaX * 0.6);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    panStartRef.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
    setIsPanning(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [panX, panY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning || !panStartRef.current) return;
    setPanX(panStartRef.current.px + (e.clientX - panStartRef.current.x));
    setPanY(panStartRef.current.py + (e.clientY - panStartRef.current.y));
  }, [isPanning]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const lastTouchDist = useRef<number | null>(null);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastTouchDist.current !== null) {
        setZoom((z) => clampZoom(z + (dist - lastTouchDist.current!) * 0.005));
      }
      lastTouchDist.current = dist;
    }
  }, []);
  const handleTouchEnd = useCallback(() => { lastTouchDist.current = null; }, []);

  const handleFitView = useCallback(() => { setZoom(1); setPanX(0); setPanY(0); }, []);
  const handleReset = useCallback(() => {
    setZoom(1); setPanX(0); setPanY(0);
    setSelectedNode(null); setActivePreset('overview');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelectedNode(null); setIsFullscreen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    setFocusMode((prev) => !prev);
  }, []);

  // ── Node grouping ─────────────────────────────────────────
  const nodesByLayer = useMemo(() => {
    const map: Record<LayerId, ArchNode[]> = {
      ui: [], orchestration: [], runtime: [], data: [], integrations: [],
    };
    ARCH_NODES.forEach((n) => map[n.layerId].push(n));
    return map;
  }, []);

  const selectedNodeData = selectedNode
    ? ARCH_NODES.find((n) => n.id === selectedNode) ?? null
    : null;

  const transitionClass = prefersReducedMotion ? '' : 'transition-all duration-300';

  // Shared props for all node interaction callbacks
  const nodeProps = {
    selectedNodeId: selectedNode,
    hoveredNodeId: hoveredNode,
    highlightedNodes,
    hasSelection,
    onNodeClick: handleNodeClick,
    onNodeHover: handleNodeHover,
    isDark,
    surface,
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative my-8'} flex flex-col`}
      style={{
        background: surface.canvasBg,
        ...(isFullscreen ? {} : {
          borderRadius: '1rem',
          overflow: 'hidden',
          border: `1px solid ${surface.headerBorder}`,
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.08)',
        }),
      }}
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div
        className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 border-b"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className="p-1.5 rounded-lg border"
            style={{
              background: isDark ? 'rgba(166,64,17,0.2)' : 'rgba(166,64,17,0.08)',
              borderColor: surface.headerBorder,
            }}
          >
            <Network className="h-4 w-4" style={{ color: isDark ? '#E86526' : '#C84B19' }} />
          </div>
          <div>
            <h2
              className="text-[13px] font-bold tracking-tight"
              style={{ color: surface.textPrimary }}
            >
              SYSTEM ARCHITECTURE
            </h2>
            <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: surface.textSecondary }}>
              High-level architecture of the AI-Native Multi-Agent IDE
            </p>
          </div>
          <span
            className="ml-auto sm:ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium shrink-0 font-mono"
            style={isDark ? {
              background: '#24100A',
              border: '1px solid #5A210F',
              color: '#E86526',
            } : {
              background: 'rgba(166,64,17,0.08)',
              border: '1px solid #E6D3C8',
              color: '#C84B19',
            }}
          >
            Updated September 2026
          </span>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-0.5 shrink-0 self-end sm:self-auto"
          role="toolbar"
          aria-label="Diagram controls"
        >
          <ToolbarBtn onClick={() => setZoom((z) => clampZoom(z - 0.15))} title="Zoom out" label="Zoom out" surface={surface}>
            <ZoomOut className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-0.5 rounded text-[11px] font-mono transition-colors min-h-[32px] min-w-[44px]"
            aria-label={`Zoom ${Math.round(zoom * 100)}%. Click to reset`}
            style={{ color: surface.btnText }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolbarBtn onClick={() => setZoom((z) => clampZoom(z + 0.15))} title="Zoom in" label="Zoom in" surface={surface}>
            <ZoomIn className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <div className="w-px h-4 mx-0.5" style={{ background: surface.divider }} />

          <ToolbarBtn onClick={handleFitView} title="Fit view" label="Fit view" surface={surface}>
            <span className="text-[11px] px-0.5">Fit</span>
          </ToolbarBtn>
          <ToolbarBtn onClick={handleReset} title="Reset" label="Reset diagram" surface={surface}>
            <RotateCcw className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn onClick={handleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} surface={surface}>
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </ToolbarBtn>
        </div>
      </div>

      {/* ── Preset tabs ─────────────────────────────────── */}
      <div
        className="px-4 sm:px-5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
        role="tablist"
        aria-label="Architecture preset views"
      >
        <span
          className="text-[10px] font-semibold uppercase tracking-wide shrink-0 mr-1"
          style={{ color: surface.textMuted }}
        >
          View:
        </span>
        {PRESET_VIEWS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => { setActivePreset(preset.id); setSelectedNode(null); }}
              className="px-3 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all shrink-0"
              style={isActive ? {
                background: isDark ? 'rgba(166,64,17,0.25)' : 'rgba(166,64,17,0.12)',
                color: surface.textPrimary,
                border: `1px solid ${isDark ? '#E86526' : '#C84B19'}`,
                fontWeight: 600,
              } : {
                color: surface.textSecondary,
                border: '1px solid transparent',
              }}
              title={preset.description}
            >
              {preset.label}
            </button>
          );
        })}

        {/* Focus mode */}
        <button
          onClick={() => setFocusMode((p) => !p)}
          className="ml-auto px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 border"
          style={focusMode ? {
            background: 'rgba(166,64,17,0.25)',
            color: '#F8F5F2',
            borderColor: '#E86526',
          } : {
            color: surface.textMuted,
            borderColor: 'transparent',
          }}
          aria-pressed={focusMode}
          title="Focus mode"
        >
          <Expand className="h-3 w-3" />
          <span className="hidden sm:inline">Focus</span>
        </button>
      </div>

      {/* ── Canvas ──────────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ minHeight: isFullscreen ? 0 : isMobile ? 560 : 680, background: surface.canvasBg }}
        onClick={handleCanvasClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="region"
        aria-label="Interactive architecture diagram. Click and drag to pan, scroll to zoom."
      >
        {/* Transform canvas */}
        <div
          ref={canvasRef}
          className={transitionClass}
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: 'top center',
            padding: '24px',
            willChange: 'transform',
          }}
        >
          {/* Description */}
          <div className="max-w-3xl mx-auto mb-5">
            <p
              className="text-[12px] leading-relaxed text-center"
              style={{ color: surface.textSecondary }}
            >
              Kernel Base uses a modular multi-plane architecture that separates interface, agent orchestration,
              execution, state, and external integrations.
            </p>
          </div>

          {/* ── 3-column desktop layout ─────────────────── */}
          <div className="flex gap-4 max-w-[1200px] mx-auto">

            {/* Left: UI + Data */}
            <div className="hidden lg:flex flex-col gap-3 w-[200px] shrink-0">
              <SideLayer
                layerId="ui"
                label="User Interface"
                sublabel="Entry points"
                nodes={nodesByLayer['ui']}
                {...nodeProps}
              />
              <FlowArrow surface={surface} />
              <SideLayer
                layerId="data"
                label="Data & State"
                sublabel="Persistence & memory"
                nodes={nodesByLayer['data']}
                {...nodeProps}
              />
            </div>

            {/* Center: Orchestration + Runtime */}
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {/* Mobile UI */}
              <div className="lg:hidden">
                <LayerContainer layer={getLayer('ui')} nodes={nodesByLayer['ui']} {...nodeProps} />
                <FlowArrow surface={surface} />
              </div>

              <OrchLayer nodes={nodesByLayer['orchestration']} {...nodeProps} />
              <FlowArrow surface={surface} label="execute" />
              <LayerContainer layer={getLayer('runtime')} nodes={nodesByLayer['runtime']} {...nodeProps} />
              <FlowArrow surface={surface} label="persist" bidirectional />

              {/* Mobile Data */}
              <div className="lg:hidden">
                <LayerContainer layer={getLayer('data')} nodes={nodesByLayer['data']} {...nodeProps} />
              </div>
            </div>

            {/* Right: Integrations */}
            <div className="hidden lg:flex flex-col w-[200px] shrink-0">
              <SideLayer
                layerId="integrations"
                label="Integrations"
                sublabel="External services"
                nodes={nodesByLayer['integrations']}
                {...nodeProps}
              />
            </div>
          </div>

          {/* Mobile Integrations */}
          <div className="lg:hidden mt-3 max-w-[1200px] mx-auto">
            <FlowArrow surface={surface} bidirectional />
            <LayerContainer layer={getLayer('integrations')} nodes={nodesByLayer['integrations']} {...nodeProps} />
          </div>

          {/* Legend */}
          <div className="mt-5 max-w-[1200px] mx-auto">
            <Legend isDark={isDark} surface={surface} />
          </div>

          {/* Hint */}
          <div className="mt-3 text-center">
            <p className="text-[10px]" style={{ color: surface.textMuted }}>
              <Info className="h-3 w-3 inline mr-1 opacity-50" />
              Click any component to explore · Drag to pan · Scroll to zoom
            </p>
          </div>
        </div>

        {/* Desktop detail panel */}
        {selectedNodeData && !isMobile && (
          <NodeDetailPanel
            node={selectedNodeData}
            onClose={handleClosePanel}
            onNavigate={handlePanelNavigate}
            isMobile={false}
            isDark={isDark}
            surface={surface}
          />
        )}
      </div>

      {/* Mobile bottom sheet */}
      {selectedNodeData && isMobile && (
        <NodeDetailPanel
          node={selectedNodeData}
          onClose={handleClosePanel}
          onNavigate={handlePanelNavigate}
          isMobile={true}
          isDark={isDark}
          surface={surface}
        />
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        className="px-4 sm:px-5 py-2 border-t flex items-center justify-between text-[10px] shrink-0"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder, color: surface.textMuted }}
      >
        <span>
          {ARCH_NODES.length} components · {ARCH_CONNECTIONS.length} connections · {ARCH_LAYERS.length} layers
        </span>
        <span className="font-mono hidden sm:inline">
          AI-Native Multi-Agent IDE · Kernel Base
        </span>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes kb-fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kb-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in  { animation: kb-fade-in  0.2s ease-out; }
        .animate-slide-up { animation: kb-slide-up 0.25s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in, .animate-slide-up { animation: none; }
        }
      `}</style>
    </div>
  );
};

export default InteractiveArchitecture;
