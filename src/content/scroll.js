export const getFeedElement = () => {
    return document.querySelector('div[role="feed"]') ||
           document.querySelector('div[aria-label*="Results for"]') ||
           document.querySelector('div.m6QErb[aria-label]') ||
           document.querySelector('.m6QErb.DxyBCb');
};

export const scrollFeed = () => {
    const feed = getFeedElement();
    if (feed) {
        // Scroll to trigger lazy loading of additional leads
        feed.scrollTop = feed.scrollHeight;
        return true;
    }
    return false;
};

export const hasReachedEnd = () => {
    const feed = getFeedElement();
    if (feed) {
        const text = feed.innerText || '';
        if (text.includes("You've reached the end of the list") || text.includes("end of the list")) return true;
    }
    return false;
};
