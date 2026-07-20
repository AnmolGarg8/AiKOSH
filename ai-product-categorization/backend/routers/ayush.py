from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from db import get_db
from models.ayush import HealthRecord, UserProfile, Recommendation
from services.ayush_service import detect_trends_and_forecast, match_recommendations, DISTRICTS, SYMPTOM_CATEGORIES
from routers.auth import get_current_user

router = APIRouter(tags=["ayush"])

class RecommendationRequest(BaseModel):
    age: int
    dosha_type: str # vata, pitta, kapha
    symptom_tags: List[str]
    lifestyle_factors: List[str]

@router.get("/api/ayush/trends")
@router.get("/api/v1/ayush/trends")
def get_trends(
    district: str = Query(..., description="District Name"),
    category: str = Query(..., description="Symptom Category"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Fetch all records for this district + category
    records = db.query(HealthRecord).filter(
        HealthRecord.district == district,
        HealthRecord.symptom_category == category
    ).all()
    
    if not records:
        raise HTTPException(status_code=404, detail="No records found for specified district and category")
        
    analysis = detect_trends_and_forecast(records, district, category)
    return analysis

@router.get("/api/ayush/risk-summary")
@router.get("/api/v1/ayush/risk-summary")
def get_risk_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Load all records to calculate risks
    all_records = db.query(HealthRecord).all()
    
    summary = []
    for district in DISTRICTS:
        district_records = [r for r in all_records if r.district == district]
        if not district_records:
            continue
            
        elevated_cats = []
        watch_cats = []
        
        for category in SYMPTOM_CATEGORIES:
            res = detect_trends_and_forecast(district_records, district, category)
            risk = res.get("risk_level", "normal")
            if risk == "elevated":
                elevated_cats.append(category)
            elif risk == "watch":
                watch_cats.append(category)
                
        # Overall risk calculation
        if elevated_cats:
            overall_risk = "elevated"
        elif watch_cats:
            overall_risk = "watch"
        else:
            overall_risk = "normal"
            
        summary.append({
            "district": district,
            "risk_level": overall_risk,
            "elevated_categories": elevated_cats,
            "watch_categories": watch_cats
        })
        
    return summary

@router.post("/api/ayush/recommendations")
@router.post("/api/v1/ayush/recommendations")
def post_recommendations(
    req: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Save user profile
    profile = UserProfile(
        age=req.age,
        dosha_type=req.dosha_type,
        symptom_tags=req.symptom_tags,
        lifestyle_factors=req.lifestyle_factors
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    # 2. Get recommendations by checking rules
    matched = match_recommendations(req.dosha_type, req.symptom_tags, req.lifestyle_factors)
    
    # 3. Save recommendation record
    rec = Recommendation(
        user_profile_id=profile.id,
        recommended_treatments=matched["treatments"],
        recommended_lifestyle_changes=matched["lifestyle_changes"]
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    
    return {
        "id": rec.id,
        "user_profile_id": profile.id,
        "recommended_treatments": rec.recommended_treatments,
        "recommended_lifestyle_changes": rec.recommended_lifestyle_changes,
        "generated_at": rec.generated_at.isoformat() if rec.generated_at else None,
        "disclaimer": "General AYUSH wellness information only. Not a medical diagnosis or treatment plan — consult a qualified practitioner for any health condition."
    }
