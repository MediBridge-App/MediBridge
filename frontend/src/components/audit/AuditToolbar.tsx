import { Search, X, Filter, Download, Lock, ChevronDown } from 'lucide-react'

const EVENT_TYPES = [
    { value: 'all', label: 'All Events' },
    { value: 'document_sent', label: 'Document Sent' },
    { value: 'document_received', label: 'Document Received' },
    { value: 'document_read', label: 'Document Read' },
    { value: 'file_upload', label: 'File Upload' },
    { value: 'ai_processing', label: 'AI Processing' },
    { value: 'notification_sent', label: 'Notification Sent' },
    { value: 'user_login', label: 'User Login' },
    { value: 'auth_failure', label: 'Auth Failure' },
]

interface AuditToolbarProps {
    search: string
    onSearchChange: (value: string) => void
    typeFilter: string
    onTypeFilterChange: (value: string) => void
    totalCount: number
}

export default function AuditToolbar({
    search,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    totalCount,
}: AuditToolbarProps) {
    return (
        <div
            className="px-6 py-4 border-b border-slate-200 bg-white"
        >
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Audit Trail</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Immutable log of all system events — {totalCount} entries
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Tamper-proof badge */}
                    <div
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                        style={{ backgroundColor: '#d1fae5', border: '1px solid #a7f3d0' }}
                    >
                        <Lock size={12} style={{ color: '#059669' }} />
                        <span
                            className="text-xs font-semibold font-mono"
                            style={{ color: '#065f46' }}
                        >
                            Tamper-proof
                        </span>
                    </div>

                    {/* Export CSV */}
                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                        <Download size={13} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Search + filter row */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-slate-50 border border-slate-200 flex-1 max-w-sm">
                    <Search size={13} className="text-slate-400 flex-shrink-0" />
                    <input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search events, users, TX IDs…"
                        className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
                    />
                    {search && (
                        <button onClick={() => onSearchChange('')}>
                            <X size={12} className="text-slate-400 hover:text-slate-600" />
                        </button>
                    )}
                </div>

                {/* Filter dropdown */}
                <div className="flex items-center gap-2">
                    <Filter size={13} className="text-slate-400" />
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => onTypeFilterChange(e.target.value)}
                            className="text-xs font-medium outline-none appearance-none cursor-pointer pr-6 pl-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                        >
                            {EVENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={11}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}