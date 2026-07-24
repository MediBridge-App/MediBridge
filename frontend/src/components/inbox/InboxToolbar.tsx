import { Search, X, Filter } from 'lucide-react'

interface InboxToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onFilterChange: (value: string) => void
  unreadCount: number
  totalCount: number
}

export default function InboxToolbar({
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
  unreadCount,
  totalCount,
}: InboxToolbarProps) {
  return (
    <div className="px-5 py-4 border-b border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">Inbox</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {unreadCount} unread · {totalCount} total
          </p>
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white bg-red-500">
          {unreadCount}
        </span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 bg-slate-50 border border-slate-200">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search documents, senders, IDs…"
          className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400"
        />
        {search && (
          <button onClick={() => onSearchChange('')}>
            <X size={13} className="text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={13} className="text-slate-400 flex-shrink-0" />
        <div className="flex gap-1.5">
          {['all', 'pending', 'delivered', 'read'].map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange(s)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: filterStatus === s ? '#0e7490' : '#f1f5f9',
                color: filterStatus === s ? '#fff' : '#64748b',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}