from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.teacher.course import CourseCreateRequest, CourseCreateResponse
from app.services.teacher.course_management import create_course
from app.core.dependencies import auth_teacher_user
from app.models.teacher import Teacher

router = APIRouter(tags=["教师端-课程管理"])


@router.post("/create", response_model=CourseCreateResponse)
async def create_course_api(
    data: CourseCreateRequest,
    current_user: Teacher = Depends(auth_teacher_user)
):
    try:
        course = await create_course(current_user.id, data)
        return CourseCreateResponse(id=course.id, name=course.name, description=course.description)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))