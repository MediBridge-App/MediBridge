import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/inbox': 'Inbox',
    '/send': 'Send Document',
    '/audit': 'Audit Trail',
    '/ai-analysis': 'AI Analysis',
    '/notifications': 'Notifications',
    '/security': 'Security',
    '/settings': 'Settings',
}

export default function AppLayout() {
    const location = useLocation()
    const title = PAGE_TITLES[location.pathname] || 'MediBridge'

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div
                className="flex-1 flex flex-col overflow-hidden"
                style={{ marginLeft: '240px' }}
            >
                <TopBar title={title} />
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}