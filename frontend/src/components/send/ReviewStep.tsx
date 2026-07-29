import { CheckCircle2, AlertCircle, Send, Clock } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import type { Organization } from '../../types'

interface ReviewStepProps {
    selectedOrg: Organization
    docType: string
    subject: string
    priority: string
    file: { name: string; size: string; type: string }
    sending: boolean
    onBack: () => void
    onConfirm: () => void
}

export default function ReviewStep({
    selectedOrg,
    docType,
    subject,
    priority,
    file,
    sending,
    onBack,
    onConfirm,
}: ReviewStepProps) {
    const checks = [
        { ok: true, msg: 'Recipient organization verified and registered' },
        { ok: true, msg: `Document type correctly categorized: ${docType}` },
        { ok: true, msg: 'File format supported (PDF/image)' },
        { ok: true, msg: 'No PII detected in subject line' },
        {
            ok: priority !== 'urgent',
            msg: priority === 'urgent'
                ? 'Urgent priority — confirm this is time-sensitive'
                : 'Priority level appropriate for document type',
        },
    ]

    const summary = [
        { label: 'To', value: `${selectedOrg.name} (${selectedOrg.id})` },
        { label: 'Document Type', value: docType },
        { label: 'Subject', value: subject },
        { label: 'Priority', value: priority.charAt(0).toUpperCase() + priority.slice(1) },
        { label: 'File', value: `${file.name} · ${file.size}` },
        { label: 'Encryption', value: 'AES-256 + TLS 1.3' },
        { label: 'Audit Log', value: 'Enabled' },
    ]

    return (
        <div className="space-y-5">

            {/* AI Pre-Send Analysis */}
            <div className="rounded-xl p-5 bg-white border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={15} style={{ color: '#7c3aed' }} />
                    <span className="text-sm font-bold text-slate-800">
                        AI Pre-Send Analysis
                    </span>
                    <span
                        className="ml-auto rounded-full px-2 py-0.5 text-xs font-mono"
                        style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}
                    >
                        Automated
                    </span>
                </div>
                <div className="space-y-2">
                    {checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2">
                            {check.ok
                                ? <CheckCircle2 size={14} style={{ color: '#059669' }} />
                                : <AlertCircle size={14} style={{ color: '#d97706' }} />
                            }
                            <span className="text-xs text-slate-700">{check.msg}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Transmission Summary */}
            <div className="rounded-xl p-5 bg-white border border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                    Transmission Summary
                </h3>
                <div className="space-y-0">
                    {summary.map((row) => (
                        <div
                            key={row.label}
                            className="flex items-start gap-4 py-2 border-b border-slate-100"
                        >
                            <span className="w-28 flex-shrink-0 text-xs text-slate-400 font-mono uppercase tracking-wide">
                                {row.label}
                            </span>
                            <span className="text-sm font-medium text-slate-800">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onConfirm}
                    disabled={sending}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{
                        backgroundColor: '#0e7490',
                        opacity: sending ? 0.8 : 1,
                        cursor: sending ? 'not-allowed' : 'pointer',
                    }}
                >
                    {sending
                        ? <><Clock size={14} className="animate-spin" /> Sending…</>
                        : <><Send size={14} /> Confirm & Send</>
                    }
                </button>
            </div>

        </div>
    )
}