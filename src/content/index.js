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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_SCRAPING') {
        if (!isScraping) {
            isScraping = true;
            startTime = Date.now();
            scrapeLoop(request.settings);
        }
    }
    else if (request.action === 'STOP_SCRAPING') {
        stopScraping();
    }
    else if (request.action === 'EXPORT_CSV') {
        const leads = Array.from(scrapedLeads.values());
        if (leads.length > 0) {
            const csv = convertToCSV(leads);
            const keyword = leads[0].keyword ? leads[0].keyword.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'leads';
            const timestamp = new Date().toISOString().slice(0, 10);
            const filename = `${keyword}-${timestamp}.csv`;
            downloadCSV(csv, filename);
        }
    }
});

function stopScraping() {
    isScraping = false;
    chrome.runtime.sendMessage({ action: 'SCRAPING_STOPPED' });
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

async function scrapeLoop(settings) {
    chrome.storage.local.set({ isScraping: true });

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
        let addedCount = 0;
        let lastAdded = null;
        let storageUpdateNeeded = false;

        newLeads.forEach(lead => {
            const key = lead.url || lead.name;
            if (key && !scrapedLeads.has(key)) {
                scrapedLeads.set(key, lead);
                addedCount++;
                lastAdded = lead;
                storageUpdateNeeded = true;
            }
        });

        if (isScraping) {
            const currentLeadsArray = Array.from(scrapedLeads.values());
            const stats = {
                leads: currentLeadsArray.length,
                pages: pageCount,
                time: formatTime(Date.now() - startTime)
            };

            const update = {
                stats: stats,
                isScraping: true
            };

            if (storageUpdateNeeded || addedCount > 0) {
                update.allLeads = currentLeadsArray;
                update.lastLead = lastAdded;
            }

            chrome.storage.local.set(update);

            try {
                chrome.runtime.sendMessage({
                    action: 'UPDATE_STATS',
                    stats: stats,
                    lastLead: lastAdded
                });
            } catch (e) {
                // Silent fail
            }
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
