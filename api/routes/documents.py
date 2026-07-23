from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
import uuid

from database import get_db
from models.document import Document
from schemas.document import (
    DocumentCreate,
    DocumentResponse,
    UploadURLRequest,
    DocumentStatusUpdate
)

from services.audit import create_audit_log
from services.s3 import generate_presigned_upload_url


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


# ==================================================
# GET INBOX DOCUMENTS
# GET /documents/inbox
# ==================================================

@router.get(
    "/inbox",
    response_model=list[DocumentResponse]
)
def get_inbox(
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_org_id = UUID(
        "22222222-2222-2222-2222-222222222222"
    )

    return (
        db.query(Document)
        .filter(
            Document.recipient_org_id == current_org_id
        )
        .all()
    )



# ==================================================
# GET SENT DOCUMENTS
# GET /documents/sent
# ==================================================

@router.get(
    "/sent",
    response_model=list[DocumentResponse]
)
def get_sent(
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    current_org_id = UUID(
        "11111111-1111-1111-1111-111111111111"
    )

    return (
        db.query(Document)
        .filter(
            Document.sender_org_id == current_org_id
        )
        .all()
    )



# ==================================================
# GET SINGLE DOCUMENT
# GET /documents/{id}
# ==================================================

@router.get(
    "/{doc_id}",
    response_model=DocumentResponse
)
def get_document(
    doc_id: UUID,
    db: Session = Depends(get_db)
):

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

    return document



# ==================================================
# SEND DOCUMENT
# POST /documents/send
# ==================================================

@router.post(
    "/send",
    response_model=DocumentResponse
)
def send_document(
    document: DocumentCreate,
    db: Session = Depends(get_db)
):

    # Temporary until authentication
    sender_org_id = UUID(
        "11111111-1111-1111-1111-111111111111"
    )

    uploaded_by_user_id = UUID(
        "33333333-3333-3333-3333-333333333333"
    )


    new_document = Document(

        tx_ref=f"TX-{uuid.uuid4().hex[:4].upper()}",

        sender_org_id=sender_org_id,

        recipient_org_id=document.recipient_org_id,

        uploaded_by_user_id=uploaded_by_user_id,

        file_s3_key=document.file_s3_key,

        original_filename=document.original_filename,

        file_size=document.file_size,

        document_type=document.document_type,

        subject=document.subject,

        priority=document.priority,

        status="uploaded",

        notes=document.notes
    )


    db.add(new_document)

    db.commit()

    db.refresh(new_document)


    # Create audit event
    create_audit_log(

        db=db,

        event_type="document_sent",

        action="Document sent",

        document_id=new_document.id,

        user_id=uploaded_by_user_id,

        organization_id=sender_org_id,

        details={
            "document_type": new_document.document_type,
            "subject": new_document.subject
        }
    )


    db.commit()


    return new_document



# ==================================================
# UPDATE DOCUMENT STATUS
# PUT /documents/{id}/status
# ==================================================

@router.put(
    "/{doc_id}/status",
    response_model=DocumentResponse
)
def update_document_status(
    doc_id: UUID,
    body: DocumentStatusUpdate,
    db: Session = Depends(get_db)
):

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

    document.status = body.status


    if body.status == "delivered":
        document.delivered_at = datetime.utcnow()


    create_audit_log(

    db=db,

    event_type="document_status_changed",

    action="Document status updated",

    document_id=document.id,

    user_id=UUID(
        "33333333-3333-3333-3333-333333333333"
    ),

    organization_id=document.recipient_org_id,

    details={
        "old_status": old_status,
        "new_status": body.status
    }
)


    db.commit()

    db.refresh(document)


    return document



# ==================================================
# CREATE S3 UPLOAD URL
# POST /documents/upload-url
# ==================================================

@router.post("/upload-url")
def create_upload_url(
    request: UploadURLRequest
):

    return generate_presigned_upload_url(
        request.filename,
        request.content_type
    )



# ==================================================
# SEARCH DOCUMENTS
# GET /documents/search?q=value
# ==================================================

@router.get(
    "/search",
    response_model=list[DocumentResponse]
)
def search_documents(
    q: str,
    db: Session = Depends(get_db)
):

    return (
        db.query(Document)
        .filter(
            Document.subject.ilike(
                f"%{q}%"
            )
        )
        .all()
    )