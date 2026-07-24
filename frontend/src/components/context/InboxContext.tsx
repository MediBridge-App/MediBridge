import { createContext, useContext, useState, type ReactNode } from 'react'

interface InboxContextValue {
    unreadCount: number
    setUnreadCount: (count: number) => void
}

const InboxContext = createContext<InboxContextValue | null>(null)

export function InboxProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(
        // start with real unread count from mock data
        3
    )

    return (
        <InboxContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </InboxContext.Provider>
    )
}

export function useInbox() {
    const ctx = useContext(InboxContext)
    if (!ctx) throw new Error('useInbox must be used inside InboxProvider')
    return ctx
}