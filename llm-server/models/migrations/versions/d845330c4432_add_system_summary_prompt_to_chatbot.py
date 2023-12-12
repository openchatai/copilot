"""Add system_summary_prompt to Chatbot

Revision ID: d845330c4432
Revises: 86c78095b920
Create Date: 2023-12-12 14:35:53.182454

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "d845330c4432"
down_revision: Union[str, None] = "86c78095b920"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    if (
        not op.get_bind()
        .execute(sa.text("SHOW COLUMNS FROM chatbots LIKE 'summary_prompt'"))
        .fetchone()
    ):
        op.add_column("chatbots", sa.Column("summary_prompt", sa.Text(), nullable=True))

    op.execute(
        """
        UPDATE chatbots
        SET summary_prompt = "Given a JSON response, summarize the key information in a concise manner. Include relevant details, references, and links if present. Format the summary in Markdown for clarity and readability."
        """
    )

    op.alter_column(
        "chatbots", "summary_prompt", existing_type=sa.TEXT(), nullable=False
    )


def downgrade():
    op.drop_column("chatbots", "system_summary_prompt")
