import React from 'react';
import { useIDE } from '../context/IDEContext';
import { AlertCircle, AlertTriangle, Info, FileCode } from 'lucide-react';
import { DiagnosticItem } from '../types/ide';

export const ProblemsPanel: React.FC = () => {
  const { diagnostics, openFile } = useIDE();

  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const infos = diagnostics.filter((d) => d.severity === 'info');

  const groupedByFile = diagnostics.reduce<Record<string, DiagnosticItem[]>>((acc, item) => {
    if (!acc[item.filePath]) {
      acc[item.filePath] = [];
    }
    acc[item.filePath].push(item);
    return acc;
  }, {});

  const handleJumpToProblem = async (item: DiagnosticItem) => {
    await openFile(item.filePath);
    // Monaco editor scroll/cursor navigation can be triggered here
  };

  if (diagnostics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-500 select-none py-8">
        <div className="w-10 h-10 rounded-full bg-[#1c0f0a] border border-[#30160d] flex items-center justify-center mb-2">
          <AlertCircle className="w-5 h-5 text-neutral-600" />
        </div>
        <p className="text-xs font-medium text-neutral-400">No problems have been detected in the workspace.</p>
        <p className="text-[11px] text-neutral-600 mt-0.5">Compiler errors and lint diagnostics will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0e0805] text-neutral-300 font-mono text-xs overflow-y-auto select-none">
      {/* Problems Header Summary */}
      <div className="px-3 py-1.5 bg-[#140b07] border-b border-[#24130d] flex items-center space-x-4 text-[11px]">
        <span className="text-neutral-400 font-sans font-medium">All Problems: {diagnostics.length}</span>
        {errors.length > 0 && (
          <span className="flex items-center space-x-1 text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.length} Errors</span>
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center space-x-1 text-yellow-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{warnings.length} Warnings</span>
          </span>
        )}
        {infos.length > 0 && (
          <span className="flex items-center space-x-1 text-blue-400">
            <Info className="w-3.5 h-3.5" />
            <span>{infos.length} Infos</span>
          </span>
        )}
      </div>

      {/* Grouped file tree */}
      <div className="divide-y divide-[#1e100a]">
        {Object.entries(groupedByFile).map(([filePath, items]) => {
          const fileName = filePath.split('/').pop() || filePath;
          return (
            <div key={filePath} className="py-1">
              <div
                onClick={() => openFile(filePath)}
                className="px-3 py-1 flex items-center space-x-2 bg-[#120a07] hover:bg-[#1a0e09] cursor-pointer text-neutral-200 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-xs">{fileName}</span>
                <span className="text-neutral-600 text-[10px] truncate">{filePath}</span>
                <span className="ml-auto text-[10px] bg-[#29140c] text-[#ff804d] px-1.5 py-0.2 rounded-full">
                  {items.length}
                </span>
              </div>

              <div className="pl-6 divide-y divide-[#180d08]">
                {(Array.isArray(items) ? items : []).map((item) => {
                  const Icon =
                    item.severity === 'error'
                      ? AlertCircle
                      : item.severity === 'warning'
                      ? AlertTriangle
                      : Info;
                  const color =
                    item.severity === 'error'
                      ? 'text-red-400'
                      : item.severity === 'warning'
                      ? 'text-yellow-400'
                      : 'text-blue-400';

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleJumpToProblem(item)}
                      className="px-3 py-1.5 flex items-start space-x-2 hover:bg-[#190e09] cursor-pointer transition-colors group"
                    >
                      <Icon className={`w-3.5 h-3.5 ${color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-200 group-hover:text-white transition-colors truncate">
                          {item.message}
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center space-x-2 mt-0.5">
                          <span>
                            Ln {item.line}, Col {item.column}
                          </span>
                          {item.source && (
                            <span className="bg-[#1c0f0a] px-1 rounded border border-[#2b140d]">
                              {item.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
