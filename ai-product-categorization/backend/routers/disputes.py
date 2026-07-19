from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import shutil
import os

from db import get_db
from models.negotiation import DisputeCase, UploadedDocument, SettlementDraft
from services.disputes import (
    translate_hindi_to_english, 
    extract_document_text, 
    extract_entities, 
    run_outcome_prediction, 
    fill_settlement_template
)
from routers.auth import get_current_user

router = APIRouter(tags=["disputes"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class DisputeCreate(BaseModel):
    party_a_name: str
    party_b_name: str
    dispute_category: str
    dispute_amount: float
    description: str
    days_pending: int = 0

class DraftCreate(BaseModel):
    draft_text: str

@router.post("/api/disputes")
@router.post("/api/v1/disputes")
def create_dispute(req: DisputeCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Multilingual Translate handling
    # Translate Hindi description to English for entity/analysis pipeline if needed
    eng_desc = translate_hindi_to_english(req.description)
    
    db_case = DisputeCase(
        party_a_name=req.party_a_name,
        party_b_name=req.party_b_name,
        dispute_category=req.dispute_category,
        dispute_amount=req.dispute_amount,
        description=req.description, # Keep original language in DB
        days_pending=req.days_pending,
        status="intake"
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    
    # We can attach the English translation metadata or note it
    return db_case

@router.post("/api/disputes/{id}/documents")
@router.post("/api/v1/disputes/{id}/documents")
async def upload_document(
    id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user=Depends(get_current_user)
):
    case = db.query(DisputeCase).filter(DisputeCase.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Dispute case not found")
    
    # Save file temporarily
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Extract text and run OCR fallback if necessary
        text = extract_document_text(file_path, file.filename)
        
        # Translate extracted text if it contains Hindi (multilingual OCR)
        translated_text = translate_hindi_to_english(text)
        
        # Extract entities using regex
        entities = extract_entities(translated_text)
        
        # Save to DB
        doc = UploadedDocument(
            case_id=case.id,
            filename=file.filename,
            extracted_text=text,
            extracted_entities=entities
        )
        db.add(doc)
        
        # Update case status
        case.status = "under_review"
        db.commit()
        db.refresh(doc)
        db.refresh(case)
        
        return doc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)

@router.get("/api/disputes/{id}/prediction")
@router.get("/api/v1/disputes/{id}/prediction")
def get_prediction(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    case = db.query(DisputeCase).filter(DisputeCase.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Dispute case not found")
        
    # Check if case has uploaded documents
    has_docs = len(case.documents) > 0
    
    prediction = run_outcome_prediction(
        category=case.dispute_category,
        amount=case.dispute_amount,
        days_pending=case.days_pending,
        had_documentation=has_docs
    )
    
    return {
        "case_id": case.id,
        "prediction": prediction["predicted_outcome"],
        "confidence": prediction["confidence_percentage"],
        "had_documentation": has_docs,
        "disclaimer": "Prediction based on historical pattern modeling — advisory only, not a legal determination."
    }

@router.post("/api/disputes/{id}/draft")
@router.post("/api/v1/disputes/{id}/draft")
def generate_draft(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    case = db.query(DisputeCase).filter(DisputeCase.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Dispute case not found")
        
    # Get latest doc for invoice numbers/entities
    invoice_no = "INV-2026-UNKNOWN"
    if case.documents:
        invoice_no = case.documents[-1].extracted_entities.get("invoice_number", invoice_no)
        
    # Run prediction to seed resolution
    has_docs = len(case.documents) > 0
    prediction = run_outcome_prediction(
        category=case.dispute_category,
        amount=case.dispute_amount,
        days_pending=case.days_pending,
        had_documentation=has_docs
    )
    
    draft_text = fill_settlement_template(
        party_a=case.party_a_name,
        party_b=case.party_b_name,
        category=case.dispute_category,
        amount=case.dispute_amount,
        invoice_no=invoice_no,
        outcome=prediction["predicted_outcome"]
    )
    
    # Save draft
    draft = SettlementDraft(
        case_id=case.id,
        draft_text=draft_text
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    
    return draft

@router.post("/api/disputes/{id}/finalize")
@router.post("/api/v1/disputes/{id}/finalize")
def finalize_dispute(id: int, payload: DraftCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    case = db.query(DisputeCase).filter(DisputeCase.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Dispute case not found")
        
    case.status = "settled"
    
    # Save/update finalized draft
    draft = db.query(SettlementDraft).filter(SettlementDraft.case_id == case.id).order_by(SettlementDraft.generated_at.desc()).first()
    if draft:
        draft.draft_text = payload.draft_text
    else:
        draft = SettlementDraft(case_id=case.id, draft_text=payload.draft_text)
        db.add(draft)
        
    db.commit()
    return {"status": "success", "message": "Dispute resolved and settled."}

@router.get("/api/disputes")
@router.get("/api/v1/disputes")
def list_disputes(status: Optional[str] = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    query = db.query(DisputeCase)
    if status:
        query = query.filter(DisputeCase.status == status)
    
    cases = query.order_by(DisputeCase.created_at.desc()).all()
    
    # Map relation fields to avoid circular ref serializer error
    results = []
    for c in cases:
        docs = []
        for d in c.documents:
            docs.append({
                "id": d.id,
                "filename": d.filename,
                "extracted_entities": d.extracted_entities
            })
        results.append({
            "id": c.id,
            "party_a_name": c.party_a_name,
            "party_b_name": c.party_b_name,
            "dispute_category": c.dispute_category,
            "dispute_amount": c.dispute_amount,
            "description": c.description,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "days_pending": c.days_pending,
            "documents": docs
        })
    return results
