"""Add api_call_made and knowledgebase_called columns

Revision ID: b9828e70d171
Revises: 62ef7ae67c7d
Create Date: 2024-01-22 20:57:25.839823

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from alembic import op
import sqlalchemy as sa
from sqlalchemy import Column, Boolean
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "b9828e70d171"
down_revision: Union[str, None] = "62ef7ae67c7d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Add two new boolean columns
def upgrade():
    if not op.get_bind().execute(
        sa.text("SHOW COLUMNS FROM chat_history LIKE 'api_called'")
    ).fetchone():
        op.add_column("chat_history", Column("api_called", Boolean, default=False))
    
    if not op.get_bind().execute(
        sa.text("SHOW COLUMNS FROM chat_history LIKE 'knowledgebase_called'")
    ).fetchone():
        op.add_column(
            "chat_history", Column("knowledgebase_called", Boolean, default=False)
        )


# Remove the two boolean columns
def downgrade():
    op.drop_column("chat_history", "api_called")
    op.drop_column("chat_history", "knowledgebase_called")
