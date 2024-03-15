from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager
from shared.models.opencopilot_db import engine

SessionLocal = sessionmaker(bind=engine)

@contextmanager
def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
