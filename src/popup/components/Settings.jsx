import React from 'react';
import {
    Settings as SettingsIcon,
    KeyRound,
    Moon,
    Sun,
    CheckCircle2,
    ShieldCheck,
    Globe,
    Sparkles,
    Scroll,
    UserCheck,
    ChevronsRight,
    ChevronDown
} from 'lucide-react';

export default function Settings({ settings, onToggle, darkMode, onToggleDarkMode }) {
    const hasApiKey = settings.aiProvider === 'openrouter' ? !!settings.openRouterKey : !!settings.apiKey;

    return (
        <div className="p-4 space-y-5 select-none pb-8 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <SettingsIcon size={18} className="text-blue-600" />
                        Settings & Preferences
                    </h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                        Configure scraper behavior and intelligence models.
                    </p>
                </div>
            </div>

            {/* Engine Status Card */}
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        Extraction Engine
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                        <CheckCircle2 size={10} /> Active
                    </span>
                </div>
                <p className="text-[11px] text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    Direct DOM parsing captures names, phones, categories, addresses, ratings, and business hours directly from Google Maps results.
                </p>
            </div>

            {/* AI Enhancement Section */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <div className="h-3 w-1 bg-blue-600 rounded-full"></div>
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            AI Data Cleaning (Optional)
                        </h3>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                        hasApiKey
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                        {hasApiKey ? 'Key Connected' : 'Not Configured'}
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 space-y-3 shadow-2xs">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                            AI Provider
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => onToggle('aiProvider', 'gemini')}
                                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                                    settings.aiProvider !== 'openrouter'
                                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <Sparkles size={13} />
                                <span>Google Gemini</span>
                            </button>
                            <button
                                onClick={() => onToggle('aiProvider', 'openrouter')}
                                className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                                    settings.aiProvider === 'openrouter'
                                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-700 dark:text-purple-300 shadow-2xs'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                <Globe size={13} />
                                <span>OpenRouter</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                            {settings.aiProvider === 'openrouter' ? 'OpenRouter API Key' : 'Google AI Studio Key'}
                        </label>
                        <div className="relative">
                            <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all dark:text-white"
                                placeholder={settings.aiProvider === 'openrouter' ? "sk-or-v1-..." : "AIzaSy..."}
                                value={settings.aiProvider === 'openrouter' ? (settings.openRouterKey || '') : (settings.apiKey || '')}
                                onChange={(e) => onToggle(settings.aiProvider === 'openrouter' ? 'openRouterKey' : 'apiKey', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                            Model Selection
                        </label>
                        <div className="relative">
                            <select
                                className="w-full p-2 pr-8 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                value={settings.aiModel || (settings.aiProvider === 'openrouter' ? 'openai/gpt-oss-120b:free' : 'gemini-3.1-flash-lite-preview')}
                                onChange={(e) => onToggle('aiModel', e.target.value)}
                            >
                                {settings.aiProvider === 'openrouter' ? (
                                    <>
                                        <option value="openai/gpt-oss-120b:free">GPT-OSS 120B (Free OpenRouter Tier)</option>
                                        <option value="google/gemini-2.0-flash-001">Gemini 2.0 Flash</option>
                                        <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (High Speed)</option>
                                        <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Advanced)</option>
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                    </>
                                )}
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Behavioral Settings */}
            <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5">
                    <div className="h-3 w-1 bg-emerald-600 rounded-full"></div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Automation & Navigation
                    </h3>
                </div>
                <div className="space-y-2">
                    <Toggle
                        icon={Scroll}
                        label="Auto Scrolling"
                        description="Automatically scroll Google Maps results feed to load leads"
                        checked={settings.autoScroll}
                        onChange={(val) => onToggle('autoScroll', val)}
                    />
                    <Toggle
                        icon={UserCheck}
                        label="Human-like Simulation"
                        description="Randomized delays during map interaction to avoid rate limits"
                        checked={settings.humanBehavior}
                        onChange={(val) => onToggle('humanBehavior', val)}
                    />
                    <Toggle
                        icon={ChevronsRight}
                        label="Smart Next Page"
                        description="Auto-click pagination when reaching the end of current list"
                        checked={settings.autoNextPage}
                        onChange={(val) => onToggle('autoNextPage', val)}
                    />
                    <Toggle
                        icon={Globe}
                        label="Website Contact Enrichment"
                        description="Crawl business websites in background for email and phone"
                        checked={settings.deepEnrichment !== false}
                        onChange={(val) => onToggle('deepEnrichment', val)}
                    />
                </div>
            </div>

            {/* Theme & Appearance */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div
                    onClick={onToggleDarkMode}
                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl cursor-pointer hover:border-slate-300 transition-all"
                >
                    <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-500'}`}>
                            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                                {darkMode ? 'Dark Theme' : 'Light Theme'}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                                Click to toggle appearance
                            </span>
                        </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 ${darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>
            </div>

            {/* Version Footer */}
            <div className="text-center pt-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    LeadRadar Pro v1.0.8
                </span>
            </div>
        </div>
    );
}

function Toggle({ label, description, checked, onChange, icon: IconComponent }) {
    const isChecked = Boolean(checked);
    return (
        <div
            onClick={() => onChange(!isChecked)}
            className={`flex items-center justify-between cursor-pointer p-3 bg-white dark:bg-slate-800 border rounded-xl transition-all select-none ${
                isChecked
                    ? 'border-blue-200 dark:border-blue-900/60 bg-blue-50/20'
                    : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
            }`}
        >
            <div className="flex items-start gap-2.5 pr-2">
                {IconComponent && (
                    <div className={`mt-0.5 p-1 rounded-md ${isChecked ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400'}`}>
                        <IconComponent size={14} />
                    </div>
                )}
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{label}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider ${
                            isChecked
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                            {isChecked ? 'ON' : 'OFF'}
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block leading-tight">
                        {description}
                    </span>
                </div>
            </div>
            <div className="relative shrink-0">
                <div className={`w-10 h-5 rounded-full transition-colors flex items-center p-0.5 ${isChecked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-xs transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
            </div>
        </div>
    );
}
