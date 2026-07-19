from sqlalchemy import Column, Integer, String, Float, JSON
from db import Base

class Negotiation(Base):
    __tablename__ = "negotiations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    buyer_id = Column(String, nullable=True)
    seller_id = Column(String, nullable=True)
    product_details = Column(JSON, nullable=True)
    target_price = Column(Float, nullable=True)
    status = Column(String, default="active") # active, closed, agreed
