from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String, nullable=False, index=True)
    month = Column(Integer, nullable=False) # 1 to 12
    year = Column(Integer, nullable=False)
    symptom_category = Column(String, nullable=False, index=True) # respiratory, digestive, joint_pain, skin, seasonal_fever
    reported_cases = Column(Integer, nullable=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer, nullable=False)
    dosha_type = Column(String, nullable=False) # vata, pitta, kapha
    symptom_tags = Column(JSON, nullable=False) # list of strings
    lifestyle_factors = Column(JSON, nullable=False) # list of strings

    recommendations = relationship("Recommendation", back_populates="user_profile", cascade="all, delete-orphan")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_profile_id = Column(Integer, ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False)
    recommended_treatments = Column(JSON, nullable=False) # list of strings
    recommended_lifestyle_changes = Column(JSON, nullable=False) # list of strings
    generated_at = Column(DateTime, default=datetime.utcnow)

    user_profile = relationship("UserProfile", back_populates="recommendations")
