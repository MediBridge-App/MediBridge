import { Users } from 'lucide-react'
import type { ApiUser } from '../../pages/SecurityPage'

// The real API only sends a `role`, not an "access level" like Full/Standard/
// Limited/Read-only/Admin. Deriving a reasonable display mapping here — adjust
// if the team wants a different grouping.
const roleAccessMap: Record<string, string> = {
    organization_admin: 'Admin',
    provider: 'Full',
    registered_nurse: 'Standard',
    referral_coordinator: 'Limited',
    medical_assistant: 'Read-only',
}

const roleLabelMap: Record<string, string> = {
    organization_admin: 'Administrator',
    provider: 'Physician',
    registered_nurse: 'Registered Nurse',
    referral_coordinator: 'Referral Coordinator',
    medical_assistant: 'Medical Assistant',
}

const accessConfig: Record<string, { color: string; bg: string }> = {
    Full: { color: '#0e7490', bg: '#e0f2fe' },
    Standard: { color: '#059669', bg: '#d1fae5' },
    Limited: { color: '#d97706', bg: '#fef3c7' },
    'Read-only': { color: '#64748b', bg: '#f1f5f9' },
    Admin: { color: '#7c3aed', bg: '#ede9fe' },
}

function getInitials(fullName: string): string {
    const parts = fullName.replace(/^Dr\.\s*/i, '').trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatLastSeen(isoString: string | null): string {
    if (!isoString) return 'Never logged in'
    const date = new Date(isoString)
    return `Last: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`
}

interface UserAccessListProps {
    users: ApiUser[]
}

export default function UserAccessList({ users }: UserAccessListProps) {
    return (
        <div className="rounded-xl bg-white border border-slate-200 p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users size={15} className="text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800">
                        Role-Based Access Control
                    </h3>
                </div>
                <span className="text-xs text-slate-400">{users.length} users</span>
            </div>

            {/* Users */}
            <div className="divide-y divide-slate-100">
                {users.map((user) => {
                    const accessLevel = roleAccessMap[user.role] ?? 'Read-only'
                    const access = accessConfig[accessLevel] ?? accessConfig['Read-only']
                    const roleLabel = roleLabelMap[user.role] ?? user.role

                    return (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 py-3"
                        >
                            {/* Avatar */}
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                style={{ backgroundColor: '#0e7490' }}
                            >
                                {getInitials(user.full_name)}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-800">
                                    {user.full_name}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {roleLabel} · {formatLastSeen(user.last_login)}
                                </div>
                            </div>

                            {/* Access badge */}
                            <span
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: access.bg, color: access.color }}
                            >
                                {accessLevel}
                            </span>

                            {/* Status */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: user.is_active ? '#059669' : '#94a3b8',
                                    }}
                                />
                                <span className="text-xs text-slate-400">
                                    {user.is_active ? 'active' : 'inactive'}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
