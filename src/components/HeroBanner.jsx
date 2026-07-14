import { useState, useEffect, useCallback, useMemo } from 'react'
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
    const [previous, setPrevious] = useState(null)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const next = useCallback(() => {
        if (isTransitioning || slides.length <= 1) return
        const nextIndex = (current + 1) % slides.length
        setPrevious(current)
        setIsTransitioning(true)
        setCurrent(nextIndex)
    }, [current, slides.length, isTransitioning])

    const goTo = useCallback((index) => {
        if (index === current || isTransitioning) return
        setPrevious(current)
        setIsTransitioning(true)
        setCurrent(index)
    }, [current, isTransitioning])

    useEffect(() => {
        const handleStorage = () => {
            const stored = localStorage.getItem('meraki_banners')
            if (stored) {
                setSlides(JSON.parse(stored))
                setCurrent(0)
                setPrevious(null)
                setIsTransitioning(false)
            }
        };
        window.addEventListener('storage', handleStorage)
        window.addEventListener('bannersUpdated', handleStorage)
        window.addEventListener('meraki_db_synced', handleStorage)
        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('bannersUpdated', handleStorage)
            window.removeEventListener('meraki_db_synced', handleStorage)
        }
    }, [])

    useEffect(() => {
        if (slides.length <= 1) return
        const interval = setInterval(next, 6000)
        return () => clearInterval(interval)
    }, [next, slides.length])

    useEffect(() => {
        if (previous !== null) {
            const timer = setTimeout(() => {
                setIsTransitioning(false)
                setPrevious(null)
            }, 850)
            return () => clearTimeout(timer)
        }
    }, [current, previous])

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const COLS = 7
    const ROWS = 4

    const cells = useMemo(() => {
        return Array.from({ length: COLS * ROWS }).map((_, idx) => {
            const col = idx % COLS
            const row = Math.floor(idx / COLS)
            
            // Stagger from center outwards
            const centerX = COLS / 2
            const centerY = ROWS / 2
            const distFromCenter = Math.sqrt(Math.pow(col - centerX, 2) + Math.pow(row - centerY, 2))
            
            return {
                id: idx,
                col,
                row,
                angle: Math.random() * 360,
                distance: 120 + Math.random() * 180,
                rotateSpeed: -360 + Math.random() * 720,
                delay: distFromCenter * 0.04 + Math.random() * 0.04
            }
        })
    }, [current])

    const cellVariants = {
        initial: {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: 0
        },
        shatter: (cell) => {
            const rad = (cell.angle * Math.PI) / 180
            return {
                x: Math.cos(rad) * cell.distance,
                y: Math.sin(rad) * cell.distance,
                opacity: 0,
                scale: 0.1,
                rotate: cell.rotateSpeed,
                transition: {
                    duration: 0.75,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: cell.delay
                }
            }
        }
    }

    if (!slides || slides.length === 0) return null;

    const hasMobileImage = !!slides[current]?.mobile_image
    const aspectClass = isMobile && hasMobileImage
        ? 'aspect-[4/5]'
        : 'aspect-[16/7] md:aspect-[16/5]'

    return (
        <section className={`relative w-full overflow-hidden bg-[#F5EDE3] transition-all duration-300 max-h-[600px] ${aspectClass}`}>
            {/* Background Slide (New Active Slide) */}
            <div className="absolute inset-0 z-0">
                <Link to={slides[current].link} className="block w-full h-full">
                    <picture className="block w-full h-full">
                        {slides[current].mobile_image && (
                            <source media="(max-w: 768px)" srcSet={getAssetUrl(slides[current].mobile_image)} />
                        )}
                        <img
                            src={getAssetUrl(slides[current].image)}
                            alt={slides[current].alt}
                            className="w-full h-full object-cover object-center"
                            draggable={false}
                        />
                    </picture>
                </Link>
            </div>

            {/* Shatter Overlay (Previous Slide exploding on top) */}
            {isTransitioning && previous !== null && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                    <div className="relative w-full h-full">
                        {cells.map(cell => {
                            const cellWidth = 100 / COLS
                            const cellHeight = 100 / ROWS
                            const prevSlide = slides[previous]
                            const imagePath = prevSlide ? (isMobile && prevSlide.mobile_image ? prevSlide.mobile_image : prevSlide.image) : ''
                            
                            return (
                                <motion.div
                                    key={cell.id}
                                    className="absolute"
                                    style={{
                                        width: `${cellWidth}%`,
                                        height: `${cellHeight}%`,
                                        left: `${cell.col * cellWidth}%`,
                                        top: `${cell.row * cellHeight}%`,
                                        backgroundImage: `url(${getAssetUrl(imagePath)})`,
                                        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
                                        backgroundPosition: `${(cell.col * 100) / (COLS - 1)}% ${(cell.row * 100) / (ROWS - 1)}%`,
                                        backfaceVisibility: 'hidden',
                                        WebkitBackfaceVisibility: 'hidden'
                                    }}
                                    variants={cellVariants}
                                    initial="initial"
                                    animate="shatter"
                                    custom={cell}
                                />
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Pagination Dots */}
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <div className="flex gap-2.5 bg-black/20 backdrop-blur-sm rounded-full px-4 py-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Ir para banner ${i + 1}`}
                            className="group relative p-1 cursor-pointer"
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
                onClick={() => {
                    if (isTransitioning) return
                    const prevIndex = (current - 1 + slides.length) % slides.length
                    setPrevious(current)
                    setIsTransitioning(true)
                    setCurrent(prevIndex)
                }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Banner anterior"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={next}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-black/40 hover:text-white transition-all duration-300 cursor-pointer"
                aria-label="Próximo banner"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </section>
    )
}
