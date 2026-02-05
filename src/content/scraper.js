export const extractLeads = () => {
    const leads = [];

    // 1. Keyword Extraction
    let searchKeyword = "";
    const searchInput = document.getElementById('searchboxinput');
    if (searchInput && searchInput.value) {
        searchKeyword = searchInput.value;
    } else {
        // Fallback: Page Title
        const title = document.title; // e.g., "Plumbers in London - Google Maps"
        if (title.includes(" - Google Maps")) {
            searchKeyword = title.replace(" - Google Maps", "");
        }
    }

    const feed = document.querySelector('div[role="feed"]');
    if (!feed) return leads;

    const items = Array.from(feed.querySelectorAll('div[role="article"], div.Nv2PK'));

    items.forEach(item => {
        try {
            const data = { keyword: searchKeyword };

            // --- Name & URL ---
            const link = item.querySelector('a[href*="/maps/place/"]');
            if (link) {
                data.url = link.href;
                data.name = link.getAttribute('aria-label');
                if (!data.name) {
                    const heading = item.querySelector('.qBF1Pd, .fontHeadlineSmall');
                    if (heading) data.name = heading.innerText;
                }
            }

            if (!data.name) return;

            const text = item.innerText || "";
            const textLines = text.split('\n').filter(l => l.trim().length > 0);

            // --- Rating & Reviews ---
            const ratingStars = item.querySelector('span[role="img"]');
            if (ratingStars) {
                const ratingLabel = ratingStars.getAttribute('aria-label');
                if (ratingLabel) {
                    const parts = ratingLabel.split(' ');
                    data.rating = parts[0];
                    // Extract number inside parenthesis or just the number
                    const reviewMatch = ratingLabel.match(/\(([\d,]+)\)|([\d,]+)\s+reviews/);
                    // "4.5 stars 120 Reviews" or "(120)"
                    if (reviewMatch) {
                        data.reviews = (reviewMatch[1] || reviewMatch[2]).replace(/,/g, '');
                    } else {
                        data.reviews = "0"; // Default
                    }
                }
            }

            // --- Status ---
            // Look for specific status text in lines
            const statusKeywords = ["Open", "Closed", "Temporarily closed", "Opens soon", "Closes soon"];
            // Find a line that starts with one of these
            const statusLine = textLines.find(line => statusKeywords.some(k => line.startsWith(k)));
            if (statusLine) {
                // Clean it up: "Open ⋅ Closes 5 PM" -> "Open"
                // actually user might want valid details. Let's keep the short status.
                const statusParts = statusLine.split('⋅');
                data.status = statusParts[0].trim();
            }

            // --- Phone ---
            // Regex is reliable enough for lists
            const phoneMatch = text.match(/((\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4})/);
            if (phoneMatch) {
                data.phone = phoneMatch[0];
            }

            // --- Address ---
            // Hardest part. Often it's the line containing the category, or after.
            // Heuristic: Find the line with the category (if we can), address is usually next.
            // OR: Address usually matches pattern with numbers and commas.
            // Let's filter out known lines: Name, Rating line, Status, Phone, "Dine-in", etc.

            // Improve: look for the structure div
            const gridItems = item.querySelectorAll('.W4Evc');
            // This class W4Evc corresponds to lines in the description mostly.
            if (gridItems.length > 0) {
                // Iterate and filter
                gridItems.forEach(div => {
                    const t = div.innerText;
                    // Ignore if it's the rating line (contains stars char or numbers)
                    if (t.includes('(') && t.match(/\d/)) return;
                    // Ignore if status
                    if (statusKeywords.some(k => t.startsWith(k))) return;
                    // Ignore if phone
                    if (t.match(/\d{3}[ -]?\d{4}/)) return;
                    // Ignore if service options
                    if (t.includes('Dine-in') || t.includes('Delivery')) return;

                    // If it has commas or is just text, it might be address/category
                    // Often category is single word or short phrase. Address is longer.
                    if (!data.address && t.length > 5) {
                        data.address = t;
                    }
                });
            }
            // Fallback: scan lines
            if (!data.address) {
                // Filter lines that act like other things
                const potentialAddress = textLines.filter(l =>
                    l !== data.name &&
                    !l.includes(' reviews') &&
                    !statusKeywords.some(k => l.startsWith(k)) &&
                    !l.match(/\d{3}[ -]?\d{4}/) &&
                    !l.includes('Dine-in')
                );
                if (potentialAddress.length > 0) {
                    // Likely 2nd or 3rd item is address/category
                    // data.address = potentialAddress[0]; // risky but better than nothing
                }
            }

            // --- Website ---
            const websiteLink = item.querySelector('a[data-value="Website"]');
            if (websiteLink) data.website = websiteLink.href;

            // --- Image ---
            // Google Maps images in list view are often background images or protected.
            // Look for the specific image container
            const imgContainer = item.querySelector('.Sp2d1'); // Generic container class?
            // Better: find 'ul li div' structure for images.
            // Basic img tag check
            // Some images are in <div style="background-image:url(...)">
            const bgImgDiv = item.querySelector('div[style*="background-image"]');
            if (bgImgDiv) {
                const style = bgImgDiv.getAttribute('style');
                const match = style.match(/url\("?(.+?)"?\)/);
                if (match) data.image = match[1];
            }
            if (!data.image) {
                const img = item.querySelector('img[src*="googleusercontent"], img[src*="ggpht"]');
                if (img) data.image = img.src;
            }

            // --- Coordinates ---
            if (data.url) {
                const coordsMatch = data.url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                if (coordsMatch) {
                    data.latitude = coordsMatch[1];
                    data.longitude = coordsMatch[2];
                }
            }

            // --- Services ---
            const serviceKeywords = ["Dine-in", "Takeout", "Delivery", "In-store shopping", "In-store pickup"];
            const foundServices = serviceKeywords.filter(k => text.includes(k));
            if (foundServices.length > 0) data.services = foundServices.join(", ");

            leads.push(data);
        } catch (e) {
            console.error('Error parsing item', e);
        }
    });

    return leads;
};
