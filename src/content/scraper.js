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
            const ratingStars = item.querySelector('span[role="img"]');
            if (ratingStars) {
                const label = ratingStars.getAttribute('aria-label') || "";
                
                // Rating: Look for 4.8 or 4,8
                const ratingMatch = label.match(/(\d+[.,]\d+)/);
                if (ratingMatch) data.rating = ratingMatch[0].replace(',', '.');

                // Reviews: Look for (1,234) or "1,234 reviews"
                const reviewMatch = label.match(/\(([\d,]+)\)/) || label.match(/(\d[\d,.]*K?)\s*reviews/i);
                if (reviewMatch) {
                    data.reviews = reviewMatch[1].replace(/,/g, '');
                }
            }

            // Fallback for Rating/Reviews if ARIA failed
            if (!data.rating) {
                data.rating = item.querySelector('.MW4T7c')?.innerText || "";
            }
            if (!data.reviews) {
                const revText = item.querySelector('.UY7F9')?.innerText || "";
                data.reviews = revText.replace(/[()]/g, '').trim();
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
