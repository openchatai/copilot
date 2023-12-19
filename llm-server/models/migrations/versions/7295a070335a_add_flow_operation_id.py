"""
add_flow_operation_id

Revision ID: 7295a070335a
Revises: d845330c4432
Create Date: 2023-12-19 10:18:46.554999

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '7295a070335a'
down_revision: Union[str, None] = "d845330c4432"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if not op.get_bind().execute(
        sa.text("SHOW COLUMNS FROM flows LIKE 'operation_id'")
    ).fetchone():
        op.execute(
            """
            ALTER TABLE flows 
            ADD COLUMN operation_id TEXT NULL DEFAULT NULL AFTER description
            """
        )


def downgrade() -> None:
    op.drop_column("flows", "operation_id")
