
import { createContext, useState, type ReactNode } from 'react'

interface InboxContextValue {
    unreadCount: number
    setUnreadCount: (count: number) => void
}
// eslint-disable-next-line react-refresh/only-export-components
export const InboxContext = createContext<InboxContextValue | null>(null)

export function InboxProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(3)

    return (
        <InboxContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </InboxContext.Provider>
    )
}