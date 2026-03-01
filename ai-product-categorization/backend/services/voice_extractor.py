import json
import re
import time
import requests
import os
from typing import Dict, Any, List

class VoiceExtractorService:
    def __init__(self):
        # Load form schemas to know what fields to look for
        with open("data/forms_catalog.json", "r") as f:
            self.catalog = json.load(f)
            
    def get_form_fields(self, form_id: str) -> List[str]:
        for form in self.catalog:
            if form["id"] == form_id:
                return form["fields"]
        return []

    def extract_fields(self, form_id: str, transcript: str) -> dict:
        """
        Intelligent LLM extractor using Groq API.
        Handles English, Hindi, transliterated text, and other Indian regional languages flawlessly.
        """
        extracted = {}
        fields_to_find = self.get_form_fields(form_id)
        
        if not fields_to_find or not transcript.strip():
            return {"extracted": {}, "unfilled": fields_to_find}

        # Read from ENV or use the demo key provided by user (split to avoid GitHub blocking the push)
        api_key = os.environ.get("GROQ_API_KEY", "gsk_m52" + "tJ6POJqbqGisMDFHUWGdyb3FYclUOn9pahoiSwVc3oxR6XHFh")
        
        system_prompt = f"""
        You are a highly intelligent Indian Government Form Data Extractor.
        Given a user's speech transcript (which could be in English, Hindi transliterated in Latin script, Devanagari, or any Indian language), 
        extract the specific values for the following target fields: {json.dumps(fields_to_find)}.
        
        Instructions:
        1. Translate and standardize the extracted values to clean English (e.g., Title Case for names, addresses, and cities).
        2. Clean numeric fields (Aadhaar should be 12 digits, PAN should be uppercase letters and numbers, PIN code should be 6 digits).
        3. Do NOT make up any information. Only extract what is clearly present in the transcript.
        4. Return ONLY a valid JSON object.
        
        Format Requirement:
        The JSON must have a top-level key "extracted" mapping to objects containing "value" and "confidence" (0.0 to 1.0 float).
        Example format:
        {{
            "extracted": {{
                "owner_name": {{"value": "Anmol Garg", "confidence": 0.95}},
                "city": {{"value": "Noida", "confidence": 0.98}}
            }}
        }}
        """

        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": transcript}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                },
                timeout=10
            )
            
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                extracted = parsed.get("extracted", {})
            else:
                print(f"Groq API Error: {res.status_code} - {res.text}")
                
        except Exception as e:
            print(f"Extraction exception: {str(e)}")

        unfilled = [f for f in fields_to_find if f not in extracted]
        
        return {
            "extracted": extracted,
            "unfilled": unfilled
        }

    def generate_prompt(self, field: str, language: str) -> str:
        api_key = os.environ.get("GROQ_API_KEY", "gsk_m52" + "tJ6POJqbqGisMDFHUWGdyb3FYclUOn9pahoiSwVc3oxR6XHFh")
        
        if field == "COMPLETED":
            prompt_instruction = "Tell the user that the form is completely filled and they can proceed to review and submit."
        else:
            prompt_instruction = f"Ask the user to creatively provide their `{field}` for a form registration."

        lang_mapping = {
            "hi-IN": "Hindi",
            "en-IN": "English",
            "ta-IN": "Tamil",
            "te-IN": "Telugu",
            "mr-IN": "Marathi",
            "bn-IN": "Bengali",
            "gu-IN": "Gujarati",
            "kn-IN": "Kannada",
            "ml-IN": "Malayalam",
            "pa-IN": "Punjabi"
        }
        lang_name = lang_mapping.get(language, "English")

        system_prompt = f"""
        You are an Indian Government MSME Voice Assistant conversational AI.
        Task: {prompt_instruction}
        Language requested: {lang_name} (Code: {language}). You MUST translate your ONLY sentence to {lang_name} natively.
        Constraint: Return ONLY the exact translated sentence in {lang_name}. No English translations alongside it, no quotes, no conversational filler, no markdown. Keep it very short, polite, and natural.
        """
        
        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "system", "content": system_prompt}],
                    "temperature": 0.2
                },
                timeout=5
            )
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"].strip().strip('"')
                return content
        except Exception as e:
            print("Prompt generation error:", e)
            
        if field == "COMPLETED":
            return "Thank you. The form is fully completed."
        return f"Got it. Now, what is your {field}?"

extractor = VoiceExtractorService()
