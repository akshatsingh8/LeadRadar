import React from 'react';
import { Users, FileText, Clock } from 'lucide-react';

export default function StatsDashboard({ stats }) {
    return (
        <div className="grid grid-cols-3 gap-3 p-4 bg-white dark:bg-transparent">
            <StatCard
                label="Leads"
                value={stats.leads}
                icon={Users}
                lightBg="bg-emerald-50"
                lightBorder="border-emerald-200"
                lightText="text-emerald-800"
                lightIcon="text-emerald-600"
                darkColor="bg-green-900/40 text-green-300 border-green-700"
            />
            <StatCard
                label="Pages"
                value={stats.pages}
                icon={FileText}
                lightBg="bg-blue-50"
                lightBorder="border-blue-200"
                lightText="text-blue-800"
                lightIcon="text-blue-600"
                darkColor="bg-blue-900/40 text-blue-300 border-blue-700"
            />
            <StatCard
                label="Time"
                value={stats.time}
                icon={Clock}
                lightBg="bg-orange-50"
                lightBorder="border-orange-200"
                lightText="text-orange-800"
                lightIcon="text-orange-600"
                darkColor="bg-orange-900/40 text-orange-300 border-orange-700"
            />
        </div>
    );
}

function StatCard({ label, value, icon: Icon, lightBg, lightBorder, lightText, lightIcon, darkColor }) {
    return (
        <div className={`rounded-xl p-3 text-center transition-all hover:scale-105 hover:shadow-lg border-2 ${lightBg} ${lightBorder} dark:${darkColor} dark:border`}>
            <div className="flex justify-center mb-1">
                <Icon size={18} className={`${lightIcon} dark:opacity-70`} />
            </div>
            <p className={`text-xs font-bold uppercase tracking-wide ${lightText} dark:opacity-90`}>{label}</p>
            <p className={`text-2xl font-extrabold ${lightText}`}>{value}</p>
        </div>
    );
}
