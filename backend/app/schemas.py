"""
Pydantic Schemas for Request/Response Validation
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class Priority(str, Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Category(str, Enum):
    """Task categories"""
    WORK = "work"
    PERSONAL = "personal"
    HEALTH = "health"
    FINANCE = "finance"
    LEARNING = "learning"
    ERRANDS = "errands"
    OTHER = "other"


class TaskBase(BaseModel):
    """Base schema with common task fields"""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, description="Task description")


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    """Schema for updating an existing task (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Priority] = None
    category: Optional[Category] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    """Schema for task response (includes all fields)"""
    id: int
    completed: bool
    priority: str
    category: str
    due_date: Optional[datetime] = None
    ai_generated: bool = False
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TaskListResponse(BaseModel):
    """Schema for list of tasks response"""
    tasks: List[TaskResponse]
    total: int


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    
    
class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    database: str


# AI-related schemas
class AIParseRequest(BaseModel):
    """Request to parse natural language into a task"""
    text: str = Field(..., min_length=1, description="Natural language task description")


class AIParseResponse(BaseModel):
    """Response from AI parsing"""
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.MEDIUM
    category: Category = Category.OTHER
    due_date: Optional[str] = None
    confidence: float = Field(..., ge=0, le=1, description="AI confidence score")


class AIPrioritizeRequest(BaseModel):
    """Request to prioritize tasks"""
    task_ids: List[int] = Field(..., description="List of task IDs to prioritize")


class AIPrioritizeResponse(BaseModel):
    """Response with prioritized tasks"""
    prioritized_tasks: List[dict]
    reasoning: str


class AIInsightsResponse(BaseModel):
    """Response with productivity insights"""
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    tasks_by_category: dict
    tasks_by_priority: dict
    ai_summary: str
    ai_tips: List[str]
