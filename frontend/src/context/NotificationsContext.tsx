import { createContext, useState, useEffect, type ReactNode } from 'react'
import { notificationsApi } from '../api'
import { useAuth } from '../hooks/useAuth'

interface NotificationsContextValue {
    unreadCount: number
    setUnreadCount: (count: number) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationsContext = createContext<NotificationsContextValue | null>(null)

// Shape returned by GET /notifications — only need is_read here
type ApiNotification = { is_read: boolean }

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0)
    const { user } = useAuth()

    // Same fix as InboxContext: refetch whenever the logged-in user
    // changes, not just once at app mount — otherwise switching between
    // demo accounts without a full page reload left the previous
    // account's count showing until the Notifications page itself
    // happened to fetch and correct it.
    useEffect(() => {
        async function syncUnreadCount() {
            if (!user) {
                setUnreadCount(0)
                return
            }
            try {
                const data: ApiNotification[] = await notificationsApi.getAll()
                const unread = (data ?? []).filter((n) => !n.is_read).length
                setUnreadCount(unread)
            } catch {
                // leave as-is — sidebar just won't show an updated badge if this fails
            }
        }
        syncUnreadCount()
    }, [user?.username, user])

    return (
        <NotificationsContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </NotificationsContext.Provider>
    )
}
