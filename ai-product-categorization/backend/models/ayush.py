from sqlalchemy import Column, Integer, String, JSON
from db import Base

class AyushHealth(Base):
    __tablename__ = "ayush_health"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False)
    symptoms = Column(String, nullable=True)
    constitution_type = Column(String, nullable=True) # Vata, Pitta, Kapha
    prescriptions = Column(JSON, nullable=True)
