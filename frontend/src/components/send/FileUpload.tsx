import { useRef, useState } from 'react'
import { Upload, File as FileIcon, X } from 'lucide-react'

interface FileUploadProps {
    file: File | null
    onFileChange: (file: File | null) => void
}

function formatSize(bytes: number): string {
    return (bytes / 1024).toFixed(0) + ' KB'
}

export default function FileUpload({ file, onFileChange }: FileUploadProps) {
    const [dragging, setDragging] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    function handleFileDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) onFileChange(f)
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        if (f) onFileChange(f)
    }

    return (
        <div className="rounded-xl p-5 bg-white border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
                Attach Document *
            </label>

            {file ? (
                // File selected state
                <div
                    className="flex items-center gap-3 rounded-lg px-4 py-3 border"
                    style={{ backgroundColor: '#f0fdf9', borderColor: '#0e7490' }}
                >
                    <div
                        className="rounded-lg flex items-center justify-center shrink-0"
                        style={{ width: 36, height: 36, backgroundColor: '#0e749020' }}
                    >
                        <FileIcon size={16} style={{ color: '#0e7490' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                            {file.name}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">{formatSize(file.size)}</div>
                    </div>
                    <button onClick={() => onFileChange(null)}>
                        <X size={14} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>
            ) : (
                // Drop zone
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl py-10 cursor-pointer transition-all"
                    style={{
                        border: `2px dashed ${dragging ? '#0e7490' : '#e2e8f0'}`,
                        backgroundColor: dragging ? '#f0fdf9' : '#f8fafc',
                    }}
                >
                    <Upload
                        size={24}
                        style={{ color: dragging ? '#0e7490' : '#94a3b8' }}
                    />
                    <div className="text-center">
                        <div className="text-sm font-semibold text-slate-700">
                            Drop file here or click to browse
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                            PDF, PNG, JPG up to 50MB
                        </div>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            )}
        </div>
    )
}
