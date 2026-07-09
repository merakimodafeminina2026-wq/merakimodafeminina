import { useState, useEffect } from 'react'
import { getProducts, getProductsBySection } from '../services/database.js'

export function useProducts(section = null) {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data, error: err } = section
                ? await getProductsBySection(section)
                : await getProducts()

            if (err) {
                setError(err.message)
            } else {
                setProducts(data || [])
            }
            setLoading(false)
        }

        load()
    }, [section])

    return { products, loading, error, setProducts }
}
