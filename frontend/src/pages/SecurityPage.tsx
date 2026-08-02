import { useState, useEffect } from 'react'
import SecurityCards from '../components/security/SecurityCards'
import AuthControls from '../components/security/AuthControls'
import UserAccessList from '../components/security/UserAccessList'
import AWSInfrastructure from '../components/security/AWSInfrastructure'
import { usersApi, securityApi } from '../api'

// Shape returned by GET /security/settings
export type SecuritySettings = {
    id: string
    organization_id: string
    mfa_enabled: boolean
    ip_allowlisting_enabled: boolean
    session_timeout_minutes: number
    last_security_scan: string | null
    created_at: string
    updated_at: string
}

// Shape of a single user from GET /users
export type ApiUser = {
    id: string
    full_name: string
    role: string
    specialty: string | null
    npi_number: string | null
    is_active: boolean
    last_login: string | null
}

export default function SecurityPage() {
    const [settings, setSettings] = useState<SecuritySettings | null>(null)
    const [users, setUsers] = useState<ApiUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setIsLoading(true)
        try {
            const [usersData, settingsData] = await Promise.all([
                usersApi.getAll(),
                securityApi.getSettings(),
            ])
            setUsers(usersData)
            setSettings(settingsData)
            setError(false)
        } catch {
            setError(true)
        } finally {
            setIsLoading(false)
        }
    }

    // Persist a settings change — sends the full merged settings object,
    // since PUT /security/settings likely expects the complete shape.
    async function handleSettingsChange(patch: Partial<SecuritySettings>) {
        if (!settings) return
        const updated = { ...settings, ...patch }
        setSettings(updated) // optimistic update
        try {
            const saved = await securityApi.updateSettings(updated)
            setSettings(saved)
        } catch {
            // revert on failure
            setSettings(settings)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl">
                    ⚠️
                </div>
                <p className="text-sm text-slate-600">Failed to load security settings</p>
                <button
                    onClick={fetchData}
                    className="text-xs font-medium px-4 py-2 rounded-lg border border-slate-200"
                    style={{ color: '#0e7490' }}
                >
                    Try again
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-xl font-bold text-slate-900">Security</h2>
                <p className="text-sm text-slate-500 mt-1">
                    HIPAA-compliant security controls and access management
                </p>
            </div>

            <SecurityCards lastScan={settings?.last_security_scan ?? null} />
            {settings && (
                <AuthControls
                    settings={settings}
                    onChange={handleSettingsChange}
                />
            )}
            <UserAccessList users={users} />
            <AWSInfrastructure />
        </div>
    )
}
