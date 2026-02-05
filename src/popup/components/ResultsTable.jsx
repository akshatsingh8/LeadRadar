import React, { useState } from 'react';
import { ArrowUpDown, Search, Copy, Trash2 } from 'lucide-react';

export default function ResultsTable({ leads, onCopy, onClear }) {
    const [filter, setFilter] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredLeads = leads.filter(lead =>
        Object.values(lead).some(val =>
            String(val).toLowerCase().includes(filter.toLowerCase())
        )
    );

    const sortedLeads = [...filteredLeads].sort((a, b) => {
        if (!sortField) return 0;
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';

        if (sortField === 'rating' || sortField === 'reviews') {
            return sortDirection === 'asc'
                ? (parseFloat(aVal) || 0) - (parseFloat(bVal) || 0)
                : (parseFloat(bVal) || 0) - (parseFloat(aVal) || 0);
        }

        return sortDirection === 'asc'
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    const SortHeader = ({ field, children }) => (
        <th
            className="p-2 font-semibold border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown size={12} className={`opacity-50 ${sortField === field ? 'opacity-100 text-blue-500' : ''}`} />
            </div>
        </th>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 tab-content">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex gap-2">
                <div className="flex-1 relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter results..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => onCopy(sortedLeads)}
                    className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded border border-blue-200 dark:border-blue-700 transition-colors flex items-center gap-1"
                    title="Copy to Clipboard"
                >
                    <Copy size={14} /> Copy
                </button>
                <button
                    onClick={onClear}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded border border-red-200 dark:border-red-700 transition-colors flex items-center gap-1"
                    title="Clear Data"
                >
                    <Trash2 size={14} /> Clear
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 shadow-sm text-gray-700 dark:text-gray-300">
                        <tr>
                            <SortHeader field="name">Name</SortHeader>
                            <SortHeader field="phone">Phone</SortHeader>
                            <SortHeader field="rating">Rating</SortHeader>
                            <th className="p-2 font-semibold border-b border-gray-200 dark:border-gray-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {sortedLeads.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors animate-fade-in">
                                <td className="p-2 max-w-[120px] truncate text-gray-900 dark:text-white" title={lead.name}>{lead.name}</td>
                                <td className="p-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{lead.phone || '-'}</td>
                                <td className="p-2 text-gray-700 dark:text-gray-300">{lead.rating || '-'} <span className="text-gray-500 dark:text-gray-400">({lead.reviews || 0})</span></td>
                                <td className="p-2 max-w-[80px] truncate text-gray-700 dark:text-gray-300">{lead.status || '-'}</td>
                            </tr>
                        ))}
                        {sortedLeads.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
                                    {leads.length === 0 ? 'No leads scraped yet. Start scraping to see data here.' : 'No results match your filter.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-600">
                Showing {sortedLeads.length} of {leads.length} rows
            </div>
        </div>
    );
}
