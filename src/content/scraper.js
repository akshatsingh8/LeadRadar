const extractPhone = (text) => {
    if (!text) return '';
    // Avoid addresses with street suffixes
    if (/\b(?:st|street|ave|avenue|rd|road|blvd|lane|dr|drive|way|court|ct|floor|suite|ste|bldg|building|parkway|pkwy)\b/i.test(text)) {
        return '';
    }
    const match = text.match(/(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{2,5}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,5}\b/);
    if (match) {
        const digits = match[0].replace(/\D/g, '');
        if (digits.length >= 7 && digits.length <= 15) {
            return match[0].trim();
        }
    }
    return '';
};

const isHours = (text) => {
    return /\b(?:Open|Closed|Closes|Opens|24 hours)\b/i.test(text) && 
           (/\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i.test(text) || /\b24 hours\b/i.test(text) || /⋅|\u22c5/i.test(text));
};

const isRatingOrReview = (text) => {
    if (/^[1-5][.,]\d\s*(?:★|stars?)?\s*(?:\([\d,.]+[kKmM]?\))?$/i.test(text)) return true;
    if (/^[1-5][.,]\d\s*\([\d,.]+[kKmM]?\)$/.test(text)) return true;
    if (/^\(?[\d,.]+[kKmM]?\)?\s*(?:reviews?|ratings?)?$/i.test(text)) return true;
    if (text.includes('★')) return true;
    return false;
};

