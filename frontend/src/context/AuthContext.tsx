import { createContext, useState, useEffect, type ReactNode } from 'react'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'
import api from '../api'

interface AuthUser {
    username: string
    email: string
    fullName: string
    initials: string
    role: string
    organizationId: string
    organizationName: string
    orgCode: string
    specialty: string | null
    npiNumber: string | null
    lastLogin: string | null
}

interface AuthContextValue {
    user: AuthUser | null
    isLoading: boolean
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {

        async function loadUser() {
            try {
                await getCurrentUser()
                const attributes = await fetchUserAttributes()

                // Get full user profile from backend
                try {
                    const profile = await api.get('/auth/me').then(r => r.data)
                    const initials = profile.full_name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)

                    setUser({
                        username: attributes.sub || '',
                        email: profile.email,
                        fullName: profile.full_name,
                        initials,
                        role: profile.role,
                        organizationId: profile.organization_id,
                        organizationName: profile.organization_name,
                        orgCode: profile.org_code,
                        specialty: profile.specialty ?? null,
                        npiNumber: profile.npi_number ?? null,
                        lastLogin: profile.last_login ?? null,
                    })
                } catch {
                    // Backend not ready — use Cognito attributes
                    const email = attributes.email || ''
                    const name = attributes.name ||
                        email.split('@')[0].split('.')
                            .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
                            .join(' ')
                    const initials = name.split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)

                    setUser({
                        username: attributes.sub || '',
                        email,
                        fullName: name,
                        initials,
                        role: '',
                        organizationId: '',
                        organizationName: '',
                        orgCode: '',
                        specialty: null,
                        npiNumber: null,
                        lastLogin: null,
                    })
                }
                setIsLoading(false)
            } catch {
                setUser(null)
                setTimeout(() => setIsLoading(false), 2000)
            }
        }

        loadUser()

        const unsubscribe = Hub.listen('auth', ({ payload }) => {
            if (payload.event === 'signedIn') {
                setTimeout(() => loadUser(), 100)
            }
            if (payload.event === 'signedOut') {
                setTimeout(() => {
                    setUser(null)
                    setIsLoading(false)
                }, 0)
            }
        })

        return unsubscribe
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
