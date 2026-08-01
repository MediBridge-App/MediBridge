import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Shield, Zap, ClipboardList, Eye, EyeOff } from 'lucide-react'
import { signIn, confirmSignIn } from 'aws-amplify/auth'
import { useAuth } from '../hooks/useAuth'



const DEMO_ACCOUNTS = [
    {
        name: 'Dr. James Rivera, MD',
        role: 'Physician',
        org: 'St. Mercy General',
        initials: 'JR',
    },
    {
        name: 'Dr. Sarah Chen, MD',
        role: 'Cardiologist',
        org: 'Riverside Cardiology',
        initials: 'SC',
    },
    {
        name: 'Maria Santos',
        role: 'Referral Coordinator',
        org: 'St. Mercy General',
        initials: 'MS',
    },
]

export default function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [requiresNewPassword, setRequiresNewPassword] = useState(false)
    const { user, isLoading: authLoading } = useAuth()

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true })
        }
    }, [user, authLoading, navigate])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email || !password) return
        setError('')
        setIsLoading(true)
        try {
            if (requiresNewPassword) {
                await confirmSignIn({ challengeResponse: newPassword })
                navigate('/dashboard')
            } else {
                const result = await signIn({ username: email, password })
                if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
                    setRequiresNewPassword(true)
                } else {
                    window.location.href = '/dashboard'  // ← use this instead of navigate()
                }
            }
        } catch (err: unknown) {
            const error = err as { message?: string }
            setError(error.message || 'Invalid email or password')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDemoLogin(initials: string) {
        setError('')
        setIsLoading(true)

        const demoCredentials: Record<string, { email: string; password: string }> = {
            JR: { email: 'j.rivera@stmercy.org', password: 'Demo1234!Pass' },
            SC: { email: 'sarah.chen@riverside.org', password: 'Demo1234!Pass' },
            MS: { email: 'maria.santos@stmercy.org', password: 'Demo1234!Pass' },
        }

        const creds = demoCredentials[initials]
        if (!creds) return

        try {
            await signIn({ username: creds.email, password: creds.password })
            navigate('/dashboard')
        } catch (err: unknown) {
            const error = err as { message?: string }
            setError(error.message || 'Demo login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">

            {/* Left panel */}
            <div
                className="hidden lg:flex w-1/2 flex-col justify-between p-12"
                style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d1b2a 60%, #152238 100%)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: '#0ea5a0' }}
                    >
                        <Activity size={22} className="text-white" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-xl">MediBridge</div>
                        <div
                            className="text-xs tracking-widest font-medium uppercase"
                            style={{ color: '#14b8b3' }}
                        >
                            Secure Exchange
                        </div>
                    </div>
                </div>

                {/* Hero copy */}
                <div className="space-y-4">
                    <h2 className="text-5xl font-bold leading-tight text-white">
                        Replace fax.<br />
                        Secure your{' '}
                        <span style={{ color: '#14b8b3' }}>documents.</span>
                    </h2>
                    <p className="text-slate-400 text-base max-w-sm leading-relaxed">
                        Cloud-native digital document exchange for healthcare organizations.
                        HIPAA-compliant, AI-powered, and built on AWS.
                    </p>
                </div>

                {/* Feature bullets */}
                <div className="space-y-4">
                    {[
                        {
                            icon: <Shield size={18} />,
                            label: 'HIPAA Compliant',
                            sub: 'AES-256 encryption + TLS 1.3 in transit',
                        },
                        {
                            icon: <Zap size={18} />,
                            label: 'AI-Powered Processing',
                            sub: 'Auto-categorize, summarize, and tag documents',
                        },
                        {
                            icon: <ClipboardList size={18} />,
                            label: 'Full Audit Trail',
                            sub: 'Immutable event log for every transmission',
                        },
                    ].map((f) => (
                        <div key={f.label} className="flex items-start gap-3">
                            <div
                                className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center shrink-0"
                                style={{ color: '#14b8b3' }}
                            >
                                {f.icon}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">{f.label}</div>
                                <div className="text-xs text-slate-400">{f.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-slate-600 text-xs">
                    © 2026 MediBridge · HIPAA · SOC 2 Type II · AWS
                </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">
                            Welcome back
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Sign in to your MediBridge account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Work Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@hospital.org"
                                autoComplete="email"
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-xs font-medium"
                                    style={{ color: '#0e7490' }}
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 pr-10 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {requiresNewPassword && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Set New Password
                                </label>
                                <p className="text-xs text-slate-400 mb-2">
                                    Please set a new password for your account
                                </p>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm outline-none"
                                />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-60"
                            style={{ backgroundColor: '#0e7490' }}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            or demo accounts
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Demo accounts */}
                    <div className="space-y-2">
                        {DEMO_ACCOUNTS.map((acct) => (
                            <button
                                key={acct.initials}
                                onClick={() => handleDemoLogin(acct.initials)}
                                disabled={isLoading}
                                className="w-full flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all text-left disabled:opacity-50"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                    style={{ backgroundColor: '#0e7490' }}
                                >
                                    {acct.initials}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-800">
                                        {acct.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {acct.role} · {acct.org}
                                    </div>
                                </div>
                                <svg
                                    className="text-slate-300 shrink-0"
                                    width="16" height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Don't have an account?{' '}
                        <button
                            className="font-semibold"
                            style={{ color: '#0e7490' }}
                        >
                            Request access
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}