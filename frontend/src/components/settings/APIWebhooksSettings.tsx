import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { apiKeysApi, webhooksApi } from '../../api'

// Field names here are best-guesses based on the OpenAPI schema names
// (APIKeyResponse, WebhookResponse) — not yet verified against real
// responses. Using flexible fallbacks so the UI doesn't break if a field
// is named slightly differently than expected; adjust once confirmed.
type ApiKey = {
    id: string
    name?: string
    prefix?: string
    key_prefix?: string
    created_at?: string
    is_active?: boolean
}

type ApiWebhook = {
    id: string
    name?: string
    url: string
    events?: string[]
    created_at?: string
}

function formatDate(iso: string | undefined): string {
    if (!iso) return 'Unknown date'
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function APIWebhooksSettings() {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [webhooks, setWebhooks] = useState<ApiWebhook[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    useEffect(() => {
        fetchAll()
    }, [])

    async function fetchAll() {
        setIsLoading(true)
        try {
            const [keysData, webhooksData] = await Promise.all([
                apiKeysApi.getAll(),
                webhooksApi.getAll(),
            ])
            setApiKeys(keysData ?? [])
            setWebhooks(webhooksData ?? [])
            setError(false)
        } catch {
            setError(true)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleGenerateKey() {
        const name = window.prompt('Name for this API key (e.g. "Production Key"):')
        if (!name) return
        setActionError(null)
        try {
            const created = await apiKeysApi.create({ name })
            // APIKeyCreatedResponse likely includes the full raw key value,
            // shown only once — surface it so the user can copy it now.
            const rawKey = created?.key ?? created?.api_key ?? created?.value
            if (rawKey) {
                window.alert(`API key created. Copy it now — it won't be shown again:\n\n${rawKey}`)
            }
            fetchAll()
        } catch (err) {
            console.error('Failed to create API key:', err)
            setActionError('Failed to create API key. Please try again.')
        }
    }

    async function handleDeleteKey(id: string) {
        if (!window.confirm('Delete this API key? This cannot be undone.')) return
        setActionError(null)
        try {
            await apiKeysApi.delete(id)
            setApiKeys((prev) => prev.filter((k) => k.id !== id))
        } catch (err) {
            console.error('Failed to delete API key:', err)
            setActionError('Failed to delete API key. Please try again.')
        }
    }

    async function handleAddWebhook() {
        const url = window.prompt('Webhook URL:')
        if (!url) return
        const eventsInput = window.prompt(
            'Events to subscribe to, comma-separated (e.g. doc.sent, doc.received, doc.read):'
        )
        const events = eventsInput
            ? eventsInput.split(',').map((e) => e.trim()).filter(Boolean)
            : []
        setActionError(null)
        try {
            await webhooksApi.create({ url, events })
            fetchAll()
        } catch (err) {
            console.error('Failed to create webhook:', err)
            setActionError('Failed to create webhook. Please try again.')
        }
    }

    async function handleDeleteWebhook(id: string) {
        if (!window.confirm('Delete this webhook? This cannot be undone.')) return
        setActionError(null)
        try {
            await webhooksApi.delete(id)
            setWebhooks((prev) => prev.filter((w) => w.id !== id))
        } catch (err) {
            console.error('Failed to delete webhook:', err)
            setActionError('Failed to delete webhook. Please try again.')
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
                <h2 className="text-base font-bold text-slate-800">API & Webhooks</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Manage API keys and webhook integrations
                </p>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    Couldn't load API keys and webhooks. Try refreshing the page.
                </div>
            )}
            {actionError && (
                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    {actionError}
                </div>
            )}

            {/* API Keys */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-800">API Keys</h3>
                <div className="space-y-2">
                    {apiKeys.length === 0 && (
                        <p className="text-xs text-slate-400">No API keys yet.</p>
                    )}
                    {apiKeys.map((key) => (
                        <div
                            key={key.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100"
                            style={{ backgroundColor: '#f8fafc' }}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-700">
                                    {key.name ?? 'Unnamed key'}
                                </div>
                                <div className="text-xs font-mono text-slate-400">
                                    {key.prefix ?? key.key_prefix ?? '••••••••'} · Created {formatDate(key.created_at)}
                                </div>
                            </div>
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: key.is_active !== false ? '#d1fae5' : '#f1f5f9',
                                    color: key.is_active !== false ? '#059669' : '#64748b',
                                }}
                            >
                                {key.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => handleDeleteKey(key.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={handleGenerateKey}
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
                    {webhooks.length === 0 && (
                        <p className="text-xs text-slate-400">No webhooks configured yet.</p>
                    )}
                    {webhooks.map((wh) => (
                        <div
                            key={wh.id}
                            className="p-3 rounded-lg border border-slate-100"
                            style={{ backgroundColor: '#f8fafc' }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-700">
                                    {wh.name ?? wh.url}
                                </span>
                                <button
                                    onClick={() => handleDeleteWebhook(wh.id)}
                                    className="text-slate-300 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                            <div className="text-xs font-mono text-slate-400 mb-1.5">
                                {wh.url}
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                                {(wh.events ?? []).map((e) => (
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
                    onClick={handleAddWebhook}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <Plus size={13} />
                    Add Webhook
                </button>
            </div>
        </div>
    )
}
