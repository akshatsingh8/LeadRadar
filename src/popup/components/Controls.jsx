import React from 'react';
import { Play, Square, Download, RotateCcw } from 'lucide-react';

export default function Controls({ isScraping, onStart, onStop, onExport, onReset, hasLeads }) {
    return (
        <div className="p-4 pt-0 bg-white dark:bg-transparent">
            <div className="flex gap-2 mb-2">
                {!isScraping ? (
                    <button
                        onClick={onStart}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 active:scale-95 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-md hover:shadow-xl"
                    >
                        <Play size={18} fill="currentColor" /> Start Scraping
                    </button>
                ) : (
                    <button
                        onClick={onStop}
                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 active:scale-95 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-md animate-pulse"
                    >
                        <Square size={18} fill="currentColor" /> Stop
                    </button>
                )}

                <button
                    onClick={onExport}
                    disabled={!hasLeads}
                    className="bg-gradient-to-r from-gray-800 to-gray-950 dark:from-gray-700 dark:to-gray-600 hover:from-black hover:to-gray-900 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-lg transition-all flex items-center justify-center shadow-md hover:shadow-xl"
                    title="Export CSV"
                >
                    <Download size={20} />
                </button>
            </div>

            <button
                onClick={onReset}
                disabled={!hasLeads}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all shadow-md hover:shadow-lg text-sm"
                title="Reset all data"
            >
                <RotateCcw size={16} /> Reset Data
            </button>
        </div>
    );
}
