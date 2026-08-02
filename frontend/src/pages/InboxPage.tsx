import { useState, useEffect } from 'react'
import type { InboxDocument, DocumentStatus, DocumentType, DocumentPriority } from '../types'
import { MOCK_INBOX } from '../data/mockData'
import { documentsApi } from '../api'
import InboxToolbar from '../components/inbox/InboxToolbar'
import InboxList from '../components/inbox/InboxList'
import InboxDetail from '../components/inbox/InboxDetail'
import { useInbox } from '../hooks/useInbox'

function formatTime(isoString: string): string {
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })
}

type ApiDoc = {
    id: string
    tx_ref: string
    sender_org_id: string
    recipient_org_id: string
    document_type: string
    subject: string
    priority: string
    status: string
    file_size: number | null
    original_filename: string | null
    notes: string | null
    created_at: string
    delivered_at: string | null
    read_at: string | null
    urgency_detected: boolean | null
}

function mapDoc(doc: ApiDoc): InboxDocument {
    return {
        id: doc.tx_ref,
        docId: doc.id,
        type: doc.document_type,
        subject: doc.subject,
        from: 'Healthcare Organization',
        fromOrg: doc.sender_org_id,
        to: doc.recipient_org_id,
        toOrg: doc.recipient_org_id,
        status: doc.status as DocumentStatus,
        time: formatTime(doc.created_at),
        size: doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown',
        pages: 1,
        aiSummary: doc.notes || 'AI analysis pending — document is being processed.',
        aiTags: [],
        aiCategory: doc.document_type
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase()),
        documentType: doc.document_type as DocumentType,
        priority: doc.priority as DocumentPriority,
        isUnread: !doc.read_at,
        urgencyFlag: doc.urgency_detected ?? false,
    }
}

export default function InboxPage() {
    const [selected, setSelected] = useState<InboxDocument | null>(null)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [documents, setDocuments] = useState<InboxDocument[]>(MOCK_INBOX)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const { setUnreadCount } = useInbox()

    useEffect(() => {
        async function fetchInbox() {
            setIsLoading(true)
            try {
                const data = await documentsApi.getInbox()
                const mapped = data.map(mapDoc)
                setDocuments(mapped)
                const unread = mapped.filter((d: InboxDocument) => d.isUnread).length
                setUnreadCount(unread)
                setError(false)
            } catch {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchInbox()
    }, [setUnreadCount])

    const unreadCount = documents.filter((d) => d.isUnread).length

    const filtered = documents.filter((doc) => {
        const matchSearch =
            doc.subject.toLowerCase().includes(search.toLowerCase()) ||
            doc.from.toLowerCase().includes(search.toLowerCase()) ||
            doc.id.toLowerCase().includes(search.toLowerCase())

        const matchStatus =
            filterStatus === 'all' ||
            (filterStatus === 'pending' && doc.status === 'uploaded') ||
            (filterStatus === 'delivered' && doc.status === 'delivered') ||
            (filterStatus === 'read' && !doc.isUnread)

        return matchSearch && matchStatus
    })

    async function handleMarkRead(id: string, docId: string) {
        try {
            await documentsApi.markAsRead(docId)
        } catch {
            // continue anyway
        }
        setDocuments((prev) =>
            prev.map((doc) => doc.id === id ? { ...doc, isUnread: false } : doc)
        )
        const newUnread = documents.filter((d) => d.id !== id && d.isUnread).length
        setUnreadCount(newUnread)
        if (selected?.id === id) {
            setSelected({ ...selected, isUnread: false })
        }
    }

    function handleSelect(doc: InboxDocument) {
        if (selected?.id === doc.id) {
            setSelected(null)
        } else {
            setSelected(doc)
            if (doc.isUnread) {
                handleMarkRead(doc.id, doc.docId)
            }
        }
    }

    function handleRetry() {
        setIsLoading(true)
        setError(false)
        documentsApi.getInbox()
            .then((data) => {
                const mapped = data.map(mapDoc)
                setDocuments(mapped)
                const unread = mapped.filter((d: InboxDocument) => d.isUnread).length
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

    return (
        <div
            className="flex overflow-hidden rounded-xl border border-slate-200 bg-white"
            style={{ height: 'calc(100vh - 120px)' }}
        >
            {/* Left panel */}
            <div
                className="flex flex-col border-r border-slate-200"
                style={{ width: selected ? 380 : '100%', minWidth: 320 }}
            >
                <InboxToolbar
                    search={search}
                    onSearchChange={setSearch}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                    unreadCount={unreadCount}
                    totalCount={documents.length}
                />
                <InboxList
                    docs={filtered}
                    selectedId={selected?.id ?? null}
                    onSelect={handleSelect}
                    error={error}
                    onRetry={handleRetry}
                />
            </div>

            {/* Right panel */}
            {selected && (
                <InboxDetail
                    doc={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    )
}
