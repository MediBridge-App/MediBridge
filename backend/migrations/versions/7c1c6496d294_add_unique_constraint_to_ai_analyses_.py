"""add unique constraint to ai_analyses.document_id

Revision ID: 7c1c6496d294
Revises: 09ced478a115
Create Date: 2026-07-30 09:25:05.509278

"""
from typing import Sequence, Union
from alembic import op


from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7c1c6496d294'
down_revision: Union[str, Sequence[str], None] = '09ced478a115'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None



def upgrade():
    op.create_unique_constraint(
        "uq_ai_analyses_document_id",
        "ai_analyses",
        ["document_id"]
    )

def downgrade():
    op.drop_constraint(
        "uq_ai_analyses_document_id",
        "ai_analyses",
        type_="unique"
    )