from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from uuid import UUID
from datetime import datetime
import uuid

from database import get_db

from dependencies.auth import get_current_user

from models.document import Document
from models.ai_analysis import AIAnalysis

from schemas.document import (
    DocumentCreate,
    DocumentResponse,
    UploadURLRequest,
    DocumentStatusUpdate
)

from services.audit import create_audit_log
from services.s3 import (
    generate_presigned_upload_url,
    generate_presigned_download_url
)

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# ==================================================
# GET INBOX DOCUMENTS
# ==================================================

@router.get(
    "/inbox",
    response_model=list[DocumentResponse]
)
def get_inbox(
    status: str | None = None,
    type: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:
        query = (
            db.query(
                Document,
                AIAnalysis.urgency_detected
            )
            .outerjoin(
                AIAnalysis,
                AIAnalysis.document_id == Document.id
            )
            .filter(
                Document.recipient_org_id == current_user.organization_id
            )
        )

        if status:
            query = query.filter(
                Document.status == status
            )

        if type:
            query = query.filter(
                Document.document_type == type
            )

        if priority:
            query = query.filter(
                Document.priority == priority
            )

        if search:
            query = query.filter(
                Document.subject.ilike(f"%{search}%")
            )

        results = query.all()

        return [
            {
                **{
                    key: value
                    for key, value in document.__dict__.items()
                    if key != "_sa_instance_state"
                },
                "urgency_detected": urgency_detected
            }
            for document, urgency_detected in results
        ]

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve inbox documents"
        )


# ==================================================
# GET SENT DOCUMENTS
# ==================================================

@router.get(
    "/sent",
    response_model=list[DocumentResponse]
)
def get_sent(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:
        return (
            db.query(Document)
            .filter(
                Document.sender_org_id == current_user.organization_id
            )
            .all()
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve sent documents"
        )


# ==================================================
# SEARCH DOCUMENTS
# ==================================================

@router.get(
    "/search",
    response_model=list[DocumentResponse]
)
def search_documents(
    q: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:
        return (
            db.query(Document)
            .filter(
                (
                    (Document.recipient_org_id == current_user.organization_id)
                    |
                    (Document.sender_org_id == current_user.organization_id)
                ),
                Document.subject.isnot(None),
                Document.subject.ilike(f"%{q}%")
            )
            .all()
        )

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to search documents"
        )


# ==================================================
# GET SINGLE DOCUMENT
# ==================================================

@router.get(
    "/{doc_id}",
    response_model=DocumentResponse
)
def get_document(
    doc_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        document = (
            db.query(Document)
            .filter(
                Document.id == doc_id,
                (
                    (Document.sender_org_id == current_user.organization_id)
                    |
                    (Document.recipient_org_id == current_user.organization_id)
                )
            )
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found or access denied"
            )

        return document

    except HTTPException:
        raise

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve document"
        )

@router.get("/{doc_id}/download-url")
def get_download_url(
    doc_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        document = (
            db.query(Document)
            .filter(
                Document.id == doc_id,
                (
                    (Document.sender_org_id == current_user.organization_id)
                    |
                    (Document.recipient_org_id == current_user.organization_id)
                )
            )
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found or access denied"
            )

        result = generate_presigned_download_url(
            document.file_s3_key
        )

        return {
            **result,
            "filename": document.original_filename
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate download URL"
        )
    
# ==================================================
# SEND DOCUMENT
# ==================================================

@router.post(
    "/send",
    response_model=DocumentResponse
)
def send_document(
    document: DocumentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    new_document = Document(
        tx_ref=f"TX-{uuid.uuid4().hex[:6].upper()}",
        sender_org_id=current_user.organization_id,
        recipient_org_id=document.recipient_org_id,
        uploaded_by_user_id=current_user.id,
        file_s3_key=document.file_s3_key,
        original_filename=document.original_filename,
        file_size=document.file_size,
        document_type=document.document_type,
        subject=document.subject,
        priority=document.priority,
        status="uploaded",
        notes=document.notes
    )

    try:

        db.add(new_document)

        db.flush()

        create_audit_log(
            db=db,
            event_type="document_sent",
            action="Document sent",
            document_id=new_document.id,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            details={
                "document_type": new_document.document_type,
                "subject": new_document.subject
            }
        )

        db.commit()

        db.refresh(new_document)

        return new_document

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to send document"
        )


# ==================================================
# UPDATE DOCUMENT STATUS
# ==================================================

@router.put(
    "/{doc_id}/status",
    response_model=DocumentResponse
)
def update_document_status(
    doc_id: UUID,
    body: DocumentStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        document = (
            db.query(Document)
            .filter(
                Document.id == doc_id
            )
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )


        allowed_statuses = [
            "uploaded",
            "ocr_complete",
            "ocr_failed",
            "classified",
            "routed",
            "delivered"
        ]


        if body.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid document status"
            )


        old_status = document.status


        if old_status == body.status:
            return document


        document.status = body.status


        if body.status == "delivered":
            document.delivered_at = datetime.utcnow()


        create_audit_log(
            db=db,
            event_type="document_status_changed",
            action="Document status updated",
            document_id=document.id,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            details={
                "old_status": old_status,
                "new_status": body.status
            }
        )


        db.commit()

        db.refresh(document)

        return document


    except HTTPException:
        raise

    except SQLAlchemyError:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update document status"
        )


# ==================================================
# CREATE S3 UPLOAD URL
# ==================================================

@router.post(
    "/upload-url"
)
def create_upload_url(
    request: UploadURLRequest,
    current_user=Depends(get_current_user)
):

    try:

        return generate_presigned_upload_url(
            request.filename,
            request.content_type
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Unable to generate upload URL"
        )