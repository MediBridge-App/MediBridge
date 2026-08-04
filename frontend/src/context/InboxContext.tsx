import { createContext, useState, useEffect, type ReactNode } from 'react'
import { documentsApi } from '../api'
import { useAuth } from '../hooks/useAuth'

interface InboxContextValue {
    unreadCount: number
    setUnreadCount: (count: number) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const InboxContext = createContext<InboxContextValue | null>(null)

// Only need read_at here to compute unread count
type ApiDoc = { read_at: string | null }

export function InboxProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const { user } = useAuth()

    // Refetch whenever the logged-in user changes (not just once at app
    // mount) — otherwise switching between demo accounts without a full
    // page reload left the previous account's count showing until the
    // Inbox page itself happened to fetch and correct it.
    useEffect(() => {
        async function syncUnreadCount() {
            if (!user) {
                setUnreadCount(0)
                return
            }
            try {
                const data: ApiDoc[] = await documentsApi.getInbox()
                const unread = (data ?? []).filter((d) => !d.read_at).length
                setUnreadCount(unread)
            } catch {
                // leave as-is — sidebar just won't show an updated badge if this fails
            }
        }
        syncUnreadCount()
    }, [user?.username, user])

    return (
        <InboxContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </InboxContext.Provider>
    )
}
