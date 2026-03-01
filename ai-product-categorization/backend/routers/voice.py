from fastapi import APIRouter
import time
from models.schemas import ProcessVoiceRequest, ProcessVoiceResponse, FieldExtraction, GeneratePromptRequest, GeneratePromptResponse
from services.voice_extractor import extractor

router = APIRouter(
    prefix="/api/v1/voice",
    tags=["voice"]
)

@router.post("/process", response_model=ProcessVoiceResponse)
def process_voice(req: ProcessVoiceRequest):
    start_time = time.time()
    
    # Process transcript
    result = extractor.extract_fields(req.form_id, req.transcript)
    
    # Simulate network latency
    time.sleep(0.5)
    
    processing_time_ms = int((time.time() - start_time) * 1000)
    
    # Map to schema
    extracted_fields = {
        k: FieldExtraction(value=v["value"], confidence=v["confidence"])
        for k, v in result["extracted"].items()
    }
    
    return ProcessVoiceResponse(
        status="success",
        form_id=req.form_id,
        extracted_fields=extracted_fields,
        unfilled_fields=result["unfilled"],
        processing_time_ms=processing_time_ms
    )

@router.post("/prompt", response_model=GeneratePromptResponse)
def generate_prompt(req: GeneratePromptRequest):
    prompt = extractor.generate_prompt(req.field, req.language)
    return GeneratePromptResponse(prompt=prompt)
