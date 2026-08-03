import { createContext, useState, useEffect, type ReactNode } from 'react'
import { documentsApi } from '../api'

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

    // Same fix as NotificationsContext: fetch the real count on mount so
    // the sidebar badge is accurate immediately, instead of staying at 0
    // (or whatever was last set) until the user actually visits the Inbox
    // page and its own fetch corrects it.
    useEffect(() => {
        async function fetchUnreadCount() {
            try {
                const data: ApiDoc[] = await documentsApi.getInbox()
                const unread = (data ?? []).filter((d) => !d.read_at).length
                setUnreadCount(unread)
            } catch {
                // leave at 0 — sidebar just won't show a badge if this fails
            }
        }
        fetchUnreadCount()
    }, [])

    return (
        <InboxContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </InboxContext.Provider>
    )
}
