from fastapi import APIRouter, UploadFile, File

from app.schemas.user_create import BatchUserCreateResponse
from app.services.admin.user_service import create_students as create_students_service
from app.services.admin.user_service import create_teachers as create_teachers_service

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