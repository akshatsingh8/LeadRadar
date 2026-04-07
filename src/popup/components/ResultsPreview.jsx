import React from 'react';

export default function ResultsPreview({ lastLead }) {
    if (!lastLead) return null;

    return (
        <div className="mx-4 mb-4 p-4 bg-blue-50 dark:from-blue-900/30 dark:to-transparent border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-sm">
            <p className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Latest Lead
            </p>
            <div className="font-bold text-gray-900 dark:text-white truncate text-base">{lastLead.name}</div>
            {lastLead.phone && <div className="text-gray-800 dark:text-gray-300 font-mono text-sm mt-1 font-semibold">{lastLead.phone}</div>}
            {lastLead.address && <div className="text-gray-700 dark:text-gray-400 text-xs truncate mt-1">{lastLead.address}</div>}
        </div>
    );
}
