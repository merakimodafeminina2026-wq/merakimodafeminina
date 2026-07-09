import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasValidCreds = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id')

if (!hasValidCreds) {
    console.warn('⚠️ Supabase credentials not found. Check your .env file.')
}

export const supabase = createClient(
    hasValidCreds ? supabaseUrl : 'https://placeholder-project.supabase.co',
    hasValidCreds ? supabaseAnonKey : 'placeholder-anon-key'
)

