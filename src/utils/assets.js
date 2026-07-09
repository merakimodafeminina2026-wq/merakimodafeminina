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
        actualPath.startsWith('data:')
    ) {
        return actualPath
    }
    
    const cleanPath = actualPath.startsWith('/') ? actualPath.slice(1) : actualPath
    return `${import.meta.env.BASE_URL}${cleanPath}`
}
