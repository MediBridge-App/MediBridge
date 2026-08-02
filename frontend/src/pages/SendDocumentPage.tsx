import { useState } from 'react'
import type { Organization } from '../types'
import StepIndicator from '../components/send/StepIndicator'
import RecipientSearch from '../components/send/RecipientSearch'
import DocumentForm from '../components/send/DocumentForm'
import FileUpload from '../components/send/FileUpload'
import ReviewStep from '../components/send/ReviewStep'
import SentStep from '../components/send/SentStep'
import SendSidebar from '../components/send/SendSidebar'
import { documentsApi } from '../api'
import { Lock, Send } from 'lucide-react'

type Step = 1 | 2 | 3

// Shape returned by POST /documents/send (DocumentResponse)
type SentDocument = {
    id: string
    tx_ref: string
    status: string
}

export default function SendDocumentPage() {
    const [step, setStep] = useState<Step>(1)
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
    const [docType, setDocType] = useState('')
    const [subject, setSubject] = useState('')
    const [priority, setPriority] = useState('normal')
    const [notes, setNotes] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [sending, setSending] = useState(false)
    const [sendError, setSendError] = useState<string | null>(null)
    const [sentDocument, setSentDocument] = useState<SentDocument | null>(null)

    const canProceed = selectedOrg && docType && subject && file

    async function handleSend() {
        if (!selectedOrg || !file) return
        setSending(true)
        setSendError(null)

        try {
            // Step 1: get a presigned upload URL for this file
            const uploadData = await documentsApi.getUploadUrl({
                filename: file.name,
                content_type: file.type || 'application/octet-stream',
            })
            const { upload_url, s3_key } = uploadData

            // Step 2: PUT the actual file bytes to S3.
            // Headers here must match exactly what the backend signed the
            // URL with (Content-Type + ServerSideEncryption), or S3 will
            // reject the upload with a signature mismatch — this is a
            // direct-to-S3 request, not through our API client, since it
            // needs no auth header and a different base URL.
            const uploadResponse = await fetch(upload_url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-amz-server-side-encryption': 'aws:kms',
                },
                body: file,
            })

            if (!uploadResponse.ok) {
                throw new Error(`S3 upload failed with status ${uploadResponse.status}`)
            }

            // Step 3: create the document record now that the file exists in S3
            const document: SentDocument = await documentsApi.send({
                recipient_org_id: selectedOrg.id,
                file_s3_key: s3_key,
                original_filename: file.name,
                file_size: file.size,
                document_type: docType,
                subject,
                priority,
                notes: notes || null,
            })

            setSentDocument(document)
            setStep(3)
        } catch (err) {
            console.error('Send document failed:', err)
            setSendError(
                err instanceof Error
                    ? `Failed to send document: ${err.message}`
                    : 'Failed to send document. Please try again.'
            )
        } finally {
            setSending(false)
        }
    }

    function handleReset() {
        setStep(1)
        setSelectedOrg(null)
        setDocType('')
        setSubject('')
        setPriority('normal')
        setNotes('')
        setFile(null)
        setSendError(null)
        setSentDocument(null)
    }

    return (
        <div className="flex h-full">

            {/* Left — Form */}
            <div className="flex-1 overflow-y-auto p-6 " style={{ background: "#f0f4f8" }}>
                <div className="max-w-2xl space-y-5">

                    {/* Header */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Send Document
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Securely transmit to any registered healthcare organization
                        </p>
                    </div>

                    {/* Step indicator */}
                    <StepIndicator currentStep={step} />

                    {/* Step 1 — Compose */}
                    {step === 1 && (
                        <>
                            <RecipientSearch
                                selected={selectedOrg}
                                onSelect={setSelectedOrg}
                            />
                            <DocumentForm
                                docType={docType}
                                subject={subject}
                                priority={priority}
                                notes={notes}
                                onDocTypeChange={setDocType}
                                onSubjectChange={setSubject}
                                onPriorityChange={setPriority}
                                onNotesChange={setNotes}
                            />
                            <FileUpload
                                file={file}
                                onFileChange={setFile}
                            />

                            {/* Security notice */}
                            <div
                                className="flex items-start gap-3 rounded-xl px-4 py-3"
                                style={{ backgroundColor: '#f0fdf4', border: '1px solid #a7f3d0' }}
                            >
                                <Lock size={14} style={{ color: '#059669', marginTop: 2 }} />
                                <p className="text-xs leading-relaxed" style={{ color: '#065f46' }}>
                                    All transmissions are encrypted with AES-256 at rest and
                                    TLS 1.3 in transit. Each delivery is logged to the
                                    immutable audit trail.
                                </p>
                            </div>

                            {/* Review & Send button */}
                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceed}
                                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    backgroundColor: canProceed ? '#0e7490' : '#e2e8f0',
                                    color: canProceed ? '#fff' : '#94a3b8',
                                    cursor: canProceed ? 'pointer' : 'not-allowed',
                                }}
                            >
                                Review & Send <Send size={15} />
                            </button>
                        </>
                    )}

                    {/* Step 2 — Review */}
                    {step === 2 && selectedOrg && file && (
                        <>
                            {sendError && (
                                <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-sm text-red-700">
                                    {sendError}
                                </div>
                            )}
                            <ReviewStep
                                selectedOrg={selectedOrg}
                                docType={docType}
                                subject={subject}
                                priority={priority}
                                file={file}
                                sending={sending}
                                onBack={() => setStep(1)}
                                onConfirm={handleSend}
                            />
                        </>
                    )}

                    {/* Step 3 — Sent */}
                    {step === 3 && selectedOrg && sentDocument && (
                        <SentStep
                            selectedOrg={selectedOrg}
                            docType={docType}
                            priority={priority}
                            txRef={sentDocument.tx_ref}
                            onReset={handleReset}
                        />
                    )}

                </div>
            </div>

            {/* Right — Sidebar */}
            <div className="w-72 shrink-0 border-l overflow-y-auto p-5 flex flex-col gap-4" style={{ borderColor: "#e2e8f0", background: "#ffffff" }}>
                <SendSidebar />
            </div>

        </div>
    )
}
