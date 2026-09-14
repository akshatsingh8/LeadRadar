import React from 'react';
import { Radio, Phone, MapPin, Tag } from 'lucide-react';

export default function ResultsPreview({ lastLead }) {
    if (!lastLead) return null;

    return (
        <div className="mx-4 mb-3 p-3 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 rounded-xl shadow-xs transition-all">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                    <Radio size={12} className="text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Latest Lead
                    </span>
                </div>
                {lastLead.category && (
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.2 rounded border border-slate-200/60 dark:border-slate-600/60 truncate max-w-[120px]">
                        {lastLead.category}
                    </span>
                )}
            </div>

            <div className="font-bold text-slate-900 dark:text-white truncate text-xs">
                {lastLead.name}
            </div>

            <div className="mt-1 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {lastLead.phone && (
                    <div className="flex items-center gap-1.5 font-mono">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{lastLead.phone}</span>
                    </div>
                )}
                {lastLead.address && (
                    <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate">{lastLead.address}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
