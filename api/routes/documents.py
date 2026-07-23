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

    documents = (
        db.query(Document)
        .filter(
            Document.recipient_org_id == current_org_id
        )
        .all()
    )

    return documents



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

    documents = (
        db.query(Document)
        .filter(
            Document.sender_org_id == current_org_id
        )
        .all()
    )

    return documents



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


    document.status = body.status


    if body.status == "delivered":
        document.delivered_at = datetime.utcnow()


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

    from services.s3 import generate_presigned_upload_url

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

    documents = (
        db.query(Document)
        .filter(
            Document.subject.ilike(
                f"%{q}%"
            )
        )
        .all()
    )

    return documents