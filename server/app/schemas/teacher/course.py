from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CourseCreateRequest(BaseModel):
    name: str = Field(..., max_length=100, description="课程名称")
    description: Optional[str] = Field(None, description="课程描述")
    semester: str = Field(..., max_length=20, description="学期")
    credit: float = Field(..., description="学分")
    start_date: Optional[date] = Field(None, description="开始日期，格式YYYY-MM-DD")
    end_date: Optional[date] = Field(None, description="结束日期，格式YYYY-MM-DD")

class CourseCreateResponse(BaseModel):
    id: int = Field(..., description="课程ID")
    name: str = Field(..., max_length=100, description="课程名称")
    description: Optional[str] = Field(None, description="课程描述")