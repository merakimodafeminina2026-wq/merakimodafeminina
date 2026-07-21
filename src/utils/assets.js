/**
 * Resolves local assets paths correctly with Vite's configured base URL.
 */
export function getAssetUrl(path) {
    if (!path) return `${import.meta.env.BASE_URL}placeholder.jpg`
    
    const actualPath = Array.isArray(path) ? path[0] : path
    
    if (typeof actualPath !== 'string') {
        return `${import.meta.env.BASE_URL}placeholder.jpg`
    }
    
    if (
        actualPath.startsWith('http://') || 
        actualPath.startsWith('https://') || 
        actualPath.startsWith('data:') ||
        actualPath.startsWith('blob:')
    ) {
        return actualPath
    }
    
    const cleanPath = actualPath.startsWith('/') ? actualPath.slice(1) : actualPath
    return `${import.meta.env.BASE_URL}${cleanPath}`
}

/**
 * Checks if a given media URL is a video file (.mp4, .webm, .mov, data:video, etc.)
 */
export function isMediaVideo(url) {
    if (!url) return false
    const actualPath = Array.isArray(url) ? url[0] : url
    if (typeof actualPath !== 'string') return false
    
    const lower = actualPath.toLowerCase()
    return (
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.mov') ||
        lower.endsWith('.ogg') ||
        lower.includes('data:video/') ||
        lower.includes('.mp4?') ||
        lower.includes('.webm?')
    )
}
