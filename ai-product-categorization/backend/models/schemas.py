from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class CategorizeRequest(BaseModel):
    title: str = Field(..., max_length=150, description="Product Title")
    description: str = Field(..., min_length=20, max_length=1000, description="Product Description")
    language: Optional[str] = Field("en", description="en | hi")

class CategorizeResponse(BaseModel):
    status: str
    category: str
    category_path: List[str]
    attributes: Dict[str, str]
    confidence: float
    processing_time_ms: int

class ErrorResponse(BaseModel):
    status: str
    message: str
    code: str
