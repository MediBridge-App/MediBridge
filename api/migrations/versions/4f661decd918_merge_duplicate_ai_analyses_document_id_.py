"""merge duplicate ai_analyses.document_id unique constraint migrations

Revision ID: 4f661decd918
Revises: 7c1c6496d294, e1f4a9c72b3d
Create Date: 2026-08-03 17:12:38.148127

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "4f661decd918"
down_revision: str | Sequence[str] | None = ("7c1c6496d294", "e1f4a9c72b3d")
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
