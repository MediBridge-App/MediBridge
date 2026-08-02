// Previously this page displayed specific fake infra identifiers (a bucket
// name that didn't even match the real bucket, a fake RDS endpoint, a fake
// SNS ARN) with a "Save Changes" button that saved nothing. Removed both:
// 1) exposing real ARNs/endpoints to the frontend at all is a bad pattern
//    regardless of accuracy — the backend shouldn't leak these to clients
// 2) there was nothing on this page to actually save
// Kept only generic "this service is used" status, similar to how
// AICapabilities and AWSInfrastructure (Security page) stay static/generic.

const AWS_SERVICES = [
    { name: 'ECS Fargate', status: 'Running' },
    { name: 'RDS PostgreSQL', status: 'Available' },
    { name: 'S3 Storage', status: 'Active' },
    { name: 'SNS / SQS', status: 'Active' },
    { name: 'Lambda Functions', status: 'Active' },
    { name: 'CloudWatch', status: 'Monitoring' },
]

export default function AWSSettings() {
    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">AWS Integrations</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    AWS services powering MediBridge
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

            <p className="text-xs text-slate-400">
                Specific resource identifiers (bucket names, database endpoints, ARNs)
                aren't shown here — those details stay server-side for security.
            </p>
        </div>
    )
}
