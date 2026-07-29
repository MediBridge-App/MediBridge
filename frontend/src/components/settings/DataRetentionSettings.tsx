import { useState } from 'react'
import { Database, RefreshCw, Cloud, Save, AlertTriangle } from 'lucide-react'

const POLICIES = [
    {
        icon: <Database size={15} />,
        label: 'Document Storage',
        value: '7 years (HIPAA minimum)',
    },
    {
        icon: <Database size={15} />,
        label: 'Audit Log Retention',
        value: '7 years — immutable',
    },
    {
        icon: <Cloud size={15} />,
        label: 'S3 Versioning',
        value: 'Enabled — 90-day history',
    },
    {
        icon: <RefreshCw size={15} />,
        label: 'Backup Schedule',
        value: 'Daily snapshots to S3',
    },
]

export default function DataRetentionSettings() {
    const [saved, setSaved] = useState(false)

    function handleSave() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">Data & Retention</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    HIPAA-compliant data retention and export policies
                </p>
            </div>

            {/* Retention policies */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">
                    Retention Policies
                </h3>
                {POLICIES.map((p) => (
                    <div
                        key={p.label}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-100"
                        style={{ backgroundColor: '#f8fafc' }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">{p.icon}</span>
                            <span className="text-sm font-medium text-slate-700">
                                {p.label}
                            </span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{p.value}</span>
                    </div>
                ))}
            </div>

            {/* Data export */}
            <div
                className="rounded-xl p-5 space-y-3"
                style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}
            >
                <div className="flex items-center gap-2">
                    <AlertTriangle size={15} style={{ color: '#d97706' }} />
                    <h3 className="text-sm font-semibold" style={{ color: '#92400e' }}>
                        Data Export
                    </h3>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>
                    Export all organization documents and audit logs as encrypted ZIP
                    archives. Exports are subject to your administrator's approval.
                </p>
                <button
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#d97706' }}
                >
                    Request Data Export
                </button>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: saved ? '#059669' : '#0e7490' }}
                >
                    <Save size={14} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}