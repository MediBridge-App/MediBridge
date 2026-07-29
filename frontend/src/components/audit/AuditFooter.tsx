interface AuditFooterProps {
    filteredCount: number
    totalCount: number
}

export default function AuditFooter({ filteredCount, totalCount }: AuditFooterProps) {
    return (
        <div className="px-6 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
                Showing {filteredCount} of {totalCount} events
            </span>
            <span className="text-xs font-mono text-slate-400">
                Retention: 7 years (HIPAA) · Encrypted with AWS KMS
            </span>
        </div>
    )
}