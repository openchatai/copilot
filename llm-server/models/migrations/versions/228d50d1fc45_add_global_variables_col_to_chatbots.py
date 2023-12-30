"""add global_variables_col_to_chatbots

Revision ID: 228d50d1fc45
Revises: 7295a070335a
Create Date: 2023-12-30 22:49:06.600771

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '228d50d1fc45'
down_revision: Union[str, None] = '7295a070335a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    if (
            not op.get_bind()
                    .execute(sa.text("SHOW COLUMNS FROM chatbots LIKE 'global_variables'"))
                    .fetchone()
    ):
        op.add_column("chatbots", sa.Column("global_variables", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("chatbots", "global_variables")
