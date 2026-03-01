from fastapi import APIRouter, HTTPException
from models.schemas import CategorizeRequest, CategorizeResponse
from services.classifier import classifier_service

router = APIRouter(
    prefix="/api/v1",
    tags=["categorize"]
)

@router.post("/categorize", response_model=CategorizeResponse)
async def categorize_product(request: CategorizeRequest):
    try:
        if len(request.description) < 20:
            raise HTTPException(status_code=422, detail="Description must be at least 20 characters.")
            
        result = classifier_service.predict(
            title=request.title,
            description=request.description,
            language=request.language
        )
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
