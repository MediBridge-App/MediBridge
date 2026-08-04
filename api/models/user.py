import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    cognito_id = Column(
        String(255),
        unique=True,
        nullable=False,
    )

    organization_id = Column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False
    )

    organization = relationship("Organization", back_populates="users")

    email = Column(String(255), unique=True, nullable=False)

    full_name = Column(String(255), nullable=False)

    role = Column(String(50), nullable=False)

    is_active = Column(Boolean, default=True)

    last_login = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    specialty = Column(String(100), nullable=True)

    npi_number = Column(String(20), nullable=True)
