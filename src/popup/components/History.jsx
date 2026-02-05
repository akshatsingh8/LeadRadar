import React from 'react';
import { Clock, Calendar } from 'lucide-react';

export default function History({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8 tab-content bg-white dark:bg-transparent">
                <Clock size={48} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">No history yet</p>
                <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Complete a scraping session to see it here</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 tab-content">
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 shadow-sm text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="p-3 font-semibold border-b border-gray-200 dark:border-gray-600">Date</th>
                            <th className="p-3 font-semibold border-b border-gray-200 dark:border-gray-600">Keyword</th>
                            <th className="p-3 font-semibold border-b border-gray-200 dark:border-gray-600 text-right">Leads</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {history.slice().reverse().map((item, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors animate-fade-in">
                                <td className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={12} className="opacity-50" />
                                        {new Date(item.timestamp).toLocaleDateString()}
                                        <span className="text-gray-500 dark:text-gray-500 text-[10px]">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3 font-medium text-gray-900 dark:text-white">{item.keyword || '-'}</td>
                                <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{item.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
