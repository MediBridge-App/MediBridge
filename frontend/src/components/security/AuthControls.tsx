import { useState } from 'react'
import { KeyRound, Globe, Clock } from 'lucide-react'

interface ToggleProps {
    enabled: boolean
    onChange: (val: boolean) => void
}

function Toggle({ enabled, onChange }: ToggleProps) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className="relative inline-flex items-center rounded-full transition-colors flex-shrink-0"
            style={{
                width: 44,
                height: 24,
                backgroundColor: enabled ? '#0e7490' : '#e2e8f0',
            }}
        >
            <span
                className="inline-block w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{
                    transform: enabled ? 'translateX(22px)' : 'translateX(2px)',
                }}
            />
        </button>
    )
}

export default function AuthControls() {
    const [mfa, setMfa] = useState(true)
    const [ipAllowlist, setIpAllowlist] = useState(false)
    const [sessionTimeout, setSessionTimeout] = useState(30)

    return (
        <div className="rounded-xl bg-white border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
                Authentication Controls
            </h3>

            <div className="space-y-0 divide-y divide-slate-100">
                {/* MFA */}
                <div className="flex items-center gap-4 py-4">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#f1f5f9' }}
                    >
                        <KeyRound size={16} style={{ color: '#0e7490' }}  />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">
                            Multi-Factor Authentication (MFA)
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            Require MFA for all logins via Amazon Cognito
                        </div>
                    </div>
                    <Toggle enabled={mfa} onChange={setMfa} />
                </div>

                {/* IP Allowlisting */}
                <div className="flex items-center gap-4 py-4">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#f1f5f9' }}
                    >
                        <Globe size={16} style={{ color: '#0e7490' }}  />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">
                            IP Allowlisting
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            Restrict access to approved IP ranges only
                        </div>
                    </div>
                    <Toggle enabled={ipAllowlist} onChange={setIpAllowlist} />
                </div>

                {/* Session Timeout */}
                <div className="flex items-center gap-4 py-4">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#f1f5f9' }}
                    >
                        <Clock size={16} style={{ color: '#0e7490' }}  />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">
                            Session Timeout
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            Auto-logout after inactivity
                        </div>
                    </div>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                        {[15, 30, 60].map((t) => (
                            <button
                                key={t}
                                onClick={() => setSessionTimeout(t)}
                                className="px-3 py-1.5 font-medium transition-colors"
                                style={{
                                    backgroundColor: sessionTimeout === t ? '#0d1b2a' : 'white',
                                    color: sessionTimeout === t ? 'white' : '#64748b',
                                }}
                            >
                                {t}m
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}