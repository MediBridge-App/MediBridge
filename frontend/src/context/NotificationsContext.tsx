import { createContext, useState, useEffect, type ReactNode } from 'react'
import { notificationsApi } from '../api'

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

    // Fetch the real count on mount so the sidebar badge is accurate right
    // away — previously this stayed at whatever default was set (was
    // hardcoded to 2, now 0) until the user actually visited the
    // Notifications page and its own fetch corrected it.
    useEffect(() => {
        async function fetchUnreadCount() {
            try {
                const data: ApiNotification[] = await notificationsApi.getAll()
                const unread = (data ?? []).filter((n) => !n.is_read).length
                setUnreadCount(unread)
            } catch {
                // leave at 0 — sidebar just won't show a badge if this fails
            }
        }
        fetchUnreadCount()
    }, [])

    return (
        <NotificationsContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </NotificationsContext.Provider>
    )
}

