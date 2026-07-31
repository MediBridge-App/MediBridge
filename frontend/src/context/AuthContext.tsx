import { createContext, useState, useEffect, type ReactNode } from 'react'
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth'

interface AuthUser {
    username: string
    email: string
    name: string
    initials: string
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
                const name = attributes.name || attributes.email || 'User'
                const initials = name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                setUser({
                    username: attributes.sub || '',
                    email: attributes.email || '',
                    name,
                    initials,
                })
            } catch {
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }
        loadUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}