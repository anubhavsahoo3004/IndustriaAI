import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.router import api_router
from backend.app.models import * # Ensure all models are registered with Base

# Create tables if not existing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IndustriaAI API",
    description="Intelligent Industrial Approval & Compliance Navigator - Smart India Hackathon (SIH26130)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS (Scoped to local frontend environments)
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
def health():
    return {"status": "healthy", "database": "connected"}
