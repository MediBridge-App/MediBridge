import { FileText, AlertCircle, Brain, Send, Shield, X, CheckCircle2 } from 'lucide-react'

interface NotificationItemProps {
    id: string
    type: string
    title: string
    description: string
    timeAgo: string
    isUnread: boolean
    onDismiss: (id: string) => void
    onMarkRead: (id: string) => void
}

const iconConfig: Record<string, {
    icon: React.ReactNode
    bg: string
    color: string
}> = {
    document: {
        icon: <FileText size={16} />,
        bg: '#e0f2fe',
        color: '#0e7490',
    },
    urgent: {
        icon: <AlertCircle size={16} />,
        bg: '#fee2e2',
        color: '#dc2626',
    },
    ai: {
        icon: <Brain size={16} />,
        bg: '#ede9fe',
        color: '#7c3aed',
    },
    delivery: {
        icon: <Send size={16} />,
        bg: '#d1fae5',
        color: '#059669',
    },
    security: {
        icon: <Shield size={16} />,
        bg: '#fef3c7',
        color: '#d97706',
    },
}

export default function NotificationItem({
    id,
    type,
    title,
    description,
    timeAgo,
    isUnread,
    onDismiss,
    onMarkRead,
}: NotificationItemProps) {
    const config = iconConfig[type] ?? iconConfig.document

    return (
        <div
            className="flex items-start gap-4 p-4 rounded-xl border transition-colors"
            style={{
                backgroundColor: isUnread ? '#f8fafc' : 'white',
                borderColor: isUnread ? '#e2e8f0' : '#f1f5f9',
            }}
        >
            {/* Icon */}
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.bg, color: config.color }}
            >
                {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {isUnread && (
                            <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: '#0e7490' }}
                            />
                        )}
                        <button
                            onClick={() => onMarkRead(id)}
                            className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                            title="Mark as read"
                        >
                            <CheckCircle2 size={14} />
                        </button>
                        <button
                            onClick={() => onDismiss(id)}
                            className="text-slate-300 hover:text-slate-500 transition-colors p-0.5"
                            title="Dismiss"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {description}
                </p>
                <p className="text-xs text-slate-400 mt-1.5">{timeAgo}</p>
            </div>
        </div>
    )
}