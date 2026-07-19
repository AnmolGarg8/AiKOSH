from sqlalchemy import Column, Integer, String, Boolean, Float, JSON, Text
from db import Base

class VendorProfile(Base):
    __tablename__ = "vendor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    capability_tags = Column(JSON, nullable=False)  # list of strings
    certifications = Column(JSON, nullable=True)    # list of strings
    location = Column(String, nullable=False)       # e.g., "Delhi" or "Karnataka"
    production_capacity = Column(String, nullable=True)
    price_range_min = Column(Float, default=0.0)
    price_range_max = Column(Float, default=0.0)
    past_performance_rating = Column(Float, default=0.0)
    onboarded_via_voice = Column(Boolean, default=False)
    raw_voice_transcript = Column(Text, nullable=True)

class RequirementPosting(Base):
    __tablename__ = "requirement_postings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    required_category = Column(String, nullable=False)
    required_capability_tags = Column(JSON, nullable=False)  # list of strings
    budget_min = Column(Float, default=0.0)
    budget_max = Column(Float, default=0.0)
    quantity_needed = Column(Integer, default=0)
    location_preference = Column(String, nullable=True)
    deadline = Column(String, nullable=True)
    posted_by = Column(String, nullable=True)
