import { extractLeads } from './scraper';
import { scrollFeed, hasReachedEnd } from './scroll';
import { clickNext } from './navigation';
import { convertToCSV, downloadCSV } from './csv';

let isScraping = false;
let scrapedLeads = new Map();
let startTime = null;
let pageCount = 1;

// Load existing state
chrome.storage.local.get(['allLeads', 'isScraping', 'stats'], (result) => {
    if (result.allLeads && Array.isArray(result.allLeads)) {
        result.allLeads.forEach(lead => {
            const key = lead.url || lead.name;
            if (key) scrapedLeads.set(key, lead);
        });
    }
});

const safeSendMessage = (message, callback) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        try {
            chrome.runtime.sendMessage(message, callback);
            return true;
        } catch (e) {
            console.warn('[LeadRadar] Runtime disconnected:', e.message);
            isScraping = false;
        }
    } else {
        isScraping = false;
    }
    return false;
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_SCRAPING') {
        if (!isScraping) {
            isScraping = true;
            startTime = Date.now();
            scrapeLoop(request.settings);
        }
        sendResponse({ success: true });
    }
    else if (request.action === 'STOP_SCRAPING') {
        stopScraping();
        sendResponse({ success: true });
    }
    else if (request.action === 'EXPORT_CSV') {
        // Redundant as of v1.0.3 but kept for backward compatibility during rollout
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

function stopScraping() {
    isScraping = false;
    safeSendMessage({ action: 'SCRAPING_STOPPED' });
    chrome.storage.local.set({ isScraping: false });
    saveHistory();
}

function saveHistory() {
    chrome.storage.local.get(['history'], (result) => {
        const history = result.history || [];
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

        chrome.storage.local.set({ history: history });
    });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}


async function syncData(newlyFoundLeads = []) {
    // If no new leads, just update stats
    const stats = {
        leads: scrapedLeads.size,
        pages: pageCount,
        time: formatTime(startTime ? Date.now() - startTime : 0)
    };

    if (newlyFoundLeads.length > 0) {
        const storage = await new Promise(r => chrome.storage.local.get(['allLeads'], r));
        let existingLeads = storage.allLeads || [];
        
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

        chrome.storage.local.set({ 
            allLeads: existingLeads,
            stats: stats
        });
    } else {
        chrome.storage.local.set({ stats: stats });
    }

    try {
        chrome.runtime.sendMessage({
            action: 'UPDATE_STATS',
            stats: stats
        });
    } catch(e){}
}

async function scrapeLoop(settings) {
    chrome.storage.local.set({ isScraping: true });
    
    // Send initial heartbeat log
    safeSendMessage({
        action: 'LOG_MONITOR',
        message: '📡 Scraper engine connected to Google Maps tab.'
    });

    // Get API Key and Model for AI mode
    const storage = await new Promise(r => chrome.storage.local.get(['apiKey', 'settings'], r));
    const apiKey = storage.apiKey;
    const aiModel = storage.settings?.aiModel || 'gemini-3.1-flash-lite-preview';

    while (isScraping) {
        if (settings.autoScroll) {
            const scrolled = scrollFeed();
            if (scrolled) {
                await sleep(1000 + Math.random() * 1000);
            } else {
                await sleep(500);
            }
        }

        const newLeads = extractLeads();
        let newlyFoundLeads = [];

        newLeads.forEach(lead => {
            const key = lead.url || lead.name;
            if (key && !scrapedLeads.has(key)) {
                scrapedLeads.set(key, lead);
                newlyFoundLeads.push(lead);

                // 1. Trigger AI Smart Batching (Fire and Forget)
                if (apiKey) {
                    safeSendMessage({ action: 'AI_PARSE_LEAD', lead, apiKey, aiModel });
                }

                // 2. Trigger Website Enrichment (Deep Scraping - Independent)
                if (lead.website) {
                    safeSendMessage({ action: 'ENRICH_LEAD', url: lead.website, id: key });
                }
            }
        });

        if (isScraping && newlyFoundLeads.length > 0) {
            syncData(newlyFoundLeads);
        } else if (isScraping) {
            syncData([]); // Just updates stats
        }

        if (settings.autoNextPage && hasReachedEnd()) {
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
