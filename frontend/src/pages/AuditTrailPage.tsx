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
    const [error, setError] = useState(false)

    // update useEffect:
    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true)
            try {
                const data = await auditApi.getLogs()
                setLogs(data)
                setError(false)
            } catch {
                setError(true)
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

    return isLoading ? (
        <div className="flex items-center justify-center h-64">
            <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: '#0e7490' }}
            />
        </div>
    ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                ⚠️
            </div>
            <p className="text-sm text-slate-600">Failed to load audit logs</p>
            <button
                onClick={() => {
                    setError(false)
                    setIsLoading(true)
                    auditApi.getLogs()
                        .then((data) => setLogs(data))
                        .catch(() => setError(true))
                        .finally(() => setIsLoading(false))
                }}
                className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200"
                style={{ color: '#0e7490' }}
            >
                Try again
            </button>
        </div>
    ) : (
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