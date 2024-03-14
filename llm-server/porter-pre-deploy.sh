#!/bin/bash

echo "=== 🟢 Running Alembic migrations ==="

cd models && python setup_alembic.py && alembic upgrade head
