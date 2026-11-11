import React, { useState } from 'react';
import { X, Sliders, Terminal, Bot, Key, Check, Eye, EyeOff } from 'lucide-react';
import { useIDE } from '../context/IDEContext';
import { api } from '../services/api';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, setSettings } = useIDE();
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'ai'>('editor');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Local state for settings form
  const [formData, setFormData] = useState({
    fontSize: settings.fontSize || 13,
    tabSize: settings.tabSize || 2,
    wordWrap: settings.wordWrap ?? true,
    autoSave: settings.autoSave ?? true,
    theme: settings.theme || 'dark',
    defaultModel: settings.defaultModel || 'claude-3-7-sonnet',
    apiKeyGemini: settings.apiKeyGemini || '',
    apiKeyAnthropic: settings.apiKeyAnthropic || '',
    apiKeyOpenAI: settings.apiKeyOpenAI || '',
    ollamaUrl: settings.ollamaUrl || 'http://localhost:11434',
    autoApproveSafeTools: settings.autoApproveSafeTools ?? true,
    defaultShell: '/bin/zsh',
    terminalFontSize: 12,
  });

  if (!isSettingsOpen) return null;

  const handleSave = async () => {
    setSettings({
      ...settings,
      ...formData,
    });
    try {
      await api.settings.save(formData as any);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const toggleShowKey = (name: string) => {
    setShowKey((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#140b07] border border-[#381a10] rounded-xl shadow-2xl flex flex-col h-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-12 px-4 bg-[#1b0e09] border-b border-[#2b140d] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#ff6b35]" />
            <h2 className="text-sm font-semibold text-neutral-100">Settings</h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 text-neutral-400 hover:text-neutral-200 hover:bg-[#2b140d] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content with Left Nav */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Tabs Sidebar */}
          <div className="w-48 bg-[#100805] border-r border-[#26130d] p-2 space-y-1 text-xs select-none">
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full px-3 py-2 rounded-lg flex items-center space-x-2.5 transition-colors ${
                activeTab === 'editor'
                  ? 'bg-[#24130d] text-[#ff6b35] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#180d08]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Editor & Layout</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`w-full px-3 py-2 rounded-lg flex items-center space-x-2.5 transition-colors ${
                activeTab === 'terminal'
                  ? 'bg-[#24130d] text-[#ff6b35] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#180d08]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full px-3 py-2 rounded-lg flex items-center space-x-2.5 transition-colors ${
                activeTab === 'ai'
                  ? 'bg-[#24130d] text-[#ff6b35] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#180d08]'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Agent Swarm</span>
            </button>
          </div>

          {/* Settings Details Form */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs text-neutral-300">
            {activeTab === 'editor' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Editor Font Size</label>
                  <p className="text-[11px] text-neutral-500">Controls the font size in pixels in Monaco Editor.</p>
                  <input
                    type="number"
                    value={formData.fontSize}
                    onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) || 13 })}
                    min={10}
                    max={26}
                    className="w-24 bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-2 py-1 rounded focus:outline-none focus:border-[#ff6b35]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Tab Size</label>
                  <p className="text-[11px] text-neutral-500">The number of spaces equal to a tab.</p>
                  <select
                    value={formData.tabSize}
                    onChange={(e) => setFormData({ ...formData, tabSize: parseInt(e.target.value) || 2 })}
                    className="bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-2 py-1 rounded focus:outline-none focus:border-[#ff6b35]"
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#24130d]">
                  <div>
                    <div className="font-semibold text-neutral-200">Word Wrap</div>
                    <div className="text-[11px] text-neutral-500">Controls whether lines should wrap or scroll horizontally.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.wordWrap}
                    onChange={(e) => setFormData({ ...formData, wordWrap: e.target.checked })}
                    className="w-4 h-4 accent-[#ff6b35]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#24130d]">
                  <div>
                    <div className="font-semibold text-neutral-200">Auto Save</div>
                    <div className="text-[11px] text-neutral-500">Automatically save modified files after delay.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoSave}
                    onChange={(e) => setFormData({ ...formData, autoSave: e.target.checked })}
                    className="w-4 h-4 accent-[#ff6b35]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Default Shell Path</label>
                  <p className="text-[11px] text-neutral-500">Path to shell executable on macOS (e.g. /bin/zsh).</p>
                  <input
                    type="text"
                    value={formData.defaultShell}
                    onChange={(e) => setFormData({ ...formData, defaultShell: e.target.value })}
                    className="w-full bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-3 py-1.5 rounded focus:outline-none focus:border-[#ff6b35] font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Terminal Font Size</label>
                  <p className="text-[11px] text-neutral-500">Controls terminal font rendering size.</p>
                  <input
                    type="number"
                    value={formData.terminalFontSize}
                    onChange={(e) => setFormData({ ...formData, terminalFontSize: parseInt(e.target.value) || 12 })}
                    min={10}
                    max={20}
                    className="w-24 bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-2 py-1 rounded focus:outline-none focus:border-[#ff6b35]"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Default AI Model</label>
                  <select
                    value={formData.defaultModel}
                    onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                    className="w-full bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-3 py-1.5 rounded focus:outline-none focus:border-[#ff6b35]"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-pro">Google Gemini 2.5 Pro</option>
                    <option value="claude-3-7-sonnet">Anthropic Claude 3.7 Sonnet</option>
                    <option value="gpt-4o">OpenAI GPT-4o</option>
                    <option value="ollama-local">Ollama DeepSeek-R1 (Local)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Google Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showKey.gemini ? 'text' : 'password'}
                      value={formData.apiKeyGemini}
                      onChange={(e) => setFormData({ ...formData, apiKeyGemini: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-3 py-1.5 rounded pr-8 font-mono text-[11px] focus:outline-none focus:border-[#ff6b35]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('gemini')}
                      className="absolute right-2 top-2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showKey.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-200">Anthropic API Key</label>
                  <div className="relative">
                    <input
                      type={showKey.anthropic ? 'text' : 'password'}
                      value={formData.apiKeyAnthropic}
                      onChange={(e) => setFormData({ ...formData, apiKeyAnthropic: e.target.value })}
                      placeholder="sk-ant-..."
                      className="w-full bg-[#1c0f0a] border border-[#30160d] text-neutral-200 px-3 py-1.5 rounded pr-8 font-mono text-[11px] focus:outline-none focus:border-[#ff6b35]"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('anthropic')}
                      className="absolute right-2 top-2 text-neutral-500 hover:text-neutral-300"
                    >
                      {showKey.anthropic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#24130d]">
                  <div>
                    <div className="font-semibold text-neutral-200">Auto-Approve Read Operations</div>
                    <div className="text-[11px] text-neutral-500">Allow AI agents to read files and search codebase without prompt.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoApproveSafeTools}
                    onChange={(e) => setFormData({ ...formData, autoApproveSafeTools: e.target.checked })}
                    className="w-4 h-4 accent-[#ff6b35]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 px-4 bg-[#100805] border-t border-[#24130d] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-green-400 text-xs flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Settings saved successfully!</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-3 py-1.5 bg-[#1b0f0a] hover:bg-neutral-800 text-neutral-300 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#ff6b35] hover:bg-[#ff804d] text-black font-semibold rounded text-xs shadow-[0_2px_8px_rgba(255,107,53,0.3)] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
