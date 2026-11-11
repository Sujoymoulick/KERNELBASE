import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X, Shield, Terminal, FileEdit } from 'lucide-react';
import { PermissionRequest } from '../types/ide';

interface PermissionModalProps {
  request: PermissionRequest | null;
  onRespond: (id: string, approved: boolean, alwaysAllow?: boolean) => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({ request, onRespond }) => {
  if (!request) return null;

  const isCritical = request.dangerLevel === 'critical' || request.dangerLevel === 'high';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg bg-[#140b07] border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          isCritical ? 'border-red-600/60 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-[#3d1d13]'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 flex items-center space-x-3 border-b ${
            isCritical ? 'bg-red-950/40 border-red-900/50' : 'bg-[#1b0e09] border-[#2b140d]'
          }`}
        >
          {isCritical ? (
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
          ) : (
            <Shield className="w-5 h-5 text-[#ff6b35] shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
              <span>Security Permission Required</span>
              {request.dangerLevel && (
                <span
                  className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold ${
                    isCritical ? 'bg-red-900/80 text-red-200' : 'bg-yellow-900/80 text-yellow-200'
                  }`}
                >
                  {request.dangerLevel}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">
              Agent role <strong className="text-neutral-200">{request.agentRole || 'system'}</strong> requested tool execution
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-xs text-neutral-300">
          <p className="leading-relaxed">{request.description}</p>

          {/* Command execution preview */}
          {request.command && (
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500 font-semibold uppercase flex items-center space-x-1">
                <Terminal className="w-3 h-3 text-[#ff6b35]" />
                <span>Bash Command Execution</span>
              </div>
              <pre className="p-2.5 bg-[#0a0604] border border-[#2b140d] rounded font-mono text-[11px] text-amber-200 overflow-x-auto whitespace-pre-wrap break-all">
                {request.command}
              </pre>
            </div>
          )}

          {/* File path preview */}
          {request.filePath && (
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500 font-semibold uppercase flex items-center space-x-1">
                <FileEdit className="w-3 h-3 text-amber-500" />
                <span>Target File Path</span>
              </div>
              <div className="p-2 bg-[#0a0604] border border-[#2b140d] rounded font-mono text-[11px] text-neutral-200">
                {request.filePath}
              </div>
            </div>
          )}

          {isCritical && (
            <div className="p-2.5 bg-red-950/20 border border-red-900/40 rounded flex items-start space-x-2 text-[11px] text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> This command involves elevated privileges or potentially destructive filesystem operations.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-[#100805] border-t border-[#24130d] flex items-center justify-between">
          <button
            onClick={() => onRespond(request.id, false)}
            className="px-3 py-1.5 bg-[#1f100a] hover:bg-neutral-800 text-neutral-300 rounded text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Deny</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onRespond(request.id, true, true)}
              className="px-3 py-1.5 bg-[#2a130b] hover:bg-[#381a0e] text-[#ff804d] rounded text-xs font-medium transition-colors"
            >
              Always Allow
            </button>
            <button
              onClick={() => onRespond(request.id, true, false)}
              className="px-4 py-1.5 bg-[#ff6b35] hover:bg-[#ff804d] text-black font-semibold rounded text-xs flex items-center space-x-1.5 shadow-[0_2px_8px_rgba(255,107,53,0.3)] transition-colors"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Allow Once</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
