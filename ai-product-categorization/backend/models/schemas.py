from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ProcessVoiceRequest(BaseModel):
    form_id: str
    transcript: str
    language: str = "en"
    expected_field: Optional[str] = None

class FieldExtraction(BaseModel):
    value: Any
    confidence: float

class ProcessVoiceResponse(BaseModel):
    status: str
    form_id: str
    extracted_fields: Dict[str, FieldExtraction]
    unfilled_fields: List[str]
    processing_time_ms: int

class SubmitFormRequest(BaseModel):
    form_id: str
    fields: Dict[str, Any]

class CategorizeRequest(BaseModel):
    description: str

class CategorizeResponse(BaseModel):
    status: str
    path: List[str]
    material: str
    category: str
    gender: str
    confidence: int
    tags: List[str]
    processing_time_ms: int

class GeneratePromptRequest(BaseModel):
    field: str
    language: str

class GeneratePromptResponse(BaseModel):
    prompt: str

class SpeakRequest(BaseModel):
    text: str
    language: str
