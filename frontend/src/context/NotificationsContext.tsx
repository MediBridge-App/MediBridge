import { createContext, useState, type ReactNode } from 'react'

interface NotificationsContextValue {
    unreadCount: number
    setUnreadCount: (count: number) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(2)

    return (
        <NotificationsContext.Provider value={{ unreadCount, setUnreadCount }}>
            {children}
        </NotificationsContext.Provider>
    )
}