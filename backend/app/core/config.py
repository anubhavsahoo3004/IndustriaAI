import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "IndustriaAI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    
    # Security & Auth (MUST be overridden via SECRET_KEY in .env for production deployments)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "industriaai_dev_fallback_secret_key_sih2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Server & CORS
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Database
    DATABASE_URL: str = "sqlite:///./industriaai.db"
    
    # Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    MAX_FILE_SIZE_MB: int = 15
    
    # AI - Gemini API
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Domain settings
    DEMO_MODE: bool = True
    MAHARASHTRA_FOCUS: bool = True
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads folder exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
