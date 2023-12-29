"""add visible_for_user column

Revision ID: 0644387be433
Revises: 7295a070335a
Create Date: 2023-12-29 00:34:29.051593

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '0644387be433'
down_revision: Union[str, None] = '7295a070335a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column('chat_history', sa.Column('visible_for_user', sa.Boolean(), nullable=True, server_default=sa.true()))


def downgrade():
    op.drop_column('chat_history', 'visible_for_user')
