// Mock Auth Service using LocalStorage
// Resolves all actions locally without calling Supabase

const DEFAULT_USERS = [
    {
        id: 'admin-id-123',
        email: 'admin@meraki.com',
        password: 'admin',
        full_name: 'Administradora Meraki',
        tipo_user: 'admin',
        phone: '(11) 99999-9999',
        cpf: '123.456.789-00'
    },
    {
        id: 'customer-id-123',
        email: 'cliente@meraki.com',
        password: 'cliente',
        full_name: 'Cliente Exemplo',
        tipo_user: 'customer',
        phone: '(11) 98888-8888',
        cpf: '987.654.321-00'
    }
]

function getLocalUsers() {
    const data = localStorage.getItem('meraki_users')
    if (!data) {
        localStorage.setItem('meraki_users', JSON.stringify(DEFAULT_USERS))
        return DEFAULT_USERS
    }
    const users = JSON.parse(data)
    if (!users.some(u => u.email === 'admin@meraki.com')) {
        users.push(DEFAULT_USERS[0])
        localStorage.setItem('meraki_users', JSON.stringify(users))
    }
    return users
}

function saveLocalUsers(users) {
    localStorage.setItem('meraki_users', JSON.stringify(users))
}

const listeners = new Set()

function triggerAuthChange(event, session) {
    for (const cb of listeners) {
        try {
            cb(event, session)
        } catch (e) {
            console.error(e)
        }
    }
}

export async function signUp(email, password, fullName, phone = '', cpf = '') {
    try {
        const users = getLocalUsers()
        if (users.some(u => u.email === email)) {
            return { data: null, error: new Error('User already exists') }
        }

        const newUser = {
            id: 'user-' + Date.now(),
            email,
            password,
            full_name: fullName,
            tipo_user: 'customer',
            phone: phone || null,
            cpf: cpf || null
        }

        users.push(newUser)
        saveLocalUsers(users)

        // Auto login after signup
        const session = {
            access_token: 'mock-token-' + newUser.id,
            user: {
                id: newUser.id,
                email: newUser.email,
                user_metadata: {
                    full_name: newUser.full_name
                }
            }
        }
        localStorage.setItem('meraki_session', JSON.stringify(session))
        triggerAuthChange('SIGNED_IN', session)

        return { data: { user: session.user }, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function signIn(email, password) {
    try {
        const users = getLocalUsers()
        const found = users.find(u => u.email === email && u.password === password)
        if (!found) {
            return { data: null, error: new Error('E-mail ou senha incorretos.') }
        }

        const session = {
            access_token: 'mock-token-' + found.id,
            user: {
                id: found.id,
                email: found.email,
                user_metadata: {
                    full_name: found.full_name
                }
            }
        }
        localStorage.setItem('meraki_session', JSON.stringify(session))
        triggerAuthChange('SIGNED_IN', session)

        return { data: session, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function signOut() {
    try {
        localStorage.removeItem('meraki_session')
        triggerAuthChange('SIGNED_OUT', null)
        return { error: null }
    } catch (e) {
        return { error: e }
    }
}

export async function signInWithProvider(provider) {
    try {
        const mockEmail = `${provider.toLowerCase()}user@merakistore.com`
        const mockName = provider === 'Google' ? 'Ana Júlia (Google)' : 'Mariana Costa (Facebook)'
        
        const users = getLocalUsers()
        let found = users.find(u => u.email === mockEmail)
        if (!found) {
            found = {
                id: 'social-' + Date.now(),
                email: mockEmail,
                password: 'social-oauth',
                full_name: mockName,
                tipo_user: 'customer',
                phone: null,
                cpf: null
            }
            users.push(found)
            saveLocalUsers(users)
        }

        const session = {
            access_token: 'mock-token-' + found.id,
            user: {
                id: found.id,
                email: found.email,
                user_metadata: {
                    full_name: found.full_name
                }
            }
        }
        localStorage.setItem('meraki_session', JSON.stringify(session))
        triggerAuthChange('SIGNED_IN', session)

        return { data: session, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function getSession() {
    try {
        const data = localStorage.getItem('meraki_session')
        return { session: data ? JSON.parse(data) : null, error: null }
    } catch (e) {
        return { session: null, error: e }
    }
}

export async function getUser() {
    try {
        const { session } = await getSession()
        return { user: session ? session.user : null, error: null }
    } catch (e) {
        return { user: null, error: e }
    }
}

export async function getUserProfile(userId) {
    try {
        const users = getLocalUsers()
        const user = users.find(u => u.id === userId)
        if (!user) return { profile: null, error: new Error('Profile not found') }

        return {
            profile: {
                id: user.id,
                full_name: user.full_name,
                phone: user.phone,
                cpf: user.cpf,
                address: user.address || '',
                cep: user.cep || '',
                number: user.number || '',
                complement: user.complement || '',
                neighborhood: user.neighborhood || '',
                city: user.city || '',
                state: user.state || '',
                tipo_user: user.tipo_user || 'customer'
            },
            error: null
        }
    } catch (e) {
        return { profile: null, error: e }
    }
}

export async function updateUserProfile(userId, updates) {
    try {
        const users = getLocalUsers()
        const idx = users.findIndex(u => u.id === userId)
        if (idx === -1) return { profile: null, error: new Error('User not found') }

        users[idx] = { ...users[idx], ...updates }
        saveLocalUsers(users)

        return {
            profile: {
                id: users[idx].id,
                full_name: users[idx].full_name,
                phone: users[idx].phone,
                cpf: users[idx].cpf,
                address: users[idx].address || '',
                cep: users[idx].cep || '',
                number: users[idx].number || '',
                complement: users[idx].complement || '',
                neighborhood: users[idx].neighborhood || '',
                city: users[idx].city || '',
                state: users[idx].state || '',
                tipo_user: users[idx].tipo_user || 'customer'
            },
            error: null
        }
    } catch (e) {
        return { profile: null, error: e }
    }
}

export function onAuthStateChange(callback) {
    listeners.add(callback)
    return {
        data: {
            subscription: {
                unsubscribe: () => {
                    listeners.delete(callback)
                }
            }
        }
    }
}
