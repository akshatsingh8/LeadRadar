import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-2 px-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-center mt-auto select-none">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 font-medium">
                Built with <Heart size={11} className="text-rose-500 fill-rose-500 inline" /> by
                <a
                    href="https://brandspiritlabs.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold transition-colors"
                >
                    Brand Spirit Labs
                </a>
            </p>
        </footer>
    );
}
