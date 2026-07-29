import { useState, useEffect } from 'react'
import AuditToolbar from '../components/audit/AuditToolbar'
import AuditTable from '../components/audit/AuditTable'
import AuditFooter from '../components/audit/AuditFooter'
import { MOCK_AUDIT_LOGS } from '../data/mockData'
import { auditApi } from '../api'

export default function AuditTrailPage() {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [logs, setLogs] = useState(MOCK_AUDIT_LOGS)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchLogs() {
            try {
                const data = await auditApi.getLogs()
                setLogs(data)
            } catch {
                // API not ready yet — using mock data
            } finally {
                setIsLoading(false)
            }
        }
        fetchLogs()
    }, [])

    const filtered = logs.filter((log) => {
        const matchSearch =
            log.action.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase()) ||
            log.eventId.toLowerCase().includes(search.toLowerCase()) ||
            (log.txRef?.toLowerCase() ?? '').includes(search.toLowerCase())

        const matchType =
            typeFilter === 'all' || log.eventType === typeFilter

        return matchSearch && matchType
    })

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
            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            style={{ minHeight: 'calc(100vh - 120px)' }}
        >
            <AuditToolbar
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                totalCount={logs.length}
            />
            <AuditTable logs={filtered} />
            <AuditFooter
                filteredCount={filtered.length}
                totalCount={logs.length}
            />
        </div>
    )
}