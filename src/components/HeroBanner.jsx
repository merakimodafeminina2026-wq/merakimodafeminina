import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

import { getAssetUrl } from '../utils/assets.js'

const DEFAULT_SLIDES = [
    {
        image: getAssetUrl('/assets/banners/banner-1.jpg'),
        alt: 'Nova Coleção Meraki - Transforme-se',
        link: '/shop',
    },
    {
        image: getAssetUrl('/assets/banners/banner-2.jpg'),
        alt: 'Estilo e Elegância - Meraki Store',
        link: '/shop',
    },
    {
        image: getAssetUrl('/assets/banners/banner-3.jpg'),
        alt: 'Sua melhor versão com Meraki',
        link: '/shop',
    },
]


export default function HeroBanner() {
    const [slides, setSlides] = useState(() => {
        const stored = localStorage.getItem('meraki_banners')
        return stored ? JSON.parse(stored) : DEFAULT_SLIDES
    })
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(1)

    const next = useCallback(() => {
        setDirection(1)
        setCurrent(prev => (prev + 1) % (slides.length || 1))
    }, [slides.length])

    const goTo = useCallback((index) => {
        setDirection(index > current ? 1 : -1)
        setCurrent(index)
    }, [current])

    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('meraki_banners')
            if (stored) {
                setSlides(JSON.parse(stored))
                setCurrent(0)
            }
        };
        window.addEventListener('storage', handleStorage)
        // Custom event for same-page updates
        window.addEventListener('bannersUpdated', handleStorage)
        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('bannersUpdated', handleStorage)
        }
    }, [])

    useEffect(() => {
        if (slides.length <= 1) return
        const interval = setInterval(next, 6000)
        return () => clearInterval(interval)
    }, [next, slides.length])

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? '-100%' : '100%',
            opacity: 0,
        }),
    }

    if (!slides || slides.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden bg-[#F5EDE3]">
            {/* Dynamic dummy image that naturally pushes the height of the banner container */}
            <picture className="invisible block w-full h-auto pointer-events-none select-none">
                {slides[current]?.mobile_image && (
                    <source media="(max-w: 768px)" srcSet={getAssetUrl(slides[current].mobile_image)} />
                )}
                <img
                    src={getAssetUrl(slides[current]?.image)}
                    alt=""
                    className="w-full h-auto block"
                />
            </picture>

            <div className="absolute inset-0">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute inset-0"
                    >
                        {/* Banner Image - Rendered fully without scaling to preserve baked-in text */}
                        <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0"
                        >
                            <Link to={slides[current].link} className="block w-full h-auto">
                                <picture className="block w-full h-auto">
                                    {slides[current].mobile_image && (
                                        <source media="(max-w: 768px)" srcSet={getAssetUrl(slides[current].mobile_image)} />
                                    )}
                                    <img
                                        src={getAssetUrl(slides[current].image)}
                                        alt={slides[current].alt}
                                        className="w-full h-auto block"
                                        draggable={false}
                                    />
                                </picture>
                            </Link>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <div className="flex gap-2.5 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Ir para banner ${i + 1}`}
                            className="group relative p-1"
                        >
                            <div
                                className={`rounded-full transition-all duration-500 ease-out ${
                                    i === current
                                        ? 'bg-white w-7 h-2.5'
                                        : 'bg-white/40 hover:bg-white/70 w-2.5 h-2.5'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={() => { setDirection(-1); setCurrent(prev => (prev - 1 + slides.length) % slides.length) }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300"
                aria-label="Banner anterior"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={next}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300"
                aria-label="Próximo banner"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </section>
    )
}
