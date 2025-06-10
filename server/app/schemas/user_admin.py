from typing import List, Optional
from pydantic import BaseModel, Field


# 学生基本信息（列表显示）
class StudentBasicInfo(BaseModel):
    id: int
    username: str
    student_id: str
    college: str

# 学生列表响应
class StudentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    students: List[StudentBasicInfo]

# 学生详细信息
class StudentDetailResponse(StudentBasicInfo):
    created_at: str
    major: Optional[str] = None
    grade: Optional[str] = None
    enrollment_year: Optional[int] = None
    intro: Optional[str] = None
    contact_email: Optional[str] = None

# 学生信息更新字段
class StudentUpdateFields(BaseModel):
    username: Optional[str] = None
    student_id: Optional[str] = None
    college: Optional[str] = None
    major: Optional[str] = None
    grade: Optional[str] = None
    enrollment_year: Optional[int] = None
    intro: Optional[str] = None
    contact_email: Optional[str] = None

# 用户操作响应
class UserUpdateResponse(BaseModel):
    status: str
    message: str
    user_id: str

# 密码重置请求
class UserPasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=6, description="新密码")