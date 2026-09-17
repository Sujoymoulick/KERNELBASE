import React from 'react';
import { Bot, ArrowRight, CheckCircle, Shield, Cpu, Wrench } from 'lucide-react';
import { AgentCardData } from '../../types/docs';

interface AgentCardProps {
  agent: AgentCardData;
  onSelect?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect }) => {
  const roleColors: Record<string, string> = {
    Orchestration: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Execution: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Verification: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    Governance: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  };

  const badgeClass = roleColors[agent.role] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  const cardId = `agent-card-${agent.id}`;

  return (
    <div
      id={cardId}
      className="rounded-lg border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] p-5 shadow-xs hover:border-indigo-400 dark:hover:border-[#3b82f6]/60 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-md bg-indigo-50 dark:bg-[#172033] text-indigo-600 dark:text-[#70a5ff]">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-[#F5F7FA] text-sm">
                {agent.name}
              </h4>
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#707987]">
                id: {agent.id}
              </span>
            </div>
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}>
            {agent.role}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-[#A7AFBD] leading-relaxed mb-4">
          {agent.description}
        </p>

        <div className="space-y-2 mb-4 pt-3 border-t border-slate-100 dark:border-[#1D2430]">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-[#A7AFBD]">
            <Cpu className="h-3.5 w-3.5 text-slate-400 dark:text-[#707987]" />
            <span className="text-[11px] text-slate-400 dark:text-[#707987]">Recommended Model:</span>
            <span className="font-mono text-[11px] font-medium text-indigo-600 dark:text-[#70a5ff]">
              {agent.recommendedModel}
            </span>
          </div>

          <div className="flex items-start space-x-1.5 text-xs text-slate-600 dark:text-[#A7AFBD]">
            <Wrench className="h-3.5 w-3.5 text-slate-400 dark:text-[#707987] shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {agent.tools.map((t: string) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#101624] text-[10px] font-mono text-slate-600 dark:text-[#A7AFBD] border border-transparent dark:border-[#1D2430]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {onSelect && (
        <button
          id={`select-${cardId}`}
          onClick={onSelect}
          className="mt-2 text-xs font-medium text-indigo-600 dark:text-[#70a5ff] flex items-center space-x-1 hover:underline pt-2 border-t border-slate-100 dark:border-[#1D2430]"
        >
          <span>View specification</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
