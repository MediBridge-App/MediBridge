interface TopBarProps {
    title: string
}

export default function TopBar({ title }: TopBarProps) {
    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <h1 className="text-base font-semibold text-slate-700">{title}</h1>

            <div className="flex items-center gap-3">
                {/* ENV badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs text-slate-600 font-medium">
                    <span className="text-slate-400">ENV:</span>
                    <span className="font-semibold">AWS</span>
                    <span className="text-slate-300">·</span>
                    <span>us-east-1</span>
                </div>

                {/* ECS Fargate status */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ECS Fargate · Healthy
                </div>
            </div>
        </div>
    )
}