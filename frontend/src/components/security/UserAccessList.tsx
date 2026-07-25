import { Users } from 'lucide-react'

const USERS = [
    {
        initials: 'JR',
        name: 'Dr. James Rivera',
        role: 'Physician',
        lastSeen: 'Last: Today, 08:30',
        access: 'Full',
        isActive: true,
    },
    {
        initials: 'DA',
        name: 'Dr. Anita Patel',
        role: 'Physician',
        lastSeen: 'Last: Today, 07:55',
        access: 'Full',
        isActive: true,
    },
    {
        initials: 'DK',
        name: 'Dr. Kevin Walsh',
        role: 'Specialist',
        lastSeen: 'Last: Yesterday, 17:30',
        access: 'Standard',
        isActive: false,
    },
    {
        initials: 'MS',
        name: 'Maria Santos',
        role: 'Referral Coordinator',
        lastSeen: 'Last: Today, 09:02',
        access: 'Limited',
        isActive: true,
    },
    {
        initials: 'TN',
        name: 'Tom Nguyen',
        role: 'Medical Assistant',
        lastSeen: 'Last: Today, 08:45',
        access: 'Read-only',
        isActive: true,
    },
    {
        initials: 'SA',
        name: 'System Admin',
        role: 'Administrator',
        lastSeen: 'Last: Today, 06:00',
        access: 'Admin',
        isActive: true,
    },
]

const accessConfig: Record<string, { color: string; bg: string }> = {
    Full: { color: '#0e7490', bg: '#e0f2fe' },
    Standard: { color: '#059669', bg: '#d1fae5' },
    Limited: { color: '#d97706', bg: '#fef3c7' },
    'Read-only': { color: '#64748b', bg: '#f1f5f9' },
    Admin: { color: '#7c3aed', bg: '#ede9fe' },
}

export default function UserAccessList() {
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
                <span className="text-xs text-slate-400">{USERS.length} users</span>
            </div>

            {/* Users */}
            <div className="divide-y divide-slate-100">
                {USERS.map((user) => {
                    const access = accessConfig[user.access] ?? accessConfig['Read-only']
                    return (
                        <div
                            key={user.name}
                            className="flex items-center gap-3 py-3"
                        >
                            {/* Avatar */}
                            <div
                                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: '#0e7490' }}
                            >
                                {user.initials}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-slate-800">
                                    {user.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {user.role} · {user.lastSeen}
                                </div>
                            </div>

                            {/* Access badge */}
                            <span
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: access.bg, color: access.color }}
                            >
                                {user.access}
                            </span>

                            {/* Status */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{
                                        backgroundColor: user.isActive ? '#059669' : '#94a3b8',
                                    }}
                                />
                                <span className="text-xs text-slate-400">
                                    {user.isActive ? 'active' : 'inactive'}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}