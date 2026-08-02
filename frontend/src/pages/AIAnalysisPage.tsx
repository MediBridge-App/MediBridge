import { useState, useEffect } from 'react'
import AIHeader from '../components/ai/AIHeader'
import AIStats from '../components/ai/AIStats'
import AIDonutChart from '../components/ai/AIDonutChart'
import AICapabilities from '../components/ai/AICapabilities'
import AIPipeline from '../components/ai/AIPipeline'
import AIHistoryItem from '../components/ai/AIHistoryItem'
import type { Analysis } from '../components/ai/AIHistoryItem'
import { aiApi } from '../api'
import { MOCK_AI_ANALYSES } from '../data/mockData'

// Shape of a single analysis as it comes back from GET /ai/analyses
// (matches the AIAnalysisResponse schema in the backend)
type ApiAnalysis = {
    id: string
    document_id: string
    document_type: string | null
    summary: string | null
    tags: string[] | null
    recommendation_text: string | null
    recommendation_type: string | null
    urgency_detected: boolean
    confidence_score: string | null // API sends this as a string, e.g. "0.97"
    processing_time_ms: number | null
    model_used: string | null
    status: string
    created_at: string
}

const categoryLabels: Record<string, string> = {
    lab_result: 'Laboratory',
    referral: 'Referral',
    discharge_summary: 'Discharge',
    insurance_form: 'Insurance',
    imaging: 'Imaging',
}

// NOTE: the API doesn't send a tx_ref for analyses, only document_id (a UUID).
// Same limitation as Inbox/Audit — showing the UUID for now. If we cross-reference
// against inbox/sent document lists later we could resolve this to a real tx_ref.
//
// NOTE: the API also doesn't send "entities" at all — that field was mock-only.
// Falling back to tags for now so AIHistoryItem doesn't break; revisit if Ayesha's
// Lambda starts returning something entity-like under a different field name.
//
// Confirmed via Ayesha's document-analysis.schema.json: confidence_score is
// already a 0-100 number from the Lambda. The backend's OpenAPI spec shows it
// serialized as a string (likely a DB Decimal -> str conversion), so we just
// parse it back to a number — no scaling needed.
function mapAnalysis(a: ApiAnalysis): Analysis {
    const confidencePct = a.confidence_score ? Math.round(parseFloat(a.confidence_score)) : 0

    return {
        txId: a.document_id,
        type: a.document_type ?? 'unknown',
        category: (a.document_type && categoryLabels[a.document_type]) ?? 'Other',
        summary: a.summary ?? 'AI analysis pending — document is being processed.',
        tags: a.tags ?? [],
        confidence: confidencePct,
        urgencyFlag: a.urgency_detected,
        processingMs: a.processing_time_ms ?? 0,
        model: a.model_used ?? 'Unknown',
        entities: a.tags ?? [], // placeholder — see note above
    }
}

export default function AIAnalysisPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
    const [selected, setSelected] = useState<Analysis | null>(null)
    const [analyses, setAnalyses] = useState<Analysis[]>(MOCK_AI_ANALYSES)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const data: ApiAnalysis[] = await aiApi.getAnalyses()
                if (data && data.length > 0) {
                    setAnalyses(data.map(mapAnalysis))
                }
                setError(false)
            } catch {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    function handleSelect(doc: Analysis) {
        setSelected(selected?.txId === doc.txId ? null : doc)
    }

    function handleRetry() {
        setIsLoading(true)
        setError(false)
        aiApi.getAnalyses()
            .then((data: ApiAnalysis[]) => {
                if (data && data.length > 0) {
                    setAnalyses(data.map(mapAnalysis))
                }
                setError(false)
            })
            .catch(() => setError(true))
            .finally(() => setIsLoading(false))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    return (
        <div
            className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            style={{ height: 'calc(100vh - 120px)' }}
        >
            <AIHeader activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <AIStats />
                        <div className="grid grid-cols-2 gap-4">
                            <AIDonutChart />
                            <AICapabilities />
                        </div>
                        <AIPipeline />
                    </div>
                )}

                {activeTab === 'history' && (
                    <>
                        {error && (
                            <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <p className="text-sm text-slate-600">
                                    Failed to load AI analyses — showing sample data.
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200"
                                    style={{ color: '#0e7490' }}
                                >
                                    Try again
                                </button>
                            </div>
                        )}
                        <div className="space-y-3">
                            {analyses.map((doc) => (
                                <AIHistoryItem
                                    key={doc.txId}
                                    doc={doc}
                                    isActive={selected?.txId === doc.txId}
                                    onClick={() => handleSelect(doc)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
