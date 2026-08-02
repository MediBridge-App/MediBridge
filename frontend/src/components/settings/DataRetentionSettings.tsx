import { Database, RefreshCw, Cloud, AlertTriangle } from 'lucide-react'

// These are organizational policy statements, not per-org queryable data —
// legitimate to keep static (similar to AICapabilities). What changed:
// removed the "Save Changes" button (nothing on this page is user-editable)
// and the "Request Data Export" button (no export endpoint exists in the
// backend — see stretch_goal_data_export.md for what that would take).
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
    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">Data & Retention</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    HIPAA-compliant data retention policies
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

            {/* Data export — informational only, feature not built yet */}
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
                    Bulk data export isn't available yet. Contact your administrator
                    if you need documents or audit logs exported in the meantime.
                </p>
            </div>
        </div>
    )
}
