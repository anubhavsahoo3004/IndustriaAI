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
    CORS_ORIGINS: Optional[str] = None
    
    # Database
    DATABASE_URL: str = "sqlite:///./industriaai.db"
    
    # Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"))
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

def get_cors_origins() -> list[str]:
    """
    Computes allowed CORS origins based on environment settings.
    In production: strictly allows configured CORS_ORIGINS and FRONTEND_URL.
    In development: also allows standard local Vite/React development ports.
    Never uses wildcard '*' with credentials.
    """
    origins: set[str] = set()

    # 1. Add explicitly configured CORS_ORIGINS (comma-separated string)
    if settings.CORS_ORIGINS:
        for item in settings.CORS_ORIGINS.split(","):
            cleaned = item.strip().rstrip("/")
            if cleaned:
                origins.add(cleaned)

    # 2. Add FRONTEND_URL if provided
    if settings.FRONTEND_URL:
        cleaned = settings.FRONTEND_URL.strip().rstrip("/")
        if cleaned:
            origins.add(cleaned)

    # 3. In development or demo mode, ensure local ports are accessible
    if settings.APP_ENV != "production" or not origins:
        origins.update([
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ])

    return sorted(list(origins))

def validate_production_config():
    """
    Validates that essential production environment variables are configured
    when APP_ENV="production". Fails fast with clear instructions without
    exposing secret values.
    """
    if settings.APP_ENV != "production":
        return

    missing_or_invalid = []

    # 1. DATABASE_URL must not be SQLite in production
    db_url = settings.DATABASE_URL.lower()
    if not db_url or "sqlite" in db_url:
        missing_or_invalid.append("DATABASE_URL (must be a PostgreSQL connection string, not SQLite)")

    # 2. SECRET_KEY must be overridden and meet minimum complexity
    dev_fallback = "industriaai_dev_fallback_secret_key_sih2026_change_in_production"
    if not settings.SECRET_KEY or settings.SECRET_KEY == dev_fallback or len(settings.SECRET_KEY) < 32:
        missing_or_invalid.append("SECRET_KEY (must be a cryptographically secure key of at least 32 characters)")

    # 3. CORS_ORIGINS or FRONTEND_URL must be specified
    if not settings.CORS_ORIGINS and (not settings.FRONTEND_URL or "localhost" in settings.FRONTEND_URL or "127.0.0.1" in settings.FRONTEND_URL):
        missing_or_invalid.append("CORS_ORIGINS (must specify deployed frontend URL, e.g. https://industriaai-app.onrender.com)")

    # 4. GEMINI_API_KEY
    if not settings.GEMINI_API_KEY:
        missing_or_invalid.append("GEMINI_API_KEY (Google Gemini API key required for full AI functionality)")

    if missing_or_invalid:
        error_msg = (
            "\n" + "=" * 70 + "\n"
            "CRITICAL CONFIGURATION ERROR (PRODUCTION MODE):\n"
            "The following required production settings are missing or invalid:\n"
            + "\n".join(f"  • {item}" for item in missing_or_invalid)
            + "\n\nPlease configure these environment variables in your Render Web Service dashboard."
            "\n" + "=" * 70
        )
        raise RuntimeError(error_msg)
