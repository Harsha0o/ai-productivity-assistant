"""
AI Router - Endpoints for AI-powered features
"""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Task
from app.schemas import (
    AIParseRequest, AIParseResponse, 
    AIPrioritizeRequest, AIPrioritizeResponse,
    AIInsightsResponse, TaskCreate, MessageResponse,
    Priority, Category
)
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI"])


@router.get("/status")
async def ai_status():
    """Check if AI service is available"""
    return {
        "available": ai_service.is_available(),
        "model": "gemini-1.5-flash" if ai_service.is_available() else None
    }


@router.post("/parse", response_model=AIParseResponse)
async def parse_natural_language(request: AIParseRequest):
    """
    Parse natural language into a structured task.
    
    Example inputs:
    - "Remind me to call John tomorrow at 3pm"
    - "Urgent: finish project report by Friday"
    - "Buy groceries this weekend"
    """
    result = await ai_service.parse_natural_language(request.text)
    
    return AIParseResponse(
        title=result["title"],
        description=result.get("description"),
        priority=Priority(result.get("priority", "medium")),
        category=Category(result.get("category", "other")),
        due_date=result.get("due_date"),
        confidence=result.get("confidence", 0.5)
    )


@router.post("/parse-and-create")
async def parse_and_create_task(
    request: AIParseRequest,
    db: Session = Depends(get_db)
):
    """
    Parse natural language and create a task in one step.
    """
    # Parse the input
    parsed = await ai_service.parse_natural_language(request.text)
    
    # Create the task
    from datetime import datetime
    
    due_date = None
    if parsed.get("due_date"):
        try:
            due_date = datetime.fromisoformat(parsed["due_date"].replace("Z", "+00:00"))
        except:
            pass
    
    task = Task(
        title=parsed["title"],
        description=parsed.get("description"),
        priority=parsed.get("priority", "medium"),
        category=parsed.get("category", "other"),
        due_date=due_date,
        ai_generated=True
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return {
        "message": "Task created successfully",
        "task": {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "category": task.category,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "ai_generated": task.ai_generated,
            "confidence": parsed.get("confidence", 0.5)
        }
    }


@router.post("/prioritize", response_model=AIPrioritizeResponse)
async def prioritize_tasks(
    request: AIPrioritizeRequest,
    db: Session = Depends(get_db)
):
    """
    Get AI-powered prioritization for a list of tasks.
    """
    # Fetch tasks
    tasks = db.query(Task).filter(
        Task.id.in_(request.task_ids),
        Task.completed == False
    ).all()
    
    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found")
    
    tasks_data = [
        {
            "id": t.id,
            "title": t.title,
            "priority": t.priority,
            "category": t.category,
            "due_date": t.due_date.isoformat() if t.due_date else None
        }
        for t in tasks
    ]
    
    result = await ai_service.prioritize_tasks(tasks_data)
    
    return AIPrioritizeResponse(
        prioritized_tasks=result["prioritized_tasks"],
        reasoning=result["reasoning"]
    )


@router.post("/categorize/{task_id}")
async def auto_categorize_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    """
    Auto-categorize a task using AI.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    category = await ai_service.categorize_task(task.title, task.description or "")
    
    # Update task
    task.category = category
    db.commit()
    db.refresh(task)
    
    return {
        "message": "Task categorized successfully",
        "task_id": task_id,
        "category": category
    }


@router.get("/insights", response_model=AIInsightsResponse)
async def get_productivity_insights(db: Session = Depends(get_db)):
    """
    Get AI-powered productivity insights.
    """
    # Calculate stats
    total = db.query(func.count(Task.id)).scalar()
    completed = db.query(func.count(Task.id)).filter(Task.completed == True).scalar()
    
    # Count by category
    category_counts = (
        db.query(Task.category, func.count(Task.id))
        .group_by(Task.category)
        .all()
    )
    by_category = {cat: count for cat, count in category_counts}
    
    # Count by priority  
    priority_counts = (
        db.query(Task.priority, func.count(Task.id))
        .group_by(Task.priority)
        .all()
    )
    by_priority = {pri: count for pri, count in priority_counts}
    
    # Get recent tasks
    recent_tasks = db.query(Task).order_by(Task.created_at.desc()).limit(10).all()
    tasks_data = [{"title": t.title, "completed": t.completed} for t in recent_tasks]
    
    stats = {
        "total": total,
        "completed": completed,
        "completion_rate": completed / total if total > 0 else 0,
        "by_category": by_category,
        "by_priority": by_priority
    }
    
    # Get AI insights
    ai_insights = await ai_service.generate_insights(tasks_data, stats)
    
    return AIInsightsResponse(
        total_tasks=total,
        completed_tasks=completed,
        completion_rate=stats["completion_rate"],
        tasks_by_category=by_category,
        tasks_by_priority=by_priority,
        ai_summary=ai_insights["ai_summary"],
        ai_tips=ai_insights["ai_tips"]
    )
