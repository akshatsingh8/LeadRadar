import { extractLeads } from './scraper';
import { scrollFeed, hasReachedEnd } from './scroll';
import { clickNext } from './navigation';

let isScraping = false;
let scrapedLeads = new Map();
let startTime = null;
let pageCount = 1;

// Context liveness guard to prevent "Extension context invalidated" errors
const isContextValid = () => {
    try {
        return typeof chrome !== 'undefined' && Boolean(chrome?.runtime?.id);
    } catch {
        return false;
    }
};

// Load existing state safely
if (isContextValid()) {
    try {
        chrome.storage.local.get(['allLeads', 'isScraping', 'stats'], (result) => {
            if (chrome.runtime?.lastError || !isContextValid()) return;
            if (result?.allLeads && Array.isArray(result.allLeads)) {
                result.allLeads.forEach(lead => {
                    const key = lead.url || lead.name;
                    if (key) scrapedLeads.set(key, lead);
                });
            }
        });
    } catch {
        // Suppress initial context check failure
    }
}

const safeSendMessage = (message, callback) => {
    if (!isContextValid()) {
        isScraping = false;
        return false;
    }
    try {
        const p = chrome.runtime.sendMessage(message, (res) => {
            if (chrome.runtime?.lastError) {
                // Suppress context invalidation or closed port errors
            }
            if (callback) callback(res);
        });
        if (p && typeof p.catch === 'function') {
            p.catch(() => {
                isScraping = false;
            });
        }
        return true;
    } catch {
        isScraping = false;
        return false;
    }
};

let activeSettings = { autoScroll: true, autoNextPage: true, humanBehavior: true };

if (isContextValid()) {
    try {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'START_SCRAPING') {
                if (request.settings) {
                    activeSettings = { ...activeSettings, ...request.settings };
                }
                if (!isScraping) {
                    isScraping = true;
                    startTime = Date.now();
                    scrapeLoop(activeSettings);
                }
                sendResponse({ success: true });
            }
            else if (request.action === 'SETTINGS_UPDATED') {
                if (request.settings) {
                    activeSettings = { ...activeSettings, ...request.settings };
                }
                sendResponse({ success: true });
            }
            else if (request.action === 'STOP_SCRAPING') {
                stopScraping();
                sendResponse({ success: true });
            }
            else if (request.action === 'EXPORT_CSV') {
                sendResponse({ success: true });
            }
            else if (request.action === 'CLEAR_DATA') {
                scrapedLeads.clear();
                pageCount = 1;
                startTime = Date.now();
                sendResponse({ success: true });
            }
            return false;
        });
    } catch {
        // Suppress listener registration error if context became invalid
    }
}

function stopScraping() {
    isScraping = false;
    safeSendMessage({ action: 'SCRAPING_STOPPED' });
    if (isContextValid()) {
        try {
            chrome.storage.local.set({ isScraping: false });
        } catch {}
    }
    saveHistory();
}

function saveHistory() {
    if (!isContextValid()) return;
    try {
        chrome.storage.local.get(['history'], (result) => {
            if (chrome.runtime?.lastError || !isContextValid()) return;
            const history = result?.history || [];
            const leads = Array.from(scrapedLeads.values());
            if (leads.length === 0) return;

            const keyword = leads[0].keyword || "Unknown";
            const entry = {
                timestamp: Date.now(),
                keyword: keyword,
                count: leads.length
            };

            const last = history[history.length - 1];
            if (last && last.keyword === keyword && last.count === entry.count && (entry.timestamp - last.timestamp < 60000)) {
                history[history.length - 1] = entry;
            } else {
                history.push(entry);
            }

            if (isContextValid()) {
                try {
                    chrome.storage.local.set({ history: history });
                } catch {}
            }
        });
    } catch {}
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}


async function syncData(newlyFoundLeads = []) {
    if (!isContextValid()) {
        isScraping = false;
        return;
    }

    const stats = {
        leads: scrapedLeads.size,
        pages: pageCount,
        time: formatTime(startTime ? Date.now() - startTime : 0)
    };

    try {
        if (newlyFoundLeads.length > 0) {
            const storage = await new Promise(r => {
                if (!isContextValid()) return r({});
                try {
                    chrome.storage.local.get(['allLeads'], (res) => {
                        if (chrome.runtime?.lastError) return r({});
                        r(res || {});
                    });
                } catch {
                    r({});
                }
            });
            let existingLeads = storage?.allLeads || [];
            
            newlyFoundLeads.forEach(lead => {
                const key = lead.url || lead.name;
                const index = existingLeads.findIndex(l => (l.url || l.name) === key);
                if (index === -1) {
                    existingLeads.push(lead);
                } else {
                    // Merge if updating existing
                    existingLeads[index] = { ...existingLeads[index], ...lead };
                }
            });

            if (isContextValid()) {
                try {
                    chrome.storage.local.set({ 
                        allLeads: existingLeads,
                        stats: stats
                    });
                } catch {}
            }
        } else {
            if (isContextValid()) {
                try {
                    chrome.storage.local.set({ stats: stats });
                } catch {}
            }
        }
    } catch {
        isScraping = false;
    }

    safeSendMessage({
        action: 'UPDATE_STATS',
        stats: stats
    });
}

async function scrapeLoop(initialSettings) {
    if (initialSettings) {
        activeSettings = { ...activeSettings, ...initialSettings };
    }
    if (isContextValid()) {
        try {
            chrome.storage.local.set({ isScraping: true });
        } catch {}
    }
    
    // Send initial heartbeat log
    safeSendMessage({
        action: 'LOG_MONITOR',
        message: '[ENGINE] Connected to Google Maps feed.'
    });

    while (isScraping) {
        if (!isContextValid()) {
            isScraping = false;
            break;
        }

        if (activeSettings.autoScroll) {
            const scrolled = scrollFeed();
            if (scrolled) {
                const delay = activeSettings.humanBehavior ? (1000 + Math.random() * 1000) : 1000;
                await sleep(delay);
            } else {
                await sleep(500);
            }
        }

        if (!isContextValid()) {
            isScraping = false;
            break;
        }

        const newLeads = extractLeads();
        let newlyFoundLeads = [];

        newLeads.forEach(lead => {
            const key = lead.url || lead.name;
            if (key && !scrapedLeads.has(key)) {
                scrapedLeads.set(key, lead);
                newlyFoundLeads.push(lead);

                // Trigger Website Deep Enrichment (Email & Socials Scraping)
                if (lead.website && activeSettings.deepEnrichment !== false) {
                    safeSendMessage({ action: 'ENRICH_LEAD', url: lead.website, id: key });
                }
            }
        });

        if (!isContextValid()) {
            isScraping = false;
            break;
        }

        if (isScraping && newlyFoundLeads.length > 0) {
            await syncData(newlyFoundLeads);
        } else if (isScraping) {
            await syncData([]); // Just updates stats
        }

        if (!isContextValid()) {
            isScraping = false;
            break;
        }

        if (activeSettings.autoNextPage && hasReachedEnd()) {
            await sleep(2000);
            const clicked = clickNext();
            if (clicked) {
                pageCount++;
                await sleep(5000);
            }
        }

        await sleep(1000 + Math.random() * 500);
    }
}
