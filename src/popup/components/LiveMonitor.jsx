import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

const LiveMonitor = ({ logs, isScraping }) => {
  const bottomRef = useRef(null);
  const [localETA, setLocalETA] = React.useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Calculate Latency, Queue, and ETA from the latest logs
  const latestStats = [...logs].reverse().find(l => l.message.includes('[AI ENGINE]'))?.message || '';
  const matchLatency = latestStats.match(/Latency:\s*(\d+)ms/);
  const matchQueue = latestStats.match(/Queue:\s*(\d+)/);
  
  const latency = matchLatency ? matchLatency[1] : '--';
  const queue = matchQueue ? matchQueue[1] : '0';
  
  // Calculate dynamic ETA based on current latency and remaining queue. BATCH_SIZE is 10.
  // ETA = (queue / 10) * latency + (queue / 10) * 5000 (heartbeat delay)
  // Or simply: queue_remaining * (latency_in_ms + 5000) / 1000 to get seconds (if batch size is 1)
  // Wait, let's keep it robust. If we are processing in batches of 10, each item takes latency/10 + 5s heartbeat per batch. 
  // Let's use a simpler heuristic for Live ETA: queue_items * ((latency_ms || 3000) + 5000) / (10 * 1000) -> Wait, if queue is items, and we process 10 per batch, number of batches = Math.ceil(queue/10).
  // Time per batch = latency + 5000 (delay).
  
  let calculatedETASeconds = 0;
  if (queue !== '0' && queue !== '--') {
      const qNum = parseInt(queue, 10) || 0;
      const latMs = parseInt(latency, 10) || 5000;
      const batchesLeft = Math.ceil(qNum / 10);
      calculatedETASeconds = Math.round(batchesLeft * ((latMs + 5000) / 1000));
  }

  const formatETA = (seconds) => {
    if (seconds <= 0) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} min ${s}s`;
  };

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
            <span className="text-gray-500 uppercase">Latency</span>
            <span className="text-blue-400 font-bold">{latency}ms</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 bg-gray-900 rounded border border-gray-800">
            <span className="text-gray-500 uppercase">Queue</span>
            <span className="text-yellow-500 font-bold">{queue}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 bg-gray-900 rounded border border-gray-800">
            <span className="text-gray-500 uppercase">ETA Remaining</span>
            <span className="text-purple-400 font-bold">{calculatedETASeconds > 0 ? formatETA(calculatedETASeconds) : '--'}</span>
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
              <span className={log.message.includes('Enriched') ? 'text-blue-400' : 'text-green-400'}>
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
