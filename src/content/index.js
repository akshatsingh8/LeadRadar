import { extractLeads } from './scraper';
import { scrollFeed, hasReachedEnd } from './scroll';
import { clickNext } from './navigation';

let isScraping = false;
let scrapedLeads = new Map();
let startTime = null;
let pageCount = 1;
let isCampaignMode = false;
let queryLeadsCount = 0;
let consecutiveNoNewLeads = 0;
let contextDead = false;

// Global rejection interceptor: Prevents Chromium from logging unhandled extension errors
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const msg = event?.reason?.message || String(event?.reason || '');
        if (
            msg.includes('context invalidated') ||
            msg.includes('Receiving end does not exist') ||
            msg.includes('Could not establish connection')
        ) {
            contextDead = true;
            isScraping = false;
            event.preventDefault();
        }
    });
}

const markContextDead = () => {
    contextDead = true;
    isScraping = false;
};

// Context liveness guard to prevent "Extension context invalidated" errors
const isContextValid = () => {
    if (contextDead) return false;
    try {
        if (typeof chrome === 'undefined' || !chrome?.runtime?.id) {
            markContextDead();
            return false;
        }
        return true;
    } catch {
        markContextDead();
        return false;
    }
};

// Safe storage wrapper that catches all promise rejections
const safeStorageGet = (keys) => {
    if (!isContextValid()) return Promise.resolve({});
    try {
        const p = chrome.storage.local.get(keys);
        if (p && typeof p.then === 'function') {
            return p.catch(() => {
                markContextDead();
                return {};
            });
        }
        return new Promise((resolve) => {
            try {
                chrome.storage.local.get(keys, (res) => {
                    if (chrome.runtime?.lastError) {
                        markContextDead();
                        resolve({});
                    } else {
                        resolve(res || {});
                    }
                });
            } catch {
                markContextDead();
                resolve({});
            }
        });
    } catch {
        markContextDead();
        return Promise.resolve({});
    }
};

const safeStorageSet = (items) => {
    if (!isContextValid()) return Promise.resolve();
    try {
        const p = chrome.storage.local.set(items);
        if (p && typeof p.then === 'function') {
            return p.catch(() => {
                markContextDead();
            });
        }
        return Promise.resolve();
    } catch {
        markContextDead();
        return Promise.resolve();
    }
};

const safeSendMessage = (message, callback) => {
    if (!isContextValid()) {
        isScraping = false;
        return false;
    }
    try {
        const p = chrome.runtime.sendMessage(message);
        if (p && typeof p.then === 'function') {
            p.then((res) => {
                if (callback) callback(res);
            }).catch(() => {
                markContextDead();
            });
        }
        return true;
    } catch {
        markContextDead();
        return false;
    }
};

let activeSettings = { autoScroll: true, autoNextPage: true, humanBehavior: true };

// Load existing state safely
if (isContextValid()) {
    safeStorageGet(['allLeads', 'isScraping', 'stats', 'campaignState']).then((result) => {
        if (!isContextValid()) return;
        if (result?.allLeads && Array.isArray(result.allLeads)) {
            result.allLeads.forEach(lead => {
                const key = lead.url || lead.name;
                if (key) scrapedLeads.set(key, lead);
            });
        }

        // Auto-start scraping if page loaded as part of an active campaign
        if (result?.campaignState?.active) {
            isCampaignMode = true;
            setTimeout(() => {
                if (!isContextValid() || isScraping) return;
                safeStorageGet(['campaignState', 'settings']).then((res) => {
                    if (!isContextValid()) return;
                    if (res?.campaignState?.active && !isScraping) {
                        isScraping = true;
                        isCampaignMode = true;
                        queryLeadsCount = 0;
                        consecutiveNoNewLeads = 0;
                        startTime = Date.now();
                        scrapeLoop({ ...activeSettings, ...(res?.settings || {}) });
                    }
                });
            }, 3500);
        }
    });
}

if (isContextValid()) {
    try {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'START_SCRAPING') {
                if (request.settings) {
                    activeSettings = { ...activeSettings, ...request.settings };
                }
                if (request.isCampaign !== undefined) {
                    isCampaignMode = Boolean(request.isCampaign);
                }
                queryLeadsCount = 0;
                consecutiveNoNewLeads = 0;
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
    isCampaignMode = false;
    safeSendMessage({ action: 'SCRAPING_STOPPED' });
    safeStorageSet({ isScraping: false });
    saveHistory();
}

function saveHistory() {
    if (!isContextValid()) return;
    safeStorageGet(['history']).then((result) => {
        if (!isContextValid()) return;
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

        safeStorageSet({ history: history });
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
            const storage = await safeStorageGet(['allLeads']);
            if (!isContextValid()) return;
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

            await safeStorageSet({ 
                allLeads: existingLeads,
                stats: stats
            });
        } else {
            await safeStorageSet({ stats: stats });
        }
    } catch {
        markContextDead();
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
    await safeStorageSet({ isScraping: true });
    
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

        if (newlyFoundLeads.length > 0) {
            queryLeadsCount += newlyFoundLeads.length;
            consecutiveNoNewLeads = 0;
        } else {
            consecutiveNoNewLeads++;
        }

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

        const endReached = hasReachedEnd();
        if (activeSettings.autoNextPage && endReached) {
            await sleep(2000);
            const clicked = clickNext();
            if (clicked) {
                pageCount++;
                consecutiveNoNewLeads = 0;
                await sleep(5000);
                continue;
            }
        }

        // Campaign mode: If current search query is exhausted, notify background to advance
        if (isCampaignMode && (endReached || consecutiveNoNewLeads >= 7)) {
            safeSendMessage({
                action: 'LOG_MONITOR',
                message: `[CAMPAIGN] Query exhausted (${queryLeadsCount} leads gathered). Advancing to next target...`
            });
            safeSendMessage({
                action: 'CAMPAIGN_QUERY_FINISHED',
                leadsFound: queryLeadsCount
            });
            isScraping = false;
            break;
        }

        await sleep(1000 + Math.random() * 500);
    }
}
