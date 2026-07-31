import { Save } from 'lucide-react'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

const AWS_SERVICES = [
    { name: 'ECS Fargate', status: 'Running' },
    { name: 'RDS PostgreSQL', status: 'Available' },
    { name: 'S3 Bucket', status: 'Active' },
    { name: 'SNS Topic', status: 'Active' },
    { name: 'SQS Queues', status: '3 Active' },
    { name: 'Lambda Fns', status: '3 Active' },
]

const CONFIG = [
    { label: 'AWS Region', value: 'us-east-2', icon: '🌐' },
    { label: 'S3 Bucket Name', value: 'medibridge-docs-prod', icon: '🪣' },
    { label: 'RDS Endpoint', value: 'medibridge-db.cluster-xyz.us-east-2.rds.amazonaws.com', icon: '🗄️' },
    { label: 'SNS Topic ARN', value: 'arn:aws:sns:us-east-2:478738528264:medibridge-events', icon: '📡' },
]

export default function AWSSettings() {
    const [saved, setSaved] = useState(false)

    function handleSave() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">AWS Integrations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Manage connected AWS services powering MediBridge
                </p>
            </div>

            {/* Service status */}
            <div className="grid grid-cols-3 gap-3">
                {AWS_SERVICES.map((s) => (
                    <div
                        key={s.name}
                        className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200"
                    >
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: '#059669' }}
                        />
                        <div>
                            <div className="text-xs font-semibold text-slate-700">{s.name}</div>
                            <div className="text-xs text-slate-400">{s.status}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Infrastructure config */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">
                    Infrastructure Configuration
                </h3>
                {CONFIG.map((c) => (
                    <div key={c.label}>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                            {c.label}
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50">
                            <span>{c.icon}</span>
                            <span className="text-xs font-mono text-slate-600 truncate">
                                {c.value}
                            </span>
                            <CheckCircle2
                                size={13}
                                className="ml-auto shrink-0"
                                style={{ color: '#059669' }}
                            />
                        </div>
                    </div>
                ))}
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