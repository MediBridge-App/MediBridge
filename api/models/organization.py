from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

from database import Base


class Organization(Base):

    __tablename__ = "organizations"


    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )


    name = Column(
        String(255),
        nullable=False
    )


    org_code = Column(
        String(50),
        unique=True,
        nullable=False
    )


    type = Column(
        String(50),
        nullable=True
    )


    timezone = Column(
        String(100),
        default="America/Chicago",
        nullable=True
    )


    date_format = Column(
        String(20),
        default="MM/DD/YYYY",
        nullable=True
    )


    language = Column(
        String(50),
        default="English (US)",
        nullable=True
    )


    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )