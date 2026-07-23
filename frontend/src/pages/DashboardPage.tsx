import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Inbox, BrainCircuit, FileText, Clock, Activity, ArrowUpRight, Brain } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import ActivityChart from '../components/dashboard/ActivityChart'
import DocTypesChart from '../components/dashboard/DocTypesChart'
import {
    MOCK_STATS,
    MOCK_ACTIVITY,
    MOCK_DOC_TYPES,
    MOCK_RECENT,
} from '../data/mockData'


export default function DashboardPage() {
    const navigate = useNavigate()
    const [activityRange, setActivityRange] = useState<'7d' | '30d'>('7d')

    const hour = new Date().getHours()
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {greeting}, Dr. Rivera
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        {' · '}St. Mercy General Hospital
                    </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    All Systems Operational
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    label="Documents Sent"
                    value={MOCK_STATS.documentsSent}
                    change={MOCK_STATS.sentChange}
                    icon={<Send size={18} color="#0ea5a0" />}
                    iconBg="#f0fdf9"
                />
                <StatCard
                    label="Documents Received"
                    value={MOCK_STATS.documentsReceived}
                    change={MOCK_STATS.receivedChange}
                    icon={<Inbox size={18} color="#0ea5a0" />}
                    iconBg="#f0fdf9"
                />
                <StatCard
                    label="Pending Review"
                    value={MOCK_STATS.pendingReview}
                    change={MOCK_STATS.pendingChange}
                    icon={<Clock size={18} color="#f59e0b" />}
                    iconBg="#fffbeb"
                />
                <StatCard
                    label="AI Processed"
                    value={MOCK_STATS.aiProcessed}
                    change={MOCK_STATS.aiChange}
                    icon={<BrainCircuit size={18} color="#7c3aed" />}
                    iconBg="#f5f3ff"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">Document Activity</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Sent vs. received this week
                            </p>
                        </div>
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                            {(['7d', '30d'] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setActivityRange(r)}
                                    className={`px-3 py-1.5 font-medium transition-colors ${activityRange === r
                                        ? 'text-white'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                    style={activityRange === r ? { backgroundColor: '#0d1b2a' } : {}}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ActivityChart data={MOCK_ACTIVITY} />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="mb-5">
                        <h3 className="font-semibold text-slate-800">Document Types</h3>
                        <p className="text-xs text-slate-500 mt-0.5">This month</p>
                    </div>
                    <DocTypesChart data={MOCK_DOC_TYPES} />
                </div>
            </div>

            {/* Recent Transmissions */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Activity size={16} style={{ color: '#0ea5a0' }} />
                        <h3 className="font-semibold text-slate-800">Recent Transmissions</h3>
                    </div>
                    <button
                        onClick={() => navigate('/inbox')}
                        className="text-sm font-medium flex items-center gap-1"
                        style={{ color: '#0ea5a0' }}
                    >
                        View all →
                    </button>
                </div>
                <div className="divide-y divide-slate-100">
                    {MOCK_RECENT.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-medium text-sm text-slate-800 truncate">
                                        {item.subject}
                                    </span>
                                    <Badge label={item.documentType} variant={item.documentType} />
                                    {item.priority === 'urgent' && (
                                        <Badge label="urgent" variant="urgent" />
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">From: {item.senderOrgName}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <Badge label={item.status} variant={item.status} />
                                <span className="text-xs text-slate-400">{item.timeAgo}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    {
                        label: 'Send New Document',
                        desc: 'Transmit to another org',
                        icon: <Send size={18} />,
                        color: '#0e7490',
                        path: '/send',
                    },
                    {
                        label: 'View Inbox',
                        desc: '5 unread documents',
                        icon: <Inbox size={18} />,
                        color: '#06b6d4',
                        path: '/inbox',
                    },
                    {
                        label: 'AI Analysis',
                        desc: 'Run document insights',
                        icon: <Brain size={18} />,
                        color: '#7c3aed',
                        path: '/ai-analysis',
                    },
                ].map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:opacity-90 active:scale-[0.99] transition-all"
                        style={{ backgroundColor: action.color }}
                    >
                        {/* Icon box */}
                        <div
                            className="rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                width: 36,
                                height: 36,
                                backgroundColor: 'rgba(255,255,255,0.15)',
                            }}
                        >
                            <span className="text-white">{action.icon}</span>
                        </div>

                        {/* Text */}
                        <div className="flex-1">
                            <div className="text-white text-sm font-semibold">{action.label}</div>
                            <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {action.desc}
                            </div>
                        </div>

                        {/* Arrow */}
                        <ArrowUpRight size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </button>
                ))}
            </div>
        </div>
    )
}