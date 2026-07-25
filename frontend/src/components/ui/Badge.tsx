import { Brain } from 'lucide-react'

type BadgeVariant =
    | 'delivered'
    | 'routed'
    | 'classified'
    | 'ocr_complete'
    | 'uploaded'
    | 'urgent'
    | 'normal'
    | 'routine'
    | 'referral'
    | 'lab_result'
    | 'discharge_summary'
    | 'insurance_form'
    | 'imaging'

interface BadgeProps {
    label: string
    variant: BadgeVariant
}

const styles: Record<BadgeVariant, string> = {
    // Status badges — each has different color
    delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    routed: 'bg-blue-50 text-blue-700 border border-blue-200',
    classified: 'bg-purple-50 text-purple-700 border border-purple-200',
    ocr_complete: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    uploaded: 'bg-slate-100 text-slate-600 border border-slate-200',

    // Priority badges
    urgent: 'bg-red-50 text-red-600 border border-red-200 font-semibold',
    normal: 'bg-slate-100 text-slate-600 border border-slate-200',
    routine: 'bg-slate-50 text-slate-500 border border-slate-200',

    // Document type badges — ALL same purple color like Figma
    referral: 'bg-violet-50 text-violet-600 border border-violet-200',
    lab_result: 'bg-violet-50 text-violet-600 border border-violet-200',
    discharge_summary: 'bg-violet-50 text-violet-600 border border-violet-200',
    insurance_form: 'bg-violet-50 text-violet-600 border border-violet-200',
    imaging: 'bg-violet-50 text-violet-600 border border-violet-200',
}

const labels: Record<BadgeVariant, string> = {
    delivered: 'Delivered',
    routed: 'Routed',
    classified: 'Classified',
    ocr_complete: 'OCR Complete',
    uploaded: 'Uploaded',
    urgent: 'URGENT',
    normal: 'Normal',
    routine: 'Routine',
    referral: 'Referral',
    lab_result: 'Lab Result',
    discharge_summary: 'Discharge',
    insurance_form: 'Insurance',
    imaging: 'Imaging',
}

export default function Badge({ label, variant }: BadgeProps) {
    const isDocType = ['referral', 'lab_result', 'discharge_summary', 'insurance_form', 'imaging'].includes(variant)

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border-none text-xs ${styles[variant]}`}>
            {isDocType && <Brain size={10} className="text-violet-600" />}
            {labels[variant] || label}
        </span>
    )
}