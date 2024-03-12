import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Integer, Numeric

from shared.models.opencopilot_db.database_setup import Base, engine


class Subscription(Base):
    __tablename__ = 'subscriptions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=False)
    status = Column(String(255), nullable=True, default="active")
    stripe_subscription_id = Column(String(255), nullable=True, default="")
    current_period_start = Column(DateTime, nullable=True, default=None)
    current_period_end = Column(DateTime, nullable=True, default=None)
    quantity = Column(Integer, nullable=True, default=1)
    price = Column(Numeric, nullable=True)  # Assuming price is in the smallest currency unit (like cents)
    product = Column(String(255), nullable=True)  # Product ID or a description
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
