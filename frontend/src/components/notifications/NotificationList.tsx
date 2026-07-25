import { Bell } from 'lucide-react'
import NotificationItem from './NotificationItem'

interface Notification {
    id: string
    type: string
    title: string
    description: string
    timeAgo: string
    isUnread: boolean
    icon: string
}

interface NotificationListProps {
    notifications: Notification[]
    onDismiss: (id: string) => void
    onMarkRead: (id: string) => void
}

export default function NotificationList({
    notifications,
    onDismiss,
    onMarkRead,
}: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                <Bell size={32} />
                <p className="text-sm">No notifications</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {notifications.map((n) => (
                <NotificationItem
                    key={n.id}
                    id={n.id}
                    type={n.icon}
                    title={n.title}
                    description={n.description}
                    timeAgo={n.timeAgo}
                    isUnread={n.isUnread}
                    onDismiss={onDismiss}
                    onMarkRead={onMarkRead}
                />
            ))}
        </div>
    )
}