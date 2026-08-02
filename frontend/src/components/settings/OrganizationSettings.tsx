import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { organizationsApi } from '../../api'
import { useAuth } from '../../hooks/useAuth'

const ORG_TYPES = ['hospital', 'clinic', 'laboratory', 'imaging_center', 'insurance', 'other']
const ORG_TYPE_LABELS: Record<string, string> = {
    hospital: 'Hospital',
    clinic: 'Clinic',
    laboratory: 'Laboratory',
    imaging_center: 'Imaging Center',
    insurance: 'Insurance',
    other: 'Other',
}
const TIMEZONES = ['America/Chicago', 'America/New_York', 'America/Los_Angeles', 'America/Denver', 'UTC']
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const LANGUAGES = ['English (US)', 'English (UK)', 'Spanish', 'French']

// Confirmed via a real GET /organizations/{id} response — all these fields
// are real, including timezone/date_format/language (initially assumed
// these didn't exist and removed them; they're genuinely there).
type ApiOrganization = {
    id: string
    name: string
    org_code: string
    type: string
    timezone: string
    date_format: string
    language: string
    created_at?: string
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export default function OrganizationSettings() {
    const { user } = useAuth()
    const [orgName, setOrgName] = useState('')
    const [orgType, setOrgType] = useState('clinic')
    const [orgCode, setOrgCode] = useState('')
    const [timezone, setTimezone] = useState('America/Chicago')
    const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
    const [language, setLanguage] = useState('English (US)')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        async function fetchOrg() {
            if (!user?.organizationId) {
                setIsLoading(false)
                return
            }
            setIsLoading(true)
            try {
                const data: ApiOrganization = await organizationsApi.getById(user.organizationId)
                setOrgName(data.name ?? '')
                setOrgType(data.type ?? 'clinic')
                setOrgCode(data.org_code ?? '')
                setTimezone(data.timezone ?? 'America/Chicago')
                setDateFormat(data.date_format ?? 'MM/DD/YYYY')
                setLanguage(data.language ?? 'English (US)')
                setError(false)
            } catch {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrg()
    }, [user?.organizationId])

    async function handleSave() {
        if (!user?.organizationId) return
        setSaving(true)
        try {
            await organizationsApi.update(user.organizationId, {
                name: orgName,
                type: orgType,
                timezone,
                date_format: dateFormat,
                language,
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error('Failed to save organization settings:', err)
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: '#0e7490' }}
                />
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-5">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold text-slate-800">Organization</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Configure your organization's profile and regional settings
                </p>
            </div>

            {error && (
                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                    Couldn't load organization settings. Try refreshing the page.
                </div>
            )}

            {/* Organization Profile */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">
                    Organization Profile
                </h3>

                {/* Org avatar */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: '#0e7490' }}
                    >
                        {orgName ? getInitials(orgName) : '...'}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800">
                            {orgName || '...'}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{orgCode || '...'}</div>
                    </div>
                </div>

                {/* Org name */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Organization Name
                    </label>
                    <input
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none"
                    />
                </div>

                {/* Org type */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Organization Type
                    </label>
                    <select
                        value={orgType}
                        onChange={(e) => setOrgType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none appearance-none cursor-pointer"
                    >
                        {ORG_TYPES.map((t) => (
                            <option key={t} value={t}>{ORG_TYPE_LABELS[t]}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Regional Settings */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">
                    Regional Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* Timezone */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Timezone
                        </label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none appearance-none cursor-pointer"
                        >
                            {TIMEZONES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date format */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Date Format
                        </label>
                        <select
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none appearance-none cursor-pointer"
                        >
                            {DATE_FORMATS.map((f) => (
                                <option key={f} value={f}>{f}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Language */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 outline-none appearance-none cursor-pointer"
                        style={{ maxWidth: 280 }}
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                    style={{ backgroundColor: saved ? '#059669' : '#0e7490' }}
                >
                    <Save size={14} />
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
