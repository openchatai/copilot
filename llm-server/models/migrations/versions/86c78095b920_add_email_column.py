"""Add email column

Revision ID: 86c78095b920
Revises: 
Create Date: 2023-11-26 22:56:06.765595

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import text, Column, String

# revision identifiers, used by Alembic.
revision: str = "86c78095b920"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    if (
        not op.get_bind()
        .execute(text("SHOW COLUMNS FROM chatbots LIKE 'email'"))
        .fetchone()
    ):
        op.add_column(
            "chatbots",
            Column(
                "email",
                String(length=255),
                nullable=True,
                server_default="guest@opencopilot.so",
            ),
        )


def downgrade():
    op.drop_column("chatbots", "email")
