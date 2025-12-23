"""
Task Manager API - Main Application Entry Point
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import tasks, ai
from app.schemas import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - runs on startup and shutdown"""
    # Startup
    logger.info("Starting Task Manager API...")
    
    # Create database tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Task Manager API...")


# Create FastAPI application
app = FastAPI(
    title="AI-Powered Task Manager",
    description="""
    AI-Powered Task Manager API - Smart task management with Google Gemini AI.
    
    ## Features
    
    * **AI Natural Language Parsing** - "Remind me to call John tomorrow" → Creates task
    * **Smart Prioritization** - AI suggests task priority
    * **Auto-Categorization** - AI categorizes tasks automatically
    * **Productivity Insights** - AI-generated tips and summaries
    * **CRUD Operations** - Create, Read, Update, Delete tasks
    
    ## AI Endpoints
    
    * `POST /ai/parse` - Parse natural language into task
    * `POST /ai/parse-and-create` - Parse and create in one step
    * `GET /ai/insights` - Get productivity insights
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
cors_origins = settings.cors_origins.strip()
if cors_origins == "*":
    # Allow all origins
    origins = ["*"]
else:
    origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if cors_origins != "*" else False,  # Can't use credentials with *
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)
app.include_router(ai.router)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API welcome message"""
    from app.services.ai_service import ai_service
    return {
        "message": "Welcome to AI-Powered Task Manager API",
        "docs": "/docs",
        "version": "2.0.0",
        "ai_enabled": ai_service.is_available()
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns the health status of the API and database connection.
    """
    db_status = "healthy"
    
    try:
        # Check database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    return HealthResponse(status="healthy", database=db_status)
