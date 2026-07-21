// Script to transform products_rows.sql to be compatible with the current Supabase schema
// Removes: id (auto-generated), rating, reviews, updated_at
// Adds: stock = 10 default

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawSQL = readFileSync(join(__dirname, 'products_rows.sql'), 'utf-8')

// Extract all value tuples using regex
// Match each (...) value group
const valuesMatch = rawSQL.match(/\((\d+),\s*'([\s\S]*?)'\s*\)/g)

// Better approach: parse by splitting on known pattern
// The INSERT has columns: id, name, category, price, original_price, image, badge, sizes, rating, reviews, section, description, created_at, updated_at

// We'll use a different strategy: extract using a Node.js-compatible SQL parser approach
// Read the full SQL and replace the INSERT header, then rebuild

// Split at the INSERT INTO declaration
const insertStart = rawSQL.indexOf('INSERT INTO')
const valuesStart = rawSQL.indexOf('VALUES', insertStart) + 'VALUES'.length

const rawValues = rawSQL.slice(valuesStart).trim()

// Parse individual records
// Each record is wrapped in (...) but contains nested arrays like ARRAY[...]
// We need to be careful about nested parens inside ARRAY[...]

function extractRecords(valStr) {
    const records = []
    let depth = 0
    let start = -1
    let inString = false
    let stringChar = ''
    let escaped = false

    for (let i = 0; i < valStr.length; i++) {
        const ch = valStr[i]

        if (escaped) {
            escaped = false
            continue
        }
        if (ch === '\\') {
            escaped = true
            continue
        }

        if (inString) {
            if (ch === stringChar) inString = false
            continue
        }

        if (ch === "'" || ch === '"') {
            inString = true
            stringChar = ch
            continue
        }

        if (ch === '(' && depth === 0) {
            depth = 1
            start = i
        } else if (ch === '(') {
            depth++
        } else if (ch === ')') {
            depth--
            if (depth === 0 && start !== -1) {
                records.push(valStr.slice(start + 1, i))
                start = -1
            }
        }
    }
    return records
}

const records = extractRecords(rawValues)
console.log(`Found ${records.length} products`)

function parseRecord(rec) {
    // columns: id, name, category, price, original_price, image(ARRAY[...]), badge, sizes(ARRAY[...]), rating, reviews, section, description, created_at, updated_at
    // We need: name, category, price, original_price, image, badge, sizes, section, description, stock
    
    // Tokenize carefully handling ARRAY[...] and quoted strings
    const tokens = []
    let token = ''
    let depth = 0
    let inString = false
    let stringChar = ''
    let escaped = false

    for (let i = 0; i < rec.length; i++) {
        const ch = rec[i]

        if (escaped) {
            token += ch
            escaped = false
            continue
        }
        if (ch === '\\') {
            token += ch
            escaped = true
            continue
        }

        if (inString) {
            token += ch
            if (ch === stringChar && rec[i+1] === stringChar) {
                // escaped quote in SQL (doubled single quote)
                token += rec[i+1]
                i++
            } else if (ch === stringChar) {
                inString = false
            }
            continue
        }

        if (ch === "'" || ch === '"') {
            inString = true
            stringChar = ch
            token += ch
            continue
        }

        if (ch === '[' || ch === '(') {
            depth++
            token += ch
            continue
        }
        if (ch === ']' || ch === ')') {
            depth--
            token += ch
            continue
        }

        if (ch === ',' && depth === 0) {
            tokens.push(token.trim())
            token = ''
            continue
        }

        token += ch
    }
    if (token.trim()) tokens.push(token.trim())

    // Map columns by index
    // 0: id, 1: name, 2: category, 3: price, 4: original_price, 5: image, 6: badge, 7: sizes, 8: rating, 9: reviews, 10: section, 11: description, 12: created_at, 13: updated_at
    
    if (tokens.length < 12) {
        console.warn('Skipping record with insufficient tokens:', tokens.length)
        return null
    }

    return {
        name: tokens[1],
        category: tokens[2],
        price: tokens[3],
        original_price: tokens[4],
        image: tokens[5],
        badge: tokens[6],
        sizes: tokens[7],
        section: tokens[10],
        description: tokens[11],
        created_at: tokens[12] || 'NOW()',
    }
}

const parsed = records.map(parseRecord).filter(Boolean)
console.log(`Parsed ${parsed.length} valid products`)

// Generate clean SQL
const lines = parsed.map(p => {
    return `  (${p.name}, ${p.category}, ${p.price}, ${p.original_price}, ${p.image}, ${p.badge}, ${p.sizes}, ${p.section}, ${p.description}, 10, ${p.created_at})`
})

const cleanSQL = `-- Products import - compatible with current Supabase schema
-- Columns: name, category, price, original_price, image, badge, sizes, section, description, stock, created_at

INSERT INTO public.products (name, category, price, original_price, image, badge, sizes, section, description, stock, created_at)
VALUES
${lines.join(',\n')};
`

writeFileSync(join(__dirname, 'products_clean.sql'), cleanSQL, 'utf-8')
console.log(`\n✅ products_clean.sql gerado com ${parsed.length} produtos!`)
console.log('Cole no SQL Editor do Supabase para importar.')
