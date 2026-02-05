export const clickNext = () => {
    // Keep looking for aria-label "Next page" or similar ID
    const nextButton = document.querySelector('button[aria-label="Next page"], button[jsaction*="panby"]');
    // Button might be disabled
    if (nextButton && !nextButton.disabled && nextButton.getAttribute('aria-disabled') !== 'true') {
        nextButton.click();
        return true;
    }
    return false;
};
