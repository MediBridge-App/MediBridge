import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main
                className="flex-1 overflow-y-auto bg-slate-50"
                style={{ marginLeft: '240px' }}
            >
                <Outlet />
            </main>
        </div>
    )
}