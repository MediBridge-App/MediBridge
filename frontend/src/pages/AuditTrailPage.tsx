import { useState, useEffect } from 'react'
import AuditToolbar from '../components/audit/AuditToolbar'
import AuditTable from '../components/audit/AuditTable'
import AuditFooter from '../components/audit/AuditFooter'
import { auditApi } from '../api'

// Shape of a single log entry as it comes back from GET /audit
// (matches the AuditResponse schema in the backend)
type ApiAuditLog = {
    id: string
    event_id: string
    document_id: string | null
    tx_ref: string | null
    user_id: string | null
    organization_id: string | null
    user_name: string | null
    org_name: string | null
    event_type: string
    action: string
    details: Record<string, unknown> | null
    ip_address: string | null
    hash: string | null
    created_at: string
}

function formatTimestamp(isoString: string): string {
    const date = new Date(isoString)
    return date.toLocaleString('sv-SE') // gives "YYYY-MM-DD HH:mm:ss" style, matches mock format
}

// The backend added user_name, org_name, and a real tx_ref field directly to this
// response — confirmed via a real GET /audit call. tx_ref now shows the
// actual TX-XXXXXX reference instead of the raw document_id UUID.
function mapAuditLog(log: ApiAuditLog) {
    return {
        id: log.id,
        eventId: log.event_id,
        eventType: log.event_type,
        user: log.user_name ?? 'System',
        userId: log.user_id ?? '—',
        action: log.action,
        txRef: log.tx_ref ?? null,
        ipAddress: log.ip_address ?? '—',
        timestamp: formatTimestamp(log.created_at),
        hash: log.hash ?? '—',
    }
}

// Shape after mapAuditLog runs — used to type the empty initial state below
type DisplayAuditLog = ReturnType<typeof mapAuditLog>

export default function AuditTrailPage() {
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [logs, setLogs] = useState<DisplayAuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchLogs() {
            setIsLoading(true)
            try {
                const data: ApiAuditLog[] = await auditApi.getLogs()
                setLogs(data.map(mapAuditLog))
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

    async function handleExport() {
        setExporting(true)
        setExportError(null)
        try {
            const blob: Blob = await auditApi.export()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            const dateStamp = new Date().toISOString().slice(0, 10)
            link.download = `audit-log-${dateStamp}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Failed to export audit log:', err)
            setExportError('Failed to export audit log. Please try again.')
        } finally {
            setExporting(false)
        }
    }

    function handleRetry() {
        setIsLoading(true)
        setError(false)
        auditApi.getLogs()
            .then((data: ApiAuditLog[]) => setLogs(data.map(mapAuditLog)))
            .catch(() => setError(true))
            .finally(() => setIsLoading(false))
    }

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
                onClick={handleRetry}
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
                onExport={handleExport}
                exporting={exporting}
            />
            {exportError && (
                <div className="px-6 py-2 text-xs font-medium text-red-600 bg-red-50 border-b border-red-100">
                    {exportError}
                </div>
            )}
            <AuditTable logs={filtered} />
            <AuditFooter
                filteredCount={filtered.length}
                totalCount={logs.length}
            />
        </div>
    )
}
