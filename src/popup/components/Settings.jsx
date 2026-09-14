import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

export default function Settings({ settings, onToggle, darkMode, onToggleDarkMode }) {
    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-12">
            {/* Header section */}
            <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <SettingsIcon size={28} className="text-blue-600 animate-spin-slow" />
                    Configuration
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fine-tune the direct browser extraction engine and crawling behavior.</p>
            </div>

            {/* Engine Status Card */}
            <div className="p-4 rounded-2xl border-2 transition-all shadow-sm bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-500" /> ENGINE STATUS
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                        <CheckCircle2 size={10} /> 100% UNLIMITED & ACTIVE
                    </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    Direct Browser Extraction is running natively in your browser. Business names, phone numbers, addresses, categories, ratings, and operational hours are parsed directly without third-party API quotas or keys.
                </p>
            </div>

            {/* Data Enrichment Engine */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-1 bg-blue-600 rounded-full"></div>
                    <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">DEEP DATA ENRICHMENT</h3>
                </div>
                <Toggle
                    label="Deep Website Crawling"
                    description="Automatically visits business websites to discover direct email addresses, secondary phone numbers, and social links"
                    checked={settings.deepEnrichment !== false}
                    onChange={(val) => onToggle('deepEnrichment', val)}
                />
            </div>

            {/* Behavioral Settings */}
            <div className="space-y-4 pt-4 border-t-2 border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-1 bg-green-600 rounded-full"></div>
                    <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">BEHAVIORAL ENGINE</h3>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                    <Toggle
                        label="Auto Scrolling"
                        description="Automatically scroll Google Maps feed to continuously load leads"
                        checked={settings.autoScroll}
                        onChange={(val) => onToggle('autoScroll', val)}
                    />
                    <Toggle
                        label="Human-like Simulation"
                        description="Randomized delays during map interaction to prevent rate limits"
                        checked={settings.humanBehavior}
                        onChange={(val) => onToggle('humanBehavior', val)}
                    />
                    <Toggle
                        label="Smart Next Page"
                        description="Auto-click pagination when list reaches the end"
                        checked={settings.autoNextPage}
                        onChange={(val) => onToggle('autoNextPage', val)}
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
    const isChecked = Boolean(checked);
    return (
        <div 
            onClick={() => onChange(!isChecked)}
            className={`flex items-center justify-between cursor-pointer group p-3.5 bg-white dark:bg-gray-900 border-2 rounded-2xl transition-all select-none ${isChecked ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/20 shadow-sm' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
        >
            <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider transition-colors ${isChecked ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {isChecked ? 'ON' : 'OFF'}
                    </span>
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 block leading-tight">{description}</span>
            </div>
            <div className="relative shrink-0">
                <div className={`w-12 h-6 rounded-full shadow-inner transition-colors duration-200 flex items-center p-1 ${isChecked ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${isChecked ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
            </div>
        </div>
    );
}
