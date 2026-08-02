import { Lock, Shield, CheckCircle2 } from 'lucide-react'

interface SecurityCardsProps {
    lastScan: string | null
}

export default function SecurityCards({ lastScan }: SecurityCardsProps) {
    const scanDisplay = lastScan
        ? new Date(lastScan).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : 'No scan recorded'

    // Encryption and Compliance are architectural facts about the system,
    // not per-org data — no backend endpoint for these, kept static.
    const cards = [
        {
            icon: <Lock size={18} />,
            label: 'Encryption',
            value: 'AES-256 + TLS 1.3',
            color: '#059669',
            bg: '#d1fae5',
        },
        {
            icon: <Shield size={18} />,
            label: 'Last Security Scan',
            value: scanDisplay,
            color: '#059669',
            bg: '#d1fae5',
        },
        {
            icon: <CheckCircle2 size={18} />,
            label: 'Compliance',
            value: 'HIPAA Compliant',
            color: '#059669',
            bg: '#d1fae5',
        },
    ]

    return (
        <div className="grid grid-cols-3 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200"
                >
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: card.bg, color: card.color }}
                    >
                        {card.icon}
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 mb-0.5">{card.label}</div>
                        <div className="text-sm font-bold text-slate-800">{card.value}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}
