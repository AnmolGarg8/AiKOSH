from fastapi import APIRouter, Depends
from models.schemas import CategorizeRequest, CategorizeResponse
from services.classifier import classifier_service
from routers.auth import get_current_user

router = APIRouter(
    prefix="/api/v1/categorize",
    tags=["categorize"]
)

@router.post("/predict", response_model=CategorizeResponse)
def predict_category(req: CategorizeRequest, current_user=Depends(get_current_user)):
    return classifier_service.predict(req.description)
