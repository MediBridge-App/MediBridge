import { FileText, CheckCircle2, Zap, AlertCircle } from 'lucide-react'

const STATS = [
    {
        label: 'Documents Processed',
        value: '612',
        icon: <FileText size={16} />,
        color: '#0e7490',
    },
    {
        label: 'Avg Confidence',
        value: '96.2%',
        icon: <CheckCircle2 size={16} />,
        color: '#059669',
    },
    {
        label: 'Avg Processing',
        value: '1.1s',
        icon: <Zap size={16} />,
        color: '#7c3aed',
    },
    {
        label: 'Urgent Flags',
        value: '23',
        icon: <AlertCircle size={16} />,
        color: '#dc2626',
    },
]

export default function AIStats() {
    return (
        <div className="grid grid-cols-4 gap-4">
            {STATS.map((s) => (
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