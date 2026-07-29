import { useState } from 'react'
import { Save } from 'lucide-react'

const NOTIFICATION_SETTINGS = [
    {
        id: 'document_delivered',
        label: 'Document Delivered',
        desc: 'When a document you sent is delivered',
        default: true,
    },
    {
        id: 'document_read',
        label: 'Document Read',
        desc: 'When a recipient opens your document',
        default: true,
    },
    {
        id: 'urgent_documents',
        label: 'Urgent Documents',
        desc: 'Immediate alerts for AI-flagged urgent documents',
        default: true,
    },
    {
        id: 'audit_events',
        label: 'Audit Events',
        desc: 'System-level audit trail entries',
        default: false,
    },
    {
        id: 'ai_processing',
        label: 'AI Processing Complete',
        desc: 'When AI analysis finishes on a new document',
        default: true,
    },
]

interface ToggleProps {
    enabled: boolean
    onChange: (val: boolean) => void
}

function Toggle({ enabled, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
            style={{
                width: 44,
                height: 24,
                backgroundColor: enabled ? '#0e7490' : '#e2e8f0',
            }}
        >
            <span
                className="inline-block w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: enabled ? 'translateX(22px)' : 'translateX(2px)' }}
            />
        </button>
    )
}

export default function NotificationSettings() {
    const [settings, setSettings] = useState(
        Object.fromEntries(NOTIFICATION_SETTINGS.map((s) => [s.id, s.default]))
    )
    const [saved, setSaved] = useState(false)

    function handleToggle(id: string, val: boolean) {
        setSettings((prev) => ({ ...prev, [id]: val }))
    }

    function handleSave() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">Notifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Control which events trigger notifications
                </p>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">
                    Event Notifications
                </h3>
                <div className="divide-y divide-slate-100">
                    {NOTIFICATION_SETTINGS.map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-3.5">
                            <div>
                                <div className="text-sm font-medium text-slate-800">
                                    {s.label}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">{s.desc}</div>
                            </div>
                            <Toggle
                                enabled={settings[s.id]}
                                onChange={(val) => handleToggle(s.id, val)}
                            />
                        </div>
                    ))}
                </div>
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