import { Building2 } from 'lucide-react'

export default function SendSidebar() {
    return (
        <div className="space-y-6">

            {/* Sending From */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Sending From
                </p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#e0f2fe' }}
                    >
                        <Building2 size={16} style={{ color: '#0e7490' }} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-800">
                            St. Mercy General
                        </div>
                        <div className="text-xs text-slate-400 font-mono">ORG-00142</div>
                    </div>
                </div>
            </div>

            {/* Today's Sent */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Today's Sent
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center">
                        <div
                            className="text-2xl font-bold"
                            style={{ color: '#0e7490' }}
                        >
                            12
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Documents</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center">
                        <div
                            className="text-2xl font-bold"
                            style={{ color: '#0e7490' }}
                        >
                            7
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">Orgs Reached</div>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Tips
                </p>
                <div className="space-y-2">
                    {[
                        'Use specific subjects to help recipients find documents faster.',
                        'AI will auto-categorize and summarize your document upon delivery.',
                        'All transmissions are automatically added to the audit trail.',
                    ].map((tip, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200"
                        >
                            <span
                                className="text-xs font-bold font-mono flex-shrink-0"
                                style={{ color: '#0e7490' }}
                            >
                                0{i + 1}
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed">{tip}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}