from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers import forms, voice, categorize, auth, matching, disputes, ayush, integrations
from sqlalchemy.orm import Session
from db import get_db
from routers.auth import get_current_user
from models.agent_mapping import RequirementPosting
from models.negotiation import DisputeCase
from models.ayush import HealthRecord
from services.ayush_service import detect_trends_and_forecast, DISTRICTS, SYMPTOM_CATEGORIES

app = FastAPI(title="AI Voice Form Auto-Fill System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(matching.router)
app.include_router(disputes.router)
app.include_router(ayush.router)
app.include_router(integrations.router)
app.include_router(forms.router)
app.include_router(voice.router)
app.include_router(categorize.router)

@app.get("/api/dashboard/stats")
@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    req_count = db.query(RequirementPosting).count()
    open_disputes = db.query(DisputeCase).filter(DisputeCase.status != "settled").count()
    
    # Elevated Risk Districts
    all_records = db.query(HealthRecord).all()
    elevated_count = 0
    for district in DISTRICTS:
        district_records = [r for r in all_records if r.district == district]
        if not district_records:
            continue
        has_elevated = False
        for category in SYMPTOM_CATEGORIES:
            res = detect_trends_and_forecast(district_records, district, category)
            if res.get("risk_level") == "elevated":
                has_elevated = True
                break
        if has_elevated:
            elevated_count += 1
            
    return {
        "active_requirements": req_count,
        "open_disputes": open_disputes,
        "elevated_risk_districts": elevated_count
    }

@app.get("/")
def read_root():
    return {"message": "Voice Form Auto-Fill API is running"}
