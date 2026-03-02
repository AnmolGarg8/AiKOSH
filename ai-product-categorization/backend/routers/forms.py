from fastapi import APIRouter
import json

router = APIRouter(
    prefix="/api/v1/forms",
    tags=["forms"]
)
import os

@router.get("")
def get_forms():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    forms_path = os.path.join(base_dir, "data", "forms_catalog.json")
    with open(forms_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)
    return catalog

@router.post("/submit")
def submit_form(payload: dict):
    # Mock submission logic
    return {"status": "success", "message": "Form submitted successfully", "form_id": payload.get("form_id")}
