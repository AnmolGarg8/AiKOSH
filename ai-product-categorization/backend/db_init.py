import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db import engine, Base, SessionLocal
from models.auth import User
from models.agent_mapping import VendorProfile, RequirementPosting
from models.negotiation import DisputeCase, UploadedDocument, SettlementDraft
from models.ayush import HealthRecord, UserProfile, Recommendation
from services.ayush_service import generate_ayush_synthetic_data
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# 15-20 Realistic Vendor Profiles
seed_vendors = [
    # Textiles
    {
        "name": "Karnatak Handlooms Co.",
        "category": "textiles",
        "capability_tags": ["handloom", "organic dye", "cotton weaving", "embroidery"],
        "certifications": ["GOTS Certified", "India Handloom Brand"],
        "location": "Karnataka",
        "production_capacity": "5000 meters/month",
        "price_range_min": 150.0,
        "price_range_max": 800.0,
        "past_performance_rating": 4.7,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "We manufacture organic cotton handloom fabric with natural plant dyes."
    },
    {
        "name": "Surat Tex-Stitch Industries",
        "category": "textiles",
        "capability_tags": ["bulk stitching", "polyester spinning", "embroidery", "packaging"],
        "certifications": ["ISO 9001"],
        "location": "Gujarat",
        "production_capacity": "50000 units/month",
        "price_range_min": 50.0,
        "price_range_max": 300.0,
        "past_performance_rating": 4.2,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },
    {
        "name": "Coimbatore Cotton Weavers Ltd",
        "category": "textiles",
        "capability_tags": ["cotton weaving", "yarn dyeing", "fabric finishing"],
        "certifications": ["OEKO-TEX Standard"],
        "location": "Tamil Nadu",
        "production_capacity": "20000 meters/month",
        "price_range_min": 100.0,
        "price_range_max": 600.0,
        "past_performance_rating": 4.5,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "We weave premium long-staple cotton yarn into fine shirting fabric."
    },
    {
        "name": "Delhi Fashion Hub Artisans",
        "category": "textiles",
        "capability_tags": ["embroidery", "custom tailoring", "organic dye", "handloom"],
        "certifications": ["Silk Mark Certified"],
        "location": "Delhi",
        "production_capacity": "1500 units/month",
        "price_range_min": 500.0,
        "price_range_max": 3000.0,
        "past_performance_rating": 4.8,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "Handcrafted silk kurtis and custom bridal embroidery work."
    },
    {
        "name": "Ludhana Woolen Mills",
        "category": "textiles",
        "capability_tags": ["wool spinning", "bulk stitching", "thermal knitting"],
        "certifications": ["ISO 14001"],
        "location": "Punjab",
        "production_capacity": "12000 items/month",
        "price_range_min": 200.0,
        "price_range_max": 1500.0,
        "past_performance_rating": 3.9,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },

    # Electronics Components
    {
        "name": "Bangalore Microcircuits Pvt Ltd",
        "category": "electronics components",
        "capability_tags": ["PCB assembly", "SMT placement", "prototype testing", "soldering"],
        "certifications": ["ISO 9001", "RoHS Compliant"],
        "location": "Karnataka",
        "production_capacity": "100000 pieces/month",
        "price_range_min": 10.0,
        "price_range_max": 250.0,
        "past_performance_rating": 4.9,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "High precision SMT assembly lines and automated testing."
    },
    {
        "name": "Pune Silicon Molders",
        "category": "electronics components",
        "capability_tags": ["silicon molding", "casing design", "prototype testing"],
        "certifications": ["CE Certified"],
        "location": "Maharashtra",
        "production_capacity": "30000 units/month",
        "price_range_min": 15.0,
        "price_range_max": 120.0,
        "past_performance_rating": 4.1,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },
    {
        "name": "NCR Electro-Assembly",
        "category": "electronics components",
        "capability_tags": ["soldering", "PCB assembly", "wire harnessing"],
        "certifications": ["ISO 9001", "UL Certified"],
        "location": "Delhi",
        "production_capacity": "45000 units/month",
        "price_range_min": 5.0,
        "price_range_max": 90.0,
        "past_performance_rating": 4.4,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "We provide manual and automated soldering and wire harness assembly."
    },
    {
        "name": "Ahmedabad Sensor Tech",
        "category": "electronics components",
        "capability_tags": ["sensor calibration", "prototype testing", "SMT placement"],
        "certifications": ["CE Certified", "RoHS Compliant"],
        "location": "Gujarat",
        "production_capacity": "15000 units/month",
        "price_range_min": 80.0,
        "price_range_max": 450.0,
        "past_performance_rating": 4.6,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },

    # Packaging
    {
        "name": "GreenPack Bio-Solutions",
        "category": "packaging",
        "capability_tags": ["biodegradable plastic", "custom printing", "die cutting"],
        "certifications": ["CIPET Biodegradable", "FSC Certified"],
        "location": "Karnataka",
        "production_capacity": "80000 bags/month",
        "price_range_min": 2.0,
        "price_range_max": 25.0,
        "past_performance_rating": 4.6,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "We manufacture biodegradable shopping and food packaging bags."
    },
    {
        "name": "Noida Corrugation Mill",
        "category": "packaging",
        "capability_tags": ["corrugated boxes", "die cutting", "flexo printing", "bulk stitching"],
        "certifications": ["ISO 9001"],
        "location": "Uttar Pradesh",
        "production_capacity": "250000 boxes/month",
        "price_range_min": 8.0,
        "price_range_max": 150.0,
        "past_performance_rating": 4.3,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },
    {
        "name": "Mumbai Flexi-Print Pack",
        "category": "packaging",
        "capability_tags": ["custom printing", "flexo printing", "lamination"],
        "certifications": ["BRCGS Food Safety Packaging"],
        "location": "Maharashtra",
        "production_capacity": "60000 meters/month",
        "price_range_min": 4.0,
        "price_range_max": 45.0,
        "past_performance_rating": 4.5,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "High speed flexographic printing and custom film lamination."
    },
    {
        "name": "Rajkot Paper & Pulp Products",
        "category": "packaging",
        "capability_tags": ["corrugated boxes", "biodegradable plastic", "molded pulp"],
        "certifications": ["FSC Certified"],
        "location": "Gujarat",
        "production_capacity": "90000 units/month",
        "price_range_min": 3.0,
        "price_range_max": 35.0,
        "past_performance_rating": 3.8,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },

    # Food Processing
    {
        "name": "Himalayan Organic Spices",
        "category": "food processing",
        "capability_tags": ["spice blending", "dehydration", "vacuum packaging"],
        "certifications": ["FSSAI License", "HACCP Certified", "India Organic"],
        "location": "Uttarakhand",
        "production_capacity": "10000 kg/month",
        "price_range_min": 120.0,
        "price_range_max": 900.0,
        "past_performance_rating": 4.8,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "We grind and blend organic turmeric, chili, and cardamom in vacuum packs."
    },
    {
        "name": "Kochi Marine & Cold Storage",
        "category": "food processing",
        "capability_tags": ["cold storage", "vacuum packaging", "pasteurization"],
        "certifications": ["FSSAI License", "EIA Certified"],
        "location": "Kerala",
        "production_capacity": "40000 units/month",
        "price_range_min": 250.0,
        "price_range_max": 1800.0,
        "past_performance_rating": 4.4,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    },
    {
        "name": "Nashik Agro Fruit Dehydrators",
        "category": "food processing",
        "capability_tags": ["dehydration", "cold storage", "custom printing"],
        "certifications": ["FSSAI License", "ISO 22000"],
        "location": "Maharashtra",
        "production_capacity": "8000 kg/month",
        "price_range_min": 150.0,
        "price_range_max": 1200.0,
        "past_performance_rating": 4.2,
        "onboarded_via_voice": True,
        "raw_voice_transcript": "Dehydrated grapes, mangoes, and apples packed with nitrogen flushing."
    },
    {
        "name": "Amritsar Dairy Processors",
        "category": "food processing",
        "capability_tags": ["pasteurization", "cold storage", "bottle filling"],
        "certifications": ["FSSAI License"],
        "location": "Punjab",
        "production_capacity": "15000 liters/day",
        "price_range_min": 40.0,
        "price_range_max": 200.0,
        "past_performance_rating": 4.5,
        "onboarded_via_voice": False,
        "raw_voice_transcript": None
    }
]

