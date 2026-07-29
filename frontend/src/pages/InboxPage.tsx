import { useState } from 'react'
import type { InboxDocument } from '../types'
import { MOCK_INBOX } from '../data/mockData'
import InboxToolbar from '../components/inbox/InboxToolbar'
import InboxList from '../components/inbox/InboxList'
import InboxDetail from '../components/inbox/InboxDetail'

export default function InboxPage() {
    const [selected, setSelected] = useState<InboxDocument | null>(null)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    const unreadCount = MOCK_INBOX.filter((d) => d.isUnread).length

    const filtered = MOCK_INBOX.filter((doc) => {
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

    function handleSelect(doc: InboxDocument) {
        setSelected(selected?.id === doc.id ? null : doc)
    }

    return (
        <div
            className="flex overflow-hidden rounded-xl border border-slate-200 bg-white "
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
                    totalCount={MOCK_INBOX.length}
                />
                <InboxList
                    docs={filtered}
                    selectedId={selected?.id ?? null}
                    onSelect={handleSelect}
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