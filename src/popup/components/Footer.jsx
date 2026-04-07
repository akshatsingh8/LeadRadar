import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-700 mt-auto">
            <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1 font-medium">
                Made with <Heart size={12} className="text-red-500 fill-red-500" /> by
                <a href="https://brandspiritlabs.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-bold ml-1 transition-colors">
                    Brand Spirit Labs
                </a>
            </p>
        </div>
    );
}
