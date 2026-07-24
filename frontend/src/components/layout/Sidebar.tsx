import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Inbox,
    Send,
    ClipboardList,
    BrainCircuit,
    Bell,
    Shield,
    Settings,
    Activity,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useInbox } from '../../hooks/useInbox';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/inbox', label: 'Inbox', icon: <Inbox size={18} /> },
    { to: '/send', label: 'Send Document', icon: <Send size={18} /> },
    { to: '/audit', label: 'Audit Trail', icon: <ClipboardList size={18} /> },
    { to: '/ai-analysis', label: 'AI Analysis', icon: <BrainCircuit size={18} /> },
    { to: '/notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { to: '/security', label: 'Security', icon: <Shield size={18} /> },
]

const systemItems = [
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
]

export default function Sidebar() {
    const { unreadCount } = useInbox()

    return (
        <aside
            className="fixed left-0 top-0 h-screen w-60 flex flex-col"
            style={{ backgroundColor: '#0d1b2a' }}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#0ea5a0' }}
                >
                    <Activity size={18} className="text-white" />
                </div>
                <div>
                    <div className="text-white font-bold text-base">MediBridge</div>
                    <div
                        className="text-xs tracking-widest font-medium uppercase"
                        style={{ color: '#14b8b3' }}
                    >
                        Secure Exchange
                    </div>
                </div>
            </div>

            {/* Organization */}
            <div className="px-4 py-3 border-b border-white/10">
                <div className="text-white text-sm font-medium">St. Mercy Clinic</div>
                <div className="text-xs" style={{ color: '#64748b' }}>ORG-STMERCY</div>
            </div>

            {/* Main nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2"
                    style={{ color: '#475569' }}>
                    Main
                </p>
                <ul className="space-y-0.5 mb-6">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    )
                                }
                                style={({ isActive }) =>
                                    isActive ? { backgroundColor: 'rgba(14,165,160,0.2)' } : {}
                                }
                            >
                                {item.icon}
                                <span className="flex-1">{item.label}</span>
                                {item.to === '/inbox' && unreadCount > 0 && (
                                    <span
                                        className="rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white"
                                        style={{ backgroundColor: '#0ea5a0' }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                                {item.to === '/notifications' && (
                                    <span
                                        className="rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white"
                                        style={{ backgroundColor: '#0ea5a0' }}
                                    >
                                        2
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2"
                    style={{ color: '#475569' }}>
                    System
                </p>
                <ul className="space-y-0.5">
                    {systemItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`
                                }
                                style={({ isActive }) =>
                                    isActive ? { backgroundColor: 'rgba(14,165,160,0.2)' } : {}
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User footer */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: '#0ea5a0' }}
                    >
                        JR
                    </div>
                    <div>
                        <div className="text-white text-sm font-medium">Dr. James Rivera</div>
                        <div className="text-xs" style={{ color: '#64748b' }}>provider</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}