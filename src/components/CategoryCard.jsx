import { Link } from 'react-router-dom'
import { getAssetUrl } from '../utils/assets.js'

export default function CategoryCard({ name, description, gradient, image }) {
    const imageUrl = image ? getAssetUrl(image) : null
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '-')

    return (
        <Link to={`/category/${slug}`} className={`relative block overflow-hidden h-72 group cursor-pointer ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-gray-150'} transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) hover:shadow-premium hover:-translate-y-2`}>
            {imageUrl && (
                <img 
                    src={imageUrl} 
                    alt={name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.19, 1, 0.22, 1) group-hover:scale-110"
                />
            )}

            {/* Elegant overlay to make text pop */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-700 z-0" />

            {/* Subtle inner glow */}
            <div className="absolute inset-0 border border-white/20 z-10" />

            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                <div className="overflow-hidden">
                    <h3 className="font-heading text-2xl font-bold mb-2 transform transition-transform duration-700 group-hover:-translate-y-1">
                        {name}
                    </h3>
                </div>
                <div className="overflow-hidden">
                    <p className="text-[13px] italic text-white/80 mb-6 transform transition-transform duration-700 delay-75 group-hover:-translate-y-1 leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] border-b border-white/40 pb-1 group-hover:border-white transition-all duration-500">
                        Descobrir
                    </span>
                    <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}


