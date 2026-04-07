import React, { useState } from 'react';
import { ArrowUpDown, Search, Copy, Trash2, Mail, Linkedin, Globe, MapPin, Phone } from 'lucide-react';

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
            className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none text-left min-w-[120px]"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-1">
                {children}
                <ArrowUpDown size={12} className={`opacity-50 ${sortField === field ? 'opacity-100 text-blue-500' : ''}`} />
            </div>
        </th>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black flex gap-2 items-center flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter all fields..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onCopy(sortedLeads)}
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors flex items-center gap-2"
                        title="Copy to Clipboard"
                    >
                        <Copy size={16} /> Copy
                    </button>
                    <button
                        onClick={onClear}
                        className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-2"
                        title="Clear Data"
                    >
                        <Trash2 size={16} /> Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <table className="w-full text-sm border-collapse text-left whitespace-nowrap">
                    <thead className="bg-white dark:bg-gray-950 sticky top-0 shadow-sm text-gray-700 dark:text-gray-300 z-10">
                        <tr>
                            <SortHeader field="name">Business Name</SortHeader>
                            <SortHeader field="city">Location</SortHeader>
                            <SortHeader field="category">Category</SortHeader>
                            <SortHeader field="phone">Contact</SortHeader>
                            <SortHeader field="email">Email</SortHeader>
                            <SortHeader field="websitePhone">Website Phone</SortHeader>
                            <SortHeader field="rating">Rating</SortHeader>
                            <th className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700 text-left">Socials & Web</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
                        {sortedLeads.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors group">
                                <td className="p-3 max-w-[200px]" title={lead.name}>
                                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{lead.name}</div>
                                    <div className="text-[10px] text-gray-500 truncate">{lead.address}</div>
                                </td>
                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                    {lead.city ? `${lead.city}, ${lead.state || ''}` : <span className="text-gray-400 italic text-xs">Parsing...</span>}
                                </td>
                                <td className="p-3 max-w-[150px] truncate">
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                        {lead.category || 'N/A'}
                                    </span>
                                </td>
                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                    <div className="flex flex-col gap-0.5">
                                        {lead.phone && <div className="flex items-center gap-1"><Phone size={10} className="text-gray-400"/> {lead.phone}</div>}
                                        {lead.mobile && <div className="flex items-center gap-1 text-blue-500 font-bold"><Phone size={10} /> {lead.mobile}</div>}
                                        {!lead.phone && !lead.mobile && '-'}
                                    </div>
                                </td>
                                <td className="p-3 max-w-[180px] truncate text-gray-700 dark:text-gray-300">
                                    {lead.email ? (
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                            <Mail size={14} /> 
                                            <span className="truncate font-semibold">{lead.email}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic text-[10px]">Searching...</span>
                                    )}
                                </td>
                                <td className="p-3 truncate text-gray-700 dark:text-gray-300">
                                    {lead.websitePhone ? (
                                        <div className="flex items-center gap-1">
                                            <Phone size={12} className="text-green-500" />
                                            <span className="font-medium text-green-600 dark:text-green-400">{lead.websitePhone}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {lead.rating ? (
                                        <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-gray-100">
                                            <span>⭐ {lead.rating}</span>
                                            <span className="text-[10px] text-gray-500 font-normal">({lead.reviews})</span>
                                        </div>
                                    ) : '-'}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        {lead.website && (
                                            <a href={lead.website} target="_blank" rel="noreferrer" title={lead.website} className="text-gray-400 hover:text-blue-500 transition-colors">
                                                <Globe size={18} />
                                            </a>
                                        )}
                                        {lead.linkedin && (
                                            <a href={lead.linkedin} target="_blank" rel="noreferrer" title="LinkedIn Found" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                        {lead.facebook && (
                                            <a href={lead.facebook} target="_blank" rel="noreferrer" title="Facebook Found" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <div className="w-[18px] h-[18px] flex items-center justify-center font-bold font-serif">f</div>
                                            </a>
                                        )}
                                        {lead.instagram && (
                                            <a href={lead.instagram} target="_blank" rel="noreferrer" title="Instagram Found" className="text-gray-400 hover:text-pink-600 transition-colors">
                                                <div className="w-[18px] h-[18px] flex items-center justify-center font-bold">ig</div>
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sortedLeads.length === 0 && (
                            <tr>
                                <td colSpan="8" className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <MapPin size={32} className="opacity-20" />
                                        <p>{leads.length === 0 ? 'No leads scraped yet. Start a search on Google Maps.' : 'No results match your filter.'}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-3 bg-white dark:bg-gray-950 text-xs font-medium text-gray-500 dark:text-gray-400 flex justify-between items-center border-t border-gray-200 dark:border-gray-800">
                <span>Showing {sortedLeads.length} entries</span>
                <span>Enriched Pro Data</span>
            </div>
        </div>
    );
}
