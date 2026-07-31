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


export default function AIAnalysisPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
    const [selected, setSelected] = useState<Analysis | null>(null)
    const [analyses, setAnalyses] = useState<Analysis[]>(MOCK_AI_ANALYSES)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await aiApi.getAnalyses()
                if (data && data.length > 0) {
                    setAnalyses(data)
                }
            } catch {
                // API not ready yet — using mock data
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    function handleSelect(doc: Analysis) {
        setSelected(selected?.txId === doc.txId ? null : doc)
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
                )}
            </div>
        </div>
    )
}