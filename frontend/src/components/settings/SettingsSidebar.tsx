import {
    Building2,
    Palette,
    Bell,
    Cloud,
    Database,
    Zap,
} from 'lucide-react'

type SettingsSection =
    | 'organization'
    | 'appearance'
    | 'notifications'
    | 'aws'
    | 'data'
    | 'api'

interface SettingsSidebarProps {
    active: SettingsSection
    onChange: (section: SettingsSection) => void
}

const SECTIONS = [
    { id: 'organization' as const, label: 'Organization', icon: <Building2 size={15} /> },
    { id: 'appearance' as const, label: 'Appearance', icon: <Palette size={15} /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'aws' as const, label: 'AWS Integrations', icon: <Cloud size={15} /> },
    { id: 'data' as const, label: 'Data & Retention', icon: <Database size={15} /> },
    { id: 'api' as const, label: 'API & Webhooks', icon: <Zap size={15} /> },
]

export default function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
    return (
        <div className="w-56 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Settings
            </p>
            <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => onChange(s.id)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                        style={{
                            backgroundColor: active === s.id ? '#e0f2fe' : 'transparent',
                            color: active === s.id ? '#0e7490' : '#64748b',
                            fontWeight: active === s.id ? 600 : 400,
                        }}
                    >
                        {s.icon}
                        {s.label}
                    </button>
                ))}
            </nav>
        </div>
    )
}