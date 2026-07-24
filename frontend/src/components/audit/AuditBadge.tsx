import {
    Send, FileText, Eye, LogIn, LogOut,
    Upload, Bell, Brain, Shield,
} from 'lucide-react'

const config: Record<string, {
    label: string
    color: string
    bg: string
    icon: React.ReactNode
}> = {
    document_sent: { label: 'Document Sent', color: '#0e7490', bg: '#e0f2fe', icon: <Send size={11} /> },
    document_received: { label: 'Document Received', color: '#059669', bg: '#d1fae5', icon: <FileText size={11} /> },
    document_read: { label: 'Document Read', color: '#0284c7', bg: '#dbeafe', icon: <Eye size={11} /> },
    user_login: { label: 'User Login', color: '#7c3aed', bg: '#ede9fe', icon: <LogIn size={11} /> },
    user_logout: { label: 'User Logout', color: '#64748b', bg: '#f1f5f9', icon: <LogOut size={11} /> },
    file_upload: { label: 'File Upload', color: '#0e7490', bg: '#e0f2fe', icon: <Upload size={11} /> },
    notification_sent: { label: 'Notification Sent', color: '#d97706', bg: '#fef3c7', icon: <Bell size={11} /> },
    ai_processing: { label: 'AI Processing', color: '#7c3aed', bg: '#ede9fe', icon: <Brain size={11} /> },
    auth_failure: { label: 'Auth Failure', color: '#dc2626', bg: '#fee2e2', icon: <Shield size={11} /> },
}

export default function AuditBadge({ eventType }: { eventType: string }) {
    const c = config[eventType] ?? {
        label: eventType,
        color: '#64748b',
        bg: '#f1f5f9',
        icon: null,
    }

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
            style={{ backgroundColor: c.bg, color: c.color }}
        >
            {c.icon}
            {c.label}
        </span>
    )
}