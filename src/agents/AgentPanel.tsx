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
  ChevronRight,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { AgentRole, PlanStep } from '../types/ide';

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
  const { agents, currentPlan, isRunning, submitGoal, executeStep, thoughts, pendingPermission } = useAgents();
  const { openDiff } = useIDE();
  const [goalInput, setGoalInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    submitGoal(goalInput);
    setGoalInput('');
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0907] select-none text-xs">
      {/* Header */}
      <div className="p-3 border-b border-[#28150f] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#ff6b35]" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-neutral-300">Agent Swarm</span>
        </div>
        <span className="bg-[#24130d] text-[#ff6b35] text-[10px] px-2 py-0.5 rounded-full border border-[#3d1d13]">
          7 Agents Active
        </span>
      </div>

      {/* Goal Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-b border-[#24130d] bg-[#140b08]">
        <label className="text-[11px] text-neutral-400 font-medium block mb-1">Development Objective</label>
        <div className="relative">
          <textarea
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. Implement authentication middleware and write unit tests..."
            className="w-full bg-[#0d0705] border border-[#381c13] rounded-lg p-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#ff6b35] resize-none h-16"
          />
          <button
            type="submit"
            disabled={!goalInput.trim() || isRunning}
            className="absolute right-2 bottom-2 p-1.5 bg-[#ff6b35] hover:bg-[#e85a26] disabled:opacity-50 text-neutral-950 rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Main Content: Active Swarm Roster + Plan Steps */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Agent Roster Grid */}
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Active Swarm
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {agents.map((agent) => {
              const theme = ROLE_COLORS[agent.role] || { border: 'border-neutral-700', bg: 'bg-neutral-900', text: 'text-neutral-300' };
              return (
                <div
                  key={agent.id}
                  className={`p-2 rounded-lg border ${theme.border} ${theme.bg} flex items-center space-x-2`}
                >
                  <span className="text-base">{agent.avatar}</span>
                  <div className="flex flex-col truncate">
                    <span className={`text-[11px] font-semibold ${theme.text} truncate`}>{agent.name}</span>
                    <span className="text-[9px] text-neutral-400 capitalize">{agent.state}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Execution Plan */}
        {currentPlan && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                DAG Execution Plan
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {currentPlan.steps.filter((s) => s.status === 'completed').length}/{currentPlan.steps.length}
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
                        <span className={`font-semibold ${isInProgress ? 'text-neutral-100' : 'text-neutral-300'}`}>
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
                          className="flex items-center space-x-1 bg-[#26130b] hover:bg-[#381c10] text-[#ff6b35] px-2 py-1 rounded text-[10px] font-medium border border-[#4a2415] transition-colors"
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
      </div>
    </div>
  );
};
