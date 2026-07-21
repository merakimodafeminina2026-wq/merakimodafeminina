import React from 'react'
import { getAssetUrl, isMediaVideo } from '../utils/assets.js'

export default function MediaDisplay({ src, alt = '', className = '', style = {}, ...props }) {
    if (!src) {
        return <img src={getAssetUrl('/assets/placeholder.jpg')} alt={alt} className={className} style={style} {...props} />
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
            onError={(e) => { e.target.src = getAssetUrl('/assets/placeholder.jpg') }}
            {...props}
        />
    )
}
