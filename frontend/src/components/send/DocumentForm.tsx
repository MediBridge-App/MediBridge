import { ChevronDown } from 'lucide-react'

const DOC_TYPES = [
    'Lab Report',
    'Referral',
    'Discharge Summary',
    'Insurance Form',
    'Imaging Report',
    'Medical Records',
    'Prior Authorization',
    'Consultation Note',
    'Prescription',
    'Other',
]

const PRIORITY_OPTIONS = [
    { value: 'normal', label: 'Normal', color: '#059669' },
    { value: 'urgent', label: 'Urgent', color: '#dc2626' },
    { value: 'routine', label: 'Routine', color: '#64748b' },
]

interface DocumentFormProps {
    docType: string
    subject: string
    priority: string
    notes: string
    onDocTypeChange: (value: string) => void
    onSubjectChange: (value: string) => void
    onPriorityChange: (value: string) => void
    onNotesChange: (value: string) => void
}

export default function DocumentForm({
    docType,
    subject,
    priority,
    notes,
    onDocTypeChange,
    onSubjectChange,
    onPriorityChange,
    onNotesChange,
}: DocumentFormProps) {
    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Document Details *
            </label>

            <div className="space-y-4">
                {/* Document Type */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                        Document Type
                    </label>
                    <div className="relative">
                        <select
                            value={docType}
                            onChange={(e) => onDocTypeChange(e.target.value)}
                            className="w-full px-3 py-2 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none appearance-none cursor-pointer"
                            style={{ color: docType ? '#0f172a' : '#94a3b8' }}
                        >
                            <option value="" disabled>Select document type…</option>
                            {DOC_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                    </div>
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                        Subject / Title
                    </label>
                    <input
                        value={subject}
                        onChange={(e) => onSubjectChange(e.target.value)}
                        placeholder="e.g. CBC Lab Results for Patient #P-94821"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none"
                    />
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                        Priority
                    </label>
                    <div className="flex gap-2">
                        {PRIORITY_OPTIONS.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => onPriorityChange(p.value)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                style={{
                                    border: `1px solid ${priority === p.value ? p.color : '#e2e8f0'}`,
                                    backgroundColor: priority === p.value ? p.color + '15' : 'transparent',
                                    color: priority === p.value ? p.color : '#64748b',
                                }}
                            >
                                <span
                                    className="rounded-full flex-shrink-0"
                                    style={{
                                        width: 7,
                                        height: 7,
                                        backgroundColor: p.color,
                                        display: 'inline-block',
                                    }}
                                />
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                        Notes (optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows={3}
                        placeholder="Add context or instructions for the recipient…"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none resize-vertical"
                    />
                </div>
            </div>
        </div>
    )
}