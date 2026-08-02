import { useState, useEffect } from 'react'
import { CheckCheck } from 'lucide-react'
import NotificationList from '../components/notifications/NotificationList'
import { useNotifications } from '../hooks/useNotifications'
import { notificationsApi } from '../api'

// Shape of a single notification as it comes back from GET /notifications
// (matches the NotificationResponse schema in the backend)
type ApiNotification = {
    id: string
    type: string
    message: string
    is_read: boolean
    document_id: string | null
    created_at: string
}

// Real API type values -> icon keys NotificationItem understands.
// (NotificationItem's iconConfig only has: document, urgent, ai, delivery, security)
const iconKeyMap: Record<string, string> = {
    new_document: 'document',
    urgent: 'urgent',
    delivery_confirmed: 'delivery',
    ai_complete: 'ai',
    security_alert: 'security',
}

// Short display title per type, since the API only gives one text field (message)
const titleMap: Record<string, string> = {
    new_document: 'New document received',
    urgent: 'Urgent document requires attention',
    delivery_confirmed: 'Delivery confirmed',
    ai_complete: 'AI analysis complete',
    security_alert: 'Security alert',
}

function formatTimeAgo(isoString: string): string {
    const date = new Date(isoString)
    const diffMs = Date.now() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin} min ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDays = Math.floor(diffHr / 24)
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays}d ago`
}

function mapNotification(n: ApiNotification) {
    const iconKey = iconKeyMap[n.type] ?? 'document'
    return {
        id: n.id,
        type: iconKey,
        title: titleMap[n.type] ?? 'Notification',
        description: n.message,
        timeAgo: formatTimeAgo(n.created_at),
        isUnread: !n.is_read,
        icon: iconKey,
    }
}

// Shape after mapNotification runs — used to type the empty initial state below
type DisplayNotification = ReturnType<typeof mapNotification>

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<DisplayNotification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const { setUnreadCount } = useNotifications()

    useEffect(() => {
        async function fetchNotifications() {
            setIsLoading(true)
            try {
                const data: ApiNotification[] = await notificationsApi.getAll()
                const mapped = data.map(mapNotification)
                setNotifications(mapped)
                const unread = mapped.filter((n) => n.isUnread).length
                setUnreadCount(unread)
                setError(false)
            } catch {
                setError(true)
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

    function handleRetry() {
        setIsLoading(true)
        setError(false)
        notificationsApi.getAll()
            .then((data: ApiNotification[]) => {
                const mapped = data.map(mapNotification)
                setNotifications(mapped)
                const unread = mapped.filter((n) => n.isUnread).length
                setUnreadCount(unread)
                setError(false)
            })
            .catch(() => setError(true))
            .finally(() => setIsLoading(false))
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

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                    ⚠️
                </div>
                <p className="text-sm text-slate-600">Failed to load notifications</p>
                <button
                    onClick={handleRetry}
                    className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200"
                    style={{ color: '#0e7490' }}
                >
                    Try again
                </button>
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
