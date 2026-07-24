"""fix document nullable fields

Revision ID: d6e7d6f32458
Revises: 1192b31b38c8
Create Date: 2026-07-23 22:08:46.118079

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd6e7d6f32458'
down_revision: Union[str, Sequence[str], None] = '1192b31b38c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.alter_column(
        "documents",
        "document_type",
        existing_type=sa.String(length=100),
        nullable=True
    )

    op.alter_column(
        "documents",
        "subject",
        existing_type=sa.String(length=255),
        nullable=True
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.alter_column(
        "documents",
        "document_type",
        existing_type=sa.String(length=100),
        nullable=False
    )

    op.alter_column(
        "documents",
        "subject",
        existing_type=sa.String(length=255),
        nullable=False
    )