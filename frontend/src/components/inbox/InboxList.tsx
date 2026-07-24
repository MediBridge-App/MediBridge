import { FileText } from 'lucide-react'
import type { InboxDocument } from '../../types'
import InboxItem from './InboxItem'

interface InboxListProps {
    docs: InboxDocument[]
    selectedId: string | null
    onSelect: (doc: InboxDocument) => void
}

export default function InboxList({ docs, selectedId, onSelect }: InboxListProps) {
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