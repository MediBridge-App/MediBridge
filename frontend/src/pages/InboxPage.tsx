import { useState, useEffect } from 'react'
import type { InboxDocument, DocumentStatus, DocumentType, DocumentPriority } from '../types'
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

// Bella added sender_org_name/recipient_org_name/summary/tags directly to
// this response — confirmed via a real GET /documents/inbox call. This
// means we no longer need a separate /organizations fetch to resolve org
// names, or a separate /ai/analyses/{id} fetch in InboxDetail for the
// summary/tags — all included here now.
type ApiDoc = {
    id: string
    tx_ref: string
    sender_org_id: string
    recipient_org_id: string
    sender_org_name: string
    recipient_org_name: string
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
    summary: string | null
    tags: string[] | null
}

function mapDoc(doc: ApiDoc): InboxDocument {
    return {
        id: doc.tx_ref,
        docId: doc.id,
        type: doc.document_type,
        subject: doc.subject,
        from: doc.sender_org_name,
        fromOrg: doc.sender_org_id,
        to: doc.recipient_org_name,
        toOrg: doc.recipient_org_id,
        status: doc.status as DocumentStatus,
        time: formatTime(doc.created_at),
        size: doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown',
        pages: 1,
        aiSummary: doc.summary ?? 'AI analysis pending — document is being processed.',
        aiTags: doc.tags ?? [],
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
    const [documents, setDocuments] = useState<InboxDocument[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const [viewedDocIds, setViewedDocIds] = useState<Set<string>>(new Set())
    const { setUnreadCount } = useInbox()

    useEffect(() => {
        async function fetchInbox() {
            setIsLoading(true)
            try {
                const inboxData: ApiDoc[] = await documentsApi.getInbox()
                const mapped = inboxData.map(mapDoc)
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

    // Bella added a real PUT /documents/{id}/read endpoint (confirmed live
    // Aug 3) — this replaces the old harmful workaround that called
    // PUT /status with "delivered" and risked corrupting the real document
    // workflow status. Now persists for real via the dedicated endpoint.
    async function handleMarkRead(id: string, docId: string) {
        setDocuments((prev) =>
            prev.map((doc) => doc.id === id ? { ...doc, isUnread: false } : doc)
        )
        const newUnread = documents.filter((d) => d.id !== id && d.isUnread).length
        setUnreadCount(newUnread)
        if (selected?.id === id) {
            setSelected({ ...selected, isUnread: false })
        }
        try {
            await documentsApi.markAsRead(docId)
        } catch (err) {
            console.error('Failed to persist read state:', err)
            // Leave the optimistic UI update in place either way — a failed
            // persist just means it'll show unread again on next reload,
            // which is honest given the API call didn't actually succeed.
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

    function handleMarkViewed(docId: string) {
        setViewedDocIds((prev) => {
            const next = new Set(prev)
            next.add(docId)
            return next
        })
    }

    function handleRetry() {
        setIsLoading(true)
        setError(false)
        documentsApi.getInbox()
            .then((inboxData: ApiDoc[]) => {
                const mapped = inboxData.map(mapDoc)
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
                    hasBeenViewed={viewedDocIds.has(selected.docId)}
                    onViewed={() => handleMarkViewed(selected.docId)}
                />
            )}
        </div>
    )
}