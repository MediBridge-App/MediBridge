import { FileText, AlertCircle } from 'lucide-react'
import type { InboxDocument } from '../../types'
import InboxItem from './InboxItem'

interface InboxListProps {
    docs: InboxDocument[]
    selectedId: string | null
    onSelect: (doc: InboxDocument) => void
    error?: boolean
    onRetry?: () => void
}

export default function InboxList({
    docs,
    selectedId,
    onSelect,
    error,
    onRetry,
}: InboxListProps) {
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <AlertCircle size={28} className="text-red-400" />
                <span className="text-sm text-slate-600">Failed to load documents</span>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        style={{ color: '#0e7490' }}
                    >
                        Try again
                    </button>
                )}
            </div>
        )
    }

    if (docs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                <FileText size={28} />
                <span className="text-sm">No documents found</span>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {docs.map((doc) => (
                <InboxItem
                    key={doc.id}
                    doc={doc}
                    isActive={selectedId === doc.id}
                    onClick={() => onSelect(doc)}
                />
            ))}
        </div>
    )
}