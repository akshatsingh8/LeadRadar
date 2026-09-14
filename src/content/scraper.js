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

    const feed = document.querySelector('div[role="feed"]');
    if (!feed) return leads;

    const items = Array.from(feed.querySelectorAll('div[role="article"], div.Nv2PK'));
    items.forEach(item => {
        try {
            const nameElement = item.querySelector('.qBF1Pd, .fontHeadlineSmall');
            const data = { 
                name: nameElement ? nameElement.innerText : 'Unknown',
                keyword: searchKeyword,
                scrapedAt: new Date().toISOString()
            };

            const link = item.querySelector('a[href*="/maps/place/"]');
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

            // 3. Business Hours & Snippet
            const subInfoLines = Array.from(item.querySelectorAll('.W4Pne, .fontBodyMedium'));
            let addressSnippet = "";
            let phoneSnippet = "";

            subInfoLines.forEach(line => {
                const text = line.innerText;
                if (text.includes('Open') || text.includes('Closed')) {
                    data.hours = text.split('\u22c5')[0].trim();
                }
                // Logic: Address lines usually contain street numbers or neighborhood names
                // Phone lines usually contain digits but are often mixed with distance
                if (text.includes('·')) {
                    const parts = text.split('·');
                    parts.forEach(p => {
                        if (/\d{5}/.test(p)) addressSnippet = p.trim(); // Likely address/zip
                        if (/\d{4,}/.test(p) && !addressSnippet.includes(p)) phoneSnippet = p.trim(); // Likely phone
                    });
                }
            });

            // 4. Website (Direct DOM Link)
            const webLink = item.querySelector('a[data-value="Website"]');
            if (webLink) data.website = webLink.href;

            // --- SURGICAL AI PAYLOAD (Only for Cleaning) ---
            data.optimizedText = `ID_REF: ${data.url}\nADDR_TAG: ${addressSnippet || subInfoLines[1]?.innerText || "N/A"}\nPHONE_TAG: ${phoneSnippet || subInfoLines[2]?.innerText || "N/A"}`;

            leads.push(data);
        } catch (e) {
            console.error('LeadRadar: Error parsing item', e);
        }
    });

    return leads;
};
