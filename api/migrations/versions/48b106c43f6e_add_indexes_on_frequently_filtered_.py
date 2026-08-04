"""add indexes on frequently filtered foreign keys

Revision ID: 48b106c43f6e
Revises: 4f661decd918
Create Date: 2026-08-03 23:00:36.130613

"""
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '48b106c43f6e'
down_revision: str | Sequence[str] | None = '4f661decd918'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_index(
        "ix_documents_recipient_org_id", "documents", ["recipient_org_id"]
    )
    op.create_index(
        "ix_documents_sender_org_id", "documents", ["sender_org_id"]
    )
    op.create_index(
        "ix_audit_logs_organization_id", "audit_logs", ["organization_id"]
    )
    op.create_index(
        "ix_notifications_user_id", "notifications", ["user_id"]
    )
    op.create_index(
        "ix_users_organization_id", "users", ["organization_id"]
    )
    op.create_index(
        "ix_webhooks_organization_id", "webhooks", ["organization_id"]
    )
    op.create_index(
        "ix_api_keys_organization_id", "api_keys", ["organization_id"]
    )
    op.create_index(
        "ix_security_settings_organization_id",
        "security_settings",
        ["organization_id"],
    )
    op.create_index(
        "ix_tasks_assigned_to_user_id", "tasks", ["assigned_to_user_id"]
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_tasks_assigned_to_user_id", table_name="tasks")
    op.drop_index(
        "ix_security_settings_organization_id", table_name="security_settings"
    )
    op.drop_index("ix_api_keys_organization_id", table_name="api_keys")
    op.drop_index("ix_webhooks_organization_id", table_name="webhooks")
    op.drop_index("ix_users_organization_id", table_name="users")
    op.drop_index("ix_notifications_user_id", table_name="notifications")
    op.drop_index("ix_audit_logs_organization_id", table_name="audit_logs")
    op.drop_index("ix_documents_sender_org_id", table_name="documents")
    op.drop_index("ix_documents_recipient_org_id", table_name="documents")
