import React, { useState } from 'react';
import {
    ArrowUpDown,
    Search,
    Copy,
    Trash2,
    Mail,
    Linkedin,
    Facebook,
    Instagram,
    Twitter,
    Globe,
    MapPin,
    Phone,
    Download,
    Star
} from 'lucide-react';

function SortHeader({ field, sortField, onSort, children }) {
    return (
        <th
            className="p-2.5 font-bold border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors select-none text-left"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                <span>{children}</span>
                <ArrowUpDown size={11} className={`opacity-40 ${sortField === field ? 'opacity-100 text-blue-600 dark:text-blue-400' : ''}`} />
            </div>
        </th>
    );
}

export default function ResultsTable({ leads, onCopy, onClear, onExport }) {
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

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Clean Light Toolbar */}
            <div className="p-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex gap-2 items-center flex-wrap">
                <div className="flex-1 min-w-[160px] relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search leads..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    {onExport && (
                        <button
                            onClick={() => onExport(sortedLeads)}
                            disabled={sortedLeads.length === 0}
                            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                            title="Export CSV"
                        >
                            <Download size={13} />
                            <span>Export</span>
                        </button>
                    )}
                    <button
                        onClick={() => onCopy(sortedLeads)}
                        disabled={sortedLeads.length === 0}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                        title="Copy to Clipboard"
                    >
                        <Copy size={13} />
                        <span>Copy</span>
                    </button>
                    <button
                        onClick={onClear}
                        disabled={leads.length === 0}
                        className="px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed border border-rose-200/80 dark:border-rose-900/40 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Clear Data"
                    >
                        <Trash2 size={13} />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto bg-white dark:bg-slate-900">
                <table className="w-full text-xs border-collapse text-left whitespace-nowrap">
                    <thead className="bg-slate-50/95 dark:bg-slate-800/95 sticky top-0 shadow-2xs text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider font-bold z-10 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <SortHeader field="name" sortField={sortField} onSort={handleSort}>Business</SortHeader>
                            <SortHeader field="city" sortField={sortField} onSort={handleSort}>Location</SortHeader>
                            <SortHeader field="category" sortField={sortField} onSort={handleSort}>Category</SortHeader>
                            <SortHeader field="phone" sortField={sortField} onSort={handleSort}>Phone</SortHeader>
                            <SortHeader field="email" sortField={sortField} onSort={handleSort}>Email</SortHeader>
                            <SortHeader field="websitePhone" sortField={sortField} onSort={handleSort}>Web Phone</SortHeader>
                            <SortHeader field="rating" sortField={sortField} onSort={handleSort}>Rating</SortHeader>
                            <th className="p-2.5 font-bold border-b border-slate-200 dark:border-slate-700 text-left">Links</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                        {sortedLeads.map((lead, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-2.5 max-w-[190px]" title={lead.name}>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{lead.name}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{lead.address}</div>
                                </td>
                                <td className="p-2.5 text-slate-600 dark:text-slate-300">
                                    {lead.city ? `${lead.city}${lead.state ? `, ${lead.state}` : ''}` : <span className="text-slate-300 dark:text-slate-600">-</span>}
                                </td>
                                <td className="p-2.5 max-w-[140px] truncate">
                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/70">
                                        {lead.category || 'Business'}
                                    </span>
                                </td>
                                <td className="p-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                    {lead.phone ? (
                                        <div className="flex items-center gap-1">
                                            <Phone size={11} className="text-slate-400 shrink-0" />
                                            <span>{lead.phone}</span>
                                        </div>
                                    ) : lead.mobile ? (
                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                                            <Phone size={11} className="shrink-0" />
                                            <span>{lead.mobile}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="p-2.5 max-w-[170px] truncate text-slate-700 dark:text-slate-300">
                                    {lead.email || lead.emails ? (
                                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                                            <Mail size={12} className="shrink-0" />
                                            <span className="truncate">{lead.email || lead.emails}</span>
                                        </div>
                                    ) : lead.website ? (
                                        <span className="text-slate-400 dark:text-slate-500 text-[10px] italic">
                                            {lead.enriched ? 'Not found' : 'Searching...'}
                                        </span>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="p-2.5 truncate text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                                    {lead.websitePhone ? (
                                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Phone size={11} className="shrink-0" />
                                            <span>{lead.websitePhone}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="p-2.5">
                                    {lead.rating ? (
                                        <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                                            <Star size={11} className="text-amber-500 fill-amber-400 shrink-0" />
                                            <span>{lead.rating}</span>
                                            {lead.reviews && (
                                                <span className="text-[10px] text-slate-400 font-normal">({lead.reviews})</span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-300 dark:text-slate-600">-</span>
                                    )}
                                </td>
                                <td className="p-2.5">
                                    <div className="flex items-center gap-2">
                                        {lead.website && (
                                            <a href={lead.website} target="_blank" rel="noreferrer" title={lead.website} className="text-slate-400 hover:text-blue-600 transition-colors">
                                                <Globe size={14} />
                                            </a>
                                        )}
                                        {lead.linkedin && (
                                            <a href={lead.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="text-slate-400 hover:text-[#0a66c2] transition-colors">
                                                <Linkedin size={14} />
                                            </a>
                                        )}
                                        {lead.facebook && (
                                            <a href={lead.facebook} target="_blank" rel="noreferrer" title="Facebook" className="text-slate-400 hover:text-[#1877f2] transition-colors">
                                                <Facebook size={14} />
                                            </a>
                                        )}
                                        {lead.instagram && (
                                            <a href={lead.instagram} target="_blank" rel="noreferrer" title="Instagram" className="text-slate-400 hover:text-[#e4405f] transition-colors">
                                                <Instagram size={14} />
                                            </a>
                                        )}
                                        {(lead.twitter || lead.twitter_x) && (
                                            <a href={lead.twitter || lead.twitter_x} target="_blank" rel="noreferrer" title="X / Twitter" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                <Twitter size={14} />
                                            </a>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sortedLeads.length === 0 && (
                            <tr>
                                <td colSpan="8" className="p-12 text-center text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <MapPin size={28} className="text-slate-300 dark:text-slate-700" />
                                        <p className="text-xs font-medium">{leads.length === 0 ? 'No leads extracted yet. Start a search on Google Maps.' : 'No results match your search filter.'}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                <span>{sortedLeads.length} leads displayed</span>
                <span className="font-semibold text-slate-400">LeadRadar</span>
            </div>
        </div>
    );
}
