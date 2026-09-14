import React from 'react';
import { Play, Square, Download, RotateCcw } from 'lucide-react';

export default function Controls({ isScraping, onStart, onStop, onExport, onReset, hasLeads }) {
    return (
        <div className="p-4 pt-1 mt-auto">
            <div className="flex gap-2 mb-2">
                {!isScraping ? (
                    <button
                        onClick={onStart}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs transition-all shadow-xs"
                    >
                        <Play size={15} fill="currentColor" />
                        <span>Start Scraping</span>
                    </button>
                ) : (
                    <button
                        onClick={onStop}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-xs transition-all shadow-xs"
                    >
                        <Square size={14} fill="currentColor" />
                        <span>Stop Scraping</span>
                    </button>
                )}

                <button
                    onClick={onExport}
                    disabled={!hasLeads}
                    className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 font-semibold text-xs shadow-xs"
                    title="Export CSV"
                >
                    <Download size={15} />
                    <span className="hidden sm:inline">Export</span>
                </button>
            </div>

            <button
                onClick={onReset}
                disabled={!hasLeads}
                className="w-full bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-2 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-all text-xs"
                title="Reset session leads"
            >
                <RotateCcw size={13} />
                <span>Reset Leads</span>
            </button>
        </div>
    );
}
