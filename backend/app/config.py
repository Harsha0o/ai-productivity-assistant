"""
Application Configuration
"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Database - SQLite by default for local dev (no installation needed!)
    # For production, use: postgresql://user:pass@host:5432/db
    database_url: str = "sqlite:///./taskmanager.db"
    
    # CORS
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Application
    app_name: str = "Task Manager API"
    debug: bool = True
    
    # AI - Gemini API
    gemini_api_key: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
