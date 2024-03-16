"""Add type to chatbots

Revision ID: 433191267223
Revises: e9257e42bbea
Create Date: 2024-02-29 00:17:59.193267

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text, Column, String


# revision identifiers, used by Alembic.
revision: str = "433191267223"
down_revision: Union[str, None] = "e9257e42bbea"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if (
        not op.get_bind()
        .execute(text("SHOW COLUMNS FROM chatbots LIKE 'type'"))
        .fetchone()
    ):
        op.add_column(
            "chatbots",
            sa.Column(
                "type",
                sa.Text(),
                nullable=True,
            ),
        )


def downgrade() -> None:
    op.drop_column("chatbots", "type")
