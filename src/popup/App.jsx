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

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({ leads: 0, pages: 0, time: '00:00' })
  const [isScraping, setIsScraping] = useState(false)
  const [settings, setSettings] = useState({
    humanBehavior: true,
    autoScroll: true,
    autoNextPage: true,
    aiProvider: 'gemini',
    aiModel: 'gemini-3.1-flash-lite-preview',
    openRouterKey: ''
  })
  const [lastLead, setLastLead] = useState(null)
  const [allLeads, setAllLeads] = useState([])
  const [history, setHistory] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [toast, setToast] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['stats', 'settings', 'isScraping', 'lastLead', 'allLeads', 'history', 'darkMode'], (result) => {
        if (result.stats) setStats(result.stats)
        if (result.settings) setSettings(result.settings)
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
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ darkMode: newDarkMode });
    }
  }

  const safeSendMessage = (action, data = {}) => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return;

      try {
        chrome.tabs.sendMessage(activeTab.id, { action, ...data }, (response) => {
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
  }

  const startScraping = () => {
    // Check for API Key
    if (!settings.apiKey) {
      showToast('Gemini API Key missing! Smart Mode disabled.', 'error');
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "⚠️ Warning: AI Key missing. Using legacy extraction (less accurate)." }]);
    }

    setIsScraping(true)
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Scraping session started. Warming up the engine..." }]);
    safeSendMessage('START_SCRAPING', { settings });
    showToast(`Scraping started with ${settings.aiModel || 'Gemini'}!`, 'success');
  }

  const stopScraping = () => {
    setIsScraping(false)
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: "Scraping session stopped." }]);
    safeSendMessage('STOP_SCRAPING');
    showToast('Scraping stopped.', 'info');
  }

  const exportData = () => {
    if (allLeads.length === 0) {
      showToast('No leads to export!', 'error');
      return;
    }
    const csvContent = convertToCSV(allLeads);
    const filename = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(csvContent, filename);
    showToast('CSV exported!', 'success');
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
    showToast('Data and logs cleared.', 'success');
  }

  const handleCopyClipboard = (leadsToCopy) => {
    const text = leadsToCopy.map(l => `${l.name}\t${l.phone || ''}\t${l.website || ''}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied ${leadsToCopy.length} rows!`, 'success');
    }).catch(err => {
      showToast('Failed to copy.', 'error');
    });
  }

  return (
    <div className={`w-full h-screen flex flex-col font-sans ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <Header isScraping={isScraping} />

      <div className={`flex border-b-2 overflow-x-auto whitespace-nowrap ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-white to-gray-50 border-gray-300'}`}>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'dashboard' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <LayoutGrid size={16} /> Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('data')}
          className={`px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'data' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <Table2 size={16} /> Data ({allLeads.length})
        </button>
        <button
          onClick={() => setCurrentTab('monitor')}
          className={`px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'monitor' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <Activity size={16} className={isScraping ? "text-green-500 animate-pulse" : ""} /> Monitor
        </button>
        <button
          onClick={() => setCurrentTab('history')}
          className={`px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'history' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <HistoryIcon size={16} /> History
        </button>
        <button
          onClick={() => setCurrentTab('settings')}
          className={`px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'settings' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <SettingsIcon size={16} /> Settings
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {currentTab === 'dashboard' && (
          <div className={`h-full flex flex-col overflow-y-auto tab-content ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <StatsDashboard stats={stats} />
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
          <div className={`h-full overflow-y-auto tab-content ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
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
