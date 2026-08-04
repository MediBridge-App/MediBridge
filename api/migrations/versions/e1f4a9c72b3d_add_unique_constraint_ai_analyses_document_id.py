from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "e1f4a9c72b3d"
down_revision: str | Sequence[str] | None = "09ced478a115"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_unique_constraint(
        "ai_analyses_document_id_unique", "ai_analyses", ["document_id"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint("ai_analyses_document_id_unique", "ai_analyses", type_="unique")
