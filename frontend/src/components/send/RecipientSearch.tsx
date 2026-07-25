import { useState } from 'react'
import { Search, Building2, X } from 'lucide-react'
import type { Organization } from '../../types'

const MOCK_ORGANIZATIONS: Organization[] = [
    { id: 'ORG-00307', name: 'City Lab Partners', type: 'Laboratory', location: 'Chicago, IL' },
    { id: 'ORG-00291', name: 'Riverside Cardiology Group', type: 'Specialty Clinic', location: 'Evanston, IL' },
    { id: 'ORG-00198', name: 'Riverside Medical Center', type: 'Hospital', location: 'Oak Park, IL' },
    { id: 'ORG-00082', name: 'BlueCross Admin Services', type: 'Insurance', location: 'Downers Grove, IL' },
    { id: 'ORG-00156', name: 'RadTech Imaging Center', type: 'Radiology', location: 'Naperville, IL' },
    { id: 'ORG-00044', name: 'Quest Diagnostics', type: 'Laboratory', location: 'Schaumburg, IL' },
    { id: 'ORG-00215', name: 'Northwestern Medicine', type: 'Hospital System', location: 'Chicago, IL' },
    { id: 'ORG-00178', name: 'Advocate Aurora Health', type: 'Hospital System', location: 'Milwaukee, WI' },
]

interface RecipientSearchProps {
    selected: Organization | null
    onSelect: (org: Organization | null) => void
}

export default function RecipientSearch({ selected, onSelect }: RecipientSearchProps) {
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const filtered = MOCK_ORGANIZATIONS.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Recipient Organization *
            </label>

            {selected ? (
                // Selected state
                <div
                    className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                    style={{ backgroundColor: '#f0fdf9', borderColor: '#0e7490' }}
                >
                    <Building2 size={16} style={{ color: '#0e7490' }} />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{selected.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                            {selected.id} · {selected.type} · {selected.location}
                        </div>
                    </div>
                    <button onClick={() => onSelect(null)}>
                        <X size={14} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>
            ) : (
                // Search state
                <div className="relative">
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-slate-50 border border-slate-200">
                        <Search size={14} className="text-slate-400 flex-shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                            placeholder="Search organizations by name or ID…"
                            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
                        />
                    </div>

                    {/* Dropdown */}
                    {isOpen && filtered.length > 0 && (
                        <div className="absolute z-10 w-full rounded-xl mt-1 overflow-hidden bg-white border border-slate-200 shadow-lg">
                            {filtered.map((org) => (
                                <button
                                    key={org.id}
                                    onClick={() => {
                                        onSelect(org)
                                        setSearch('')
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
                                >
                                    <Building2 size={14} style={{ color: '#0e7490' }} />
                                    <div>
                                        <div className="text-sm font-medium text-slate-800">{org.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">
                                            {org.id} · {org.type} · {org.location}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}