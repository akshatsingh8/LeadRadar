import React from 'react';
import { Clock, Calendar, History as HistoryIcon } from 'lucide-react';

export default function History({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 p-8 bg-slate-50 dark:bg-slate-900">
                <HistoryIcon size={36} className="mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No session history yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 text-center">Completed lead scraping sessions will appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50/90 dark:bg-slate-800/90 sticky top-0 shadow-2xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-2.5">Date & Time</th>
                            <th className="p-2.5">Search Query</th>
                            <th className="p-2.5 text-right">Leads</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {history.slice().reverse().map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                        <Calendar size={11} className="opacity-50 text-slate-400" />
                                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                        <span className="text-slate-400 text-[10px]">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-2.5 font-medium text-slate-900 dark:text-white truncate max-w-[160px]">
                                    {item.keyword || 'Search Results'}
                                </td>
                                <td className="p-2.5 text-right font-bold text-blue-600 dark:text-blue-400 font-mono">
                                    {item.count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-right">
                {history.length} sessions recorded
            </div>
        </div>
    );
}
