"""add_language_to_the_chatbot

Revision ID: e9257e42bbea
Revises: b9828e70d171
Create Date: 2024-02-06 09:02:52.188249

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e9257e42bbea'
down_revision: Union[str, None] = 'b9828e70d171'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if (
        not op.get_bind()
        .execute(sa.text("SHOW COLUMNS FROM chatbots LIKE 'language'"))
        .fetchone()
    ):
        op.add_column("chatbots", sa.Column("language", sa.Text(), nullable=True, default="en"))
        op.execute("UPDATE chatbots SET language = 'en' WHERE language IS NULL")

def downgrade() -> None:
    op.drop_column("chatbots", "language")
