import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, aliased

from database import get_db
from dependencies.auth import get_current_user
from models.ai_analysis import AIAnalysis
from models.document import Document
from models.notification import Notification
from models.organization import Organization
from models.user import User
from schemas.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentStatusUpdate,
    UploadURLRequest,
)
from services.audit import create_audit_log
from services.events import publish_document_sent_event
from services.s3 import (
    generate_presigned_download_url,
    generate_presigned_upload_url,
)

router = APIRouter(prefix="/documents", tags=["Documents"])


SenderOrg = aliased(Organization)
RecipientOrg = aliased(Organization)


# ==================================================
# GET INBOX DOCUMENTS
# GET /documents/inbox
# ==================================================


@router.get("/inbox", response_model=list[DocumentResponse])
def get_inbox(
    status: str | None = None,
    type: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        query = (
            db.query(
                Document,
                AIAnalysis.urgency_detected,
                AIAnalysis.summary,
                AIAnalysis.tags,
                SenderOrg.name.label("sender_org_name"),
                RecipientOrg.name.label("recipient_org_name"),
            )
            .outerjoin(
                AIAnalysis,
                AIAnalysis.document_id == Document.id,
            )
            .join(
                SenderOrg,
                SenderOrg.id == Document.sender_org_id,
            )
            .join(
                RecipientOrg,
                RecipientOrg.id == Document.recipient_org_id,
            )
            .filter(Document.recipient_org_id == current_user.organization_id)
        )

        if status:
            query = query.filter(Document.status == status)

        if type:
            query = query.filter(Document.document_type == type)

        if priority:
            query = query.filter(Document.priority == priority)

        if search:
            query = query.filter(Document.subject.ilike(f"%{search}%"))

        results = query.order_by(Document.created_at.desc()).all()

        return [
            {
                **{
                    key: value
                    for key, value in document.__dict__.items()
                    if key != "_sa_instance_state"
                },
                "urgency_detected": urgency_detected,
                "summary": summary,
                "tags": tags,
                "sender_org_name": sender_org_name,
                "recipient_org_name": recipient_org_name,
            }
            for (
                document,
                urgency_detected,
                summary,
                tags,
                sender_org_name,
                recipient_org_name,
            ) in results
        ]

    except Exception as e:
        print("INBOX ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ==================================================
# GET SENT DOCUMENTS
# GET /documents/sent
# ==================================================


@router.get("/sent", response_model=list[DocumentResponse])
def get_sent(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        results = (
            db.query(
                Document,
                AIAnalysis.urgency_detected,
                AIAnalysis.summary,
                AIAnalysis.tags,
                SenderOrg.name.label("sender_org_name"),
                RecipientOrg.name.label("recipient_org_name"),
            )
            .outerjoin(
                AIAnalysis,
                AIAnalysis.document_id == Document.id,
            )
            .join(
                SenderOrg,
                SenderOrg.id == Document.sender_org_id,
            )
            .join(
                RecipientOrg,
                RecipientOrg.id == Document.recipient_org_id,
            )
            .filter(Document.sender_org_id == current_user.organization_id)
            .order_by(Document.created_at.desc())
            .all()
        )

        return [
            {
                **{
                    key: value
                    for key, value in document.__dict__.items()
                    if key != "_sa_instance_state"
                },
                "urgency_detected": urgency_detected,
                "summary": summary,
                "tags": tags,
                "sender_org_name": sender_org_name,
                "recipient_org_name": recipient_org_name,
            }
            for (
                document,
                urgency_detected,
                summary,
                tags,
                sender_org_name,
                recipient_org_name,
            ) in results
        ]

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve sent documents",
        )


# ==================================================
# SEARCH DOCUMENTS
# GET /documents/search
# ==================================================


@router.get("/search", response_model=list[DocumentResponse])
def search_documents(
    q: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        results = (
            db.query(
                Document,
                AIAnalysis.urgency_detected,
                AIAnalysis.summary,
                AIAnalysis.tags,
                SenderOrg.name.label("sender_org_name"),
                RecipientOrg.name.label("recipient_org_name"),
            )
            .outerjoin(
                AIAnalysis,
                AIAnalysis.document_id == Document.id,
            )
            .join(
                SenderOrg,
                SenderOrg.id == Document.sender_org_id,
            )
            .join(
                RecipientOrg,
                RecipientOrg.id == Document.recipient_org_id,
            )
            .filter(
                (
                    (Document.recipient_org_id == current_user.organization_id)
                    | (Document.sender_org_id == current_user.organization_id)
                ),
                or_(
                    Document.subject.ilike(f"%{q}%"),
                    Document.tx_ref.ilike(f"%{q}%"),
                    Document.document_type.ilike(f"%{q}%"),
                    Document.priority.ilike(f"%{q}%"),
                    Document.status.ilike(f"%{q}%"),
                    Document.notes.ilike(f"%{q}%"),
                    SenderOrg.name.ilike(f"%{q}%"),
                    RecipientOrg.name.ilike(f"%{q}%"),
                    AIAnalysis.summary.ilike(f"%{q}%"),
                ),
            )
            .order_by(Document.created_at.desc())
            .all()
        )

        return [
            {
                **{
                    key: value
                    for key, value in document.__dict__.items()
                    if key != "_sa_instance_state"
                },
                "urgency_detected": urgency_detected,
                "summary": summary,
                "tags": tags,
                "sender_org_name": sender_org_name,
                "recipient_org_name": recipient_org_name,
            }
            for (
                document,
                urgency_detected,
                summary,
                tags,
                sender_org_name,
                recipient_org_name,
            ) in results
        ]

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to search documents",
        )


# ==================================================
# GET DOCUMENT DOWNLOAD URL
# GET /documents/{doc_id}/download-url
# ==================================================


@router.get("/{doc_id}/download-url")
def get_download_url(
    doc_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        document = (
            db.query(Document)
            .filter(
                Document.id == doc_id,
                (
                    (Document.sender_org_id == current_user.organization_id)
                    | (Document.recipient_org_id == current_user.organization_id)
                ),
            )
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found or access denied",
            )

        result = generate_presigned_download_url(document.file_s3_key)

        create_audit_log(
            db=db,
            event_type="document_downloaded",
            action="Document download URL generated",
            document_id=document.id,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            details={},
            request=request
        )

        db.commit()

        return {
            **result,
            "filename": document.original_filename,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate download URL",
        )


# ==================================================
# GET SINGLE DOCUMENT
# GET /documents/{doc_id}
# ==================================================


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        result = (
            db.query(
                Document,
                AIAnalysis.urgency_detected,
                AIAnalysis.summary,
                AIAnalysis.tags,
                SenderOrg.name.label("sender_org_name"),
                RecipientOrg.name.label("recipient_org_name"),
            )
            .outerjoin(
                AIAnalysis,
                AIAnalysis.document_id == Document.id,
            )
            .join(
                SenderOrg,
                SenderOrg.id == Document.sender_org_id,
            )
            .join(
                RecipientOrg,
                RecipientOrg.id == Document.recipient_org_id,
            )
            .filter(
                Document.id == doc_id,
                (
                    (Document.sender_org_id == current_user.organization_id)
                    | (Document.recipient_org_id == current_user.organization_id)
                ),
            )
            .first()
        )

        if not result:
            raise HTTPException(
                status_code=404,
                detail="Document not found or access denied",
            )

        (
            document,
            urgency_detected,
            summary,
            tags,
            sender_org_name,
            recipient_org_name,
        ) = result

        return {
            **{
                key: value
                for key, value in document.__dict__.items()
                if key != "_sa_instance_state"
            },
            "urgency_detected": urgency_detected,
            "summary": summary,
            "tags": tags,
            "sender_org_name": sender_org_name,
            "recipient_org_name": recipient_org_name,
        }

    except HTTPException:
        raise

    except SQLAlchemyError as e:
        print("INBOX ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ==================================================
# MARK DOCUMENT AS READ
# PUT /documents/{doc_id}/read
# ==================================================


@router.put("/{doc_id}/read", response_model=DocumentResponse)
def mark_document_read(
    doc_id: UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        document = (
            db.query(Document)
            .filter(
                Document.id == doc_id,
                (
                    (Document.sender_org_id == current_user.organization_id)
                    | (Document.recipient_org_id == current_user.organization_id)
                ),
            )
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found or access denied",
            )

        if document.read_at is None:
            document.read_at = datetime.now(timezone.utc)

            create_audit_log(
                db=db,
                event_type="document_read",
                action="Document marked as read",
                document_id=document.id,
                user_id=current_user.id,
                organization_id=current_user.organization_id,
                details={},
                request=request
            )

            db.commit()

            db.refresh(document)

        return get_document(
            doc_id=document.id,
            db=db,
            current_user=current_user,
        )

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to mark document as read",
        )


# ==================================================
# SEND DOCUMENT
# POST /documents/send
# ==================================================


@router.post("/send", response_model=DocumentResponse)
def send_document(
    document: DocumentCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        recipient = (
            db.query(Organization)
            .filter(Organization.id == document.recipient_org_id)
            .first()
        )

        if not recipient:
            raise HTTPException(
                status_code=404,
                detail="Recipient organization not found",
            )

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
            notes=document.notes,
        )

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
                "subject": new_document.subject,
            },
            request=request
        )

        # Create notifications for recipient users
        recipient_users = (
            db.query(User)
            .filter(
                User.organization_id == new_document.recipient_org_id,
                User.is_active.is_(True),
            )
            .all()
        )

        for user in recipient_users:
            notification = Notification(
                user_id=user.id,
                document_id=new_document.id,
                type="document_received",
                message=(
                    f"New {new_document.document_type} "
                    "document received"
                ),
                is_read=False,
            )

            db.add(notification)

        db.commit()

        db.refresh(new_document)

        # Publish after database commit
        try:
            publish_document_sent_event(
                new_document,
                current_user.id,
            )

        except Exception as e:
            print(
                f"SNS publish failed. "
                f"document_id={new_document.id}, error={e!r}"
            )

        return get_document(
            doc_id=new_document.id,
            db=db,
            current_user=current_user,
        )

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to send document",
        )


# ==================================================
# UPDATE DOCUMENT STATUS
# PUT /documents/{doc_id}/status
# ==================================================


@router.put("/{doc_id}/status", response_model=DocumentResponse)
def update_document_status(
    doc_id: UUID,
    body: DocumentStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    try:
        document = (
            db.query(Document)
            .filter(
                Document.id == doc_id,
                (
                    (Document.sender_org_id == current_user.organization_id)
                    | (Document.recipient_org_id == current_user.organization_id)
                ),
            )
            .first()
        )

        if not document:
            raise HTTPException(
                status_code=404,
                detail="Document not found or access denied",
            )

        allowed_statuses = [
            "uploaded",
            "ocr_complete",
            "ocr_failed",
            "classified",
            "routed",
            "delivered",
            "rejected",
        ]

        if body.status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail="Invalid document status",
            )

        old_status = document.status

        if old_status == body.status:
            return get_document(doc_id=document.id, db=db, current_user=current_user,)

        document.status = body.status

        if body.status == "delivered":
            document.delivered_at = datetime.now(timezone.utc)

        create_audit_log(
            db=db,
            event_type="document_status_changed",
            action="Document status updated",
            document_id=document.id,
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            details={
                "old_status": old_status,
                "new_status": body.status,
            },
            request=request
        )

        db.commit()

        db.refresh(document)

        return get_document(
            doc_id=document.id,
            db=db,
            current_user=current_user,
        )

    except HTTPException:
        raise

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to update document status",
        )


# ==================================================
# CREATE S3 UPLOAD URL
# POST /documents/upload-url
# ==================================================


@router.post("/upload-url")
def create_upload_url(
    request: UploadURLRequest,
    current_user=Depends(get_current_user),
):

    try:
        return generate_presigned_upload_url(
            request.filename,
            request.content_type,
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate upload URL",
        )
