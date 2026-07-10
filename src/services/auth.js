import { supabase } from './supabase.js'

// Listener store for onAuthStateChange
const authListeners = new Set()

// Setup default listener to sync auth changes from Supabase
supabase.auth.onAuthStateChange((event, session) => {
    for (const listener of authListeners) {
        try {
            listener(event, session)
        } catch (e) {
            console.error(e)
        }
    }
})

export async function signUp(email, password, fullName, phone = '', cpf = '') {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        })
        if (error) throw error

        const user = data?.user
        if (user) {
            // Check if profile exists, if not, create it
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email,
                    full_name: fullName,
                    phone: phone || null,
                    cpf: cpf || null,
                    tipo_user: email === 'admin' || email.startsWith('admin@') ? 'admin' : 'customer'
                })
            if (profileError) console.error('Error creating profile:', profileError)
        }

        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function signIn(email, password) {
    try {
        // Safe check for quick local dev fallback
        let targetEmail = email
        if (email === 'admin') {
            targetEmail = 'admin@meraki.com'
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password
        })
        if (error) throw error
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { error: null }
    } catch (e) {
        return { error: e }
    }
}

export async function signInWithProvider(provider) {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider.toLowerCase()
        })
        if (error) throw error
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function getSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        return { session, error: null }
    } catch (e) {
        return { session: null, error: e }
    }
}

export async function getUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        return { user, error: null }
    } catch (e) {
        return { user: null, error: e }
    }
}

export async function getUserProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
            
        if (error) throw error
        
        if (!data) {
            // Profile not found in database, return temporary placeholder profile
            const { data: { user } } = await supabase.auth.getUser()
            return {
                profile: {
                    id: userId,
                    email: user?.email || '',
                    full_name: user?.user_metadata?.full_name || '',
                    tipo_user: 'customer'
                },
                error: null
            }
        }

        return { profile: data, error: null }
    } catch (e) {
        return { profile: null, error: e }
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()
            
        if (error) throw error
        return { profile: data, error: null }
    } catch (e) {
        return { profile: null, error: e }
    }
}

export function onAuthStateChange(callback) {
    authListeners.add(callback)
    return {
        data: {
            subscription: {
                unsubscribe: () => {
                    authListeners.delete(callback)
                }
            }
        }
    }
}

export async function resetPasswordForEmail(email, redirectUrl) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl || window.location.origin + '/auth?type=recovery'
        })
        if (error) throw error
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        })
        if (error) throw error
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}
