import { Lock, Shield, CheckCircle2 } from 'lucide-react'

const CARDS = [
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
        value: 'June 10, 2026',
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

export default function SecurityCards() {
    return (
        <div className="grid grid-cols-3 gap-4">
            {CARDS.map((card) => (
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