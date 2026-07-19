from fastapi import APIRouter, Depends
import json
from routers.auth import get_current_user
from db import get_db
from sqlalchemy.orm import Session
from models.agent_mapping import VendorProfile
from services.classifier import classifier_service
import os

router = APIRouter(
    prefix="/api/v1/forms",
    tags=["forms"]
)

@router.get("")
def get_forms(current_user=Depends(get_current_user)):
    base_dir = os.path.dirname(os.path.dirname(__file__))
    forms_path = os.path.join(base_dir, "data", "forms_catalog.json")
    with open(forms_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    return catalog

@router.post("/submit")
def submit_form(payload: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    fields = payload.get("fields", {})
    form_id = payload.get("form_id")
    
    # Extract values
    name = fields.get("business_name") or fields.get("legal_name") or fields.get("owner_name") or "Unnamed Vendor"
    location = fields.get("state") or fields.get("address") or "Karnataka"
    activity = fields.get("activity_type") or fields.get("food_category") or name
    
    # Categorize using classification service
    classification = classifier_service.predict(activity)
    
    category = classification.get("category", "textiles").lower()
    capability_tags = classification.get("tags", [])
    if not capability_tags:
        capability_tags = [activity.lower()]
        
    price_range_min = 100.0
    price_range_max = 5000.0
    
    investment = fields.get("investment_amount") or "100000"
    production_capacity = f"Capacity based on {investment} INR investment"
    
    new_vendor = VendorProfile(
        name=name,
        category=category,
        capability_tags=capability_tags,
        certifications=["ISO 9001", "FSSAI License"] if "food" in category else ["ISO 9001"],
        location=location,
        production_capacity=production_capacity,
        price_range_min=price_range_min,
        price_range_max=price_range_max,
        past_performance_rating=4.5,
        onboarded_via_voice=True,
        raw_voice_transcript=f"Form {form_id} completed via voice assistant. Activity described: {activity}"
    )
    
    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return {
        "status": "success", 
        "message": "Form submitted and Vendor Profile created successfully", 
        "form_id": form_id,
        "vendor_id": new_vendor.id,
        "category": category
    }
