import React from 'react';
import { Moon, Sun } from 'lucide-react';

export default function Settings({ settings, onToggle, darkMode, onToggleDarkMode }) {
    return (
        <div className="p-4 border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent">
            <h3 className="text-xs font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Settings</h3>
            <div className="space-y-2">
                <Toggle
                    label="Human-like Behavior"
                    checked={settings.humanBehavior}
                    onChange={() => onToggle('humanBehavior')}
                />
                <Toggle
                    label="Auto Scroll Results"
                    checked={settings.autoScroll}
                    onChange={() => onToggle('autoScroll')}
                />
                <Toggle
                    label="Auto Next Page"
                    checked={settings.autoNextPage}
                    onChange={() => onToggle('autoNextPage')}
                />
                <div className="pt-3 border-t-2 border-gray-200 dark:border-gray-700 mt-2">
                    <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-2 transition-colors">
                            {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                            Dark Mode
                        </span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={darkMode} onChange={onToggleDarkMode} />
                            <div className={`w-11 h-6 rounded-full shadow-md transition-all ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform ${darkMode ? 'transform translate-x-5' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-green-50 dark:hover:bg-gray-800 transition-colors">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
                <div className={`w-11 h-6 rounded-full shadow-md transition-all ${checked ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow-md transition-transform ${checked ? 'transform translate-x-5' : ''}`}></div>
            </div>
        </label>
    );
}
