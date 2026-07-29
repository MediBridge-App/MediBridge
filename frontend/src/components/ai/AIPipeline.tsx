import { TrendingUp } from 'lucide-react'

const PIPELINE = [
    { step: 'Upload', sub: 'S3 Storage', icon: '☁️', color: '#0e7490' },
    { step: 'SNS Event', sub: 'document.sent', icon: '📡', color: '#0284c7' },
    { step: 'SQS Queue', sub: 'Fan-out', icon: '📬', color: '#7c3aed' },
    { step: 'AI Lambda', sub: 'Claude claude-haiku-4-5', icon: '🧠', color: '#7c3aed' },
    { step: 'Notification', sub: 'Lambda fn', icon: '🔔', color: '#d97706' },
    { step: 'Audit Log', sub: 'Lambda fn', icon: '🔒', color: '#059669' },
    { step: 'Delivered', sub: 'Recipient notified', icon: '✅', color: '#059669' },
]

export default function AIPipeline() {
    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} style={{ color: '#0e7490' }} />
                <h3 className="text-sm font-semibold text-slate-800">
                    Event-Driven Processing Pipeline
                </h3>
            </div>

            {/* Pipeline steps */}
            <div className="flex items-center overflow-x-auto">
                {PIPELINE.map((p, i) => (
                    <div key={p.step} className="flex items-center">
                        <div
                            className="flex flex-col items-center gap-1.5"
                            style={{ minWidth: 88 }}
                        >
                            {/* Icon */}
                            <div
                                className="rounded-xl flex items-center justify-center text-lg"
                                style={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: p.color + '15',
                                    border: `1.5px solid ${p.color}30`,
                                }}
                            >
                                {p.icon}
                            </div>

                            {/* Label */}
                            <div className="text-xs font-semibold text-slate-700 text-center">
                                {p.step}
                            </div>

                            {/* Sub label */}
                            <div className="text-xs text-slate-400 font-mono text-center">
                                {p.sub}
                            </div>
                        </div>

                        {/* Connector */}
                        {i < PIPELINE.length - 1 && (
                            <div className="w-5 h-px bg-slate-200 shrink-0" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}