import { useState } from 'react'
import AuditToolbar from '../components/audit/AuditToolbar'
import AuditTable from '../components/audit/AuditTable'
import AuditFooter from '../components/audit/AuditFooter'
import { MOCK_AUDIT_LOGS } from '../data/mockData'

export default function AuditTrailPage() {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    const filtered = MOCK_AUDIT_LOGS.filter((log) => {
        const matchSearch =
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.eventId.toLowerCase().includes(search.toLowerCase()) ||
            (log.txRef?.toLowerCase() ?? '').includes(search.toLowerCase())

        const matchType =
            typeFilter === 'all' || log.eventType === typeFilter

        return matchSearch && matchType
    })

    return (
        <div
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            style={{ height: 'calc(100vh - 120px)' }}
        >
            <AuditToolbar
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                totalCount={MOCK_AUDIT_LOGS.length}
            />
            <AuditTable logs={filtered} />
            <AuditFooter
                filteredCount={filtered.length}
                totalCount={MOCK_AUDIT_LOGS.length}
            />
        </div>
    )
}