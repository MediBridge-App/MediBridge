import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import NotificationList from '../components/notifications/NotificationList'
import { MOCK_NOTIFICATIONS } from '../data/mockData'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

    const unreadCount = notifications.filter((n) => n.isUnread).length
    const { setUnreadCount } = useNotifications()
    function handleDismiss(id: string) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    function handleMarkAllRead() {
        setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
        setUnreadCount(0)
    }

    function handleMarkRead(id: string) {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
    }

    return (
        <div className="p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {unreadCount} unread
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <CheckCheck size={14} />
                        Mark all read
                    </button>
                )}
            </div>

            {/* List */}
            <NotificationList
                notifications={notifications}
                onDismiss={handleDismiss}
                onMarkRead={handleMarkRead}
            />

        </div>
    )
}