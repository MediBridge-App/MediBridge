import { useState, useEffect } from 'react'
import { Search, Building2, X } from 'lucide-react'
import type { Organization } from '../../types'
import { organizationsApi } from '../../api'

// Shape of a single org from GET /organizations — field names per the
// OpenAPI schema, not yet verified against a real response (same caveat
// as the org lookup we built for Inbox). Adjust if real data differs.
type ApiOrganization = {
    id: string
    name: string
    org_code?: string
    type?: string
    location?: string
}

function mapOrg(o: ApiOrganization): Organization {
    return {
        id: o.id,
        name: o.name,
        orgCode: o.org_code,
        type: o.type ?? 'Healthcare Organization',
        location: o.location,
    }
}

interface RecipientSearchProps {
    selected: Organization | null
    onSelect: (org: Organization | null) => void
}

export default function RecipientSearch({ selected, onSelect }: RecipientSearchProps) {
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchOrgs() {
            setIsLoading(true)
            try {
                const data: ApiOrganization[] = await organizationsApi.getAll()
                setOrganizations((data ?? []).map(mapOrg))
                setError(false)
            } catch {
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOrgs()
    }, [])

    const filtered = organizations.filter((o) =>
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
                            {selected.orgCode ?? selected.id}
                            {selected.type ? ` · ${selected.type}` : ''}
                            {selected.location ? ` · ${selected.location}` : ''}
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
                        <Search size={14} className="text-slate-400 shrink-0" />
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value)
                                setIsOpen(true)
                            }}
                            onFocus={() => setIsOpen(true)}
                            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                            placeholder={isLoading ? 'Loading organizations…' : 'Search organizations by name or ID…'}
                            disabled={isLoading}
                            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 mt-1.5">
                            Couldn't load organizations. Try refreshing the page.
                        </p>
                    )}

                    {/* Dropdown */}
                    {isOpen && !isLoading && filtered.length > 0 && (
                        <div className="absolute z-10 w-full rounded-xl mt-1 overflow-hidden bg-white border border-slate-200 shadow-lg max-h-64 overflow-y-auto">
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
                                            {org.orgCode ?? org.id}
                                            {org.type ? ` · ${org.type}` : ''}
                                            {org.location ? ` · ${org.location}` : ''}
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
