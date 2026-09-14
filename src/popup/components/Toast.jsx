import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 2800 }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />,
        error: <AlertCircle size={15} className="text-rose-600 shrink-0" />,
        info: <Info size={15} className="text-blue-600 shrink-0" />
    };

    const icon = icons[type] || icons.info;

    return (
        <div
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-200 ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
            }`}
        >
            {icon}
            <span className="text-xs font-semibold">{message}</span>
            <button
                onClick={() => { setIsVisible(false); setTimeout(onClose, 200); }}
                className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={14} />
            </button>
        </div>
    );
}
