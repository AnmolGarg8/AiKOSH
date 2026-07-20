from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from db import get_db
from models.agent_mapping import VendorProfile, RequirementPosting
from services.matching import matching_engine
from routers.auth import get_current_user

from models.audit import log_audit

router = APIRouter(tags=["matching"])

class RequirementCreate(BaseModel):
    title: str
    description: str
    required_category: str
    required_capability_tags: List[str]
    budget_min: float
    budget_max: float
    quantity_needed: int
    location_preference: str = ""
    deadline: str = ""
    posted_by: str = "Official"

@router.post("/api/requirements")
@router.post("/api/v1/requirements")
def create_requirement(req: RequirementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_req = RequirementPosting(
        title=req.title,
        description=req.description,
        required_category=req.required_category.strip().lower(),
        required_capability_tags=req.required_capability_tags,
        budget_min=req.budget_min,
        budget_max=req.budget_max,
        quantity_needed=req.quantity_needed,
        location_preference=req.location_preference,
        deadline=req.deadline,
        posted_by=req.posted_by
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    
    log_audit(db, current_user.email, "CREATE_REQUIREMENT", f"Req ID: {db_req.id}, Title: {db_req.title}")
    
    return db_req

@router.get("/api/requirements/{id}/matches")
@router.get("/api/v1/requirements/{id}/matches")
def get_matches(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    req = db.query(RequirementPosting).filter(RequirementPosting.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement posting not found")
    
    vendors = db.query(VendorProfile).all()
    matches = matching_engine.find_matches(req, vendors)
    return {
        "requirement": req,
        "matches": matches
    }

@router.get("/api/vendors")
@router.get("/api/v1/vendors")
def list_vendors(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    vendors = db.query(VendorProfile).all()
    return vendors
