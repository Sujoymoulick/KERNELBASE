import React, { useState } from 'react';
import { Layers, Check, X, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface FrameworkData {
  id: string;
  name: string;
  version: string;
  ramUsage: string;
  binarySize: string;
  nodeSupport: string;
  rustRequired: boolean;
  dockerSupport: string;
  ptyTerminalSupport: string;
  studentEaseScore: number; // 1 - 10
  securityScore: number;
  recommendation: 'MVP Recommended' | 'Production v1.0 Target' | 'Alternative';
  strengths: string[];
  weaknesses: string[];
}

const FRAMEWORKS: FrameworkData[] = [
  {
    id: 'electron',
    name: 'Electron',
    version: 'v32',
    ramUsage: '180 – 260 MB',
    binarySize: '85 – 130 MB',
    nodeSupport: 'Native & direct (node-pty, dockerode work seamlessly)',
    rustRequired: false,
    dockerSupport: 'Trivial via node-dockerode',
    ptyTerminalSupport: 'Native C++ (node-pty)',
    studentEaseScore: 9,
    securityScore: 7,
    recommendation: 'MVP Recommended',
    strengths: [
      'Battle-tested in VS Code and Cursor',
      'Flawless node-pty support for xterm.js integrated terminal',
      'Zero compilation hurdles for students with JavaScript/Node knowledge',
      'Direct integration with Monaco Editor without iframe acrobatics',
    ],
    weaknesses: [
      'Higher baseline RAM usage (~200MB idle)',
      'Larger binary package size (~90MB)',
      'Requires explicit CSP configuration to prevent XSS escapes',
    ],
  },
  {
    id: 'tauri',
    name: 'Tauri v2',
    version: 'v2.0',
    ramUsage: '35 – 60 MB',
    binarySize: '8 – 15 MB',
    nodeSupport: 'Requires Node sidecar process or custom Rust bindings',
    rustRequired: true,
    dockerSupport: 'Fast via bollard Rust crate or daemon IPC',
    ptyTerminalSupport: 'Requires portable-pty Rust bindings',
    studentEaseScore: 4,
    securityScore: 10,
    recommendation: 'Production v1.0 Target',
    strengths: [
      'Extremely lightweight (~40MB idle RAM)',
      'Tiny binary footprint (<15MB)',
      'Rust memory safety and strict capability permission system',
      'Ideal architecture for enterprise and long-term production',
    ],
    weaknesses: [
      'Steep learning curve (Rust ownership, lifetimes, async Tokio)',
      'Node.js tools (node-pty, dockerode) cannot run directly in backend without sidecars',
      'Student contributors frequently encounter cross-compilation errors',
    ],
  },
  {
    id: 'neutralino',
    name: 'Neutralinojs',
    version: 'v5.2',
    ramUsage: '25 – 45 MB',
    binarySize: '3 – 8 MB',
    nodeSupport: 'External child process only',
    rustRequired: false,
    dockerSupport: 'External CLI pipe only',
    ptyTerminalSupport: 'Limited stdin/stdout pipe (no true PTY)',
    studentEaseScore: 6,
    securityScore: 7,
    recommendation: 'Alternative',
    strengths: [
      'Smallest binary size (<5MB)',
      'Zero external runtime dependencies',
      'Simple JSON-based configuration',
    ],
    weaknesses: [
      'Lacks native PTY terminal emulation required for interactive debuggers',
      'Very small plugin ecosystem compared to Electron',
      'Immature window multi-tab and split-pane management',
    ],
  },
  {
    id: 'wails',
    name: 'Wails',
    version: 'v2.9',
    ramUsage: '40 – 70 MB',
    binarySize: '12 – 22 MB',
    nodeSupport: 'External child process or Go IPC',
    rustRequired: false,
    dockerSupport: 'Native Go docker-client',
    ptyTerminalSupport: 'Go creack/pty package',
    studentEaseScore: 7,
    securityScore: 8,
    recommendation: 'Alternative',
    strengths: [
      'Go goroutines are exceptionally well suited for multi-agent daemons',
      'Lower RAM than Electron without Rust\'s cognitive overhead',
      'Clean TypeScript binding generator from Go structs',
    ],
    weaknesses: [
      'WebKitGTK differences on Linux can cause frontend CSS rendering quirks',
      'Developers must know Go to extend native desktop features',
      'Smaller IDE tooling ecosystem than Node.js',
    ],
  },
];

export const DesktopComparison: React.FC = () => {
  const [selectedFw, setSelectedFw] = useState<FrameworkData>(FRAMEWORKS[0]);

  return (
    <div id="desktop-comparison-widget" className="my-8 rounded-xl border border-slate-200 dark:border-[#1D2430] bg-white dark:bg-[#0D1118] overflow-hidden shadow-xs">
      <div className="p-3.5 sm:p-5 bg-slate-50 dark:bg-[#0B0D11] border-b border-slate-200 dark:border-[#1D2430] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F7FA]">
            Desktop Runtime Frameworks Evaluation
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-[#A7AFBD] mt-0.5">
            Evaluated for an AI-Native IDE with PTY terminal, Monaco Editor, and Docker.
          </p>
        </div>
        <span className="text-[11px] font-mono bg-indigo-50 dark:bg-[#172033] text-indigo-700 dark:text-[#70a5ff] border border-indigo-200 dark:border-[#233558] px-2.5 py-1 rounded-md self-start sm:self-auto shrink-0 font-semibold">
          Checked: September 2026
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#1D2430] bg-slate-100/70 dark:bg-[#090C12] text-xs overflow-x-auto scrollbar-none">
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            id={`tab-${fw.id}`}
            onClick={() => setSelectedFw(fw)}
            className={`px-3.5 sm:px-4 py-2.5 font-medium whitespace-nowrap transition-colors border-b-2 flex items-center space-x-2 shrink-0 ${
              selectedFw.id === fw.id
                ? 'border-indigo-600 text-indigo-700 font-bold bg-white dark:bg-[#0D1118] dark:border-[#70a5ff] dark:text-[#70a5ff]'
                : 'border-transparent text-slate-700 dark:text-[#A7AFBD] hover:text-slate-900 dark:hover:text-[#F5F7FA] hover:bg-slate-200/60 dark:hover:bg-[#141C2B]'
            }`}
          >
            <span>{fw.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              fw.recommendation === 'MVP Recommended'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-transparent'
                : fw.recommendation === 'Production v1.0 Target'
                ? 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-[#172033] dark:text-[#70a5ff] dark:border-[#233558]'
                : 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-[#101624] dark:text-[#A7AFBD] dark:border-transparent'
            }`}>
              {fw.recommendation}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
        <div className="md:col-span-7 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1D2430] bg-slate-50/50 dark:bg-[#090C12]">
              <span className="text-slate-500 dark:text-[#707987] block text-[11px]">Idle RAM Consumption</span>
              <span className="font-mono font-bold text-slate-800 dark:text-[#F5F7FA] text-sm">
                {selectedFw.ramUsage}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-[#1D2430] bg-slate-50/50 dark:bg-[#090C12]">
              <span className="text-slate-500 dark:text-[#707987] block text-[11px]">Compiled Package Size</span>
              <span className="font-mono font-bold text-slate-800 dark:text-[#F5F7FA] text-sm">
                {selectedFw.binarySize}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="font-semibold text-slate-700 dark:text-[#F5F7FA] block">
                Node.js & Native Ecosystem Interop:
              </span>
              <p className="text-slate-600 dark:text-[#A7AFBD] mt-0.5">
                {selectedFw.nodeSupport}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-[#F5F7FA] block">
                Terminal (PTY) & xterm.js Support:
              </span>
              <p className="text-slate-600 dark:text-[#A7AFBD] mt-0.5">
                {selectedFw.ptyTerminalSupport}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-700 dark:text-[#F5F7FA] block">
                Docker Engine Interoperability:
              </span>
              <p className="text-slate-600 dark:text-[#A7AFBD] mt-0.5">
                {selectedFw.dockerSupport}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1D2430]">
            <div>
              <span className="text-slate-500 dark:text-[#707987] text-[11px] block">Student Developer Accessibility</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-[#70a5ff]">
                {selectedFw.studentEaseScore} / 10 Ease Score
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-[#707987] text-[11px] block">Security Isolation Rating</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedFw.securityScore} / 10 Security Score
              </span>
            </div>
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="md:col-span-5 space-y-4 text-xs">
          <div className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
            <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5 mb-2">
              <Check className="h-4 w-4" />
              <span>Architectural Strengths</span>
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-[#A7AFBD] list-disc list-inside">
              {selectedFw.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
            <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Tradeoffs & Limitations</span>
            </span>
            <ul className="space-y-1 text-slate-700 dark:text-[#A7AFBD] list-disc list-inside">
              {selectedFw.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
