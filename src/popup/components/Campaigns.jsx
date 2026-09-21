import { useState, useMemo } from 'react';
import { 
  MapPin, 
  Sparkles, 
  Play, 
  Square, 
  SkipForward, 
  Trash2, 
  Plus, 
  ListPlus, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Search, 
  Flame, 
  Check,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Globe,
  Filter
} from 'lucide-react';
import { 
  INDUSTRY_CATEGORIES, 
  METRO_PRESETS, 
  POPULAR_NICHES,
  expandNicheVariations, 
  generateZipRange, 
  buildQueryMatrix,
  deduplicateQueue,
  resetQueueStatus,
  reorderQueue
} from '../../utils/campaignGenerator';

export default function Campaigns({ 
  campaignState, 
  onStartCampaign, 
  onStopCampaign, 
  onSkipQuery, 
  onUpdateQueue, 
  darkMode 
}) {
  const [activeMode, setActiveMode] = useState('zip'); // 'zip' | 'subcat' | 'matrix' | 'raw'
  const [metroRegionFilter, setMetroRegionFilter] = useState('All'); // 'All' | 'India' | 'US' | 'Global'
  
  // Option 1: Zip Code Multiplier State
  const [zipBaseNiche, setZipBaseNiche] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeCount, setRangeCount] = useState(10);

  // Option 2: Sub-Category State
  const [selectedIndustry, setSelectedIndustry] = useState('Dentistry');
  const [subcatLocation, setSubcatLocation] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [expandedSubcats, setExpandedSubcats] = useState([]);
  const [selectedSubcats, setSelectedSubcats] = useState([]);
  const [subcatFilterQuery, setSubcatFilterQuery] = useState('');
  const [customSubcatInput, setCustomSubcatInput] = useState('');

  // Option 3: Matrix State
  const [matrixNiche, setMatrixNiche] = useState('');
  const [matrixZips, setMatrixZips] = useState('');

  // Option 4: Raw input
  const [rawInput, setRawInput] = useState('');

  // Queue search filter
  const [queueSearch, setQueueSearch] = useState('');

  const queue = useMemo(() => campaignState?.queue || [], [campaignState?.queue]);
  const currentIndex = campaignState?.currentIndex || 0;
  const isRunning = Boolean(campaignState?.active);
  const totalQueries = queue.length;
  const completedCount = queue.filter(q => q.status === 'completed' || q.status === 'skipped').length;
  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const progressPercent = totalQueries > 0 ? Math.round((completedCount / totalQueries) * 100) : 0;
  const totalLeadsExtracted = queue.reduce((acc, q) => acc + (q.leadsFound || 0), 0);

  // Filtered metro presets based on region tab
  const filteredMetros = useMemo(() => {
    if (metroRegionFilter === 'All') return METRO_PRESETS;
    return METRO_PRESETS.filter(m => m.region === metroRegionFilter);
  }, [metroRegionFilter]);

  // Filtered sub-categories in Option 2
  const visibleSubcats = useMemo(() => {
    if (!subcatFilterQuery.trim()) return expandedSubcats;
    return expandedSubcats.filter(s => s.toLowerCase().includes(subcatFilterQuery.toLowerCase()));
  }, [expandedSubcats, subcatFilterQuery]);

  // Filtered queue items
  const filteredQueue = useMemo(() => {
    if (!queueSearch.trim()) return queue;
    return queue.filter(q => q.query.toLowerCase().includes(queueSearch.toLowerCase()));
  }, [queue, queueSearch]);

  // Handle Option 1: Zip Multiplier
  const handleAddZips = () => {
    if (!zipBaseNiche.trim()) return;
    const zips = zipInput
      .split(/[\n,;]+/)
      .map(z => z.trim())
      .filter(Boolean);

    if (zips.length === 0) return;

    const newItems = buildQueryMatrix([zipBaseNiche], zips);
    onUpdateQueue([...queue, ...newItems]);
    setZipInput('');
  };

  const handleApplyMetroPreset = (preset) => {
    setZipInput(preset.zips.join('\n'));
  };

  const handleGenerateZipRange = () => {
    if (!rangeStart) return;
    const generated = generateZipRange(rangeStart, rangeCount);
    setZipInput(prev => (prev ? `${prev}\n${generated.join('\n')}` : generated.join('\n')));
  };

  // Handle Option 2: Sub-Category Expander
  const handleExpandSubcategories = () => {
    const target = customIndustry.trim() || selectedIndustry;
    const variations = expandNicheVariations(target);
    setExpandedSubcats(variations);
    setSelectedSubcats(variations);
  };

  const handleToggleSubcat = (subcat) => {
    setSelectedSubcats(prev => 
      prev.includes(subcat) 
        ? prev.filter(s => s !== subcat) 
        : [...prev, subcat]
    );
  };

  const handleAddCustomSubcat = () => {
    const trimmed = customSubcatInput.trim();
    if (!trimmed) return;
    if (!expandedSubcats.includes(trimmed)) {
      setExpandedSubcats(prev => [trimmed, ...prev]);
      setSelectedSubcats(prev => [trimmed, ...prev]);
    }
    setCustomSubcatInput('');
  };

  const handleSelectTop5Subcats = () => {
    setSelectedSubcats(expandedSubcats.slice(0, 5));
  };

  const handleAddSubcatsToQueue = () => {
    if (selectedSubcats.length === 0) return;
    const loc = subcatLocation.trim();
    const newItems = buildQueryMatrix(
      selectedSubcats, 
      loc ? [loc] : []
    );
    onUpdateQueue([...queue, ...newItems]);
    setExpandedSubcats([]);
    setSelectedSubcats([]);
  };

  // Handle Matrix Multiplier (Sub-categories x Zips)
  const handleAddMatrix = () => {
    if (!matrixNiche.trim() || !matrixZips.trim()) return;
    const zips = matrixZips.split(/[\n,;]+/).map(z => z.trim()).filter(Boolean);
    const variations = expandNicheVariations(matrixNiche).slice(0, 6);
    const newItems = buildQueryMatrix(variations, zips);
    onUpdateQueue([...queue, ...newItems]);
    setMatrixZips('');
  };

  // Handle Raw Text Lines
  const handleAddRaw = () => {
    const lines = rawInput.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    const newItems = lines.map((q, idx) => ({
      id: `q_${Date.now()}_${idx}`,
      query: q,
      status: 'pending',
      leadsFound: 0
    }));
    onUpdateQueue([...queue, ...newItems]);
    setRawInput('');
  };

  // Queue utility actions
  const handleRemoveQueueItem = (id) => {
    if (isRunning) return;
    onUpdateQueue(queue.filter(q => q.id !== id));
  };

  const handleClearQueue = () => {
    if (isRunning) return;
    onUpdateQueue([]);
  };

  const handleDeduplicateQueue = () => {
    if (isRunning) return;
    const deduped = deduplicateQueue(queue);
    onUpdateQueue(deduped);
  };

  const handleResetQueue = () => {
    if (isRunning) return;
    const reset = resetQueueStatus(queue);
    onUpdateQueue(reset);
  };

  const handleMoveUp = (index) => {
    if (isRunning || index <= 0) return;
    onUpdateQueue(reorderQueue(queue, index, index - 1));
  };

  const handleMoveDown = (index) => {
    if (isRunning || index >= queue.length - 1) return;
    onUpdateQueue(reorderQueue(queue, index, index + 1));
  };

  const currentActiveQuery = queue[currentIndex]?.query;

  return (
    <div className={`h-full flex flex-col p-3 gap-3 overflow-y-auto ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. Header & Live Dashboard Card */}
      <div className={`p-3.5 rounded-xl border shadow-xs flex flex-col gap-3 transition-all ${
        darkMode ? 'bg-slate-800/90 border-slate-700/80 shadow-black/20' : 'bg-white border-slate-200 shadow-slate-200/50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all ${
              isRunning 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse' 
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
            }`}>
              <Layers size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider">Deep Search Campaigns</h3>
                {isRunning ? (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    Live
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                    Bypass 120-Cap
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {isRunning 
                  ? `Active: "${currentActiveQuery?.slice(0, 32)}${currentActiveQuery?.length > 32 ? '...' : ''}"`
                  : `${totalQueries} queries queued • ~${Math.max(1, pendingCount * 60).toLocaleString()} to ${(pendingCount * 110).toLocaleString()} potential leads`
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {isRunning ? (
              <>
                <button
                  onClick={onSkipQuery}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-all flex items-center gap-1"
                  title="Skip to next target query"
                >
                  <SkipForward size={13} />
                  <span>Skip</span>
                </button>
                <button
                  onClick={onStopCampaign}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-all flex items-center gap-1"
                >
                  <Square size={12} className="fill-current" />
                  <span>Stop</span>
                </button>
              </>
            ) : (
              <>
                {queue.length > 0 && (
                  <button
                    onClick={handleResetQueue}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                    title="Reset all items to Pending"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                {queue.length > 0 && (
                  <button
                    onClick={handleClearQueue}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                    title="Clear entire queue"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={onStartCampaign}
                  disabled={queue.length === 0}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 ${
                    queue.length > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play size={13} className="fill-current" />
                  <span>Start Campaign</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress & Live Stats Bar */}
        {totalQueries > 0 && (
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <span>Progress: {completedCount}/{totalQueries} queries</span>
                {totalLeadsExtracted > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    +{totalLeadsExtracted} leads gathered
                  </span>
                )}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700/70 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Mode Selector Tabs */}
      <div className={`p-1 rounded-xl border flex items-center gap-1 ${
        darkMode ? 'bg-slate-800/80 border-slate-700/70' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <button
          onClick={() => setActiveMode('zip')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'zip'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MapPin size={13} />
          <span>Postal / Zip (Opt 1)</span>
        </button>

        <button
          onClick={() => setActiveMode('subcat')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'subcat'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles size={13} />
          <span>Sub-Niches (Opt 2)</span>
        </button>

        <button
          onClick={() => setActiveMode('matrix')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'matrix'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Flame size={13} />
          <span>Niches × Zips</span>
        </button>

        <button
          onClick={() => setActiveMode('raw')}
          className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'raw'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          title="Direct query paste"
        >
          <ListPlus size={13} />
          <span>Custom</span>
        </button>
      </div>

      {/* 3. Mode Panels */}

      {/* MODE 1: POSTAL / ZIP CODE MULTIPLIER */}
      {activeMode === 'zip' && (
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 shadow-xs ${
          darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          {/* Base Keyword Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                1. Base Business Niche / Keyword
              </label>
              <span className="text-[10px] text-slate-400">e.g. Plumber, Dentist</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter root service or business type..."
                value={zipBaseNiche}
                onChange={e => setZipBaseNiche(e.target.value)}
                className={`w-full pl-3 pr-8 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
            </div>

            {/* Popular Niche Suggestion Chips */}
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none mt-1.5 pb-0.5">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Quick:</span>
              {POPULAR_NICHES.map(niche => (
                <button
                  key={niche}
                  onClick={() => setZipBaseNiche(niche)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition-all ${
                    zipBaseNiche === niche
                      ? 'bg-blue-600 text-white border-blue-600'
                      : darkMode 
                        ? 'bg-slate-900/60 hover:bg-slate-700 border-slate-700 text-slate-300' 
                        : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Postal / Zip Codes Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                2. Target Postal Codes / Localities
              </label>
              <span className="text-[10px] text-slate-400">
                {zipInput ? `${zipInput.split(/[\n,;]+/).filter(Boolean).length} codes entered` : 'One per line or comma'}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g.&#10;560001&#10;560034&#10;560038"
              value={zipInput}
              onChange={e => setZipInput(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Metro Presets with Regional Filter */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Globe size={11} />
                <span>1-Click Metro Packages:</span>
              </span>
              <div className="flex items-center gap-1">
                {['All', 'India', 'US', 'Global'].map(region => (
                  <button
                    key={region}
                    onClick={() => setMetroRegionFilter(region)}
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded transition-all ${
                      metroRegionFilter === region
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {filteredMetros.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyMetroPreset(preset)}
                  className={`text-[10px] font-medium px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${
                    darkMode 
                      ? 'bg-slate-900/60 hover:bg-slate-700 border-slate-700/80 text-slate-300' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{preset.flag}</span>
                  <span className="font-semibold">{preset.name}</span>
                  <span className="text-[9px] opacity-70 font-mono">({preset.zips.length})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sequential Zip Range Builder */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
            <input
              type="text"
              placeholder="Start Code (e.g. 560001)"
              value={rangeStart}
              onChange={e => setRangeStart(e.target.value)}
              className={`flex-1 px-2.5 py-1.5 text-xs rounded-lg border ${
                darkMode ? 'bg-slate-900 border-slate-700 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Qty:</span>
              <input
                type="number"
                min="1"
                max="100"
                value={rangeCount}
                onChange={e => setRangeCount(parseInt(e.target.value, 10) || 10)}
                className={`w-14 px-2 py-1.5 text-xs rounded-lg border text-center font-mono ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <button
              onClick={handleGenerateZipRange}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              + Add Range
            </button>
          </div>

          {/* Add To Queue Submit */}
          <button
            onClick={handleAddZips}
            disabled={!zipBaseNiche.trim() || !zipInput.trim()}
            className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all ${
              zipBaseNiche.trim() && zipInput.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Plus size={15} />
            <span>Generate & Add {zipInput.split(/[\n,;]+/).filter(Boolean).length || 0} Targeted Queries</span>
          </button>
        </div>
      )}

      {/* MODE 2: SUB-CATEGORY & SYNONYM EXPANDER */}
      {activeMode === 'subcat' && (
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 shadow-xs ${
          darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Industry Preset
              </label>
              <select
                value={selectedIndustry}
                onChange={e => {
                  setSelectedIndustry(e.target.value);
                  setCustomIndustry('');
                }}
                className={`w-full px-2.5 py-2 text-xs font-medium rounded-lg border ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {Object.keys(INDUSTRY_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Target City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Bangalore, Austin, London"
                value={subcatLocation}
                onChange={e => setSubcatLocation(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Or Custom Broad Niche
            </label>
            <input
              type="text"
              placeholder="e.g. Solar Energy, Landscaping, Pilates, Tattoo"
              value={customIndustry}
              onChange={e => setCustomIndustry(e.target.value)}
              className={`w-full px-2.5 py-2 text-xs rounded-lg border ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <button
            onClick={handleExpandSubcategories}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles size={14} />
            <span>Expand High-Intent Sub-Niches & Synonyms</span>
          </button>

          {/* Generated Sub-Categories Multi-Select Panel */}
          {expandedSubcats.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Selected: {selectedSubcats.length} of {expandedSubcats.length}</span>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    onClick={handleSelectTop5Subcats}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Top 5 Intent
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setSelectedSubcats(selectedSubcats.length === expandedSubcats.length ? [] : expandedSubcats)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedSubcats.length === expandedSubcats.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Filter bar for sub-categories */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter sub-categories..."
                  value={subcatFilterQuery}
                  onChange={e => setSubcatFilterQuery(e.target.value)}
                  className={`w-full pl-7 pr-2.5 py-1 text-[11px] rounded-md border ${
                    darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <Filter size={11} className="absolute left-2.5 top-2 text-slate-400" />
              </div>

              {/* Sub-Category Chips */}
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1 pr-1">
                {visibleSubcats.map(subcat => {
                  const isChecked = selectedSubcats.includes(subcat);
                  return (
                    <div
                      key={subcat}
                      onClick={() => handleToggleSubcat(subcat)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked 
                          ? darkMode 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-medium' 
                            : 'bg-blue-50 border-blue-500 text-blue-900 font-medium'
                          : darkMode 
                            ? 'bg-slate-900/50 border-slate-700 text-slate-400' 
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{subcat} {subcatLocation ? `in ${subcatLocation}` : ''}</span>
                      {isChecked && <Check size={13} className="text-blue-500 font-bold shrink-0 ml-2" />}
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Sub-Category Tag */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  placeholder="+ Add custom sub-category..."
                  value={customSubcatInput}
                  onChange={e => setCustomSubcatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCustomSubcat()}
                  className={`flex-1 px-2.5 py-1.5 text-xs rounded-md border ${
                    darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
                <button
                  onClick={handleAddCustomSubcat}
                  className="px-2.5 py-1.5 rounded-md text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 hover:text-white transition-all"
                >
                  Add
                </button>
              </div>

              <button
                onClick={handleAddSubcatsToQueue}
                disabled={selectedSubcats.length === 0}
                className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus size={15} />
                <span>Add {selectedSubcats.length} Sub-Niche Queries to Queue</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: MATRIX MULTIPLIER (NICHES x ZIPS) */}
      {activeMode === 'matrix' && (
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 shadow-xs ${
          darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Industry (will expand into 6 high-value sub-niches)
            </label>
            <input
              type="text"
              placeholder="e.g. Plumber, Roofing, Dentist, Real Estate"
              value={matrixNiche}
              onChange={e => setMatrixNiche(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Target Zip / Postal Codes (one per line)
              </label>
              <span className="text-[10px] text-slate-400">
                {matrixZips ? `${matrixZips.split(/[\n,;]+/).filter(Boolean).length} codes` : ''}
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g.&#10;560001&#10;560034&#10;560038"
              value={matrixZips}
              onChange={e => setMatrixZips(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border font-mono resize-none ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Matrix Math Preview */}
          {matrixNiche.trim() && matrixZips.trim() && (
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-300 flex items-center justify-between font-medium">
              <span>Formula Preview:</span>
              <span className="font-bold">
                6 Sub-Niches × {matrixZips.split(/[\n,;]+/).filter(Boolean).length} Zips = {6 * matrixZips.split(/[\n,;]+/).filter(Boolean).length} Queries
              </span>
            </div>
          )}

          <button
            onClick={handleAddMatrix}
            disabled={!matrixNiche.trim() || !matrixZips.trim()}
            className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              matrixNiche.trim() && matrixZips.trim()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <Flame size={15} />
            <span>Multiply & Add to Campaign Queue</span>
          </button>
        </div>
      )}

      {/* MODE 4: DIRECT CUSTOM QUERIES */}
      {activeMode === 'raw' && (
        <div className={`p-3.5 rounded-xl border flex flex-col gap-3 shadow-xs ${
          darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Paste Complete Search Queries (one per line)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {rawInput.split('\n').filter(l => l.trim()).length} lines
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="e.g.&#10;Dentists in Indiranagar Bangalore&#10;Orthodontists in Koramangala&#10;Emergency Dentist in Whitefield"
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border font-mono resize-none ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <button
            onClick={handleAddRaw}
            disabled={!rawInput.trim()}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus size={15} />
            <span>Add Custom Queries to Queue</span>
          </button>
        </div>
      )}

      {/* 4. Campaign Queue Section */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Queue ({queue.length})
            </span>
            {queue.length > 1 && !isRunning && (
              <button
                onClick={handleDeduplicateQueue}
                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                title="Remove duplicate search queries"
              >
                Deduplicate
              </button>
            )}
          </div>

          {/* Search bar inside queue */}
          {queue.length > 5 && (
            <div className="relative w-36">
              <input
                type="text"
                placeholder="Search queue..."
                value={queueSearch}
                onChange={e => setQueueSearch(e.target.value)}
                className={`w-full pl-6 pr-2 py-0.5 text-[10px] rounded-md border ${
                  darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                }`}
              />
              <Search size={10} className="absolute left-2 top-1.5 text-slate-400" />
            </div>
          )}
        </div>

        {queue.length === 0 ? (
          <div className={`flex-1 min-h-[140px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center ${
            darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'
          }`}>
            <Layers size={26} className="mb-2 opacity-30" />
            <p className="text-xs font-bold">Campaign Queue is Empty</p>
            <p className="text-[11px] opacity-75 mt-0.5 max-w-xs">
              Select an option above to generate multi-query campaigns and extract 10x more business leads.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {filteredQueue.map((item, idx) => {
              const actualIndex = queue.findIndex(q => q.id === item.id);
              const isCurrent = isRunning && actualIndex === currentIndex;
              const isCompleted = item.status === 'completed';
              const isSkipped = item.status === 'skipped';

              return (
                <div
                  key={item.id || idx}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    isCurrent
                      ? darkMode 
                        ? 'bg-blue-900/30 border-blue-500 text-blue-200 ring-1 ring-blue-500 shadow-blue-500/10' 
                        : 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-blue-500/10'
                      : isCompleted
                        ? darkMode ? 'bg-slate-800/30 border-slate-700 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 w-5 font-mono">
                      #{actualIndex + 1}
                    </span>
                    <span className="font-semibold truncate flex-1">
                      {item.query}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 animate-pulse border border-blue-500/40">
                        Scraping...
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>+{item.leadsFound || 0} leads</span>
                      </span>
                    )}
                    {isSkipped && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-400">
                        Skipped
                      </span>
                    )}
                    {!isCurrent && !isCompleted && !isSkipped && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        <span>Pending</span>
                      </span>
                    )}

                    {/* Reorder Buttons */}
                    {!isRunning && (
                      <div className="flex items-center">
                        <button
                          onClick={() => handleMoveUp(actualIndex)}
                          disabled={actualIndex === 0}
                          className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20 transition-all"
                          title="Move up"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(actualIndex)}
                          disabled={actualIndex === queue.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20 transition-all"
                          title="Move down"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-all ml-0.5"
                          title="Delete query"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
