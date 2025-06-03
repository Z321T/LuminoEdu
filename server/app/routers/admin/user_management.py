from typing import Optional

from fastapi import APIRouter, UploadFile, File, Query

from app.schemas.user_admin import (
    StudentListResponse, StudentDetailResponse, StudentUpdateFields,
    UserUpdateResponse, UserPasswordResetRequest
)
from app.schemas.user_create import BatchUserCreateResponse
from app.services.admin.user_service import (
    create_students as create_students_service,
    create_teachers as create_teachers_service,
    get_all_students, get_student_detail, reset_student_password, update_student_info
)

router = APIRouter(tags=["管理员端-用户管理"])

@router.post("/create_students", response_model=BatchUserCreateResponse)
async def create_students(
    file: UploadFile = File(..., description="上传包含学生信息的Excel文件"),
):
    """
    通过Excel表格批量创建学生用户
    """
    return await create_students_service(file)



@router.post("/create_teachers", response_model=BatchUserCreateResponse)
async def create_teachers(
    file: UploadFile = File(..., description="上传包含教师信息的Excel文件"),
):
    """
    通过Excel表格批量创建教师用户
    """
    return await create_teachers_service(file)



@router.get("/list_students", response_model=StudentListResponse)
async def list_students(
    page: int = Query(1, description="页码"),
    page_size: int = Query(20, description="每页记录数"),
    search: Optional[str] = Query(None, description="搜索关键词")
):
    """获取学生列表，支持分页和搜索"""
    return await get_all_students(page, page_size, search)



@router.get("/student_detail/{student_id}", response_model=StudentDetailResponse)
async def get_student(student_id: str):
    """获取单个学生的详细信息"""
    return await get_student_detail(student_id)



@router.put("/update_student/{student_id}", response_model=UserUpdateResponse)
async def update_student(student_id: str, student_data: StudentUpdateFields):
    """
    更新学生信息
    """
    return await update_student_info(student_id, student_data.model_dump(exclude_unset=True))



@router.post("/reset_password/{student_id}", response_model=UserUpdateResponse)
async def reset_password(student_id: str, password_data: UserPasswordResetRequest):
    """重置学生密码"""
    return await reset_student_password(student_id, password_data)
