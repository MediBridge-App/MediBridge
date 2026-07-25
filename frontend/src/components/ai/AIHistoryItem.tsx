import { Brain, Tag, Sparkles, ChevronRight } from 'lucide-react'

const categoryColors: Record<string, { color: string; bg: string }> = {
    Laboratory: { color: '#059669', bg: '#d1fae5' },
    Referral: { color: '#7c3aed', bg: '#ede9fe' },
    Discharge: { color: '#0e7490', bg: '#e0f2fe' },
    Insurance: { color: '#d97706', bg: '#fef3c7' },
    Imaging: { color: '#0284c7', bg: '#dbeafe' },
    Other: { color: '#64748b', bg: '#f1f5f9' },
}

export interface Analysis {
    txId: string
    type: string
    category: string
    summary: string
    tags: string[]
    confidence: number
    urgencyFlag: boolean
    processingMs: number
    model: string
    entities: string[]
}

interface AIHistoryItemProps {
    doc: Analysis
    isActive: boolean
    onClick: () => void
}

export default function AIHistoryItem({
    doc,
    isActive,
    onClick,
}: AIHistoryItemProps) {
    const cat = categoryColors[doc.category] ?? { color: '#64748b', bg: '#f1f5f9' }

    return (
        <button
            onClick={onClick}
            className="w-full rounded-xl text-left transition-all"
            style={{
                backgroundColor: isActive ? '#f0fdf9' : 'white',
                border: `1px solid ${isActive ? '#0e7490' : '#e2e8f0'}`,
                padding: 0,
            }}
        >
            {/* Main row */}
            <div className="flex items-start gap-4 p-4">
                <div
                    className="rounded-xl flex items-center justify-center shrink-0"
                    style={{ width: 40, height: 40, backgroundColor: '#ede9fe' }}
                >
                    <Brain size={18} style={{ color: '#7c3aed' }} />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">{doc.txId}</span>
                        <span
                            className="rounded px-2 py-0.5 text-xs font-semibold font-mono"
                            style={{ backgroundColor: cat.bg, color: cat.color }}
                        >
                            {doc.category}
                        </span>
                        {doc.urgencyFlag && (
                            <span className="text-xs font-bold font-mono text-red-600">
                                ⚡ URGENT FLAG
                            </span>
                        )}
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-slate-700 leading-relaxed mb-2">
                        {doc.summary}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-slate-400 font-mono">
                            {doc.confidence}% confidence
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                            {doc.processingMs}ms
                        </span>
                        <span className="text-xs text-slate-400">{doc.model}</span>
                    </div>
                </div>

                <ChevronRight
                    size={14}
                    className="text-slate-400 shrink-0 mt-1 transition-transform"
                    style={{ transform: isActive ? 'rotate(90deg)' : 'none' }}
                />
            </div>

            {/* Expanded detail */}
            {isActive && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Tags */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Tag size={12} style={{ color: '#7c3aed' }} />
                                <span className="text-xs font-semibold text-slate-700">
                                    Suggested Tags
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {doc.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                        style={{ backgroundColor: '#f0fdf9', color: '#0e7490' }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Entities */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Sparkles size={12} style={{ color: '#7c3aed' }} />
                                <span className="text-xs font-semibold text-slate-700">
                                    Extracted Entities
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {doc.entities.map((e) => (
                                    <span
                                        key={e}
                                        className="rounded px-2 py-0.5 text-xs font-mono"
                                        style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}
                                    >
                                        {e}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </button>
    )
}