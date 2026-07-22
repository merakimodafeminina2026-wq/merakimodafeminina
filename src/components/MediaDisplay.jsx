import React from 'react'
import { getAssetUrl, isMediaVideo } from '../utils/assets.js'

export default function MediaDisplay({ src, alt = '', className = '', style = {}, ...props }) {
    if (!src || typeof src !== 'string' || !src.trim()) {
        return <img src={getAssetUrl('/placeholder.jpg')} alt={alt} className={className} style={style} {...props} />
    }

    if (isMediaVideo(src)) {
        return (
            <video
                src={getAssetUrl(src)}
                autoPlay
                loop
                muted
                playsInline
                className={className}
                style={style}
                {...props}
            />
        )
    }

    return (
        <img
            src={getAssetUrl(src)}
            alt={alt}
            className={className}
            style={style}
            onError={(e) => {
                e.target.onerror = null
                e.target.src = getAssetUrl('/placeholder.jpg')
            }}
            {...props}
        />
    )
}
