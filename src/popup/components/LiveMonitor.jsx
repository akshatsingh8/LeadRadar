import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const LiveMonitor = ({ logs, isScraping }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Calculate live enrichment metrics from background events
  const enrichedCount = logs.filter(l => l.message.includes('[WEB] Enriched')).length;
  const emailsDiscovered = logs.reduce((acc, l) => {
    const m = l.message.match(/\((\d+)\s*emails/i);
    return acc + (m ? parseInt(m[1], 10) : 0);
  }, 0);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-green-400 font-mono text-xs overflow-hidden">
      <div className="flex flex-col border-b border-gray-800 bg-gray-950">
        <div className="flex justify-between items-center p-3">
          <h3 className="font-semibold text-gray-300 flex items-center gap-2 text-sm">
            <Activity size={16} className={isScraping ? "animate-pulse text-green-500" : "text-gray-500"} />
            Background Monitor
          </h3>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isScraping ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-500'}`}>
            {isScraping ? 'Active' : 'Idle'}
          </span>
        </div>
        
        {/* Real-time Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-black border-t border-gray-800 text-[10px]">
          <div className="flex flex-col items-center justify-center p-1 bg-gray-900 rounded border border-gray-800">
            <span className="text-gray-500 uppercase">Engine</span>
            <span className="text-emerald-400 font-bold">Direct (DOM)</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 bg-gray-900 rounded border border-gray-800">
            <span className="text-gray-500 uppercase">Sites Crawled</span>
            <span className="text-blue-400 font-bold">{enrichedCount}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 bg-gray-900 rounded border border-gray-800">
            <span className="text-gray-500 uppercase">Emails Found</span>
            <span className="text-purple-400 font-bold">{emailsDiscovered}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-black">
        {logs.length === 0 ? (
          <div className="text-gray-600 italic">No background tasks running. Start scraping to see logs here.</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="leading-tight break-all border-b border-gray-900 pb-1">
              <span className="text-gray-500 mr-2">[{log.time}]</span>
              <span className={log.message.includes('Enriched') ? 'text-blue-400' : log.message.includes('complete') ? 'text-emerald-400 font-bold' : 'text-green-400'}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LiveMonitor;
