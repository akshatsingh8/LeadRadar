// LeadRadar Pro - Background Service Worker

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

// ---------------- MESSAGE LISTENERS ----------------
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'AI_PARSE_LEAD') {
        const { lead, apiKey, aiModel } = request;
        if (!apiKey) {
            sendResponse({ success: false, error: 'API Key missing' });
            return;
        }

        if (processedLeadsGlobal.has(lead.url)) {
            sendResponse({ success: true, message: 'Already in queue/processed' });
            return;
        }

        aiBuffer.push({ lead, senderTabId: sender.tab.id, aiModel: aiModel || 'gemini-3.1-flash-lite-preview' });
        processedLeadsGlobal.add(lead.url);
        
        if (aiBuffer.length >= BATCH_SIZE && !isProcessingAI) {
            processBatch(apiKey);
        } else if (!isProcessingAI) {
            setTimeout(() => processBatch(apiKey), 5000);
        }
        sendResponse({ success: true, message: 'Added to batch buffer' });
        return true;
    }

    if (request.action === 'ENRICH_LEAD') {
        const { url, id } = request;
        handleEnrichment(url, id || url);
        return false; // Independent execution
    }

    if (request.action === 'TEST_CONNECTION') {
        testConnection(request.apiKey).then(res => sendResponse(res));
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
                (l.name === patch.id && patch.id.length > 3)
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
// ---------------- AI PROCESSING ENGINE ----------------
let currentRetryDelay = 0; 
const TIERS = [
    { provider: 'openrouter', model: 'liquid/lfm-2.5-1.2b-thinking:free', reasoning: true },
    { provider: 'openrouter', model: 'nvidia/nemotron-3-nano-30b-a3b:free', reasoning: true },
    { provider: 'gemini', model: 'gemini-3.1-flash-lite-preview', reasoning: false },
    { provider: 'gemini', model: 'gemma-4-31b-it', reasoning: false },
    { provider: 'gemini', model: 'gemma-4-26b-a4b-it', reasoning: false },
    { provider: 'gemini', model: 'gemini-2.0-flash', reasoning: false }
];

async function processBatch(apiKey) {
    if (isProcessingAI || aiBuffer.length === 0) return;
    isProcessingAI = true; // LOCK IMMEDIATELY to prevent parallel streams during await

    const storage = await new Promise(r => chrome.storage.local.get(['settings'], r));
    const userSettings = storage.settings || {};
    const orKey = userSettings.openRouterKey;
    try {
        // --- Single Engine Loop ---
        while (aiBuffer.length > 0) {
            const currentBatch = aiBuffer.splice(0, BATCH_SIZE);
            const payloadText = currentBatch.map(item => item.lead.optimizedText).join("\n\n---\n\n");
            const startTime = performance.now();
            let batchSuccess = false;
            let errorLog = "";

            const systemPrompt = `G-Maps Data Specialist. "Clean" and "Format" the specific tags into the schema.
SCHEMA: { "id": "ID_REF from input", "city": "City name", "state": "State/Province", "address": "Cleaned Full Address", "phone": "International Clean Format" }
RULES: Focus on Address/Contact/City/State. ID must match ID_REF exactly. Output VALID JSON array ONLY. NO preamble.`;

            // --- Tier Fallback for Current Batch ---
            for (const tier of TIERS) {
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
                        try {
                            chrome.runtime.sendMessage({ action: 'LOG_MONITOR', message: `[TIER BUSY] 🔄 ${tier.model} (${response.status}). Trying next in 2s...` });
                        } catch(e){}
                        await new Promise(r => setTimeout(r, 2000));
                        continue;
                    }

                    if (!response.ok) {
                        errorLog = `Tier ${tier.model} failed (${response.status})`;
                        continue;
                    }

                    const result = await response.json();
                    const jsonText = tier.provider === 'openrouter' ? result.choices[0].message.content : result.candidates[0].content.parts[0].text;
                    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);

                    if (jsonMatch) {
                        const parsedLeads = JSON.parse(jsonMatch[0]);
                        await patchLeads(parsedLeads);
                        parsedLeads.forEach(lead => { if (lead.website) handleEnrichment(lead.website, lead.id); });
                        batchSuccess = true;
                        const latency = Math.round(performance.now() - startTime);
                        try {
                            chrome.runtime.sendMessage({ action: 'LOG_MONITOR', message: `[AI ENGINE] ✅ ${tier.model} OK | Latency: ${latency}ms | Queue: ${aiBuffer.length}` });
                        } catch(e){}
                        break; // Move to next batch
                    }
                } catch (e) { errorLog = e.message; }
            }

            if (!batchSuccess) {
                aiBuffer.unshift(...currentBatch);
                try {
                    chrome.runtime.sendMessage({ action: 'LOG_MONITOR', message: `[AI COOLING] ⏳ Global Saturation. Re-trying in 10s...` });
                } catch(e){}
                await new Promise(r => setTimeout(r, 10000));
            } else {
                // Heartbeat Wait for 12-RPM compliance (5s delay between leads)
                await new Promise(r => setTimeout(r, 5000));
            }
        }
        
        // --- FINISH MESSAGE ---
        try {
            chrome.runtime.sendMessage({ action: 'LOG_MONITOR', message: `✨ [SYSTEM] Process complete. All leads in queue have been analyzed.` });
        } catch(e){}
    } finally {
        isProcessingAI = false;
    }
}

