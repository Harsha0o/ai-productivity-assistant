"""
SQLAlchemy Database Models
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum
from app.database import Base
import enum


class Priority(str, enum.Enum):
    """Task priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Category(str, enum.Enum):
    """Task categories"""
    WORK = "work"
    PERSONAL = "personal"
    HEALTH = "health"
    FINANCE = "finance"
    LEARNING = "learning"
    ERRANDS = "errands"
    OTHER = "other"


class Task(Base):
    """Task model representing a todo item"""
    
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    
    # AI-enhanced fields
    priority = Column(String(20), default=Priority.MEDIUM.value, nullable=False)
    category = Column(String(20), default=Category.OTHER.value, nullable=False)
    due_date = Column(DateTime, nullable=True)
    ai_generated = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', priority={self.priority}, completed={self.completed})>"