export const extractLeads = () => {
    const leads = [];

    // 1. Keyword Extraction
    let searchKeyword = "";
    const searchInput = document.getElementById('searchboxinput');
    if (searchInput && searchInput.value) {
        searchKeyword = searchInput.value;
    } else {
        const title = document.title; 
        if (title.includes(" - Google Maps")) {
            searchKeyword = title.replace(" - Google Maps", "");
        }
    }

    // Feed resolution with multiple Google Maps DOM fallbacks
    let feed = document.querySelector('div[role="feed"], div[aria-label*="Results for" i], div.m6QErb[aria-label*="Results" i]');
    let items = feed ? Array.from(feed.querySelectorAll('div[role="article"], div.Nv2PK, .Nv2PK')) : [];

    // Fallback: If feed querySelector didn't match, query documents directly
    if (items.length === 0) {
        const potentialItems = Array.from(document.querySelectorAll('div[role="article"], div.Nv2PK, a.hfpxzc'));
        items = Array.from(new Set(potentialItems.map(el => el.closest('.Nv2PK, div[role="article"]') || el)));
    }

    if (items.length === 0) return leads;

    items.forEach(item => {
        try {
            const nameElement = item.querySelector('.qBF1Pd, .fontHeadlineSmall, [class*="fontHeadline"]');
            const data = { 
                name: nameElement ? nameElement.innerText.trim() : 'Unknown',
                keyword: searchKeyword,
                scrapedAt: new Date().toISOString()
            };

            const link = item.querySelector('a[href*="/maps/place/"], a.hfpxzc, a[href*="cid="]');
            if (link) data.url = link.href;

            if (data.name === 'Unknown' || !data.url) return;

            // --- MAX DOM SCRAPING (Script Handles Visible Data) ---
            
            // 1. Category
            data.category = item.querySelector('.W4Pne span:first-child')?.innerText || "Business";

            // 2. Rating & Reviews
            // Strategy A: Check span[role="img"] with aria-label (contains "stars" or numeric score)
            const ratingStars = item.querySelector('span[role="img"][aria-label*="star" i], span[role="img"][aria-label*="étoile" i], span[role="img"]');
            if (ratingStars) {
                const label = ratingStars.getAttribute('aria-label') || "";
                
                // Rating: Match 4.8 or 4,8
                const ratingMatch = label.match(/([1-5][.,]\d)/);
                if (ratingMatch) data.rating = ratingMatch[1].replace(',', '.');

                // Reviews inside the same aria-label (e.g. "4.8 stars 1,931 reviews" or "(1,931)")
                const reviewMatch = label.match(/\(([\d,.]+[kKmM]?)\)/) || label.match(/([\d,.]+[kKmM]?)\s*reviews/i);
                if (reviewMatch) {
                    data.reviews = reviewMatch[1].replace(/,/g, '');
                }
            }

            // Strategy B: Dedicated numerical rating element (.MW4T7c or aria-hidden text next to stars)
            if (!data.rating) {
                const ratingEl = item.querySelector('.MW4T7c, .fontHeadlineSmall ~ span, [aria-hidden="true"]');
                if (ratingEl && /^[1-5][.,]\d$/.test(ratingEl.innerText.trim())) {
                    data.rating = ratingEl.innerText.trim().replace(',', '.');
                }
            }

            // Strategy C: Dedicated review count element (.UY7F9, .RJMdx, or text with parentheses)
            if (!data.reviews) {
                const revEl = item.querySelector('.UY7F9, .RJMdx, span[aria-label*="review" i]');
                if (revEl) {
                    const revText = (revEl.getAttribute('aria-label') || revEl.innerText || '').trim();
                    const match = revText.match(/\(([\d,.]+[kKmM]?)\)/) || revText.match(/([\d,.]+[kKmM]?)\s*reviews/i) || revText.match(/([\d,.]+[kKmM]?)/);
                    if (match && match[1]) {
                        data.reviews = match[1].replace(/[(),]/g, '').trim();
                    }
                }
            }

            // Strategy D: Global pattern match on the item card's text (e.g. "4.8 (1,931)")
            if (!data.rating || !data.reviews) {
                const itemText = item.innerText || "";
                if (!data.rating) {
                    const fallbackRating = itemText.match(/\b([1-5]\.\d)\b/);
                    if (fallbackRating) data.rating = fallbackRating[1];
                }
                if (!data.reviews) {
                    // Match "(1,931)" or "(45)" or "(1.2K)" immediately following rating or stars
                    const fallbackRev = itemText.match(/\b[1-5]\.\d\s*(?:★|stars?)?\s*\(([\d,.]+[kKmM]?)\)/i) || itemText.match(/\(([\d,.]+[kKmM]?)\)/);
                    if (fallbackRev && fallbackRev[1] && !/^\d{4}$/.test(fallbackRev[1])) { // avoid matching 4-digit years
                        data.reviews = fallbackRev[1].replace(/,/g, '');
                    }
                }
            }

            // 3. Sub-info Parsing (Category, Address, Phone, Hours, Service Badges)
            const subInfoLines = Array.from(item.querySelectorAll('.W4Pne, .fontBodyMedium'));
            const allTokens = subInfoLines
                .flatMap(line => (line.innerText || '').split(/[·•\u2022\u00b7|\n]/).map(p => p.trim()))
                .filter(Boolean);

            let detectedCategory = '';
            let detectedPhone = '';
            let detectedHours = '';
            let detectedAddress = '';
            const serviceBadges = [];

            allTokens.forEach(token => {
                if (isRatingOrReview(token)) return;
                if (/^[$€£₹¥+]+$/.test(token)) return;
                if (/\b(?:\d+(?:\.\d+)?\s*(?:km|mi|m))\b/i.test(token)) return; // distance

                if (!detectedHours && isHours(token)) {
                    detectedHours = token;
                    return;
                }

                if (!detectedPhone) {
                    const ph = extractPhone(token);
                    if (ph) {
                        detectedPhone = ph;
                        return;
                    }
                }

                if (/\b(?:years in business|dine-in|takeaway|delivery|curbside|on-site|appointments|in-store|wheelchair)\b/i.test(token)) {
                    serviceBadges.push(token);
                    return;
                }

                // Category vs Address disambiguation
                if (!detectedCategory && !token.includes(',') && !/\d{2,}/.test(token) && token.length < 40) {
                    detectedCategory = token;
                    return;
                }

                if (!detectedAddress && (token.includes(',') || /\d+/.test(token) || token.length > 5)) {
                    detectedAddress = token;
                    return;
                }
            });

            // 4. Set Clean Categorical Fields
            data.category = detectedCategory || item.querySelector('.W4Pne span:first-child')?.innerText || "Business";
            data.category = data.category
                .replace(/^[1-5][.,]\d\s*(?:★)?/, '')
                .replace(/^[$€£₹¥+]+$/, '')
                .replace(/[·•]/g, '')
                .trim() || "Business";

            data.hours = detectedHours || "";
            data.phone = detectedPhone || "";
            data.address = detectedAddress || "";
            if (serviceBadges.length > 0) {
                data.sub_categories = serviceBadges.join(', ');
            }

            // 5. Website (Direct DOM Link with fallbacks & redirect unwrapping)
            const webLink = item.querySelector('a[data-value="Website"], a[aria-label*="website" i], a[data-tooltip*="website" i]');
            if (webLink && webLink.href) {
                let href = webLink.href;
                if (href.includes('google.com/url?') || href.includes('google.com/url/')) {
                    try {
                        const parsedUrl = new URL(href);
                        const target = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('url');
                        if (target) href = target;
                    } catch {
                        // Keep original href if URL parsing fails
                    }
                }
                data.website = href;
            }

            // --- SURGICAL AI PAYLOAD (Clean Isolated Tokens) ---
            data.optimizedText = `ID_REF: ${data.url}\nADDR_TAG: ${data.address || "N/A"}\nPHONE_TAG: ${data.phone || "N/A"}`;

            leads.push(data);
        } catch (e) {
            console.error('LeadRadar: Error parsing item', e);
        }
    });

    return leads;
};
