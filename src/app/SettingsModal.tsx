import React from 'react';
import { useIDE } from '../context/IDEContext';
import { Sliders, X, Check, Bot, Type, Code, Shield } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, setSettings } = useIDE();

  if (!isSettingsOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-[#140b08] border border-[#3d1d13] rounded-2xl shadow-2xl overflow-hidden flex flex-col select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#2a160f] flex items-center justify-between bg-[#190d09]">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#ff6b35]" />
            <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
              Kernel Base Preferences
            </h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="text-neutral-400 hover:text-neutral-100 p-1 rounded-lg hover:bg-[#28140d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section: AI Model */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
              <Bot className="w-4 h-4 text-[#ff6b35]" />
              <span>AI Agent Foundation Model</span>
            </div>
            <select
              value={settings.defaultModel}
              onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
              className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
            >
              <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Recommended)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="deepseek-r1">DeepSeek R1 (Local)</option>
            </select>
          </div>

          {/* Section: Editor Options */}
          <div className="space-y-3 pt-3 border-t border-[#22120a]">
            <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
              <Type className="w-4 h-4 text-[#ff6b35]" />
              <span>Editor Configuration</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-neutral-400 block mb-1">Font Size (px)</label>
                <input
                  type="number"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                  className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                />
              </div>
              <div>
                <label className="text-neutral-400 block mb-1">Tab Size (spaces)</label>
                <input
                  type="number"
                  value={settings.tabSize}
                  onChange={(e) => setSettings({ ...settings, tabSize: Number(e.target.value) })}
                  className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-neutral-300">Word Wrap</span>
              <button
                onClick={() => setSettings({ ...settings, wordWrap: !settings.wordWrap })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.wordWrap ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    settings.wordWrap ? 'left-5.5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-300">Auto Save Changes</span>
              <button
                onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.autoSave ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    settings.autoSave ? 'left-5.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Security */}
          <div className="space-y-3 pt-3 border-t border-[#22120a]">
            <div className="flex items-center space-x-2 text-neutral-300 font-semibold">
              <Shield className="w-4 h-4 text-[#ff6b35]" />
              <span>Autonomy & Safety</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-neutral-300">Auto-Approve Safe Read-Only Tools</span>
                <span className="text-[10px] text-neutral-500">
                  Allow agents to read files and search workspace without prompting
                </span>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    autoApproveSafeTools: !settings.autoApproveSafeTools,
                  })
                }
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  settings.autoApproveSafeTools ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                    settings.autoApproveSafeTools ? 'left-5.5' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2a160f] bg-[#190d09] flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="bg-[#ff6b35] hover:bg-[#e85a26] text-neutral-950 font-semibold px-4 py-1.5 rounded-lg transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
