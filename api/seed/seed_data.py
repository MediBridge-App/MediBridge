import uuid
from datetime import datetime

from database import SessionLocal

from models.organization import Organization
from models.user import User
from models.document import Document
from models.user_notification_preferences import UserNotificationPreferences


db = SessionLocal()


# ==================================================
# IDS
# ==================================================

CLINIC_ID = uuid.UUID(
    "11111111-1111-1111-1111-111111111111"
)

HOSPITAL_ID = uuid.UUID(
    "22222222-2222-2222-2222-222222222222"
)

USER_ID = uuid.UUID(
    "33333333-3333-3333-3333-333333333333"
)


try:

    # ==================================================
    # ORGANIZATIONS
    # ==================================================

    organizations = [
        {
            "id": CLINIC_ID,
            "name": "Seattle Clinic",
            "org_code": "ORG-001",
            "type": "clinic"
        },
        {
            "id": HOSPITAL_ID,
            "name": "UW Hospital",
            "org_code": "ORG-002",
            "type": "hospital"
        }
    ]


    for item in organizations:

        org = db.query(Organization).filter(
            Organization.id == item["id"]
        ).first()


        if org:

            org.name = item["name"]
            org.org_code = item["org_code"]
            org.type = item["type"]
            org.timezone = "America/Chicago"
            org.date_format = "MM/DD/YYYY"
            org.language = "English (US)"


        else:

            org = Organization(
                id=item["id"],
                name=item["name"],
                org_code=item["org_code"],
                type=item["type"],
                timezone="America/Chicago",
                date_format="MM/DD/YYYY",
                language="English (US)"
            )

            db.add(org)


    db.commit()



    # ==================================================
    # USER
    # ==================================================

    user = db.query(User).filter(
        User.id == USER_ID
    ).first()


    if user:

        user.organization_id = CLINIC_ID
        user.cognito_id = "test-user"
        user.email = "test@medibridge.com"
        user.full_name = "Test User"
        user.role = "provider"
        user.specialty = "Cardiology"
        user.npi_number = "1234567890"


    else:

        user = User(
            id=USER_ID,
            cognito_id="test-user",
            organization_id=CLINIC_ID,
            email="test@medibridge.com",
            full_name="Test User",
            role="provider",
            specialty="Cardiology",
            npi_number="1234567890"
        )

        db.add(user)


    db.commit()



    # ==================================================
    # NOTIFICATION PREFERENCES
    # ==================================================

    preferences = db.query(
        UserNotificationPreferences
    ).filter(
        UserNotificationPreferences.user_id == USER_ID
    ).first()


    if preferences:

        preferences.document_delivered = True
        preferences.document_read = True
        preferences.urgent_documents = True
        preferences.audit_events = False
        preferences.ai_processing_complete = True


    else:

        preferences = UserNotificationPreferences(
            id=uuid.uuid4(),
            user_id=USER_ID,
            document_delivered=True,
            document_read=True,
            urgent_documents=True,
            audit_events=False,
            ai_processing_complete=True
        )

        db.add(preferences)


    db.commit()



    # ==================================================
    # DOCUMENTS
    # ==================================================

    documents = [

        {
            "id": "44444444-4444-4444-4444-444444444444",
            "tx_ref": "TX-001",
            "sender_org_id": CLINIC_ID,
            "recipient_org_id": HOSPITAL_ID,
            "document_type": "referral",
            "subject": "Cardiology Referral",
            "priority": "urgent",
            "status": "delivered",
            "file_s3_key": "documents/referral.pdf",
            "original_filename": "cardiology_referral.pdf",
            "file_size": 102400,
            "read": True
        },

        {
            "id": "55555555-5555-5555-5555-555555555555",
            "tx_ref": "TX-002",
            "sender_org_id": HOSPITAL_ID,
            "recipient_org_id": CLINIC_ID,
            "document_type": "lab_result",
            "subject": "Blood Test Results",
            "priority": "normal",
            "status": "delivered",
            "file_s3_key": "documents/lab_results.pdf",
            "original_filename": "lab_results.pdf",
            "file_size": 204800,
            "read": True
        },

        {
            "id": "66666666-6666-6666-6666-666666666666",
            "tx_ref": "TX-003",
            "sender_org_id": HOSPITAL_ID,
            "recipient_org_id": CLINIC_ID,
            "document_type": "imaging",
            "subject": "MRI Scan Results",
            "priority": "routine",
            "status": "ocr_complete",
            "file_s3_key": "documents/mri_scan.pdf",
            "original_filename": "mri_scan.pdf",
            "file_size": 500000,
            "read": False
        }

    ]


    for item in documents:

        document_id = uuid.UUID(item["id"])


        document = db.query(Document).filter(
            Document.id == document_id
        ).first()


        if document:

            document.status = item["status"]
            document.priority = item["priority"]
            document.subject = item["subject"]


        else:

            document = Document(
                id=document_id,
                tx_ref=item["tx_ref"],
                sender_org_id=item["sender_org_id"],
                recipient_org_id=item["recipient_org_id"],
                uploaded_by_user_id=USER_ID,
                document_type=item["document_type"],
                subject=item["subject"],
                priority=item["priority"],
                status=item["status"],
                file_s3_key=item["file_s3_key"],
                original_filename=item["original_filename"],
                file_size=item["file_size"],
                delivered_at=datetime.utcnow()
                if item["status"] == "delivered"
                else None,
                read_at=datetime.utcnow()
                if item["read"]
                else None
            )

            db.add(document)



    db.commit()


    print("Seed complete!")


except Exception as e:

    db.rollback()
    print("Seed failed:", e)


finally:

    db.close()