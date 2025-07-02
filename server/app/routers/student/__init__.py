from fastapi import APIRouter
from app.routers.student import course_notification

# 学生端专用路由
student_router = APIRouter()

# 学生端课程通知路由
student_router.include_router(
    course_notification.router,
    prefix="/course_notification",
)

# 导出路由供主路由使用
router = student_router