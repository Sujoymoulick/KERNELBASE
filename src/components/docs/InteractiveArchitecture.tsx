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
  ChevronDown,
  Info,
  ArrowRight,
  ArrowLeftRight,
  Minus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sliders,
  Lock,
  Cpu,
  Server,
  FileCode,
  Sparkles,
  HelpCircle,
  Eye,
  Workflow,
  Check,
  Building2,
} from 'lucide-react';
import {
  ARCH_LAYERS,
  ARCH_NODES,
  ARCH_CONNECTIONS,
  PRESET_VIEWS,
  SIMULATED_EXECUTION_DATA,
  MODEL_FLOW_STEPS,
  SECURITY_PIPELINE_STAGES,
  type ArchNode,
  type ArchLayer,
  type ArchConnection,
  type LayerColorTokens,
  type LayerId,
  type NodeStatus,
  type NodeType,
  type SimulatedAgentExecution,
} from '../../data/architectureData';
import { useTheme } from '../../context/ThemeContext';

// ── Icon Registry ─────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, Globe, Terminal, Puzzle, Network, Code2, Search, Play, Zap,
  Wrench, Shield, Gauge, Activity, BookOpen, GitBranch, Database, Layers,
  Brain, BookMarked, Settings, Lock, Cpu, Server, FileCode, Sparkles, Building2,
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
  if (style) return <span style={style} className="inline-flex items-center justify-center"><Icon className={className} /></span>;
  return <Icon className={className} />;
};

// ── Surface Tokens ────────────────────────────────────────────
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
  chipBg: string;
  chipBorder: string;
  searchBg: string;
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
      arrowColor: '#E86526',
      arrowLabelBg: '#1A0B07',
      legendBg: '#1A0B07',
      legendBorder: '#5A210F',
      dimmedLayerBg: 'rgba(26,11,7,0.55)',
      btnHoverBg: 'rgba(166,64,17,0.25)',
      btnText: '#A89B95',
      btnHoverText: '#F8F5F2',
      nodeTitle: '#F8F5F2',
      nodeActiveTitle: '#FFFFFF',
      nodeSubtitle: '#C4B7B0',
      chipBg: '#2E140C',
      chipBorder: '#5A210F',
      searchBg: '#1A0B07',
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
    arrowColor: '#C84B19',
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
    chipBg: '#F5ECE5',
    chipBorder: '#E6D3C8',
    searchBg: '#FFFFFF',
  };
}

function resolveLayerColor(layer: ArchLayer, isDark: boolean): LayerColorTokens {
  return isDark ? layer.color : layer.lightColor;
}

const getLayer = (id: LayerId): ArchLayer =>
  ARCH_LAYERS.find((l) => l.id === id) || ARCH_LAYERS[0];

// ── Status & Type Badges ──────────────────────────────────────
const StatusBadge = ({ status, isDark }: { status: NodeStatus; isDark: boolean }) => {
  const styles: Record<NodeStatus, { bg: string; text: string; border: string }> = {
    Implemented: {
      bg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
      text: isDark ? '#34D399' : '#059669',
      border: isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)',
    },
    'In Development': {
      bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
      text: isDark ? '#FBBF24' : '#D97706',
      border: isDark ? 'rgba(245,158,11,0.3)' : 'rgba(245,158,11,0.2)',
    },
    Planned: {
      bg: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
      text: isDark ? '#A78BFA' : '#7C3AED',
      border: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)',
    },
    Proposed: {
      bg: isDark ? 'rgba(107,114,128,0.15)' : 'rgba(107,114,128,0.1)',
      text: isDark ? '#9CA3AF' : '#6B7280',
      border: isDark ? 'rgba(107,114,128,0.3)' : 'rgba(107,114,128,0.2)',
    },
  };
  const s = styles[status] || styles['Proposed'];
  return (
    <span
      className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.text }} />
      {status}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// COMPONENT DETAIL PANEL (Inspector)
// ─────────────────────────────────────────────────────────────
interface NodeDetailPanelProps {
  node: ArchNode;
  onClose: () => void;
  onNavigateToNode: (nodeId: string) => void;
  onNavigateToDoc?: (slug: string) => void;
  isMobile: boolean;
  isDark: boolean;
  surface: SurfaceTokens;
}

