import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { InboxDocument } from '../../types'

interface InboxItemProps {
    doc: InboxDocument
    isActive: boolean
    onClick: () => void
}

const statusConfig: Record<string, {
    label: string
    color: string
    bg: string
    icon: React.ReactNode
}> = {
    delivered: {
        label: 'Delivered',
        color: '#059669',
        bg: '#d1fae5',
        icon: <CheckCircle2 size={12} />,
    },
    uploaded: {
        label: 'Pending',
        color: '#d97706',
        bg: '#fef3c7',
        icon: <Clock size={12} />,
    },
    routed: {
        label: 'Routed',
        color: '#0e7490',
        bg: '#e0f2fe',
        icon: <CheckCircle2 size={12} />,
    },
    classified: {
        label: 'Classified',
        color: '#7c3aed',
        bg: '#ede9fe',
        icon: <CheckCircle2 size={12} />,
    },
    ocr_complete: {
        label: 'OCR Complete',
        color: '#0284c7',
        bg: '#dbeafe',
        icon: <CheckCircle2 size={12} />,
    },
    failed: {
        label: 'Failed',
        color: '#dc2626',
        bg: '#fee2e2',
        icon: <AlertCircle size={12} />,
    },
}

const categoryColors: Record<string, { color: string; bg: string }> = {
    Laboratory: { color: '#059669', bg: '#d1fae5' },
    Referral: { color: '#7c3aed', bg: '#ede9fe' },
    Discharge: { color: '#0e7490', bg: '#e0f2fe' },
    Insurance: { color: '#d97706', bg: '#fef3c7' },
    Imaging: { color: '#0284c7', bg: '#dbeafe' },
}

export default function InboxItem({ doc, isActive, onClick }: InboxItemProps) {
    const s = statusConfig[doc.status] || statusConfig.uploaded
    const cat = categoryColors[doc.aiCategory] ?? { color: '#64748b', bg: '#f1f5f9' }

    return (
        <button
            onClick={onClick}
            className="w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-slate-100 transition-colors hover:bg-slate-50"
            style={{
                backgroundColor: isActive
                    ? '#f0fdf4'
                    : doc.isUnread
                        ? 'rgba(14,116,144,0.04)'
                        : 'white',
            }}
        >
            {/* Unread dot */}
            <div className="mt-2 flex-shrink-0" style={{ width: 7 }}>
                {doc.isUnread && (
                    <span
                        className="block rounded-full"
                        style={{ width: 7, height: 7, backgroundColor: '#0e7490' }}
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                {/* Category + priority */}
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className="rounded px-1.5 py-0.5 text-xs font-medium"
                        style={{ background: cat.bg, color: cat.color }}
                    >
                        {doc.aiCategory}
                    </span>
                    {doc.priority === 'urgent' && (
                        <span className="text-xs font-bold text-red-600">URGENT</span>
                    )}
                </div>

                {/* Subject */}
                <div
                    className="text-sm truncate mb-0.5"
                    style={{
                        fontWeight: doc.isUnread ? 600 : 400,
                        color: '#0f172a',
                    }}
                >
                    {doc.subject}
                </div>

                {/* Sender */}
                <div className="text-xs text-slate-500 mb-2">{doc.from}</div>

                {/* Status + time */}
                <div className="flex items-center justify-between">
                    <span
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: s.bg, color: s.color }}
                    >
                        {s.icon}
                        {s.label}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                        {doc.time.split(' ')[1]}
                    </span>
                </div>
            </div>
        </button>
    )
}