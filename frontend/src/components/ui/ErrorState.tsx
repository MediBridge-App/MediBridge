interface ErrorStateProps {
    message?: string
    onRetry?: () => void
}

export default function ErrorState({
    message = 'Something went wrong.',
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: '#fee2e2' }}
            >
                ⚠️
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-700">
                    Failed to load data
                </h3>
                <p className="text-xs text-slate-400 mt-1">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    style={{ color: '#0e7490' }}
                >
                    Try again
                </button>
            )}
        </div>
    )
}