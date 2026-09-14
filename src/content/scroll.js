export const getFeedElement = () => {
    return document.querySelector('div[role="feed"], div[aria-label*="Results for" i], div.m6QErb[aria-label*="Results" i], div.m6QErb.DxyBCb');
};

export const scrollFeed = () => {
    const feed = getFeedElement();
    if (feed) {
        // Scroll to bottom
        feed.scrollTop = feed.scrollHeight;
        return true;
    }

    // Fallback: search for any scrollable container within maps main content
    const scrollables = Array.from(document.querySelectorAll('.m6QErb, [role="main"]')).filter(el => el.scrollHeight > el.clientHeight);
    if (scrollables.length > 0) {
        scrollables[0].scrollTop = scrollables[0].scrollHeight;
        return true;
    }
    return false;
};

export const hasReachedEnd = () => {
    const feed = getFeedElement() || document.body;
    if (feed) {
        const text = feed.innerText || '';
        if (
            text.includes("You've reached the end of the list") ||
            text.includes("No more results") ||
            text.includes("Reached the end of the list")
        ) return true;

        if (feed.querySelector('.HlvSq, .PbZDve')) return true;
    }
    return false;
};
