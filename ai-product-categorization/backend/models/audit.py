from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from db import Base
from sqlalchemy.orm import Session

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False) # CREATE_DISPUTE, GENERATE_DRAFT, VIEW_TRENDS, SUBMIT_FORM
    record_info = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

def log_audit(db: Session, email: str, action: str, record_info: str):
    try:
        log = AuditLog(
            user_email=email,
            action=action,
            record_info=record_info
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Failed to write audit log: {e}")
        db.rollback()
