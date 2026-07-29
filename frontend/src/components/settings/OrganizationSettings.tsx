import { useState } from 'react'
import { Save } from 'lucide-react'

const ORG_TYPES = ['Hospital', 'Clinic', 'Laboratory', 'Imaging Center', 'Insurance', 'Other']
const TIMEZONES = ['America/Chicago', 'America/New_York', 'America/Los_Angeles', 'America/Denver', 'UTC']
const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
const LANGUAGES = ['English (US)', 'English (UK)', 'Spanish', 'French']

export default function OrganizationSettings() {
    const [orgName, setOrgName] = useState('St. Mercy General')
    const [orgType, setOrgType] = useState('Hospital')
    const [timezone, setTimezone] = useState('America/Chicago')
    const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')
    const [language, setLanguage] = useState('English (US)')
    const [saved, setSaved] = useState(false)

    function handleSave() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
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
                        SM
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-800">
                            St. Mercy General
                        </div>
                        <div className="text-xs text-slate-400 font-mono">ORG-00142</div>
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
                            <option key={t} value={t}>{t}</option>
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ backgroundColor: saved ? '#059669' : '#0e7490' }}
                >
                    <Save size={14} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}