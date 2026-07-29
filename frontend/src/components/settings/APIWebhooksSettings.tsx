import { useState } from 'react'
import { Plus, Trash2, Save } from 'lucide-react'

const INITIAL_KEYS = [
    {
        id: '1',
        name: 'Production Key',
        prefix: 'mb_prod_***********4f9a',
        created: 'Jan 1, 2026',
        isActive: true,
    },
    {
        id: '2',
        name: 'Staging Key',
        prefix: 'mb_stg_***********b2c1',
        created: 'Feb 15, 2026',
        isActive: true,
    },
]

const INITIAL_WEBHOOKS = [
    {
        id: '1',
        name: 'Document Events Webhook',
        url: 'https://api.stmercy.org/webhooks/medibridge',
        events: ['doc.sent', 'doc.received', 'doc.read'],
    },
]

export default function APIWebhooksSettings() {
    const [apiKeys] = useState(INITIAL_KEYS)
    const [webhooks] = useState(INITIAL_WEBHOOKS)
    const [saved, setSaved] = useState(false)

    function handleSave() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">API & Webhooks</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Manage API keys and webhook integrations
                </p>
            </div>

            {/* API Keys */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">API Keys</h3>
                <div className="space-y-2">
                    {apiKeys.map((key) => (
                        <div
                            key={key.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100"
                            style={{ backgroundColor: '#f8fafc' }}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-700">
                                    {key.name}
                                </div>
                                <div className="text-xs font-mono text-slate-400">
                                    {key.prefix} · Created {key.created}
                                </div>
                            </div>
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: '#d1fae5', color: '#059669' }}
                            >
                                Active
                            </span>
                            <button className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#0e7490' }}
                >
                    <Plus size={13} />
                    Generate New Key
                </button>
            </div>

            {/* Webhooks */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">Webhooks</h3>
                <div className="space-y-2">
                    {webhooks.map((wh) => (
                        <div
                            key={wh.id}
                            className="p-3 rounded-lg border border-slate-100"
                            style={{ backgroundColor: '#f8fafc' }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-700">
                                    {wh.name}
                                </span>
                                <button className="text-slate-300 hover:text-red-400 transition-colors">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                            <div className="text-xs font-mono text-slate-400 mb-1.5">
                                {wh.url}
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {wh.events.map((e) => (
                                    <span
                                        key={e}
                                        className="text-xs font-mono px-2 py-0.5 rounded"
                                        style={{ backgroundColor: '#e0f2fe', color: '#0e7490' }}
                                    >
                                        {e}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Plus size={13} />
                    Add Webhook
                </button>
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