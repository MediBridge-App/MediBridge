import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { notificationPreferencesApi } from '../../api'

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
            className="relative inline-flex items-center rounded-full transition-colors shrink-0"
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
    const [settings, setSettings] = useState<Record<string, boolean>>(
        Object.fromEntries(NOTIFICATION_SETTINGS.map((s) => [s.id, s.default]))
    )
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        async function fetchPreferences() {
            setIsLoading(true)
            try {
                const data: Record<string, boolean> = await notificationPreferencesApi.get()
                // Merge with defaults so a missing key from the backend
                // doesn't wipe out that toggle's state.
                setSettings((prev) => ({ ...prev, ...data }))
                setError(false)
            } catch {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPreferences()
    }, [])

    function handleToggle(id: string, val: boolean) {
        setSettings((prev) => ({ ...prev, [id]: val }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            await notificationPreferencesApi.update(settings)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error('Failed to save notification preferences:', err)
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">Notifications</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Control which events trigger notifications
                </p>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    Couldn't load your saved preferences — showing defaults.
                </div>
            )}

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
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ backgroundColor: saved ? '#059669' : '#0e7490' }}
                >
                    <Save size={14} />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
