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
import { LayoutGrid, Table2, History as HistoryIcon } from 'lucide-react'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({ leads: 0, pages: 0, time: '00:00' })
  const [isScraping, setIsScraping] = useState(false)
  const [settings, setSettings] = useState({
    humanBehavior: true,
    autoScroll: true,
    autoNextPage: true
  })
  const [lastLead, setLastLead] = useState(null)
  const [allLeads, setAllLeads] = useState([])
  const [history, setHistory] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [toast, setToast] = useState(null)

  // Load state from local storage on mount
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

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen for storage changes - Source of Truth
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
    return () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] }
    setSettings(newSettings)
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ settings: newSettings })
    }
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ darkMode: newDarkMode });
    }
  }

  const startScraping = () => {
    setIsScraping(true)
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'START_SCRAPING', settings })
        }
      })
    }
    showToast('Scraping started!', 'success');
  }

  const stopScraping = () => {
    setIsScraping(false)
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'STOP_SCRAPING' })
        }
      })
    }
    showToast('Scraping stopped.', 'info');
  }

  const exportData = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'EXPORT_CSV' })
        }
      })
    }
    showToast('CSV exported!', 'success');
  }

  const handleClearData = () => {
    setAllLeads([]);
    setStats({ leads: 0, pages: 0, time: '00:00' });
    setLastLead(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ allLeads: [], stats: { leads: 0, pages: 0, time: '00:00' }, lastLead: null });
    }
    showToast('Data cleared.', 'success');
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
    <div className={`w-[380px] h-[600px] flex flex-col font-sans ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <Header isScraping={isScraping} />

      {/* Tab Navigation */}
      <div className={`flex border-b-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-white to-gray-50 border-gray-300'}`}>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'dashboard' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <LayoutGrid size={16} /> Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('data')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'data' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <Table2 size={16} /> Data ({allLeads.length})
        </button>
        <button
          onClick={() => setCurrentTab('history')}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${currentTab === 'history' ? `text-blue-600 dark:text-blue-400 border-b-3 border-blue-600 dark:border-blue-400 ${darkMode ? 'bg-gray-900' : 'bg-white shadow-sm'}` : `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-blue-600'} hover:bg-gray-100 dark:hover:bg-gray-700`}`}
        >
          <HistoryIcon size={16} /> History
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {currentTab === 'dashboard' && (
          <div className={`h-full flex flex-col overflow-y-auto tab-content ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
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
        {currentTab === 'history' && (
          <History history={history} />
        )}
      </div>

      <Footer />

      {/* Toast Notification */}
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
