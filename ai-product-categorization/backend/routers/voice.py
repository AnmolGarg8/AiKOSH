from fastapi import APIRouter
import time
from fastapi.responses import StreamingResponse
from models.schemas import ProcessVoiceRequest, ProcessVoiceResponse, FieldExtraction, GeneratePromptRequest, GeneratePromptResponse, SpeakRequest
from services.voice_extractor import extractor
import edge_tts
from gtts import gTTS
import io

router = APIRouter(
    prefix="/api/v1/voice",
    tags=["voice"]
)

@router.post("/process", response_model=ProcessVoiceResponse)
def process_voice(req: ProcessVoiceRequest):
    start_time = time.time()
    
    # Process transcript
    result = extractor.extract_fields(req.form_id, req.transcript, getattr(req, "expected_field", None))
    
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

VOICE_MAP = {
    "hi-IN": "hi-IN-SwaraNeural",
    "en-IN": "en-IN-NeerjaNeural",
    "ta-IN": "ta-IN-PallaviNeural",
    "te-IN": "te-IN-ShrutiNeural",
    "mr-IN": "mr-IN-AarohiNeural",
    "bn-IN": "bn-IN-TanishaaNeural",
    "gu-IN": "gu-IN-DhwaniNeural",
    "kn-IN": "kn-IN-SapnaNeural",
    "ml-IN": "ml-IN-SobhanaNeural",
    "pa-IN": "pa-IN-OjasNeural", # pa-IN does not have many, fallback on standard
}

@router.get("/speak")
async def speak_text(text: str, language: str):
    # Route problematic accents (Marathi, Gujarati, Punjabi) to Google's highly natural API
    google_fallback = ["mr-IN", "gu-IN", "pa-IN"]
    
    if language in google_fallback:
        # Map to 2-letter language code for Google Translate (e.g., 'mr-IN' -> 'mr')
        lang = language.split("-")[0]
        
        import asyncio
        def create_audio():
            tts = gTTS(text=text, lang=lang, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read()
            
        audio_data = await asyncio.to_thread(create_audio)
        
        async def generate_google_audio():
            yield audio_data
            
        return StreamingResponse(generate_google_audio(), media_type="audio/mpeg")

    voice = VOICE_MAP.get(language, "en-IN-NeerjaNeural")

    communicate = edge_tts.Communicate(text, voice, rate="-5%")
    
    async def generate_edge_audio():
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]
                
    return StreamingResponse(generate_edge_audio(), media_type="audio/mpeg")
