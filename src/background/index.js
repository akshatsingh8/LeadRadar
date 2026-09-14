// LeadRadar Pro - Background Service Worker

// Global suppression of unhandled extension rejections (e.g. disconnected ports or tabs)
self.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason || '');
  if (
    msg.includes('context invalidated') ||
    msg.includes('Receiving end does not exist') ||
    msg.includes('Could not establish connection')
  ) {
    event.preventDefault();
  }
});

// 1. Side Panel Management
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(console.error);
});

// 2. Heartbeat to keep Service Worker alive
const ALARM_NAME = 'keepAlive';
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    // Keeps SW awake
  }
});

const BATCH_SIZE = 10; // Optimized at 10 to minimize the number of API calls/requests
const MODEL_CONFIG = {
    'gemini-3.1-flash-lite-preview': { rpm: 15, delay: 4100 },
    'gemini-3.1-pro-preview': { rpm: 5, delay: 12100 }
};

// Track already buffered/processed leads to avoid duplicates
let processedLeadsGlobal = new Set();

// ---------------- DEFENSIVE MESSAGE HELPERS ----------------
function safeBroadcast(message) {
    try {
        const p = chrome.runtime.sendMessage(message);
        if (p && typeof p.then === 'function') {
            p.catch(() => {});
        }
    } catch {}
}

function safeSendTab(tabId, message) {
    if (!tabId) return;
    try {
        const p = chrome.tabs.sendMessage(tabId, message);
        if (p && typeof p.then === 'function') {
            p.catch(() => {});
        }
    } catch {}
}

// ---------------- CAMPAIGN QUEUE STATE ----------------
let campaignState = {
    active: false,
    queue: [],
    currentIndex: 0,
    tabId: null,
    totalLeadsCollected: 0
};

// Initialize campaignState from local storage
chrome.storage.local.get(['campaignState'], (result) => {
    if (result.campaignState) {
        campaignState = { ...campaignState, ...result.campaignState };
    }
});

function advanceCampaignQuery(wasSkipped = false) {
    if (!campaignState.active) return;

    if (wasSkipped && campaignState.queue[campaignState.currentIndex]) {
        campaignState.queue[campaignState.currentIndex].status = 'skipped';
    }

    const nextIndex = campaignState.currentIndex + 1;
    if (nextIndex < campaignState.queue.length) {
        campaignState.currentIndex = nextIndex;
        campaignState.queue[nextIndex].status = 'running';
        chrome.storage.local.set({ campaignState });

        const nextQuery = campaignState.queue[nextIndex].query;
        const targetUrl = `https://www.google.com/maps/search/${encodeURIComponent(nextQuery)}/`;

        safeBroadcast({
            action: 'LOG_MONITOR',
            message: `[CAMPAIGN] Advancing to query ${nextIndex + 1}/${campaignState.queue.length}: "${nextQuery}"`
        });

        if (campaignState.tabId) {
            chrome.tabs.update(campaignState.tabId, { url: targetUrl });
        }
    } else {
        // Campaign Complete!
        campaignState.active = false;
        campaignState.status = 'completed';
        chrome.storage.local.set({ campaignState });

        safeBroadcast({
            action: 'LOG_MONITOR',
            message: `[CAMPAIGN] Complete! Scraped across all ${campaignState.queue.length} queries.`
        });

        safeBroadcast({
            action: 'CAMPAIGN_FINISHED',
            totalLeads: campaignState.totalLeadsCollected
        });
    }
}

// Auto-trigger scraping when Maps finishes loading during a campaign
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (campaignState.active && tabId === campaignState.tabId && changeInfo.status === 'complete') {
        if (tab.url && tab.url.includes('google.com/maps')) {
            setTimeout(() => {
                if (campaignState.active) {
                    chrome.storage.local.get(['settings'], (storage) => {
                        const settings = storage.settings || {};
                        safeSendTab(tabId, {
                            action: 'START_SCRAPING',
                            settings,
                            isCampaign: true,
                            queryIndex: campaignState.currentIndex
                        });
                    });
                }
            }, 3500);
        }
    }
});

