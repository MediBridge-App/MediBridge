import { useState, useEffect } from 'react'
import { CheckCheck } from 'lucide-react'
import NotificationList from '../components/notifications/NotificationList'
import { MOCK_NOTIFICATIONS } from '../data/mockData'
import { useNotifications } from '../hooks/useNotifications'
import { notificationsApi } from '../api'

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
    const [isLoading, setIsLoading] = useState(true)
    const { setUnreadCount } = useNotifications()

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const data = await notificationsApi.getAll()
                setNotifications(data)
                const unread = data.filter((n: { isUnread: boolean }) => n.isUnread).length
                setUnreadCount(unread)
            } catch {
                // API not ready yet — using mock data
            } finally {
                setIsLoading(false)
            }
        }
        fetchNotifications()
    }, [setUnreadCount])

    const unreadCount = notifications.filter((n) => n.isUnread).length

    async function handleDismiss(id: string) {
        try {
            await notificationsApi.dismiss(id)
        } catch {
            // continue anyway
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    async function handleMarkAllRead() {
        try {
            await notificationsApi.markAllRead()
        } catch {
            // continue anyway
        }
        setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
        setUnreadCount(0)
    }

    async function handleMarkRead(id: string) {
        try {
            await notificationsApi.markRead(id)
        } catch {
            // continue anyway
        }
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n))
        )
        setUnreadCount(Math.max(0, unreadCount - 1))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{unreadCount} unread</p>
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

            <NotificationList
                notifications={notifications}
                onDismiss={handleDismiss}
                onMarkRead={handleMarkRead}
            />
        </div>
    )
}