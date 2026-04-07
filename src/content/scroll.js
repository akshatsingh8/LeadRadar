export const scrollFeed = () => {
    const feed = document.querySelector('div[role="feed"]');
    if (feed) {
        // Scroll to bottom
        feed.scrollTop = feed.scrollHeight;
        return true;
    }
    return false;
};

export const hasReachedEnd = () => {
    const feed = document.querySelector('div[role="feed"]');
    if (feed) {
        const text = feed.innerText;
        if (text.includes("You've reached the end of the list")) return true;
    }
    return false;
};
