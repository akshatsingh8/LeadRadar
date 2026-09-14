import React from 'react';
import { Compass } from 'lucide-react';

export default function Header({ isScraping }) {
    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 select-none">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                        <Compass size={18} className={isScraping ? "animate-spin" : ""} style={{ animationDuration: '6s' }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                                LeadRadar
                            </h1>
                            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                                PRO
                            </span>
                        </div>
                        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium mt-0.5 leading-none">
                            Google Maps Lead Extractor
                        </p>
                    </div>
                </div>

                <div>
                    {isScraping ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>Ready</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
