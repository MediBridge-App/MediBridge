import { Brain } from 'lucide-react'

interface AIHeaderProps {
    activeTab: 'overview' | 'history'
    onTabChange: (tab: 'overview' | 'history') => void
}

export default function AIHeader({ activeTab, onTabChange }: AIHeaderProps) {
    return (
        <div className="bg-white border-b border-slate-200">
            {/* Title row */}
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="rounded-xl flex items-center justify-center"
                        style={{
                            width: 40,
                            height: 40,
                            background: 'linear-gradient(135deg, #ede9fe, #e0f2fe)',
                        }}
                    >
                        <Brain size={20} style={{ color: '#7c3aed' }} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800">AI Analysis</h2>
                        <p className="text-xs text-slate-500">
                            Powered by Amazon Nova Micro via AWS Bedrock
                        </p>
                    </div>
                </div>

                {/* Lambda Active badge */}
                <div
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: '#ede9fe', border: '1px solid #c4b5fd' }}
                >
                    <div
                        className="rounded-full"
                        style={{ width: 7, height: 7, backgroundColor: '#7c3aed' }}
                    />
                    <span
                        className="text-xs font-semibold font-mono"
                        style={{ color: '#5b21b6' }}
                    >
                        Lambda Active
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6">
                {(['overview', 'history'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className="px-4 py-3 text-sm font-medium transition-colors"
                        style={{
                            color: activeTab === tab ? '#0e7490' : '#64748b',
                            borderBottom: activeTab === tab
                                ? '2px solid #0e7490'
                                : '2px solid transparent',
                            background: 'none',
                        }}
                    >
                        {tab === 'overview' ? 'Overview' : 'Recent Analyses'}
                    </button>
                ))}
            </div>
        </div>
    )
}