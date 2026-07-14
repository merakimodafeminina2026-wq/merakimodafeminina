import { useState } from 'react'

export default function SearchOverlay({ isOpen, onClose }) {
    const [query, setQuery] = useState('')

    const categories = (() => {
        try {
            const stored = localStorage.getItem('meraki_categories')
            if (stored) {
                const parsed = JSON.parse(stored)
                return parsed.map(c => typeof c === 'string' ? c : (c.name || ''))
            }
        } catch (e) { console.error(e) }
        return []
    })()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 animate-[fadeIn_200ms_ease-out]">
            <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 animate-[fadeInUp_300ms_ease-out]">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="O que você procura?"
                        className="flex-1 text-lg outline-none"
                        autoFocus
                    />
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors" aria-label="Fechar busca">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {categories.length > 0 && (
                    <div className="mt-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Sugestões</h4>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setQuery(tag)}
                                    className="px-4 py-2 bg-background border border-transparent rounded-full text-sm font-medium text-gray-700 hover:bg-primary-light/20 hover:border-primary hover:text-primary transition-all duration-300"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
