import React from 'react';
import { Settings as SettingsIcon, Key, Moon, Sun, Info, PlayCircle, Globe, Download, CheckCircle2 } from 'lucide-react';

export default function Settings({ settings, onToggle, darkMode, onToggleDarkMode }) {
    const hasApiKey = !!settings.apiKey;

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-12">
            {/* Header section */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon size={28} className="text-blue-600 animate-spin-slow" />
                    Configuration
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fine-tune the extraction engine and system behavior.</p>
            </div>

            {/* Instruction Section - Premium Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10 rotate-12">
                    <Info size={120} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Quick Start Guide
                </h3>
                <div className="space-y-3 relative z-10">
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                        <p className="text-[11px] font-medium leading-relaxed">Search for any business or keyword on <b>Google Maps</b> (e.g., "Plumbers in New York").</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                        <p className="text-[11px] font-medium leading-relaxed">Ensure your <b>Gemini API Key</b> is connected below for Smart Mode.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                        <p className="text-[11px] font-medium leading-relaxed">Click <b>"Start Scraping"</b> in the dashboard. Watch leads populate in real-time!</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shrink-0">4</div>
                        <p className="text-[11px] font-medium leading-relaxed">Once finished, head to the <b>Data tab</b> to export your CSV.</p>
                    </div>
                </div>
            </div>

            {/* AI Status Card */}
            <div className={`p-4 rounded-xl border-2 transition-all shadow-sm ${hasApiKey ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">ENGINE STATUS</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${hasApiKey ? 'bg-green-500 text-white' : 'bg-red-500 text-white animate-pulse'}`}>
                        {hasApiKey ? 'READY' : 'CREDENTIALS MISSING'}
                    </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {hasApiKey 
                        ? 'Smart Extraction is active. Processing leads in real-time with ultra-low latency fallback chain.' 
                        : 'Smart Extraction is disabled. Add an API key to enable AI-powered lead scrubbing and enrichment.'}
                </p>
            </div>

            {/* AI Settings Section */}
            <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                    <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">AI CONFIGURATION</h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">Preferred Provider</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => onToggle('aiProvider', 'gemini')}
                                className={`group py-3 text-[10px] font-bold rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${settings.aiProvider !== 'openrouter' ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-blue-200'}`}
                            >
                                <CheckCircle2 size={14} className={settings.aiProvider !== 'openrouter' ? "opacity-100" : "opacity-0"} />
                                GOOGLE STUDIO
                            </button>
                            <button 
                                onClick={() => onToggle('aiProvider', 'openrouter')}
                                className={`group py-3 text-[10px] font-bold rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${settings.aiProvider === 'openrouter' ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-purple-200'}`}
                            >
                                <Globe size={14} className={settings.aiProvider === 'openrouter' ? "opacity-100" : "opacity-0"} />
                                OPENROUTER
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">
                            {settings.aiProvider === 'openrouter' ? 'OpenRouter API Key' : 'Google AI Studio API Key'}
                        </label>
                        <div className="relative group">
                            <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input 
                                type="password" 
                                className="w-full pl-11 pr-4 py-4 text-sm bg-gray-50 dark:bg-gray-800/80 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white shadow-inner"
                                placeholder={settings.aiProvider === 'openrouter' ? (settings.openRouterKey ? "••••••••••••••••" : "sk-or-v1-...") : (settings.apiKey ? "••••••••••••••••" : "AIza...")}
                                value={settings.aiProvider === 'openrouter' ? (settings.openRouterKey || '') : (settings.apiKey || '')}
                                onChange={(e) => onToggle(settings.aiProvider === 'openrouter' ? 'openRouterKey' : 'apiKey', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2 ml-1">LLM Model Engine</label>
                        <div className="relative">
                            <select 
                                className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-800/80 border-2 border-transparent rounded-2xl focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white shadow-inner appearance-none cursor-pointer"
                                value={settings.aiModel || (settings.aiProvider === 'openrouter' ? 'openai/gpt-oss-120b:free' : 'gemini-3.1-flash-lite-preview')}
                                onChange={(e) => onToggle('aiModel', e.target.value)}
                            >
                                {settings.aiProvider === 'openrouter' ? (
                                    <>
                                        <option value="openai/gpt-oss-120b:free">🧠 GPT-OSS 120B (Reasoning)</option>
                                        <option value="google/gemini-2.0-flash-001">⚡ Gemini 2.0 Flash</option>
                                        <option value="anthropic/claude-3.5-sonnet">🎭 Claude 3.5 Sonnet</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="gemini-3.1-flash-lite-preview">⚡ Gemini 3.1 Flash Lite</option>
                                        <option value="gemini-3.1-pro-preview">💎 Gemini 3.1 Pro</option>
                                    </>
                                )}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                ▼
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1.5 italic px-1">
                            <CheckCircle2 size={10} className="text-green-500" /> Real-time extraction enabled with 5s serial delay.
                        </p>
                    </div>
                </div>
            </div>

            {/* Behavioral Settings */}
            <div className="space-y-4 pt-4 border-t-2 border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">BEHAVIORAL ENGINE</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Toggle
                        label="Human-like Simulation"
                        description="Randomized delays during map interaction"
                        checked={settings.humanBehavior}
                        onChange={() => onToggle('humanBehavior')}
                    />
                    <Toggle
                        label="Vertical Autoscroll"
                        description="Force scroll list to trigger lazy loading"
                        checked={settings.autoScroll}
                        onChange={() => onToggle('autoScroll')}
                    />
                    <Toggle
                        label="Smart Next Page"
                        description="Auto-click pagination when list ends"
                        checked={settings.autoNextPage}
                        onChange={() => onToggle('autoNextPage')}
                    />
                </div>
            </div>

            {/* Appearance */}
            <div className="pt-4 border-t-2 border-gray-50 dark:border-gray-800">
                <button 
                    onClick={onToggleDarkMode}
                    className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-500'}`}>
                            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-bold text-gray-800 dark:text-gray-100">Interface Theme</span>
                            <span className="block text-[10px] text-gray-500">{darkMode ? 'Dark Mode Active' : 'Light Mode Active'}</span>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </button>
            </div>

            {/* Version Footer */}
            <div className="pt-4 flex flex-col items-center gap-1 opacity-20">
                <div className="flex items-center gap-4 text-[9px] font-black tracking-[0.2em] text-gray-500">
                    <span>LEADRADAR PRO</span>
                    <span>•</span>
                    <span>v1.0.8 STABLE</span>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group p-3 bg-white dark:bg-gray-900 border-2 border-gray-50 dark:border-gray-800 rounded-2xl hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
            <div className="space-y-0.5">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 block">{label}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 block">{description}</span>
            </div>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
                <div className={`w-11 h-6 rounded-full shadow-inner transition-all ${checked ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform ${checked ? 'transform translate-x-5' : ''}`}></div>
            </div>
        </label>
    );
}
