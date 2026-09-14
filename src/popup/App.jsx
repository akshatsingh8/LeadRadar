import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsDashboard from './components/StatsDashboard'
import Controls from './components/Controls'
import Settings from './components/Settings'
import Footer from './components/Footer'
import ResultsPreview from './components/ResultsPreview'
import ResultsTable from './components/ResultsTable'
import History from './components/History'
import Toast from './components/Toast'
import LiveMonitor from './components/LiveMonitor'
import { LayoutGrid, Table2, History as HistoryIcon, Activity, Settings as SettingsIcon } from 'lucide-react'
import { convertToCSV, downloadCSV } from '../content/csv'

const DEFAULT_SETTINGS = {
  humanBehavior: true,
  autoScroll: true,
  autoNextPage: true,
  deepEnrichment: true
};

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({ leads: 0, pages: 0, time: '00:00' });
  const [isScraping, setIsScraping] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [lastLead, setLastLead] = useState(null);
  const [allLeads, setAllLeads] = useState([]);
  const [history, setHistory] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [toast, setToast] = useState(null)
  const [logs, setLogs] = useState([])

  const safeSendMessage = (action, data = {}) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return;

      try {
        chrome.tabs.sendMessage(activeTab.id, { action, ...data }, () => {
          const lastErr = chrome.runtime.lastError;
          if (lastErr) {
            const msg = lastErr.message || '';
            
            // Handle specific Chrome Extension lifecycle errors
            if (msg.includes('Extension context invalidated')) {
              showToast('System updated. Please refresh Google Maps to continue.', 'info');
              setIsScraping(false);
            } else if (msg.includes('Could not establish connection') || msg.includes('Receiving end does not exist')) {
              // Only alert on START_SCRAPING, others are usually cleanup or meta-sync
              if (action === 'START_SCRAPING') {
                showToast('Google Maps scraper not ready. Refresh the page!', 'error');
              }
            } else {
              console.warn(`[LeadRadar Message Error] ${action}:`, msg);
            }
          }
        });
      } catch (e) {
        if (e.message.includes('Extension context invalidated')) {
          showToast('Extension updated. Refreshing the page is required.', 'info');
          setIsScraping(false);
        }
      }
    });
  };

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['stats', 'settings', 'isScraping', 'lastLead', 'allLeads', 'history', 'darkMode', 'apiKey'], (result) => {
        if (result.stats) setStats(result.stats)
        if (result.settings) {
          setSettings(prev => ({
            ...DEFAULT_SETTINGS,
            ...prev,
            ...result.settings,
            apiKey: result.apiKey || result.settings.apiKey || prev.apiKey || ''
          }))
        }
        if (result.isScraping) setIsScraping(result.isScraping)
        if (result.lastLead) setLastLead(result.lastLead)
        if (result.allLeads) setAllLeads(result.allLeads)
        if (result.history) setHistory(result.history)
        if (result.darkMode !== undefined) setDarkMode(result.darkMode)
      })
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleStorageChange = (changes, namespace) => {
      if (namespace === 'local') {
        if (changes.allLeads) setAllLeads(changes.allLeads.newValue || []);
        if (changes.stats) setStats(changes.stats.newValue || { leads: 0, pages: 0, time: '00:00' });
        if (changes.history) setHistory(changes.history.newValue || []);
        if (changes.isScraping) setIsScraping(changes.isScraping.newValue);
        if (changes.lastLead) setLastLead(changes.lastLead.newValue);
        if (changes.settings) {
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...prev, ...(changes.settings.newValue || {}) }));
        }
      }
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
    }
    
    const messageListener = (request) => {
      if (request.action === 'LOG_MONITOR') {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: request.message }].slice(-100));
      } else if (request.action === 'UPDATE_STATS') {
        setStats(request.stats);
        if (request.lastLead) setLastLead(request.lastLead);
      }
    };
    
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener(messageListener);
    }

    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const toggleSetting = (key, value = null) => {
    const newSettings = { ...settings, [key]: value !== null ? value : !settings[key] }
    setSettings(newSettings)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const update = { settings: newSettings }
      if (key === 'apiKey') update.apiKey = value
      chrome.storage.local.set(update)
    }
    safeSendMessage('SETTINGS_UPDATED', { settings: newSettings })
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ darkMode: newDarkMode });
    }
  }

  const startScraping = () => {
    const isOR = settings.aiProvider === 'openrouter';
    const activeKey = isOR ? settings.openRouterKey : settings.apiKey;
    if (!activeKey) {
      showToast(`${isOR ? 'OpenRouter' : 'Gemini'} key not configured. Standard DOM mode active.`, 'info');
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "[INFO] API Key not detected. Standard DOM extraction active." }]);
    }

    setIsScraping(true);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "[SESSION] Extraction engine started. Scanning Google Maps..." }]);
    safeSendMessage('START_SCRAPING', { settings });
    showToast('Lead extraction started', 'success');
  };

  const stopScraping = () => {
    setIsScraping(false)
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "[SESSION] Scraping session stopped." }]);
    safeSendMessage('STOP_SCRAPING');
    showToast('Scraping stopped', 'info');
  }

  const exportData = (customLeads) => {
    const leadsToExport = (Array.isArray(customLeads) && customLeads.length > 0) ? customLeads : allLeads;
    if (leadsToExport.length === 0) {
      showToast('No leads to export', 'error');
      return;
    }
    const csvContent = convertToCSV(leadsToExport);
    const filename = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(csvContent, filename);
    showToast('CSV exported successfully', 'success');
  }

  const handleClearData = () => {
    setAllLeads([]);
    setStats({ leads: 0, pages: 0, time: '00:00' });
    setLastLead(null);
    setLogs([]);
    safeSendMessage('CLEAR_DATA');
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ allLeads: [], stats: { leads: 0, pages: 0, time: '00:00' }, lastLead: null });
    }
    showToast('Data cleared', 'success');
  }

  const handleCopyClipboard = (leadsToCopy) => {
    const text = leadsToCopy.map(l => `${l.name}\t${l.phone || ''}\t${l.website || ''}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${leadsToCopy.length} rows`, 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'data', label: 'Leads', icon: Table2, badge: allLeads.length },
    { id: 'monitor', label: 'Monitor', icon: Activity, dot: isScraping },
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className={`w-full h-screen flex flex-col font-sans select-none overflow-hidden ${darkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Header isScraping={isScraping} />

      {/* Modern Light Theme Segmented Navigation */}
      <nav className={`px-3 pt-2 pb-0 flex items-center gap-1 border-b overflow-x-auto whitespace-nowrap scrollbar-none ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative px-3 py-2 text-xs font-semibold rounded-t-lg transition-all flex items-center gap-1.5 border-b-2 -mb-px ${
                isActive
                  ? darkMode
                    ? 'border-blue-500 text-blue-400 bg-slate-900/60'
                    : 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : darkMode
                    ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} className={tab.dot && isScraping ? "text-emerald-500 animate-pulse" : ""} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
              {tab.dot && isScraping && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-hidden relative">
        {currentTab === 'dashboard' && (
          <div className={`h-full flex flex-col overflow-y-auto tab-content ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <StatsDashboard stats={stats} />
            <ResultsPreview lastLead={lastLead} />
            <Controls
              isScraping={isScraping}
              onStart={startScraping}
              onStop={stopScraping}
              onExport={exportData}
              onReset={handleClearData}
              hasLeads={stats.leads > 0}
            />
          </div>
        )}
        {currentTab === 'settings' && (
          <div className={`h-full overflow-y-auto tab-content ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Settings
              settings={settings}
              onToggle={toggleSetting}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          </div>
        )}
        {currentTab === 'data' && (
          <ResultsTable
            leads={allLeads}
            onClear={handleClearData}
            onCopy={handleCopyClipboard}
            onExport={exportData}
          />
        )}
        {currentTab === 'monitor' && (
          <LiveMonitor logs={logs} isScraping={isScraping} />
        )}
        {currentTab === 'history' && (
          <History history={history} />
        )}
      </div>

      <Footer />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default App
