import { useState } from 'react'
import { Shield } from 'lucide-react'
import AuditBadge from './AuditBadge'

interface AuditLog {
    id: string
    eventId: string
    eventType: string
    user: string
    userId: string
    action: string
    txRef: string | null
    ipAddress: string
    timestamp: string
    hash: string
}

interface AuditTableProps {
    logs: AuditLog[]
}

export default function AuditTable({ logs }: AuditTableProps) {
    const [expanded, setExpanded] = useState<string | null>(null)

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <Shield size={28} />
                <span className="text-sm">No events found</span>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
                {/* Header */}
                <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-slate-200">
                        {['Event ID', 'Type', 'User', 'Action', 'TX Ref', 'IP Address', 'Timestamp', 'Hash'].map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono whitespace-nowrap"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {logs.map((log) => {
                        const isExpanded = expanded === log.eventId

                        return (
                            <>
                                <tr
                                    key={log.eventId}
                                    onClick={() => setExpanded(isExpanded ? null : log.eventId)}
                                    className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                                    style={{ backgroundColor: isExpanded ? '#f0fdf9' : undefined }}
                                >
                                    {/* Event ID */}
                                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap"
                                        style={{ color: '#0e7490' }}>
                                        {log.eventId}
                                    </td>

                                    {/* Type badge */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <AuditBadge eventType={log.eventType} />
                                    </td>

                                    {/* User */}
                                    <td className="px-4 py-3">
                                        <div className="text-xs font-medium text-slate-800 whitespace-nowrap">
                                            {log.user}
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            {log.userId}
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className="px-4 py-3 max-w-xs">
                                        <span className="text-xs text-slate-700 block truncate">
                                            {log.action}
                                        </span>
                                    </td>

                                    {/* TX Ref */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {log.txRef ? (
                                            <span
                                                className="text-xs font-mono px-2 py-0.5 rounded"
                                                style={{ color: '#0e7490', backgroundColor: '#e0f2fe' }}
                                            >
                                                {log.txRef}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300 font-mono">—</span>
                                        )}
                                    </td>

                                    {/* IP Address */}
                                    <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                                        {log.ipAddress}
                                    </td>

                                    {/* Timestamp */}
                                    <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
                                        {log.timestamp}
                                    </td>

                                    {/* Hash */}
                                    <td className="px-4 py-3 text-xs font-mono text-slate-300 whitespace-nowrap">
                                        {log.hash}
                                    </td>
                                </tr>

                                {/* Expanded row */}
                                {isExpanded && (
                                    <tr
                                        key={log.eventId + '-expanded'}
                                        style={{ backgroundColor: '#f0fdf9' }}
                                    >
                                        <td colSpan={8} className="px-4 pb-4">
                                            <div className="rounded-xl p-4 bg-white border border-slate-200">
                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                                                    Event Detail
                                                </div>
                                                <div className="grid grid-cols-3 gap-3 mb-3">
                                                    {[
                                                        { label: 'Event ID', value: log.eventId },
                                                        { label: 'Timestamp (UTC)', value: log.timestamp },
                                                        { label: 'IP Address', value: log.ipAddress },
                                                        { label: 'User ID', value: log.userId },
                                                        { label: 'TX Reference', value: log.txRef ?? 'N/A' },
                                                        { label: 'Integrity Hash', value: log.hash },
                                                    ].map((d) => (
                                                        <div key={d.label}>
                                                            <div className="text-xs text-slate-400 font-mono uppercase tracking-wide mb-0.5">
                                                                {d.label}
                                                            </div>
                                                            <div className="text-xs text-slate-700 font-mono">
                                                                {d.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-400 font-mono uppercase tracking-wide mb-1">
                                                        Full Action
                                                    </div>
                                                    <div className="text-xs text-slate-700 leading-relaxed">
                                                        {log.action}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}