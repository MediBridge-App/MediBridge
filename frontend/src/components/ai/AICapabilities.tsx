import { Sparkles } from 'lucide-react'

const CAPABILITIES = [
    { label: 'Document Classification', pct: 97, color: '#059669' },
    { label: 'Summary Generation', pct: 94, color: '#0e7490' },
    { label: 'Tag Suggestion', pct: 91, color: '#7c3aed' },
    { label: 'Urgency Detection', pct: 88, color: '#dc2626' },
    { label: 'Entity Extraction', pct: 93, color: '#0284c7' },
]

export default function AICapabilities() {
    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={15} style={{ color: '#7c3aed' }} />
                <h3 className="text-sm font-semibold text-slate-800">
                    AI Capabilities
                </h3>
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
                {CAPABILITIES.map((cap) => (
                    <div key={cap.label}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-700">{cap.label}</span>
                            <span className="text-xs text-slate-400 font-mono">
                                {cap.pct}% accuracy
                            </span>
                        </div>
                        <div
                            className="rounded-full overflow-hidden bg-slate-100"
                            style={{ height: 5 }}
                        >
                            <div
                                className="rounded-full h-full"
                                style={{
                                    width: `${cap.pct}%`,
                                    backgroundColor: cap.color,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}