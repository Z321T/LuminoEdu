from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.exercise import ExerciseType

class ExerciseGenerateRequest(BaseModel):
    """习题生成请求模型"""
    content: str = Field(..., description="习题生成的原始内容材料，用于提取知识点生成习题")
    title: str = Field(default="未命名习题集", description="习题集标题")
    count: int = Field(default=5, description="需要生成的习题数量")
    types: Optional[List[ExerciseType]] = Field(default=None, description="习题类型列表")

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