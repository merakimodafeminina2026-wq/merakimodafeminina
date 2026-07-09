/**
 * Elegant and slow custom smooth scroll to the top of the page using requestAnimationFrame.
 */
export function smoothScrollToTop(duration = 1200) {
    const start = window.scrollY;
    if (start === 0) return;
    
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    // Cubic-bezier easing-out function for luxury look (very smooth finish)
    const easeOutCubic = (t) => (--t) * t * t + 1;

    function scroll() {
        const now = 'now' in window.performance ? performance.now() : new Date().getTime();
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        const easedProgress = easeOutCubic(progress);
        window.scrollTo(0, Math.ceil((1 - easedProgress) * start));

        if (window.scrollY > 0 && progress < 1) {
            requestAnimationFrame(scroll);
        }
    }
    
    requestAnimationFrame(scroll);
}
