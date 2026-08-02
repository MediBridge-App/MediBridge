import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Inbox, BrainCircuit, FileText, Clock, Activity, ArrowUpRight, Brain } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import ActivityChart from '../components/dashboard/ActivityChart'
import DocTypesChart from '../components/dashboard/DocTypesChart'
import { dashboardApi } from '../api'
import { useAuth } from '../hooks/useAuth'
import { useInbox } from '../hooks/useInbox'
import {
    MOCK_STATS,
    MOCK_ACTIVITY,
    MOCK_DOC_TYPES,
    MOCK_RECENT,
} from '../data/mockData'
import type { DocumentType, DocumentStatus, DocumentPriority } from '../types'


export default function DashboardPage() {
    const [stats, setStats] = useState(MOCK_STATS)
    const [recentDocs, setRecentDocs] = useState(MOCK_RECENT)
    const [activityData, setActivityData] = useState(MOCK_ACTIVITY)
    const [docTypes, setDocTypes] = useState(MOCK_DOC_TYPES)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const navigate = useNavigate()
    const [activityRange, setActivityRange] = useState<'7d' | '30d'>('7d')
    const { user } = useAuth()
    const { unreadCount } = useInbox()

    const hour = new Date().getHours()
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

    // Fall back to generic copy if user info isn't loaded yet — never show
    // another user's name/org as a hardcoded default.
    // AuthContext (context/AuthContext.tsx) maps the backend's /auth/me
    // response into a camelCase AuthUser shape: { fullName, organizationName, ... }.
    // Falls back to empty strings if the backend call fails, so treat both
    // missing and empty as "don't show it" rather than erroring.
    const greetingName = user?.fullName ? `, ${user.fullName}` : ''
    const orgName = user?.organizationName || null

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const [statsData, activityResult, docTypesResult, recentResult] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getActivity(activityRange),
                    dashboardApi.getDocumentTypes(),
                    dashboardApi.getRecent(),
                ])

                // Map stats
                setStats({
                    documentsSent: statsData.documents_sent ?? 0,
                    documentsReceived: statsData.documents_received ?? 0,
                    pendingReview: statsData.pending_review ?? 0,
                    aiProcessed: statsData.ai_processed ?? 0,
                    sentChange: statsData.sent_change_pct ?? 0,
                    receivedChange: statsData.received_change_pct ?? 0,
                    pendingChange: statsData.pending_change_pct ?? 0,
                    aiChange: statsData.ai_change_pct ?? 0,
                })

                // Map activity — API returns documents, group by day
                if (activityResult && activityResult.length > 0) {
                    const dayMap: Record<string, { sent: number; received: number }> = {}
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    days.forEach(d => { dayMap[d] = { sent: 0, received: 0 } })

                    activityResult.forEach((item: { date: string; status: string }) => {
                        const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
                        if (dayMap[day]) {
                            if (item.status === 'delivered') {
                                dayMap[day].received += 1
                            } else {
                                dayMap[day].sent += 1
                            }
                        }
                    })

                    const mapped = days.map(day => ({
                        day,
                        sent: dayMap[day].sent,
                        received: dayMap[day].received,
                    }))
                    setActivityData(mapped)
                }

                // Map document types
                if (docTypesResult && docTypesResult.length > 0) {
                    const maxCount = Math.max(...docTypesResult.map((d: { count: number }) => d.count))
                    const mapped = docTypesResult.map((item: { type: string; count: number }) => ({
                        label: item.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                        value: item.count,
                        max: maxCount || 1,
                    }))
                    setDocTypes(mapped)
                }

                // Map recent transmissions
                if (recentResult && recentResult.length > 0) {
                    const mapped = recentResult.map((doc: {
                        tx_ref: string
                        document_type: string
                        subject: string
                        status: string
                        priority: string
                        created_at: string
                    }) => ({
                        id: doc.tx_ref || 'Unknown',
                        txRef: doc.tx_ref || 'Unknown',
                        documentType: doc.document_type as DocumentType,
                        subject: doc.subject || 'Untitled',
                        senderOrgName: 'Healthcare Org',
                        status: doc.status as DocumentStatus,
                        priority: doc.priority as DocumentPriority,
                        timeAgo: new Date(doc.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        }),
                    }))
                    setRecentDocs(mapped)
                }

                setError(false)
            } catch {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [activityRange])

    return isLoading ?
        (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
        ) : error ?
            (<div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                    ⚠️
                </div>
                <p className="text-sm text-slate-600">Failed to load dashboard data</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200"
                    style={{ color: '#0e7490' }}
                >
                    Try again
                </button>
            </div>
            ) : (
                <div className="space-y-6 p-6">

                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {greeting}{greetingName}
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                                {orgName && <> · {orgName}</>}
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
                            value={stats.documentsSent}
                            change={stats.sentChange}
                            icon={<Send size={18} color="#0ea5a0" />}
                            iconBg="#f0fdf9"
                        />
                        <StatCard
                            label="Documents Received"
                            value={stats.documentsReceived}
                            change={stats.receivedChange}
                            icon={<Inbox size={18} color="#0ea5a0" />}
                            iconBg="#f0fdf9"
                        />
                        <StatCard
                            label="Pending Review"
                            value={stats.pendingReview}
                            change={stats.pendingChange}
                            icon={<Clock size={18} color="#f59e0b" />}
                            iconBg="#fffbeb"
                        />
                        <StatCard
                            label="AI Processed"
                            value={stats.aiProcessed}
                            change={stats.aiChange}
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
                            <ActivityChart data={activityData} />
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="mb-5">
                                <h3 className="font-semibold text-slate-800">Document Types</h3>
                                <p className="text-xs text-slate-500 mt-0.5">This month</p>
                            </div>
                            <DocTypesChart data={docTypes} />
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
                            {recentDocs.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
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
                                    <div className="flex items-center gap-3 shrink-0">
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
                                desc: unreadCount > 0
                                    ? `${unreadCount} unread document${unreadCount === 1 ? '' : 's'}`
                                    : 'No unread documents',
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
                                    className="rounded-lg flex items-center justify-center shrink-0"
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
