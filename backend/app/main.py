import os
import logging
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from backend.app.core.config import settings, get_cors_origins, validate_production_config
from backend.app.core.database import engine, Base, get_db
from backend.app.api.router import api_router
from backend.app.models import * # Ensure all models are registered with Base

# Set up server-side logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("industriaai")

# Validate production configuration if running in production mode
validate_production_config()

# Create tables if not existing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IndustriaAI API",
    description="Intelligent Industrial Approval & Compliance Navigator - Smart India Hackathon (SIH26130)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS dynamically based on environment
allowed_origins = get_cors_origins()
logger.info(f"Configuring CORS with allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global unhandled exception handler to prevent leaking internals in production
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
    if settings.DEBUG and settings.APP_ENV != "production":
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(exc)}"}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact system support."}
    )

# Register API Router
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "IndustriaAI",
        "tagline": "Intelligent Industrial Approval & Compliance Navigator",
        "state_focus": "Maharashtra",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
def health(db: Session = Depends(get_db)):
    """
    Fast health & readiness endpoint.
    Verifies that the API process is alive and database connectivity is operational.
    Does NOT invoke Gemini to keep health checks fast and cost-free.
    """
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"}
        )
