import { CheckCircle2, Database } from 'lucide-react'

const AWS_SERVICES = [
    { name: 'Amazon Cognito', desc: 'Identity + MFA' },
    { name: 'AWS Secrets Manager', desc: 'Secrets stored' },
    { name: 'AWS KMS', desc: 'Key management' },
    { name: 'Amazon S3', desc: 'Server-side encrypted' },
    { name: 'Amazon RDS', desc: 'Encrypted at rest' },
    { name: 'CloudWatch', desc: 'Monitoring active' },
]

export default function AWSInfrastructure() {
    return (
        <div className="rounded-xl bg-white border border-slate-200 p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Database size={15} className="text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">
                    AWS Infrastructure Security
                </h3>
            </div>

            {/* Services grid */}
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                {AWS_SERVICES.map((service) => (
                    <div
                        key={service.name}
                        className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#e8eef4" }}
                    >
                        <CheckCircle2 size={13} style={{ color: "#059669" }} />
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#0d1b2a", fontFamily: "'Inter', sans-serif" }}>
                                {service.name}
                            </div>
                            <div style={{ fontSize: 10, color: "oklch(0.708 0 0)", fontFamily: "'DM Mono', monospace" }}>
                                {service.desc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}