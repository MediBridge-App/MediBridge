import {
  Download,
  Eye,
  X,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  Tag,
  Activity,
  CheckCircle2,
} from 'lucide-react'
import type { InboxDocument } from '../../types'

interface InboxDetailProps {
  doc: InboxDocument
  onClose: () => void
}

const categoryColors: Record<string, { color: string; bg: string }> = {
  Laboratory: { color: '#059669', bg: '#d1fae5' },
  Referral: { color: '#7c3aed', bg: '#ede9fe' },
  Discharge: { color: '#0e7490', bg: '#e0f2fe' },
  Insurance: { color: '#d97706', bg: '#fef3c7' },
  Imaging: { color: '#0284c7', bg: '#dbeafe' },
}

export default function InboxDetail({ doc, onClose }: InboxDetailProps) {
  const cat = categoryColors[doc.aiCategory] ?? { color: '#64748b', bg: '#f1f5f9' }

  const timeline = [
    { event: 'Document Uploaded to S3', done: true },
    { event: 'Metadata Saved to Database', done: true },
    { event: 'SNS Event Published', done: true },
    { event: 'Lambda Processing Complete', done: doc.status !== 'uploaded' },
    { event: 'Recipient Notified', done: doc.status !== 'uploaded' },
    { event: 'Document Read by Recipient', done: !doc.isUnread },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white border-l border-slate-200">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-mono text-slate-400">{doc.id}</span>
            <span
              className="rounded px-2 py-0.5 text-xs font-semibold"
              style={{ background: cat.bg, color: cat.color }}
            >
              {doc.aiCategory}
            </span>
            {doc.priority === 'urgent' && (
              <span className="rounded px-2 py-0.5 text-xs font-bold bg-red-50 text-red-600">
                URGENT
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-800 leading-snug">
            {doc.subject}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors">
            <Download size={13} /> Download
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0e7490' }}
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Metadata */}
        <div className="rounded-xl p-4 bg-slate-50 grid grid-cols-2 gap-3">
          {[
            { icon: <Building2 size={13} />, label: 'From', value: doc.from, sub: doc.fromOrg },
            { icon: <Building2 size={13} />, label: 'To', value: doc.to, sub: doc.toOrg },
            { icon: <Calendar size={13} />, label: 'Transmitted', value: doc.time, sub: null },
            { icon: <FileText size={13} />, label: 'Document', value: `${doc.pages} pages · ${doc.size}`, sub: null },
          ].map((m) => (
            <div key={m.label} className="flex items-start gap-2">
              <span className="mt-0.5" style={{ color: '#0e7490' }}>{m.icon}</span>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wide font-mono mb-0.5">
                  {m.label}
                </div>
                <div className="text-xs font-medium text-slate-700">{m.value}</div>
                {m.sub && (
                  <div className="text-xs text-slate-400 font-mono">{m.sub}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, #ede9fe 0%, #e0f2fe 100%)',
            border: '1px solid #c4b5fd',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} style={{ color: '#7c3aed' }} />
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: '#7c3aed' }}
            >
              AI Summary
            </span>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs text-white font-mono"
              style={{ backgroundColor: '#7c3aed' }}
            >
              Auto-generated
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#3730a3' }}>
            {doc.aiSummary}
          </p>
        </div>

        {/* AI Tags */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">
              AI-Suggested Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {doc.aiTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3 py-1 text-xs font-medium border border-slate-200"
                style={{ backgroundColor: '#f8fafc', color: '#0e7490' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={13} style={{ color: '#0e7490' }} />
            <span className="text-xs font-semibold text-slate-700">
              Delivery Timeline
            </span>
          </div>
          <div className="space-y-1.5">
            {timeline.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <div
                  className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 18,
                    height: 18,
                    background: ev.done ? '#d1fae5' : '#f1f5f9',
                    border: `2px solid ${ev.done ? '#059669' : '#e2e8f0'}`,
                  }}
                >
                  {ev.done && <CheckCircle2 size={10} style={{ color: '#059669' }} />}
                </div>
                <span
                  className="flex-1 text-xs"
                  style={{ color: ev.done ? '#0f172a' : '#94a3b8' }}
                >
                  {ev.event}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {ev.done ? doc.time.split(' ')[1] : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}