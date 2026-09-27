import React, { useState } from 'react';
import { useIDE } from '../context/IDEContext';
import { DEFAULT_APP_SETTINGS } from '../services/api';
import {
  Sliders,
  X,
  Check,
  Bot,
  Type,
  Code,
  Shield,
  Palette,
  Terminal,
  Key,
  GitBranch,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

type TabCategory = 'general' | 'editor' | 'ai' | 'appearance' | 'terminal' | 'keys' | 'git';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, settings, setSettings } = useIDE();
  const [activeTab, setActiveTab] = useState<TabCategory>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  if (!isSettingsOpen) return null;

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_APP_SETTINGS);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2000);
  };

  const categories: { id: TabCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Sliders className="w-4 h-4 text-amber-400" /> },
    { id: 'editor', label: 'Editor', icon: <Type className="w-4 h-4 text-orange-400" /> },
    { id: 'ai', label: 'AI & Swarm', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4 text-pink-400" /> },
    { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-4 h-4 text-emerald-400" /> },
    { id: 'keys', label: 'API Keys', icon: <Key className="w-4 h-4 text-purple-400" /> },
    { id: 'git', label: 'Git & Safety', icon: <GitBranch className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        className="w-full max-w-4xl h-[560px] bg-[#120a07] border border-[#3d1d13] rounded-2xl shadow-2xl overflow-hidden flex flex-col select-none relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-[#2a160f] flex items-center justify-between bg-[#180d09]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#27120a] border border-[#ff6b35]/30 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100 uppercase tracking-wider font-mono">
                Kernel Base Preferences
              </h2>
              <p className="text-[11px] text-neutral-400">Configure workspace defaults & persist settings</p>
            </div>
          </div>

          {/* Search bar inside modal */}
          <div className="flex items-center space-x-3">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b0604] border border-[#2b140c] rounded-lg pl-8 pr-3 py-1 text-xs text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
              />
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="text-neutral-400 hover:text-neutral-100 p-1.5 rounded-lg hover:bg-[#28140d] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Split 2-Column Sidebar + Content) */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar Categories */}
          <div className="w-48 bg-[#0b0604] border-r border-[#26130b] p-3 space-y-1 overflow-y-auto shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id);
                  setSearchQuery('');
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === cat.id && !searchQuery
                    ? 'bg-[#27130b] text-[#ff6b35] border border-[#4d2315]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#180d08]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Right Setting Options Content */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs bg-[#120a07]">
            {/* CATEGORY: GENERAL */}
            {(activeTab === 'general' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Sliders className="w-4 h-4" />
                    <span>General Preferences</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Workspace defaults and workspace behavior</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Auto Save Changes</div>
                      <div className="text-[11px] text-neutral-400">Automatically save modified files after editing</div>
                    </div>
                    <button
                      onClick={() => updateSetting('autoSave', !settings.autoSave)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.autoSave ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.autoSave ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Show Breadcrumbs</div>
                      <div className="text-[11px] text-neutral-400">Display navigation path bar at top of editor</div>
                    </div>
                    <button
                      onClick={() => updateSetting('showBreadcrumbs', !settings.showBreadcrumbs)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.showBreadcrumbs ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.showBreadcrumbs ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-2">
                    <div className="font-semibold text-neutral-200">UI Density</div>
                    <div className="text-[11px] text-neutral-400">Controls spacing and padding throughout the IDE</div>
                    <select
                      value={settings.uiDensity}
                      onChange={(e) => updateSetting('uiDensity', e.target.value as any)}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                    >
                      <option value="compact">Compact (Higher Density)</option>
                      <option value="normal">Normal (Recommended)</option>
                      <option value="comfortable">Comfortable (Relaxed Spacing)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY: EDITOR */}
            {(activeTab === 'editor' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Type className="w-4 h-4" />
                    <span>Monaco Code Editor</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Customize font, tab spacing, and editor visual features</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                    <label className="font-semibold text-neutral-200 block">Font Size (px)</label>
                    <input
                      type="number"
                      value={settings.fontSize}
                      onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                    />
                  </div>

                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                    <label className="font-semibold text-neutral-200 block">Tab Size (spaces)</label>
                    <input
                      type="number"
                      value={settings.tabSize}
                      onChange={(e) => updateSetting('tabSize', Number(e.target.value))}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                  <label className="font-semibold text-neutral-200 block">Font Family</label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => updateSetting('fontFamily', e.target.value)}
                    className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                  >
                    <option value="'JetBrains Mono', 'Fira Code', monospace">JetBrains Mono / Fira Code</option>
                    <option value="'Fira Code', monospace">Fira Code</option>
                    <option value="Consolas, 'Courier New', monospace">Consolas</option>
                    <option value="'Source Code Pro', monospace">Source Code Pro</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Word Wrap</div>
                      <div className="text-[10px] text-neutral-400">Wrap long lines</div>
                    </div>
                    <button
                      onClick={() => updateSetting('wordWrap', !settings.wordWrap)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.wordWrap ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.wordWrap ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Minimap</div>
                      <div className="text-[10px] text-neutral-400">Code overview sidebar</div>
                    </div>
                    <button
                      onClick={() => updateSetting('minimap', !settings.minimap)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.minimap ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.minimap ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Line Numbers</div>
                      <div className="text-[10px] text-neutral-400">Display gutter numbers</div>
                    </div>
                    <button
                      onClick={() => updateSetting('lineNumbers', !settings.lineNumbers)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.lineNumbers ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.lineNumbers ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Bracket Colorization</div>
                      <div className="text-[10px] text-neutral-400">Highlight matching pairs</div>
                    </div>
                    <button
                      onClick={() => updateSetting('bracketPairColorization', !settings.bracketPairColorization)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.bracketPairColorization ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.bracketPairColorization ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY: AI & SWARM */}
            {(activeTab === 'ai' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <span>AI Agent Swarm & Foundation Model</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Select model providers and orchestrator parameters</p>
                </div>

                <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                  <label className="font-semibold text-neutral-200 block">AI Agent Foundation Model</label>
                  <select
                    value={settings.defaultModel}
                    onChange={(e) => updateSetting('defaultModel', e.target.value)}
                    className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                  >
                    <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Recommended - Fast & Code Intelligence)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Context Window)</option>
                    <option value="gpt-4o">GPT-4o (Multimodal Reasoning)</option>
                    <option value="deepseek-r1">DeepSeek R1 (Local / Private Ollama)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                    <label className="font-semibold text-neutral-200 block">Agent Temperature ({settings.agentTemperature})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.agentTemperature}
                      onChange={(e) => updateSetting('agentTemperature', parseFloat(e.target.value))}
                      className="w-full accent-[#ff6b35]"
                    />
                  </div>

                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                    <label className="font-semibold text-neutral-200 block">Max Token Generation</label>
                    <select
                      value={settings.maxTokens}
                      onChange={(e) => updateSetting('maxTokens', Number(e.target.value))}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                    >
                      <option value={4096}>4,096 tokens</option>
                      <option value={8192}>8,192 tokens (Default)</option>
                      <option value={16384}>16,384 tokens</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                  <div>
                    <div className="font-semibold text-neutral-200">Stream Realtime Thoughts</div>
                    <div className="text-[11px] text-neutral-400">Show step-by-step reasoning inside Agent Panel</div>
                  </div>
                  <button
                    onClick={() => updateSetting('streamThoughts', !settings.streamThoughts)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      settings.streamThoughts ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        settings.streamThoughts ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: APPEARANCE */}
            {(activeTab === 'appearance' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Appearance & Themes</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Customize UI theme and accent color</p>
                </div>

                <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-2">
                  <label className="font-semibold text-neutral-200 block">Theme Preset</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dark', label: 'Kernel Dark (Default)', color: '#ff6b35' },
                      { id: 'cyberpunk', label: 'Cyberpunk Neon', color: '#00f0ff' },
                      { id: 'dracula', label: 'Dracula Night', color: '#bd93f9' },
                      { id: 'monokai', label: 'Monokai Pro', color: '#a6e22e' },
                    ].map((themeItem) => (
                      <button
                        key={themeItem.id}
                        onClick={() => updateSetting('theme', themeItem.id as any)}
                        className={`p-3 rounded-lg border flex items-center space-x-2 transition-all ${
                          settings.theme === themeItem.id
                            ? 'border-[#ff6b35] bg-[#27130c]'
                            : 'border-[#2c140a] bg-[#0d0704] hover:bg-[#180e0a]'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: themeItem.color }} />
                        <span className="text-neutral-200 font-medium">{themeItem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY: TERMINAL */}
            {(activeTab === 'terminal' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Terminal className="w-4 h-4" />
                    <span>Integrated Terminal</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Shell executable, font size, and scrollback settings</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                    <label className="font-semibold text-neutral-200 block">Default Shell Executable</label>
                    <select
                      value={settings.terminalShell}
                      onChange={(e) => updateSetting('terminalShell', e.target.value as any)}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                    >
                      <option value="default">System Default (PowerShell/Bash)</option>
                      <option value="powershell">PowerShell 7 / Windows PowerShell</option>
                      <option value="cmd">Command Prompt (cmd.exe)</option>
                      <option value="bash">Git Bash / WSL Bash</option>
                    </select>
                  </div>

                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1.5">
                    <label className="font-semibold text-neutral-200 block">Terminal Font Size (px)</label>
                    <input
                      type="number"
                      value={settings.terminalFontSize}
                      onChange={(e) => updateSetting('terminalFontSize', Number(e.target.value))}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                  <div>
                    <div className="font-semibold text-neutral-200">Terminal Cursor Blinking</div>
                    <div className="text-[11px] text-neutral-400">Animate terminal cursor pulse</div>
                  </div>
                  <button
                    onClick={() => updateSetting('terminalCursorBlink', !settings.terminalCursorBlink)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      settings.terminalCursorBlink ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                        settings.terminalCursorBlink ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* CATEGORY: API KEYS */}
            {(activeTab === 'keys' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>API Keys & Local Endpoints</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Securely store authentication tokens for LLM providers</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1">
                    <label className="font-semibold text-neutral-200 block">Anthropic API Key (Claude)</label>
                    <input
                      type="password"
                      placeholder="sk-ant-..."
                      value={settings.apiKeyAnthropic || ''}
                      onChange={(e) => updateSetting('apiKeyAnthropic', e.target.value)}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35] font-mono"
                    />
                  </div>

                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1">
                    <label className="font-semibold text-neutral-200 block">Google Gemini API Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={settings.apiKeyGemini || ''}
                      onChange={(e) => updateSetting('apiKeyGemini', e.target.value)}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35] font-mono"
                    />
                  </div>

                  <div className="p-3 bg-[#170c08] border border-[#2c140a] rounded-xl space-y-1">
                    <label className="font-semibold text-neutral-200 block">Ollama Local Server URL</label>
                    <input
                      type="text"
                      placeholder="http://localhost:11434"
                      value={settings.ollamaUrl || 'http://localhost:11434'}
                      onChange={(e) => updateSetting('ollamaUrl', e.target.value)}
                      className="w-full bg-[#0b0604] border border-[#381b12] rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-[#ff6b35] font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORY: GIT & SAFETY */}
            {(activeTab === 'git' || searchQuery) && (
              <div className="space-y-4">
                <div className="border-b border-[#24120a] pb-2">
                  <h3 className="text-xs font-bold text-[#ff6b35] uppercase tracking-wider flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Autonomy, Safety & Git</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Control agent tool approval permissions and version control</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Auto-Approve Safe Read-Only Tools</div>
                      <div className="text-[11px] text-neutral-400">Allow agents to read files and search workspace without prompting</div>
                    </div>
                    <button
                      onClick={() => updateSetting('autoApproveSafeTools', !settings.autoApproveSafeTools)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.autoApproveSafeTools ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.autoApproveSafeTools ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Auto-Approve Safe File Edits</div>
                      <div className="text-[11px] text-neutral-400">Automatically apply low-risk agent code modifications</div>
                    </div>
                    <button
                      onClick={() => updateSetting('autoApproveFileEdits', !settings.autoApproveFileEdits)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.autoApproveFileEdits ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.autoApproveFileEdits ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#170c08] border border-[#2c140a] rounded-xl">
                    <div>
                      <div className="font-semibold text-neutral-200">Git Auto-Fetch</div>
                      <div className="text-[11px] text-neutral-400">Fetch remote commits periodically</div>
                    </div>
                    <button
                      onClick={() => updateSetting('gitAutoFetch', !settings.gitAutoFetch)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        settings.gitAutoFetch ? 'bg-[#ff6b35]' : 'bg-[#29140c]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          settings.gitAutoFetch ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Saved Status Indicator Banner */}
        {showSavedNotification && (
          <div className="absolute bottom-16 right-6 bg-emerald-500/90 text-neutral-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Settings Saved & Persisted</span>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#2a160f] bg-[#180d09] flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="text-neutral-400 hover:text-neutral-200 hover:bg-[#25130b] px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="bg-[#ff6b35] hover:bg-[#e85a26] text-neutral-950 font-bold px-5 py-1.5 rounded-lg transition-all text-xs shadow-md shadow-[#ff6b35]/20 flex items-center space-x-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
