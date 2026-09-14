import React, { useEffect, useRef } from 'react';
import { Activity, Globe, Mail, Cpu, Terminal } from 'lucide-react';

const sanitizeLog = (msg) => {
    // Strip any accidental emojis for a clean enterprise log stream
    return (msg || '').replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
};

const LiveMonitor = ({ logs, isScraping }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Calculate live metrics from background events
    const enrichedCount = logs.filter(l => l.message.includes('[WEB]')).length;
    const emailsDiscovered = logs.reduce((acc, l) => {
        const m = l.message.match(/\((\d+)\s*emails/i);
        return acc + (m ? parseInt(m[1], 10) : 0);
    }, 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
            {/* Header Bar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Activity size={15} className={isScraping ? "text-emerald-500 animate-pulse" : "text-slate-400"} />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        Telemetry & Engine Logs
                    </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isScraping
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                }`}>
                    {isScraping ? 'Engine Active' : 'Engine Idle'}
                </span>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                        <Cpu size={11} />
                        <span>Mode</span>
                    </div>
                    <span className="text-blue-600 dark:text-blue-400 font-bold font-mono mt-0.5">Direct DOM</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                        <Globe size={11} />
                        <span>Sites Enriched</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono mt-0.5">{enrichedCount}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                        <Mail size={11} />
                        <span>Emails Found</span>
                    </div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono mt-0.5">{emailsDiscovered}</span>
                </div>
            </div>

            {/* Clean Log Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-white dark:bg-slate-900 font-mono text-[11px] select-text">
                {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-1">
                        <Terminal size={24} className="opacity-30" />
                        <p className="text-xs font-sans">No engine events yet. Start scraping to see live telemetry.</p>
                    </div>
                ) : (
                    logs.map((log, index) => {
                        const cleanMsg = sanitizeLog(log.message);
                        const isAi = cleanMsg.includes('[AI ENGINE]');
                        const isWeb = cleanMsg.includes('[WEB]');
                        const isBusy = cleanMsg.includes('[TIER BUSY]') || cleanMsg.includes('[AI COOLING]');
                        const isError = cleanMsg.includes('[ERROR]');

                        return (
                            <div key={index} className="leading-relaxed border-b border-slate-100 dark:border-slate-800/60 pb-1 flex items-start gap-1.5">
                                <span className="text-slate-400 text-[10px] shrink-0 font-normal select-none">
                                    [{log.time}]
                                </span>
                                <span className={`break-all ${
                                    isAi
                                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                                        : isWeb
                                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                        : isBusy
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : isError
                                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                                        : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                    {cleanMsg}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default LiveMonitor;
