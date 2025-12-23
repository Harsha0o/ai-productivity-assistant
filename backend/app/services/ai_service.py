"""
AI Service using Google Gemini API
"""
import json
import re
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

import google.generativeai as genai

from app.config import settings
from app.schemas import Priority, Category

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered task features using Google Gemini"""
    
    def __init__(self):
        self.model = None
        self._initialize()
    
    def _initialize(self):
        """Initialize the Gemini model"""
        if settings.gemini_api_key:
            try:
                genai.configure(api_key=settings.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Gemini AI model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.model = None
        else:
            logger.warning("No Gemini API key configured")
    
    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.model is not None
    
    async def parse_natural_language(self, text: str) -> Dict[str, Any]:
        """
        Parse natural language into structured task data
        
        Example: "Remind me to call John tomorrow at 3pm" ->
        {
            "title": "Call John",
            "description": "Phone call reminder",
            "priority": "medium",
            "category": "personal",
            "due_date": "2024-01-02T15:00:00",
            "confidence": 0.95
        }
        """
        if not self.is_available():
            return self._fallback_parse(text)
        
        prompt = f"""Parse this natural language task description into structured JSON.

Input: "{text}"

Extract:
1. title: A clear, concise task title (max 50 chars)
2. description: Additional details (optional, can be null)
3. priority: One of [low, medium, high, urgent] based on urgency words
4. category: One of [work, personal, health, finance, learning, errands, other]
5. due_date: ISO format datetime if mentioned (relative to today: {datetime.now().strftime('%Y-%m-%d')}), or null
6. confidence: Your confidence score 0.0-1.0

Respond ONLY with valid JSON, no other text:
{{"title": "...", "description": "...", "priority": "...", "category": "...", "due_date": "...", "confidence": 0.0}}"""

        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json(response.text)
            
            # Validate and normalize
            return self._validate_parsed_task(result)
            
        except Exception as e:
            logger.error(f"AI parsing failed: {e}")
            return self._fallback_parse(text)
    
    async def prioritize_tasks(self, tasks: List[Dict]) -> Dict[str, Any]:
        """
        AI-powered task prioritization
        """
        if not self.is_available() or not tasks:
            return {"prioritized_tasks": tasks, "reasoning": "AI unavailable - using default order"}
        
        tasks_text = "\n".join([
            f"- ID {t['id']}: {t['title']} (due: {t.get('due_date', 'none')}, category: {t.get('category', 'other')})"
            for t in tasks
        ])
        
        prompt = f"""Prioritize these tasks and explain why:

{tasks_text}

Consider:
1. Due dates (urgent first)
2. Category importance
3. Task complexity

Respond with JSON:
{{"order": [id1, id2, ...], "reasoning": "brief explanation"}}"""

        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json(response.text)
            
            # Reorder tasks based on AI suggestion
            order = result.get("order", [t["id"] for t in tasks])
            task_map = {t["id"]: t for t in tasks}
            prioritized = [task_map[tid] for tid in order if tid in task_map]
            
            return {
                "prioritized_tasks": prioritized,
                "reasoning": result.get("reasoning", "Prioritized by AI")
            }
            
        except Exception as e:
            logger.error(f"AI prioritization failed: {e}")
            return {"prioritized_tasks": tasks, "reasoning": f"Error: {str(e)}"}
    
    async def categorize_task(self, title: str, description: str = "") -> str:
        """Auto-categorize a task"""
        if not self.is_available():
            return Category.OTHER.value
        
        prompt = f"""Categorize this task into one of: work, personal, health, finance, learning, errands, other

Task: {title}
{f'Description: {description}' if description else ''}

Respond with just the category word, nothing else."""

        try:
            response = self.model.generate_content(prompt)
            category = response.text.strip().lower()
            
            # Validate category
            valid_categories = [c.value for c in Category]
            if category in valid_categories:
                return category
            return Category.OTHER.value
            
        except Exception as e:
            logger.error(f"AI categorization failed: {e}")
            return Category.OTHER.value
    
    async def generate_insights(self, tasks: List[Dict], stats: Dict) -> Dict[str, Any]:
        """Generate AI-powered productivity insights"""
        if not self.is_available():
            return self._fallback_insights(stats)
        
        # Prepare context
        tasks_summary = f"""
Total tasks: {stats['total']}
Completed: {stats['completed']}
Completion rate: {stats['completion_rate']:.1%}
By category: {stats['by_category']}
By priority: {stats['by_priority']}

Recent tasks: {[t['title'] for t in tasks[:5]]}
"""
        
        prompt = f"""You are a productivity coach. Based on this task data, provide:

{tasks_summary}

1. A brief summary (2-3 sentences)
2. 3 specific tips to improve productivity

Respond with JSON:
{{"summary": "...", "tips": ["tip1", "tip2", "tip3"]}}"""

        try:
            response = self.model.generate_content(prompt)
            result = self._extract_json(response.text)
            
            return {
                "ai_summary": result.get("summary", "Keep up the good work!"),
                "ai_tips": result.get("tips", ["Stay focused", "Prioritize important tasks", "Take breaks"])
            }
            
        except Exception as e:
            logger.error(f"AI insights failed: {e}")
            return self._fallback_insights(stats)
    
    def _extract_json(self, text: str) -> Dict:
        """Extract JSON from AI response"""
        # Try to find JSON in the response
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```"):
            text = re.sub(r'^```\w*\n?', '', text)
            text = re.sub(r'\n?```$', '', text)
        
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to find JSON object in text
            match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    pass
            return {}
    
    def _validate_parsed_task(self, data: Dict) -> Dict[str, Any]:
        """Validate and normalize parsed task data"""
        valid_priorities = [p.value for p in Priority]
        valid_categories = [c.value for c in Category]
        
        return {
            "title": data.get("title", "New Task")[:255],
            "description": data.get("description"),
            "priority": data.get("priority", "medium") if data.get("priority") in valid_priorities else "medium",
            "category": data.get("category", "other") if data.get("category") in valid_categories else "other",
            "due_date": data.get("due_date"),
            "confidence": min(max(float(data.get("confidence", 0.5)), 0), 1)
        }
    
    def _fallback_parse(self, text: str) -> Dict[str, Any]:
        """Fallback parsing when AI is unavailable"""
        return {
            "title": text[:100],
            "description": None,
            "priority": Priority.MEDIUM.value,
            "category": Category.OTHER.value,
            "due_date": None,
            "confidence": 0.5
        }
    
    def _fallback_insights(self, stats: Dict) -> Dict[str, Any]:
        """Fallback insights when AI is unavailable"""
        tips = []
        if stats.get("completion_rate", 0) < 0.5:
            tips.append("Try breaking large tasks into smaller ones")
        if stats.get("by_priority", {}).get("urgent", 0) > 3:
            tips.append("You have many urgent tasks - consider reviewing priorities")
        tips.append("Consistent daily progress leads to success")
        
        return {
            "ai_summary": f"You have {stats.get('total', 0)} tasks with a {stats.get('completion_rate', 0):.0%} completion rate.",
            "ai_tips": tips[:3]
        }


# Singleton instance
ai_service = AIService()
