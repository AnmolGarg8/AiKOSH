from sqlalchemy import Column, Integer, String, Float, JSON, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class DisputeCase(Base):
    __tablename__ = "dispute_cases"

    id = Column(Integer, primary_key=True, index=True)
    party_a_name = Column(String, nullable=False)
    party_b_name = Column(String, nullable=False)
    dispute_category = Column(String, nullable=False) # payment_delay, quality_dispute, contract_breach
    dispute_amount = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="intake") # intake, under_review, settled, escalated
    created_at = Column(DateTime, default=datetime.utcnow)
    days_pending = Column(Integer, default=0)

    documents = relationship("UploadedDocument", back_populates="case", cascade="all, delete-orphan")
    drafts = relationship("SettlementDraft", back_populates="case", cascade="all, delete-orphan")

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("dispute_cases.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    extracted_entities = Column(JSON, nullable=True) # invoice_number, amounts, dates

    case = relationship("DisputeCase", back_populates="documents")

class SettlementDraft(Base):
    __tablename__ = "settlement_drafts"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("dispute_cases.id", ondelete="CASCADE"), nullable=False)
    draft_text = Column(Text, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("DisputeCase", back_populates="drafts")