def init_db():
    print("Re-creating all tables in SQLite database...")
    # Drop tables to recreate with new schemas
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    session = SessionLocal()
    try:
        # Create user
        email = "official@indiaai.gov.in"
        print(f"Creating default user: {email}")
        hashed_password = hash_password("password123")
        new_user = User(
            email=email,
            password_hash=hashed_password,
            role="official"
        )
        session.add(new_user)
        
        # Seed VendorProfiles
        print(f"Seeding {len(seed_vendors)} vendor profiles...")
        for v in seed_vendors:
            vendor = VendorProfile(
                name=v["name"],
                category=v["category"],
                capability_tags=v["capability_tags"],
                certifications=v["certifications"],
                location=v["location"],
                production_capacity=v["production_capacity"],
                price_range_min=v["price_range_min"],
                price_range_max=v["price_range_max"],
                past_performance_rating=v["past_performance_rating"],
                onboarded_via_voice=v["onboarded_via_voice"],
                raw_voice_transcript=v["raw_voice_transcript"]
            )
            session.add(vendor)
            
        # Seed AYUSH HealthRecords
        print("Generating and seeding AYUSH historical health records...")
        ayush_data = generate_ayush_synthetic_data()
        for record in ayush_data:
            db_record = HealthRecord(
                district=record["district"],
                month=record["month"],
                year=record["year"],
                symptom_category=record["symptom_category"],
                reported_cases=record["reported_cases"]
            )
            session.add(db_record)

        session.commit()
        print("Database initialized and seeded successfully.")
    except Exception as e:
        print(f"Error during DB initialization/seeding: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    init_db()
