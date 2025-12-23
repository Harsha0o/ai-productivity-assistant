"""
Task CRUD Endpoints
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import Task
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    MessageResponse
)

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=TaskListResponse)
def get_tasks(
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of tasks to return"),
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    db: Session = Depends(get_db)
):
    """
    Get all tasks with optional filtering and pagination.
    
    - **skip**: Number of tasks to skip (for pagination)
    - **limit**: Maximum number of tasks to return (max 100)
    - **completed**: Filter by completion status (true/false)
    """
    logger.info(f"Getting tasks with skip={skip}, limit={limit}, completed={completed}")
    
    query = db.query(Task)
    
    # Apply completion filter if provided
    if completed is not None:
        query = query.filter(Task.completed == completed)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    tasks = query.order_by(desc(Task.created_at)).offset(skip).limit(limit).all()
    
    logger.info(f"Retrieved {len(tasks)} tasks out of {total} total")
    return TaskListResponse(tasks=tasks, total=total)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task.
    
    - **title**: Task title (required, 1-255 characters)
    - **description**: Task description (optional)
    - **priority**: Task priority (low, medium, high, urgent)
    - **category**: Task category (work, personal, health, finance, learning, errands, other)
    - **due_date**: Due date (optional)
    """
    logger.info(f"Creating new task: {task_data.title}")
    
    # Create new task instance
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority.value,
        category=task_data.category.value,
        due_date=task_data.due_date,
        completed=False
    )
    
    # Add to database
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    logger.info(f"Created task with id={db_task.id}")
    return db_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """
    Get a specific task by ID.
    
    - **task_id**: The unique identifier of the task
    """
    logger.info(f"Getting task with id={task_id}")
    
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        logger.warning(f"Task with id={task_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update an existing task.
    
    - **task_id**: The unique identifier of the task
    - **title**: New title (optional)
    - **description**: New description (optional)
    - **completed**: New completion status (optional)
    """
    logger.info(f"Updating task with id={task_id}")
    
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        logger.warning(f"Task with id={task_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    
    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    logger.info(f"Updated task with id={task_id}")
    return task


@router.delete("/{task_id}", response_model=MessageResponse)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    Delete a task by ID.
    
    - **task_id**: The unique identifier of the task to delete
    """
    logger.info(f"Deleting task with id={task_id}")
    
    task = db.query(Task).filter(Task.id == task_id).first()
    
    if not task:
        logger.warning(f"Task with id={task_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    
    db.delete(task)
    db.commit()
    
    logger.info(f"Deleted task with id={task_id}")
    return MessageResponse(message=f"Task {task_id} deleted successfully")
