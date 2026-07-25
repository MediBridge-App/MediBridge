import { useState } from 'react'
import { Save } from 'lucide-react'

const THEMES = [
    { id: 'light', label: 'Clinical Light' },
    { id: 'dark', label: 'Dark Mode' },
    { id: 'contrast', label: 'High Contrast' },
]

const DENSITIES = [
    { id: 'comfortable', label: 'Comfortable' },
    { id: 'compact', label: 'Compact' },
    { id: 'spacious', label: 'Spacious' },
]

export default function AppearanceSettings() {
    const [theme, setTheme] = useState('light')
    const [density, setDensity] = useState('comfortable')
    const [saved, setSaved] = useState(false)

    function handleSave() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="flex-1 space-y-5">
            <div>
                <h2 className="text-base font-bold text-slate-800">Appearance</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                    Customize how MediBridge looks for your session
                </p>
            </div>

            {/* Theme */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                    {THEMES.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className="rounded-xl p-3 border-2 transition-all text-left"
                            style={{
                                borderColor: theme === t.id ? '#0e7490' : '#e2e8f0',
                                backgroundColor: theme === t.id ? '#f0fdf9' : 'white',
                            }}
                        >
                            {/* Theme preview */}
                            <div
                                className="rounded-lg mb-2 overflow-hidden"
                                style={{
                                    height: 48,
                                    backgroundColor:
                                        t.id === 'dark' ? '#0d1b2a' :
                                            t.id === 'contrast' ? '#000000' : '#f8fafc',
                                }}
                            >
                                <div
                                    className="h-2 mt-2 mx-2 rounded"
                                    style={{
                                        backgroundColor:
                                            t.id === 'dark' ? '#0ea5a0' :
                                                t.id === 'contrast' ? '#ffffff' : '#0e7490',
                                    }}
                                />
                                <div
                                    className="h-1.5 mt-1 mx-2 rounded w-3/4"
                                    style={{
                                        backgroundColor:
                                            t.id === 'dark' ? '#1e3048' :
                                                t.id === 'contrast' ? '#555' : '#e2e8f0',
                                    }}
                                />
                            </div>
                            <span
                                className="text-xs font-medium"
                                style={{ color: theme === t.id ? '#0e7490' : '#64748b' }}
                            >
                                {t.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Density */}
            <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-800">Density</h3>
                <div className="grid grid-cols-3 gap-3">
                    {DENSITIES.map((d) => (
                        <button
                            key={d.id}
                            onClick={() => setDensity(d.id)}
                            className="py-2.5 rounded-xl border text-sm font-medium transition-all"
                            style={{
                                borderColor: density === d.id ? '#0e7490' : '#e2e8f0',
                                backgroundColor: density === d.id ? '#0e7490' : 'white',
                                color: density === d.id ? 'white' : '#64748b',
                            }}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Save */}
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