import type { ReactNode } from 'react'

interface StatCardProps {
    label: string
    value: number
    change: number
    icon: ReactNode
    iconBg?: string
}

export default function StatCard({ label, value, change, icon, iconBg }: StatCardProps) {
    const isPositive = change >= 0

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500 font-medium">{label}</span>
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: iconBg || '#f1f5f9' }}
                >
                    {icon}
                </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
                {value.toLocaleString()}
            </div>
            <div className={`text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                <span>{isPositive ? '↗' : '↘'}</span>
                <span>{isPositive ? '+' : ''}{change}% vs last week</span>
            </div>
        </div>
    )
}