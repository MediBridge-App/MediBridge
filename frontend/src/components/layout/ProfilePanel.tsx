import { useState } from 'react'
import { X, Camera, LogOut, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'aws-amplify/auth'
import { useAuth } from '../../hooks/useAuth'

interface ProfilePanelProps {
    onClose: () => void
}

const TABS = ['Profile', 'Preferences', 'Security'] as const
type Tab = typeof TABS[number]

// Same role -> display label mapping used in Security's UserAccessList,
// since the backend only sends the raw role value (e.g. "provider").
const roleLabelMap: Record<string, string> = {
    organization_admin: 'Administrator',
    provider: 'Physician',
    registered_nurse: 'Registered Nurse',
    referral_coordinator: 'Referral Coordinator',
    medical_assistant: 'Medical Assistant',
}

function formatLastLogin(isoString: string | null): string {
    if (!isoString) return 'Not available'
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<Tab>('Profile')

    const roleLabel = user?.role ? (roleLabelMap[user.role] ?? user.role) : '...'

    async function handleSignOut() {
        try {
            await signOut()
        } catch (err) {
            console.error('Sign out error:', err)
        }
        onClose()
        navigate('/login')
    }

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            onClick={onClose}
            style={{ zIndex: 9999 }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Panel */}
            <div
                className="relative flex flex-col bg-white shadow-2xl overflow-hidden"
                style={{ width: 380 }}
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
                            {user?.initials
                                ? user.initials
                                : <UserCircle size={40} className="text-white" />
                            }
                        </div>
                        <button
                            className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: '#0e7490' }}
                        >
                            <Camera size={12} />
                        </button>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                        {user?.fullName || 'Loading...'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                        {roleLabel}{user?.specialty ? ` · ${user.specialty}` : ''}
                    </div>
                    <div
                        className="text-xs font-medium mt-1"
                        style={{ color: '#0e7490' }}
                    >
                        {user?.organizationName || '...'}
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
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Personal Information
                            </h3>

                            {[
                                { label: 'Full Name', value: user?.fullName || '...' },
                                { label: 'Work Email', value: user?.email || '...' },
                                { label: 'Role', value: roleLabel },
                                { label: 'Organization', value: user?.organizationName || '...' },
                                { label: 'Specialty', value: user?.specialty || 'Not specified' },
                                { label: 'NPI Number', value: user?.npiNumber || 'Not on file' },
                                { label: 'Organization ID', value: user?.orgCode || '...' },
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

                            <div className="text-xs text-slate-400 font-mono py-2">
                                Last login: {formatLastLogin(user?.lastLogin ?? null)}
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