// ---------------- MESSAGE LISTENERS ----------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_CAMPAIGN') {
        const { queue, tabId } = request;
        if (!queue || queue.length === 0) {
            sendResponse({ success: false, error: 'Queue is empty' });
            return true;
        }

        campaignState = {
            active: true,
            queue: queue.map((item, idx) => ({
                ...item,
                status: idx === 0 ? 'running' : 'pending'
            })),
            currentIndex: 0,
            tabId: tabId,
            totalLeadsCollected: 0
        };

        chrome.storage.local.set({ campaignState });

        const firstQuery = campaignState.queue[0].query;
        const targetUrl = `https://www.google.com/maps/search/${encodeURIComponent(firstQuery)}/`;
        
        chrome.tabs.update(tabId, { url: targetUrl }, () => {
            sendResponse({ success: true });
        });
        return true;
    }

    if (request.action === 'STOP_CAMPAIGN') {
        campaignState.active = false;
        if (campaignState.queue && campaignState.queue[campaignState.currentIndex]) {
            campaignState.queue[campaignState.currentIndex].status = 'stopped';
        }
        chrome.storage.local.set({ campaignState });
        if (campaignState.tabId) {
            safeSendTab(campaignState.tabId, { action: 'STOP_SCRAPING' });
        }
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'SKIP_CAMPAIGN_QUERY') {
        advanceCampaignQuery(true);
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'CAMPAIGN_QUERY_FINISHED') {
        const { leadsFound } = request;
        if (campaignState.active && campaignState.queue[campaignState.currentIndex]) {
            campaignState.queue[campaignState.currentIndex].status = 'completed';
            campaignState.queue[campaignState.currentIndex].leadsFound = leadsFound || 0;
            campaignState.totalLeadsCollected += (leadsFound || 0);
            advanceCampaignQuery(false);
        }
        sendResponse({ success: true });
        return true;
    }

    if (request.action === 'GET_CAMPAIGN_STATE') {
        sendResponse({ campaignState });
        return true;
    }

    if (request.action === 'AI_PARSE_LEAD') {
        const { lead, apiKey, aiModel } = request;
        chrome.storage.local.get(['apiKey', 'settings'], (storage) => {
            const userSettings = storage.settings || {};
            const activeApiKey = apiKey || storage.apiKey;
            const activeOrKey = userSettings.openRouterKey;

            if (!activeApiKey && !activeOrKey) {
                sendResponse({ success: false, error: 'API Key missing' });
                return;
            }

            if (processedLeadsGlobal.has(lead.url)) {
                sendResponse({ success: true, message: 'Already in queue/processed' });
                return;
            }

            aiBuffer.push({ lead, senderTabId: sender.tab?.id, aiModel: aiModel || userSettings.aiModel });
            processedLeadsGlobal.add(lead.url);

            if (aiBuffer.length >= BATCH_SIZE && !isProcessingAI) {
                processBatch(activeApiKey, activeOrKey);
            } else if (!isProcessingAI) {
                setTimeout(() => processBatch(activeApiKey, activeOrKey), 4000);
            }
        });
        sendResponse({ success: true, message: 'Added to batch buffer' });
        return true;
    }

    if (request.action === 'ENRICH_LEAD') {
        const { url, id } = request;
        handleEnrichment(url, id || url);
        return false; // Independent execution
    }

    if (request.action === 'TEST_CONNECTION') {
        testConnection(request.apiKey, request.provider).then(res => sendResponse(res));
        return true;
    }
});

let aiBuffer = [];
let isProcessingAI = false;

