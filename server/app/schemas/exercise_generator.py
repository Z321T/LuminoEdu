from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.course_exercise import ExerciseType

class ExerciseGenerateRequest(BaseModel):
    """习题生成请求模型"""
    content: str
    title: str = "未命名习题集"
    count: int = 5
    types: Optional[List[ExerciseType]] = None

class ExerciseData(BaseModel):
    """习题数据模型"""
    title: str
    content: str
    type: int
    options: Optional[List[str]] = None
    answer: str
    explanation: Optional[str] = None
    order: int = 0
    score: float = 10.0

class AssignmentCreateRequest(BaseModel):
    """习题集创建请求模型"""
    title: str
    description: str = ""
    course_id: int
    teacher_id: int
    exercises_data: List[ExerciseData]
    total_score: float = 100.0
    start_time: Optional[datetime] = None
    due_time: Optional[datetime] = None
    is_published: bool = False