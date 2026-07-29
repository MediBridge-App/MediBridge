import { useState } from 'react'
import AIHeader from '../components/ai/AIHeader'
import AIStats from '../components/ai/AIStats'
import AIDonutChart from '../components/ai/AIDonutChart'
import AICapabilities from '../components/ai/AICapabilities'
import AIPipeline from '../components/ai/AIPipeline'
import AIHistoryItem from '../components/ai/AIHistoryItem'
import type { Analysis } from '../components/ai/AIHistoryItem'

const RECENT_ANALYSES: Analysis[] = [
    {
        txId: 'TX-8821',
        type: 'Lab Report',
        category: 'Laboratory',
        summary: 'Routine CBC and CMP results. WBC within normal range (6.2 × 10³/µL). Hemoglobin slightly low at 11.4 g/dL — monitor for anemia.',
        tags: ['Routine CBC', 'Metabolic Panel', 'Monitor Hemoglobin'],
        confidence: 97,
        urgencyFlag: false,
        processingMs: 840,
        model: 'Claude claude-haiku-4-5',
        entities: ['WBC: 6.2', 'Hgb: 11.4', 'CMP: Normal'],
    },
    {
        txId: 'TX-8820',
        type: 'Referral',
        category: 'Referral',
        summary: 'Cardiology referral for 58-year-old male with new-onset chest pain and exertional dyspnea. Requesting stress echocardiogram. ECG shows minor ST changes.',
        tags: ['Cardiology', 'Chest Pain', 'Echocardiogram Requested', 'Urgent'],
        confidence: 99,
        urgencyFlag: true,
        processingMs: 1120,
        model: 'Claude claude-haiku-4-5',
        entities: ['Age: 58M', 'ST changes', 'Echocardiogram'],
    },
    {
        txId: 'TX-8819',
        type: 'Discharge Summary',
        category: 'Discharge',
        summary: 'Discharge following uncomplicated laparoscopic appendectomy. Day 2 post-op. Follow-up within 7 days, activity restrictions for 2 weeks.',
        tags: ['Post-surgical', 'Follow-up Required', 'Appendectomy'],
        confidence: 95,
        urgencyFlag: false,
        processingMs: 1340,
        model: 'Claude claude-haiku-4-5',
        entities: ['Appendectomy', 'Day 2 post-op', '7-day follow-up'],
    },
    {
        txId: 'TX-8818',
        type: 'Insurance Form',
        category: 'Insurance',
        summary: "Prior authorization for Adalimumab (Humira) 40mg. Crohn's disease diagnosis. Signature and clinical documentation required. Deadline June 17.",
        tags: ['Pre-auth', 'Biologics', 'Action Required', 'Deadline'],
        confidence: 92,
        urgencyFlag: true,
        processingMs: 980,
        model: 'Claude claude-haiku-4-5',
        entities: ["Adalimumab 40mg", "Crohn's disease", 'June 17 deadline'],
    },
]

export default function AIAnalysisPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')
    const [selected, setSelected] = useState<Analysis | null>(null)

    function handleSelect(doc: Analysis) {
        setSelected(selected?.txId === doc.txId ? null : doc)
    }

    return (
        <div
            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            style={{ minHeight: 'calc(100vh - 120px)' }}
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
                        {RECENT_ANALYSES.map((doc) => (
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