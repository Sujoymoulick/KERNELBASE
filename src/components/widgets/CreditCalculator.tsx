import React, { useState } from 'react';
import { DollarSign, Cpu, Sparkles, TrendingDown, Shield } from 'lucide-react';

export const CreditCalculator: React.FC = () => {
  const [tasksPerMonth, setTasksPerMonth] = useState<number>(40);
  const [avgTokensPerTask, setAvgTokensPerTask] = useState<number>(15000);
  const [localModelRatio, setLocalModelRatio] = useState<number>(75);

  const totalTokens = tasksPerMonth * avgTokensPerTask;
  const localTokens = Math.round(totalTokens * (localModelRatio / 100));
  const cloudTokens = totalTokens - localTokens;

  // Commercial Frontier cost: ~$3.00 per million input, $15.00 per million output (avg ~$6.00/M)
  const commercialCost = (totalTokens / 1_000_000) * 8.5;

  // Hybrid Cost: Local = $0. Cloud (Tier 2 OpenRouter Qwen 32B @ $0.80/M)
  const hybridCost = (cloudTokens / 1_000_000) * 0.8;

  // Student 100% local cost: $0.00
  const savings = Math.max(0, commercialCost - hybridCost);
  const savingsPercent = Math.round((savings / Math.max(0.01, commercialCost)) * 100);

  return (
    <div id="interactive-credit-calculator" className="my-8 rounded-xl border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] overflow-hidden shadow-xs">
      {/* Card Header */}
      <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-slate-50 dark:bg-[#0B0D11] border-b border-slate-200 dark:border-[#1D2430] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-[#70a5ff] shrink-0" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F7FA]">
            Interactive Token & Cost Simulator
          </h4>
        </div>
        <span className="text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40 self-start sm:self-auto">
          {savingsPercent}% Cheaper than Frontier Only
        </span>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label htmlFor="tasks-slider" className="font-semibold text-slate-800 dark:text-[#A7AFBD]">
                Monthly Autonomous Coding Runs:
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-[#70a5ff]">
                {tasksPerMonth} runs
              </span>
            </div>
            <input
              id="tasks-slider"
              type="range"
              min="5"
              max="200"
              step="5"
              value={tasksPerMonth}
              onChange={(e) => setTasksPerMonth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#1D2430] rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[11px] text-slate-600 dark:text-[#707987] mt-1">Average developer runs 30–60 feature tasks monthly.</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label htmlFor="tokens-slider" className="font-semibold text-slate-800 dark:text-[#A7AFBD]">
                Average Tokens per Run (Planning + Tests):
              </label>
              <span className="font-mono font-bold text-indigo-600 dark:text-[#70a5ff]">
                {avgTokensPerTask.toLocaleString()} tokens
              </span>
            </div>
            <input
              id="tokens-slider"
              type="range"
              min="5000"
              max="50000"
              step="2500"
              value={avgTokensPerTask}
              onChange={(e) => setAvgTokensPerTask(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#1D2430] rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[11px] text-slate-600 dark:text-[#707987] mt-1">Includes initial decomposition, code generation, and test verification.</p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <label htmlFor="local-slider" className="font-semibold text-slate-800 dark:text-[#A7AFBD]">
                Workload Routed to Tier 1 Local Ollama ($0):
              </label>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {localModelRatio}% Local
              </span>
            </div>
            <input
              id="local-slider"
              type="range"
              min="0"
              max="100"
              step="5"
              value={localModelRatio}
              onChange={(e) => setLocalModelRatio(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#1D2430] rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <p className="text-[11px] text-slate-600 dark:text-[#707987] mt-1">
              {localModelRatio === 100
                ? '100% Offline Student Mode: $0.00 forever'
                : 'Hybrid routing: local handles planning/formatting, cloud handles complex refactors'}
            </p>
          </div>
        </div>

        {/* Cost Comparison Cards */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#1D2430] bg-slate-100/70 dark:bg-[#090C12]">
              <span className="text-[11px] text-slate-600 dark:text-[#707987] font-medium block mb-1">Naive Frontier Only</span>
              <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-[#F5F7FA]">
                ${commercialCost.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-[#707987] block mt-0.5">per month</span>
            </div>

            <div className="p-3.5 rounded-lg border border-indigo-200 dark:border-[#233558] bg-indigo-50/80 dark:bg-[#172033]">
              <span className="text-[11px] text-indigo-800 dark:text-[#70a5ff] font-bold block mb-1">
                AI-Native IDE Hybrid
              </span>
              <span className="text-xl font-extrabold font-mono text-indigo-700 dark:text-[#70a5ff]">
                ${hybridCost.toFixed(2)}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-[#70a5ff]/80 block mt-0.5">
                per month
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center space-x-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs mb-1">
              <TrendingDown className="h-4 w-4" />
              <span>Monthly Student & Developer Savings</span>
            </div>
            <p className="text-2xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
              ${savings.toFixed(2)} / mo saved
            </p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400/90 mt-1">
              {localTokens.toLocaleString()} tokens served offline for free by Ollama Qwen 2.5 Coder.
            </p>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-[#707987] flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-slate-500 dark:text-[#707987] shrink-0" />
            <span>Zero cloud credit card required when running in 100% Tier 1 Local mode.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
