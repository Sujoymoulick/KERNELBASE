import React, { useState } from 'react';
import { useAgents } from '../context/AgentContext';
import { useIDE } from '../context/IDEContext';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  ShieldAlert,
  X,
  MessageSquare,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { AgentRole } from '../types/ide';

const ROLE_COLORS: Record<AgentRole, { border: string; bg: string; text: string }> = {
  orchestrator: { border: 'border-purple-600/40', bg: 'bg-purple-950/20', text: 'text-purple-400' },
  planner: { border: 'border-blue-600/40', bg: 'bg-blue-950/20', text: 'text-blue-400' },
  coder: { border: 'border-emerald-600/40', bg: 'bg-emerald-950/20', text: 'text-emerald-400' },
  tester: { border: 'border-amber-600/40', bg: 'bg-amber-950/20', text: 'text-amber-400' },
  reviewer: { border: 'border-cyan-600/40', bg: 'bg-cyan-950/20', text: 'text-cyan-400' },
  debugger: { border: 'border-rose-600/40', bg: 'bg-rose-950/20', text: 'text-rose-400' },
  researcher: { border: 'border-indigo-600/40', bg: 'bg-indigo-950/20', text: 'text-indigo-400' },
};

export const AgentPanel: React.FC = () => {
  const {
    agents,
    currentPlan,
    isRunning,
    submitGoal,
    executeStep,
    thoughts,
    pendingPermission,
    respondPermission,
    clearThoughts,
    refreshSwarm,
  } = useAgents();
  const { setIsAgentPanelOpen } = useIDE();
  const [goalInput, setGoalInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    submitGoal(goalInput);
    setGoalInput('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshSwarm();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0907] select-none text-xs relative">
      {/* Header with Refresh & Close Buttons */}
      <div className="p-3 border-b border-[#28150f] flex items-center justify-between bg-[#120a06]">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#ff6b35]" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-200">
            Agent Swarm
          </span>
          <span className="bg-[#24130d] text-[#ff6b35] text-[10px] px-2 py-0.5 rounded-full border border-[#3d1d13] font-mono">
            {agents.length} Agents
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-[#28130a] text-neutral-400 hover:text-[#ff6b35] rounded-lg transition-colors"
            title="Refresh Agent Swarm Panel"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ff6b35]' : ''}`} />
          </button>
          <button
            onClick={() => setIsAgentPanelOpen(false)}
            className="p-1.5 hover:bg-[#28130a] text-neutral-400 hover:text-neutral-100 rounded-lg transition-colors"
            title="Close Agent Swarm (Ctrl+Shift+A)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Goal Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-b border-[#24130d] bg-[#140b08]">
        <label className="text-[11px] text-neutral-400 font-medium block mb-1">
          Development Objective
        </label>
        <div className="relative">
          <textarea
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. Implement authentication middleware and write unit tests..."
            className="w-full bg-[#0d0705] border border-[#381c13] rounded-lg p-2 pr-9 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#ff6b35] resize-none h-16 text-xs"
          />
          <button
            type="submit"
            disabled={!goalInput.trim() || isRunning}
            className="absolute right-2 bottom-2 p-1.5 bg-[#ff6b35] hover:bg-[#e85a26] disabled:opacity-50 text-neutral-950 rounded-md transition-all shadow-sm shadow-[#ff6b35]/20 cursor-pointer"
            title="Submit Goal to Agent Swarm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Main Content: Active Swarm Roster + Plan Steps + Live Thoughts */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Pending Tool Authorization Alert */}
        {pendingPermission && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 text-rose-400 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Permission Requested</span>
            </div>
            <p className="text-[11px] text-neutral-300">
              Agent <span className="font-mono font-bold text-amber-400">{pendingPermission.agentRole}</span> requested permission:
            </p>
            <div className="bg-[#170a06] p-2 rounded font-mono text-[10px] text-rose-300 border border-rose-900/40">
              {pendingPermission.toolName} ({JSON.stringify(pendingPermission.args)})
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => respondPermission(true)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1 rounded text-[10.5px] font-semibold transition-colors"
              >
                Allow
              </button>
              <button
                onClick={() => respondPermission(false)}
                className="flex-1 bg-rose-800 hover:bg-rose-700 text-white py-1 rounded text-[10.5px] font-semibold transition-colors"
              >
                Deny
              </button>
            </div>
          </div>
        )}

        {/* Agent Roster Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Active Swarm Roster
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {isRunning ? 'Swarm Working...' : 'Swarm Idle'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {agents.map((agent) => {
              const theme = ROLE_COLORS[agent.role] || {
                border: 'border-neutral-700',
                bg: 'bg-neutral-900',
                text: 'text-neutral-300',
              };
              const isWorking = agent.state !== 'idle';
              return (
                <div
                  key={agent.id}
                  className={`p-2 rounded-lg border ${theme.border} ${theme.bg} flex items-center space-x-2 transition-all`}
                >
                  <span className="text-base">{agent.avatar}</span>
                  <div className="flex flex-col truncate">
                    <span className={`text-[11px] font-semibold ${theme.text} truncate`}>
                      {agent.name}
                    </span>
                    <span className="text-[9px] text-neutral-400 capitalize flex items-center space-x-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isWorking ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'
                        }`}
                      />
                      <span>{agent.state}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Execution Plan */}
        {currentPlan && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Execution Plan Steps
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {currentPlan.steps.filter((s) => s.status === 'completed').length}/
                {currentPlan.steps.length}
              </span>
            </div>

            <div className="space-y-2">
              {currentPlan.steps.map((step, idx) => {
                const isCompleted = step.status === 'completed';
                const isInProgress = step.status === 'in_progress';
                const isPending = step.status === 'pending';

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isInProgress
                        ? 'bg-[#20100a] border-[#ff6b35]/60 shadow-[0_0_12px_rgba(255,107,53,0.1)]'
                        : isCompleted
                        ? 'bg-[#110906] border-emerald-900/40 text-neutral-400'
                        : 'bg-[#110906] border-[#29140d] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isInProgress ? (
                          <Clock className="w-4 h-4 text-[#ff6b35] animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center text-[10px] text-neutral-400 shrink-0">
                            {idx + 1}
                          </div>
                        )}
                        <span
                          className={`font-semibold ${
                            isInProgress ? 'text-neutral-100' : 'text-neutral-300'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      <span className="text-[10px] bg-[#1a0e09] px-1.5 py-0.5 rounded border border-[#351a10] text-neutral-400 font-mono">
                        {step.assignedRole}
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 mt-1 pl-6">{step.description}</p>

                    {isPending && !isRunning && (
                      <div className="mt-2 pl-6">
                        <button
                          onClick={() => executeStep(step.id)}
                          className="flex items-center space-x-1 bg-[#26130b] hover:bg-[#381c10] text-[#ff6b35] px-2.5 py-1 rounded text-[10px] font-medium border border-[#4a2415] transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Execute Step</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Swarm Reasoning Stream */}
        <div className="space-y-2 pt-2 border-t border-[#24130d]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#ff6b35]" />
              <span>Agent Reasoning Stream</span>
            </span>
            {thoughts.length > 0 && (
              <button
                onClick={clearThoughts}
                className="p-1 text-neutral-500 hover:text-neutral-300 rounded transition-colors"
                title="Clear Reasoning Stream"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-52 overflow-y-auto bg-[#0d0705] border border-[#26130b] rounded-lg p-2 font-mono text-[10.5px]">
            {thoughts.length === 0 ? (
              <div className="text-neutral-500 italic text-[10px] py-2 text-center">
                Swarm active. Submit an objective to stream live agent reasoning.
              </div>
            ) : (
              thoughts.map((t) => (
                <div key={t.id} className="text-neutral-300 leading-relaxed border-b border-[#1f100a] pb-1 last:border-none">
                  <span className="text-[#ff6b35] font-semibold">[{t.role.toUpperCase()}]</span>{' '}
                  <span>{t.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
