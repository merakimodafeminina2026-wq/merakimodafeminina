import { useState, useEffect } from 'react'

export default function Notification({ message, visible, onHide, onClose }) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onHide?.()
                onClose?.()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [visible, onHide, onClose])

    if (!visible) return null

    return (
        <div className="fixed bottom-8 right-4 md:right-8 z-[100000] bg-[#FDF8F6] border border-[#7A3E4A]/15 text-[#7A3E4A] px-6 py-4 rounded-2xl shadow-premium flex items-center gap-3 animate-[fadeInUp_300ms_ease-out] max-w-sm">
            <div className="w-6 h-6 rounded-full bg-[#7A3E4A]/10 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-[#7A3E4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
        </div>
    )
}
