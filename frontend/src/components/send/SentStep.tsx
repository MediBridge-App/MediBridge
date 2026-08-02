import { CheckCircle2 } from 'lucide-react'
import type { Organization } from '../../types'

interface SentStepProps {
    selectedOrg: Organization
    docType: string
    priority: string
    txRef: string
    onReset: () => void
}

const docTypeLabels: Record<string, string> = {
    referral: 'Referral',
    lab_result: 'Lab Result',
    discharge_summary: 'Discharge Summary',
    insurance_form: 'Insurance Form',
    imaging: 'Imaging Report',
}

export default function SentStep({
    selectedOrg,
    docType,
    priority,
    txRef,
    onReset,
}: SentStepProps) {
    const details = [
        { label: 'Transmission ID', value: txRef },
        { label: 'Recipient', value: selectedOrg.name },
        { label: 'Document Type', value: docTypeLabels[docType] ?? docType },
        { label: 'Priority', value: priority.charAt(0).toUpperCase() + priority.slice(1) },
        { label: 'Status', value: 'Uploaded' },
        { label: 'Encryption', value: 'AES-256 + TLS 1.3' },
    ]

    return (
        <div className="flex flex-col items-center justify-center py-12 gap-6">

            {/* Success icon */}
            <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 72, height: 72, backgroundColor: '#d1fae5' }}
            >
                <CheckCircle2 size={36} style={{ color: '#059669' }} />
            </div>

            {/* Title */}
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Document Transmitted
                </h2>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                    Your document has been securely encrypted and sent to{' '}
                    <strong>{selectedOrg.name}</strong>. It will appear in their
                    inbox once processing completes.
                </p>
            </div>

            {/* Details card */}
            <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 p-5">
                <div className="space-y-0">
                    {details.map((row) => (
                        <div
                            key={row.label}
                            className="flex items-center justify-between py-2 border-b border-slate-100"
                        >
                            <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">
                                {row.label}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Button */}
            <button
                onClick={onReset}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0e7490' }}
            >
                Send Another
            </button>

        </div>
    )
}
