import os
import json
from typing import Optional, Dict, Any
from backend.app.core.config import settings

class GeminiClient:
    """
    Backend-only Gemini API integration.
    Handles structured LLM generation, safety fallback, and prompt formatting.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.model_name = settings.GEMINI_MODEL
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiClient Init Warning] {e}")

    @property
    def is_available(self) -> bool:
        return self._client is not None and bool(self.api_key)

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.is_available:
            return ""

        try:
            from google.genai import types
            config = types.GenerateContentConfig()
            if system_instruction:
                config.system_instruction = system_instruction
            
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response.text or ""
        except Exception as e:
            print(f"[Gemini API Call Error] {e}")
            return ""

    async def generate_structured_json(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if not self.is_available:
            return None

        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                response_mime_type="application/json"
            )
            if system_instruction:
                config.system_instruction = system_instruction

            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            raw = response.text or "{}"
            return json.loads(raw)
        except Exception as e:
            print(f"[Gemini JSON Call Error] {e}")
            return None

gemini_client = GeminiClient()
