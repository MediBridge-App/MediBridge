import uuid

from database import SessionLocal
from models.organization import Organization
from models.user import User


db = SessionLocal()


clinic = Organization(
    id=uuid.UUID(
        "11111111-1111-1111-1111-111111111111"
    ),
    name="Seattle Clinic",
    org_code="ORG-001"
)


hospital = Organization(
    id=uuid.UUID(
        "22222222-2222-2222-2222-222222222222"
    ),
    name="UW Hospital",
    org_code="ORG-002"
)


user = User(
    id=uuid.UUID(
        "33333333-3333-3333-3333-333333333333"
    ),
    cognito_id="test-user",
    organization_id=clinic.id,
    email="test@medibridge.com",
    full_name="Test User",
    role="provider"
)


db.add_all([
    clinic,
    hospital,
    user
])


db.commit()

print("Seed complete")