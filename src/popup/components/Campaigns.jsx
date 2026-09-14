import { useState } from 'react';
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
  Check
} from 'lucide-react';
import { 
  INDUSTRY_CATEGORIES, 
  METRO_PRESETS, 
  expandNicheVariations, 
  generateZipRange, 
  buildQueryMatrix 
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
  
  // Option 1: Zip Code Multiplier State
  const [zipBaseNiche, setZipBaseNiche] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeCount, setRangeCount] = useState(5);

  // Option 2: Sub-Category State
  const [selectedIndustry, setSelectedIndustry] = useState('Dentistry');
  const [subcatLocation, setSubcatLocation] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [expandedSubcats, setExpandedSubcats] = useState([]);
  const [selectedSubcats, setSelectedSubcats] = useState([]);

  // Option 3: Matrix State
  const [matrixNiche, setMatrixNiche] = useState('');
  const [matrixZips, setMatrixZips] = useState('');

  // Option 4: Raw input
  const [rawInput, setRawInput] = useState('');

  const queue = campaignState?.queue || [];
  const currentIndex = campaignState?.currentIndex || 0;
  const isRunning = Boolean(campaignState?.active);
  const totalQueries = queue.length;
  const completedCount = queue.filter(q => q.status === 'completed' || q.status === 'skipped').length;
  const progressPercent = totalQueries > 0 ? Math.round((completedCount / totalQueries) * 100) : 0;

  // Handle Option 1: Zip Multiplier
  const handleAddZips = () => {
    if (!zipBaseNiche.trim()) return;
    const zips = zipInput
      .split(/[\n,]+/)
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
    const zips = matrixZips.split(/[\n,]+/).map(z => z.trim()).filter(Boolean);
    const variations = expandNicheVariations(matrixNiche).slice(0, 5); // top 5 sub-niches
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

  const handleRemoveQueueItem = (id) => {
    if (isRunning) return;
    onUpdateQueue(queue.filter(q => q.id !== id));
  };

  const handleClearQueue = () => {
    if (isRunning) return;
    onUpdateQueue([]);
  };

  return (
    <div className={`h-full flex flex-col p-3 gap-3 overflow-y-auto ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Campaign Monitor Header */}
      <div className={`p-3 rounded-xl border flex flex-col gap-2.5 shadow-sm ${
        darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isRunning ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-blue-500/10 text-blue-500'}`}>
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Deep Search Campaigns</h3>
              <p className="text-[11px] text-slate-400">
                {isRunning 
                  ? `Running Query ${currentIndex + 1} of ${totalQueries}`
                  : `${totalQueries} queries in queue • Bypass 120-lead limit`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isRunning ? (
              <>
                <button
                  onClick={onSkipQuery}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all flex items-center gap-1 border border-amber-500/30"
                  title="Skip to next search query"
                >
                  <SkipForward size={13} />
                  <span>Skip</span>
                </button>
                <button
                  onClick={onStopCampaign}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-all flex items-center gap-1"
                >
                  <Square size={13} />
                  <span>Stop</span>
                </button>
              </>
            ) : (
              <>
                {queue.length > 0 && (
                  <button
                    onClick={handleClearQueue}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/30 transition-all"
                    title="Clear queue"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={onStartCampaign}
                  disabled={queue.length === 0}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                    queue.length > 0
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                      : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Play size={13} />
                  <span>Launch Campaign</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {totalQueries > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>Progress ({completedCount}/{totalQueries} queries)</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className={`p-1 rounded-xl border flex items-center gap-1 ${
        darkMode ? 'bg-slate-800/60 border-slate-700/70' : 'bg-white border-slate-200'
      }`}>
        <button
          onClick={() => setActiveMode('zip')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'zip'
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin size={13} />
          <span>Postal / Zip (Opt 1)</span>
        </button>

        <button
          onClick={() => setActiveMode('subcat')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'subcat'
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={13} />
          <span>Sub-Niches (Opt 2)</span>
        </button>

        <button
          onClick={() => setActiveMode('matrix')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'matrix'
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame size={13} />
          <span>Niches × Zips</span>
        </button>

        <button
          onClick={() => setActiveMode('raw')}
          className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'raw'
              ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Paste custom queries"
        >
          <ListPlus size={13} />
          <span>Custom</span>
        </button>
      </div>

      {/* Mode 1: Postal / Zip Code Multiplier (Option 1) */}
      {activeMode === 'zip' && (
        <div className={`p-3 rounded-xl border flex flex-col gap-3 ${
          darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Base Keyword / Business Niche
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Roofing Contractor, Dentist, Plumber"
                value={zipBaseNiche}
                onChange={e => setZipBaseNiche(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
              <Search size={14} className="absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Zip Codes or Neighborhoods (one per line)
              </label>
            </div>
            <textarea
              rows={3}
              placeholder="e.g.&#10;90210&#10;90001&#10;90002"
              value={zipInput}
              onChange={e => setZipInput(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          {/* Quick Metro Presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Metro Presets:</span>
            <div className="flex flex-wrap gap-1">
              {METRO_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyMetroPreset(preset)}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded border transition-all ${
                    darkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                >
                  {preset.name.split(' ')[0]} ({preset.zips.length})
                </button>
              ))}
            </div>
          </div>

          {/* Zip Code Range Builder */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/50">
            <input
              type="text"
              placeholder="Start Zip (e.g. 75001)"
              value={rangeStart}
              onChange={e => setRangeStart(e.target.value)}
              className={`w-32 px-2.5 py-1.5 text-xs rounded-lg border ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <input
              type="number"
              min="1"
              max="50"
              value={rangeCount}
              onChange={e => setRangeCount(parseInt(e.target.value, 10) || 5)}
              className={`w-14 px-2 py-1.5 text-xs rounded-lg border text-center ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <button
              onClick={handleGenerateZipRange}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
              }`}
            >
              + Generate Range
            </button>
          </div>

          <button
            onClick={handleAddZips}
            disabled={!zipBaseNiche.trim() || !zipInput.trim()}
            className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              zipBaseNiche.trim() && zipInput.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                : 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus size={14} />
            <span>Multiply & Add to Campaign Queue</span>
          </button>
        </div>
      )}

      {/* Mode 2: Sub-Category & Synonym Expander (Option 2) */}
      {activeMode === 'subcat' && (
        <div className={`p-3 rounded-xl border flex flex-col gap-3 ${
          darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Industry Preset
              </label>
              <select
                value={selectedIndustry}
                onChange={e => {
                  setSelectedIndustry(e.target.value);
                  setCustomIndustry('');
                }}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {Object.keys(INDUSTRY_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Target City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Austin, TX or Miami"
                value={subcatLocation}
                onChange={e => setSubcatLocation(e.target.value)}
                className={`w-full px-2.5 py-2 text-xs rounded-lg border ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Or Custom Niche
            </label>
            <input
              type="text"
              placeholder="e.g. Solar Panels, Tree Service, Tattoo Shop"
              value={customIndustry}
              onChange={e => setCustomIndustry(e.target.value)}
              className={`w-full px-2.5 py-2 text-xs rounded-lg border ${
                darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <button
            onClick={handleExpandSubcategories}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles size={14} />
            <span>Generate Sub-Niches & Synonyms</span>
          </button>

          {expandedSubcats.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                <span>Select Sub-Categories ({selectedSubcats.length}/{expandedSubcats.length}):</span>
                <button
                  onClick={() => setSelectedSubcats(selectedSubcats.length === expandedSubcats.length ? [] : expandedSubcats)}
                  className="text-blue-500 hover:underline text-[10px]"
                >
                  {selectedSubcats.length === expandedSubcats.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto flex flex-col gap-1 pr-1">
                {expandedSubcats.map(subcat => {
                  const isChecked = selectedSubcats.includes(subcat);
                  return (
                    <div
                      key={subcat}
                      onClick={() => handleToggleSubcat(subcat)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                        isChecked 
                          ? darkMode ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-500 text-blue-800'
                          : darkMode ? 'bg-slate-900/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{subcat} {subcatLocation ? `in ${subcatLocation}` : ''}</span>
                      {isChecked && <Check size={13} className="text-blue-500 font-bold" />}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleAddSubcatsToQueue}
                disabled={selectedSubcats.length === 0}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus size={14} />
                <span>Add {selectedSubcats.length} Queries to Campaign Queue</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Matrix Multiplier (Niches x Zips) */}
      {activeMode === 'matrix' && (
        <div className={`p-3 rounded-xl border flex flex-col gap-3 ${
          darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Industry (will expand into top 5 sub-niches)
            </label>
            <input
              type="text"
              placeholder="e.g. Plumbers, Dentists, Real Estate"
              value={matrixNiche}
              onChange={e => setMatrixNiche(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Target Zip Codes (one per line)
            </label>
            <textarea
              rows={3}
              placeholder="e.g.&#10;10001&#10;10002&#10;10003"
              value={matrixZips}
              onChange={e => setMatrixZips(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border font-mono resize-none ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <button
            onClick={handleAddMatrix}
            disabled={!matrixNiche.trim() || !matrixZips.trim()}
            className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              matrixNiche.trim() && matrixZips.trim()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm'
                : 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Flame size={14} />
            <span>Multiply (5 Sub-Niches × Zips)</span>
          </button>
        </div>
      )}

      {/* Mode 4: Custom Queries */}
      {activeMode === 'raw' && (
        <div className={`p-3 rounded-xl border flex flex-col gap-3 ${
          darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'
        }`}>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Paste Complete Search Queries (one per line)
            </label>
            <textarea
              rows={4}
              placeholder="e.g.&#10;Italian Restaurants Downtown Austin&#10;Best Pizzerias South Congress&#10;Sushi Bars East Austin"
              value={rawInput}
              onChange={e => setRawInput(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-lg border font-mono resize-none ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <button
            onClick={handleAddRaw}
            disabled={!rawInput.trim()}
            className="w-full py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Add Queries to Queue</span>
          </button>
        </div>
      )}

      {/* Campaign Queue List */}
      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <span>Campaign Queue ({queue.length})</span>
          {queue.length > 0 && (
            <span className="text-[10px] font-normal lowercase text-slate-500">
              auto-runs through each search
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          <div className={`flex-1 min-h-[140px] rounded-xl border border-dashed flex flex-col items-center justify-center p-4 text-center ${
            darkMode ? 'border-slate-700/60 text-slate-500' : 'border-slate-300 text-slate-400'
          }`}>
            <Layers size={24} className="mb-2 opacity-40" />
            <p className="text-xs font-medium">Queue is currently empty</p>
            <p className="text-[11px] opacity-75 mt-0.5">
              Select an option above to generate multi-query campaigns and extract 10x more leads.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {queue.map((item, idx) => {
              const isCurrent = isRunning && idx === currentIndex;
              const isCompleted = item.status === 'completed';
              const isSkipped = item.status === 'skipped';

              return (
                <div
                  key={item.id || idx}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                    isCurrent
                      ? darkMode 
                        ? 'bg-blue-900/30 border-blue-500 text-blue-200 ring-1 ring-blue-500' 
                        : 'bg-blue-50/80 border-blue-500 text-blue-900 ring-1 ring-blue-500'
                      : isCompleted
                        ? darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
                        : darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 w-5">
                      #{idx + 1}
                    </span>
                    <span className="font-medium truncate flex-1">
                      {item.query}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 animate-pulse border border-blue-500/30">
                        Scraping...
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>+{item.leadsFound || 0}</span>
                      </span>
                    )}
                    {isSkipped && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-400">
                        Skipped
                      </span>
                    )}
                    {!isCurrent && !isCompleted && !isSkipped && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        <span>Pending</span>
                      </span>
                    )}

                    {!isRunning && (
                      <button
                        onClick={() => handleRemoveQueueItem(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/20"
                      >
                        <Trash2 size={13} />
                      </button>
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
