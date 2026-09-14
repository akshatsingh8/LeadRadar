import React from 'react';
import { Users, FileText, Clock } from 'lucide-react';

export default function StatsDashboard({ stats }) {
    return (
        <div className="grid grid-cols-3 gap-2.5 p-4 pb-3">
            <StatCard
                label="Leads"
                value={stats.leads}
                icon={Users}
                accent="blue"
            />
            <StatCard
                label="Pages"
                value={stats.pages}
                icon={FileText}
                accent="indigo"
            />
            <StatCard
                label="Time"
                value={stats.time}
                icon={Clock}
                accent="emerald"
            />
        </div>
    );
}

function StatCard({ label, value, icon, accent }) {
    const IconComponent = icon;

    const colorStyles = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-950/50',
            text: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-100 dark:border-blue-900/50'
        },
        indigo: {
            bg: 'bg-indigo-50 dark:bg-indigo-950/50',
            text: 'text-indigo-600 dark:text-indigo-400',
            border: 'border-indigo-100 dark:border-indigo-900/50'
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/50',
            text: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-100 dark:border-emerald-900/50'
        }
    };

    const style = colorStyles[accent] || colorStyles.blue;

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col items-center text-center">
            <div className={`w-7 h-7 rounded-lg ${style.bg} ${style.text} ${style.border} border flex items-center justify-center mb-1.5 shrink-0`}>
                <IconComponent size={14} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {label}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-mono">
                {value}
            </span>
        </div>
    );
}
