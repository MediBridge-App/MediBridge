import { useState, useEffect } from 'react'
import { FileText, CheckCircle2, Zap, AlertCircle } from 'lucide-react'
import { aiApi } from '../../api'

// Shape returned by GET /ai/stats
type ApiStats = {
    documents_processed: number
    avg_confidence: number
    avg_processing_seconds: number
    urgent_flags: number
}

export default function AIStats() {
    const [stats, setStats] = useState<ApiStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const data: ApiStats = await aiApi.getStats()
                setStats(data)
            } catch {
                setStats(null)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const displayStats = [
        {
            label: 'Documents Processed',
            value: isLoading ? '—' : (stats?.documents_processed ?? 0).toString(),
            icon: <FileText size={16} />,
            color: '#0e7490',
        },
        {
            label: 'Avg Confidence',
            value: isLoading ? '—' : `${(stats?.avg_confidence ?? 0).toFixed(1)}%`,
            icon: <CheckCircle2 size={16} />,
            color: '#059669',
        },
        {
            label: 'Avg Processing',
            value: isLoading ? '—' : `${(stats?.avg_processing_seconds ?? 0).toFixed(1)}s`,
            icon: <Zap size={16} />,
            color: '#7c3aed',
        },
        {
            label: 'Urgent Flags',
            value: isLoading ? '—' : (stats?.urgent_flags ?? 0).toString(),
            icon: <AlertCircle size={16} />,
            color: '#dc2626',
        },
    ]

    return (
        <div className="grid grid-cols-4 gap-4">
            {displayStats.map((s) => (
                <div
                    key={s.label}
                    className="rounded-xl p-4 bg-white border border-slate-200"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">{s.label}</span>
                        <span style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                </div>
            ))}
        </div>
    )
}