// ---------------- ATOMIC STORAGE PATCHER ----------------
async function patchLeads(patchArray) {
    if (!patchArray || patchArray.length === 0) return;
    
    try {
        const storage = await new Promise(r => chrome.storage.local.get(['allLeads'], r));
        let allLeads = storage.allLeads || [];
        let updatedCount = 0;

        patchArray.forEach(patch => {
            // Find by URL/ID match
            const index = allLeads.findIndex(l => 
                (l.url === patch.id) || 
                (l.id === patch.id) ||
                (l.name === patch.id && patch.id && patch.id.length > 3)
            );
            
            if (index !== -1) {
                allLeads[index] = { ...allLeads[index], ...patch };
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await chrome.storage.local.set({ allLeads, lastUpdate: Date.now() });
        }
    } catch(e) {
        console.error('[DATABASE ERROR] Failed to patch leads:', e.message);
    }
}

// ---------------- AI PROCESSING ENGINE ----------------
function buildFallbackChain(userSettings) {
    const provider = userSettings.aiProvider || 'gemini';
    const selectedModel = userSettings.aiModel;
    const chain = [];

    if (provider === 'openrouter') {
        if (selectedModel) chain.push({ provider: 'openrouter', model: selectedModel });
        chain.push(
            { provider: 'openrouter', model: 'openai/gpt-oss-120b:free' },
            { provider: 'openrouter', model: 'liquid/lfm-2.5-1.2b-thinking:free' },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-30b-a3b:free' },
            { provider: 'gemini', model: 'gemini-2.0-flash' },
            { provider: 'gemini', model: 'gemini-1.5-flash' }
        );
    } else {
        if (selectedModel) chain.push({ provider: 'gemini', model: selectedModel });
        chain.push(
            { provider: 'gemini', model: 'gemini-3.1-flash-lite-preview' },
            { provider: 'gemini', model: 'gemini-2.0-flash' },
            { provider: 'gemini', model: 'gemini-1.5-flash' },
            { provider: 'openrouter', model: 'liquid/lfm-2.5-1.2b-thinking:free' },
            { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-30b-a3b:free' }
        );
    }

    // Deduplicate models in chain
    const seen = new Set();
    return chain.filter(item => {
        const key = `${item.provider}:${item.model}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function processBatch(passedApiKey, passedOrKey) {
    if (isProcessingAI || aiBuffer.length === 0) return;
    isProcessingAI = true;

    const storage = await new Promise(r => chrome.storage.local.get(['apiKey', 'settings'], r));
    const userSettings = storage.settings || {};
    const apiKey = passedApiKey || storage.apiKey;
    const orKey = passedOrKey || userSettings.openRouterKey;
    const tierChain = buildFallbackChain(userSettings);

    try {
        while (aiBuffer.length > 0) {
            const currentBatch = aiBuffer.splice(0, BATCH_SIZE);
            const payloadText = currentBatch.map(item => item.lead.optimizedText).join("\n\n---\n\n");
            const startTime = performance.now();
            let batchSuccess = false;

            const systemPrompt = `G-Maps Data Specialist. "Clean" and "Format" the specific tags into the schema.
SCHEMA: { "id": "ID_REF from input", "street": "Street number & name or empty", "city": "City name or empty", "state": "State/Province or empty", "zip": "Postal code or empty", "country": "Country or empty", "address": "Cleaned Full Address", "phone": "International Clean Format or empty" }
RULES: Extract clean individual components (street, city, state, zip, country, phone, address). ID must match ID_REF exactly. Output VALID JSON array ONLY. NO preamble.`;

            for (const tier of tierChain) {
                const activeKey = tier.provider === 'openrouter' ? orKey : apiKey;
                if (!activeKey) continue;

                try {
                    let response;
                    if (tier.provider === 'openrouter') {
                        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: { "Authorization": `Bearer ${activeKey}`, "Content-Type": "application/json" },
                            body: JSON.stringify({
                                "model": tier.model,
                                "messages": [{ "role": "system", "content": systemPrompt }, { "role": "user", "content": payloadText }]
                            })
                        });
                    } else {
                        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${tier.model}:generateContent?key=${activeKey}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nDATA:\n${payloadText}` }] }] })
                        });
                    }

                    if (response.status === 503 || response.status === 429) {
                        safeBroadcast({ action: 'LOG_MONITOR', message: `[TIER BUSY] ${tier.model} (${response.status}). Retrying in 2s...` });
                        await new Promise(r => setTimeout(r, 2000));
                        continue;
                    }

                    if (!response.ok) {
                        continue;
                    }

                    const result = await response.json();
                    const jsonText = tier.provider === 'openrouter' ? result.choices[0]?.message?.content : result.candidates[0]?.content?.parts[0]?.text;
                    if (!jsonText) continue;

                    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);

                    if (jsonMatch) {
                        const parsedLeads = JSON.parse(jsonMatch[0]);
                        await patchLeads(parsedLeads);
                        parsedLeads.forEach(lead => { if (lead.website) handleEnrichment(lead.website, lead.id); });
                        batchSuccess = true;
                        const latency = Math.round(performance.now() - startTime);
                        safeBroadcast({ action: 'LOG_MONITOR', message: `[AI ENGINE] ${tier.model} OK | Latency: ${latency}ms | Queue: ${aiBuffer.length}` });
                        break;
                    }
                } catch (e) {
                    console.warn(`[AI TIER ERROR] ${tier.model}:`, e.message);
                }
            }

            if (!batchSuccess) {
                aiBuffer.unshift(...currentBatch);
                safeBroadcast({ action: 'LOG_MONITOR', message: `[AI COOLING] Retrying queue in 10s...` });
                await new Promise(r => setTimeout(r, 10000));
            } else {
                await new Promise(r => setTimeout(r, 4000));
            }
        }
        
        safeBroadcast({ action: 'LOG_MONITOR', message: `[SYSTEM] Process complete. All leads in queue analyzed.` });
    } finally {
        isProcessingAI = false;
    }
}