// ---------------- WEBSITE SCRAPING ENGINE ----------------
async function handleEnrichment(baseUrl, leadId) {
    if (!baseUrl || !baseUrl.startsWith('http')) return;

    try {
        let html = await safeFetch(baseUrl);
        if (!html) return;

        let results = parseHtmlForData(html);

        // Sub-page Deep Crawl (Contact/About)
        if (results.emails.length === 0) {
            const contactRegex = /href=["']([^"']*(?:contact|about|info|reach|legal)[^"']*)["']/gi;
            const matches = [...html.matchAll(contactRegex)];
            const subPagePath = matches[0]?.[1];

            if (subPagePath) {
                let subUrl = subPagePath.startsWith('http') ? subPagePath : new URL(subPagePath, baseUrl).href;
                const subHtml = await safeFetch(subUrl);
                if (subHtml) {
                    const subResults = parseHtmlForData(subHtml);
                    results.emails = [...new Set([...results.emails, ...subResults.emails])].slice(0, 3);
                    if (!results.facebook) results.facebook = subResults.facebook;
                    if (!results.linkedin) results.linkedin = subResults.linkedin;
                    if (!results.instagram) results.instagram = subResults.instagram;
                    if (!results.twitter) results.twitter = subResults.twitter;
                }
            }
        }

        // Patch results directly to database
        await patchLeads([{
            id: leadId,
            emails: results.emails.join(', '),
            linkedin: results.linkedin,
            facebook: results.facebook,
            instagram: results.instagram,
            twitter_x: results.twitter,
            websitePhone: results.websitePhone
        }]);

        try {
            chrome.runtime.sendMessage({ action: 'LOG_MONITOR', message: `[WEB] Enriched: ${baseUrl} (${results.emails.length} emails)` });
        } catch(e){}

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
            const text = await response.text();
            if (text.length < 500) {
                 // Might be a challenge page or redirect
                 console.warn(`[WEB] Small response from ${url}, likely soft-block.`);
            }
            return text;
        }
    } catch (e) {
        clearTimeout(timeoutId);
    }
    return null;
}

function parseHtmlForData(html) {
    const result = { emails: [], linkedin: '', facebook: '', instagram: '', twitter: '', websitePhone: '' };
    const emailRegex = /([a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10})/gi;
    const emailsFound = new Set();
    let match;
    while ((match = emailRegex.exec(html)) !== null) {
        let email = match[1].toLowerCase();
        if (!email.match(/\.(png|jpe?g|gif|svg|webp|js|css|tiff|bmp|woff|ttf)$/)) {
            emailsFound.add(email);
        }
    }
    result.emails = Array.from(emailsFound);

    const extractSocial = (domain) => {
        const regex = new RegExp(`href=["'](https?:\\/\\/(?:www\\.)?${domain}[^"']*)["']`, 'i');
        const m = html.match(regex);
        return m ? m[1] : '';
    };

    result.linkedin = extractSocial('linkedin\\.com');
    result.facebook = extractSocial('facebook\\.com');
    result.instagram = extractSocial('instagram\\.com');
    result.twitter = extractSocial('twitter\\.com|x\\.com');

    const telRegex = /href=["']tel:([^"']+)["']/i;
    const telMatch = html.match(telRegex);
    if (telMatch) {
        result.websitePhone = telMatch[1].trim();
    }
    return result;
}

async function testConnection(apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) return { success: true };
        throw new Error(data.error?.message || 'Invalid API Response');
    } catch (err) {
        return { success: false, error: err.message };
    }
}
