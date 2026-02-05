import React from 'react';
import { Radar } from 'lucide-react';

export default function Header({ isScraping }) {
    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-blue-800 p-4 shadow-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Radar className="w-6 h-6" />
                    <div>
                        <h1 className="text-xl font-bold">LeadRadar</h1>
                        <p className="text-blue-100 text-[10px] -mt-0.5">Discover Leads Instantly</p>
                    </div>
                </div>
                {isScraping && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-dot"></span>
                        <span className="text-white text-xs font-medium">Scanning...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
