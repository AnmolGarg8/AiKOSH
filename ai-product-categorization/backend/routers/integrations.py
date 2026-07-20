from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db import get_db
from models.audit import log_audit
from routers.auth import get_current_user
import json
import os

router = APIRouter(prefix="/api/v1/integrations", tags=["integrations"])

class GovSyncPayload(BaseModel):
    system_source: str # Udyam, AyushMIS, ONDC
    sync_type: str # push, pull
    record_count: int
    data: dict

@router.post("/gov-system-sync")
@router.post("/gov-system-sync")
def sync_gov_system(
    payload: GovSyncPayload,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Log the payload details
    print(f"Integration Webhook triggered by source system: {payload.system_source}")
    print(f"Sync Type: {payload.sync_type} | Records Syncing: {payload.record_count}")
    
    # Store payload locally in a integration log file
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    log_dir = os.path.join(base_dir, "integrations")
    os.makedirs(log_dir, exist_ok=True)
    
    log_path = os.path.join(log_dir, "sync_log.jsonl")
    log_entry = {
        "source": payload.system_source,
        "type": payload.sync_type,
        "count": payload.record_count,
        "payload_snippet": str(payload.data)[:200],
        "user_initiator": current_user.email
    }
    
    try:
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Failed to log sync entry to file: {e}")
        
    # Write to database audit log
    log_audit(
        db=db,
        email=current_user.email,
        action=f"GOV_SYNC_{payload.system_source.upper()}",
        record_info=f"Sync Type: {payload.sync_type}, Count: {payload.record_count}"
    )
    
    return {
        "status": "success",
        "message": f"Successfully received sync data from {payload.system_source}",
        "records_processed": payload.record_count
    }