// ---------------- WEBSITE SCRAPING ENGINE ----------------
async function handleEnrichment(baseUrl, leadId) {
    if (!baseUrl || !baseUrl.startsWith('http')) return;

    try {
        const html = await safeFetch(baseUrl);
        if (!html) return;

        const results = parseHtmlForData(html);

        // Sub-page Deep Crawl (Contact/About) if email or phone missing
        if (results.emails.length === 0 || !results.websitePhone) {
            const contactRegex = /href=["']([^"']*(?:contact|about|info|reach|legal)[^"']*)["']/gi;
            const matches = [...html.matchAll(contactRegex)];
            const subPagePath = matches[0]?.[1];

            if (subPagePath) {
                const subUrl = subPagePath.startsWith('http') ? subPagePath : new URL(subPagePath, baseUrl).href;
                const subHtml = await safeFetch(subUrl);
                if (subHtml) {
                    const subResults = parseHtmlForData(subHtml);
                    results.emails = [...new Set([...results.emails, ...subResults.emails])].slice(0, 3);
                    if (!results.websitePhone && subResults.websitePhone) results.websitePhone = subResults.websitePhone;
                    if (!results.facebook) results.facebook = subResults.facebook;
                    if (!results.linkedin) results.linkedin = subResults.linkedin;
                    if (!results.instagram) results.instagram = subResults.instagram;
                    if (!results.twitter) results.twitter = subResults.twitter;
                }
            }
        }

        // Patch results directly to database with both single and plural keys
        await patchLeads([{
            id: leadId,
            email: results.emails[0] || '',
            email_alt: results.emails[1] || '',
            emails: results.emails.join(', '),
            linkedin: results.linkedin,
            facebook: results.facebook,
            instagram: results.instagram,
            twitter: results.twitter,
            twitter_x: results.twitter,
            websitePhone: results.websitePhone,
            enriched: true
        }]);

        safeBroadcast({ action: 'LOG_MONITOR', message: `[WEB] Enriched: ${baseUrl} (${results.emails.length} emails, phone: ${results.websitePhone || 'none'})` });

    } catch (error) {
        console.warn(`[WEB ERROR] ${baseUrl}:`, error.message);
    }
}

async function safeFetch(url, timeoutLimit = 8000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutLimit);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            return await response.text();
        }
    } catch {
        clearTimeout(timeoutId);
    }
    return null;
}

function parseHtmlForData(html) {
    const result = { emails: [], linkedin: '', facebook: '', instagram: '', twitter: '', websitePhone: '' };
    const emailsFound = new Set();

    // 1. High-priority: mailto: links
    const mailtoRegex = /href=["']mailto:([a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})[^"']*["']/gi;
    let mailtoMatch;
    while ((mailtoMatch = mailtoRegex.exec(html)) !== null) {
        emailsFound.add(mailtoMatch[1].toLowerCase());
    }

    // 2. Regular email patterns in page body
    const emailRegex = /([a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})/gi;
    let match;
    const dummyDomains = ['example.com', 'yourdomain.com', 'email.com', 'domain.com', 'sentry.io', 'wixpress.com'];
    while ((match = emailRegex.exec(html)) !== null) {
        const email = match[1].toLowerCase();
        const ext = email.split('.').pop();
        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'js', 'css', 'tiff', 'bmp', 'woff', 'ttf'].includes(ext)) {
            continue;
        }
        if (dummyDomains.some(d => email.endsWith('@' + d) || email.endsWith('.' + d))) {
            continue;
        }
        emailsFound.add(email);
    }
    result.emails = Array.from(emailsFound).slice(0, 3);

    // 3. Social profiles
    const extractSocial = (domain) => {
        const regex = new RegExp(`href=["'](https?:\\/\\/(?:www\\.)?${domain}[^"']*)["']`, 'i');
        const m = html.match(regex);
        return m ? m[1] : '';
    };

    result.linkedin = extractSocial('linkedin\\.com');
    result.facebook = extractSocial('facebook\\.com');
    result.instagram = extractSocial('instagram\\.com');
    result.twitter = extractSocial('twitter\\.com|x\\.com');

    // 4. Website Phone Number
    const telRegex = /href=["']tel:([^"']+)["']/i;
    const telMatch = html.match(telRegex);
    if (telMatch) {
        result.websitePhone = telMatch[1].replace(/[^\d+()-\s]/g, '').trim();
    } else {
        // Fallback: look for Phone / Tel text in HTML
        const phoneRegex = /(?:phone|tel|call|contact|mobile)[:\s]*([+]?[\d\s().-]{8,20}\d)/i;
        const phoneMatch = html.match(phoneRegex);
        if (phoneMatch && phoneMatch[1]) {
            const cleaned = phoneMatch[1].trim();
            if (cleaned.length >= 8 && cleaned.length <= 25) {
                result.websitePhone = cleaned;
            }
        }
    }
    return result;
}

async function testConnection(apiKey, provider = 'gemini') {
    if (!apiKey) return { success: false, error: 'Key is missing' };

    try {
        if (provider === 'openrouter' || apiKey.startsWith('sk-or-')) {
            const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const data = await response.json();
            if (response.ok && data.data) return { success: true };
            throw new Error(data.error?.message || 'Invalid OpenRouter Key');
        } else {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await response.json();
            if (data.models) return { success: true };
            throw new Error(data.error?.message || 'Invalid Gemini API Key');
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
}
