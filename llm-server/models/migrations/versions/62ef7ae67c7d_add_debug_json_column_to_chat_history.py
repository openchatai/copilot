"""Add debug_json column to chat history

Revision ID: 62ef7ae67c7d
Revises: 228d50d1fc45
Create Date: 2024-01-20 19:04:21.677356

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = "62ef7ae67c7d"
down_revision: Union[str, None] = "228d50d1fc45"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    if (
        not op.get_bind()
        .execute(sa.text("SHOW COLUMNS FROM chat_history LIKE 'debug_json'"))
        .fetchone()
    ):
        op.add_column("chat_history", sa.Column("debug_json", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("chatbots", "global_variables")
