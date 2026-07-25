import { useState } from 'react'
import { X, Camera, Send, Inbox, Activity, Edit2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface ProfilePanelProps {
    onClose: () => void
}

const TABS = ['Profile', 'Preferences', 'Security'] as const
type Tab = typeof TABS[number]

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<Tab>('Profile')

    function handleSignOut() {
        navigate('/login')
    }

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            style={{ zIndex: 9999 }}
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="fixed inset-0"
                style={{ background: "rgba(13,27,42,0.45)", backdropFilter: "blur(2px)" }} />

            {/* Panel */}
            <div
                className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
                style={{
                    width: 420,
                    background: "#ffffff",
                    borderLeft: "1px solid rgba(14, 116, 144, 0.12)",
                    boxShadow: "-12px 0 40px rgba(13,27,42,0.18)",
                    fontFamily: "'Inter', sans-serif",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-slate-800">My Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Avatar section */}
                <div className="flex flex-col items-center py-6 px-5 border-b border-slate-100">
                    <div className="relative mb-3">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                            style={{ backgroundColor: '#0e7490' }}
                        >
                            JR
                        </div>
                        <button
                            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: '#0e7490' }}
                        >
                            <Camera size={12} />
                        </button>
                    </div>
                    <div className="text-sm font-bold text-slate-900">Dr. James Rivera</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        Physician · Internal Medicine
                    </div>
                    <div
                        className="text-xs font-medium mt-1"
                        style={{ color: '#0e7490' }}
                    >
                        St. Mercy General
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 w-full mt-4">
                        {[
                            { icon: <Send size={14} />, value: '284', label: 'Sent' },
                            { icon: <Inbox size={14} />, value: '371', label: 'Received' },
                            { icon: <Activity size={14} />, value: '47', label: 'This Month' },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-100"
                            >
                                <span className="text-slate-400">{s.icon}</span>
                                <span className="text-sm font-bold text-slate-800">{s.value}</span>
                                <span className="text-xs text-slate-400">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-5">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className="px-3 py-3 text-xs font-medium transition-colors"
                            style={{
                                color: activeTab === tab ? '#0e7490' : '#64748b',
                                borderBottom: activeTab === tab
                                    ? '2px solid #0e7490'
                                    : '2px solid transparent',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {activeTab === 'Profile' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Personal Information
                                </h3>
                                <button
                                    className="flex items-center gap-1 text-xs font-medium"
                                    style={{ color: '#0e7490' }}
                                >
                                    <Edit2 size={11} /> Edit
                                </button>
                            </div>

                            {[
                                { label: 'Full Name', value: 'Dr. James Rivera' },
                                { label: 'Work Email', value: 'j.rivera@stmercy.org' },
                                { label: 'Role', value: 'Physician' },
                                { label: 'Organization', value: 'St. Mercy General' },
                                { label: 'Specialty', value: 'Internal Medicine' },
                                { label: 'NPI Number', value: '1234567890' },
                                { label: 'Organization ID', value: 'ORG-00142' },
                            ].map((field) => (
                                <div key={field.label}>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        {field.label}
                                    </label>
                                    <div
                                        className="px-3 py-2 rounded-lg text-xs text-slate-700 border border-slate-100"
                                        style={{ backgroundColor: '#f8fafc' }}
                                    >
                                        {field.value}
                                    </div>
                                </div>
                            ))}

                            <div
                                className="text-xs text-slate-400 font-mono py-2"
                            >
                                Last login: Today, 08:30 AM · IP 10.0.1.44
                            </div>
                        </div>
                    )}

                    {activeTab === 'Preferences' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Display Preferences
                            </h3>
                            <p className="text-xs text-slate-400">
                                Preferences settings coming soon.
                            </p>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Security Settings
                            </h3>
                            <p className="text-xs text-slate-400">
                                Security settings coming soon.
                            </p>
                        </div>
                    )}
                </div>

                {/* Sign out */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                    >
                        <LogOut size={15} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}