const NodeDetailPanel = memo(({
  node,
  onClose,
  onNavigateToNode,
  onNavigateToDoc,
  isMobile,
  isDark,
  surface,
}: NodeDetailPanelProps) => {
  const layer = getLayer(node.layerId);
  const c = resolveLayerColor(layer, isDark);
  const relatedNodes = ARCH_NODES.filter((n) => node.related.includes(n.id));

  // Upstream (inputs) & Downstream (outputs) connected nodes
  const upstreamNodes = useMemo(() => {
    const ids = ARCH_CONNECTIONS.filter((conn) => conn.target === node.id).map((conn) => conn.source);
    return ARCH_NODES.filter((n) => ids.includes(n.id));
  }, [node.id]);

  const downstreamNodes = useMemo(() => {
    const ids = ARCH_CONNECTIONS.filter((conn) => conn.source === node.id).map((conn) => conn.target);
    return ARCH_NODES.filter((n) => ids.includes(n.id));
  }, [node.id]);

  const panelClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl animate-slide-up'
    : 'absolute top-4 right-4 z-40 w-84 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl border shadow-2xl animate-fade-in custom-scrollbar';

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
        className="sticky top-0 p-4 border-b flex items-start justify-between gap-2 z-10"
        style={{ background: c.nodeBg, borderColor: surface.panelBorder }}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="p-2 rounded-lg shrink-0 mt-0.5"
            style={{ background: `${c.accent}18`, border: `1px solid ${c.accent}30` }}
          >
            <NodeIcon name={node.icon} className="h-4 w-4" style={{ color: c.accent }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold leading-tight" style={{ color: surface.textPrimary }}>
                {node.title}
              </h3>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: c.accent }}>{node.subtitle}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={node.status} isDark={isDark} />
              <span className="text-[9px] uppercase tracking-wider font-mono" style={{ color: surface.textMuted }}>
                {layer.title}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md transition-colors shrink-0 hover:opacity-80"
          style={{ color: surface.textMuted }}
          aria-label="Close detail panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Purpose */}
        {node.purpose && (
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: surface.textMuted }}>
              Purpose
            </h4>
            <p className="text-[12px] leading-relaxed font-medium" style={{ color: surface.textPrimary }}>
              {node.purpose}
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-[11px] leading-relaxed" style={{ color: surface.textSecondary }}>
          {node.description}
        </p>

        {/* Subsystems Breakdown (if available) */}
        {node.subsystems && node.subsystems.length > 0 && (
          <div className="space-y-3">
            {node.subsystems.map((sub, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border text-xs"
                style={{ background: surface.chipBg, borderColor: surface.chipBorder }}
              >
                <h5 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: c.accent }}>
                  {sub.title}
                </h5>
                <ul className="space-y-1">
                  {sub.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-1.5 text-[11px]" style={{ color: surface.textSecondary }}>
                      <span className="h-1 w-1 rounded-full shrink-0 mt-1.5" style={{ background: c.accent }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Responsibilities */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: surface.textMuted }}>
            Core Responsibilities
          </h4>
          <ul className="space-y-1.5">
            {node.responsibilities.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px]" style={{ color: surface.textSecondary }}>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: c.accent }} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upstream & Downstream Dependencies */}
        <div className="space-y-2 pt-2 border-t" style={{ borderColor: surface.divider }}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: surface.textMuted }}>
            System Connectivity
          </h4>

          {upstreamNodes.length > 0 && (
            <div>
              <span className="text-[9px] font-mono text-opacity-70 block mb-1" style={{ color: surface.textMuted }}>
                ← Upstream Inputs From:
              </span>
              <div className="flex flex-wrap gap-1">
                {upstreamNodes.map((up) => {
                  const upC = resolveLayerColor(getLayer(up.layerId), isDark);
                  return (
                    <button
                      key={up.id}
                      onClick={() => onNavigateToNode(up.id)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium transition-all hover:opacity-80"
                      style={{
                        background: `${upC.accent}15`,
                        border: `1px solid ${upC.accent}30`,
                        color: upC.accent,
                      }}
                    >
                      {up.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {downstreamNodes.length > 0 && (
            <div className="mt-2">
              <span className="text-[9px] font-mono text-opacity-70 block mb-1" style={{ color: surface.textMuted }}>
                → Downstream Outputs To:
              </span>
              <div className="flex flex-wrap gap-1">
                {downstreamNodes.map((down) => {
                  const downC = resolveLayerColor(getLayer(down.layerId), isDark);
                  return (
                    <button
                      key={down.id}
                      onClick={() => onNavigateToNode(down.id)}
                      className="px-2 py-0.5 rounded text-[10px] font-medium transition-all hover:opacity-80"
                      style={{
                        background: `${downC.accent}15`,
                        border: `1px solid ${downC.accent}30`,
                        color: downC.accent,
                      }}
                    >
                      {down.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Inputs & Outputs Specs */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[10px]" style={{ borderColor: surface.divider }}>
          <div className="p-2 rounded bg-opacity-40" style={{ background: surface.chipBg }}>
            <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
              Inputs
            </span>
            {node.inputs.map((inp, i) => (
              <div key={i} className="py-0.5 text-[10px]" style={{ color: surface.textSecondary }}>• {inp}</div>
            ))}
          </div>
          <div className="p-2 rounded bg-opacity-40" style={{ background: surface.chipBg }}>
            <span className="font-bold uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
              Outputs
            </span>
            {node.outputs.map((out, i) => (
              <div key={i} className="py-0.5 text-[10px]" style={{ color: surface.textSecondary }}>• {out}</div>
            ))}
          </div>
        </div>

        {/* Documentation Link */}
        <div className="pt-2 border-t" style={{ borderColor: surface.divider }}>
          {node.docSlug ? (
            <button
              onClick={() => {
                if (onNavigateToDoc) onNavigateToDoc(node.docSlug!);
                else window.location.hash = node.docSlug!;
              }}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              style={{
                background: c.accent,
                color: '#FFFFFF',
              }}
            >
              <span>Read {node.docTitle || `${node.title} Docs`}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <div
              className="py-1.5 px-3 rounded text-[11px] text-center border font-mono"
              style={{ color: surface.textMuted, borderColor: surface.divider, background: surface.chipBg }}
            >
              Documentation coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
NodeDetailPanel.displayName = 'NodeDetailPanel';

// ─────────────────────────────────────────────────────────────
// RELATIONSHIP INSPECTOR PANEL (When clicking connection arrows)
// ─────────────────────────────────────────────────────────────
interface RelationshipPanelProps {
  connection: ArchConnection;
  onClose: () => void;
  onNavigateToNode: (nodeId: string) => void;
  isMobile: boolean;
  isDark: boolean;
  surface: SurfaceTokens;
}

const RelationshipPanel = memo(({
  connection,
  onClose,
  onNavigateToNode,
  isMobile,
  isDark,
  surface,
}: RelationshipPanelProps) => {
  const sourceNode = ARCH_NODES.find((n) => n.id === connection.source);
  const targetNode = ARCH_NODES.find((n) => n.id === connection.target);
  const sourceLayer = sourceNode ? getLayer(sourceNode.layerId) : ARCH_LAYERS[0];
  const targetLayer = targetNode ? getLayer(targetNode.layerId) : ARCH_LAYERS[0];
  const sourceColor = resolveLayerColor(sourceLayer, isDark);
  const targetColor = resolveLayerColor(targetLayer, isDark);

  const panelClass = isMobile
    ? 'fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t shadow-2xl animate-slide-up'
    : 'absolute top-4 right-4 z-40 w-80 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl border shadow-2xl animate-fade-in';

  return (
    <div
      className={panelClass}
      style={{
        background: surface.panelBg,
        borderColor: surface.panelBorder,
        boxShadow: `0 25px 50px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.12)'}`,
      }}
      role="dialog"
      aria-label="Relationship inspector"
    >
      <div
        className="sticky top-0 p-4 border-b flex items-start justify-between gap-2"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
      >
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4" style={{ color: surface.arrowColor }} />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: surface.textPrimary }}>
              System Relationship
            </h3>
            {connection.label && (
              <span className="text-[10px] font-mono" style={{ color: surface.arrowColor }}>
                [{connection.label}]
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-md" style={{ color: surface.textMuted }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Source & Target Nodes */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg border" style={{ background: surface.chipBg, borderColor: surface.chipBorder }}>
            <span className="text-[9px] font-mono uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
              Source Node
            </span>
            {sourceNode && (
              <button
                onClick={() => onNavigateToNode(sourceNode.id)}
                className="flex items-center gap-2 text-left font-semibold text-xs hover:opacity-80"
                style={{ color: sourceColor.accent }}
              >
                <NodeIcon name={sourceNode.icon} className="h-3.5 w-3.5 shrink-0" />
                <span>{sourceNode.title}</span>
              </button>
            )}
          </div>

          <div className="flex justify-center my-1">
            <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0" style={{ color: surface.arrowColor }} />
          </div>

          <div className="p-2.5 rounded-lg border" style={{ background: surface.chipBg, borderColor: surface.chipBorder }}>
            <span className="text-[9px] font-mono uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
              Target Node
            </span>
            {targetNode && (
              <button
                onClick={() => onNavigateToNode(targetNode.id)}
                className="flex items-center gap-2 text-left font-semibold text-xs hover:opacity-80"
                style={{ color: targetColor.accent }}
              >
                <NodeIcon name={targetNode.icon} className="h-3.5 w-3.5 shrink-0" />
                <span>{targetNode.title}</span>
              </button>
            )}
          </div>
        </div>

        {/* Purpose */}
        {connection.purpose && (
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: surface.textMuted }}>
              Purpose
            </h4>
            <p className="text-[12px] leading-relaxed" style={{ color: surface.textSecondary }}>
              {connection.purpose}
            </p>
          </div>
        )}

        {/* Data Payload */}
        {connection.dataPayload && connection.dataPayload.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: surface.textMuted }}>
              Data &amp; Protocol Payload
            </h4>
            <ul className="space-y-1">
              {connection.dataPayload.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[11px]" style={{ color: surface.textSecondary }}>
                  <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-1" style={{ background: surface.arrowColor }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});
RelationshipPanel.displayName = 'RelationshipPanel';

// ─────────────────────────────────────────────────────────────
// ARCHITECTURE NODE CARD
// ─────────────────────────────────────────────────────────────
interface ArchNodeCardProps {
  node: ArchNode;
  c: LayerColorTokens;
  surface: SurfaceTokens;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isHovered: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
  colSpan?: number;
  compact?: boolean;
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
  compact = false,
}: ArchNodeCardProps) => {
  const isActive = isSelected || isHovered;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${node.title}: ${node.description}`}
      aria-pressed={isSelected}
      data-node-id={node.id}
      className="group relative rounded-lg cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-2"
      style={{
        background: isActive ? `${c.accent}14` : c.nodeBg,
        borderTop: `1px solid ${isSelected ? c.accent : isHighlighted ? `${c.accent}80` : `${c.accent}28`}`,
        borderRight: `1px solid ${isSelected ? c.accent : isHighlighted ? `${c.accent}80` : `${c.accent}28`}`,
        borderBottom: `1px solid ${isSelected ? c.accent : isHighlighted ? `${c.accent}80` : `${c.accent}28`}`,
        borderLeft: `3px solid ${isActive ? c.accent : isHighlighted ? `${c.accent}90` : `${c.accent}45`}`,
        opacity: isDimmed ? 0.28 : 1,
        boxShadow: isSelected
          ? `0 0 20px ${c.glow}, 0 0 6px ${c.accent}30`
          : isHovered
          ? `0 0 12px ${c.glow}`
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
      <div className={compact ? 'p-2' : 'p-3'}>
        <div className="flex items-start gap-2">
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
            <div className="flex items-center justify-between gap-1">
              <div
                className="text-[12px] font-bold leading-tight truncate transition-colors"
                style={{ color: isActive ? surface.nodeActiveTitle : surface.nodeTitle }}
              >
                {node.title}
              </div>
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

      {/* Selected Indicator Dot */}
      {isSelected && (
        <div
          className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
          style={{ background: c.accent }}
        />
      )}

      {/* Compact Hover Tooltip */}
      {isHovered && !isSelected && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg text-left shadow-xl pointer-events-none z-50 animate-fade-in text-[10px]"
          style={{
            background: surface.panelBg,
            border: `1px solid ${c.accent}60`,
            boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
            color: surface.textPrimary,
          }}
        >
          <div className="font-bold text-[11px] mb-0.5" style={{ color: c.accent }}>
            {node.title}
          </div>
          <p className="line-clamp-2 text-[10px] mb-1" style={{ color: surface.textSecondary }}>
            {node.purpose || node.description}
          </p>
          <span className="font-mono text-[9px] opacity-70 block text-right" style={{ color: c.accent }}>
            Click to inspect →
          </span>
        </div>
      )}
    </div>
  );
});
ArchNodeCard.displayName = 'ArchNodeCard';

// ─────────────────────────────────────────────────────────────
// INTERACTIVE FLOW ARROW (Clickable Relationship Edge)
// ─────────────────────────────────────────────────────────────
interface FlowArrowProps {
  label?: string;
  connectionId?: string;
  surface: SurfaceTokens;
  dashed?: boolean;
  bidirectional?: boolean;
  onClickConnection?: (connectionId: string) => void;
  isHighlighted?: boolean;
}

const FlowArrow = ({
  label,
  connectionId,
  surface,
  dashed = false,
  bidirectional = false,
  onClickConnection,
  isHighlighted = false,
}: FlowArrowProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center justify-center py-1 group">
      <button
        onClick={() => connectionId && onClickConnection?.(connectionId)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col items-center gap-0.5 p-1 rounded transition-all cursor-pointer outline-none"
        title={connectionId ? 'Click to inspect relationship' : undefined}
      >
        {bidirectional && (
          <svg width="16" height="8" className="transition-opacity">
            <line
              x1="8"
              y1="1"
              x2="8"
              y2="7"
              stroke={isHovered || isHighlighted ? surface.arrowColor : surface.arrowColor}
              strokeWidth={isHovered || isHighlighted ? '2' : '1.5'}
              strokeDasharray={dashed ? '3,2' : undefined}
            />
            <polyline
              points="4,4 8,1 12,4"
              fill="none"
              stroke={surface.arrowColor}
              strokeWidth={isHovered || isHighlighted ? '2' : '1.5'}
              strokeLinejoin="round"
            />
          </svg>
        )}
        <svg width="16" height="18" className="transition-opacity">
          <line
            x1="8"
            y1="0"
            x2="8"
            y2="14"
            stroke={surface.arrowColor}
            strokeWidth={isHovered || isHighlighted ? '2' : '1.5'}
            strokeDasharray={dashed ? '3,2' : undefined}
          />
          <polyline
            points="4,10 8,16 12,10"
            fill="none"
            stroke={surface.arrowColor}
            strokeWidth={isHovered || isHighlighted ? '2' : '1.5'}
            strokeLinejoin="round"
          />
        </svg>
        {label && (
          <span
            className="text-[9px] font-mono px-1.5 py-0.2 rounded border transition-all"
            style={{
              color: isHovered || isHighlighted ? surface.nodeActiveTitle : surface.textMuted,
              background: surface.arrowLabelBg,
              borderColor: isHovered || isHighlighted ? surface.arrowColor : surface.headerBorder,
            }}
          >
            {label}
          </span>
        )}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// LAYER CONTAINER
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
  columns?: number;
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
        opacity: isLayerDimmed ? 0.45 : 1,
      }}
    >
      <div
        className="px-4 pt-3 pb-2 border-b"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full shrink-0" style={{ background: c.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.badgeText }}>
            {layer.title}
          </span>
          <span className="text-[10px] hidden sm:inline" style={{ color: surface.textMuted }}>
            — {layer.subtitle}
          </span>
        </div>
      </div>
      <div className="p-3 grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))' }}>
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
// SIDEBAR LAYER (Compact vertical strip for UI & Data)
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
        opacity: isLayerDimmed ? 0.45 : 1,
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
// EXPANDED ORCHESTRATION LAYER (Planner + Full Agent Team + Bus)
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
  isAgentTeamExpanded: boolean;
  onToggleAgentTeam: () => void;
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
  isAgentTeamExpanded,
  onToggleAgentTeam,
}: OrchLayerProps) => {
  const layer = getLayer('orchestration');
  const c = resolveLayerColor(layer, isDark);
  const isLayerDimmed = hasSelection && !nodes.some(
    (n) => n.id === selectedNodeId || highlightedNodes.has(n.id)
  );

  const mkCard = (nodeId: string, colSpan?: number, compact = false) => {
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
        colSpan={colSpan || node.colSpan}
        compact={compact}
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
        opacity: isLayerDimmed ? 0.45 : 1,
      }}
    >
      <div
        className="px-4 pt-3 pb-2 border-b flex items-center justify-between"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: c.accent }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: c.badgeText }}>
            Agent Orchestration &amp; Team Layer
          </span>
          <span className="text-[10px] hidden sm:inline" style={{ color: surface.textMuted }}>
            — coordinates tasks, DAG execution &amp; 12 specialized agents
          </span>
        </div>

        {/* Toggle Expand / Collapse Team */}
        <button
          onClick={onToggleAgentTeam}
          className="text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors flex items-center gap-1"
          style={{
            background: isAgentTeamExpanded ? `${c.accent}25` : 'transparent',
            borderColor: `${c.accent}40`,
            color: c.accent,
          }}
        >
          <span>{isAgentTeamExpanded ? 'Collapse Team' : 'Expand All 12 Agents'}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${isAgentTeamExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Top: Central Task Planner & DAG Engine */}
        {mkCard('planner')}

        {/* Middle: Agent Team Container */}
        <div
          className="p-2.5 rounded-lg border"
          style={{
            background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
            borderColor: `${c.accent}20`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: c.badgeText }}>
              Specialized Agent Team ({isAgentTeamExpanded ? '12 Active Personas' : 'Primary Roles'})
            </span>
            <span className="text-[9px] font-mono" style={{ color: surface.textMuted }}>
              Parallel Topological Dispatch
            </span>
          </div>

          {!isAgentTeamExpanded ? (
            /* Compact Agent View (4 Primary Categories) */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {mkCard('code-agent')}
              {mkCard('research-agent')}
              {mkCard('qa-agent')}
              {mkCard('security-agent')}
            </div>
          ) : (
            /* Full Expanded 12 Agent Breakdown */
            <div className="space-y-2 animate-fade-in">
              {/* Category 1: Core Engineering */}
              <div>
                <span className="text-[8.5px] font-mono uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
                  Core Engineering &amp; UI
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {mkCard('planner-agent', undefined, true)}
                  {mkCard('code-agent', undefined, true)}
                  {mkCard('debugger-agent', undefined, true)}
                  {mkCard('ui-ux-agent', undefined, true)}
                </div>
              </div>

              {/* Category 2: Quality, Security & Review */}
              <div>
                <span className="text-[8.5px] font-mono uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
                  Quality &amp; Security Auditing
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {mkCard('qa-agent', undefined, true)}
                  {mkCard('reviewer-agent', undefined, true)}
                  {mkCard('security-agent', undefined, true)}
                </div>
              </div>

              {/* Category 3: Knowledge, Data & Delivery */}
              <div>
                <span className="text-[8.5px] font-mono uppercase tracking-wider block mb-1" style={{ color: surface.textMuted }}>
                  Knowledge, Data &amp; Operations
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {mkCard('research-agent', undefined, true)}
                  {mkCard('data-agent', undefined, true)}
                  {mkCard('devops-agent', undefined, true)}
                  {mkCard('doc-agent', undefined, true)}
                </div>
              </div>

              {/* Category 4: Report Synthesis */}
              <div>
                <div className="grid grid-cols-1">
                  {mkCard('report-agent', undefined, true)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Agent Communication & Shared State Bus */}
        {mkCard('comm-bus')}
      </div>
    </div>
  );
});
OrchLayer.displayName = 'OrchLayer';

// ─────────────────────────────────────────────────────────────
// EXECUTION VIEW VISUALIZER (Simulated Live Run)
// ─────────────────────────────────────────────────────────────
interface ExecutionViewProps {
  onSelectAgent: (agentId: string) => void;
  selectedAgentId: string | null;
  surface: SurfaceTokens;
  isDark: boolean;
}

const ExecutionVisualizer = memo(({
  onSelectAgent,
  selectedAgentId,
  surface,
  isDark,
}: ExecutionViewProps) => {
  const sim = SIMULATED_EXECUTION_DATA;
  const activeAgent = sim.agents.find((a) => a.agentId === selectedAgentId) || sim.agents[2];

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fade-in">
      {/* Simulation Header Banner */}
      <div
        className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              SIMULATED RUN
            </span>
            <span className="text-[11px] font-mono" style={{ color: surface.textMuted }}>
              ID: {sim.taskId}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold mt-1" style={{ color: surface.textPrimary }}>
            Goal: &ldquo;{sim.taskTitle}&rdquo;
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs shrink-0 font-mono" style={{ color: surface.textSecondary }}>
          <div>
            <span className="block text-[9px] uppercase tracking-wider" style={{ color: surface.textMuted }}>Duration</span>
            <span className="font-bold">{sim.totalDuration}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider" style={{ color: surface.textMuted }}>Tokens</span>
            <span className="font-bold">{sim.totalTokens.toLocaleString()}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-wider" style={{ color: surface.textMuted }}>Est. Spend</span>
            <span className="font-bold text-emerald-400">{sim.estimatedCost}</span>
          </div>
        </div>
      </div>

      {/* Grid: Execution DAG Queue + Agent Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Task DAG Agent Lifecycle */}
        <div className="md:col-span-7 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider flex items-center justify-between px-1" style={{ color: surface.textMuted }}>
            <span>Topological Agent Dispatch Stream</span>
            <span>Status</span>
          </div>

          <div className="space-y-2">
            {sim.agents.map((agent) => {
              const isSelected = agent.agentId === activeAgent.agentId;
              const isRunning = agent.status === 'Running';
              const isComplete = agent.status === 'Complete';

              return (
                <button
                  key={agent.agentId}
                  onClick={() => onSelectAgent(agent.agentId)}
                  className="w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 group"
                  style={{
                    background: isSelected
                      ? isDark ? 'rgba(232,101,38,0.18)' : 'rgba(200,75,25,0.1)'
                      : surface.panelBg,
                    borderColor: isSelected ? surface.arrowColor : surface.panelBorder,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">
                      {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {isRunning && (
                        <div className="h-4 w-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                      )}
                      {agent.status === 'Waiting' && <Clock className="h-4 w-4 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs truncate" style={{ color: surface.textPrimary }}>
                        {agent.name}
                      </div>
                      <div className="text-[10px] truncate" style={{ color: surface.textSecondary }}>
                        {agent.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                    <span
                      className="px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background: isComplete
                          ? 'rgba(16,185,129,0.15)'
                          : isRunning
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(107,114,128,0.15)',
                        color: isComplete ? '#10B981' : isRunning ? '#F59E0B' : '#9CA3AF',
                      }}
                    >
                      {agent.status}
                    </span>
                    <span style={{ color: surface.textMuted }}>{agent.duration}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Live Agent Inspection Panel */}
        <div className="md:col-span-5">
          <div
            className="p-4 rounded-xl border space-y-3 sticky top-4 shadow-lg"
            style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
          >
            <div className="border-b pb-3" style={{ borderColor: surface.divider }}>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: surface.arrowColor }}>
                  Selected Agent Inspector
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-mono font-bold"
                  style={{
                    background: activeAgent.status === 'Running' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                    color: activeAgent.status === 'Running' ? '#F59E0B' : '#10B981',
                  }}
                >
                  {activeAgent.status}
                </span>
              </div>
              <h4 className="text-base font-bold mt-1" style={{ color: surface.textPrimary }}>
                {activeAgent.name}
              </h4>
              <p className="text-[11px]" style={{ color: surface.textSecondary }}>
                {activeAgent.role}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>
                  Dynamic Model Routing
                </span>
                <span className="font-semibold" style={{ color: surface.textPrimary }}>{activeAgent.model}</span>
                <span className="text-[10px] block opacity-80" style={{ color: surface.textMuted }}>via {activeAgent.provider}</span>
              </div>

              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>
                  Active Tool Bindings
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeAgent.tools.map((t, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                      style={{ background: surface.chipBg, color: surface.textSecondary, border: `1px solid ${surface.chipBorder}` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>
                  Live Agent Activity
                </span>
                <p className="p-2 rounded font-mono text-[11px] leading-relaxed mt-1" style={{ background: surface.canvasBg, color: surface.textSecondary }}>
                  {activeAgent.currentActivity}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: surface.divider }}>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>Artifacts</span>
                  <span className="font-bold text-xs" style={{ color: surface.textPrimary }}>{activeAgent.artifactsCount} produced</span>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>Elapsed</span>
                  <span className="font-bold text-xs" style={{ color: surface.textPrimary }}>{activeAgent.duration}</span>
                </div>
              </div>
            </div>

            <div className="p-2 rounded text-[10px] text-center" style={{ background: surface.chipBg, color: surface.textMuted }}>
              Demonstration Telemetry Sample
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
ExecutionVisualizer.displayName = 'ExecutionVisualizer';

// ─────────────────────────────────────────────────────────────
// MODEL FLOW VISUALIZER
// ─────────────────────────────────────────────────────────────
const ModelFlowVisualizer = memo(({ surface, isDark }: { surface: SurfaceTokens; isDark: boolean }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div
        className="p-4 rounded-xl border text-center space-y-1"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
      >
        <h3 className="text-base font-bold" style={{ color: surface.textPrimary }}>
          Model Gateway Provider-Agnostic Routing
        </h3>
        <p className="text-xs max-w-xl mx-auto" style={{ color: surface.textSecondary }}>
          Agents do not know or care which provider is executing their prompts. The gateway dynamically evaluates capabilities, privacy policies, hardware VRAM, and credit limits.
        </p>
      </div>

      {/* Model Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tier 1: Local On-Device */}
        <div
          className="p-4 rounded-xl border space-y-2.5"
          style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              TIER 1 · LOCAL ($0/MO)
            </span>
            <Cpu className="h-4 w-4 text-emerald-400" />
          </div>
          <h4 className="font-bold text-sm" style={{ color: surface.textPrimary }}>On-Device AI</h4>
          <p className="text-[11px]" style={{ color: surface.textSecondary }}>
            100% private, offline inference with zero host network exposure.
          </p>
          <div className="space-y-1 pt-2 border-t" style={{ borderColor: surface.divider }}>
            <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>
              Supported Runtimes
            </span>
            <div className="flex flex-wrap gap-1">
              {['Ollama', 'Hugging Face', 'llama.cpp', 'LM Studio'].map((r) => (
                <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tier 2: Custom Enterprise Gateways */}
        <div
          className="p-4 rounded-xl border space-y-2.5"
          style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
              TIER 2 · CUSTOM
            </span>
            <Server className="h-4 w-4 text-indigo-400" />
          </div>
          <h4 className="font-bold text-sm" style={{ color: surface.textPrimary }}>Enterprise Gateways</h4>
          <p className="text-[11px]" style={{ color: surface.textSecondary }}>
            Self-hosted company API proxies, vLLM, and OpenAI-compatible corporate gateways.
          </p>
          <div className="space-y-1 pt-2 border-t" style={{ borderColor: surface.divider }}>
            <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>
              Target Workloads
            </span>
            <div className="flex flex-wrap gap-1">
              {['vLLM Endpoints', 'Company Proxies', 'LiteLLM Gateway', 'Custom APIs'].map((r) => (
                <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Tier 3: Cloud Frontier Models */}
        <div
          className="p-4 rounded-xl border space-y-2.5"
          style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              TIER 3 · CLOUD
            </span>
            <Brain className="h-4 w-4 text-amber-400" />
          </div>
          <h4 className="font-bold text-sm" style={{ color: surface.textPrimary }}>Cloud Frontier LLMs</h4>
          <p className="text-[11px]" style={{ color: surface.textSecondary }}>
            High-reasoning cloud frontier models with automatic rate limit failover.
          </p>
          <div className="space-y-1 pt-2 border-t" style={{ borderColor: surface.divider }}>
            <span className="text-[9px] font-mono uppercase tracking-wider block" style={{ color: surface.textMuted }}>
              Providers
            </span>
            <div className="flex flex-wrap gap-1">
              {['Claude 3.5', 'GPT-4o', 'Gemini 2.5', 'OpenRouter', 'Groq'].map((r) => (
                <span key={r} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-300 border border-amber-800/40">
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Pipeline Flow */}
      <div
        className="p-4 rounded-xl border space-y-3"
        style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
      >
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: surface.arrowColor }}>
          Decision Pipeline: How Kernel Base Selects Models
        </h4>

        <div className="space-y-2">
          {MODEL_FLOW_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-2.5 rounded-lg border flex items-start gap-3"
              style={{ background: surface.chipBg, borderColor: surface.chipBorder }}
            >
              <span
                className="h-5 w-5 rounded-full font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: surface.arrowColor, color: '#FFFFFF' }}
              >
                {step.step}
              </span>
              <div>
                <h5 className="font-bold text-xs" style={{ color: surface.textPrimary }}>
                  {step.title}
                </h5>
                <p className="text-[11px] mt-0.5" style={{ color: surface.textSecondary }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
ModelFlowVisualizer.displayName = 'ModelFlowVisualizer';

// ─────────────────────────────────────────────────────────────
// SECURITY VIEW VISUALIZER
// ─────────────────────────────────────────────────────────────
const SecurityVisualizer = memo(({ surface, isDark }: { surface: SurfaceTokens; isDark: boolean }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div
        className="p-4 rounded-xl border text-center space-y-1"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <Shield className="h-3 w-3" />
          ZERO-TRUST DEFENSE-IN-DEPTH
        </div>
        <h3 className="text-base font-bold mt-1" style={{ color: surface.textPrimary }}>
          Autonomous Security Boundaries &amp; Isolation
        </h3>
        <p className="text-xs max-w-xl mx-auto" style={{ color: surface.textSecondary }}>
          Autonomous agents never operate directly on your host machine or active Git branch. Every execution passes through a multi-tier security gate.
        </p>
      </div>

      {/* 6-Stage Security Pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {SECURITY_PIPELINE_STAGES.map((st, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border space-y-2"
            style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
          >
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider block" style={{ color: surface.arrowColor }}>
              {st.stage}
            </span>
            <h4 className="font-bold text-xs" style={{ color: surface.textPrimary }}>
              {st.title}
            </h4>
            <p className="text-[11px] leading-relaxed" style={{ color: surface.textSecondary }}>
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Security Matrix Table */}
      <div
        className="p-4 rounded-xl border space-y-3"
        style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
      >
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: surface.textPrimary }}>
          Container &amp; Isolation Hardening Matrix
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded border" style={{ background: surface.chipBg, borderColor: surface.chipBorder }}>
            <span className="font-bold block text-emerald-400">✓ Ephemeral Git Worktrees</span>
            <span className="text-[11px]" style={{ color: surface.textSecondary }}>
              Every agent run operates on a temporary branch; your working tree remains 100% untouched until approved.
            </span>
          </div>
          <div className="p-2.5 rounded border" style={{ background: surface.chipBg, borderColor: surface.chipBorder }}>
            <span className="font-bold block text-emerald-400">✓ Kernel cgroups Resource Caps</span>
            <span className="text-[11px]" style={{ color: surface.textSecondary }}>
              Hard capped to 2 CPU cores, 2048 MB memory, and zero swap to guarantee host responsiveness.
            </span>
          </div>
          <div className="p-2.5 rounded border" style={{ background: surface.chipBg, borderColor: surface.chipBorder }}>
            <span className="font-bold block text-emerald-400">✓ Read-Only Root Filesystem</span>
            <span className="text-[11px]" style={{ color: surface.textSecondary }}>
              Docker containers mount host root as read-only; only the isolated /workspace is writable.
            </span>
          </div>
          <div className="p-2.5 rounded border" style={{ background: surface.chipBg, borderColor: surface.chipBorder }}>
            <span className="font-bold block text-emerald-400">✓ Secret Masking &amp; Key Vault</span>
            <span className="text-[11px]" style={{ color: surface.textSecondary }}>
              Environment secrets and credentials are automatically redacted before reaching model prompts or logs.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
SecurityVisualizer.displayName = 'SecurityVisualizer';

// ─────────────────────────────────────────────────────────────
// DATA FLOW VISUALIZER
// ─────────────────────────────────────────────────────────────
const DataFlowVisualizer = memo(({ surface, isDark }: { surface: SurfaceTokens; isDark: boolean }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div
        className="p-4 rounded-xl border text-center space-y-1"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
      >
        <h3 className="text-base font-bold" style={{ color: surface.textPrimary }}>
          Data Movement &amp; State Persistence Architecture
        </h3>
        <p className="text-xs max-w-xl mx-auto" style={{ color: surface.textSecondary }}>
          How developer inputs, execution events, and generated artifacts move through Kernel Base into persistent ACID SQLite and Git stores.
        </p>
      </div>

      {/* Sequential Pipeline */}
      <div
        className="p-4 rounded-xl border space-y-4"
        style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
      >
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: surface.arrowColor }}>
          Live Data Movement Pipeline
        </h4>

        <div className="space-y-2">
          {[
            { step: '1', title: 'User Goal Input', desc: 'Raw prompt + workspace context attached and validated by Task Interface.' },
            { step: '2', title: 'Task State Generation', desc: 'Planner decomposes prompt into structured TaskNodes with input/output contracts.' },
            { step: '3', title: 'Task Graph DAG Store', desc: 'Topological task tree persisted to SQLite with dependency edges.' },
            { step: '4', title: 'Agent Context Window', desc: 'Context pruner compacts files, AST symbols, and research into prompt.' },
            { step: '5', title: 'Model Gateway Request', desc: 'Prompt normalized and routed to selected Cloud/Local model endpoint.' },
            { step: '6', title: 'Tool Execution in Sandbox', desc: 'Model tool calls executed in Docker worktree; stdout/diffs captured.' },
            { step: '7', title: 'Artifact Lineage & Testing', desc: 'Code patches verified by Vitest; artifacts linked in DAG store.' },
            { step: '8', title: 'Report Synthesis & State Vault', desc: 'Final report compiled and archived into immutable SQLite audit vault.' },
          ].map((item) => (
            <div
              key={item.step}
              className="p-2.5 rounded-lg border flex items-start gap-3"
              style={{ background: surface.chipBg, borderColor: surface.chipBorder }}
            >
              <span
                className="h-5 w-5 rounded-full font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: surface.arrowColor, color: '#FFFFFF' }}
              >
                {item.step}
              </span>
              <div>
                <h5 className="font-bold text-xs" style={{ color: surface.textPrimary }}>
                  {item.title}
                </h5>
                <p className="text-[11px] mt-0.5" style={{ color: surface.textSecondary }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
DataFlowVisualizer.displayName = 'DataFlowVisualizer';

// ─────────────────────────────────────────────────────────────
// MINIMAP COMPONENT (Desktop)
// ─────────────────────────────────────────────────────────────
interface MinimapProps {
  zoom: number;
  panX: number;
  panY: number;
  onPanTo: (x: number, y: number) => void;
  surface: SurfaceTokens;
  isDark: boolean;
}

const Minimap = memo(({ zoom, panX, panY, onPanTo, surface }: MinimapProps) => {
  return (
    <div
      className="absolute bottom-4 left-4 z-30 w-36 h-24 rounded-lg border p-1 hidden lg:block shadow-lg select-none"
      style={{
        background: surface.headerBg,
        borderColor: surface.headerBorder,
      }}
      title="Architecture Minimap (Click to navigate)"
    >
      <div className="w-full h-full relative rounded overflow-hidden bg-opacity-30" style={{ background: surface.canvasBg }}>
        {/* Simplified layer representations */}
        <div className="absolute top-1 left-1 w-6 h-10 rounded-xs bg-amber-500/20 border border-amber-500/30" />
        <div className="absolute top-1 left-8 right-8 h-10 rounded-xs bg-orange-500/20 border border-orange-500/30" />
        <div className="absolute top-1 right-1 w-6 h-10 rounded-xs bg-rose-500/20 border border-rose-500/30" />
        <div className="absolute bottom-1 left-8 right-8 h-8 rounded-xs bg-red-500/20 border border-red-500/30" />

        {/* Viewport Indicator */}
        <div
          className="absolute border-2 border-orange-500 bg-orange-500/10 rounded-xs transition-all pointer-events-none"
          style={{
            top: `${Math.max(2, Math.min(60, 20 - panY * 0.04))}%`,
            left: `${Math.max(2, Math.min(60, 20 - panX * 0.04))}%`,
            width: `${Math.max(30, Math.min(90, 60 / zoom))}%`,
            height: `${Math.max(30, Math.min(90, 60 / zoom))}%`,
          }}
        />
      </div>
    </div>
  );
});
Minimap.displayName = 'Minimap';

// ─────────────────────────────────────────────────────────────
// COMPREHENSIVE ARCHITECTURE EXPLORER (Main Component)
// ─────────────────────────────────────────────────────────────
export interface InteractiveArchitectureProps {
  isDark?: boolean;
  onNavigate?: (slug: string) => void;
}

export const InteractiveArchitecture: React.FC<InteractiveArchitectureProps> = ({
  isDark: propIsDark,
  onNavigate,
}) => {
  const themeCtx = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : themeCtx.isDark;
  const surface = useMemo(() => buildSurfaceTokens(isDark), [isDark]);

  // ── States ────────────────────────────────────────────────
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ArchConnection | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'overview' | 'agent-flow' | 'execution' | 'model-flow' | 'data-flow' | 'security'>('overview');
  const [isAgentTeamExpanded, setIsAgentTeamExpanded] = useState<boolean>(false);
  const [showOrgLayer, setShowOrgLayer] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedSimAgent, setSelectedSimAgent] = useState<string | null>('code-agent');

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  // ── Responsive Listener ───────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Search & Filter Logic ─────────────────────────────────
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set<string>();
    const q = searchQuery.toLowerCase();
    const matches = ARCH_NODES.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.responsibilities.some((r) => r.toLowerCase().includes(q))
    ).map((n) => n.id);
    return new Set(matches);
  }, [searchQuery]);

  // ── Connected Nodes Calculation ───────────────────────────
  const currentPreset = useMemo(
    () => PRESET_VIEWS.find((p) => p.id === activePreset) || PRESET_VIEWS[0],
    [activePreset]
  );

  const highlightedNodes = useMemo<Set<string>>(() => {
    if (searchQuery.trim()) {
      return matchingNodeIds;
    }
    if (!selectedNode) {
      if (activePreset === 'overview') return new Set<string>();
      return new Set(currentPreset.highlightNodes);
    }
    const connected = new Set<string>([selectedNode]);
    ARCH_CONNECTIONS.forEach((c) => {
      if (c.source === selectedNode) connected.add(c.target);
      if (c.target === selectedNode) connected.add(c.source);
    });
    return connected;
  }, [selectedNode, activePreset, currentPreset, searchQuery, matchingNodeIds]);

  const hasSelection =
    selectedNode !== null ||
    searchQuery.trim().length > 0 ||
    (activePreset !== 'overview' && currentPreset.highlightNodes.length > 0);

  // ── Handlers ──────────────────────────────────────────────
  const handleNodeClick = useCallback((id: string) => {
    setSelectedConnection(null);
    setSelectedNode((prev) => (prev === id ? null : id));
  }, []);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedNode(null);
    const conn = ARCH_CONNECTIONS.find((c) => c.id === connectionId);
    if (conn) setSelectedConnection(conn);
  }, []);

  const handleNodeHover = useCallback((id: string | null) => setHoveredNode(id), []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    if ((e.target as HTMLElement).closest('button')) return;
    setSelectedNode(null);
    setSelectedConnection(null);
  }, []);

  const clampZoom = (z: number) => Math.min(2, Math.max(0.3, z));

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvasRef.current) return;
    // Allow standard page scrolling unless holding ctrl/meta or inside canvas
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom((z) => clampZoom(z - e.deltaY * 0.01));
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
    if ((e.target as HTMLElement).closest('input')) return;
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

  const handleFitView = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setSelectedNode(null);
    setSelectedConnection(null);
    setActivePreset('overview');
    setSearchQuery('');
  }, []);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  // ── Node Grouping by Layer ────────────────────────────────
  const nodesByLayer = useMemo(() => {
    const map: Record<LayerId, ArchNode[]> = {
      ui: [],
      orchestration: [],
      runtime: [],
      data: [],
      integrations: [],
      organization: [],
    };
    ARCH_NODES.forEach((n) => {
      if (map[n.layerId]) map[n.layerId].push(n);
    });
    return map;
  }, []);

  const selectedNodeData = selectedNode
    ? ARCH_NODES.find((n) => n.id === selectedNode) ?? null
    : null;

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

  // ── Search Suggestions List ───────────────────────────────
  const quickSearchSuggestions = [
    'Coding Agent',
    'Task Planner',
    'Sandbox',
    'Model Gateway',
    'Ollama',
    'MCP Tool Runtime',
    'Report Engine',
    'State & Audit Vault',
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative my-8'} flex flex-col`}
      style={{
        background: surface.canvasBg,
        ...(isFullscreen
          ? {}
          : {
              borderRadius: '1rem',
              overflow: 'hidden',
              border: `1px solid ${surface.headerBorder}`,
              boxShadow: isDark
                ? '0 4px 28px rgba(0,0,0,0.5)'
                : '0 4px 28px rgba(0,0,0,0.08)',
            }),
      }}
    >
      {/* ── Top Header Toolbar ──────────────────────────── */}
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
            <Network className="h-4 w-4" style={{ color: surface.arrowColor }} />
          </div>
          <div>
            <h2 className="text-[13px] font-bold tracking-tight" style={{ color: surface.textPrimary }}>
              SYSTEM ARCHITECTURE EXPLORER
            </h2>
            <p className="text-[11px] mt-0.5 hidden sm:block" style={{ color: surface.textSecondary }}>
              Interactive topology map &amp; execution subsystem breakdown
            </p>
          </div>
        </div>

        {/* Search Architecture Box */}
        <div className="relative flex-1 max-w-xs mx-auto sm:mx-0">
          <div className="relative flex items-center">
            <Search className="h-3.5 w-3.5 absolute left-2.5 pointer-events-none" style={{ color: surface.textMuted }} />
            <input
              type="text"
              placeholder="Search architecture (e.g. Coding, MCP, Sandbox)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-8 pr-7 py-1 rounded-lg text-xs border outline-none transition-all"
              style={{
                background: surface.searchBg,
                borderColor: searchQuery ? surface.arrowColor : surface.divider,
                color: surface.textPrimary,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-0.5 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick suggestions dropdown */}
          {isSearchFocused && !searchQuery && (
            <div
              className="absolute top-full left-0 right-0 mt-1 p-2 rounded-lg border shadow-xl z-50 text-[10px] space-y-1"
              style={{ background: surface.panelBg, borderColor: surface.panelBorder }}
            >
              <span className="text-[9px] uppercase tracking-wider block font-bold" style={{ color: surface.textMuted }}>
                Popular Architecture Nodes
              </span>
              <div className="flex flex-wrap gap-1">
                {quickSearchSuggestions.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => setSearchQuery(s)}
                    className="px-2 py-0.5 rounded transition-colors hover:opacity-80"
                    style={{ background: surface.chipBg, color: surface.textSecondary }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Viewport Toolbar Controls */}
        <div
          className="flex items-center gap-1 shrink-0 self-end sm:self-auto"
          role="toolbar"
          aria-label="Diagram controls"
        >
          <button
            onClick={() => setZoom((z) => clampZoom(z - 0.15))}
            className="p-1.5 rounded-md transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center text-[11px]"
            style={{ color: surface.btnText }}
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-0.5 rounded text-[11px] font-mono min-h-[30px]"
            style={{ color: surface.btnText }}
            title="Reset Zoom to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom((z) => clampZoom(z + 0.15))}
            className="p-1.5 rounded-md transition-colors min-h-[30px] min-w-[30px] flex items-center justify-center text-[11px]"
            style={{ color: surface.btnText }}
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="w-px h-4 mx-1" style={{ background: surface.divider }} />

          <button
            onClick={handleFitView}
            className="px-2 py-1 rounded text-[11px] font-medium transition-colors"
            style={{ color: surface.btnText }}
            title="Fit architecture"
          >
            Fit
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: surface.btnText }}
            title="Reset diagram to overview"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: surface.btnText }}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Architecture View Switcher Tabs ─────────────── */}
      <div
        className="px-4 sm:px-5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b"
        style={{ background: surface.headerBg, borderColor: surface.headerBorder }}
        role="tablist"
        aria-label="Architecture Views"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 mr-1" style={{ color: surface.textMuted }}>
          Views:
        </span>
        {PRESET_VIEWS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActivePreset(preset.id);
                setSelectedNode(null);
                setSelectedConnection(null);
              }}
              className="px-3 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5"
              style={
                isActive
                  ? {
                      background: isDark ? 'rgba(166,64,17,0.3)' : 'rgba(166,64,17,0.12)',
                      color: surface.textPrimary,
                      border: `1px solid ${surface.arrowColor}`,
                    }
                  : {
                      color: surface.textSecondary,
                      border: '1px solid transparent',
                    }
              }
              title={preset.description}
            >
              <span>{preset.label}</span>
              {preset.badge && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-opacity-30" style={{ background: surface.chipBg }}>
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Company / Org Layer Toggle */}
        <button
          onClick={() => setShowOrgLayer((p) => !p)}
          className="ml-auto px-2.5 py-1 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 border"
          style={
            showOrgLayer
              ? {
                  background: 'rgba(139,92,246,0.25)',
                  color: '#A78BFA',
                  borderColor: '#8B5CF6',
                }
              : {
                  color: surface.textMuted,
                  borderColor: surface.divider,
                }
          }
          title="Toggle Organization & Enterprise Governance Layer"
        >
          <Building2 className="h-3 w-3" />
          <span>Org Governance</span>
        </button>
      </div>

      {/* ── Main Canvas Area ─────────────────────────────── */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ minHeight: isFullscreen ? 0 : isMobile ? 560 : 700, background: surface.canvasBg }}
        onClick={handleCanvasClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="region"
        aria-label="Interactive architecture diagram canvas"
      >
        {/* Render View Depending on Preset Tab */}
        <div
          ref={canvasRef}
          className="transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: 'top center',
            padding: '24px',
            willChange: 'transform',
          }}
        >
          {/* Subtitle / View Context Description */}
          <div className="max-w-3xl mx-auto mb-4 text-center">
            <p className="text-[12px] leading-relaxed" style={{ color: surface.textSecondary }}>
              {activePreset === 'overview' && 'Complete layered system topology connecting Desktop IDE, Orchestrator DAG, Multi-Agent Teams, Tool Sandbox, and Model Gateway.'}
              {activePreset === 'agent-flow' && 'End-to-end task execution journey: Goal decomposition → Parallel agent team dispatch → Verification → Report synthesis.'}
              {activePreset === 'execution' && 'Simulated real-time multi-agent execution pipeline on an active engineering task with telemetry.'}
              {activePreset === 'model-flow' && 'Provider-agnostic Model Gateway routing between Cloud frontier, Enterprise gateways, and $0/mo Local AI.'}
              {activePreset === 'data-flow' && 'Data persistence pathways across ACID SQLite state tables, Git worktree commits, and DAG stores.'}
              {activePreset === 'security' && 'Zero-trust defense-in-depth: Human approval gates, Docker sandbox virtualization, and syscall filtering.'}
            </p>
          </div>

          {/* VIEW 1 & 2: Overview & Agent Flow (Standard Topological Layers) */}
          {(activePreset === 'overview' || activePreset === 'agent-flow') && (
            <div className="space-y-4 max-w-[1200px] mx-auto">
              {/* Optional: Company & Organization Layer (when toggled) */}
              {showOrgLayer && (
                <div className="animate-fade-in mb-3">
                  <LayerContainer
                    layer={getLayer('organization')}
                    nodes={nodesByLayer['organization']}
                    {...nodeProps}
                  />
                  <FlowArrow
                    surface={surface}
                    label="enforce policies"
                    connectionId="c-org-resmgr"
                    onClickConnection={handleConnectionClick}
                  />
                </div>
              )}

              {/* 3-Column Desktop Layout */}
              <div className="flex gap-4">
                {/* Left Column: UI + Data & State */}
                <div className="hidden lg:flex flex-col gap-3 w-[210px] shrink-0">
                  <SideLayer
                    layerId="ui"
                    label="User Interface"
                    sublabel="Entry points & IDE"
                    nodes={nodesByLayer['ui']}
                    {...nodeProps}
                  />
                  <FlowArrow
                    surface={surface}
                    label="submit goal"
                    connectionId="c-desktop-planner"
                    onClickConnection={handleConnectionClick}
                  />
                  <SideLayer
                    layerId="data"
                    label="Data & State"
                    sublabel="Persistence & models"
                    nodes={nodesByLayer['data']}
                    {...nodeProps}
                  />
                </div>

                {/* Center Column: Orchestration + Runtime & Execution */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  {/* Mobile UI */}
                  <div className="lg:hidden">
                    <LayerContainer layer={getLayer('ui')} nodes={nodesByLayer['ui']} {...nodeProps} />
                    <FlowArrow
                      surface={surface}
                      label="submit"
                      connectionId="c-desktop-planner"
                      onClickConnection={handleConnectionClick}
                    />
                  </div>

                  <OrchLayer
                    nodes={nodesByLayer['orchestration']}
                    isAgentTeamExpanded={isAgentTeamExpanded}
                    onToggleAgentTeam={() => setIsAgentTeamExpanded((p) => !p)}
                    {...nodeProps}
                  />

                  <FlowArrow
                    surface={surface}
                    label="execute &amp; sandbox"
                    connectionId="c-code-toolrt"
                    onClickConnection={handleConnectionClick}
                  />

                  <LayerContainer
                    layer={getLayer('runtime')}
                    nodes={nodesByLayer['runtime']}
                    {...nodeProps}
                  />

                  <FlowArrow
                    surface={surface}
                    label="publish report"
                    connectionId="c-report-workspaceui"
                    onClickConnection={handleConnectionClick}
                  />

                  {/* Mobile Data */}
                  <div className="lg:hidden">
                    <LayerContainer layer={getLayer('data')} nodes={nodesByLayer['data']} {...nodeProps} />
                  </div>
                </div>

                {/* Right Column: Model Gateway & Integrations */}
                <div className="hidden lg:flex flex-col w-[210px] shrink-0">
                  <SideLayer
                    layerId="integrations"
                    label="Integrations"
                    sublabel="Gateway & tools"
                    nodes={nodesByLayer['integrations']}
                    {...nodeProps}
                  />
                </div>
              </div>

              {/* Mobile Integrations */}
              <div className="lg:hidden mt-3">
                <FlowArrow
                  surface={surface}
                  label="inference &amp; tools"
                  connectionId="c-planner-llm"
                  onClickConnection={handleConnectionClick}
                  bidirectional
                />
                <LayerContainer layer={getLayer('integrations')} nodes={nodesByLayer['integrations']} {...nodeProps} />
              </div>
            </div>
          )}

          {/* VIEW 3: Live Execution Visualizer */}
          {activePreset === 'execution' && (
            <ExecutionVisualizer
              onSelectAgent={(id) => setSelectedSimAgent(id)}
              selectedAgentId={selectedSimAgent}
              surface={surface}
              isDark={isDark}
            />
          )}

          {/* VIEW 4: Model Flow Visualizer */}
          {activePreset === 'model-flow' && (
            <ModelFlowVisualizer surface={surface} isDark={isDark} />
          )}

          {/* VIEW 5: Data Flow Visualizer */}
          {activePreset === 'data-flow' && (
            <DataFlowVisualizer surface={surface} isDark={isDark} />
          )}

          {/* VIEW 6: Security Visualizer */}
          {activePreset === 'security' && (
            <SecurityVisualizer surface={surface} isDark={isDark} />
          )}

          {/* ── Comprehensive Legend ──────────────────────── */}
          <div className="mt-8 max-w-[1200px] mx-auto">
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-[10px] border shadow-xs"
              style={{ background: surface.legendBg, borderColor: surface.legendBorder }}
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="font-bold uppercase tracking-wider shrink-0" style={{ color: surface.textMuted }}>
                  NODE TYPES
                </span>
                {ARCH_LAYERS.map((l) => {
                  const lc = resolveLayerColor(l, isDark);
                  return (
                    <span key={l.id} className="flex items-center gap-1.5 shrink-0">
                      <span className="h-2 w-2 rounded-xs" style={{ background: lc.accent }} />
                      <span style={{ color: surface.textSecondary }}>{l.title.split(' ')[0]}</span>
                    </span>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 pt-1 sm:pt-0" style={{ borderColor: surface.divider }}>
                <span className="font-bold uppercase tracking-wider shrink-0" style={{ color: surface.textMuted }}>
                  CONNECTIONS
                </span>
                <span className="flex items-center gap-1" style={{ color: surface.textSecondary }}>
                  <ArrowRight className="h-3 w-3" style={{ color: surface.arrowColor }} />
                  <span>Primary execution</span>
                </span>
                <span className="flex items-center gap-1" style={{ color: surface.textSecondary }}>
                  <ArrowLeftRight className="h-3 w-3" style={{ color: surface.arrowColor }} />
                  <span>Bidirectional</span>
                </span>
                <span className="flex items-center gap-1" style={{ color: surface.textSecondary }}>
                  <span className="font-mono" style={{ color: surface.arrowColor }}>⇢</span>
                  <span>Data / persistence</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── Bottom Instructional Callout ──────────────── */}
          <div className="mt-4 text-center max-w-xl mx-auto space-y-1">
            <h4 className="text-xs font-bold" style={{ color: surface.textPrimary }}>
              Explore the architecture
            </h4>
            <p className="text-[11px] leading-relaxed" style={{ color: surface.textSecondary }}>
              Click any component to inspect its responsibility and dependencies. Switch views to follow agent execution, model routing, data movement, or security boundaries.
            </p>
            <div className="flex items-center justify-center gap-4 text-[10px] font-mono pt-1" style={{ color: surface.textMuted }}>
              <span>Scroll / Pinch: <strong>Zoom</strong></span>
              <span>•</span>
              <span>Drag: <strong>Pan</strong></span>
              <span>•</span>
              <span>Click: <strong>Inspect</strong></span>
              <span>•</span>
              <span>Reset: <strong>Fit</strong></span>
            </div>
          </div>
        </div>

        {/* Desktop Minimap */}
        {activePreset === 'overview' && (
          <Minimap
            zoom={zoom}
            panX={panX}
            panY={panY}
            onPanTo={(x, y) => {
              setPanX(x);
              setPanY(y);
            }}
            surface={surface}
            isDark={isDark}
          />
        )}

        {/* Desktop Node Inspector Panel */}
        {selectedNodeData && !isMobile && (
          <NodeDetailPanel
            node={selectedNodeData}
            onClose={() => setSelectedNode(null)}
            onNavigateToNode={handleNodeClick}
            onNavigateToDoc={onNavigate}
            isMobile={false}
            isDark={isDark}
            surface={surface}
          />
        )}

        {/* Desktop Relationship Inspector Panel */}
        {selectedConnection && !isMobile && (
          <RelationshipPanel
            connection={selectedConnection}
            onClose={() => setSelectedConnection(null)}
            onNavigateToNode={handleNodeClick}
            isMobile={false}
            isDark={isDark}
            surface={surface}
          />
        )}
      </div>

      {/* Mobile Bottom Sheet for Node Inspector */}
      {selectedNodeData && isMobile && (
        <NodeDetailPanel
          node={selectedNodeData}
          onClose={() => setSelectedNode(null)}
          onNavigateToNode={handleNodeClick}
          onNavigateToDoc={onNavigate}
          isMobile={true}
          isDark={isDark}
          surface={surface}
        />
      )}

      {/* Mobile Bottom Sheet for Relationship Inspector */}
      {selectedConnection && isMobile && (
        <RelationshipPanel
          connection={selectedConnection}
          onClose={() => setSelectedConnection(null)}
          onNavigateToNode={handleNodeClick}
          isMobile={true}
          isDark={isDark}
          surface={surface}
        />
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div
        className="px-4 sm:px-5 py-2.5 border-t flex items-center justify-between text-[11px] shrink-0"
        style={{
          background: surface.headerBg,
          borderColor: surface.headerBorder,
          color: surface.textMuted,
        }}
      >
        <span>
          {ARCH_NODES.length} Subsystem Nodes · {ARCH_CONNECTIONS.length} Labeled Connections · 6 Interactive Views
        </span>
        <span className="font-mono hidden sm:inline">
          Kernel Base Multi-Agent IDE Topology
        </span>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes kb-fade-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kb-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in  { animation: kb-fade-in 0.18s ease-out; }
        .animate-slide-up { animation: kb-slide-up 0.22s ease-out; }
      `}</style>
    </div>
  );
};

export default InteractiveArchitecture;
