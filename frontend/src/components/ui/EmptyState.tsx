import type { ReactNode } from 'react'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description?: string
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#f1f5f9' }}
            >
                <span className="text-slate-400">{icon}</span>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
                {description && (
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
                )}
            </div>
        </div>
    )
}